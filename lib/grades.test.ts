import { describe, it, expect } from "vitest"
import { getEffectiveExamScore, getGradeLabel, getRetakeNumber } from "./grades"
import type { Grade } from "./types"

const grade = (exam_number: number, score: number | null) =>
  ({ exam_number, score }) as Grade

describe("getRetakeNumber", () => {
  it("maps exams 1-4 to 7-10", () => {
    expect([1, 2, 3, 4].map(getRetakeNumber)).toEqual([7, 8, 9, 10])
  })
})

describe("getEffectiveExamScore", () => {
  it("uses the exam score when there is no retake", () => {
    expect(getEffectiveExamScore([grade(1, 40)], 1)).toBe(40)
  })

  it("uses the retake score when present", () => {
    expect(getEffectiveExamScore([grade(1, 40), grade(7, 75)], 1)).toBe(75)
  })

  it("falls back to the exam score when the retake was cleared", () => {
    expect(getEffectiveExamScore([grade(1, 40), grade(7, null)], 1)).toBe(40)
  })

  it("returns null when there are no grades", () => {
    expect(getEffectiveExamScore([], 2)).toBeNull()
  })
})

describe("getGradeLabel", () => {
  it("labels exams, extras and retakes", () => {
    expect(getGradeLabel(1)).toBe("Examen 1")
    expect(getGradeLabel(5)).toBe("Oral / Proyecto")
    expect(getGradeLabel(6)).toBe("Nota Final")
    expect(getGradeLabel(8)).toBe("Recuperatorio Examen 2")
  })
})
