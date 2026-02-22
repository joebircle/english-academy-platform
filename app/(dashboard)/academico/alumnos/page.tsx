import { StudentsContent } from "@/components/students-content"
import { getStudents, getCourses, getStudentPaymentStatuses } from "@/lib/actions"

export default async function StudentsPage() {
  const [students, courses, paymentStatuses] = await Promise.all([
    getStudents(),
    getCourses(),
    getStudentPaymentStatuses(),
  ])

  return <StudentsContent students={students} courses={courses} paymentStatuses={paymentStatuses} />
}
