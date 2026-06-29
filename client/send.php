<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Игнорируем комментарии
        if (strpos(trim($line), '#') === 0) continue;
        
        // Разбиваем строку на КЛЮЧ=ЗНАЧЕНИЕ
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        // Записываем в окружение
        $_ENV[$name] = $value;
        putenv("{$name}={$value}");
    }
}

$token   = $_ENV['VK_TOKEN'] ?? getenv('VK_TOKEN');
$peer_id = $_ENV['VK_PEER_ID'] ?? getenv('VK_PEER_ID');

$data = json_decode(file_get_contents('php://input'));

// --- ЛОГИКА ВК CALLBACK ---
if (isset($data->type)) {
    if ($data->type === 'confirmation') {
        echo "a5a67c35"; // Твой код подтверждения
        exit;
    }
    // Если пришло сообщение или другое событие — просто отвечаем "ok"
    exit('ok');
}

// --- ЛОГИКА ЗАЯВКИ С ЛЕНДИНГА ---
// Обращаемся к данным через $data->свойство
$name    = isset($data->name)    ? trim($data->name)    : 'Не указано';
$phone   = isset($data->phone)   ? trim($data->phone)   : 'Не указано';
$comment = isset($data->comment) ? trim($data->comment) : 'Нет комментария';

if (mb_strlen($name) > 40 || mb_strlen($phone) > 40 || mb_strlen($comment) > 220) {
    echo json_encode(["status" => "error", "message" => "Too long message"]);
    exit;
}
if (empty($name) || empty($phone) || empty($comment)) {
    echo json_encode(["status" => "error", "message" => "Empty form"]);
    exit;
}

if (!$token || !$peer_id) {
    echo json_encode(["status" => "error", "message" => "Server config missing"]);
    exit;
}

$message = "🔔 *Новая заявка!*" . "\n" .
           "━━━━━━━━━━━━━━" . "\n" .
           "👤 Имя: " . $name . "\n" .
           "📞 Тел: " . $phone . "\n" .
           "💬 Комм: " . $comment . "\n" .
           "━━━━━━━━━━━━━━" . "\n" .
           "📅 " . date("d.m.Y H:i");

$params = [
    'v'            => '5.131',
    'random_id'    => rand(1, 2147483647),
    'peer_id'      => $peer_id,
    'message'      => $message,
    'access_token' => $token
];

$url = "https://api.vk.com/method/messages.send?" . http_build_query($params);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($response === false) {
    // Ошибка самого CURL (например, нет связи с сервером ВК)
    echo json_encode(["status" => "error", "message" => "CURL Error: " . curl_error($ch)]);
} else {
    $result = json_decode($response, true);
    if (isset($result['error'])) {
        // Ошибка от самого ВК (неверный токен, нет доступа и т.д.)
        echo json_encode(["status" => "error", "message" => "VK Error: " . $result['error']['error_msg']]);
    } else {
        echo json_encode(["status" => "success", "message" => "Заявка отправлена"]);
    }
}