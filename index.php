<?php
/**
 * ==============================================================================
 * FundX Panel — Hostinger Business Web Hosting Gateway & Reverse Proxy
 * Target Domain: https://fundxx.in/
 * Target Database: u591469534_fund
 * ==============================================================================
 */

// 1. Load .env credentials if present
function getEnvConfig() {
    $envFile = __DIR__ . '/.env';
    $config = [
        'PORT' => 3000,
        'DB_HOST' => 'localhost',
        'DB_PORT' => '3306',
        'DB_NAME' => 'u591469534_fund',
        'DB_USER' => 'u591469534_fundx',
        'DB_PASS' => 'Fund@123@1',
    ];

    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($key, $val) = explode('=', $line, 2);
                $key = trim($key);
                $val = trim($val);
                $val = trim($val, "\"'");
                $config[$key] = $val;
            }
        }
    }
    return $config;
}

$env = getEnvConfig();
$nodePort = intval($env['PORT'] ?: 3000);

// 2. Check if Node.js server is running on the target port
$isNodeRunning = false;
$socket = @fsockopen('127.0.0.1', $nodePort, $errno, $errstr, 0.5);
if ($socket) {
    $isNodeRunning = true;
    fclose($socket);
}

// 3. If Node.js server is active, reverse proxy the request directly to it
if ($isNodeRunning) {
    $targetUrl = "http://127.0.0.1:{$nodePort}" . $_SERVER['REQUEST_URI'];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $targetUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
    
    // Forward request headers
    $headers = [];
    foreach (getallheaders() as $name => $value) {
        if (strtolower($name) === 'host') {
            $headers[] = "Host: " . $_SERVER['HTTP_HOST'];
        } else {
            $headers[] = "{$name}: {$value}";
        }
    }
    $headers[] = "X-Forwarded-For: " . ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
    $headers[] = "X-Forwarded-Proto: https";
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    // Forward request body for POST/PUT/PATCH
    if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH', 'DELETE'])) {
        $body = file_get_contents('php://input');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    
    $response = curl_exec($ch);
    
    if ($response !== false) {
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $headerStr = substr($response, 0, $headerSize);
        $body = substr($response, $headerSize);
        
        http_response_code($httpCode);
        
        // Forward response headers
        $headerLines = explode("\r\n", $headerStr);
        foreach ($headerLines as $h) {
            if (!empty($h) && !preg_match('/^(Transfer-Encoding|Content-Length)/i', $h)) {
                header($h, false);
            }
        }
        
        echo $body;
        curl_close($ch);
        exit;
    }
    curl_close($ch);
}

// 4. If Node.js is not running, test MySQL Database Connectivity
$dbStatus = 'Unknown';
$dbError = null;
$tableCount = 0;
try {
    $dsn = "mysql:host={$env['DB_HOST']};port={$env['DB_PORT']};dbname={$env['DB_NAME']};charset=utf8mb4";
    $pdo = new PDO($dsn, $env['DB_USER'], $env['DB_PASS'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 3
    ]);
    $stmt = $pdo->query("SHOW TABLES;");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $tableCount = count($tables);
    $dbStatus = "Connected successfully ({$tableCount} tables verified)";
} catch (Exception $e) {
    $dbStatus = "Connection Error";
    $dbError = $e->getMessage();
}

// 5. Render Polished FundX Deployment & Diagnostics Screen
http_response_code(200);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FundX Panel — Hostinger Business Setup</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #090d16;
            color: #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
        }
        .card {
            background: #111827;
            border: 1px solid #1f2937;
            border-radius: 16px;
            max-width: 720px;
            width: 100%;
            padding: 32px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #1f2937;
            padding-bottom: 20px;
            margin-bottom: 24px;
        }
        .logo {
            font-size: 24px;
            font-weight: 800;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .badge {
            font-size: 12px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 9999px;
            background: #1e3a8a;
            color: #93c5fd;
            border: 1px solid #3b82f6;
        }
        .status-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 28px;
        }
        .status-box {
            background: #1e293b;
            border-radius: 12px;
            padding: 16px;
            border: 1px solid #334155;
        }
        .status-box h4 {
            font-size: 13px;
            color: #94a3b8;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .status-box p {
            font-size: 15px;
            font-weight: 600;
        }
        .text-emerald { color: #10b981; }
        .text-amber { color: #f59e0b; }
        .text-red { color: #ef4444; }
        .instruction-box {
            background: #0f172a;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 24px;
        }
        .instruction-box h3 {
            font-size: 16px;
            margin-bottom: 12px;
            color: #60a5fa;
        }
        .instruction-box ol {
            padding-left: 20px;
            font-size: 14px;
            line-height: 1.7;
            color: #cbd5e1;
        }
        .instruction-box ol li { margin-bottom: 8px; }
        .code-pill {
            background: #1e293b;
            color: #38bdf8;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 13px;
        }
        .btn-row {
            display: flex;
            gap: 12px;
        }
        .btn {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            transition: background 0.2s;
            cursor: pointer;
            border: none;
        }
        .btn:hover { background: #1d4ed8; }
        .btn-secondary {
            background: #334155;
            color: #f1f5f9;
        }
        .btn-secondary:hover { background: #475569; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="logo">FundX Institutional Panel</div>
            <div class="badge">Hostinger Business Web Hosting</div>
        </div>

        <div class="status-grid">
            <div class="status-box">
                <h4>LiteSpeed / Gateway</h4>
                <p class="text-emerald">Active (Online 200 OK)</p>
            </div>
            <div class="status-box">
                <h4>MySQL Database (u591469534_fund)</h4>
                <p class="<?php echo $tableCount > 0 ? 'text-emerald' : 'text-amber'; ?>">
                    <?php echo htmlspecialchars($dbStatus); ?>
                </p>
                <?php if ($dbError): ?>
                    <small style="color: #ef4444; font-size: 11px; display: block; margin-top: 4px;"><?php echo htmlspecialchars($dbError); ?></small>
                <?php endif; ?>
            </div>
            <div class="status-box">
                <h4>Target Domain</h4>
                <p>https://fundxx.in/</p>
            </div>
            <div class="status-box">
                <h4>Node.js Service (Port <?php echo $nodePort; ?>)</h4>
                <p class="<?php echo $isNodeRunning ? 'text-emerald' : 'text-amber'; ?>">
                    <?php echo $isNodeRunning ? 'Online (Proxy Active)' : 'Awaiting Startup in hPanel'; ?>
                </p>
            </div>
        </div>

        <div class="instruction-box">
            <h3>How to Activate Node.js on Hostinger Business Hosting</h3>
            <ol>
                <li>Open <strong>Hostinger hPanel</strong> (<a href="https://hpanel.hostinger.com" target="_blank" style="color: #38bdf8;">hpanel.hostinger.com</a>).</li>
                <li>Go to <strong>Websites</strong> &rarr; Click <strong>Manage</strong> on <span class="code-pill">fundxx.in</span>.</li>
                <li>In the left sidebar search bar, type <strong>Node.js</strong> and open the <strong>Node.js</strong> section (or <strong>Web Applications</strong>).</li>
                <li>Click <strong>Connect with GitHub</strong> (or select your repository <span class="code-pill">p2pearningplayer-del/fundX</span>).
                    <br>&bull; <strong>Branch:</strong> <span class="code-pill">main</span>
                    <br>&bull; <strong>Node.js Version:</strong> <span class="code-pill">20.x</span> or <span class="code-pill">18.x</span>
                    <br>&bull; <strong>Application Startup File:</strong> <span class="code-pill">server.js</span>
                </li>
                <li>Click <strong>Save Changes</strong> &rarr; <strong>Restart Application</strong>.</li>
            </ol>
            <p style="margin-top: 10px; font-size: 13px; color: #94a3b8;">
                <em>Or via Hostinger SSH:</em> run <span class="code-pill">pm2 start server.js --name fundx</span>.
            </p>
        </div>

        <div class="btn-row">
            <button class="btn" onclick="window.location.reload();">Refresh Status</button>
            <a href="https://hpanel.hostinger.com" target="_blank" class="btn btn-secondary">Open Hostinger hPanel</a>
        </div>
    </div>
</body>
</html>
