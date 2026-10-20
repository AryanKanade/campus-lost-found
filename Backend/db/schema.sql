CREATE DATABASE IF NOT EXISTS campus_lost_found;

USE campus_lost_found;

CREATE TABLE IF NOT EXISTS item_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,

    report_type ENUM('LOST', 'FOUND') NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    category VARCHAR(60) NOT NULL,
    item_date DATE NOT NULL,
    location VARCHAR(150) NOT NULL,
    description TEXT,

    contact_name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(254),
    contact_phone VARCHAR(25),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_report_type (report_type),
    INDEX idx_category (category),
    INDEX idx_location (location)
);