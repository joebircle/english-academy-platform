import { StudentDetailContent } from "@/components/student-detail-content"
import { 
  getStudent, 
  getCourse, 
  getStudentAttendance, 
  getStudentGrades,
  getStudentReports,
  getStudentPayments,
  getCourseClassDates,
} from "@/lib/actions"

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const student = await getStudent(id)
  const course = student?.course_id ? await getCourse(student.course_id) : null
  
  const [attendance, grades, reports, payments, courseClassDates] = await Promise.all([
    getStudentAttendance(id),
    getStudentGrades(id),
    getStudentReports(id),
    getStudentPayments(id),
    student?.course_id ? getCourseClassDates(student.course_id) : Promise.resolve([]),
  ])
  
  return (
    <StudentDetailContent 
      student={student}
      course={course}
      attendance={attendance}
      courseClassDates={courseClassDates}
      grades={grades}
      reports={reports}
      payments={payments}
    />
  )
}
