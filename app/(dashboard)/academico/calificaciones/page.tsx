import { GradesContent } from "@/components/grades-content"
import { getCourses, getStudents, getGrades } from "@/lib/actions"

export default async function GradesPage() {
  const [courses, students, grades] = await Promise.all([
    getCourses(),
    getStudents(),
    getGrades(),
  ])

  return <GradesContent courses={courses} students={students} grades={grades} />
}
