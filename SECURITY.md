# Security Policy

## Supported Versions

Security fixes are prioritized for the current RealmLab desktop release line.

| Version or branch | Security support |
| --- | --- |
| `main` and current desktop releases | Supported |
| Older releases, forks, or modified builds | Not covered unless the issue is reproducible in current RealmLab |

If you are unsure whether a version is affected, report against the newest
released RealmLab build and include the exact version, commit, operating system,
and installation method you tested.

## Reporting a Vulnerability

Please report security issues privately. Do not open a public issue with exploit
details, secrets, crash dumps, or proof-of-concept payloads.

Preferred reporting path:

1. Use GitHub private vulnerability reporting for this repository, if available.
2. If private reporting is not available to you, open a minimal public issue
   asking for a private maintainer contact path. Do not include exploit details
   in that issue.

Please include:

- Affected RealmLab version, commit, operating system, and installation method.
- The feature or surface involved, such as desktop app, local server, bot
  gateway, MCP plugin, built-in tool, updater, or configuration loading.
- Clear reproduction steps using dummy credentials and non-sensitive files.
- The expected impact, such as secret disclosure, arbitrary file access,
  command execution, sandbox escape, authentication bypass, or supply-chain risk.
- Relevant logs with API keys, tokens, local paths, and personal data redacted.

Do not send real provider API keys, bot credentials, OAuth tokens, private
workspace files, or third-party user data.

## Security Boundaries

RealmLab is a local coding workspace. Many features intentionally operate on the
user's machine and project folder, including file reads, file writes, shell
commands, MCP plugins, language servers, bot sessions, and model-provider
requests. A finding is security-relevant when it crosses a supported boundary or
bypasses an explicit guard.

Supported boundaries include:

- Workspace confinement for file operations that are documented or implemented
  as workspace-scoped.
- Permission checks for tool calls, shell commands, file writes, and approvals.
- Sandbox behavior for built-in shell execution where the platform supports it.
- Secret handling for provider keys, bot credentials, OAuth tokens, plugin
  headers, and credential-store fallback files.
- Local server protections, including localhost binding assumptions, JSON-only
  state-changing requests, and CORS restrictions.
- Desktop and bot session isolation, including per-workspace session metadata
  and configured bot allowlists.
- Updater, install, and release verification paths.

The following are normally trusted local/operator-controlled inputs unless
another bug lets an untrusted actor supply them:

- Text typed directly by the local user.
- Project configuration files intentionally loaded from the current workspace.
- Explicit file references supplied by the local user to attach local files.
- MCP servers, language servers, hooks, and commands installed or enabled by the
  local user.
- Provider base URLs and model names configured by the local user.

The following can be security issues when reachable by an untrusted actor or
when they bypass the intended boundary:

- Reading or writing files outside the configured workspace without explicit
  local-user intent.
- Following symlinks or path traversal to escape workspace confinement.
- Running shell commands or external tools without the required permission gate.
- Leaking credentials, environment variables, prompt history, local files, or bot
  messages to logs, model providers, MCP servers, crash reports, or telemetry.
- Allowing a website to drive the local server through CSRF, CORS, or
  content-type bypasses.
- Letting a bot user outside the configured allowlist submit prompts, approve
  tools, or access a project workspace.
- Trusting unverified update artifacts, plugin definitions, or downloaded
  binaries.

## Out of Scope

The following reports are usually out of scope unless they demonstrate a bypass
of one of the boundaries above:

- A local user intentionally asks RealmLab to read, edit, or send their own
  files to a configured model provider.
- A local user installs or enables a malicious MCP server, hook, command,
  language server, or shell command and then grants it permission.
- A configured model provider, proxy, or MCP server receives data the user
  intentionally sent to it.
- Denial-of-service issues that only affect the local user's own session and do
  not corrupt files, leak secrets, or bypass permissions.
- Issues requiring administrator/root access on the user's machine before
  interacting with RealmLab.
- Vulnerabilities in third-party services, models, proxies, or plugins that are
  not caused by RealmLab behavior.

## Coordinated Disclosure

Maintainers will make a best-effort assessment, ask follow-up questions when
needed, and coordinate fixes before public disclosure for confirmed
vulnerabilities.

Please give maintainers reasonable time to investigate and release a fix before
publishing exploit details. If you plan to disclose on a timeline, include that
timeline in your initial report.
