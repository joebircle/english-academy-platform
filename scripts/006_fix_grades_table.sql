-- Fix grades table - add missing exam_number column
ALTER TABLE public.grades 
ADD COLUMN IF NOT EXISTS exam_number integer DEFAULT 1;

-- Update constraint if needed
ALTER TABLE public.grades 
DROP CONSTRAINT IF EXISTS grades_exam_number_check;

ALTER TABLE public.grades 
ADD CONSTRAINT grades_exam_number_check 
CHECK (exam_number >= 1 AND exam_number <= 4);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_grades_exam_number ON public.grades(exam_number);
CREATE INDEX IF NOT EXISTS idx_grades_student_course ON public.grades(student_id, course_id);
