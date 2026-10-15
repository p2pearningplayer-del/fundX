<?php
/**
 * ==============================================================================
 * FundX Panel — Enterprise PHP & MySQL Core Configuration & Utilities
 * Target Domain: https://fundxx.in/
 * Target Database: u591469534_fund
 * ==============================================================================
 */

// Buffer output immediately to prevent any accidental whitespace/warnings from corrupting JSON
if (ob_get_level() == 0) {
    ob_start();
}

// Suppress raw display errors to keep API JSON clean
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// 0. Environment File Loader
function loadEnvConfig(): array {
    $config = [
        'DB_HOST' => 'localhost',
        'DB_PORT' => '3306',
        'DB_NAME' => 'u591469534_fund',
        'DB_USER' => 'u591469534_fundx',
        'DB_PASS' => 'Fund@123@1',
        'APP_URL' => 'https://fundxx.in'
    ];

    $envPath = __DIR__ . '/.env';
    if (file_exists($envPath)) {
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($key, $val) = explode('=', $line, 2);
                $key = trim($key);
                $val = trim($val);
                $val = trim($val, "\"'");
                if (!empty($key)) {
                    $config[$key] = $val;
                }
            }
        }
    }
    return $config;
}

$env = loadEnvConfig();

define('DB_HOST', getenv('DB_HOST') ?: $env['DB_HOST']);
define('DB_PORT', getenv('DB_PORT') ?: $env['DB_PORT']);
define('DB_NAME', getenv('DB_NAME') ?: $env['DB_NAME']);
define('DB_USER', getenv('DB_USER') ?: $env['DB_USER']);
define('DB_PASS', getenv('DB_PASS') ?: $env['DB_PASS']);

define('APP_URL', getenv('APP_URL') ?: $env['APP_URL']);
define('JWT_SECRET', 'fundx_production_master_jwt_secret_key_2026_9876543210');
define('AES_KEY', '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'); // 32-byte key

// Global Error Handler to guarantee clean JSON on API endpoints
function apiErrorHandler($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return false;
    }
    // In API mode, output structured JSON error
    if (strpos($_SERVER['REQUEST_URI'] ?? '', 'api') !== false) {
        jsonResponse([
            'success' => false,
            'error' => "Runtime Error: {$message} at line {$line}"
        ], 500);
    }
    return true;
}
set_error_handler('apiErrorHandler', E_ERROR | E_PARSE | E_CORE_ERROR | E_COMPILE_ERROR);

// Global Exception Handler
set_exception_handler(function(Throwable $e) {
    jsonResponse([
        'success' => false,
        'error' => $e->getMessage()
    ], 500);
});

// 1. Database Connection PDO Singleton with Graceful JSON Failover
function getDBConnection(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        if (defined('PDO::MYSQL_ATTR_MULTI_STATEMENTS')) {
            $options[PDO::MYSQL_ATTR_MULTI_STATEMENTS] = true;
        }

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
        } catch (PDOException $e) {
            jsonResponse([
                'success' => false,
                'error' => 'Database connection failed: ' . $e->getMessage(),
                'code' => 'DB_CONNECTION_ERROR'
            ], 500);
        }
    }
    return $pdo;
}

// 2. Safe Schema Verification
function ensureDatabaseSchema(PDO $pdo): void {
    try {
        $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
        if ($stmt->rowCount() === 0) {
            $sqlFile = __DIR__ . '/database.sql';
            if (file_exists($sqlFile)) {
                $sql = file_get_contents($sqlFile);
                $pdo->exec($sql);
            }
        }
    } catch (Throwable $e) {
        // Schema check fail-safe
    }
}

// 3. Password Hashing (Bcrypt Cost 12)
function hashPassword(string $password): string {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

function verifyPassword(string $password, string $hash): bool {
    return password_verify($password, $hash);
}

// 4. AES-256-GCM Encryption Vault for Sensitive PII & Bank Accounts
function encryptVault(string $plaintext): string {
    $key = hash('sha256', AES_KEY, true);
    $iv = openssl_random_pseudo_bytes(12); // 96-bit IV for GCM
    $tag = '';
    $ciphertext = openssl_encrypt($plaintext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
    if ($ciphertext === false) {
        throw new Exception("AES-256-GCM encryption failed");
    }
    return base64_encode($iv . $tag . $ciphertext);
}

function decryptVault(string $encryptedBase64): ?string {
    try {
        $data = base64_decode($encryptedBase64);
        if (strlen($data) < 28) return null; // 12 IV + 16 Tag
        $iv = substr($data, 0, 12);
        $tag = substr($data, 12, 16);
        $ciphertext = substr($data, 28);
        $key = hash('sha256', AES_KEY, true);
        return openssl_decrypt($ciphertext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
    } catch (Throwable $e) {
        return null;
    }
}

// Mask Bank Account Number (e.g. XXXX-XXXX-1234)
function maskAccountNumber(string $accountNumber): string {
    $clean = preg_replace('/\D/', '', $accountNumber);
    $last4 = substr($clean, -4) ?: '0000';
    return "XXXX-XXXX-" . $last4;
}

// 5. Token Generation & Verification
function generateSessionToken(array $payload): string {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + (86400 * 7); // 7 days
    $payload['iat'] = time();
    $payload['iss'] = APP_URL;
    $base64Header = rtrim(strtr(base64_encode($header), '+/', '-_'), '=');
    $base64Payload = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
    $base64Signature = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

function verifySessionToken(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    list($base64Header, $base64Payload, $base64Signature) = $parts;
    $signature = rtrim(strtr(base64_encode(hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true)), '+/', '-_'), '=');
    if (!hash_equals($signature, $base64Signature)) return null;
    $payload = json_decode(base64_decode(strtr($base64Payload, '-_', '+/')), true);
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) return null;
    return $payload;
}

// Get current authenticated user
function getAuthenticatedUser(PDO $pdo): ?array {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$authHeader && function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    if (!$authHeader && isset($_COOKIE['fundx_token'])) {
        $authHeader = 'Bearer ' . $_COOKIE['fundx_token'];
    }
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }
    $payload = verifySessionToken($matches[1]);
    if (!$payload || !isset($payload['uid'])) {
        return null;
    }
    $stmt = $pdo->prepare("SELECT id, legal_name, username, mobile, email, referral_code, role, is_suspended, created_at FROM users WHERE id = ?");
    $stmt->execute([$payload['uid']]);
    $user = $stmt->fetch();
    if ($user && $user['is_suspended']) {
        return null;
    }
    return $user ?: null;
}

// Require authentication middleware
function requireAuth(PDO $pdo): array {
    $user = getAuthenticatedUser($pdo);
    if (!$user) {
        jsonResponse(['success' => false, 'error' => 'Unauthorized or session expired'], 401);
    }
    return $user;
}

// Require Superadmin role middleware
function requireAdmin(PDO $pdo): array {
    $user = requireAuth($pdo);
    if ($user['role'] !== 'SUPERADMIN' && $user['role'] !== 'ADMIN') {
        jsonResponse(['success' => false, 'error' => 'Forbidden: Administrative privileges required'], 403);
    }
    return $user;
}

// 6. JSON Response Helper (Guarantees zero corrupting HTML / text)
function jsonResponse(array $data, int $status = 200): void {
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    
    // Dynamic CORS matching
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (preg_match('/^https?:\/\/(localhost|127\.0\.0\.1|.*fundxx\.in)(:\d+)?$/i', $origin)) {
        header("Access-Control-Allow-Origin: {$origin}");
    } else {
        header('Access-Control-Allow-Origin: https://fundxx.in');
    }
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

// 7. Security Event Logger
function logSecurityEvent(PDO $pdo, ?string $userId, string $eventType, ?array $metadata = []): void {
    try {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
        $id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
        $stmt = $pdo->prepare("INSERT INTO security_logs (id, user_id, event_type, ip_address, user_agent, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$id, $userId, $eventType, $ip, $ua, json_encode($metadata)]);
    } catch (Throwable $e) {
        // Logging fail safe
    }
}

// 8. Financial Double-Entry Ledger System
function recordLedgerEntry(
    PDO $pdo,
    string $userId,
    string $fundId,
    string $entryType,
    float $amount,
    string $referenceType,
    ?string $referenceId = null,
    ?string $description = null
): string {
    $stmt = $pdo->prepare("SELECT balance FROM user_funds WHERE user_id = ? AND fund_id = ? FOR UPDATE");
    $stmt->execute([$userId, $fundId]);
    $current = $stmt->fetch();
    $balanceBefore = $current ? floatval($current['balance']) : 0.0;
    
    if (in_array($entryType, ['COMMISSION_CREDIT', 'BASELINE_CREDIT', 'REFUND', 'DISBURSEMENT_ROLLBACK'])) {
        $balanceAfter = $balanceBefore + $amount;
    } else if (in_array($entryType, ['WITHDRAWAL_RESERVE', 'DEBIT', 'ACTIVATION_FEE'])) {
        $balanceAfter = $balanceBefore - $amount;
    } else {
        $balanceAfter = $balanceBefore;
    }

    $id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );

    $ins = $pdo->prepare("
        INSERT INTO ledger_entries (id, user_id, fund_id, entry_type, amount, balance_before, balance_after, reference_type, reference_id, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $ins->execute([$id, $userId, $fundId, $entryType, $amount, $balanceBefore, $balanceAfter, $referenceType, $referenceId, $description]);

    $upd = $pdo->prepare("UPDATE user_funds SET balance = ?, updated_at = NOW() WHERE user_id = ? AND fund_id = ?");
    $upd->execute([$balanceAfter, $userId, $fundId]);

    return $id;
}

// 9. System Config Service
function getSystemConfig(PDO $pdo, string $key, $default = null) {
    try {
        $stmt = $pdo->prepare("SELECT config_value FROM system_config WHERE config_key = ?");
        $stmt->execute([$key]);
        $row = $stmt->fetch();
        if ($row && $row['config_value'] !== null && $row['config_value'] !== '') {
            $val = trim($row['config_value']);
            if ((substr($val, 0, 1) === '"' && substr($val, -1) === '"') || (substr($val, 0, 1) === "'" && substr($val, -1) === "'")) {
                $val = substr($val, 1, -1);
            }
            return $val;
        }
    } catch (Throwable $e) {}
    return $default;
}

function setSystemConfig(PDO $pdo, string $key, string $value, ?string $updatedBy = null): bool {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO system_config (config_key, config_value, updated_by, updated_at)
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), updated_by = VALUES(updated_by), updated_at = NOW()
        ");
        return $stmt->execute([$key, $value, $updatedBy]);
    } catch (Throwable $e) {
        return false;
    }
}

