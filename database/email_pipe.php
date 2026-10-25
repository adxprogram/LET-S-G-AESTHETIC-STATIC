#!/usr/local/bin/php
<?php
/**
 * email_pipe.php — cPanel email pipe for Let's G Aesthetic & Wellness
 */

$LOG_FILE = '/home/letslycx/email_pipe.log';
function pipe_log(string $msg): void {
    global $LOG_FILE;
    $ts = date('Y-m-d H:i:s');
    @file_put_contents($LOG_FILE, "[{$ts}] {$msg}\n", FILE_APPEND | LOCK_EX);
}

define('DB_HOST', 'localhost');
define('DB_USER', 'letslycx_admin');
define('DB_PASS', 'HpGFcqQ3NaF2hwH');
define('DB_NAME', 'letslycx_wellness');
define('API_URL', 'https://lets-g-aesthetics.site/database/api.php?route=admin/client-reply');

pipe_log("=== email_pipe.php started ===");

$raw = '';
while (!feof(STDIN)) {
    $raw .= fread(STDIN, 8192);
}

if (empty(trim($raw))) {
    pipe_log("Empty input — nothing to process.");
    exit(0);
}

pipe_log("Received email (" . strlen($raw) . " bytes)");
$preview = substr($raw, 0, 800);
pipe_log("RAW PREVIEW:\n" . $preview);

// ── Extract message_id ────────────────────────────────────────────────────────
$message_id = null;
$header_patterns = [
    '/^(?:To|Delivered-To|X-Original-To|X-Forwarded-To):\s*.*?reply\+(\d+)@/mi',
    '/^X-LetsG-MessageID:\s*(\d+)/mi',
    '/letsg-msg-(\d+)@/i',
    '/reply\+(\d+)@lets-g-aesthetics\.site/i',
];

foreach ($header_patterns as $pattern) {
    if (preg_match($pattern, $raw, $m)) {
        $message_id = (int) $m[1];
        pipe_log("Found message_id={$message_id} via pattern: {$pattern}");
        break;
    }
}

if (!$message_id) {
    pipe_log("ERROR: Could not extract message_id. Dumping headers:");
    $header_block = preg_split('/\r?\n\r?\n/', $raw, 2)[0] ?? $raw;
    pipe_log("=== HEADERS ===\n" . $header_block . "\n=== END ===");
    exit(0);
}

// ── Parse email body ──────────────────────────────────────────────────────────
$reply_body = extract_reply_body($raw);
pipe_log("Extracted reply body (" . strlen($reply_body) . " chars): " . substr($reply_body, 0, 200));

if (empty($reply_body)) {
    pipe_log("ERROR: Empty reply body after parsing. Skipping.");
    exit(0);
}

// ── Store to DB ───────────────────────────────────────────────────────────────
$stored = store_reply_db($message_id, $reply_body);
if (!$stored) {
    pipe_log("DB store failed — trying HTTP fallback...");
    $stored = store_reply_http($message_id, $reply_body);
}

pipe_log($stored ? "SUCCESS: reply stored for message_id={$message_id}" : "FAILED: could not store reply");
exit(0);

// ── Functions ─────────────────────────────────────────────────────────────────

function extract_reply_body(string $raw): string {
    // Strip mbox envelope line (e.g. "From user@host Mon Jan 1 00:00:00 2026")
    $raw = preg_replace('/^From\s+\S+@\S+\s+\w{3}\s+\w{3}\s+[\s\d:]+\d{4}\r?\n/m', '', $raw, 1);
    return parse_mime_part($raw, 0);
}

function parse_mime_part(string $raw, int $depth): string {
    if ($depth > 8) {
        pipe_log("Max depth reached");
        return '';
    }

    // Find first blank line separating headers from body
    if (!preg_match('/\r?\n\r?\n/', $raw, $match, PREG_OFFSET_CAPTURE)) {
        return strip_quoted_text($raw);
    }

    $header_end  = $match[0][1];
    $sep_len     = strlen($match[0][0]);
    $top_headers = substr($raw, 0, $header_end);
    $body_raw    = substr($raw, $header_end + $sep_len);

    $content_type = '';
    $encoding     = '';
    if (preg_match('/^Content-Type:\s*([^\r\n;]+)/mi', $top_headers, $m)) {
        $content_type = strtolower(trim($m[1]));
    }
    if (preg_match('/^Content-Transfer-Encoding:\s*([^\r\n]+)/mi', $top_headers, $m)) {
        $encoding = strtolower(trim($m[1]));
    }

    pipe_log(str_repeat('  ', $depth) . "Part CT={$content_type} ENC={$encoding}");

    if (strpos($content_type, 'multipart/') !== false) {
        $boundary = '';
        // Look for boundary only in this part's headers
        if (preg_match('/boundary=(?:"([^"]+)"|([^\s;\r\n]+))/i', $top_headers, $bm)) {
            $boundary = $bm[1] ?: $bm[2];
        }

        pipe_log(str_repeat('  ', $depth) . "Boundary='{$boundary}'");

        if ($boundary) {
            $bq = preg_quote($boundary, '/');
            // Split only the body (not the whole raw) on boundary markers
            $parts = preg_split('/--' . $bq . '(?:--)?[ \t]*\r?\n?/m', $body_raw);
            foreach ($parts as $part) {
                $part = ltrim($part, "\r\n");
                if (empty($part)) continue;

                $part_ct = '';
                if (preg_match('/^Content-Type:\s*([^\r\n;]+)/mi', $part, $m)) {
                    $part_ct = strtolower(trim($m[1]));
                }
                pipe_log(str_repeat('  ', $depth) . "  Sub-part CT='{$part_ct}'");

                if (strpos($part_ct, 'text/plain') !== false) {
                    $sub = preg_split('/\r?\n\r?\n/', $part, 2);
                    $sub_body = $sub[1] ?? '';
                    if (preg_match('/Content-Transfer-Encoding:\s*quoted-printable/i', $part)) {
                        $sub_body = quoted_printable_decode($sub_body);
                    } elseif (preg_match('/Content-Transfer-Encoding:\s*base64/i', $part)) {
                        $sub_body = base64_decode(str_replace(["\r", "\n"], '', $sub_body));
                    }
                    $stripped = strip_quoted_text($sub_body);
                    if (!empty($stripped)) return $stripped;
                }

                if (strpos($part_ct, 'multipart/') !== false) {
                    $nested = parse_mime_part($part, $depth + 1);
                    if (!empty($nested)) return $nested;
                }
            }
        }
        return '';
    }

    // Single-part decode
    if ($encoding === 'quoted-printable') {
        $body_raw = quoted_printable_decode($body_raw);
    } elseif ($encoding === 'base64') {
        $body_raw = base64_decode(str_replace(["\r", "\n"], '', $body_raw));
    }

    return strip_quoted_text($body_raw);
}

function strip_quoted_text(string $text): string {
    $text  = str_replace("\r\n", "\n", $text);
    $text  = str_replace("\r", "\n", $text);
    $lines = explode("\n", $text);
    $kept  = [];

    foreach ($lines as $line) {
        if (preg_match('/^>/', $line))                                        break;
        if (preg_match('/^On .{5,}wrote:\s*$/i', $line))                     break;
        if (preg_match('/^On .{5,}wrote:/i', $line))                         break;
        if (preg_match('/^-{3,}\s*(Original Message|Forwarded)/i', $line))   break;
        if (preg_match('/^_{5,}/', $line))                                    break;
        if (strpos($line, 'Reply above this line') !== false)                 break;
        if (strpos($line, '──────────────') !== false)                        break;
        if (strpos($line, "Let's G Aesthetic") !== false && count($kept) > 1) break;
        if (strpos($line, 'noreply@lets-g-aesthetics') !== false)             break;
        $kept[] = $line;
    }

    return trim(implode("\n", $kept));
}

function store_reply_db(int $message_id, string $reply_body): bool {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            pipe_log("DB connect error: " . $conn->connect_error);
            return false;
        }
        $conn->set_charset('utf8mb4');
        $conn->query("CREATE TABLE IF NOT EXISTS message_replies (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            message_id INT NOT NULL,
            sender     VARCHAR(20) NOT NULL DEFAULT 'admin',
            body       TEXT NOT NULL,
            sent_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        $sender = 'client';
        $stmt = $conn->prepare("INSERT INTO message_replies (message_id, sender, body) VALUES (?, ?, ?)");
        $stmt->bind_param('iss', $message_id, $sender, $reply_body);
        $ok = $stmt->execute();
        if (!$ok) pipe_log("DB insert error: " . $stmt->error);
        $stmt->close();
        $conn->close();
        return $ok;
    } catch (Throwable $e) {
        pipe_log("DB exception: " . $e->getMessage());
        return false;
    }
}

function store_reply_http(int $message_id, string $reply_body): bool {
    $payload = json_encode([
        'message_id' => $message_id,
        'body'       => $reply_body,
        'secret'     => 'LETSG_WEBHOOK_SECRET',
    ]);
    $ctx = stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => "Content-Type: application/json\r\nContent-Length: " . strlen($payload),
            'content' => $payload,
            'timeout' => 10,
        ]
    ]);
    $result = @file_get_contents(API_URL, false, $ctx);
    if ($result === false) {
        pipe_log("HTTP fallback failed.");
        return false;
    }
    $decoded = json_decode($result, true);
    $ok = ($decoded['status'] ?? '') === 'success';
    pipe_log("HTTP fallback result: " . $result);
    return $ok;
}