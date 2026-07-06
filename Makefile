lint:
	bun lint

format:
	bun format:check

format-fix:
	bun format

tsc:
	bun typecheck

build-firefox:
	bun run build:firefox

build-chromium:
	bun run build:chromium

build-safari:
	bun run build:safari

spell:
	bun run spell

webext:
	bun run webext:lint

precommit:
	bun run precommit
 
.PHONY: lint format tsc build webext precommit
