import { describe, expect, it } from "vitest"
import { summarizeAttendance } from "@/lib/attendance"

const courseDates = ["2026-04-01", "2026-04-08", "2026-04-15", "2026-04-22"]

describe("summarizeAttendance", () => {
  it("counts classes without a row as attended when only absences are recorded", () => {
    const summary = summarizeAttendance([{ date: "2026-04-08", status: "ausente" }], courseDates)
    expect(summary).toEqual({ classes: 4, absent: 1, rate: 75 })
  })

  it("gives 100% to a student with no rows in a course that held classes", () => {
    expect(summarizeAttendance([], courseDates)).toEqual({ classes: 4, absent: 0, rate: 100 })
  })

  it("matches the old result when the whole course is recorded", () => {
    const records = [
      { date: "2026-04-01", status: "presente" as const },
      { date: "2026-04-08", status: "ausente" as const },
      { date: "2026-04-15", status: "presente" as const },
      { date: "2026-04-22", status: "presente" as const },
    ]
    expect(summarizeAttendance(records, courseDates).rate).toBe(75)
  })

  it("ignores course classes before the enrollment date", () => {
    const summary = summarizeAttendance(
      [{ date: "2026-04-22", status: "ausente" }],
      courseDates,
      "2026-04-15",
    )
    expect(summary).toEqual({ classes: 2, absent: 1, rate: 50 })
  })

  it("keeps the student's own rows from before enrollment or another course", () => {
    const summary = summarizeAttendance(
      [{ date: "2026-03-25", status: "ausente" }],
      courseDates,
      "2026-04-01",
    )
    expect(summary).toEqual({ classes: 5, absent: 1, rate: 80 })
  })

  it("does not count tardanza or justificado as absences", () => {
    const summary = summarizeAttendance(
      [
        { date: "2026-04-01", status: "tardanza" },
        { date: "2026-04-08", status: "justificado" },
      ],
      courseDates,
    )
    expect(summary).toEqual({ classes: 4, absent: 0, rate: 100 })
  })

  it("returns no rate when there are no classes", () => {
    expect(summarizeAttendance([], [])).toEqual({ classes: 0, absent: 0, rate: null })
  })
})
