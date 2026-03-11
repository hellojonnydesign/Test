# CLAUDE.md

This file provides guidance to AI assistants (Claude and others) working with this repository.

## Repository Overview

- **Repository**: `hellojonnydesign/Test`
- **Status**: Newly initialized — no application code exists yet.
- **Primary branch**: `main` (or as configured on the remote)

> **Note for AI assistants**: This repository is empty at the time of this file's creation. Update this document as the project's structure, stack, and conventions are established.

---

## Development Branch Conventions

AI assistants working on tasks for this repository should follow this branching pattern:

- Feature/task branches must begin with `claude/` and end with the session ID.
- Example: `claude/claude-md-mmmjko38oe2sow9j-pzEcV`
- Never push to `main` directly without explicit permission.
- Use `git push -u origin <branch-name>` for all pushes.

---

## Git Workflow

```bash
# Create and switch to the task branch
git checkout -b claude/<task-slug>-<session-id>

# Stage and commit changes
git add <specific-files>
git commit -m "feat: descriptive message"

# Push the branch
git push -u origin claude/<task-slug>-<session-id>
```

### Commit Message Style

- Use the imperative mood: `Add`, `Fix`, `Update`, `Remove`
- Keep the subject line under 72 characters
- Reference issue/PR numbers where relevant: `Fix login redirect (#42)`

---

## Project Structure

> To be filled in once the project is initialized. Update this section with the actual directory layout, e.g.:

```
/
├── src/          # Application source code
├── tests/        # Test suites
├── docs/         # Documentation
├── package.json  # (Node) or pyproject.toml (Python) or equivalent
└── CLAUDE.md     # This file
```

---

## Technology Stack

> Update this section once the stack is decided. Examples:

- **Language**: (e.g., TypeScript, Python, Go)
- **Framework**: (e.g., Next.js, FastAPI, Django)
- **Database**: (e.g., PostgreSQL, SQLite)
- **Testing**: (e.g., Jest, pytest, Vitest)
- **Linter/Formatter**: (e.g., ESLint + Prettier, Ruff, gofmt)

---

## Development Setup

> Fill in once the project is bootstrapped. Template:

```bash
# Install dependencies
npm install          # Node
# or
pip install -e .     # Python

# Run the development server
npm run dev

# Run tests
npm test
# or
pytest

# Run linter
npm run lint
# or
ruff check .
```

---

## Testing Conventions

- Write tests alongside new features before marking work complete.
- All tests must pass before opening a pull request.
- Aim for meaningful coverage on business logic; avoid testing implementation details.

---

## Code Style & Conventions

- Prefer editing existing files over creating new ones.
- Avoid over-engineering: implement only what is asked.
- Do not add comments unless the logic is genuinely non-obvious.
- Do not introduce security vulnerabilities (SQL injection, XSS, command injection, etc.).
- Validate at system boundaries (user input, external APIs); trust internal guarantees.

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `CLAUDE.md` | AI assistant guidance (this file) |

> Add entries here as important files are created (e.g., config files, entry points, schema definitions).

---

## Security Considerations

- Never commit secrets, credentials, `.env` files, or API keys.
- Use environment variables for all sensitive configuration.
- Validate and sanitize all external input.

---

## Updating This File

This file should be kept current. Update it when:

- The tech stack or tooling changes.
- New conventions are adopted by the team.
- The project structure changes significantly.
- New key files or configuration patterns are introduced.
