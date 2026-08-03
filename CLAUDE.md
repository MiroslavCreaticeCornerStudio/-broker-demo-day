# CLAUDE.md

Claude Code starter for Skool Projects

## Configuration Hierarchy

Settings cascade in this order (later overrides earlier):

1. **Managed** (`managed-settings.json` / MDM plist / Registry): Organization-enforced, cannot be overridden
2. Command-line arguments: Single-session overrides
3. `.claude/settings.local.json`: Personal project settings (git-ignored)
4. `.claude/settings.json`: Team-shared settings
5. `~/.claude/settings.json`: Global personal defaults

To disable hooks for a session: set `"disableAllHooks": true` in `.claude/settings.local.json`.

## Subagent Orchestration

Subagents **cannot** invoke other subagents via bash commands. Use the Agent tool (renamed from Task in v2.1.63; `Task(...)` still works as an alias):

```
Agent(subagent_type="agent-name", description="...", prompt="...", model="haiku")
```

Be explicit about tool usage in subagent definitions. Avoid vague terms like "launch" that could be misinterpreted as bash commands.

### Subagent Definition Structure

Subagents in `.claude/agents/*.md` use YAML frontmatter:

- `name`: Subagent identifier
- `description`: When to invoke (use "PROACTIVELY" for auto-invocation)
- `tools`: Comma-separated allowlist (inherits all if omitted). Supports `Agent(agent_type)` syntax
- `disallowedTools`: Tools to deny, removed from inherited or specified list
- `model`: `haiku`, `sonnet`, `opus`, or `inherit` (default: `inherit`)
- `permissionMode`: e.g., `"acceptEdits"`, `"plan"`, `"bypassPermissions"`
- `maxTurns`: Maximum agentic turns before stopping
- `skills`: Skill names to preload into agent context
- `mcpServers`: MCP servers for this subagent
- `hooks`: Lifecycle hooks scoped to this subagent
- `memory`: Persistent memory scope — `user`, `project`, or `local`
- `background`: `true` to always run as a background task
- `effort`: `low`, `medium`, `high`, `max` (default: inherits from session)
- `isolation`: `"worktree"` to run in a temporary git worktree
- `color`: CLI output color

## Skill Definition Structure

Skills in `.claude/skills/<name>/SKILL.md` use YAML frontmatter:

- `name`: Display name and `/slash-command` (defaults to directory name)
- `description`: When to invoke (recommended for auto-discovery)
- `argument-hint`: Autocomplete hint (e.g., `[issue-number]`)
- `disable-model-invocation`: `true` to prevent automatic invocation
- `user-invocable`: `false` to hide from `/` menu (background knowledge only)
- `allowed-tools`: Tools allowed without permission prompts when skill is active
- `model`: Model to use when skill is active
- `context`: `fork` to run in isolated subagent context
- `agent`: Subagent type for `context: fork` (default: `general-purpose`)
- `hooks`: Lifecycle hooks scoped to this skill

## Workflow Best Practices

- Keep CLAUDE.md under 200 lines per file for reliable adherence
- `.claude/rules/*.md` with `paths:` YAML frontmatter are lazy-loaded only when Claude touches matching files; without frontmatter they load into every session
- Use commands for workflows instead of standalone agents
- Create feature-specific subagents with skills (progressive disclosure) rather than general-purpose agents
- Perform manual `/compact` at ~50% context usage
- Start with plan mode for complex tasks
- Use a human-gated task list for multi-step work
- Break subtasks small enough to complete in under 50% context

## Debugging Tips

- Use `/doctor` for diagnostics
- Run long-running terminal commands as background tasks for better log visibility
- Use browser automation MCPs (Claude in Chrome, Playwright, Chrome DevTools) for inspecting console logs
- Provide screenshots when reporting visual issues

## Answering Best Practice Questions

When asked a Claude Code best practice question, **search `best-practice/` in this folder first** before relying on training knowledge or web search.

## Git Commits

Follow standard commit conventions. Use clear, focused messages.
