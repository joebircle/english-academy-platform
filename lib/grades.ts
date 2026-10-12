import type { Grade } from "@/lib/types"

// exam_number layout in the grades table:
// 1-4 = Examen 1-4, 5 = Oral / Proyecto, 6 = Nota Final, 7-10 = Recuperatorio de Examen 1-4
export const RETAKE_OFFSET = 6

export const EXAMS = [
  { number: 1, name: "Examen 1" },
  { number: 2, name: "Examen 2" },
  { number: 3, name: "Examen 3" },
  { number: 4, name: "Examen 4" },
]

export const EXTRA_GRADES = [
  { number: 5, name: "Oral / Proyecto" },
  { number: 6, name: "Nota Final" },
]

export const getRetakeNumber = (examNumber: number) => examNumber + RETAKE_OFFSET

export function getGradeLabel(examNumber: number): string {
  const exam = EXAMS.find((e) => e.number === examNumber)
  if (exam) return exam.name
  const extra = EXTRA_GRADES.find((e) => e.number === examNumber)
  if (extra) return extra.name
  const retakeOf = EXAMS.find((e) => getRetakeNumber(e.number) === examNumber)
  if (retakeOf) return `Recuperatorio ${retakeOf.name}`
  return `Examen ${examNumber}`
}

// The retake grade, when present, replaces the original exam grade
export function getEffectiveExamScore(grades: Grade[], examNumber: number): number | null {
  const find = (n: number) => grades.find((g) => g.exam_number === n)?.score ?? null
  return find(getRetakeNumber(examNumber)) ?? find(examNumber)
}
