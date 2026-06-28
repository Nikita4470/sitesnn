<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

// ... (твой код загрузки .env остается без изменений) ...

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

if (!$token || !$peer_id) {
    echo json_encode(["status" => "error", "message" => "Server config missing"]);
    exit;
}

$message = "🚀 Новая заявка!\n\n👤 Имя: $name\n📞 Контакты: $phone\n💬 Коммент: $comment";

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