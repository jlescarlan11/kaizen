# kaizen

Initial monorepo scaffold for backend and frontend development.

## Clone the repository

```bash
git clone https://github.com/jlescarlan11/kaizen.git
cd kaizen
```

## Project structure

```text
kaizen/
  backend/
  frontend/
  .editorconfig
  .gitignore
  README.md
```

## Basic development setup

1. Install the toolchain required by each app as those stacks are selected.
2. Keep backend code under `backend/` and frontend code under `frontend/`.
3. Create feature branches from `main` and open a pull request for all changes.
4. Wait for required review approval before merge (enforced by branch protection).

## Suggested first steps

- Add backend runtime and package manager configuration.
- Add frontend framework bootstrap.
- Add CI checks (lint, test, build) and make them required on `main`.

## Pull request automation

Create a PR with the repository template prefilled automatically:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\create-pr.ps1
```

The command infers the PR title from the latest commit subject and auto-pushes the
current branch to `origin` if it does not have an upstream yet.
If `.github/.smart-pr-body.md` exists, it is used as the PR body; otherwise the
default template file is used.

Optional flags:

- `-Title "your pr title"` to override the inferred title (latest commit subject)
- `-Base main` to set a different base branch
- `-Draft` to open a draft PR
