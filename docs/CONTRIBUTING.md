# Contributing Guidelines

Thank you for considering contributing to docFiller! We welcome contributions from the community to help improve our project. Before you start, please take a moment to read and understand these guidelines to ensure a smooth collaboration.

## Table of Contents

1. [Development Setup](#development)
2. [Code of Conduct](#code-of-conduct)
3. [How Can I Contribute?](#how-can-i-contribute)
   - [Reporting Bugs](#reporting-bugs)
   - [Suggesting Enhancements](#suggesting-enhancements)
   - [Code Contributions](#code-contributions)
4. [Getting Started](#getting-started)
   - [Setting Up the Development Environment](#setting-up-the-development-environment)
   - [Forking the Repository](#forking-the-repository)
   - [Creating a Branch](#creating-a-branch)
   - [Making Changes](#making-changes)
5. [Submitting a Pull Request](#submitting-a-pull-request)
6. [Code Review](#code-review)
7. [License](#license)

## Development

If you're planning to contribute to the development of this web extension, here are some guidelines:

- Use `bun` instead of `npm`, `pnpm` or `yarn` while installing the packages, the project default package manager. You can install bun from [official website](https://bun.sh/).

- To get started, follow these steps:
  1. Clone the repository:

     ```bash
     git clone https://github.com/rootCircle/docFiller.git # Replace rootCircle with your username if you have forked the repo
     ```

  2. Install the required dependencies:

     ```bash
     bun i
     ```

  3. Test the extension:
  - Firefox

    ```bash
    bun run dev:firefox
    ```

    This will open a new Firefox window with the extension loaded.

  - Chromium

    ```bash
    bun run dev:chromium
    ```
  4. **Make your changes**: Make the changes you want in your local copy of the repository.

  5. **Test your changes**: Ensure that your changes work as expected. Test thoroughly before proceeding. Run lint checks before proceeding.

     ```bash
     bun run lint
     bun run format:check
     bun run precommit
     ```

     To fix a set of lint issues simply run `bun run lint:fix`. To fix formatting error, use `bun run format`.

  6. **Submit a Pull Request**: Once you've made your changes and tested them, submit a pull request (PR) to the original repository. Make sure to explain the changes you've made in the PR description.

## Code of Conduct

Please review and adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md) to maintain a friendly and inclusive environment for all contributors and users.

## How Can I Contribute?

There are several ways to contribute to our project:

### Reporting Bugs

If you encounter a bug or unexpected behavior, please [create a new issue](https://github.com/rootCircle/docFiller/issues/new) in our issue tracker. Provide a detailed description, including steps to reproduce the issue and any relevant error messages.

### Suggesting Enhancements

If you have an idea for an enhancement or new feature, you can open a new issue in the issue tracker to discuss it. Please include a clear and concise description of your suggestion.

### Code Contributions

If you want to contribute code to the project, follow the steps outlined below:

## Getting Started

### Setting Up the Development Environment

Follow instructions in [Development](#development) to smoothly set up your environment and get going. If you need any additional help, then please ask it out by creating a new issue.

### Forking the Repository

If you haven't already, fork our repository on GitHub by clicking the "Fork" button on the top right of the repository page. This creates a copy of the repository under your GitHub account.

### Creating a Branch

Before making changes, create a new branch to work in. Choose a descriptive name for your branch related to the issue or feature you're working on:

```bash
git checkout -b feature/your-feature-name
```

### Making Changes

Now you can make changes to the code. Ensure you follow the project's coding standards and guidelines. Commit your changes with clear and concise commit messages:

```bash
git add .
git commit -m "feat: Add your descriptive commit message here"
```

### Commits

It is a recommended best practice to keep your changes as logically grouped as
possible within individual commits.
There is no limit to the number of commits any single Pull Request may have, and
many contributors find it easier to review changes that are split across
multiple commits.

Please adhere to the general guideline that you should never force push to a
publicly shared branch.
Once you have opened your pull request, you should consider your branch publicly shared.
Instead of force pushing you can just add incremental commits;
this is generally easier on your reviewers.
If you need to pick up changes from main, you can merge main into your branch.

A reviewer might ask you to rebase a long-running pull request
in which case force pushing is okay for that request.

Note that squashing at the end of the review process should also not be done,
that can be done when the pull request is integrated via GitHub.

#### Commit message guidelines

```text
<type>: <short summary>
│             │
│             └── Summary in present tense.
|                 Not capitalized.
|                 No period at the end.
│
│
└── Commit Type: build | chore | ci | docs | feat | fix | perf | refactor | test
```

`<type>` must be one of the following:

- `build`: Changes that affect the build system or external dependencies
  (example scopes: `deps`, `dev-deps`, `metadata`)
- `chore`: Changes such as fixing formatting or addressing warnings or lints, or
  other maintenance changes
- `ci`: Changes to our CI configuration files and scripts (examples: `workflows`,
  `dependabot`, `renovate`)
- `docs`: Documentation only changes
- `feat`: A new feature
- `fix`: A bug fix
- `perf`: A code change that improves performance
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests

Use the `<summary>` field to provide a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes".
- Don't capitalize the first letter.
- No period (.) at the end.

### Documentation

If you make changes that affect the project's documentation, please update the documentation accordingly in the `/docs` directory.

## Submitting a Pull Request

When you're ready to submit your changes, push your branch to your forked repository on GitHub:

```bash
git push origin feature/your-feature-name
```

Then, open a Pull Request (PR) on the main repository. Be sure to provide a clear title and description of your changes.

## Code Review

Your PR will be reviewed by our maintainers, who may provide feedback or request further changes. Be responsive to their comments and update your branch as needed.

Once your changes are approved, they will be merged into the main branch, and your contribution will become part of the project!

## License

By contributing to this project, you agree that your contributions will be licensed under the GNU GPL 3.0 or later.

For more details, please refer to the [LICENSE](../LICENSE) file.

If you have any questions or need further assistance, feel free to reach out to us on Discord. (Invite Link will be there in the README)

We appreciate your contributions!
