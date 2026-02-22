-- Actualizar la tabla profiles para soportar los nuevos roles
-- Roles: super_admin, admin, teacher, parent, student

-- Crear enum type para roles si no existe
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'teacher', 'parent', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Agregar columna role si no existe (como text para flexibilidad)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'parent';

-- Agregar columna phone y email
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text;

-- Actualizar constraint para validar roles
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('super_admin', 'admin', 'teacher', 'parent', 'student'));

-- Crear tabla de permisos por rol
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  permission text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(role, permission)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Politica para leer permisos (todos los autenticados pueden ver)
DROP POLICY IF EXISTS "role_permissions_select" ON public.role_permissions;
CREATE POLICY "role_permissions_select" ON public.role_permissions 
  FOR SELECT TO authenticated USING (true);

-- Solo super_admin puede modificar permisos
DROP POLICY IF EXISTS "role_permissions_insert" ON public.role_permissions;
CREATE POLICY "role_permissions_insert" ON public.role_permissions 
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "role_permissions_update" ON public.role_permissions;
CREATE POLICY "role_permissions_update" ON public.role_permissions 
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "role_permissions_delete" ON public.role_permissions;
CREATE POLICY "role_permissions_delete" ON public.role_permissions 
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Insertar permisos por defecto
INSERT INTO public.role_permissions (role, permission) VALUES
  -- Super Admin - todos los permisos
  ('super_admin', 'manage_users'),
  ('super_admin', 'manage_roles'),
  ('super_admin', 'manage_courses'),
  ('super_admin', 'manage_students'),
  ('super_admin', 'manage_attendance'),
  ('super_admin', 'manage_grades'),
  ('super_admin', 'manage_reports'),
  ('super_admin', 'manage_communications'),
  ('super_admin', 'manage_payments'),
  ('super_admin', 'view_all_data'),
  ('super_admin', 'export_data'),
  
  -- Admin - casi todos los permisos excepto gestionar usuarios
  ('admin', 'manage_courses'),
  ('admin', 'manage_students'),
  ('admin', 'manage_attendance'),
  ('admin', 'manage_grades'),
  ('admin', 'manage_reports'),
  ('admin', 'manage_communications'),
  ('admin', 'manage_payments'),
  ('admin', 'view_all_data'),
  ('admin', 'export_data'),
  
  -- Teacher - gestionar asistencia, notas, informes de sus cursos
  ('teacher', 'view_own_courses'),
  ('teacher', 'manage_attendance'),
  ('teacher', 'manage_grades'),
  ('teacher', 'manage_reports'),
  ('teacher', 'send_communications'),
  ('teacher', 'export_data'),
  
  -- Parent - ver datos de sus hijos
  ('parent', 'view_own_children'),
  ('parent', 'view_attendance'),
  ('parent', 'view_grades'),
  ('parent', 'view_reports'),
  ('parent', 'view_communications'),
  ('parent', 'view_payments'),
  
  -- Student - ver sus propios datos
  ('student', 'view_own_data'),
  ('student', 'view_attendance'),
  ('student', 'view_grades'),
  ('student', 'view_reports'),
  ('student', 'view_communications')
ON CONFLICT (role, permission) DO NOTHING;

-- Vincular students con profiles (para rol student)
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Crear indice para buscar estudiantes por user_id
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);

-- Funcion para obtener permisos de un usuario
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid uuid)
RETURNS TABLE(permission text) AS $$
  SELECT rp.permission 
  FROM public.role_permissions rp
  JOIN public.profiles p ON p.role = rp.role
  WHERE p.id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

-- Funcion para verificar si un usuario tiene un permiso
CREATE OR REPLACE FUNCTION public.has_permission(user_uuid uuid, required_permission text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.role_permissions rp
    JOIN public.profiles p ON p.role = rp.role
    WHERE p.id = user_uuid AND rp.permission = required_permission
  );
$$ LANGUAGE sql SECURITY DEFINER;
