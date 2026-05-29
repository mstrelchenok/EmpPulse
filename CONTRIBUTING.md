# Contributing Guide

## Branching

Branches are created off `main` and merged back via pull request.

Use lowercase kebab-case with a short, descriptive name:

```
feature/short-description
```

Examples:
```
feature/leave-request-overlap-check
feature/default-week-hours-inheritance
feature/employee-department-transfer
```

Keep branch names concise — they don't need to include the ticket number.

---

## Commits

### Format

Every commit message must start with a Jira ticket reference or `[none]`, followed by an imperative-mood description starting with a capital letter.

```
[EM-<number>] <Description>
[none] <Description>
```

### When to use `[EM-<number>]`

Use a ticket prefix when the commit addresses a feature, bug, or task tracked in Jira. A corresponding `EM-<number>` ticket must exist before the commit is pushed.

Use `[none]` for changes too small or trivial to warrant a Jira task — typo fixes, minor formatting, small config tweaks, etc.

### Simple commits (single line)

One line is enough when the change is self-contained and the title fully explains it.

```
[EM-42] Add overlap validation for logged hours
[EM-87] Send notification email on leave request creation
[none] Fix typo in Department entity comment
```

### Complex commits (title + bullet points)

When the change is large or touches multiple concerns, add a blank line after the title and describe the changes as bullet points.

```
[EM-115] Implement vacation balance calculation

- Add yearly vacation balance field to Employee
- Aggregate Premium vacation days per employee per year
- Expose calculated balance in the employee detail endpoint
- Cover edge case where no premium days exist for the year
```

### Rules at a glance

| Rule | Detail |
|---|---|
| Prefix | Always `[EM-<number>]` or `[none]` |
| Mood | Imperative — "Add", "Fix", "Remove", not "Added" or "Fixes" |
| Capitalisation | First word after the prefix is capitalised |
| Ticket creation | Create the Jira task before pushing; the ticket must exist |
| Body format | Bullet points, only when the commit is complex |
| Blank line | Required between title and bullet body |

### More examples

```
[EM-9] Enforce unique email constraint among active users
[EM-34] Auto-merge adjacent logged hours on creation
[EM-61] Delete pending leave requests on employee deactivation
[none] Reorder imports in LeaveService
[none] Update .gitignore

[EM-78] Implement default week hours inheritance logic

- Fall back to department hours when employee has none set
- Return no schedule when department hours are also unset
- Add unit tests for both fallback cases
```
