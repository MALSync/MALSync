@AGENTS.md

## Project skills (`.claude/skills/`)

Skills add task-specific workflows and deeper reference on top of the `AGENTS.md` files. They never restate those files; they point to them.

| Skill | Covers | Sources it documents |
|---|---|---|
| `writing-chibi-integrations` | Writing, fixing and reviewing chibi site integrations; ChibiScript runtime semantics, lifecycle and engine internals; page tests | `src/pages-chibi/**`, `src/pages-adult/**`, `src/chibiScript/**`, `src/pages-sync/**`, `test/headless/**`, `test/chibiDev/**`, `test/index.ts`, chibi parts of `webpackConfig/` |
| `running-malsync-locally` | Setup, builds, watch mode, chibi CLI, loading the extension, tests, CI parity, troubleshooting | `package.json`, `.npmrc`, `.mcp.json`, `webpackConfig/**`, `.github/workflows/**`, `test/**` |

## Keeping skills and agent docs up to date (self-maintenance)

Whenever Claude creates or updates a commit or PR in this repo, **including PRs that have nothing to do with Claude config**, it checks whether the change makes any statement in `CLAUDE.md`, any `AGENTS.md`, or `.claude/skills/**` wrong, incomplete or outdated. If so, it updates them in the same commit/PR. Outdated agent docs count as a bug introduced by the change.

1. Map changed paths to skills with the "Sources it documents" column above. Then grep `.claude/skills`, `AGENTS.md` files and `CLAUDE.md` for changed identifiers: function names, npm scripts, file paths, env vars, hook names, CLI flags.
2. Typical triggers: added/renamed/removed npm scripts, ChibiScript functions, `PageInterface` fields, lifecycle behaviour, test-harness behaviour, build outputs, generated files, CI steps, env vars, engine versions, or a new implementation that is a better example of a pattern.
3. Edit the one file that owns the fact; each fact lives in exactly one place and other files link to it. Maintainer-written `AGENTS.md` files own anything they cover; skills only add what they don't. New facts go into the file whose topic fits, or into a new single-topic file that is registered in that skill's `SKILL.md` router and file map.
4. When a new area of the codebase gets a repeatable workflow that no skill covers, propose a new skill (or create one when asked).
5. Mention the doc/skill updates in the commit message or PR description.
6. If code and docs disagree and the intended behaviour is unclear, trust the code and flag the discrepancy to the user.

## Skill authoring rules

Apply these whenever creating or updating a skill in `.claude/skills/`. They follow Anthropic's skill-authoring best practices (platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) and the Claude Code skills docs.

- **Layout:**
  - `<skill>/SKILL.md`: the hub.
  - `<skill>/workflows/*.md`: step-by-step procedures, each with a copyable checklist.
  - `<skill>/reference/*.md`: facts, one topic per file.
  - `<skill>/scripts/`: deterministic helpers that are run, not read.
  - Use forward slashes and descriptive kebab-case file names.
- **SKILL.md is a router, not a manual.** It contains:
  - frontmatter and a short intro;
  - at most ~8 rules that apply to every task;
  - a task router table listing **every** file to read for each task (including the relevant `AGENTS.md`);
  - a file map with one line per file.
  Keep it ≤ ~100 lines, far below the 500-line limit. Claude Code keeps only the first 5,000 tokens of a skill after context compaction.
- **One level deep:** link every workflow/reference file directly from `SKILL.md`. Files may mention siblings, but no file may be reachable only through another reference file. The router groups related files so nothing gets missed.
- **Per-file budget:** one topic per file, ideally ≤ ~150 lines; split at ~200. Any file over 100 lines starts with a `## Contents` list.
- **Frontmatter:**
  - `name`: lowercase-hyphenated, ≤ 64 chars, gerund form preferred (`writing-…`, `running-…`), no "claude"/"anthropic".
  - `description`: third person, ≤ 1,024 chars, states what the skill does **and** when to use it with concrete trigger terms. Make it slightly "pushy" to avoid under-triggering.
- **Content:**
  - Be concise and skip what Claude already knows.
  - Give each rule with its reason, and use one term per concept.
  - Offer a default rather than many options, and avoid time-sensitive statements.
  - Use concrete examples from this repo, and name the source-of-truth files so the reader can verify against the code.
- **No duplication:** never copy content from `AGENTS.md` files or generated references (e.g. `src/chibiScript/FUNCTIONS.md`); route to them instead.
- **Workflows:** numbered steps plus a checklist, and a validate → fix → repeat loop (build, test, lint) before declaring done.
- **Verification:** every path, script, function and field a skill mentions must exist in the repo when written. Check with grep/ls before saving.
