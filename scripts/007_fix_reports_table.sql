-- Fix reports table - add missing columns
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS semester INTEGER DEFAULT 1 CHECK (semester IN (1, 2));
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS year INTEGER DEFAULT EXTRACT(YEAR FROM NOW());
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS period TEXT;

-- Update period based on semester and year
UPDATE public.reports 
SET period = CASE 
  WHEN semester = 1 THEN 'Primer Semestre ' || year
  ELSE 'Segundo Semestre ' || year
END
WHERE period IS NULL;
