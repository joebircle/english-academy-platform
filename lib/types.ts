export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  role: "admin" | "secretaria" | "profesor" | "padre"
  created_at: string
}

export interface Course {
  id: string
  name: string
  level: string
  schedule: string
  teacher_id: string | null
  teacher_name: string | null
  max_students: number
  created_at: string
  teacher?: Profile
  students_count?: number
}

export interface Student {
  id: string
  first_name: string
  last_name: string
  birth_date: string | null
  course_id: string | null
  tutor_name: string | null
  tutor_phone: string | null
  tutor_email: string | null
  address: string | null
  status: "activo" | "inactivo" | "baja"
  enrollment_date: string | null
  notes: string | null
  created_at: string
  course?: Course
}

export interface Attendance {
  id: string
  student_id: string
  course_id: string
  date: string
  status: "presente" | "ausente" | "tardanza" | "justificado"
  notes: string | null
  created_at: string
  student?: Student
}

export interface Grade {
  id: string
  student_id: string
  course_id: string
  exam_number: number
  score: number | null
  date: string | null
  notes: string | null
  created_at: string
  student?: Student
}

export interface Report {
  id: string
  student_id: string
  course_id: string
  semester: number
  year: number
  content: string | null
  status: "pendiente" | "borrador" | "finalizado" | "entregado"
  period?: string | null
  created_at: string
  student?: Student
}

export interface Communication {
  id: string
  course_id: string | null
  author_id: string
  title: string
  content: string
  created_at: string
  course?: Course
  author?: Profile
}

export interface PaymentConcept {
  id: string
  name: string
  description: string | null
  default_amount: number
  is_recurring: boolean
  is_active: boolean
  created_at: string
}

export interface Payment {
  id: string
  student_id: string
  concept_id: string | null
  month: number
  year: number
  amount: number
  status: "pendiente" | "pagado" | "vencido"
  payment_date: string | null
  payment_method: string | null
  notes: string | null
  created_at: string
  student?: Student
  concept?: PaymentConcept
}

export type AttendanceStatus = "presente" | "ausente" | "tardanza" | "justificado"
export type PaymentStatus = "pendiente" | "pagado" | "vencido"
export type ReportStatus = "pendiente" | "borrador" | "finalizado" | "entregado"
export type UserRole = "admin" | "secretaria" | "profesor" | "padre"
export type TeacherStatus = "activo" | "inactivo" | "licencia"
export type EnrollmentStatus = "activo" | "completado" | "retirado" | "transferido"
export type DiscountType = "porcentaje" | "monto_fijo"

// ============ NUEVAS TABLAS PARA ESCALABILIDAD ============

export interface Teacher {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  specialization: string | null
  hire_date: string | null
  status: TeacherStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AcademicPeriod {
  id: string
  name: string
  year: number
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
}

export interface ExamType {
  id: string
  name: string
  description: string | null
  weight: number
  order_number: number | null
  is_active: boolean
  created_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  period_id: string | null
  enrollment_date: string
  withdrawal_date: string | null
  status: EnrollmentStatus
  notes: string | null
  created_at: string
  student?: Student
  course?: Course
  period?: AcademicPeriod
}

export interface Discount {
  id: string
  student_id: string
  name: string
  type: DiscountType
  value: number
  start_date: string
  end_date: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  student?: Student
}

export interface Setting {
  id: string
  key: string
  value: string | null
  description: string | null
  updated_at: string
}

export interface ActivityLog {
  id: string
  table_name: string
  record_id: string | null
  action: "insert" | "update" | "delete"
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  user_id: string | null
  ip_address: string | null
  created_at: string
}

// ============ TIPOS PARA ESTADISTICAS ============

export interface PaymentStatusSummary {
  total_paid: number
  total_pending: number
  total_overdue: number
  months_paid: number
  months_pending: number
}

export interface AttendanceStats {
  total_classes: number
  present_count: number
  absent_count: number
  late_count: number
  justified_count: number
  attendance_percentage: number
}
