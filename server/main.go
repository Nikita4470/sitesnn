package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/joho/godotenv"
)

// Настройки лимитов (как в твоем JS коде)
const (
	maxBodyBytes = 64 * 1024 // 64 KB
	vkApiVersion = "5.199"
)

type LeadRequest struct {
	Name    string `json:"name"`
	Contact string `json:"contact"`
	Comment string `json:"comment"`
	Page    string `json:"page"`
}

// --- БЛОК ЗАЩИТЫ ОТ СПАМА (RATE LIMITER) ---
type ClientCache struct {
	sync.Mutex
	ips map[string]time.Time
}

var rateLimiter = ClientCache{ips: make(map[string]time.Time)}

func isSpamming(ip string) bool {
	rateLimiter.Lock()
	defer rateLimiter.Unlock()

	lastRequestTime, exists := rateLimiter.ips[ip]
	if exists && time.Since(lastRequestTime) < 1*time.Minute {
		return true
	}
	rateLimiter.ips[ip] = time.Now()
	return false
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// Аналог твоей функции sendJson
func sendJson(w http.ResponseWriter, statusCode int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(payload)
}

// Аналог твоей функции normalizeText
func normalizeText(value string, maxLength int) string {
	res := strings.ReplaceAll(value, "\r\n", "\n")
	res = strings.ReplaceAll(res, "\r", "\n")
	res = strings.TrimSpace(res)
	if len([]rune(res)) > maxLength {
		return string([]rune(res)[:maxLength])
	}
	return res
}

func main() {
	_ = godotenv.Load() // Игнорируем ошибку, если файла нет на сервере

	port := os.Getenv("PORT")
	if port == "" {
		port = "4173"
	}
	address := "0.0.0.0:" + port

	staticDir := os.Getenv("STATIC_DIR")
	if staticDir == "" {
		staticDir = "./dist"
	}
	// Переводим в абсолютный путь для безопасности
	absStaticDir, err := filepath.Abs(staticDir)
	if err != nil {
		fmt.Println("Критическая ошибка путей статики:", err)
		return
	}

	// Главный обработчик запросов (наш сервер)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// 1. МАРШРУТ API
		if r.URL.Path == "/api/lead" {
			if r.Method != http.MethodPost {
				w.Header().Set("Allow", "POST")
				sendJson(w, http.StatusMethodNotAllowed, map[string]interface{}{"ok": false, "error": "method_not_allowed"})
				return
			}
			handleLead(w, r)
			return
		}

		// 2. МАРШРУТЫ СТАТИКИ (Только GET и HEAD)
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			w.Header().Set("Allow", "GET, HEAD")
			w.WriteHeader(http.StatusMethodNotAllowed)
			w.Write([]byte("Method not allowed"))
			return
		}

		serveStaticFiles(w, r, absStaticDir)
	})

	fmt.Println("SITESNN Go-сервер запущен на http://" + address)
	if err := http.ListenAndServe(address, nil); err != nil {
		fmt.Println("Ошибка запуска сервера:", err)
	}
}

// --- ОБРАБОТЧИК ЗАЯВОК (АНАЛОГ sendLeadToVk) ---
func handleLead(w http.ResponseWriter, r *http.Request) {
	token := os.Getenv("VK_BOT_TOKEN")
	vkPeerId := os.Getenv("VK_PEER_ID")
	if vkPeerId == "" {
		vkPeerId = "2000000109"
	}

	if token == "" {
		fmt.Println("VK_BOT_TOKEN is not configured")
		sendJson(w, http.StatusServiceUnavailable, map[string]interface{}{"ok": false, "error": "service_not_configured"})
		return
	}

	// Защита по IP от спама
	ip := r.Header.Get("X-Forwarded-For")
	if ip == "" {
		ip = r.RemoteAddr
	}
	if isSpamming(ip) {
		sendJson(w, http.StatusTooManyRequests, map[string]interface{}{
			"ok":      false,
			"error":   "too_many_requests",
			"message": "Можно отправлять заявку не чаще раза в минуту",
		})
		return
	}

	// Ограничение на размер входящего body (аналог твоего maxBodyBytes)
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)

	var payload LeadRequest
	// Читаем и парсим JSON (в Go декодер вернет ошибку, если размер превышен или JSON кривой)
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		// Проверяем, не из-за размера ли ошибка (код 413)
		if err.Error() == "http: request body too large" {
			sendJson(w, http.StatusRequestEntityTooLarge, map[string]interface{}{"ok": false, "error": "request_too_large"})
			return
		}
		sendJson(w, http.StatusBadRequest, map[string]interface{}{"ok": false, "error": "invalid_json"})
		return
	}

	name := normalizeText(payload.Name, 120)
	contact := normalizeText(payload.Contact, 200)
	comment := normalizeText(payload.Comment, 2000)

	page := payload.Page
	if page == "" {
		page = r.Header.Get("Referer")
	}
	page = normalizeText(page, 500)

	if name == "" || contact == "" {
		sendJson(w, http.StatusUnprocessableEntity, map[string]interface{}{"ok": false, "error": "name_and_contact_required"})
		return
	}

	// Локальное время по Екатеринбургу
	loc, _ := time.LoadLocation("Asia/Yekaterinburg")
	submittedAt := time.Now().In(loc).Format("02.01.2006 15:04:05")

	// Собираем сообщение (через strings.Builder для производительности)
	var sb strings.Builder
	sb.WriteString("🔔 Новая заявка с сайта SITESNN\n\n")
	sb.WriteString(fmt.Sprintf("Имя: %s\n", name))
	sb.WriteString(fmt.Sprintf("Контакт: %s\n", contact))
	if comment == "" {
		sb.WriteString("Комментарий: —\n")
	} else {
		sb.WriteString(fmt.Sprintf("Комментарий: %s\n", comment))
	}
	if page == "" {
		sb.WriteString("Страница: не указана\n")
	} else {
		sb.WriteString(fmt.Sprintf("Страница: %s\n", page))
	}
	sb.WriteString(fmt.Sprintf("Время: %s", submittedAt))

	// Запрос к ВК API с таймаутом в 10 секунд (через http.Client)
	form := url.Values{}
	form.Set("access_token", token)
	form.Set("v", vkApiVersion)
	form.Set("peer_id", vkPeerId)
	form.Set("random_id", strconv.Itoa(rand.Intn(2147483647)+1))
	form.Set("message", sb.String())

	client := &http.Client{Timeout: 10 * time.Second}
	vkResp, err := client.PostForm("https://api.vk.com/method/messages.send", form)
	if err != nil {
		fmt.Println("VK delivery failed:", err)
		sendJson(w, http.StatusBadGateway, map[string]interface{}{"ok": false, "error": "vk_delivery_failed"})
		return
	}
	defer vkResp.Body.Close()

	// Читаем ответ от ВК, чтобы проверить внутреннюю ошибку vkResult.error
	var vkResult struct {
		Error interface{} `json:"error"`
	}
	_ = json.NewDecoder(vkResp.Body).Decode(&vkResult)

	if vkResp.StatusCode != http.StatusOK || vkResult.Error != nil {
		fmt.Println("VK API rejected the lead")
		sendJson(w, http.StatusBadGateway, map[string]interface{}{"ok": false, "error": "vk_delivery_failed"})
		return
	}

	sendJson(w, http.StatusOK, map[string]interface{}{"ok": true})
}

// --- РАЗДАЧА СТАТИКИ С ЛОГИКОЙ SPA (АНАЛОГ serveStatic) ---
func serveStaticFiles(w http.ResponseWriter, r *http.Request, distDir string) {
	// Очищаем путь от уязвимостей типа "/../"
	relPath := filepath.Clean(r.URL.Path)
	if relPath == "/" {
		relPath = "index.html"
	}

	// Собираем полный финальный путь к файлу
	filePath := filepath.Join(distDir, relPath)

	// Жесткая проверка безопасности: файл ОБЯЗАН быть внутри папки dist
	if !strings.HasPrefix(filePath, distDir) {
		w.WriteHeader(http.StatusForbidden)
		w.Write([]byte("Forbidden"))
		return
	}

	fileStat, err := os.Stat(filePath)

	// Логика SPA: Если файла нет или это директория
	if err != nil || fileStat.IsDir() {
		// Если запрашивали конкретный файл (например, картинку .png), но его нет — отдаем 404
		if filepath.Ext(relPath) != "" {
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte("Not found"))
			return
		}
		// Если это роут реакта (без расширения) — перенаправляем на index.html
		filePath = filepath.Join(distDir, "index.html")
		fileStat, err = os.Stat(filePath)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte("Not found"))
			return
		}
	}

	// Настраиваем кэширование (как в твоем коде)
	if filepath.Base(filePath) == "index.html" {
		w.Header().Set("Cache-Control", "no-cache")
	} else {
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	}
	w.Header().Set("X-Content-Type-Options", "nosniff")

	// Если метод HEAD, контент читать не нужно — просто отдаем заголовки
	if r.Method == http.MethodHead {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Читаем и отдаем файл (Go сам автоматически определит Content-Type по расширению в http.ServeContent)
	file, err := os.Open(filePath)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	defer file.Close()

	http.ServeContent(w, r, filePath, fileStat.ModTime(), file)
}
