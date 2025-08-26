import dedent from "dedent"

import { describe, test, expect, beforeAll } from "vitest"
import { Herb } from "@herb-tools/node-wasm"
import { Linter } from "../../src/linter.js"

import { ERBNoRemoteForLinkToRule } from "../../src/rules/erb-no-remote-for-link-to.js"

describe("ERBNoRemoteForLinkToRule", () => {
  beforeAll(async () => {
    await Herb.load()
  })

  test("valid case TODO", () => {
    const html = dedent`
      <h1>
        <%= link_to "Click me", "/path", data: { turbo: true } %>
      </h1>
    `
    const linter = new Linter(Herb, [ERBNoRemoteForLinkToRule])
    const lintResult = linter.lint(html)

    expect(lintResult.errors).toBe(0)
    expect(lintResult.warnings).toBe(0)
    expect(lintResult.offenses).toHaveLength(0)
  })

  test("invalid case TODO", () => {
    const html = dedent`
      <h1>
        <%= link_to "Click me", "/path", remote: true %>
      <h1>
    `
    const linter = new Linter(Herb, [ERBNoRemoteForLinkToRule])
    const lintResult = linter.lint(html)

    expect(lintResult.errors).toBe(1)
    expect(lintResult.warnings).toBe(0)
    expect(lintResult.offenses).toHaveLength(1)
    expect(lintResult.offenses[0].code).toBe("erb-no-remote-for-link-to")
    expect(lintResult.offenses[0].message).toBe("Don't use remote with link_to, use turbo alternative")

    // TODO: add assertions for invalid case
  })
})
