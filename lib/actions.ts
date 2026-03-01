"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  Course,
  Student,
  Attendance,
  Grade,
  Report,
  Communication,
  Payment,
  PaymentConcept,
  AttendanceStatus,
  PaymentStatus,
  ReportStatus,
} from "./types"

// ============ COURSES ============

export async function getCourses(): Promise<Course[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("name")

  if (error) throw error

  // Get student counts
  const { data: counts } = await supabase
    .from("students")
    .select("course_id")

  const courseCounts = (counts || []).reduce(
    (acc, s) => {
      if (s.course_id) {
        acc[s.course_id] = (acc[s.course_id] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>
  )

  return (data || []).map((course) => ({
    ...course,
    students_count: courseCounts[course.id] || 0,
  }))
}

export async function getCourse(id: string): Promise<Course | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data
}

export async function createCourse(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from("courses").insert({
    name: formData.get("name") as string,
    level: formData.get("level") as string,
    schedule: formData.get("schedule") as string,
    max_students: Number(formData.get("max_students")) || 15,
    teacher_id: (formData.get("teacher_id") as string) || null,
  })

  if (error) throw error
  revalidatePath("/academico/cursos", "max")
}

export async function updateCourse(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("courses")
    .update({
      name: formData.get("name") as string,
      level: formData.get("level") as string,
      schedule: formData.get("schedule") as string,
      max_students: Number(formData.get("max_students")) || 15,
      teacher_id: (formData.get("teacher_id") as string) || null,
    })
    .eq("id", id)

  if (error) throw error
  revalidatePath("/academico/cursos", "max")
}

export async function deleteCourse(id: string) {
  const supabase = await createClient()
  // Delete related records first
  await supabase.from("attendance").delete().eq("course_id", id)
  await supabase.from("grades").delete().eq("course_id", id)
  await supabase.from("reports").delete().eq("course_id", id)
  await supabase.from("communications").delete().eq("course_id", id)
  // Update students to remove course reference (don't delete students)
  await supabase.from("students").update({ course_id: null }).eq("course_id", id)
  // Delete the course
  const { error } = await supabase.from("courses").delete().eq("id", id)
  if (error) throw error
  revalidatePath("/academico/cursos", "max")
}

// ============ STUDENTS ============

export async function getStudents(courseId?: string): Promise<Student[]> {
  const supabase = await createClient()
  let query = supabase
    .from("students")
    .select("*, course:courses(*)")
    .order("last_name")

  if (courseId) {
    query = query.eq("course_id", courseId)
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []) as Student[]
}

export async function getStudent(id: string): Promise<Student | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("students")
    .select("*, course:courses(*)")
    .eq("id", id)
    .single()

  if (error) return null
  return data as Student
}

export async function createStudent(formData: FormData) {
  const supabase = await createClient()
  
  const studentData = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    birth_date: (formData.get("birth_date") as string) || null,
    course_id: (formData.get("course_id") as string) || null,
    tutor_name: (formData.get("tutor_name") as string) || null,
    tutor_phone: (formData.get("tutor_phone") as string) || null,
    tutor_email: (formData.get("tutor_email") as string) || null,
    notes: (formData.get("notes") as string) || null,
  }
  
  const { error } = await supabase.from("students").insert(studentData)

  if (error) throw error
  revalidatePath("/academico/alumnos", "max")
}

export async function updateStudent(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("students")
    .update({
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      birth_date: (formData.get("birth_date") as string) || null,
      course_id: (formData.get("course_id") as string) || null,
      tutor_name: (formData.get("tutor_name") as string) || null,
      tutor_phone: (formData.get("tutor_phone") as string) || null,
      tutor_email: (formData.get("tutor_email") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", id)

  if (error) throw error
  revalidatePath("/academico/alumnos", "max")
}

// ============ ATTENDANCE ============

export async function getAttendance(
  courseId?: string,
  date?: string
): Promise<Attendance[]> {
  const supabase = await createClient()
  let query = supabase
    .from("attendance")
    .select("*, student:students(*)")
    .order("date", { ascending: false })

  if (courseId) query = query.eq("course_id", courseId)
  if (date) query = query.eq("date", date)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getStudentAttendance(studentId: string): Promise<Attendance[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("student_id", studentId)
    .order("date", { ascending: false })

  if (error) throw error
  return data || []
}

export async function upsertAttendance(
  studentId: string,
  courseId: string,
  date: string,
  status: AttendanceStatus,
  notes?: string
) {
  const supabase = await createClient()

  // Check if attendance record exists
  const { data: existing } = await supabase
    .from("attendance")
    .select("id")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .eq("date", date)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("attendance")
      .update({ status, notes })
      .eq("id", existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("attendance").insert({
      student_id: studentId,
      course_id: courseId,
      date,
      status,
      notes,
    })
    if (error) throw error
  }

  revalidatePath("/academico/asistencia", "max")
}

// ============ GRADES ============

export async function getGrades(courseId?: string): Promise<Grade[]> {
  const supabase = await createClient()
  let query = supabase
    .from("grades")
    .select("*, student:students(*)")
    .order("exam_number")

  if (courseId) query = query.eq("course_id", courseId)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getStudentGrades(studentId: string): Promise<Grade[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("grades")
    .select("*")
    .eq("student_id", studentId)
    .order("exam_number")

  if (error) throw error
  return data || []
}

export async function upsertGrade(
  studentId: string,
  courseId: string,
  examNumber: number,
  score: number | null,
  date?: string,
  notes?: string
) {
  const supabase = await createClient()

  // Check if grade record exists
  const { data: existing } = await supabase
    .from("grades")
    .select("id")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .eq("exam_number", examNumber)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("grades")
      .update({ score, date, notes })
      .eq("id", existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("grades").insert({
      student_id: studentId,
      course_id: courseId,
      exam_number: examNumber,
      score,
      date,
      notes,
    })
    if (error) throw error
  }

  revalidatePath("/academico/calificaciones", "max")
}

// ============ REPORTS ============

export async function getReports(courseId?: string): Promise<Report[]> {
  const supabase = await createClient()
  let query = supabase
    .from("reports")
    .select("*, student:students(*)")
    .order("created_at", { ascending: false })

  if (courseId) query = query.eq("course_id", courseId)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getStudentReports(studentId: string): Promise<Report[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function upsertReport(
  studentId: string,
  courseId: string,
  semester: number,
  year: number,
  content: string,
  status: ReportStatus,
  period?: string
) {
  const supabase = await createClient()

  // Check if report record exists
  const { data: existing } = await supabase
    .from("reports")
    .select("id")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .eq("semester", semester)
    .eq("year", year)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("reports")
      .update({ content, status, period })
      .eq("id", existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("reports").insert({
      student_id: studentId,
      course_id: courseId,
      semester,
      year,
      content,
      status,
      period,
    })
    if (error) throw error
  }

  revalidatePath("/academico/informes", "max")
}

// ============ COMMUNICATIONS ============

export async function getCommunications(courseId?: string): Promise<Communication[]> {
  const supabase = await createClient()
  let query = supabase
    .from("communications")
    .select("*, course:courses(*)")
    .order("created_at", { ascending: false })

  if (courseId) query = query.eq("course_id", courseId)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createCommunication(formData: FormData) {
  const supabase = await createClient()

  const courseId = (formData.get("course_id") as string) || null
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const sendEmail = formData.get("send_email") === "true"

  // Guardar en la base de datos
  const { error } = await supabase.from("communications").insert({
    course_id: courseId,
    title,
    content,
  })

  if (error) throw error

  // Enviar emails via n8n si se solicitó
  if (sendEmail && process.env.N8N_WEBHOOK_URL) {
    try {
      let recipients: { email: string; name: string; studentName: string }[] = []

      let query = supabase
        .from("students")
        .select("first_name, last_name, tutor_name, tutor_email")
        .not("tutor_email", "is", null)

      if (courseId) {
        query = query.eq("course_id", courseId)
      }

      const { data: students } = await query

      recipients = (students || [])
        .filter(s => s.tutor_email)
        .map(s => ({
          email: s.tutor_email!,
          name: s.tutor_name || "Tutor",
          studentName: `${s.first_name} ${s.last_name}`,
        }))

      if (recipients.length > 0) {
        const { sendCommunicationEmails } = await import("@/lib/n8n")
        await sendCommunicationEmails(title, content, recipients)
      }
    } catch (emailError) {
      // No fallar si el email falla, el mensaje ya está guardado
      console.error("Error enviando emails via n8n:", emailError)
    }
  }

  revalidatePath("/academico/comunicaciones", "max")
}

export async function deleteCommunication(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("communications").delete().eq("id", id)
  if (error) throw error
  revalidatePath("/academico/comunicaciones", "max")
}

// ============ PAYMENT CONCEPTS ============

export async function getPaymentConcepts(): Promise<PaymentConcept[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("payment_concepts")
    .select("*")
    .order("name")

  if (error) {
    console.error("Error fetching payment concepts:", error)
    return []
  }
  return data || []
}

export async function createPaymentConcept(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from("payment_concepts").insert({
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    default_amount: Number(formData.get("default_amount")) || 0,
    is_recurring: formData.get("is_recurring") === "true",
  })

  if (error) throw error
  revalidatePath("/financiero/pagos", "max")
}

export async function updatePaymentConcept(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("payment_concepts")
    .update({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      default_amount: Number(formData.get("default_amount")) || 0,
      is_recurring: formData.get("is_recurring") === "true",
    })
    .eq("id", id)

  if (error) throw error
  revalidatePath("/financiero/pagos", "max")
}

export async function deletePaymentConcept(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("payment_concepts")
    .delete()
    .eq("id", id)

  if (error) throw error
  revalidatePath("/financiero/pagos", "max")
}

// ============ PAYMENTS ============

export async function getStudentPaymentStatuses(): Promise<Record<string, "al_dia" | "con_deuda">> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("payments")
    .select("student_id, status")

  if (error) throw error

  const statuses: Record<string, "al_dia" | "con_deuda"> = {}
  for (const payment of data || []) {
    if (payment.status === "pendiente" || payment.status === "vencido") {
      statuses[payment.student_id] = "con_deuda"
    } else if (!statuses[payment.student_id]) {
      statuses[payment.student_id] = "al_dia"
    }
  }
  return statuses
}

export async function getPayments(
  studentId?: string,
  status?: PaymentStatus
): Promise<Payment[]> {
  const supabase = await createClient()
  let query = supabase
    .from("payments")
    .select("*, student:students(*), concept:payment_concepts(*)")
    .order("year", { ascending: false })
    .order("month", { ascending: false })

  if (studentId) query = query.eq("student_id", studentId)
  if (status) query = query.eq("status", status)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getStudentPayments(studentId: string): Promise<Payment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("student_id", studentId)
    .order("year", { ascending: false })
    .order("month", { ascending: false })

  if (error) throw error
  return data || []
}

export async function upsertPayment(
  studentId: string,
  month: number,
  year: number,
  amount: number,
  status: PaymentStatus,
  paymentDate?: string,
  paymentMethod?: string,
  notes?: string
) {
  const supabase = await createClient()

  // Check if payment record exists
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("student_id", studentId)
    .eq("month", month)
    .eq("year", year)
    .single()

  if (existing) {
    const { error } = await supabase
      .from("payments")
      .update({
        amount,
        status,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        notes,
      })
      .eq("id", existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("payments").insert({
      student_id: studentId,
      month,
      year,
      amount,
      status,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      notes,
    })
    if (error) throw error
  }

  revalidatePath("/financiero/pagos", "max")
}

// ============ DASHBOARD STATS ============

export async function getDashboardStats() {
  const supabase = await createClient()

  const [
    { count: studentsCount },
    { count: coursesCount },
    { data: pendingPayments },
    { data: overduePayments },
  ] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("amount").eq("status", "pendiente"),
    supabase.from("payments").select("amount").eq("status", "vencido"),
  ])

  const pendingAmount =
    pendingPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  const overdueAmount =
    overduePayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  return {
    totalStudents: studentsCount || 0,
    totalCourses: coursesCount || 0,
    pendingPayments: pendingAmount,
    overduePayments: overdueAmount,
  }
}

// ============ AUTH ============

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return { user, profile }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function getTeachers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "profesor")
    .order("last_name")

  if (error) throw error
  return data || []
}

// ============ UTILS ============

export async function deleteStudent(id: string) {
  const supabase = await createClient()
  // Delete related records first
  await supabase.from("attendance").delete().eq("student_id", id)
  await supabase.from("grades").delete().eq("student_id", id)
  await supabase.from("reports").delete().eq("student_id", id)
  await supabase.from("payments").delete().eq("student_id", id)
  // Then delete the student
  const { error } = await supabase.from("students").delete().eq("id", id)
  if (error) throw error
  revalidatePath("/academico/alumnos", "max")
}

export async function deletePayment(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("payments").delete().eq("id", id)
  if (error) throw error
  revalidatePath("/financiero/pagos", "max")
}
