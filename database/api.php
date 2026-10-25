<?php
/**
 * api.php — REST API backend for Let's G Aesthetic & Wellness Services.
 * Replaces app.py (Flask + PyMongo).
 *
 * Endpoints (all relative to this file):
 *   GET  api.php?route=services
 *   POST api.php?route=book
 *   POST api.php?route=contact
 *   POST api.php?route=club
 *   POST api.php?route=admin/login
 *   GET  api.php?route=admin/stats
 *   GET  api.php?route=admin/calendar
 *   POST api.php?route=admin/update-appointment
 *   GET  api.php?route=admin/messages
 *   POST api.php?route=admin/mark-message-read
 *   POST api.php?route=admin/reset
 */

// ── MUST be first: suppress HTML error output and force JSON headers ──────────
ini_set('display_errors', '0');     // Never let PHP inject HTML into the response
error_reporting(E_ALL);             // Still log errors server-side
ini_set('log_errors', '1');

// Send CORS + JSON headers before ANY output or logic
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle pre-flight OPTIONS request immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config.php';

// ── Router ────────────────────────────────────────────────────────────────────
$route  = $_GET['route'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Parse JSON body for POST requests
$body = [];
if ($method === 'POST') {
    $raw  = file_get_contents('php://input');
    $body = json_decode($raw, true) ?? [];
}


// ── Service Price Map (auto-populated from servicesByCategory in script.js) ──
function get_service_price(string $service_name): float {
    static $map = [
        // Facial Services
        'Glowing Facial'           => 1000,
        'Acne Peel Facial'         => 1200,
        'Melasma Facial'           => 3000,
        'Ageless Facial'           => 1500,
        'Contour Facial'           => 1700,
        'Exilis Facial'            => 1500,
        'Diamond Peel Facial'      => 450,
        'Galvanic Facial'          => 650,
        'Hydra Facial'             => 800,
        // Wellness & Massage
        'Swedish'                      => 400,
        'Deep Tissue'                  => 700,
        'Back Massage'                 => 250,
        'Combi Massage'                => 500,
        'Foot Massage'                 => 300,
        'Bodyscrub'                    => 600,
        'Swedish + Ventosa (1hr)'      => 600,
        'Swedish + Hotstone (1hr)'     => 550,
        'Deep Tissue + Ventosa (1hr)'  => 800,
        'Deep Tissue + Hotstone (1hr)' => 850,
        'Signature Massage (1.5hr)'    => 600,
        'Full Body + Hotstone (2hrs)'  => 900,
        'Add-on: Ventosa'              => 200,
        'Add-on: Hotstone'             => 150,
        'Add-on: Ear Candling'         => 150,
        'Regular Footspa'              => 350,
        'Premium Footspa'              => 450,
        // Lash & Brow
        'Classic Lashes'   => 500,
        'Natural Lashes'   => 600,
        'Hybrid Lashes'    => 700,
        'Volume Lashes'    => 1000,
        'Mega Volume'      => 1200,
        'Lash Removal'     => 100,
        'Lash Lift'        => 400,
        'Lash Tint'        => 500,
        '7D Microblading'  => 3000,
        'Combrows'         => 4000,
        'Ombre Brows'      => 3500,
        'Hybrid Brows'     => 3500,
        'Lip Tint'         => 3500,
        // Hair Services
        'Cut & Blowdry'          => 150,
        'Cut, Shampoo & Blowdry' => 250,
        'Shampoo & Blowdry'      => 200,
        'Hair Iron & Blowdry'    => 300,
        'Hair Color'             => 500,
        'Hairspa'                => 500,
        'Botox'                  => 1500,
        'Keratin Straight'       => 2000,
        'Brazilian Blowout'      => 1000,
        'Headspa — Regular'      => 999,
        'Headspa — Premium'      => 1299,
        'Headspa — Deluxe'       => 1899,
        'Headspa — Signature'    => 2199,
        // Advance Skin & Laser
        'Exosomes Facial'  => 4500,
        'Exo-laser Facial' => 5000,
        'Derma Pen Facial' => 3000,
        'Pico: Elbow or Knees'     => 900,
        'Pico: Neck or Nape'       => 1000,
        'Pico: Butt Area'          => 1200,
        'Pico: Brazilian/Inguinal' => 1200,
        'Pico: Underarm'           => 1000,
        'Laser: Elbow or Knees'    => 800,
        'Laser: Neck or Nape'      => 800,
        'Laser: Butt Area'         => 1000,
        'Laser: Brazilian/Inguinal'=> 1000,
        'Laser: Underarm'          => 900,
        // Slimming & Contouring
        'HIFU: Face Neck'           => 1500,
        'HIFU: Arms or Love Handle' => 1500,
        'HIFU: Lower Butt'          => 2000,
        'Exilis: Face & Neck'       => 1200,
        'Exilis: Arms'              => 1500,
        'Exilis: Thighs'            => 1500,
        'Exilis: Love Handle'       => 1500,
        'Exilis: Tummy'             => 1800,
        'Slimming Bed (30 mins)'    => 800,
        'Meso Lipo Face & Chin'     => 2500,
        'Meso Lipo Any Part'        => 4500,
        // Nail Care
        'Mani & Pedicure'                    => 150,
        'Ingrown Removal'                    => 250,
        'Gel Manicure'                       => 400,
        'Gel Pedicure'                       => 500,
        'Gel Polish Removal'                 => 100,
        'Nail Extension (Plain)'             => 1000,
        'Nail Extension Removal'             => 300,
        'Stickers / Glitter / Rhinestones'   => 20,
        'Ribbon / 3D Flowers / Stones'       => 30,
        'Nail Art'                           => 50,
        'Reinforced Gel Overlay'             => 80,
        'Cateye'                             => 200,
    ];
    return isset($map[$service_name]) ? (float)$map[$service_name] : 0.0;
}

switch ($route) {

    // ── 1. GET ?route=services ────────────────────────────────────────────────
    case 'services':
        if ($method !== 'GET') { method_not_allowed(); break; }
        $conn     = get_db();
        $result   = $conn->query("SELECT category_id, name, description FROM services");
        $services = [];
        while ($row = $result->fetch_assoc()) {
            $services[] = $row;
        }
        $conn->close();
        echo json_encode(['status' => 'success', 'data' => $services]);
        break;

    // ── 2. POST ?route=book ───────────────────────────────────────────────────
    case 'book':
        if ($method !== 'POST') { method_not_allowed(); break; }
        $conn = get_db();

        $appointment_id   = 'A' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        $customer_name    = $body['name']     ?? '';
        $customer_phone   = $body['phone']    ?? '';
        $service_category = $body['category'] ?? '';
        $service_name     = $body['service']  ?? '';
        $booking_date     = $body['date']     ?? '';   // 'YYYY-MM-DDTHH:MM'
        $special_request  = $body['notes']    ?? 'None';

        // addons: array of additional service names the client chose
        $addons_raw  = $body['addons'] ?? [];
        if (!is_array($addons_raw)) $addons_raw = [];
        $addons_json = count($addons_raw) > 0 ? json_encode(array_values($addons_raw)) : null;

        // Auto-calculate total price: base service + all add-ons
        $price = get_service_price($service_name);
        foreach ($addons_raw as $addon_name) {
            $price += get_service_price(trim($addon_name));
        }
        if ($price <= 0) $price = floatval($body['price'] ?? 0);

        // Ensure columns exist (safe migrations)
        $conn->query("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL DEFAULT 0.00");
        $conn->query("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS addons JSON");

        // Convert ISO 8601 to MySQL DATETIME (replace T with a space)
        $booking_date_sql = str_replace('T', ' ', $booking_date);

        // Server-side business hours validation
        // Open: 11:00 AM | Last slot: 8:40 PM
        $appt_ts = strtotime($booking_date_sql);
        if ($appt_ts === false || $appt_ts <= time()) {
            http_response_code(400);
            echo json_encode(['status'=>'error','message'=>'Please select a future date and time.']);
            exit;
        }
        $appt_hour   = (int)date('G', $appt_ts); // 0-23
        $appt_minute = (int)date('i', $appt_ts);
        $appt_total_mins = $appt_hour * 60 + $appt_minute;
        if ($appt_total_mins < 11 * 60) {
            http_response_code(400);
            echo json_encode(['status'=>'error','message'=>'We open at 11:00 AM. Please select a time at or after 11:00 AM.']);
            exit;
        }
        if ($appt_total_mins > 20 * 60 + 40) {
            http_response_code(400);
            echo json_encode(['status'=>'error','message'=>'Last booking slot is 8:40 PM. Please select an earlier time.']);
            exit;
        }

        $stmt = $conn->prepare(
            "INSERT INTO appointments
             (appointment_id, customer_name, customer_phone, service_category,
              service_name, booking_date, status, special_request, price, addons)
             VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)"
        );
        $stmt->bind_param('sssssssds',
            $appointment_id, $customer_name, $customer_phone,
            $service_category, $service_name, $booking_date_sql, $special_request, $price, $addons_json
        );

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode([
                'status'         => 'success',
                'message'        => 'Appointment booked successfully!',
                'appointment_id' => $appointment_id,
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to book appointment.']);
        }
        $stmt->close();
        $conn->close();
        break;

    // ── 3. POST ?route=contact ────────────────────────────────────────────────
    case 'contact':
        if ($method !== 'POST') { method_not_allowed(); break; }
        $conn = get_db();

        $name    = $body['name']    ?? '';
        $email   = $body['email']   ?? '';
        $subject = $body['subject'] ?? '';
        $message = $body['message'] ?? '';

        // Add subject column if not exists
        $conn->query("ALTER TABLE messages ADD COLUMN IF NOT EXISTS subject VARCHAR(255) NOT NULL DEFAULT ''");

        $stmt = $conn->prepare(
            "INSERT INTO messages (name, email, subject, message, status) VALUES (?, ?, ?, ?, 'Unread')"
        );
        $stmt->bind_param('ssss', $name, $email, $subject, $message);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(['status' => 'success', 'message' => 'Your message has been sent to our clinic team.']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to send message.']);
        }
        $stmt->close();
        $conn->close();
        break;

    // ── 4. POST ?route=club ───────────────────────────────────────────────────
    case 'club':
        if ($method !== 'POST') { method_not_allowed(); break; }
        $conn = get_db();

        $email = $body['email'] ?? '';
        $name  = $body['name']  ?? '';
        $phone = $body['phone'] ?? '';

        // Check for duplicate email
        $check = $conn->prepare("SELECT id FROM members WHERE email = ?");
        $check->bind_param('s', $email);
        $check->execute();
        $check->store_result();

        if ($check->num_rows > 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'This email is already registered.']);
            $check->close();
            $conn->close();
            break;
        }
        $check->close();

        $member_id = 'M' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5));
        $stmt = $conn->prepare(
            "INSERT INTO members (member_id, name, email, phone) VALUES (?, ?, ?, ?)"
        );
        $stmt->bind_param('ssss', $member_id, $name, $email, $phone);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(['status' => 'success', 'message' => 'Welcome to the Sanctuary Club!']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to join club.']);
        }
        $stmt->close();
        $conn->close();
        break;

    // ── 5. POST ?route=admin/login ────────────────────────────────────────────
    case 'admin/login':
        if ($method !== 'POST') { method_not_allowed(); break; }
        $conn = get_db();

        $username = $body['username'] ?? '';
        $password = $body['password'] ?? '';

        $stmt = $conn->prepare("SELECT password_hash, role FROM admins WHERE username = ?");
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $stmt->bind_result($password_hash, $role);
        $found = $stmt->fetch();
        $stmt->close();
        $conn->close();

        if ($found && password_verify($password, $password_hash)) {
            echo json_encode(['status' => 'success', 'message' => 'Login verified', 'role' => $role]);
        } else {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Invalid username or password']);
        }
        break;

    // ── 6. GET ?route=admin/stats ─────────────────────────────────────────────
    case 'admin/stats':
        if ($method !== 'GET') { method_not_allowed(); break; }
        $conn = get_db();

        // Ensure price column exists (migration-safe)
        $conn->query("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL DEFAULT 0.00");
        // Ensure notes column exists
        $conn->query("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT");

        $result = $conn->query(
            "SELECT appointment_id, customer_name, customer_phone,
                    service_category, service_name, booking_date, status,
                    special_request, notes, price, addons, created_at
             FROM appointments ORDER BY created_at DESC"
        );

        $appointments  = [];
        $status_counts = ['Completed' => 0, 'Pending' => 0, 'Cancelled' => 0, 'No-Show' => 0];
        $total         = 0;
        $total_revenue = 0;

        while ($row = $result->fetch_assoc()) {
            $appointments[] = $row;
            $total++;
            $s = $row['status'];
            isset($status_counts[$s]) ? $status_counts[$s]++ : $status_counts[$s] = 1;
            // Count revenue from all non-cancelled, non-no-show appointments
            if ($s !== 'Cancelled' && $s !== 'No-Show') {
                // Use stored price (already includes addons); fall back to price map for legacy
                $appt_price = floatval($row['price']);
                if ($appt_price <= 0) {
                    $appt_price = get_service_price($row['service_name']);
                    $addons_arr = json_decode($row['addons'] ?? '[]', true) ?: [];
                    foreach ($addons_arr as $an) $appt_price += get_service_price(trim($an));
                }
                $total_revenue += $appt_price;
            }
        }

        // Build revenue history: group non-cancelled appointments by date
        $revenue_by_date = [];
        foreach ($appointments as $appt) {
            if ($appt['status'] === 'Cancelled' || $appt['status'] === 'No-Show') continue;
            $date = substr($appt['created_at'], 0, 10); // YYYY-MM-DD
            if (!isset($revenue_by_date[$date])) $revenue_by_date[$date] = 0;
            $hist_price = floatval($appt['price']);
            if ($hist_price <= 0) $hist_price = get_service_price($appt['service_name']);
            $revenue_by_date[$date] += $hist_price;
        }
        ksort($revenue_by_date);
        $revenue_history = [];
        $cumulative = 0;
        foreach ($revenue_by_date as $date => $amount) {
            $cumulative += $amount;
            $revenue_history[] = ['date' => $date, 'revenue' => $cumulative];
        }

        $conn->close();
        echo json_encode([
            'status' => 'success',
            'data'   => [
                'total_bookings'      => $total,
                'total_revenue'       => $total_revenue,
                'statuses'            => $status_counts,
                'recent_appointments' => array_slice($appointments, 0, 10),
                'revenue_history'     => $revenue_history,
            ],
        ]);
        break;

    // ── 7. GET ?route=admin/calendar ──────────────────────────────────────────
    case 'admin/calendar':
        if ($method !== 'GET') { method_not_allowed(); break; }
        $conn = get_db();

        $result = $conn->query(
            "SELECT appointment_id, customer_name, service_name,
                    booking_date, status, customer_phone
             FROM appointments"
        );

        $events = [];
        while ($row = $result->fetch_assoc()) {
            $status = $row['status'];
            $color  = '#f59e0b'; // Amber — Pending
            if ($status === 'Completed')                        $color = '#10b981'; // Green
            elseif (in_array($status, ['Cancelled','No-Show'])) $color = '#ef4444'; // Red

            $events[] = [
                'id'              => $row['appointment_id'],
                'title'           => $row['customer_name'] . ' | ' . $row['service_name'],
                'start'           => str_replace(' ', 'T', $row['booking_date']),
                'backgroundColor' => $color,
                'borderColor'     => $color,
                'extendedProps'   => [
                    'status' => $status,
                    'phone'  => $row['customer_phone'],
                ],
            ];
        }

        $conn->close();
        echo json_encode($events);
        break;

    // ── 8. POST ?route=admin/update-appointment ───────────────────────────────
    case 'admin/update-appointment':
        if ($method !== 'POST') { method_not_allowed(); break; }
        $conn = get_db();

        $appointment_id = $body['appointment_id'] ?? '';
        $status = $body['status'] ?? '';
        $notes  = $body['notes']  ?? '';
        // Price is always resolved from the service name map — never trust a manual 0
        $price  = floatval($body['price'] ?? 0);
        if ($price <= 0 && $appointment_id !== '') {
            // Look up service name from DB and resolve from map
            $tmp = $conn->prepare("SELECT service_name FROM appointments WHERE appointment_id = ?");
            $tmp->bind_param('s', $appointment_id);
            $tmp->execute();
            $tmp->bind_result($_svc_name);
            $tmp->fetch();
            $tmp->close();
            if (!empty($_svc_name)) $price = get_service_price($_svc_name);
        }

        if (!$appointment_id || !$status) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Appointment ID and Status are required']);
            $conn->close();
            break;
        }

        // Ensure columns exist
        $conn->query("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL DEFAULT 0.00");
        $conn->query("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT");

        $stmt = $conn->prepare(
            "UPDATE appointments SET status = ?, notes = ?, price = ? WHERE appointment_id = ?"
        );
        $stmt->bind_param('ssds', $status, $notes, $price, $appointment_id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                http_response_code(200);
                echo json_encode(['status' => 'success', 'message' => 'Appointment updated successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Appointment not found']);
            }
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to update appointment']);
        }
        $stmt->close();
        $conn->close();
        break;

    // ── 9. GET ?route=admin/messages ──────────────────────────────────────────
    case 'admin/messages':
        if ($method !== 'GET') { method_not_allowed(); break; }
        $conn = get_db();

        // Ensure subject column exists
        $conn->query("ALTER TABLE messages ADD COLUMN IF NOT EXISTS subject VARCHAR(255) NOT NULL DEFAULT ''");

        $result = $conn->query(
            "SELECT m.id, m.name, m.email, m.subject, m.message, m.status, m.submitted_at AS created_at,
                    r.body AS latest_reply_body, r.sender AS latest_reply_sender, r.sent_at AS latest_reply_at
             FROM messages m
             LEFT JOIN message_replies r ON r.id = (
                 SELECT id FROM message_replies WHERE message_id = m.id ORDER BY sent_at DESC LIMIT 1
             )
             ORDER BY COALESCE(r.sent_at, m.submitted_at) DESC"
        );

        $messages = [];
        while ($row = $result->fetch_assoc()) {
            $messages[] = $row;
        }

        $conn->close();
        echo json_encode([
            'status' => 'success',
            'data' => $messages,
        ]);
        break;


    // ── 10. POST ?route=admin/mark-message-read ───────────────────────────────
    case 'admin/mark-message-read':
        if ($method !== 'POST') { method_not_allowed(); break; }
        $conn = get_db();
        $id = $body['id'] ?? 0;
        $stmt = $conn->prepare("UPDATE messages SET status = 'Read' WHERE id = ?");
        $stmt->bind_param('i', $id);
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to update message.']);
        }
        $stmt->close();
        $conn->close();
        break;

    // ── 11. GET ?route=admin/replies&message_id=X ────────────────────────────
    case 'admin/replies':
        if ($method !== 'GET') { method_not_allowed(); break; }
        $conn = get_db();
        // Ensure replies table exists
        $conn->query("CREATE TABLE IF NOT EXISTS message_replies (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            message_id INT NOT NULL,
            sender     VARCHAR(20) NOT NULL DEFAULT 'admin',
            body       TEXT NOT NULL,
            sent_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        $mid = intval($_GET['message_id'] ?? 0);
        // Fetch replies, excluding client-sender entries whose body exactly matches
        // the original message (prevents contact-form message appearing twice).
        $stmt = $conn->prepare(
            "SELECT r.id, r.message_id, r.sender, r.body, r.sent_at
               FROM message_replies r
               JOIN messages m ON m.id = r.message_id
              WHERE r.message_id = ?
                AND NOT (r.sender = 'client' AND TRIM(r.body) = TRIM(m.message))
              ORDER BY r.sent_at ASC"
        );
        $stmt->bind_param('i', $mid);
        $stmt->execute();
        $result = $stmt->get_result();
        $rows = [];
        while ($row = $result->fetch_assoc()) $rows[] = $row;
        $stmt->close();
        $conn->close();
        echo json_encode(['status' => 'success', 'data' => $rows]);
        break;

    // ── 12. POST ?route=admin/reply ──────────────────────────────────────────
    case 'admin/reply':
        if ($method !== 'POST') { method_not_allowed(); break; }
        $conn = get_db();
        $conn->query("CREATE TABLE IF NOT EXISTS message_replies (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            message_id INT NOT NULL,
            sender     VARCHAR(20) NOT NULL DEFAULT 'admin',
            body       TEXT NOT NULL,
            sent_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        $message_id = intval($body['message_id'] ?? 0);
        $reply_body = $body['body'] ?? '';
        $client_email = $body['client_email'] ?? '';
        $client_name  = $body['client_name'] ?? '';
        $provider     = $body['provider'] ?? 'gmail'; // 'gmail' or 'yahoo'

        if (!$message_id || !$reply_body) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing message_id or body.']);
            break;
        }

        // Save admin reply to DB
        $sender = 'admin';
        $stmt = $conn->prepare("INSERT INTO message_replies (message_id, sender, body) VALUES (?, ?, ?)");
        $stmt->bind_param('iss', $message_id, $sender, $reply_body);
        $stmt->execute();
        $stmt->close();
        $conn->close();

        // Send email via PHP mail()
        // Reply-To uses subaddress trick: reply+{message_id}@lets-g-aesthetics.site
        // cPanel pipes mail to that address into email_pipe.php, which stores the reply in the DB.
        $domain   = "lets-g-aesthetics.site";
        // From must be a real mailbox on this server for SPF/DKIM to pass and avoid spam.
        // Reply-To is reply+{id}@ so client replies are piped back to email_pipe.php.
        $from     = "noreply@{$domain}";
        $replyTo  = "reply+{$message_id}@{$domain}";
        $fromName = "Let's G Aesthetic & Wellness";

        $htmlBody = nl2br(htmlspecialchars($reply_body));
        $boundary = md5(uniqid('', true));

        // Embed message_id in Message-ID header so it survives in client's In-Reply-To/References
        $custom_message_id = "<letsg-msg-{$message_id}@{$domain}>";

        $headers  = "From: {$fromName} <{$from}>\r\n";
        $headers .= "Reply-To: {$fromName} <{$replyTo}>\r\n";
        $headers .= "Message-ID: {$custom_message_id}\r\n";
        $headers .= "X-LetsG-MessageID: {$message_id}\r\n";   // extra fallback header
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();

        $plainBody  = $reply_body . "\r\n\r\n";
        $plainBody .= "──────────────────────────────\r\n";
        $plainBody .= "Reply above this line to respond.\r\n";
        $plainBody .= "Let's G Aesthetic & Wellness Services\r\n";

        $body  = "--{$boundary}\r\n";
        $body .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
        $body .= $plainBody . "\r\n";
        $body .= "--{$boundary}\r\n";
        $body .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
        $body .= "<html><body style='font-family:sans-serif;color:#222;line-height:1.6;'>";
        $body .= "<p>{$htmlBody}</p>";
        $body .= "<hr style='border:none;border-top:1px solid #eee;margin:24px 0;'>";
        $body .= "<p style='font-size:11px;color:#aaa;'>Reply directly to this email to respond — your reply will appear in our system automatically.</p>";
        $body .= "<p style='font-size:12px;color:#888;'>— Let's G Aesthetic &amp; Wellness Services</p>";
        $body .= "</body></html>\r\n";
        $body .= "--{$boundary}--";

        $toLine = "{$client_name} <{$client_email}>";
        $sent = mail($toLine, "Re: Your message to Let's G Aesthetic & Wellness", $body, $headers);

        echo json_encode([
            'status'     => 'success',
            'email_sent' => $sent,
            'message'    => $sent ? 'Reply saved and email sent.' : 'Reply saved. Email delivery may be delayed.'
        ]);
        break;

    // ── 13b. POST ?route=admin/client-reply ── email webhook / pipe ─────────────
    // Called by email_pipe.php (same server, no secret needed) OR
    // externally with secret for security.
    // Body: { message_id, body, secret? }
    case 'admin/client-reply':
        if ($method !== 'POST') { method_not_allowed(); break; }
        $secret = $body['secret'] ?? '';
        $is_local = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1', 'localhost']);
        // Allow local calls (from email_pipe.php) without secret; require secret for remote calls
        if (!$is_local && $secret !== 'LETSG_WEBHOOK_SECRET') {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Forbidden.']);
            break;
        }
        $conn = get_db();
        $conn->query("CREATE TABLE IF NOT EXISTS message_replies (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            message_id INT NOT NULL,
            sender     VARCHAR(20) NOT NULL DEFAULT 'admin',
            body       TEXT NOT NULL,
            sent_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        $message_id = intval($body['message_id'] ?? 0);
        $reply_body = trim($body['body'] ?? '');
        if (!$message_id || !$reply_body) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing message_id or body.']);
            $conn->close();
            break;
        }
        $sender = 'client';
        $stmt = $conn->prepare("INSERT INTO message_replies (message_id, sender, body) VALUES (?, ?, ?)");
        $stmt->bind_param('iss', $message_id, $sender, $reply_body);
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Client reply stored.']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to store reply.']);
        }
        $stmt->close();
        $conn->close();
        break;

    // ── 13c. GET ?route=admin/pipe-test ── diagnose email pipe setup ──────────
    // Visit this URL in browser to check if the pipe DB connection works
    case 'admin/pipe-test':
        if ($method !== 'GET') { method_not_allowed(); break; }
        $conn = get_db();
        $conn->query("CREATE TABLE IF NOT EXISTS message_replies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            message_id INT NOT NULL,
            sender VARCHAR(20) NOT NULL DEFAULT 'admin',
            body TEXT NOT NULL,
            sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        // Count existing client replies
        $r = $conn->query("SELECT COUNT(*) as cnt, MAX(sent_at) as last FROM message_replies WHERE sender='client'");
        $row = $r->fetch_assoc();
        // Check message_replies table exists
        $tables = [];
        $tr = $conn->query("SHOW TABLES LIKE 'message_replies'");
        $table_exists = ($tr->num_rows > 0);
        $conn->close();
        echo json_encode([
            'status' => 'success',
            'pipe_db_ok' => true,
            'message_replies_table_exists' => $table_exists,
            'client_reply_count' => intval($row['cnt']),
            'last_client_reply' => $row['last'],
            'note' => 'If client_reply_count is 0 but clients are replying, the email pipe is not delivering to the DB. Check cPanel forwarder and pipe path.'
        ]);
        break;

    // ── 13. POST ?route=admin/reset ───────────────────────────────────────────
    case 'admin/reset':
        if ($method !== 'POST') { method_not_allowed(); break; }
        $conn = get_db();
        $errors = [];
        foreach (['appointments', 'messages', 'message_replies', 'members'] as $table) {
            if (!$conn->query("DELETE FROM `$table`")) {
                $errors[] = $table;
            }
        }
        $conn->close();
        if (empty($errors)) {
            echo json_encode(['status' => 'success', 'message' => 'All data has been reset.']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to reset: ' . implode(', ', $errors)]);
        }
        break;

    // ── 404 fallback ──────────────────────────────────────────────────────────
    default:
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => "Unknown route: '$route'"]);
        break;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function method_not_allowed(): void {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
}