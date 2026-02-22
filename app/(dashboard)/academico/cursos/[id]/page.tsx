import { CourseDetailContent } from "@/components/course-detail-content"
import { getCourse, getStudents } from "@/lib/actions"

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const [course, allStudents] = await Promise.all([
    getCourse(id),
    getStudents(id),
  ])

  return <CourseDetailContent course={course} students={allStudents} />
}
