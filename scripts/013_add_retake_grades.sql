-- Add "Recuperatorio" grades for Examen 1-4
-- exam_number 7-10 = Recuperatorio de Examen 1-4 (exam_number + 6)

ALTER TABLE public.grades
DROP CONSTRAINT IF EXISTS grades_exam_number_check;

ALTER TABLE public.grades
ADD CONSTRAINT grades_exam_number_check CHECK (exam_number >= 1 AND exam_number <= 10);
