-- Fix grade constraints to match UI expectations
-- UI uses scores 0-100 and exam_number 1-6 (includes Oral/Proyecto and Nota Final)

-- 1. Fix score column: change DECIMAL(4,2) to DECIMAL(5,2) to support values like 100.00
ALTER TABLE public.grades
ALTER COLUMN score TYPE DECIMAL(5,2);

-- 2. Drop old score constraint (0-10) and add new one (0-100)
ALTER TABLE public.grades
DROP CONSTRAINT IF EXISTS grades_score_check;

ALTER TABLE public.grades
ADD CONSTRAINT grades_score_check CHECK (score >= 0 AND score <= 100);

-- 3. Drop old exam_number constraint (1-4) and add new one (1-6)
ALTER TABLE public.grades
DROP CONSTRAINT IF EXISTS grades_exam_number_check;

ALTER TABLE public.grades
ADD CONSTRAINT grades_exam_number_check CHECK (exam_number >= 1 AND exam_number <= 6);

-- 4. Update unique constraint to allow exam_number 5 and 6
-- The existing unique constraint (student_id, course_id, exam_number, year) already supports this
-- No changes needed there
