# Making a New Release

> [!WARNING]
> If you are making frequent updates and see that the previous extension version is still under review for the respective platform(eg Chrome), ensure that you **remove** the previous version from review. If you lack permissions to remove a version from review, check the **README.md** for details about the maintainer for each platform. Then, contact the respective platform maintainers via a GitHub Issue to request the removal of the previous version's review before making a new release.
> Follow these steps to make a new release:

## 0. Check If the Previous Version Is Still in Review

An easy check to confirm if a previous version is still in review is to compare the version in your `package.json` with the version currently available on the Chrome, Firefox, or Edge store:

- If the version in your `package.json` is ahead of the version shown in the store, it means the addon is still in review on that platform.

You can also verify the version of `docFiller` and the extension through the badges in the `README.md` to check the status of the current versions on each platform.

- **If the previous version is still under review**, ensure you **remove** the previous version from review before making a new release. If you do not have permission to check/remove the version, check the **README** for the respective platform maintainers' contact information and open a GitHub issue to request removal of the previous version.

## 1. Update Version in `package.json`

- Open your `package.json` file and update the version number to the required one (e.g., `1.2.0`).
- Ensure that the version is incremented according to Semantic Versioning:
  - **Patch** version for bug fixes.
  - **Minor** version for new features or non-breaking changes.
  - **Major** version for breaking changes.

**Format:**

```json
{
  "version": "x.x.x"
}
```

## 2. Update the `CHANGELOG.md`

- Open `CHANGELOG.md`.
- Locate the entry for the **current unreleased version**. This may be in the format:

  ```text
  ## v<major>.<minor>.<patch> [Unreleased] (as of YYYY-MM-DD)
  ```

  - If the current version in `package.json` is different from the "unreleased" version in the changelog, **update** the version in the changelog to match `package.json`.
  - Change the entry format to:

    ```text
    ## v<major>.<minor>.<patch> (YYYY-MM-DD)
    ```

  - Create a new entry at the top for the **next release**. This should follow the format:

    ```text
    ## v<major>.<minor>.<next patch> [Unreleased] (as of YYYY-MM-DD)
    ```

  - List the new features, bug fixes, or changes made since the last release.

**Format:**

```text
## v<major>.<minor>.<next patch> [Unreleased] (as of YYYY-MM-DD)

- <List new features or fixes in the next release>

## v<major>.<minor>.<patch> (YYYY-MM-DD)

- <Description of changes since last release>
```

**Example:**
Before the change:

```markdown
## v1.2.0 [Unreleased] (as of 2025-01-10)

- Fixed bug in user authentication.
- Improved performance in data fetching.
```

After the change:

```markdown
## v1.3.0 [Unreleased] (as of 2025-01-17)

- Added new API endpoints for user data.
- Fixed issue with data saving.

## v1.2.0 (2025-01-17)

- Fixed bug in user authentication.
- Improved performance in data fetching.
```

## 3. Commit Changes

- Stage the changes (`package.json` and `CHANGELOG.md`) for commit.
- Run the following command to ensure that all pre-commit hooks pass:

  ```bash
  bun run precommit
  ```

- If everything passes, commit your changes with the following message:

  ```bash
  git commit -m "release(v<major>.<minor>.<patch>): <brief description of major changes>"
  ```

**Format:**

```bash
git add --all
bun run precommit
git commit -m "release(v<major>.<minor>.<patch>): <brief description of major changes>"
```

## 4. Tag the Release and Push

- Create a Git tag for the release:

  ```bash
  git tag v<major>.<minor>.<patch> # git tag v1.2.0
  ```

- Push the tag to the remote repository:

  ```bash
  git push --tags
  ```

- Push your changes to the `dev` branch:

  ```bash
  git push origin dev
  ```

**Format:**

```bash
git tag v<major>.<minor>.<patch>
git push --tags
git push origin dev
```

## 5. Monitor the Release Action

- Check the release action on GitHub to ensure everything is going smoothly.
- If any step fails or the tag is incorrect, **delete the tag**, debug the issue, and recreate the tag. To delete a tag:

  ```bash
  git tag -d v<major>.<minor>.<patch>
  git push --delete origin v<major>.<minor>.<patch>
  ```

**Format:**

```bash
git tag -d v<major>.<minor>.<patch>
git push --delete origin v<major>.<minor>.<patch>
```

## 6. Verify the Addon Publication

- Once the release is successfully pushed, the addon will be automatically published to the Firefox, Chrome, and Edge stores.
  - **Firefox** will update within 5~10 minutes.
  - **Chrome** and **Edge** updates may take **3-7 days** or longer.
