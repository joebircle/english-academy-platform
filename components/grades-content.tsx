"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, TrendingUp, TrendingDown, Minus, Save, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/page-header"
import { upsertGrade } from "@/lib/actions"
import { exportToExcel } from "@/lib/export-utils"
import type { Course, Student, Grade } from "@/lib/types"

interface GradesContentProps {
  courses: Course[]
  students: Student[]
  grades: Grade[]
}

const EXAMS = [
  { number: 1, name: "Examen 1" },
  { number: 2, name: "Examen 2" },
  { number: 3, name: "Examen 3" },
  { number: 4, name: "Examen 4" },
]

const EXTRA_GRADES = [
  { number: 5, name: "Oral / Proyecto" },
  { number: 6, name: "Nota Final" },
]

export function GradesContent({ courses, students, grades }: GradesContentProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id || "")
  const [editingGrades, setEditingGrades] = useState<Record<string, number | null>>({})
  const [isSaving, setIsSaving] = useState(false)

  const courseStudents = students.filter((s) => s.course_id === selectedCourse)

  const getStudentGrade = (studentId: string, examNumber: number): number | null => {
    const key = `${studentId}-${examNumber}`
    if (key in editingGrades) return editingGrades[key]
    const grade = grades.find(
      (g) => g.student_id === studentId && g.exam_number === examNumber
    )
    return grade?.score ?? null
  }

  const handleGradeChange = (studentId: string, examNumber: number, value: string) => {
    const key = `${studentId}-${examNumber}`
    const numValue = value === "" ? null : Number(value)
    if (numValue !== null && (numValue < 0 || numValue > 100)) return
    setEditingGrades((prev) => ({ ...prev, [key]: numValue }))
  }

  const saveAllGrades = async () => {
    if (Object.keys(editingGrades).length === 0) return

    setIsSaving(true)
    try {
      const savePromises = Object.entries(editingGrades).map(([key, score]) => {
        const [studentId, examNumber] = key.split("-")
        return upsertGrade(studentId, selectedCourse, Number(examNumber), score)
      })
      await Promise.all(savePromises)
      setEditingGrades({})
      alert("Calificaciones guardadas correctamente")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido"
      alert(`Error al guardar las calificaciones: ${message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Promedio automatico de los 4 examenes
  const calculateAverage = (studentId: string): number | null => {
    const examGrades = EXAMS.map((e) => getStudentGrade(studentId, e.number)).filter(
      (g): g is number => g !== null
    )
    if (examGrades.length === 0) return null
    return Math.round(examGrades.reduce((a, b) => a + b, 0) / examGrades.length)
  }

  const getTrend = (studentId: string) => {
    const examGrades = EXAMS.map((e) => getStudentGrade(studentId, e.number)).filter(
      (g): g is number => g !== null
    )
    if (examGrades.length < 2) return null
    const diff = examGrades[examGrades.length - 1] - examGrades[examGrades.length - 2]
    if (diff > 0) return "up"
    if (diff < 0) return "down"
    return "stable"
  }

  const getGradeColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground"
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-primary"
    if (score >= 50) return "text-yellow-600"
    return "text-destructive"
  }

  const getGradeBg = (score: number | null) => {
    if (score === null) return "bg-muted"
    if (score >= 90) return "bg-green-50"
    if (score >= 70) return "bg-primary/10"
    if (score >= 50) return "bg-yellow-50"
    return "bg-destructive/10"
  }

  const handleExport = () => {
    const data = courseStudents.map((student) => {
      const row: Record<string, unknown> = {
        Alumno: `${student.first_name} ${student.last_name}`,
      }
      EXAMS.forEach((exam) => {
        row[exam.name] = getStudentGrade(student.id, exam.number) ?? "-"
      })
      row["Promedio"] = calculateAverage(student.id) ?? "-"
      row["Oral / Proyecto"] = getStudentGrade(student.id, 5) ?? "-"
      row["Nota Final"] = getStudentGrade(student.id, 6) ?? "-"
      return row
    })
    const courseName = courses.find((c) => c.id === selectedCourse)?.name || "curso"
    exportToExcel(
      data,
      `calificaciones-${courseName}`,
      [
        { key: "Alumno", label: "Alumno" },
        ...EXAMS.map(e => ({ key: e.name, label: e.name })),
        { key: "Promedio", label: "Promedio" },
        { key: "Oral / Proyecto", label: "Oral / Proyecto" },
        { key: "Nota Final", label: "Nota Final" },
      ]
    )
  }

  const hasChanges = Object.keys(editingGrades).length > 0

  return (
    <div className="p-8">
      <PageHeader
        title="Calificaciones"
        description="Registro de notas por curso - Escala del 1 al 100"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={courseStudents.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
            {hasChanges && (
              <Button onClick={saveAllGrades} disabled={isSaving} className="bg-accent hover:bg-accent/90">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            )}
          </div>
        }
      />

      {/* Course Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-muted-foreground">Curso:</label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[300px]">
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
        </CardContent>
      </Card>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Tabla de Calificaciones
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Alumno</TableHead>
                    {EXAMS.map((exam) => (
                      <TableHead key={exam.number} className="text-center min-w-[90px]">
                        {exam.name}
                      </TableHead>
                    ))}
                    <TableHead className="text-center min-w-[90px] bg-muted/50">Promedio</TableHead>
                    {EXTRA_GRADES.map((extra) => (
                      <TableHead key={extra.number} className="text-center min-w-[100px] bg-muted/30">
                        {extra.name}
                      </TableHead>
                    ))}
                    <TableHead className="text-center min-w-[70px]">Tend.</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseStudents.map((student) => {
                    const average = calculateAverage(student.id)
                    const trend = getTrend(student.id)

                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {student.first_name[0]}
                                {student.last_name[0]}
                              </span>
                            </div>
                            <span className="font-medium text-sm">
                              {student.last_name}, {student.first_name}
                            </span>
                          </div>
                        </TableCell>
                        {EXAMS.map((exam) => {
                          const score = getStudentGrade(student.id, exam.number)
                          return (
                            <TableCell key={exam.number} className="text-center">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={score ?? ""}
                                onChange={(e) =>
                                  handleGradeChange(student.id, exam.number, e.target.value)
                                }
                                className={`w-16 text-center mx-auto ${getGradeBg(score)} ${getGradeColor(score)}`}
                                placeholder="-"
                              />
                            </TableCell>
                          )
                        })}
                        {/* Promedio automatico */}
                        <TableCell className="text-center bg-muted/20">
                          {average !== null ? (
                            <Badge
                              className={`${getGradeBg(average)} ${getGradeColor(average)} border-0 text-sm font-bold`}
                            >
                              {average}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        {/* Oral/Proyecto y Nota Final */}
                        {EXTRA_GRADES.map((extra) => {
                          const score = getStudentGrade(student.id, extra.number)
                          return (
                            <TableCell key={extra.number} className="text-center bg-muted/10">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={score ?? ""}
                                onChange={(e) =>
                                  handleGradeChange(student.id, extra.number, e.target.value)
                                }
                                className={`w-16 text-center mx-auto ${getGradeBg(score)} ${getGradeColor(score)}`}
                                placeholder="-"
                              />
                            </TableCell>
                          )
                        })}
                        <TableCell className="text-center">
                          {trend === "up" && (
                            <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                          )}
                          {trend === "down" && (
                            <TrendingDown className="w-5 h-5 text-destructive mx-auto" />
                          )}
                          {trend === "stable" && (
                            <Minus className="w-5 h-5 text-muted-foreground mx-auto" />
                          )}
                          {!trend && (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link href={`/academico/alumnos/${student.id}`}>
                            <Button variant="ghost" size="sm">
                              Ver
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-green-50 border border-green-200" />
          Excelente (90-100)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-primary/10 border border-primary/20" />
          Bueno (70-89)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-yellow-50 border border-yellow-200" />
          Regular (50-69)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-destructive/10 border border-destructive/20" />
          {"Insuficiente (<50)"}
        </span>
      </div>
    </div>
  )
}
