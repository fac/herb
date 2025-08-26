/*
 * Rule Type Guide:
 * - ParserRule: AST-based validation using parsed document tree (most common)
 * - LexerRule: Token-based validation using lexer output (for syntax-level checks)
 * - SourceRule: Raw text validation using original source code (for file-level checks)
 *
 * This template generates a ParserRule. To create other types:
 * - Replace `ParserRule` with `LexerRule` and use `BaseLexerRuleVisitor`
 * - Replace `ParserRule` with `SourceRule` and use `BaseSourceRuleVisitor`
 */

import { BaseRuleVisitor } from "./rule-utils.js"
import { ParserRule } from "../types.js"
import type { LintOffense, LintContext } from "../types.js"
import type { ERBContentNode, ParseResult } from "@herb-tools/core"

class ERBNoRemoteForLinkToVisitor extends BaseRuleVisitor {
  visitERBContentNode(node: ERBContentNode): void {
    // TODO: implement logic
    this.checkLinkToTypeConstruct(node)
    this.visitChildNodes(node)
  }

  private checkLinkToTypeConstruct(node: ERBContentNode): void {
    if (!node.content) {
      return
    }

    const content = node.content.value.trim()
    const linkTypeMethod = this.LinkToTypeMethods.find(method => content.startsWith(method))
    if (!linkTypeMethod) {
      return
    }

    if (this.containsRemoteTrueHashValue(content)) {
      this.addOffense(
        `Don't use remote with ${linkTypeMethod}, use turbo alternative`,
        node.location,
        "error"
      )
    }
  }

  private containsRemoteTrueHashValue(content: string): boolean {
    return !!content.match(/\bremote(\s+=>|:)/)
  }

  private LinkToTypeMethods: string[] = [
    "link_to_if",
    "link_to_unless",
    "link_to",
    "button_to",
    "form_tag",
    "form_for",
    "form_with"
  ]
}

export class ERBNoRemoteForLinkToRule extends ParserRule {
  name = "erb-no-remote-for-link-to"

  check(result: ParseResult, context?: Partial<LintContext>): LintOffense[] {
    const visitor = new ERBNoRemoteForLinkToVisitor(this.name, context)

    visitor.visit(result.value)

    return visitor.offenses
  }
}
