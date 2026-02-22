"use client"

import { useState } from "react"
import Link from "next/link"
import { Users, Clock, ChevronRight, Plus, BookOpen, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { PageHeader } from "@/components/page-header"
import { createCourse, deleteCourse } from "@/lib/actions"
import type { Course } from "@/lib/types"

interface CoursesContentProps {
  courses: Course[]
}

export function CoursesContent({ courses }: CoursesContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    try {
      await createCourse(formData)
      setIsDialogOpen(false)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error desconocido"
      alert(`Error al crear curso: ${message}`)
    }
  }

  // Dialog separado para poder abrirlo desde cualquier lugar
  const AddCourseDialog = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Curso</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del curso</Label>
            <Input id="name" name="name" placeholder="Ingles Basico A" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Nivel</Label>
            <Input id="level" name="level" placeholder="A1 - Principiante" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule">Horario</Label>
            <Input
              id="schedule"
              name="schedule"
              placeholder="Lunes y Miercoles 18:00-19:30"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_students">Capacidad maxima</Label>
            <Input
              id="max_students"
              name="max_students"
              type="number"
              defaultValue={15}
              min={1}
            />
          </div>
          <Button type="submit" className="w-full">
            Crear Curso
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="p-8">
      {AddCourseDialog}
      <PageHeader
        title="Cursos"
        description="Listado de cursos activos de la academia"
        action={
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Curso
          </Button>
        }
      />

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">
              No hay cursos registrados
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primer curso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const studentsCount = course.students_count || 0
            const occupancy = (studentsCount / course.max_students) * 100

            return (
              <Link key={course.id} href={`/academico/cursos/${course.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {course.name}
                        </h3>
                        <Badge variant="secondary" className="mt-1">
                          {course.level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => e.preventDefault()}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar curso</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta accion no se puede deshacer. Se eliminara permanentemente el curso "{course.name}" y todos los datos asociados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.preventDefault()
                                  deleteCourse(course.id)
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{course.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>
                          {studentsCount} / {course.max_students} alumnos
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Ocupacion</span>
                        <span>{Math.round(occupancy)}%</span>
                      </div>
                      <Progress value={occupancy} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
