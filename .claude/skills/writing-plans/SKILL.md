---
name: writing-plans
description: Turn an approved design/spec into a step-by-step implementation plan with exact file paths, complete code, and verification commands. Invoke after brainstorming for multi-step work.
metadata:
  type: workflow
---

# Writing Plans

Turn a spec or requirements into a plan that an engineer with zero context can execute. Every task has exact file paths, complete code, verification steps. Bite-sized (2–5 min each). DRY. YAGNI. TDD. Frequent commits.

Aligned with: **Goal-Driven Execution** (CLAUDE.md principle #4).

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Save plans to:** `.claude/plans/<feature-slug>.md`

## Scope Check

If the design covers multiple independent subsystems, suggest breaking this into separate plans — one per subsystem. Each plan should produce working, testable software on its own.

## File Structure

Before defining tasks, map out which files will be created or modified:

- Design units with clear boundaries. Each file should have one clear responsibility.
- Files that change together should live together. Split by responsibility, not by technical layer.
- In existing codebases, follow established patterns. Don't restructure unless the file you're modifying has grown unwieldy — then including a split in the plan is reasonable.

## Bite-Sized Task Granularity

Each step is one action (2–5 minutes):

- "Write the failing test" — step
- "Run it to make sure it fails" — step
- "Implement the minimal code" — step
- "Run tests, verify pass" — step
- "Commit" — step

## Plan Document Header

```markdown
# [Feature Name] Implementation Plan

**Goal:** [One sentence]

**Architecture:** [2–3 sentences about approach]

**Tech Stack:** [Key technologies]

---
```

## Task Template

```markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.ext`
- Modify: `exact/path/to/existing.ext:123-145`

- [ ] **Step 1: Write the failing test**

```lang
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `test command`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```lang
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `test command`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.ext src/path/file.ext
git commit -m "feat: description"
```
```

## No Placeholders

Every step must contain actual content. These are plan failures — never write them:

- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the code)
- Steps that describe what to do without showing how
- References to types, functions, or methods not defined in any task

## Per-Task Commits

Don't commit after every 2–5 minute task. Batch commits into 1–3 meaningful units per PR. Follow the project's PR workflow: one PR per feature, no commit noise.

## Self-Review

After writing the plan, check:

1. **Spec coverage** — every spec requirement maps to at least one task
2. **Placeholder scan** — search for any of the banned patterns above
3. **Type consistency** — names and signatures used in later tasks match what was defined earlier

Fix issues inline. No need to re-review.

## Execution Handoff

After saving the plan:

> "Plan complete and saved to `docs/plans/<filename>.md`. Ready to implement. I'll work through each task, committing after each one. Sound good?"

Then execute task by task. Don't skip steps. Commit after completing a logical group of tasks (1–3 commits per feature).
