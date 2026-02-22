import { CommunicationsContent } from "@/components/communications-content"
import { getCourses, getCommunications } from "@/lib/actions"

export default async function CommunicationsPage() {
  const [courses, communications] = await Promise.all([
    getCourses(),
    getCommunications(),
  ])

  return <CommunicationsContent courses={courses} communications={communications} />
}
