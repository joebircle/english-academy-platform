"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Calendar, User, ChevronRight, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/page-header"
import { upsertReport } from "@/lib/actions"
import type { Course, Student, Report, ReportStatus } from "@/lib/types"

interface ReportsContentProps {
  courses: Course[]
  students: Student[]
  reports: Report[]
}

const currentYear = new Date().getFullYear()
const PERIODS = [
  { id: 1, name: "Etapa 1", label: `Informe Etapa 1 - ${currentYear}` },
  { id: 2, name: "Etapa 2", label: `Informe Etapa 2 - ${currentYear}` },
]

export function ReportsContent({ courses, students, reports }: ReportsContentProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id || "")
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [reportContent, setReportContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const courseStudents = students.filter((s) => s.course_id === selectedCourse)

  const getStudentReport = (studentId: string) => {
    return reports.find(
      (r) =>
        r.student_id === studentId &&
        r.semester === selectedPeriod &&
        r.year === currentYear
    )
  }

  const openReportDialog = (student: Student) => {
    setEditingStudent(student)
    const existingReport = getStudentReport(student.id)
    setReportContent(existingReport?.content || "")
    setIsDialogOpen(true)
  }

  const handleSaveReport = async () => {
    if (!editingStudent || !reportContent.trim()) return

    setIsSaving(true)
    try {
      await upsertReport(
        editingStudent.id,
        selectedCourse,
        selectedPeriod,
        currentYear,
        reportContent,
        "finalizado" as ReportStatus,
        PERIODS.find(p => p.id === selectedPeriod)?.name || "Etapa 1"
      )
      setIsDialogOpen(false)
      setEditingStudent(null)
      setReportContent("")
      window.location.reload()
    } catch (error) {
      alert("Error al guardar el informe")
    } finally {
      setIsSaving(false)
    }
  }

  const completedCount = courseStudents.filter((s) => getStudentReport(s.id)).length
  const pendingCount = courseStudents.length - completedCount
  const currentPeriod = PERIODS.find((p) => p.id === selectedPeriod)

  return (
    <div className="p-8">
      <PageHeader
        title="Informes"
        description="Informes por etapa de los alumnos (2 por año)"
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Curso
              </label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-[250px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Periodo
              </label>
              <Select
                value={String(selectedPeriod)}
                onValueChange={(v) => setSelectedPeriod(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar periodo" />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((period) => (
                    <SelectItem key={period.id} value={String(period.id)}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Estado de Informes - {currentPeriod?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No hay cursos registrados</p>
              <Link href="/academico/cursos">
                <Button>Crear primer curso</Button>
              </Link>
            </div>
          ) : courseStudents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay alumnos en este curso
            </p>
          ) : (
            <div className="space-y-3">
              {courseStudents.map((student) => {
                const report = getStudentReport(student.id)
                const hasReport = !!report

                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {student.first_name[0]}
                          {student.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {student.first_name} {student.last_name}
                        </p>
                        {report && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Emitido:{" "}
                            {new Date(report.created_at).toLocaleDateString("es-AR")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={hasReport ? "default" : "secondary"}>
                        {hasReport ? "Completado" : "Pendiente"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openReportDialog(student)}
                      >
                        {hasReport ? "Ver/Editar" : "Crear informe"}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{courseStudents.length}</p>
                <p className="text-xs text-muted-foreground">Alumnos en curso</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Informes completos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Informes pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Informe {currentPeriod?.name} - {editingStudent?.first_name} {editingStudent?.last_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <p>
                <strong>Periodo:</strong> {currentPeriod?.label}
              </p>
              <p>
                <strong>Curso:</strong>{" "}
                {courses.find((c) => c.id === selectedCourse)?.name}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-content">Contenido del Informe</Label>
              <Textarea
                id="report-content"
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                placeholder="Escriba el informe del alumno aqui... Describa el desempeno del alumno, sus fortalezas, areas de mejora, actitud en clase, participacion, etc."
                rows={10}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveReport} disabled={isSaving || !reportContent.trim()}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Guardando..." : "Guardar Informe"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
