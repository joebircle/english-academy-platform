-- Academia Manager Database Schema
-- Esquema completo para gestion academica y financiera

-- Tabla de perfiles de usuario (secretaria, profesor, padre)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'secretaria', 'profesor', 'padre')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  schedule TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id),
  max_students INTEGER DEFAULT 15,
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de alumnos
CREATE TABLE IF NOT EXISTS public.students (
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

-- Tabla de asistencia
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('presente', 'ausente', 'tardanza', 'justificado')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Tabla de calificaciones (4 examenes por año)
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  exam_number INTEGER NOT NULL CHECK (exam_number BETWEEN 1 AND 4),
  score DECIMAL(4,2) CHECK (score >= 0 AND score <= 10),
  date DATE,
  notes TEXT,
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id, exam_number, year)
);

-- Tabla de informes semestrales (2 por año)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  content TEXT,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'borrador', 'finalizado', 'entregado')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id, semester, year)
);

-- Tabla de comunicaciones
CREATE TABLE IF NOT EXISTS public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'urgente', 'recordatorio', 'evento')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'pagado', 'vencido')),
  payment_date DATE,
  payment_method TEXT CHECK (payment_method IN ('efectivo', 'transferencia', 'tarjeta')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, month, year)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Politicas RLS para profiles
CREATE POLICY "profiles_select_authenticated" ON public.profiles 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Politicas RLS para courses (lectura para todos autenticados, escritura para admin/secretaria)
CREATE POLICY "courses_select_authenticated" ON public.courses 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "courses_insert_staff" ON public.courses 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'secretaria')));
CREATE POLICY "courses_update_staff" ON public.courses 
  FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'secretaria')));
CREATE POLICY "courses_delete_admin" ON public.courses 
  FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Politicas RLS para students
CREATE POLICY "students_select_authenticated" ON public.students 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "students_insert_staff" ON public.students 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'secretaria')));
CREATE POLICY "students_update_staff" ON public.students 
  FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'secretaria', 'profesor')));
CREATE POLICY "students_delete_admin" ON public.students 
  FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Politicas RLS para attendance
CREATE POLICY "attendance_select_authenticated" ON public.attendance 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "attendance_insert_staff" ON public.attendance 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'secretaria', 'profesor')));
CREATE POLICY "attendance_update_staff" ON public.attendance 
  FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'secretaria', 'profesor')));

-- Politicas RLS para grades
CREATE POLICY "grades_select_authenticated" ON public.grades 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "grades_insert_staff" ON public.grades 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'secretaria', 'profesor')));
CREATE POLICY "grades_update_staff" ON public.grades 
  FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'secretaria', 'profesor')));

-- Politicas RLS para reports
CREATE POLICY "reports_select_authenticated" ON public.reports 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "reports_insert_staff" ON public.reports 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'secretaria', 'profesor')));
CREATE POLICY "reports_update_staff" ON public.reports 
  FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'secretaria', 'profesor')));

-- Politicas RLS para communications
CREATE POLICY "communications_select_authenticated" ON public.communications 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "communications_insert_staff" ON public.communications 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'secretaria', 'profesor')));

-- Politicas RLS para payments
CREATE POLICY "payments_select_authenticated" ON public.payments 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "payments_insert_staff" ON public.payments 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'secretaria')));
CREATE POLICY "payments_update_staff" ON public.payments 
  FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'secretaria')));

-- Trigger para crear perfil automaticamente al registrarse
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

-- Indices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_students_course ON public.students(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_grades_student ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
