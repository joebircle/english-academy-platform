-- Eliminar todos los datos de prueba de las tablas
-- Este script limpia todas las tablas manteniendo la estructura

-- Primero eliminar tablas con dependencias (foreign keys)
DELETE FROM public.payments;
DELETE FROM public.reports;
DELETE FROM public.communications;
DELETE FROM public.grades;
DELETE FROM public.attendance;

-- Luego eliminar estudiantes
DELETE FROM public.students;

-- Finalmente eliminar cursos
DELETE FROM public.courses;

-- Confirmar limpieza
SELECT 'Datos eliminados correctamente' as resultado;
