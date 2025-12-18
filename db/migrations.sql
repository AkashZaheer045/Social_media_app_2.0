-- ============================================
-- Social Media App - Database Migrations
-- ============================================
-- Generated: 2025-12-16
-- Version: 1.0.0
-- Database: MySQL 8.0+
--
-- INSTRUCTIONS:
-- - Execute migrations in order (by migration number)
-- - Never modify past migrations; only add new ones
-- - Each migration includes UP (apply) and DOWN (rollback) scripts
-- ============================================

-- ============================================
-- Migration 001: Create Roles Table
-- Date: 2025-12-16
-- Description: Base roles table for user permissions
-- ============================================

-- UP
CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` ENUM('superadmin', 'admin', 'user') NOT NULL DEFAULT 'user',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default roles
INSERT INTO `roles` (`id`, `name`) VALUES 
    (1, 'superadmin'),
    (2, 'admin'),
    (3, 'user')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- DOWN (Rollback)
-- DROP TABLE IF EXISTS `roles`;


-- ============================================
-- Migration 002: Create Users Table
-- Date: 2025-12-16
-- Description: Main users table with authentication fields
-- ============================================

-- UP
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL DEFAULT '',
    `profile_image` VARCHAR(255) NULL DEFAULT NULL,
    `email` VARCHAR(255) NOT NULL DEFAULT '',
    `user_name` VARCHAR(255) NULL DEFAULT NULL,
    `phone` VARCHAR(50) NULL DEFAULT NULL,
    `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
    `stripe_customer_id` VARCHAR(255) NULL DEFAULT NULL,
    `passWord` VARCHAR(255) NOT NULL,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `userrole_id` INT UNSIGNED NOT NULL DEFAULT 3,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `users_email_unique` (`email`),
    KEY `users_userrole_id_fk` (`userrole_id`),
    KEY `users_email_idx` (`email`),
    KEY `users_user_name_idx` (`user_name`),
    KEY `users_active_idx` (`active`),
    CONSTRAINT `users_userrole_id_fk` FOREIGN KEY (`userrole_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN (Rollback)
-- DROP TABLE IF EXISTS `users`;


-- ============================================
-- Migration 003: Create Authorizations Table
-- Date: 2025-12-16
-- Description: User authentication tokens and device tracking
-- ============================================

-- UP
CREATE TABLE IF NOT EXISTS `authorizations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `access_token` VARCHAR(255) NULL DEFAULT NULL,
    `refresh_token` VARCHAR(255) NULL DEFAULT NULL,
    `device_type` VARCHAR(100) NULL DEFAULT NULL,
    `device_token` VARCHAR(255) NULL DEFAULT NULL,
    `platform` VARCHAR(50) NULL DEFAULT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `authorizations_user_id_fk` (`user_id`),
    KEY `authorizations_access_token_idx` (`access_token`),
    KEY `authorizations_refresh_token_idx` (`refresh_token`),
    CONSTRAINT `authorizations_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN (Rollback)
-- DROP TABLE IF EXISTS `authorizations`;


-- ============================================
-- Migration 004: Create Posts Table
-- Date: 2025-12-16
-- Description: User posts with media and visibility settings
-- ============================================

-- UP
CREATE TABLE IF NOT EXISTS `posts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `content` TEXT NULL DEFAULT NULL,
    `media_url` VARCHAR(500) NULL DEFAULT NULL,
    `visibility` ENUM('public', 'private') NOT NULL DEFAULT 'public',
    `tags` JSON NULL DEFAULT NULL,
    `likes_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `comments_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deletedAt` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `posts_user_id_fk` (`user_id`),
    KEY `posts_visibility_idx` (`visibility`),
    KEY `posts_created_at_idx` (`createdAt`),
    CONSTRAINT `posts_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN (Rollback)
-- DROP TABLE IF EXISTS `posts`;


-- ============================================
-- Migration 005: Create Comments Table
-- Date: 2025-12-16
-- Description: Comments on posts with nested replies support
-- ============================================

-- UP
CREATE TABLE IF NOT EXISTS `comments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `post_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `parent_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `text` TEXT NOT NULL,
    `likes` BIGINT UNSIGNED NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `comments_post_id_fk` (`post_id`),
    KEY `comments_user_id_fk` (`user_id`),
    KEY `comments_parent_id_fk` (`parent_id`),
    KEY `comments_created_at_idx` (`createdAt`),
    CONSTRAINT `comments_post_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `comments_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `comments_parent_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN (Rollback)
-- DROP TABLE IF EXISTS `comments`;


-- ============================================
-- Migration 006: Create Likes Table
-- Date: 2025-12-16
-- Description: Polymorphic likes for posts and comments
-- ============================================

-- UP
CREATE TABLE IF NOT EXISTS `likes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `target_id` BIGINT UNSIGNED NOT NULL,
    `target_type` ENUM('post', 'comment') NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `likes_unique_user_target` (`user_id`, `target_id`, `target_type`),
    KEY `likes_user_id_fk` (`user_id`),
    KEY `likes_target_idx` (`target_id`, `target_type`),
    CONSTRAINT `likes_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN (Rollback)
-- DROP TABLE IF EXISTS `likes`;


-- ============================================
-- Migration 007: Create Files Table
-- Date: 2025-12-16
-- Description: File uploads with soft delete support
-- ============================================

-- UP
CREATE TABLE IF NOT EXISTS `files` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `originalName` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `size` INT NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `files_user_id_fk` (`user_id`),
    KEY `files_mime_type_idx` (`mimeType`),
    CONSTRAINT `files_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN (Rollback)
-- DROP TABLE IF EXISTS `files`;


-- ============================================
-- Migration 008: Create Temp Tokens Table
-- Date: 2025-12-16
-- Description: Temporary tokens for password reset, email verification, etc.
-- ============================================

-- UP
CREATE TABLE IF NOT EXISTS `temp_tokens` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `userId` INT NULL DEFAULT NULL,
    `token` VARCHAR(255) NULL DEFAULT NULL,
    `expiresAt` DATETIME NULL DEFAULT NULL,
    `used` TINYINT(1) NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `temp_tokens_user_id_idx` (`userId`),
    KEY `temp_tokens_token_idx` (`token`),
    KEY `temp_tokens_expires_at_idx` (`expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN (Rollback)
-- DROP TABLE IF EXISTS `temp_tokens`;


-- ============================================
-- Migration 009: Create Subscriptions Table
-- Date: 2025-12-16
-- Description: Stripe subscription tracking
-- ============================================

-- UP
CREATE TABLE IF NOT EXISTS `subscriptions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `stripe_subscription_id` VARCHAR(255) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `current_period_end` DATETIME NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `subscriptions_user_id_fk` (`user_id`),
    KEY `subscriptions_stripe_id_idx` (`stripe_subscription_id`),
    KEY `subscriptions_status_idx` (`status`),
    CONSTRAINT `subscriptions_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN (Rollback)
-- DROP TABLE IF EXISTS `subscriptions`;


-- ============================================
-- Migration 010: Create Intent Logs Table
-- Date: 2025-12-16
-- Description: Stripe payment intent logging
-- ============================================

-- UP
CREATE TABLE IF NOT EXISTS `intent_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `temp_token` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `intent_logs_user_id_fk` (`user_id`),
    KEY `intent_logs_temp_token_idx` (`temp_token`),
    CONSTRAINT `intent_logs_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN (Rollback)
-- DROP TABLE IF EXISTS `intent_logs`;


-- ============================================
-- Migration 011: Create Webhook Logs Table
-- Date: 2025-12-16
-- Description: Stripe webhook event logging
-- ============================================

-- UP
CREATE TABLE IF NOT EXISTS `whooks_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `event_type` VARCHAR(100) NULL DEFAULT NULL,
    `payload` JSON NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `whooks_logs_user_id_fk` (`user_id`),
    KEY `whooks_logs_event_type_idx` (`event_type`),
    CONSTRAINT `whooks_logs_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN (Rollback)
-- DROP TABLE IF EXISTS `whooks_logs`;


-- ============================================
-- FULL ROLLBACK SCRIPT
-- ============================================
-- Execute in reverse order to completely remove all tables
-- WARNING: This will delete ALL data!
-- ============================================

/*
-- ROLLBACK ALL MIGRATIONS (Execute in order)
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `whooks_logs`;
DROP TABLE IF EXISTS `intent_logs`;
DROP TABLE IF EXISTS `subscriptions`;
DROP TABLE IF EXISTS `temp_tokens`;
DROP TABLE IF EXISTS `files`;
DROP TABLE IF EXISTS `likes`;
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `posts`;
DROP TABLE IF EXISTS `authorizations`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;

SET FOREIGN_KEY_CHECKS = 1;
*/


-- ============================================
-- FUTURE MIGRATIONS
-- ============================================
-- Add new migrations below this line with incrementing numbers
-- Format: Migration XXX: Description

-- Migration 012: Add followers table (TODO)
-- Migration 013: Add notifications table (TODO)
-- Migration 014: Add messages table (TODO)
-- Migration 015: Add stories table (TODO)
