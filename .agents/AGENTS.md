# Workspace Rules

## GLOBAL RULES

1. **BRANCH DISCIPLINE**
   - Before writing any code, always create a new branch from the latest main/master.
   - Branch name must match the issue format: `feat/*`, `fix/*`, `docs/*`, `refactor/*`, `security/*`, `ci/*`.
   - Never commit to main directly.
   - One issue = one branch = one PR — never mix multiple issues in one branch.

2. **MERGE CONFLICT PREVENTION**
   - Always fetch and pull latest upstream/main before creating a new branch:
     `git fetch upstream && git merge upstream/main`
   - If upstream remote doesn't exist, add it first:
     `git remote add upstream <original-repo-url>`
   - Never rebase or force push a branch that already has an open PR.
   - If a conflict is detected, resolve it file by file — never blindly accept all incoming or all current.

3. **BEFORE WRITING ANY CODE**
   - Read and understand the full existing codebase structure first.
   - Identify all files that will be touched.
   - Check if similar code already exists to avoid duplication.
   - Show the user the complete diff/plan before applying any changes.

4. **CODE QUALITY**
   - Match existing code style, naming conventions, and file structure.
   - No unused imports, no console.log left in production code.
   - TypeScript: no `any` types unless absolutely unavoidable.
   - Every new file must have a brief comment at top describing its purpose.

5. **VERIFICATION BEFORE COMMIT**
   - Confirm the app builds without errors after changes.
   - Confirm no existing functionality is broken.
   - Check for circular imports if adding new modules.
   - Confirm no `.env` files, secrets, or `node_modules` are staged.

6. **COMMIT MESSAGE FORMAT**
   - `type(scope): description` — e.g. `feat(auth): add JWT refresh token`
   - Types: `feat`, `fix`, `docs`, `refactor`, `style`, `test`, `ci`, `chore`
   - Keep under 72 characters.
