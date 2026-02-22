"use client"

import Link from "next/link"
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  Check,
  X,
  Clock,
  AlertCircle,
  FileText,
  CreditCard,
  Printer,
} from "lucide-react"
import { generateReportCardPDF } from "@/lib/export-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Student, Course, Attendance, Grade, Report, Payment } from "@/lib/types"

interface StudentDetailContentProps {
  student: Student | null
  course: Course | null
  attendance: Attendance[]
  grades: Grade[]
  reports: Report[]
  payments: Payment[]
}

export function StudentDetailContent({ 
  student, 
  course,
  attendance,
  grades,
  reports,
  payments 
}: StudentDetailContentProps) {

  if (!student) {
    return (
      <div className="p-8">
        <Link href="/academico/alumnos">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Alumnos
          </Button>
        </Link>
        <p className="text-muted-foreground">Alumno no encontrado</p>
      </div>
    )
  }

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case "presente":
        return <Check className="w-4 h-4 text-green-600" />
      case "ausente":
        return <X className="w-4 h-4 text-destructive" />
      case "tardanza":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "justificado":
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      presente: "Presente",
      ausente: "Ausente",
      tardanza: "Tardanza",
      justificado: "Justificado"
    }
    return labels[status] || status
  }

  const getGradeColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground"
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-primary"
    if (score >= 50) return "text-yellow-600"
    return "text-destructive"
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "pagado":
        return <Badge className="bg-green-600 text-white">Pagado</Badge>
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>
      case "vencido":
        return <Badge variant="destructive">Vencido</Badge>
      default:
        return null
    }
  }

  // Calculate stats
  const attendanceStats = {
    total: attendance.length,
    present: attendance.filter((a) => a.status === "presente").length,
    absent: attendance.filter((a) => a.status === "ausente").length,
  }
  const attendanceRate =
    attendanceStats.total > 0
      ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
      : 0

  const validGrades = grades.filter(g => g.score !== null)
  const gradeAverage =
    validGrades.length > 0
      ? (validGrades.reduce((sum, g) => sum + (g.score || 0), 0) / validGrades.length).toFixed(1)
      : "-"

  const paymentStats = {
    paid: payments.filter((p) => p.status === "pagado").length,
    pending: payments.filter((p) => p.status === "pendiente").length,
    overdue: payments.filter((p) => p.status === "vencido").length,
  }

  const age = calculateAge(student.birth_date)

  const handleGenerateReportCard = () => {
    // Get grades by exam number
    const getGradeByExam = (examNumber: number) => {
      const grade = grades.find(g => g.exam_number === examNumber)
      return grade?.score ?? null
    }

    // Get stage reports
    const stage1 = reports.find(r => r.period?.toLowerCase().includes("etapa 1") || r.period?.toLowerCase().includes("stage 1"))
    const stage2 = reports.find(r => r.period?.toLowerCase().includes("etapa 2") || r.period?.toLowerCase().includes("stage 2"))

    // Calculate yearly average from 4 exams
    const validGradesForAvg = [1, 2, 3, 4].map(n => getGradeByExam(n)).filter(g => g !== null) as number[]
    const yearlyAvg = validGradesForAvg.length > 0 
      ? Math.round(validGradesForAvg.reduce((a, b) => a + b, 0) / validGradesForAvg.length)
      : null

    // Calculate attendance stats
    const totalClasses = attendance.length
    const presentCount = attendance.filter(a => a.status === "presente").length
    const absentCount = attendance.filter(a => a.status === "ausente").length
    const lateCount = attendance.filter(a => a.status === "tardanza").length
    const justifiedCount = attendance.filter(a => a.status === "justificado").length
    const attendancePercentage = totalClasses > 0 
      ? Math.round(((presentCount + lateCount + justifiedCount) / totalClasses) * 100)
      : 0

    generateReportCardPDF({
      studentName: `${student.first_name} ${student.last_name}`,
      level: course?.name || "Sin asignar",
      teacher: course?.teacher_name || "Docente",
      year: new Date().getFullYear(),
      stage1Report: stage1?.content || "",
      stage2Report: stage2?.content || "",
      grades: {
        exam1: getGradeByExam(1),
        exam2: getGradeByExam(2),
        exam3: getGradeByExam(3),
        exam4: getGradeByExam(4),
        oral: getGradeByExam(5),
      },
      yearlyAverage: yearlyAvg,
      finalExam: getGradeByExam(6),
      attendance: totalClasses > 0 ? {
        totalClasses,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        justified: justifiedCount,
        percentage: attendancePercentage,
      } : undefined,
    })
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/academico/alumnos">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Alumnos
          </Button>
        </Link>

        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-semibold text-primary">
              {student.first_name[0]}
              {student.last_name[0]}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">
                {student.first_name} {student.last_name}
              </h1>
              <Badge variant="default" className="capitalize">
                Activo
              </Badge>
              <Button 
                onClick={handleGenerateReportCard}
                className="ml-auto bg-accent hover:bg-accent/90"
              >
                <Printer className="w-4 h-4 mr-2" />
                Generar Report Card
              </Button>
            </div>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {course?.name || "Sin curso asignado"}
              </span>
              {age && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {age} años
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{attendanceRate}%</p>
                <p className="text-xs text-muted-foreground">Asistencia</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{gradeAverage}</p>
                <p className="text-xs text-muted-foreground">Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <FileText className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{reports.length}</p>
                <p className="text-xs text-muted-foreground">Informes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentStats.overdue > 0 ? "bg-destructive/10" : "bg-green-100"}`}
              >
                <CreditCard
                  className={`w-5 h-5 ${paymentStats.overdue > 0 ? "text-destructive" : "text-green-600"}`}
                />
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {paymentStats.overdue > 0 ? paymentStats.overdue : paymentStats.paid}
                </p>
                <p className="text-xs text-muted-foreground">
                  {paymentStats.overdue > 0 ? "Pagos vencidos" : "Pagos al día"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="asistencia">Asistencia ({attendance.length})</TabsTrigger>
          <TabsTrigger value="calificaciones">Calificaciones ({grades.length})</TabsTrigger>
          <TabsTrigger value="informes">Informes ({reports.length})</TabsTrigger>
          <TabsTrigger value="pagos">Pagos ({payments.length})</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos del Alumno</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre completo</p>
                    <p className="font-medium">
                      {student.first_name} {student.last_name}
                    </p>
                  </div>
                </div>
                {student.birth_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de nacimiento</p>
                      <p className="font-medium">
                        {new Date(student.birth_date).toLocaleDateString("es-AR")}
                        {age && ` (${age} años)`}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Curso</p>
                    <p className="font-medium">{course?.name || "Sin curso asignado"}</p>
                    {course && (
                      <p className="text-xs text-muted-foreground">
                        {course.schedule}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de inscripción</p>
                    <p className="font-medium">
                      {new Date(student.created_at).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>
                {student.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Notas</p>
                      <p className="font-medium">{student.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos del Tutor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{student.tutor_name || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefono</p>
                    <p className="font-medium">{student.tutor_phone || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{student.tutor_email || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="asistencia">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Asistencia</CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay registros de asistencia
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Observación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString("es-AR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getAttendanceIcon(record.status)}
                            <span className="capitalize">{getStatusLabel(record.status)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grades Tab */}
        <TabsContent value="calificaciones">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              {grades.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay calificaciones registradas
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Examen</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Nota</TableHead>
                      <TableHead>Observación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">Examen {grade.exam_number}</TableCell>
                        <TableCell>
                          {grade.date ? new Date(grade.date).toLocaleDateString("es-AR") : "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-semibold text-lg ${getGradeColor(grade.score)}`}
                          >
                            {grade.score ?? "-"}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {grade.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="informes">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informes Semestrales</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay informes registrados
                </p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary">{report.period}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString("es-AR")}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{report.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="pagos">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay pagos registrados
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha de Pago</TableHead>
                      <TableHead>Método</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.concept}</TableCell>
                        <TableCell>
                          ${payment.amount.toLocaleString("es-AR")}
                        </TableCell>
                        <TableCell>{getPaymentBadge(payment.status)}</TableCell>
                        <TableCell>
                          {payment.payment_date
                            ? new Date(payment.payment_date).toLocaleDateString("es-AR")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.payment_method || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
