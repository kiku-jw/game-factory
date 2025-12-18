# Contributing to Game Factory

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to Game Factory. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## How Can I Contribute?

### Reporting Bugs
*   Check if the bug is already reported in the Issues.
*   If not, create a new issue with a clear title and description.
*   Provide as much info as possible (OS, Node version, logs, etc.).

### Suggesting Enhancements
*   Enhancement suggestions are tracked as GitHub issues.
*   Explain why this enhancement would be useful.

### New Game Templates
We love new genres and templates!
1. Create a new JSON file in `templates/[genre]/[name].json`.
2. Ensure it follows the `GameTemplate` interface in `src/server/types/index.ts`.
3. Add a test case if necessary.

### Pull Requests
1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes (`pnpm test`).
5. Make sure your code lints (`pnpm run lint`).

## Styleguides

### Git Commit Messages
*   Use the present tense ("Add feature" not "Added feature")
*   Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
*   Limit the first line to 72 characters or less
*   Reference issues and pull requests liberally after the first line

### TypeScript Styleguide
*   Use functional components for React widgets.
*   Ensure all types are properly exported in `src/server/types/index.ts`.
*   Avoid `any` at all costs.

## Questions?
Feel free to open an issue for any questions you might have!
