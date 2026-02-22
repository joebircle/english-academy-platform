import { AttendanceContent } from "@/components/attendance-content"
import { getCourses, getStudents } from "@/lib/actions"

export default async function AttendancePage() {
  const [courses, students] = await Promise.all([
    getCourses(),
    getStudents(),
  ])

  return <AttendanceContent courses={courses} students={students} />
}
