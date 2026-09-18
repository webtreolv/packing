<?php
header('Content-Type: application/json');

// La base de datos SQLite se creará en esta misma carpeta
$db_path = __DIR__ . '/database.sqlite';
$db = new PDO('sqlite:' . $db_path);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$db->exec("CREATE TABLE IF NOT EXISTS labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_code TEXT,
    formatted_code TEXT,
    created_at DATETIME DEFAULT (datetime('now', 'localtime'))
)");

$action = $_GET['action'] ?? '';

if ($action === 'save') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $db->prepare("INSERT INTO labels (full_code, formatted_code) VALUES (:full, :formatted)");
    $stmt->execute([':full' => $data['full_code'], ':formatted' => $data['formatted_code']]);
    echo json_encode(['success' => true]);
} elseif ($action === 'list') {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = 5;
    $offset = ($page - 1) * $limit;
    
    $date = $_GET['date'] ?? '';
    
    $where = "";
    $params = [];
    if ($date) {
        $where = "WHERE DATE(created_at) = :date";
        $params[':date'] = $date;
    }
    
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM labels $where");
    $countStmt->execute($params);
    $total = $countStmt->fetchColumn();
    
    $stmt = $db->prepare("SELECT * FROM labels $where ORDER BY id DESC LIMIT $limit OFFSET $offset");
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'data' => $rows,
        'total' => $total,
        'page' => $page,
        'pages' => ceil($total / $limit)
    ]);
} elseif ($action === 'all') {
    $stmt = $db->query("SELECT * FROM labels ORDER BY id DESC");
    echo json_encode(['data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} elseif ($action === 'delete') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $db->prepare("DELETE FROM labels WHERE id = :id");
    $stmt->execute([':id' => $data['id']]);
    echo json_encode(['success' => true]);
} elseif ($action === 'clear') {
    $db->exec("DELETE FROM labels");
    echo json_encode(['success' => true]);
}
