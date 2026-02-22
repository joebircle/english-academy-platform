import { ReportsContent } from "@/components/reports-content"
import { getCourses, getStudents, getReports } from "@/lib/actions"

export default async function ReportsPage() {
  const [courses, students, reports] = await Promise.all([
    getCourses(),
    getStudents(),
    getReports(),
  ])

  return <ReportsContent courses={courses} students={students} reports={reports} />
}
