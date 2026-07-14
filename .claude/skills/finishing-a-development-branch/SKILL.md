---
name: finishing-a-development-branch
description: Wrap up a development branch — verify tests, present merge/PR/keep/discard options, clean up. Invoke when all tasks on a branch are complete.
metadata:
  type: workflow
---

# Finishing a Development Branch

Clean completion workflow for a feature or fix branch. Verify everything is green, then present options.

## Process

### 1. Verify tests pass

```bash
# Run the full test suite
php artisan test
```

If tests fail, stop here. Fix them before proceeding.

### 2. Check git status

```bash
git status
git diff --stat origin/main...HEAD
```

Summarize what's on this branch: commits, files changed, anything uncommitted.

### 3. Determine branch state

- **Normal branch** with a remote tracking branch
- **Normal branch** without a remote (local only)
- **Detached HEAD** — no branch to merge

### 4. Present options

For a normal branch:

| Option | What it does | When to use |
|---|---|---|
| **Merge locally** | `git checkout main && git merge <branch>` | You're ready to integrate into main |
| **Push + create PR** | Push branch, open a PR via `gh pr create` | You want review before merging |
| **Keep as-is** | Leave the branch untouched | You're pausing or handing off |
| **Discard** | Delete the branch locally (and remote if pushed) | The work was experimental or abandoned |

For detached HEAD, omit Discard (you're not on a branch to delete).

### 5. Execute chosen option

**Merge locally:**
```bash
git checkout main
git pull origin main
git merge <branch>
git push origin main
```

**Push + PR:**
```bash
git push -u origin <branch>
gh pr create --title "..." --body "..."
```

**Discard (with confirmation):**
```bash
git checkout main
git branch -D <branch>
git push origin --delete <branch>  # if remote exists
```

### 6. Clean up worktree (if applicable)

If you're in a git worktree created for this branch:
- Merge or Discard → remove the worktree
- Push + PR → keep the worktree until the PR is merged
- Keep as-is → keep the worktree

## Common mistakes

| Wrong | Right |
|---|---|
| Forgetting to pull main before merging | Always `git pull origin main` first |
| Discarding without confirming the user wants that | "Discard" means permanent deletion — confirm explicitly |
| Leaving worktrees around after merging | Clean up worktrees for merged/discarded branches |
| Amending commits on a pushed branch | Only amend if the branch hasn't been pushed |

## Red flags

- Uncommitted changes when trying to finish — stash or commit first
- Tests not passing — never merge with failing tests
- Branch has diverged significantly from main — consider rebasing before merging
