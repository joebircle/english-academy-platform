-- Reset policies and recreate schema safely
-- Handles case where tables/policies may or may not exist

-- Drop all existing policies safely (ignores errors if table doesn't exist)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS public.payment_concepts CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.communications CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.grades CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create tables fresh
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'secretaria' CHECK (role IN ('admin', 'secretaria', 'profesor', 'padre')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  schedule TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id),
  teacher_name TEXT,
  max_students INTEGER DEFAULT 15,
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  tutor_name TEXT,
  tutor_phone TEXT,
  tutor_email TEXT,
  address TEXT,
  notes TEXT,
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'baja')),
  enrollment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('presente', 'ausente', 'tardanza', 'justificado')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  exam_number INTEGER NOT NULL CHECK (exam_number >= 1 AND exam_number <= 6),
  score DECIMAL(5,2) CHECK (score >= 0 AND score <= 100),
  date DATE,
  notes TEXT,
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id, exam_number, year)
);

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  period TEXT,
  content TEXT,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'borrador', 'finalizado', 'entregado')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id, semester, year)
);

CREATE TABLE public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'urgente', 'recordatorio', 'evento')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.payment_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  default_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  concept_id UUID REFERENCES public.payment_concepts(id),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'pagado', 'vencido')),
  payment_date DATE,
  payment_method TEXT CHECK (payment_method IN ('efectivo', 'transferencia', 'tarjeta', 'mercadopago', 'debito', 'credito')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, month, year)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_concepts ENABLE ROW LEVEL SECURITY;

-- Permissive policies
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (true);

CREATE POLICY "courses_select" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "courses_insert" ON public.courses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "courses_update" ON public.courses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "courses_delete" ON public.courses FOR DELETE TO authenticated USING (true);

CREATE POLICY "students_select" ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY "students_insert" ON public.students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "students_update" ON public.students FOR UPDATE TO authenticated USING (true);
CREATE POLICY "students_delete" ON public.students FOR DELETE TO authenticated USING (true);

CREATE POLICY "attendance_select" ON public.attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "attendance_insert" ON public.attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "attendance_update" ON public.attendance FOR UPDATE TO authenticated USING (true);

CREATE POLICY "grades_select" ON public.grades FOR SELECT TO authenticated USING (true);
CREATE POLICY "grades_insert" ON public.grades FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "grades_update" ON public.grades FOR UPDATE TO authenticated USING (true);

CREATE POLICY "reports_select" ON public.reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "reports_insert" ON public.reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "reports_update" ON public.reports FOR UPDATE TO authenticated USING (true);

CREATE POLICY "communications_select" ON public.communications FOR SELECT TO authenticated USING (true);
CREATE POLICY "communications_insert" ON public.communications FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "payments_select" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "payments_insert" ON public.payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "payments_update" ON public.payments FOR UPDATE TO authenticated USING (true);

CREATE POLICY "payment_concepts_select" ON public.payment_concepts FOR SELECT TO authenticated USING (true);
CREATE POLICY "payment_concepts_insert" ON public.payment_concepts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "payment_concepts_update" ON public.payment_concepts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "payment_concepts_delete" ON public.payment_concepts FOR DELETE TO authenticated USING (true);

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', null),
    COALESCE(new.raw_user_meta_data ->> 'role', 'secretaria')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX idx_students_course ON public.students(course_id);
CREATE INDEX idx_attendance_student ON public.attendance(student_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_grades_student ON public.grades(student_id);
CREATE INDEX idx_payments_student ON public.payments(student_id);
CREATE INDEX idx_payments_status ON public.payments(status);
