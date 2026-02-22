import { PaymentsContent } from "@/components/payments-content"
import { getPayments, getStudents, getPaymentConcepts } from "@/lib/actions"

export default async function PaymentsPage() {
  const [payments, students, concepts] = await Promise.all([
    getPayments(),
    getStudents(),
    getPaymentConcepts(),
  ])

  return <PaymentsContent payments={payments} students={students} concepts={concepts} />
}
