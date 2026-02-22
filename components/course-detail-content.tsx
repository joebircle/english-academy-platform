"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, User, Users, Trash2, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import type { Course, Student } from "@/lib/types"
import { deleteCourse, createStudent } from "@/lib/actions"
import { useRouter } from "next/navigation"

interface CourseDetailContentProps {
  course: Course | null
  students: Student[]
}

export function CourseDetailContent({ course, students }: CourseDetailContentProps) {
  const router = useRouter()
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleAddStudent(formData: FormData) {
    if (!course) return
    setIsSubmitting(true)
    try {
      formData.set("course_id", course.id)
      await createStudent(formData)
      setIsAddStudentOpen(false)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido"
      alert(`Error al agregar alumno: ${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!course) {
    return (
      <div className="p-8">
        <Link href="/academico/cursos">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Cursos
          </Button>
        </Link>
        <p className="text-muted-foreground">Curso no encontrado</p>
      </div>
    )
  }

  async function handleDelete() {
    try {
      await deleteCourse(course!.id)
      router.push("/academico/cursos")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido"
      alert(`Error al eliminar curso: ${message}`)
    }
  }

  // Add Student Dialog
  const AddStudentDialog = (
    <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Alumno a {course?.name}</DialogTitle>
        </DialogHeader>
        <form action={handleAddStudent} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Agregar Alumno"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="p-8">
      {AddStudentDialog}
      <div className="mb-6">
        <Link href="/academico/cursos">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Cursos
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{course.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="secondary">{course.level}</Badge>
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {course.schedule}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsAddStudentOpen(true)}
              className="bg-accent hover:bg-accent/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Alumno
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={students.length > 0}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar curso</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta accion no se puede deshacer. El curso sera eliminado permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {students.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            No se puede eliminar un curso con alumnos asignados
          </p>
        )}
      </div>

      {/* Course Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nivel</p>
              <p className="font-medium">{course.level}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Alumnos Inscritos</p>
              <p className="font-medium">
                {students.length} / {course.max_students || 15}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Clock className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Horario</p>
              <p className="font-medium">{course.schedule}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alumnos del Curso</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">
                No hay alumnos inscritos en este curso
              </p>
              <Button 
                onClick={() => setIsAddStudentOpen(true)}
                className="bg-accent hover:bg-accent/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar primer alumno
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {student.first_name[0]}
                            {student.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {student.first_name} {student.last_name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{student.tutor_name || "-"}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {student.tutor_phone || "-"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Activo</Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/academico/alumnos/${student.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver ficha
                        </Button>
                      </Link>
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
