<!-- This file outlines the developer contribution guidelines and workflow for the Chaptered project. -->

# 🤝 Contributing to Chaptered

Welcome to **Chaptered**! We are thrilled that you want to contribute. This project is built in public, and whether you are fixing a typo, refactoring, or building a whole new feature, your help is highly valued.

To ensure a smooth experience for everyone, please follow these guidelines which match the **ELUSoC'26** contributor flow.

---

## 🙋 1. Getting Assigned

Before you start writing code:
- **Find an issue:** Check the [Issues](https://github.com/vanshika114/Ch.aptered/issues) tab.
- **Request assignment:** Comment on the issue you want to work on.
- **Wait for assignment:** Only begin working *after* a maintainer has formally assigned the issue to you.
- **No Unassigned Work:** PRs submitted for issues not assigned to you will not be merged.

---

## 🌿 2. Branch Naming

Always branch off from the latest `main` branch. Your branch name should match the type of issue:

- `feat/feature-name` (for new features)
- `fix/bug-name` (for bug fixes)
- `docs/topic-name` (for documentation changes)
- `chore/task-name` (for general tasks, config, refactoring, dependencies)

Example:
```bash
git checkout -b feat/user-authentication
```

---

## 🏷️ 3. PR Title Format

Your Pull Request title must follow this format to align with ELUSoC'26:

`[ELUSoC'26] <Brief description of your changes>`

Examples:
- `[ELUSoC'26] Add user authentication using JWT`
- `[ELUSoC'26] Fix broken PDF upload layout on mobile`
- `[ELUSoC'26] Add database seeding script for demo data`

---

## 📝 4. PR Description Requirements

When opening a Pull Request, please fill out the PR description with:
1. **Link to the Issue:** Explicitly state the issue it resolves (e.g., `Fixes #23` or `Closes #23`).
2. **Summary of Changes:** A clear, concise breakdown of what was added, modified, or removed.
3. **Screenshots / Recordings:** Required if your changes affect the User Interface (UI).
4. **Testing Performed:** Explain how you verified that your changes work.

---

## 📝 5. PR Checklist

Before submitting your PR, ensure you can check off the following:
- [ ] **Assigned:** I am formally assigned to the issue I am solving.
- [ ] **Branching:** My branch is named correctly (`feat/*`, `fix/*`, `docs/*`, `chore/*`).
- [ ] **Build & Lints:** The app builds successfully, and all linting/testing checks pass locally.
- [ ] **Secrets:** No `.env` or configuration secrets are committed or staged.
- [ ] **Dependencies:** No `node_modules` folders are staged or committed.

---

## 🏆 6. Difficulty & XP Labels

Issues are labeled by difficulty, corresponding to ELUSoC XP points:
- **`newbie`** (10 XP) - Good for first-time contributors or small, quick fixes.
- **`adventurer`** (25 XP) - Medium complexity, requires understanding existing logic.
- **`veteran`** (50 XP) - High complexity, architectural designs or key feature builds.

---

## 🚫 7. What NOT to Do

To keep our repository clean and organized, please avoid:
- **No PRs without assignment:** Do not submit a PR for an issue you were not assigned to.
- **No unrelated bundled changes:** Do not combine multiple unrelated features or bug fixes in a single branch or PR. One issue = one branch = one PR.

---

Thank you for contributing and helping write the next chapter of Chaptered! 📚
