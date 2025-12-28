-- Safe Migration to update existing scheduled_tests table
-- This migration handles existing columns gracefully and prevents errors
-- Created: 2025-12-28
-- Purpose: Add missing columns that backend code expects

-- =============================================================================
-- STEP 1: Add new columns safely (will skip if already exists)
-- =============================================================================

-- Add test_type column
ALTER TABLE scheduled_tests 
ADD COLUMN IF NOT EXISTS test_type VARCHAR(50) DEFAULT 'NEST' 
COMMENT 'Exam type: IAT, NEST, ISI';

-- Add start_time column (new standardized name)
ALTER TABLE scheduled_tests 
ADD COLUMN IF NOT EXISTS start_time TIME DEFAULT '10:00:00' 
COMMENT 'Test start time';

-- Add duration_minutes column (new standardized name)
ALTER TABLE scheduled_tests 
ADD COLUMN IF NOT EXISTS duration_minutes INT NOT NULL DEFAULT 180 
COMMENT 'Test duration in minutes';

-- Add subjects column (new standardized name)
ALTER TABLE scheduled_tests 
ADD COLUMN IF NOT EXISTS subjects VARCHAR(255) DEFAULT 'Physics, Chemistry, Mathematics' 
COMMENT 'Comma-separated list of subjects';

-- Add total_marks column if missing
ALTER TABLE scheduled_tests 
ADD COLUMN IF NOT EXISTS total_marks INT DEFAULT 100 
COMMENT 'Total marks for the test';

-- Add description column if missing
ALTER TABLE scheduled_tests 
ADD COLUMN IF NOT EXISTS description TEXT 
COMMENT 'Test description or instructions';

-- Add total_questions column if missing
ALTER TABLE scheduled_tests 
ADD COLUMN IF NOT EXISTS total_questions INT DEFAULT 0 
COMMENT 'Total number of questions in the test';

-- Add status column if missing
ALTER TABLE scheduled_tests 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'scheduled' 
COMMENT 'Test status: scheduled, active, completed, cancelled';

-- =============================================================================
-- STEP 2: Migrate data from old columns to new columns (if old columns exist)
-- =============================================================================

-- Copy exam_time to start_time if exam_time exists and start_time is default
UPDATE scheduled_tests 
SET start_time = exam_time 
WHERE EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'scheduled_tests' 
    AND COLUMN_NAME = 'exam_time'
    AND TABLE_SCHEMA = DATABASE()
)
AND start_time = '10:00:00';

-- Copy duration to duration_minutes if duration exists and duration_minutes is default
UPDATE scheduled_tests 
SET duration_minutes = duration 
WHERE EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'scheduled_tests' 
    AND COLUMN_NAME = 'duration'
    AND TABLE_SCHEMA = DATABASE()
)
AND duration_minutes = 180;

-- Copy sections to subjects if sections exists and subjects is default
UPDATE scheduled_tests 
SET subjects = sections 
WHERE EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'scheduled_tests' 
    AND COLUMN_NAME = 'sections'
    AND TABLE_SCHEMA = DATABASE()
)
AND subjects = 'Physics, Chemistry, Mathematics';

-- =============================================================================
-- STEP 3: Add indexes safely
-- =============================================================================

-- Create index on test_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_test_type ON scheduled_tests (test_type);

-- Create index on exam_date for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_exam_date ON scheduled_tests (exam_date);

-- Create index on status for faster status-based queries
CREATE INDEX IF NOT EXISTS idx_status ON scheduled_tests (status);

-- Create unique index on test_id to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS unique_test_id ON scheduled_tests (test_id);

-- =============================================================================
-- STEP 4: Clean up old columns (optional, commented out for safety)
-- =============================================================================
-- Uncomment these lines after verifying data migration was successful

-- ALTER TABLE scheduled_tests DROP COLUMN IF EXISTS exam_time;
-- ALTER TABLE scheduled_tests DROP COLUMN IF EXISTS duration;
-- ALTER TABLE scheduled_tests DROP COLUMN IF EXISTS sections;

-- =============================================================================
-- VERIFICATION QUERIES (for manual checking after migration)
-- =============================================================================

-- Check table structure
-- SHOW COLUMNS FROM scheduled_tests;

-- Check indexes
-- SHOW INDEX FROM scheduled_tests;

-- Verify data migration
-- SELECT test_id, test_name, exam_date, start_time, duration_minutes, subjects, status 
-- FROM scheduled_tests LIMIT 5;

-- Count total records
-- SELECT COUNT(*) as total_tests FROM scheduled_tests;

-- =============================================================================
-- ROLLBACK PROCEDURE (in case of issues)
-- =============================================================================
/*
To rollback this migration:

1. If you haven't dropped old columns:
   - Just recreate the old column names
   - Copy data back from new columns

2. If you dropped old columns:
   ALTER TABLE scheduled_tests ADD COLUMN exam_time TIME;
   ALTER TABLE scheduled_tests ADD COLUMN duration INT;
   ALTER TABLE scheduled_tests ADD COLUMN sections VARCHAR(255);
   
   UPDATE scheduled_tests SET exam_time = start_time;
   UPDATE scheduled_tests SET duration = duration_minutes;
   UPDATE scheduled_tests SET sections = subjects;
   
3. Drop new columns:
   ALTER TABLE scheduled_tests DROP COLUMN test_type;
   ALTER TABLE scheduled_tests DROP COLUMN start_time;
   ALTER TABLE scheduled_tests DROP COLUMN duration_minutes;
   ALTER TABLE scheduled_tests DROP COLUMN subjects;
   ALTER TABLE scheduled_tests DROP COLUMN total_marks;
   ALTER TABLE scheduled_tests DROP COLUMN description;
   ALTER TABLE scheduled_tests DROP COLUMN total_questions;
   ALTER TABLE scheduled_tests DROP COLUMN status;
   
4. Drop indexes:
   DROP INDEX IF EXISTS idx_test_type ON scheduled_tests;
   DROP INDEX IF EXISTS idx_exam_date ON scheduled_tests;
   DROP INDEX IF EXISTS idx_status ON scheduled_tests;
   DROP INDEX IF EXISTS unique_test_id ON scheduled_tests;
*/

-- Migration completed successfully
SELECT 'Migration completed successfully! ✅' as status;