-- Politicas RLS mas permisivas para testing inicial
-- Permite a cualquier usuario autenticado realizar CRUD en todas las tablas

-- Eliminar politicas restrictivas de students
DROP POLICY IF EXISTS "students_insert_staff" ON public.students;
DROP POLICY IF EXISTS "students_update_staff" ON public.students;
DROP POLICY IF EXISTS "students_delete_admin" ON public.students;
DROP POLICY IF EXISTS "students_insert_authenticated" ON public.students;
DROP POLICY IF EXISTS "students_update_authenticated" ON public.students;
DROP POLICY IF EXISTS "students_delete_authenticated" ON public.students;

-- Crear politicas permisivas para students
CREATE POLICY "students_insert_authenticated" ON public.students 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "students_update_authenticated" ON public.students 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "students_delete_authenticated" ON public.students 
  FOR DELETE TO authenticated USING (true);

-- Eliminar politicas restrictivas de courses
DROP POLICY IF EXISTS "courses_insert_staff" ON public.courses;
DROP POLICY IF EXISTS "courses_update_staff" ON public.courses;
DROP POLICY IF EXISTS "courses_delete_admin" ON public.courses;
DROP POLICY IF EXISTS "courses_insert_authenticated" ON public.courses;
DROP POLICY IF EXISTS "courses_update_authenticated" ON public.courses;
DROP POLICY IF EXISTS "courses_delete_authenticated" ON public.courses;

-- Crear politicas permisivas para courses
CREATE POLICY "courses_insert_authenticated" ON public.courses 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "courses_update_authenticated" ON public.courses 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "courses_delete_authenticated" ON public.courses 
  FOR DELETE TO authenticated USING (true);

-- Eliminar politicas restrictivas de attendance
DROP POLICY IF EXISTS "attendance_insert_staff" ON public.attendance;
DROP POLICY IF EXISTS "attendance_update_staff" ON public.attendance;
DROP POLICY IF EXISTS "attendance_insert_authenticated" ON public.attendance;
DROP POLICY IF EXISTS "attendance_update_authenticated" ON public.attendance;
DROP POLICY IF EXISTS "attendance_delete_authenticated" ON public.attendance;

-- Crear politicas permisivas para attendance
CREATE POLICY "attendance_insert_authenticated" ON public.attendance 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "attendance_update_authenticated" ON public.attendance 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "attendance_delete_authenticated" ON public.attendance 
  FOR DELETE TO authenticated USING (true);

-- Eliminar politicas restrictivas de grades
DROP POLICY IF EXISTS "grades_insert_staff" ON public.grades;
DROP POLICY IF EXISTS "grades_update_staff" ON public.grades;
DROP POLICY IF EXISTS "grades_insert_authenticated" ON public.grades;
DROP POLICY IF EXISTS "grades_update_authenticated" ON public.grades;
DROP POLICY IF EXISTS "grades_delete_authenticated" ON public.grades;

-- Crear politicas permisivas para grades
CREATE POLICY "grades_insert_authenticated" ON public.grades 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "grades_update_authenticated" ON public.grades 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "grades_delete_authenticated" ON public.grades 
  FOR DELETE TO authenticated USING (true);

-- Eliminar politicas restrictivas de reports
DROP POLICY IF EXISTS "reports_insert_staff" ON public.reports;
DROP POLICY IF EXISTS "reports_update_staff" ON public.reports;
DROP POLICY IF EXISTS "reports_insert_authenticated" ON public.reports;
DROP POLICY IF EXISTS "reports_update_authenticated" ON public.reports;
DROP POLICY IF EXISTS "reports_delete_authenticated" ON public.reports;

-- Crear politicas permisivas para reports
CREATE POLICY "reports_insert_authenticated" ON public.reports 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "reports_update_authenticated" ON public.reports 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "reports_delete_authenticated" ON public.reports 
  FOR DELETE TO authenticated USING (true);

-- Eliminar politicas restrictivas de communications
DROP POLICY IF EXISTS "communications_insert_staff" ON public.communications;
DROP POLICY IF EXISTS "communications_insert_authenticated" ON public.communications;
DROP POLICY IF EXISTS "communications_update_authenticated" ON public.communications;
DROP POLICY IF EXISTS "communications_delete_authenticated" ON public.communications;

-- Crear politicas permisivas para communications
CREATE POLICY "communications_insert_authenticated" ON public.communications 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "communications_update_authenticated" ON public.communications 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "communications_delete_authenticated" ON public.communications 
  FOR DELETE TO authenticated USING (true);

-- Eliminar politicas restrictivas de payments
DROP POLICY IF EXISTS "payments_insert_staff" ON public.payments;
DROP POLICY IF EXISTS "payments_update_staff" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_authenticated" ON public.payments;
DROP POLICY IF EXISTS "payments_update_authenticated" ON public.payments;
DROP POLICY IF EXISTS "payments_delete_authenticated" ON public.payments;

-- Crear politicas permisivas para payments
CREATE POLICY "payments_insert_authenticated" ON public.payments 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "payments_update_authenticated" ON public.payments 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "payments_delete_authenticated" ON public.payments 
  FOR DELETE TO authenticated USING (true);

-- Politicas para payment_concepts
DROP POLICY IF EXISTS "payment_concepts_insert_staff" ON public.payment_concepts;
DROP POLICY IF EXISTS "payment_concepts_update_staff" ON public.payment_concepts;
DROP POLICY IF EXISTS "payment_concepts_select_all" ON public.payment_concepts;
DROP POLICY IF EXISTS "payment_concepts_insert_authenticated" ON public.payment_concepts;
DROP POLICY IF EXISTS "payment_concepts_update_authenticated" ON public.payment_concepts;
DROP POLICY IF EXISTS "payment_concepts_delete_authenticated" ON public.payment_concepts;

CREATE POLICY "payment_concepts_select_all" ON public.payment_concepts 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "payment_concepts_insert_authenticated" ON public.payment_concepts 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "payment_concepts_update_authenticated" ON public.payment_concepts 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "payment_concepts_delete_authenticated" ON public.payment_concepts 
  FOR DELETE TO authenticated USING (true);
