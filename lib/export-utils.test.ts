import { describe, it, expect } from "vitest"
import { buildCsv, CSV_SEPARATOR } from "./export-utils"

describe("buildCsv", () => {
  const columns = [
    { key: "name", label: "Alumno" },
    { key: "grade", label: "Nota" },
  ]

  it("uses semicolon as separator", () => {
    const csv = buildCsv(
      [{ name: "Ana", grade: 90 }],
      columns
    )
    const [sepHint, header, row] = csv.split("\n")
    expect(sepHint).toBe(`sep=${CSV_SEPARATOR}`)
    expect(header).toBe("Alumno;Nota")
    expect(row).toBe("Ana;90")
  })

  it("starts with sep=; hint so Excel respects separator regardless of locale", () => {
    const csv = buildCsv([{ name: "x", grade: 1 }], columns)
    expect(csv.startsWith("sep=;\n")).toBe(true)
  })

  it("quotes values containing the separator", () => {
    const csv = buildCsv(
      [{ name: "Garcia; Juan", grade: 80 }],
      columns
    )
    const lines = csv.split("\n")
    expect(lines[2]).toBe('"Garcia; Juan";80')
  })

  it("escapes embedded quotes by doubling them", () => {
    const csv = buildCsv(
      [{ name: 'O"Reilly', grade: 75 }],
      columns
    )
    const lines = csv.split("\n")
    expect(lines[2]).toBe('"O""Reilly";75')
  })

  it("quotes values containing newlines", () => {
    const csv = buildCsv(
      [{ name: "line1\nline2", grade: 50 }],
      columns
    )
    const lines = csv.split("\n")
    expect(lines[2]).toBe('"line1')
    expect(lines[3]).toBe('line2";50')
  })

  it("does not quote plain values", () => {
    const csv = buildCsv(
      [{ name: "Ana", grade: 90 }],
      columns
    )
    expect(csv).not.toContain('"Ana"')
  })

  it("handles null and undefined as empty string", () => {
    const csv = buildCsv(
      [{ name: null, grade: undefined }],
      columns
    )
    const lines = csv.split("\n")
    expect(lines[2]).toBe(";")
  })

  it("works with multiple rows", () => {
    const csv = buildCsv(
      [
        { name: "Ana", grade: 90 },
        { name: "Bruno", grade: 75 },
      ],
      columns
    )
    const lines = csv.split("\n")
    expect(lines).toHaveLength(4)
    expect(lines[2]).toBe("Ana;90")
    expect(lines[3]).toBe("Bruno;75")
  })

  it("handles empty data", () => {
    const csv = buildCsv([], columns)
    const lines = csv.split("\n")
    expect(lines).toEqual(["sep=;", "Alumno;Nota"])
  })

  it("regression: comma in value is NOT quoted (semicolon is the separator now)", () => {
    const csv = buildCsv(
      [{ name: "Garcia, Juan", grade: 80 }],
      columns
    )
    const lines = csv.split("\n")
    expect(lines[2]).toBe("Garcia, Juan;80")
  })
})
