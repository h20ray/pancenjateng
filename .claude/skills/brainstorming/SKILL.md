---
name: brainstorming
description: Refine rough ideas into a clear design through Socratic questioning before any code is written. Invoke for new features, refactors, or any task where the approach isn't obvious.
metadata:
  type: workflow
---

# Brainstorming — Design Before Code

Hard gate: no code, no implementation, no file edits until a design is presented and the user explicitly approves it. This applies to every project regardless of perceived simplicity.

Aligned with: **Think Before Coding** (CLAUDE.md principle #1).

## Process

### 1. Explore context
Read relevant files, docs, recent commits, and project steering files (`.kiro/steering/`) to understand existing patterns and constraints. Don't design in a vacuum.

### 2. Ask clarifying questions
One at a time. Prefer multiple choice when possible — it's faster than open-ended. Don't stop until the shape of the solution is clear.

Key areas to probe:
- Scope boundaries (what's in, what's out)
- Constraints (performance, compatibility, deadlines)
- Existing patterns to follow or deliberately break
- Edge cases that might change the design

### 3. Present 2–3 approaches
For each: what it looks like, tradeoffs, and your recommendation. If only one approach makes sense, say why the alternatives don't apply.

### 4. Present design in sections
Get approval after each section before continuing. Don't dump the entire design at once. Typical sections:

1. **What changes** — files created, modified, deleted; data model changes
2. **How it works** — flow, API surface, component tree
3. **Edge cases & risks** — what could go wrong, what's explicitly out of scope

### 5. Write the spec
Save to `.kiro/specs/<topic>/design.md` (or project-preferred location). The spec must be:
- Self-contained — readable by someone with no context
- Concrete — no "TBD", "TODO", or "handle edge cases"
- Verifiable — success criteria are testable

### 6. Self-review
Before presenting the written spec, scan it for:
- Placeholders or vague language
- Internal contradictions
- Scope creep beyond the original goal
- Missing verification criteria

### 7. User approves, then transition
Only after explicit approval, move to implementation. For multi-step work, invoke `writing-plans` next. For single-step changes, proceed directly.

## Anti-patterns

| Wrong | Right |
|---|---|
| "This is simple, I'll just code it" | Gate applies regardless of perceived simplicity |
| Dumping the entire design in one message | Section by section, approval after each |
| One open-ended question, then coding | Multiple rounds of clarification until the shape is clear |
| "I'll figure out edge cases during implementation" | Edge cases change design — surface them now |

## What good looks like

The user should be able to hand your spec to a developer with zero context and get the right implementation. If they'd need to ask follow-up questions, the spec isn't done.
