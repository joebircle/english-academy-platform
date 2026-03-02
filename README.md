# The English Club - Sistema de Gestion

Plataforma de gestion academica y financiera para The English Club, una academia de ingles.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Base de datos:** Supabase (PostgreSQL + Auth + RLS)
- **UI:** Tailwind CSS 4 + shadcn/ui (Radix UI)
- **Automatizaciones:** n8n (envio de emails via webhook)
- **Deploy:** Vercel

## Funcionalidades

### Gestion Academica
- **Cursos** - CRUD de cursos con nivel, horario y capacidad maxima
- **Alumnos** - Registro de alumnos con datos de tutor/contacto
- **Asistencia** - Control diario (presente, ausente, tardanza, justificado)
- **Calificaciones** - 4 examenes + oral/proyecto + nota final (escala 0-100)
- **Informes** - Reportes semestrales con flujo borrador → finalizado → entregado
- **Comunicaciones** - Mensajes por curso con envio automatico de email via n8n

### Gestion Financiera
- **Pagos** - Seguimiento mensual con estados (pendiente, pagado, vencido)
- **Conceptos de pago** - Cuotas, materiales, examenes, matricula

### Roles de usuario
| Rol | Acceso |
|-----|--------|
| Admin | Acceso total |
| Secretaria | Gestion academica y financiera |
| Profesor | Asistencia, calificaciones, informes |
| Padre | Acceso limitado a datos del alumno |

## Instalacion

```bash
git clone <repo-url>
cd english-academy-platform
npm install
```

## Variables de entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
N8N_WEBHOOK_URL=tu-url-de-webhook-n8n
```

## Base de datos

Ejecutar los scripts SQL en Supabase SQL Editor en orden:

```
scripts/001_create_schema.sql
scripts/002_create_remaining_tables.sql
scripts/003_add_payment_concepts.sql
scripts/004_permissive_policies.sql
scripts/005_update_roles.sql
scripts/006_fix_grades_table.sql
scripts/007_fix_reports_table.sql
scripts/009_scalability_improvements.sql
scripts/010_add_teacher_name.sql
scripts/011_update_payment_methods.sql
scripts/012_fix_grade_constraints.sql
```

## Desarrollo

```bash
npm run dev       # Servidor de desarrollo en http://localhost:3000
npm run build     # Build de produccion
npm run lint      # Linter
```

## Integracion con n8n

El modulo de comunicaciones envia datos a un webhook de n8n para distribuir emails automaticamente.

**Payload del webhook:**
```json
{
  "subject": "The English Club - Asunto",
  "content": "Contenido del mensaje",
  "recipients": [
    {
      "email": "tutor@email.com",
      "name": "Nombre Tutor",
      "studentName": "Nombre Alumno"
    }
  ]
}
```

Importar `n8n-workflow-comunicaciones.json` en n8n para usar el flujo preconfigurado con nodo de Gmail.

## Estructura del proyecto

```
app/
  (dashboard)/
    academico/          # Cursos, Alumnos, Asistencia, Calificaciones, Informes, Comunicaciones
    financiero/         # Pagos
  auth/                 # Login, Registro
components/             # Componentes de UI y paginas
lib/
  actions.ts            # Server actions (CRUD)
  n8n.ts                # Webhook n8n
  types.ts              # Tipos TypeScript
  supabase/             # Cliente Supabase (server/client)
scripts/                # Migraciones SQL
```
