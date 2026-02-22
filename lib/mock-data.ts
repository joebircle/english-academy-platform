// Types
export interface Student {
  id: string
  nombre: string
  apellido: string
  fechaNacimiento: string
  curso: string
  cursoId: string
  email: string
  telefono: string
  tutor: string
  tutorTelefono: string
  tutorEmail: string
  direccion: string
  fechaInscripcion: string
  estado: "activo" | "inactivo" | "baja"
  foto?: string
}

export interface Course {
  id: string
  nombre: string
  nivel: string
  dia: string
  horario: string
  profesor: string
  capacidad: number
  inscritos: number
}

export interface Attendance {
  id: string
  studentId: string
  fecha: string
  estado: "presente" | "ausente" | "tardanza" | "justificado"
  observacion?: string
}

export interface Grade {
  id: string
  studentId: string
  examen: string
  fecha: string
  nota: number
  observacion?: string
}

export interface Report {
  id: string
  studentId: string
  periodo: string
  fecha: string
  contenido: string
  profesorId: string
}

export interface Payment {
  id: string
  studentId: string
  mes: string
  monto: number
  estado: "pagado" | "pendiente" | "vencido"
  fechaPago?: string
  metodoPago?: string
}

export interface Message {
  id: string
  cursoId: string
  asunto: string
  contenido: string
  fecha: string
  autor: string
}

// Mock Data
export const courses: Course[] = [
  { id: "c1", nombre: "Inglés Inicial A", nivel: "A1", dia: "Lunes y Miércoles", horario: "16:00 - 17:30", profesor: "María García", capacidad: 12, inscritos: 10 },
  { id: "c2", nombre: "Inglés Inicial B", nivel: "A1", dia: "Martes y Jueves", horario: "16:00 - 17:30", profesor: "María García", capacidad: 12, inscritos: 8 },
  { id: "c3", nombre: "Inglés Intermedio", nivel: "A2", dia: "Lunes y Miércoles", horario: "18:00 - 19:30", profesor: "Carlos López", capacidad: 10, inscritos: 9 },
  { id: "c4", nombre: "Inglés Avanzado", nivel: "B1", dia: "Martes y Jueves", horario: "18:00 - 19:30", profesor: "Carlos López", capacidad: 8, inscritos: 6 },
  { id: "c5", nombre: "Conversación", nivel: "B2", dia: "Viernes", horario: "17:00 - 18:30", profesor: "John Smith", capacidad: 6, inscritos: 5 },
]

export const students: Student[] = [
  { id: "s1", nombre: "Lucas", apellido: "Fernández", fechaNacimiento: "2015-03-12", curso: "Inglés Inicial A", cursoId: "c1", email: "", telefono: "", tutor: "Ana Fernández", tutorTelefono: "11-4567-8901", tutorEmail: "ana.fernandez@email.com", direccion: "Av. Corrientes 1234, CABA", fechaInscripcion: "2025-03-01", estado: "activo" },
  { id: "s2", nombre: "Sofía", apellido: "Martínez", fechaNacimiento: "2014-07-22", curso: "Inglés Inicial A", cursoId: "c1", email: "", telefono: "", tutor: "Roberto Martínez", tutorTelefono: "11-2345-6789", tutorEmail: "roberto.m@email.com", direccion: "Calle Florida 567, CABA", fechaInscripcion: "2025-03-01", estado: "activo" },
  { id: "s3", nombre: "Mateo", apellido: "González", fechaNacimiento: "2013-11-05", curso: "Inglés Intermedio", cursoId: "c3", email: "mateo.g@email.com", telefono: "11-9876-5432", tutor: "Laura González", tutorTelefono: "11-8765-4321", tutorEmail: "laura.gonzalez@email.com", direccion: "Av. Santa Fe 890, CABA", fechaInscripcion: "2024-03-15", estado: "activo" },
  { id: "s4", nombre: "Valentina", apellido: "López", fechaNacimiento: "2012-05-18", curso: "Inglés Avanzado", cursoId: "c4", email: "vale.lopez@email.com", telefono: "11-1234-5678", tutor: "Miguel López", tutorTelefono: "11-4321-8765", tutorEmail: "miguel.l@email.com", direccion: "Av. Callao 123, CABA", fechaInscripcion: "2023-03-10", estado: "activo" },
  { id: "s5", nombre: "Benjamín", apellido: "Rodríguez", fechaNacimiento: "2015-09-30", curso: "Inglés Inicial A", cursoId: "c1", email: "", telefono: "", tutor: "Carolina Rodríguez", tutorTelefono: "11-5678-1234", tutorEmail: "carolina.r@email.com", direccion: "Av. Libertador 456, CABA", fechaInscripcion: "2025-03-05", estado: "activo" },
  { id: "s6", nombre: "Emma", apellido: "Sánchez", fechaNacimiento: "2014-02-14", curso: "Inglés Inicial B", cursoId: "c2", email: "", telefono: "", tutor: "Pedro Sánchez", tutorTelefono: "11-8901-2345", tutorEmail: "pedro.s@email.com", direccion: "Calle Lavalle 789, CABA", fechaInscripcion: "2025-03-08", estado: "activo" },
  { id: "s7", nombre: "Joaquín", apellido: "Díaz", fechaNacimiento: "2013-08-25", curso: "Inglés Intermedio", cursoId: "c3", email: "joaquin.d@email.com", telefono: "11-3456-7890", tutor: "Silvia Díaz", tutorTelefono: "11-7890-3456", tutorEmail: "silvia.diaz@email.com", direccion: "Av. de Mayo 234, CABA", fechaInscripcion: "2024-08-20", estado: "activo" },
  { id: "s8", nombre: "Isabella", apellido: "Torres", fechaNacimiento: "2012-12-01", curso: "Inglés Avanzado", cursoId: "c4", email: "isa.torres@email.com", telefono: "11-6789-0123", tutor: "Fernando Torres", tutorTelefono: "11-0123-6789", tutorEmail: "fernando.t@email.com", direccion: "Calle Tucumán 567, CABA", fechaInscripcion: "2023-08-15", estado: "activo" },
  { id: "s9", nombre: "Thiago", apellido: "Moreno", fechaNacimiento: "2015-06-08", curso: "Inglés Inicial A", cursoId: "c1", email: "", telefono: "", tutor: "Mariana Moreno", tutorTelefono: "11-2345-8901", tutorEmail: "mariana.m@email.com", direccion: "Av. Belgrano 890, CABA", fechaInscripcion: "2025-03-10", estado: "activo" },
  { id: "s10", nombre: "Mía", apellido: "Romero", fechaNacimiento: "2014-04-20", curso: "Inglés Inicial B", cursoId: "c2", email: "", telefono: "", tutor: "Diego Romero", tutorTelefono: "11-9012-3456", tutorEmail: "diego.r@email.com", direccion: "Calle Sarmiento 123, CABA", fechaInscripcion: "2025-03-12", estado: "activo" },
  { id: "s11", nombre: "Facundo", apellido: "Herrera", fechaNacimiento: "2011-10-15", curso: "Conversación", cursoId: "c5", email: "facu.herrera@email.com", telefono: "11-4567-8901", tutor: "Patricia Herrera", tutorTelefono: "11-8901-4567", tutorEmail: "patricia.h@email.com", direccion: "Av. Rivadavia 456, CABA", fechaInscripcion: "2022-03-20", estado: "activo" },
  { id: "s12", nombre: "Catalina", apellido: "Acosta", fechaNacimiento: "2013-01-28", curso: "Inglés Intermedio", cursoId: "c3", email: "cata.acosta@email.com", telefono: "11-5678-9012", tutor: "Gabriela Acosta", tutorTelefono: "11-9012-5678", tutorEmail: "gabriela.a@email.com", direccion: "Calle Reconquista 789, CABA", fechaInscripcion: "2024-03-25", estado: "activo" },
]

export const attendance: Attendance[] = [
  { id: "a1", studentId: "s1", fecha: "2025-01-20", estado: "presente" },
  { id: "a2", studentId: "s1", fecha: "2025-01-22", estado: "presente" },
  { id: "a3", studentId: "s1", fecha: "2025-01-27", estado: "ausente", observacion: "Enfermedad" },
  { id: "a4", studentId: "s2", fecha: "2025-01-20", estado: "presente" },
  { id: "a5", studentId: "s2", fecha: "2025-01-22", estado: "tardanza" },
  { id: "a6", studentId: "s2", fecha: "2025-01-27", estado: "presente" },
  { id: "a7", studentId: "s3", fecha: "2025-01-20", estado: "presente" },
  { id: "a8", studentId: "s3", fecha: "2025-01-22", estado: "presente" },
  { id: "a9", studentId: "s3", fecha: "2025-01-27", estado: "justificado", observacion: "Turno médico" },
]

export const grades: Grade[] = [
  { id: "g1", studentId: "s1", examen: "Examen 1 - Grammar", fecha: "2025-04-15", nota: 8.5, observacion: "Muy buen trabajo" },
  { id: "g2", studentId: "s1", examen: "Examen 2 - Vocabulary", fecha: "2025-06-20", nota: 9.0 },
  { id: "g3", studentId: "s2", examen: "Examen 1 - Grammar", fecha: "2025-04-15", nota: 7.0, observacion: "Debe practicar más los tiempos verbales" },
  { id: "g4", studentId: "s2", examen: "Examen 2 - Vocabulary", fecha: "2025-06-20", nota: 8.0 },
  { id: "g5", studentId: "s3", examen: "Examen 1 - Grammar", fecha: "2025-04-15", nota: 9.5 },
  { id: "g6", studentId: "s3", examen: "Examen 2 - Vocabulary", fecha: "2025-06-20", nota: 9.0 },
  { id: "g7", studentId: "s4", examen: "Examen 1 - Grammar", fecha: "2025-04-15", nota: 10.0, observacion: "Excelente!" },
  { id: "g8", studentId: "s4", examen: "Examen 2 - Vocabulary", fecha: "2025-06-20", nota: 9.5 },
]

export const reports: Report[] = [
  { id: "r1", studentId: "s1", periodo: "1er Semestre 2025", fecha: "2025-07-01", contenido: "Lucas ha demostrado un excelente progreso en su primer semestre. Su comprensión lectora ha mejorado significativamente y participa activamente en clase. Debe seguir practicando la pronunciación.", profesorId: "p1" },
  { id: "r2", studentId: "s2", periodo: "1er Semestre 2025", fecha: "2025-07-01", contenido: "Sofía muestra entusiasmo por el idioma. Ha mejorado en vocabulario aunque necesita reforzar estructuras gramaticales básicas. Recomiendo ejercicios adicionales en casa.", profesorId: "p1" },
  { id: "r3", studentId: "s3", periodo: "1er Semestre 2025", fecha: "2025-07-01", contenido: "Mateo continúa destacándose en el nivel intermedio. Su fluidez oral ha mejorado notablemente. Está listo para avanzar a temas más complejos en el próximo semestre.", profesorId: "p2" },
]

export const payments: Payment[] = [
  { id: "p1", studentId: "s1", mes: "Enero 2025", monto: 25000, estado: "pagado", fechaPago: "2025-01-05", metodoPago: "Transferencia" },
  { id: "p2", studentId: "s1", mes: "Febrero 2025", monto: 25000, estado: "pagado", fechaPago: "2025-02-03", metodoPago: "Efectivo" },
  { id: "p3", studentId: "s1", mes: "Marzo 2025", monto: 25000, estado: "pendiente" },
  { id: "p4", studentId: "s2", mes: "Enero 2025", monto: 25000, estado: "pagado", fechaPago: "2025-01-10", metodoPago: "Transferencia" },
  { id: "p5", studentId: "s2", mes: "Febrero 2025", monto: 25000, estado: "pagado", fechaPago: "2025-02-08", metodoPago: "Transferencia" },
  { id: "p6", studentId: "s2", mes: "Marzo 2025", monto: 25000, estado: "pagado", fechaPago: "2025-03-05", metodoPago: "Efectivo" },
  { id: "p7", studentId: "s3", mes: "Enero 2025", monto: 28000, estado: "pagado", fechaPago: "2025-01-08", metodoPago: "Transferencia" },
  { id: "p8", studentId: "s3", mes: "Febrero 2025", monto: 28000, estado: "vencido" },
  { id: "p9", studentId: "s3", mes: "Marzo 2025", monto: 28000, estado: "pendiente" },
  { id: "p10", studentId: "s4", mes: "Enero 2025", monto: 30000, estado: "pagado", fechaPago: "2025-01-02", metodoPago: "Tarjeta" },
  { id: "p11", studentId: "s4", mes: "Febrero 2025", monto: 30000, estado: "pagado", fechaPago: "2025-02-02", metodoPago: "Tarjeta" },
  { id: "p12", studentId: "s4", mes: "Marzo 2025", monto: 30000, estado: "pagado", fechaPago: "2025-03-02", metodoPago: "Tarjeta" },
]

export const messages: Message[] = [
  { id: "m1", cursoId: "c1", asunto: "Recordatorio: Examen próxima semana", contenido: "Estimados padres, les recordamos que el próximo miércoles tendremos el examen de vocabulario. Por favor asegúrense de que los chicos repasen las unidades 1-3.", fecha: "2025-01-20", autor: "María García" },
  { id: "m2", cursoId: "c1", asunto: "Cambio de horario - Clase del viernes", contenido: "Les informamos que la clase del viernes 24 se adelanta a las 15:30 por razones de fuerza mayor. Disculpen las molestias.", fecha: "2025-01-21", autor: "Secretaría" },
  { id: "m3", cursoId: "c3", asunto: "Material adicional disponible", contenido: "Hemos subido material de práctica adicional para el examen. Pueden descargarlo desde el portal o solicitarlo en secretaría.", fecha: "2025-01-22", autor: "Carlos López" },
]

// Helper functions
export function getStudentsByCourse(cursoId: string): Student[] {
  return students.filter(s => s.cursoId === cursoId)
}

export function getStudentById(id: string): Student | undefined {
  return students.find(s => s.id === id)
}

export function getAttendanceByStudent(studentId: string): Attendance[] {
  return attendance.filter(a => a.studentId === studentId)
}

export function getGradesByStudent(studentId: string): Grade[] {
  return grades.filter(g => g.studentId === studentId)
}

export function getReportsByStudent(studentId: string): Report[] {
  return reports.filter(r => r.studentId === studentId)
}

export function getPaymentsByStudent(studentId: string): Payment[] {
  return payments.filter(p => p.studentId === studentId)
}

export function getMessagesByCourse(cursoId: string): Message[] {
  return messages.filter(m => m.cursoId === cursoId)
}

export function getCourseById(id: string): Course | undefined {
  return courses.find(c => c.id === id)
}
