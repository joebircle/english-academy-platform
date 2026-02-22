-- =====================================================
-- MEJORAS DE ESCALABILIDAD - The English Club
-- =====================================================
-- Este script mejora la estructura de la base de datos
-- para permitir escalabilidad y nuevas funcionalidades
-- =====================================================

-- =====================================================
-- 1. TABLA DE PROFESORES (separada de profiles)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  specialization TEXT, -- Ej: "Inglés Niños", "Inglés Adultos", "Preparación Exámenes"
  hire_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'licencia')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar referencia de teacher a courses
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS teacher_ref_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL;

-- =====================================================
-- 2. TABLA DE PERIODOS ACADEMICOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.academic_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- Ej: "Ciclo Lectivo 2026"
  year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year)
);

-- Agregar referencia de periodo a cursos
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS period_id UUID REFERENCES public.academic_periods(id);

-- =====================================================
-- 3. TABLA DE TIPOS DE EXAMENES (flexibilidad)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.exam_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- Ej: "Primer Parcial", "Examen Oral", "Proyecto Final"
  description TEXT,
  weight DECIMAL(3,2) DEFAULT 1.0, -- Peso para promedios ponderados
  order_number INTEGER, -- Orden de aparición
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar tipos de exámenes por defecto
INSERT INTO public.exam_types (name, description, weight, order_number) VALUES
  ('Primer Examen', 'Evaluación del primer bimestre', 1.0, 1),
  ('Segundo Examen', 'Evaluación del segundo bimestre', 1.0, 2),
  ('Tercer Examen', 'Evaluación del tercer bimestre', 1.0, 3),
  ('Cuarto Examen', 'Evaluación del cuarto bimestre', 1.0, 4),
  ('Proyecto/Oral', 'Evaluación oral o proyecto', 1.0, 5),
  ('Examen Final', 'Evaluación final anual', 1.5, 6)
ON CONFLICT DO NOTHING;

-- Agregar referencia de tipo de examen a grades
ALTER TABLE public.grades 
ADD COLUMN IF NOT EXISTS exam_type_id UUID REFERENCES public.exam_types(id);

-- =====================================================
-- 4. TABLA DE HISTORIAL DE INSCRIPCIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.academic_periods(id),
  enrollment_date DATE DEFAULT CURRENT_DATE,
  withdrawal_date DATE,
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'completado', 'retirado', 'transferido')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id, period_id)
);

-- =====================================================
-- 5. TABLA DE DESCUENTOS Y BECAS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Ej: "Hermanos", "Beca Académica", "Convenio Empresa"
  type TEXT NOT NULL CHECK (type IN ('porcentaje', 'monto_fijo')),
  value DECIMAL(10,2) NOT NULL, -- Porcentaje (0-100) o monto fijo
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar referencia de descuento a pagos
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS discount_id UUID REFERENCES public.discounts(id);

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10,2);

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- =====================================================
-- 6. TABLA DE CONFIGURACION DEL SISTEMA
-- =====================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuraciones por defecto
INSERT INTO public.settings (key, value, description) VALUES
  ('school_name', 'The English Club', 'Nombre de la institución'),
  ('school_address', '', 'Dirección de la institución'),
  ('school_phone', '', 'Teléfono de contacto'),
  ('school_email', '', 'Email de contacto'),
  ('default_monthly_fee', '0', 'Cuota mensual por defecto'),
  ('late_payment_days', '10', 'Días de tolerancia para pagos'),
  ('current_period_id', '', 'ID del periodo académico actual')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 7. TABLA DE LOGS DE ACTIVIDAD (auditoría)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. INDICES ADICIONALES PARA RENDIMIENTO
-- =====================================================

-- Indices para teachers
CREATE INDEX IF NOT EXISTS idx_teachers_status ON public.teachers(status);
CREATE INDEX IF NOT EXISTS idx_teachers_email ON public.teachers(email);

-- Indices para academic_periods
CREATE INDEX IF NOT EXISTS idx_periods_year ON public.academic_periods(year);
CREATE INDEX IF NOT EXISTS idx_periods_current ON public.academic_periods(is_current) WHERE is_current = true;

-- Indices para enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);

-- Indices para discounts
CREATE INDEX IF NOT EXISTS idx_discounts_student ON public.discounts(student_id);
CREATE INDEX IF NOT EXISTS idx_discounts_active ON public.discounts(is_active) WHERE is_active = true;

-- Indices para activity_logs
CREATE INDEX IF NOT EXISTS idx_logs_table ON public.activity_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_logs_created ON public.activity_logs(created_at);

-- Indices compuestos para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_payments_student_year ON public.payments(student_id, year);
CREATE INDEX IF NOT EXISTS idx_reports_student_year ON public.reports(student_id, year);

-- =====================================================
-- 9. HABILITAR RLS EN NUEVAS TABLAS
-- =====================================================
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. POLITICAS RLS PERMISIVAS (para desarrollo)
-- =====================================================

-- Teachers
CREATE POLICY "teachers_select_all" ON public.teachers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "teachers_insert_all" ON public.teachers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "teachers_update_all" ON public.teachers FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "teachers_delete_all" ON public.teachers FOR DELETE TO anon, authenticated USING (true);

-- Academic Periods
CREATE POLICY "periods_select_all" ON public.academic_periods FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "periods_insert_all" ON public.academic_periods FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "periods_update_all" ON public.academic_periods FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "periods_delete_all" ON public.academic_periods FOR DELETE TO anon, authenticated USING (true);

-- Exam Types
CREATE POLICY "exam_types_select_all" ON public.exam_types FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "exam_types_insert_all" ON public.exam_types FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "exam_types_update_all" ON public.exam_types FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "exam_types_delete_all" ON public.exam_types FOR DELETE TO anon, authenticated USING (true);

-- Enrollments
CREATE POLICY "enrollments_select_all" ON public.enrollments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "enrollments_insert_all" ON public.enrollments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "enrollments_update_all" ON public.enrollments FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "enrollments_delete_all" ON public.enrollments FOR DELETE TO anon, authenticated USING (true);

-- Discounts
CREATE POLICY "discounts_select_all" ON public.discounts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "discounts_insert_all" ON public.discounts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "discounts_update_all" ON public.discounts FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "discounts_delete_all" ON public.discounts FOR DELETE TO anon, authenticated USING (true);

-- Settings
CREATE POLICY "settings_select_all" ON public.settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings_insert_all" ON public.settings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "settings_update_all" ON public.settings FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "settings_delete_all" ON public.settings FOR DELETE TO anon, authenticated USING (true);

-- Activity Logs
CREATE POLICY "logs_select_all" ON public.activity_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "logs_insert_all" ON public.activity_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- =====================================================
-- 11. FUNCIONES UTILES
-- =====================================================

-- Función para calcular promedio ponderado de un alumno
CREATE OR REPLACE FUNCTION calculate_weighted_average(p_student_id UUID, p_year INTEGER)
RETURNS DECIMAL(4,2) AS $$
DECLARE
  weighted_sum DECIMAL(10,2) := 0;
  total_weight DECIMAL(5,2) := 0;
  avg_result DECIMAL(4,2);
BEGIN
  SELECT 
    COALESCE(SUM(g.score * COALESCE(et.weight, 1)), 0),
    COALESCE(SUM(COALESCE(et.weight, 1)), 0)
  INTO weighted_sum, total_weight
  FROM public.grades g
  LEFT JOIN public.exam_types et ON g.exam_type_id = et.id
  WHERE g.student_id = p_student_id 
    AND g.year = p_year 
    AND g.score IS NOT NULL;
  
  IF total_weight > 0 THEN
    avg_result := weighted_sum / total_weight;
  ELSE
    avg_result := NULL;
  END IF;
  
  RETURN avg_result;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estado de pago de un alumno
CREATE OR REPLACE FUNCTION get_payment_status_summary(p_student_id UUID, p_year INTEGER)
RETURNS TABLE (
  total_paid DECIMAL(10,2),
  total_pending DECIMAL(10,2),
  total_overdue DECIMAL(10,2),
  months_paid INTEGER,
  months_pending INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN status = 'pagado' THEN amount ELSE 0 END), 0) as total_paid,
    COALESCE(SUM(CASE WHEN status = 'pendiente' THEN amount ELSE 0 END), 0) as total_pending,
    COALESCE(SUM(CASE WHEN status = 'vencido' THEN amount ELSE 0 END), 0) as total_overdue,
    COUNT(CASE WHEN status = 'pagado' THEN 1 END)::INTEGER as months_paid,
    COUNT(CASE WHEN status IN ('pendiente', 'vencido') THEN 1 END)::INTEGER as months_pending
  FROM public.payments
  WHERE student_id = p_student_id AND year = p_year;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular asistencia de un alumno
CREATE OR REPLACE FUNCTION get_attendance_stats(p_student_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
  total_classes INTEGER,
  present_count INTEGER,
  absent_count INTEGER,
  late_count INTEGER,
  justified_count INTEGER,
  attendance_percentage DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_classes,
    COUNT(CASE WHEN status = 'presente' THEN 1 END)::INTEGER as present_count,
    COUNT(CASE WHEN status = 'ausente' THEN 1 END)::INTEGER as absent_count,
    COUNT(CASE WHEN status = 'tardanza' THEN 1 END)::INTEGER as late_count,
    COUNT(CASE WHEN status = 'justificado' THEN 1 END)::INTEGER as justified_count,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(CASE WHEN status IN ('presente', 'tardanza', 'justificado') THEN 1 END)::DECIMAL / COUNT(*) * 100), 2)
      ELSE 0 
    END as attendance_percentage
  FROM public.attendance
  WHERE student_id = p_student_id 
    AND date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. TRIGGER PARA UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas con updated_at
DROP TRIGGER IF EXISTS update_teachers_updated_at ON public.teachers;
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_grades_updated_at ON public.grades;
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIN DE MEJORAS DE ESCALABILIDAD
-- =====================================================
