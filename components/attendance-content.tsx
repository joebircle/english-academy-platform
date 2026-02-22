"use client"

import { useState, useTransition } from "react"
import { Check, X, Clock, AlertCircle, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"
import { upsertAttendance } from "@/lib/actions"
import type { Course, Student, AttendanceStatus } from "@/lib/types"

interface AttendanceContentProps {
  courses: Course[]
  students: Student[]
}

export function AttendanceContent({ courses, students }: AttendanceContentProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id || "")
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, AttendanceStatus>
  >({})
  const [isPending, startTransition] = useTransition()
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const courseStudents = students.filter((s) => s.course_id === selectedCourse)

  const handleAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }))
    setSaveStatus("idle")
  }

  const handleSaveAttendance = () => {
    if (Object.keys(attendanceRecords).length === 0) {
      alert("No hay asistencias para guardar")
      return
    }

    setSaveStatus("saving")
    startTransition(async () => {
      try {
        const promises = Object.entries(attendanceRecords).map(([studentId, status]) =>
          upsertAttendance(studentId, selectedCourse, selectedDate, status)
        )
        await Promise.all(promises)
        setSaveStatus("saved")
        setTimeout(() => setSaveStatus("idle"), 3000)
      } catch (error) {
        console.error("Error saving attendance:", error)
        setSaveStatus("error")
        alert("Error al guardar asistencia")
      }
    })
  }

  const getStatusBadge = (status: AttendanceStatus | undefined) => {
    switch (status) {
      case "presente":
        return (
          <Badge className="bg-green-500 text-white">
            <Check className="w-3 h-3 mr-1" />
            Presente
          </Badge>
        )
      case "ausente":
        return (
          <Badge variant="destructive">
            <X className="w-3 h-3 mr-1" />
            Ausente
          </Badge>
        )
      case "tardanza":
        return (
          <Badge className="bg-warning text-warning-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Tardanza
          </Badge>
        )
      case "justificado":
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Justificado
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Sin registrar
          </Badge>
        )
    }
  }

  const selectedCourseData = courses.find((c) => c.id === selectedCourse)

  const stats = {
    presente: Object.values(attendanceRecords).filter((s) => s === "presente").length,
    ausente: Object.values(attendanceRecords).filter((s) => s === "ausente").length,
    tardanza: Object.values(attendanceRecords).filter((s) => s === "tardanza").length,
    justificado: Object.values(attendanceRecords).filter((s) => s === "justificado").length,
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Asistencia"
        description="Registro de asistencia por curso y fecha"
      />

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Curso
              </label>
              <Select value={selectedCourse} onValueChange={(value) => {
                setSelectedCourse(value)
                setAttendanceRecords({})
                setSaveStatus("idle")
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} - {course.schedule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-[200px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setAttendanceRecords({})
                  setSaveStatus("idle")
                }}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCourseData && (
        <div className="mb-6 flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {selectedCourseData.name}
            </span>{" "}
            | {selectedCourseData.schedule} | Nivel: {selectedCourseData.level}
          </div>
        </div>
      )}

      {Object.keys(attendanceRecords).length > 0 && (
        <div className="mb-6 grid grid-cols-4 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.presente}</div>
              <div className="text-xs text-green-600">Presentes</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.ausente}</div>
              <div className="text-xs text-red-600">Ausentes</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.tardanza}</div>
              <div className="text-xs text-yellow-600">Tardanzas</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.justificado}</div>
              <div className="text-xs text-gray-600">Justificados</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Lista de Asistencia -{" "}
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay cursos registrados. Crea un curso primero.
            </p>
          ) : courseStudents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay alumnos en este curso
            </p>
          ) : (
            <div className="space-y-3">
              {courseStudents.map((student) => (
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
                      {student.tutor_name && (
                        <p className="text-xs text-muted-foreground">
                          Tutor: {student.tutor_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(attendanceRecords[student.id])}
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="sm"
                        variant={attendanceRecords[student.id] === "presente" ? "default" : "outline"}
                        className="h-8 w-8 p-0"
                        onClick={() => handleAttendance(student.id, "presente")}
                        title="Presente"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={attendanceRecords[student.id] === "ausente" ? "destructive" : "outline"}
                        className="h-8 w-8 p-0"
                        onClick={() => handleAttendance(student.id, "ausente")}
                        title="Ausente"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={attendanceRecords[student.id] === "tardanza" ? "default" : "outline"}
                        className="h-8 w-8 p-0 bg-warning text-warning-foreground hover:bg-warning/90"
                        onClick={() => handleAttendance(student.id, "tardanza")}
                        title="Tardanza"
                      >
                        <Clock className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={attendanceRecords[student.id] === "justificado" ? "secondary" : "outline"}
                        className="h-8 w-8 p-0"
                        onClick={() => handleAttendance(student.id, "justificado")}
                        title="Justificado"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {courseStudents.length > 0 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {Object.keys(attendanceRecords).length} de {courseStudents.length} alumnos registrados
              </div>
              <Button 
                onClick={handleSaveAttendance} 
                disabled={isPending || Object.keys(attendanceRecords).length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                {isPending ? "Guardando..." : saveStatus === "saved" ? "Guardado!" : "Guardar Asistencia"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
