import { CoursesContent } from "@/components/courses-content"
import { getCourses } from "@/lib/actions"

export default async function CoursesPage() {
  const courses = await getCourses()

  return <CoursesContent courses={courses} />
}
