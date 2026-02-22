"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Filter, ChevronRight, Plus, Users, Download, Trash2, CreditCard } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/page-header"
import { createStudent, deleteStudent } from "@/lib/actions"
import { exportToExcel, formatDateForExport } from "@/lib/export-utils"
import type { Student, Course } from "@/lib/types"

interface StudentsContentProps {
  students: Student[]
  courses: Course[]
  paymentStatuses?: Record<string, "al_dia" | "con_deuda">
}

export function StudentsContent({ students, courses, paymentStatuses = {} }: StudentsContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.tutor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

    const matchesCourse =
      selectedCourse === "all" || student.course_id === selectedCourse

    const studentPayment = paymentStatuses[student.id]
    const matchesPayment =
      paymentFilter === "all" ||
      (paymentFilter === "al_dia" && (studentPayment === "al_dia" || !studentPayment)) ||
      (paymentFilter === "con_deuda" && studentPayment === "con_deuda")

    return matchesSearch && matchesCourse && matchesPayment
  })

  async function handleSubmit(formData: FormData) {
    try {
      // Add course_id from state since Select doesn't work with form action
      if (selectedCourseId) {
        formData.set("course_id", selectedCourseId)
      }
      await createStudent(formData)
      setIsDialogOpen(false)
      setSelectedCourseId("")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error desconocido"
      alert(`Error al crear alumno: ${message}`)
    }
  }

  function handleExport() {
    const exportData = filteredStudents.map((s) => ({
      apellido: s.last_name,
      nombre: s.first_name,
      fechaNacimiento: s.birth_date ? formatDateForExport(s.birth_date) : "-",
      curso: s.course?.name || "Sin asignar",
      tutor: s.tutor_name || "-",
      telefono: s.tutor_phone || "-",
      email: s.tutor_email || "-",
    }))

    exportToExcel(exportData, `alumnos_${new Date().toISOString().split("T")[0]}`, [
      { key: "apellido", label: "Apellido" },
      { key: "nombre", label: "Nombre" },
      { key: "fechaNacimiento", label: "Fecha de Nacimiento" },
      { key: "curso", label: "Curso" },
      { key: "tutor", label: "Tutor" },
      { key: "telefono", label: "Telefono" },
      { key: "email", label: "Email" },
    ])
  }

  // Dialog component - rendered separately so it can be opened from empty state
  const AddStudentDialog = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Alumno</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input id="first_name" name="first_name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido</Label>
              <Input id="last_name" name="last_name" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">Fecha de nacimiento</Label>
            <Input id="birth_date" name="birth_date" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course_id">Curso</Label>
            {courses.length > 0 ? (
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
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
            ) : (
              <p className="text-sm text-muted-foreground p-2 border rounded-md">
                No hay cursos. Crea un curso primero.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tutor_name">Nombre del tutor</Label>
            <Input id="tutor_name" name="tutor_name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tutor_phone">Telefono</Label>
              <Input id="tutor_phone" name="tutor_phone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tutor_email">Email</Label>
              <Input id="tutor_email" name="tutor_email" type="email" />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Guardar Alumno
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="p-8">
      {AddStudentDialog}
      <PageHeader
        title="Alumnos"
        description={`${students.length} alumnos registrados`}
        action={
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-accent hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Alumno
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, apellido o tutor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cursos</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <CreditCard className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="al_dia">Al dia</SelectItem>
                <SelectItem value="con_deuda">Con deuda</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">
                {students.length === 0
                  ? "No hay alumnos registrados"
                  : "No se encontraron alumnos"}
              </p>
              {students.length === 0 && (
                <Button onClick={() => setIsDialogOpen(true)} className="bg-accent hover:bg-accent/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar primer alumno
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
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
                          {student.birth_date && (
                            <p className="text-xs text-muted-foreground">
                              Nacimiento:{" "}
                              {new Date(student.birth_date).toLocaleDateString("es-AR")}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {student.course?.name || "Sin curso"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{student.tutor_name || "-"}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.tutor_email || ""}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{student.tutor_phone || "-"}</p>
                    </TableCell>
                    <TableCell>
                      {paymentStatuses[student.id] === "con_deuda" ? (
                        <Badge variant="destructive">Con deuda</Badge>
                      ) : paymentStatuses[student.id] === "al_dia" ? (
                        <Badge className="bg-green-600 text-white">Al dia</Badge>
                      ) : (
                        <Badge variant="secondary">Sin pagos</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link href={`/academico/alumnos/${student.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver ficha
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar alumno</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta accion no se puede deshacer. Se eliminara permanentemente a {student.first_name} {student.last_name} y todos sus datos asociados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteStudent(student.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
