<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// --- САМОПИСНЫЙ ЛОАДЕР .env ФАЙЛА ---
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
// ------------------------------------

// Теперь достаем переменные точно так же, как в других языках!
$token   = $_ENV['VK_TOKEN'] ?? getenv('VK_TOKEN');
$peer_id = $_ENV['VK_PEER_ID'] ?? getenv('VK_PEER_ID');
$secret_key = $_ENV['VK_SECRET_KEY'] ?? getenv('VK_SECRET_KEY');

$data = json_decode(file_get_contents('php://input'));
if ($data->secret !== $secretKey) {
    die("Попытка взлома! Неверный секретный ключ.");
}
if ($data->type === 'confirmation') {
    echo "e53c1e7f";
    exit;
}

// Проверяем, что секреты загрузились
if (!$token || !$peer_id !$secret_key) {
    echo json_encode(["status" => "error", "message" => "Server configuration missing"]);
    exit(1);
}

// Читаем JSON от Реакта
$name    = isset($input['name'])    ? trim($input['name'])    : 'Не указано';
$phone   = isset($input['phone'])   ? trim($input['phone'])   : 'Не указано';
$comment = isset($input['comment']) ? trim($input['comment']) : 'Нет комментария'; // Добавили

$message = "🚀 Новая заявка с лендинга!\n\n👤 Имя: " . $name . "\n📞 Контакты: " . $phone . "\n💬 Комментарий: " . $comment;

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
curl_exec($ch);
curl_close($ch);

echo json_encode(["status" => "success", "message" => "Заявка отправлена"]);