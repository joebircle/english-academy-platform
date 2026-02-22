-- Add teacher_name column to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS teacher_name TEXT;
