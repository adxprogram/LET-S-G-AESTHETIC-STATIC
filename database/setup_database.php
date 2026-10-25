<?php
/**
 * setup_database.php — Run this ONCE to create tables and seed initial data.
 * Replaces database.py (MongoDB Atlas setup script).
 *
 * Usage: php setup_database.php   OR   visit http://localhost/database/setup_database.php
 *
 * For safety this script will NOT overwrite existing tables/data.
 */

require_once __DIR__ . '/config.php';

// Override JSON header for CLI-friendly output
$is_cli = php_sapi_name() === 'cli';

function log_msg(string $msg): void {
    global $is_cli;
    echo $is_cli ? $msg . PHP_EOL : "<p>$msg</p>";
}

$conn = get_db();
log_msg("Connected to MySQL database '" . DB_NAME . "' successfully.");

// ── 1. SERVICES ────────────────────────────────────────────────
$conn->query("CREATE TABLE IF NOT EXISTS services (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    category_id VARCHAR(5)   NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT         NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
log_msg("Table 'services' ready.");

// Only seed if empty
$result = $conn->query("SELECT COUNT(*) AS cnt FROM services");
if ($result->fetch_assoc()['cnt'] == 0) {
    $services = [
        ['01', 'Facial Treatments',    'Clinical care, peels, carbon & CO2 lasers.'],
        ['02', 'Wellness & Massage',   'Traditional therapies, Hotstone, & Ventosa.'],
        ['03', 'Brows & Lashes',       'Microblading, extensions, & lip tints.'],
        ['04', 'Hair & Scalp Care',    'Japanese Headspa packages, color & styling.'],
        ['05', 'Skin Repair',          'Exosomes, Derma Pen, & cellular renewal.'],
        ['06', 'Laser & Hair Removal', 'Pico Whitening & Diode Laser sessions.'],
        ['07', 'Slimming & Contouring','HIFU, Exilis, Meso Lipo & Slimming Bed.'],
        ['08', 'Nail Care Services',   'Gel polish, extensions, & creative nail art.'],
        ['09', 'Gluta Drips & Vitamins','Beauty pushes, IV drips & wellness add-ons.'],
        ['10', 'Warts & Skintag',      'Cauterize and laser removal treatments.'],
    ];
    $stmt = $conn->prepare("INSERT INTO services (category_id, name, description) VALUES (?, ?, ?)");
    foreach ($services as [$cid, $name, $desc]) {
        $stmt->bind_param('sss', $cid, $name, $desc);
        $stmt->execute();
    }
    $stmt->close();
    log_msg("Inserted " . count($services) . " service categories.");
} else {
    log_msg("Services already seeded — skipped.");
}

// ── 2. APPOINTMENTS ────────────────────────────────────────────
$conn->query("CREATE TABLE IF NOT EXISTS appointments (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id   VARCHAR(10)  NOT NULL UNIQUE,
    customer_name    VARCHAR(255) NOT NULL,
    customer_phone   VARCHAR(30)  NOT NULL,
    service_category VARCHAR(255) NOT NULL,
    service_name     VARCHAR(255) NOT NULL,
    booking_date     DATETIME     NOT NULL,
    status           VARCHAR(30)  NOT NULL DEFAULT 'Pending',
    special_request  TEXT,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
log_msg("Table 'appointments' ready.");

// ── 3. MEMBERS ─────────────────────────────────────────────────
$conn->query("CREATE TABLE IF NOT EXISTS members (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(10)  NOT NULL UNIQUE,
    name      VARCHAR(255) NOT NULL,
    email     VARCHAR(255) NOT NULL UNIQUE,
    phone     VARCHAR(30)  NOT NULL,
    join_date DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
log_msg("Table 'members' ready.");

// ── 4. MESSAGES (contact form) ─────────────────────────────────
$conn->query("CREATE TABLE IF NOT EXISTS messages (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    email        VARCHAR(255) NOT NULL,
    message      TEXT         NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'Unread',
    submitted_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
log_msg("Table 'messages' ready.");

// ── 5. ADMINS ──────────────────────────────────────────────────
$conn->query("CREATE TABLE IF NOT EXISTS admins (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL DEFAULT 'Owner'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
log_msg("Table 'admins' ready.");

// Seed default admin only if none exists
$result = $conn->query("SELECT COUNT(*) AS cnt FROM admins");
if ($result->fetch_assoc()['cnt'] == 0) {
    // password_hash() uses bcrypt — same algorithm as werkzeug's generate_password_hash
    $hash = password_hash('admin123', PASSWORD_BCRYPT);
    $stmt = $conn->prepare("INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)");
    $username = 'owner';
    $role     = 'Owner';
    $stmt->bind_param('sss', $username, $hash, $role);
    $stmt->execute();
    $stmt->close();
    log_msg("Created default admin account (Username: owner | Password: admin123)");
} else {
    log_msg("Admin account already exists — skipped.");
}

$conn->close();
log_msg("Database initialisation complete! Tables ready: services, appointments, members, messages, admins.");
