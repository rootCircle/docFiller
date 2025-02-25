# Changelog

## v1.4.6 [Unreleased] (as of 2025-02-26)

## v1.4.5 (2025-02-26)

- update models from `gpt-4o` to `o3-mini`, `gemini-pro` to `gemini-2.0-flash-lite` and `claude-3-5-sonnet-latest` to `claude-3-7-sonnet-latest`.
- bump deps

## v1.4.4 (2025-01-23)

- fix: android firefox release was broken in CI/CD pipeline, fixed that

## v1.4.3 (2025-01-23)

- hotfix: corrupted extension

## v1.4.2 (2025-01-22)

- hotfix: codon gif not showing on firefox

## v1.4.1 (2025-01-17)

- chore: move profile avatar to local

## v1.4.0 (2025-01-12)

- fix: leaking storage data in option page when clicked on reset/export metrics button
- fix: fix watcher script failing on public directory changes after 2~3 changes!
- chore: add favicons and title on options/popup pages
- docs: update Privacy policy

## v1.3.2 (2024-12-27)

- Change linter, formatter to biome for js,ts files.
- Automated release for Chrome, Edge and Firefox

## v1.3.1 (2024-12-26)

- Dark Theme (enabled by default)
- fix: TIME and TIME_WITH_MERIDIEM fields parsing errors.
- build: dynamic manifest for different browser
- ci: release action to trigger automated release

## v1.3.0 (2024-12-17)

- Added: Metric functionality for tracking form completion statistics
- New: (Magic Profile)'Codon' profile with automatic system prompt selection based on form context
- Enhanced: Form analysis and response generation
- fix: issue with API key not being reset after erase.
- feat: improve dropdown handling
- feat: skip marked questions
- chore: improved password input toggles
- feat: toast notification, instead of JS prompts

## v1.2.0 (2024-12-08)

- Change bundler from **bun** to [esbuild](https://esbuild.github.io).
- fix: UI default cases due to wrong use of `||` instead of `??`. (caused enable/disable button to be always enabled in spite of internal values).
- fix: missing Get API Links in Consensus enabled fields in options page.
- fix issues with Time and Duration fields (see more in #58, #59)
- fix: permission issue causing extension to skip running on first load

## v1.1.2 (2024-12-07)

Same as v1.1.1, re-released due to issue in Firefox AMO registry.

## v1.1.1 (2024-12-07)

- Added pirate profile as new built-in profile
- feat: Edit custom profile
- Improved system prompts for builtin prompts

## v1.1.0 (2024-12-06)

- **Fix**: Now `docFiller` doesn't fill on editable Google Forms as well.
- Remove unused dependencies from `package.json`
- Updated dependencies to their latest version.
- Squashed major bugs (skipping 2~3 initial forms while filling).

- feat: docfiller now supports enable/disable as well with custom fill button if disabled.
- feat: docFiller now also supports custom profiles as well, to improve the prompt and make it sound more natural.
- feat: We have improved the UI of docFiller popup to make it more helpful for naive users.
- From now on if you don't have API keys filled in popup will warn you to fill in.
- API key is now hidden by default for enhanced security and privacy!

What to expect in future?
As docFiller moves more towards stability, we want to focus more on improving UI/UX and prompts as well. One of the requested features, we acknowledge was to not fill the forms that has been manually/automatically filled earlier, to save costs and time, but it might take some time to see it in docFiller yet as it requires some arch changes.

## v1.0.2 (2024-11-19)

- **Fix**: Improved UX.
- **Added**: Terms of Use and Privacy Policy in the extension.
- **Added**: Links to fetch API keys for different AI platforms.

## v1.0.1 (2024-11-19)

- **Fix**: Resolved issue where Multiple Choice Zod validation failed.
