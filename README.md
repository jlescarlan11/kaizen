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