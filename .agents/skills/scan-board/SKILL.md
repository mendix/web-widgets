---
name: scan-board
description: Pick a Jira ticket assigned to you (or a named teammate), set up an isolated worktree, and produce a validated plan. Stops before writing code.
---

# scan-board

Take a Jira ticket from assigned to planned.

Terminal state: a worktree exists on its own branch, holding a spec whose tasks cover every
acceptance criterion in the ticket. Implementation is a separate invocation.

**Input** — optional. `/scan-board` uses your own board. `/scan-board WC-1234` goes straight to
that ticket. `/scan-board Samuel` scans that teammate's board (see [Whose board](#whose-board)).

## Prerequisites

Check these before anything else. All three are one-time setup.

### 1. The `jira` skill

Look for a `jira` skill in the available skills list. Missing → stop and link them:

> `scan-board` needs the `jira` skill. Get it from
> <https://gitlab.rnd.mendix.com/devops/ai-tools/skills/-/tree/main/internal/jira>
> and install it under `~/.claude/skills/jira/`, then re-run `/scan-board`.

### 2. The `jira` CLI

```bash
which jira || echo MISSING
```

Missing → `brew install ankitpokhrel/jira-cli/jira-cli`, then `jira init` (server
`https://mendix.atlassian.net`, login = their Mendix email, project `WC`, Cloud, auth type `basic`).

### 3. Jira API token in the keychain

```bash
security find-generic-password -a "<their-email>" -s "jira-agent-token" -w >/dev/null 2>&1 \
  && echo FOUND || echo MISSING
```

Missing, or the auth check below fails → walk them through [Token setup](#token-setup).
Do not proceed until it passes.

## Token setup

Give these steps **one at a time** and wait after each. The whole thing is one-time.

**Step 1** — create the token at <https://id.atlassian.com/manage-profile/security/api-tokens>
("Create API token", any label). Copy it; Atlassian shows it once.

**Step 2** — read it into a shell variable. Ask them to run this in _their_ terminal:

```bash
read -r -s "JIRA_TOKEN?Paste the full Jira token: "
printf '\n'
```

Reading into a variable is not optional. Passing the token as a `security` argument truncates it
at 128 characters — a known limitation — and the stored token then fails auth in a way that looks
like a bad token rather than a truncated one.

**Step 3** — store it, substituting their own email:

```bash
security add-generic-password -U \
  -a "name.surname@mendix.com" \
  -s "jira-agent-token" \
  -l "Jira API token" \
  -j "Local agentic coding access" \
  -T "" \
  -w "$JIRA_TOKEN"
```

**Step 4** — clear the variable:

```bash
unset JIRA_TOKEN
```

**Step 5** — when they confirm, verify it yourself with the auth check below. Passing → tell them:

> Token stored and verified. `/scan-board` is ready — this was one-time setup.

Failing → report the HTTP code and which step to redo. Never echo the token or any substring.

## Auth

```bash
export JIRA_USER="<their-email>"
export JIRA_API_TOKEN=$(security find-generic-password -a "$JIRA_USER" -s "jira-agent-token" -w | tr -d '\n\r')
export JIRA_SERVER="https://api.atlassian.com/ex/jira/$(curl -s https://mendix.atlassian.net/_edge/tenant_info | sed 's/.*"cloudId":"\([^"]*\)".*/\1/')"

curl -s -o /dev/null -w "%{http_code}\n" -u "$JIRA_USER:$JIRA_API_TOKEN" "$JIRA_SERVER/rest/api/3/myself"
```

**`JIRA_SERVER` must be the `api.atlassian.com/ex/jira/<cloudId>` gateway host, not
`mendix.atlassian.net`.** The Mendix tenant has Basic-auth-over-REST disabled on the site host,
so site-host requests 401 — and issue reads 404 with a misleading "does not exist or you do not
have permission". The gateway host accepts Basic auth with a classic `ATATT` token. `cloudId` is
discoverable without auth via `/_edge/tenant_info`, so this needs no hardcoding.

`jira` CLI reads `JIRA_SERVER` and `JIRA_API_TOKEN` from the environment, so exporting these makes
the CLI work too. Without `JIRA_SERVER` it falls back to the site host from `~/.config/.jira/.config.yml`
and every query returns "No result found" — an empty board, not an error.

Not `200` → **stop**, and go to [Token setup](#token-setup).

### Whose board

| Invocation            | Assignee filter                                  |
| --------------------- | ------------------------------------------------ |
| `/scan-board`         | `-a"$(jira me)"`                                 |
| `/scan-board Samuel`  | resolve the name first (below)                   |
| `/scan-board WC-1234` | none — skip to [Route the repo](#route-the-repo) |

A bare first name does **not** work as an assignee filter; only the full display name or the email
does. Resolve it:

```bash
curl -s -u "$JIRA_USER:$JIRA_API_TOKEN" -G "$JIRA_SERVER/rest/api/3/user/search" \
  --data-urlencode "query=<name>" --data-urlencode "maxResults=10"
```

One active `atlassian` match → use its `emailAddress`. Several → ask which. None → say so and stop.

## Pick the ticket

```bash
jira issue list -a"<assignee>" -s"In Progress" --plain --columns key,type,status,summary,labels
```

Also worth offering when the board is otherwise empty: drop `-s"In Progress"` for everything
unresolved. The user picks. Empty → report that nothing is assigned and stop.

`--columns` cannot show components or parent, which the routing step needs. Get those per-ticket:

```bash
jira issue view <KEY> --plain
```

That renders component, labels, parent, watchers, and the full description in one view.

## Route the repo

| Repo        | Path                                        | Base branch |
| ----------- | ------------------------------------------- | ----------- |
| web-widgets | the repo you are in                         | `main`      |
| appdev      | `../appdev` relative to web-widgets, or ask | `master`    |

**The `components` field is the strongest signal — read it first.** The WC project has ~80
components and their suffix does the routing:

| Component suffix / name                                               | Route                                                                        |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `(widget)`, `(core widget)`, `(module)`                               | `web-widgets`                                                                |
| `mendix/web-widgets (monorepo)`, `Test Projects (test)`               | `web-widgets`                                                                |
| `Core (react)`, `Atlas react`, `FrontEnd design`                      | ambiguous — read the summary; widget-specific wording wins for `web-widgets` |
| `(Dojo)`, `(mxui)`, `(starterapp)`, `Atlas Theme Files`, `atlas-core` | likely neither — raise it at the gate                                        |

No component set → fall back to text:

| → `web-widgets`                                        | → `appdev`                             |
| ------------------------------------------------------ | -------------------------------------- |
| widget names (datagrid, combobox, calendar, rich-text) | client, modeler, runtime, IDE          |
| `-web` suffix, MPK, Atlas UI, SCSS                     | Studio Pro internals, extensions       |
| pluggable widget API, Studio Pro toolbox               | `plz` / `please` build, mise toolchain |

Signals conflict or none match → carry it to the gate rather than guessing.

## Note linked Zendesk tickets

Only when the ticket's parent is `WC-3` (Support Tickets), its type is `Support-ticket`, or it
carries a `jira_escalated` label — these travel together on real support tickets.

```bash
curl -s -u "$JIRA_USER:$JIRA_API_TOKEN" \
  "$JIRA_SERVER/rest/api/3/issue/<KEY>/properties/com.atlassian.jira.issue:zendesk_for_jira:zendesk-glance:status"
```

Count is at `.value.value.label`. Do not attempt to reach Zendesk — it is SSO-gated with no API
path here. A Zendesk URL sometimes appears in the description text; that is a bonus, not a
guarantee, and the glance property is the only reliable signal.

Count > 0 → carry one line into the final report:

> **Zendesk:** `<n>` linked ticket(s), not accessible from here. If you have a repro, customer
> detail, or a test project from them, paste it and I'll fold it into the spec.

Non-blocking. Never gate on it.

## Gate: confirm understanding

Ask **once**, and only when one of these holds:

- repo routing is unclear
- the problem cannot be stated in one sentence from the Jira description
- the kind of work is unclear — fix, implement, research, or spike

> I understand `<KEY>` is about `<one sentence>`, in `<repo>`, and needs `<fix|implement|research|spike>`. Right?

None holds → do not ask. State the understanding as a line in the final report instead.

A Zendesk badge count is never a trigger. Support tickets routinely have no repro in Jira; treating
that as ambiguity would fire the gate on every one of them, collapsing it into an unconditional prompt.

## Create the worktree

```bash
KEY=wc-1234                 # lowercased ticket key
SLUG=short-kebab-summary
REPO=<repo path from routing>
WT="$(dirname "$REPO")/worktrees/$(basename "$REPO")-$KEY"

mkdir -p "$(dirname "$WT")"
git -C "$REPO" fetch origin
git -C "$REPO" worktree add -b "$KEY/$SLUG" "$WT" origin/<base branch>
```

`git worktree add` carries tracked files only, so verify the skills reached the worktree — a
worktree based on a commit older than the skills setup will not have them:

```bash
ls "$WT/.claude/skills" >/dev/null 2>&1 \
  || { mkdir -p "$WT/.claude"; ln -s "$REPO/.claude/skills" "$WT/.claude/skills"; }
```

appdev additionally needs its toolchain generated — without a `.mise.toml` the worktree cannot build:

```bash
cd "$WT" && ./setup-worktree-macos.sh
```

Branch or worktree path already exists → stop and report it. Do not reuse or delete either; an
existing branch usually means another agent is already on this ticket.

## Plan

Run from inside the worktree.

- **web-widgets** → the `openspec-propose` skill. Every change in this repo goes through openspec.
- **appdev** → a planning skill available in that environment (e.g. `superpowers:brainstorming`
  then `superpowers:writing-plans`). None available → use plan mode and say so in the report.

Feed the planner the ticket summary, description, acceptance criteria, and any context the user pasted.

## Gate: validate the spec against the ticket

Re-read the generated spec beside the Jira ticket. Every acceptance criterion in the ticket must
map to at least one task in the spec.

- Criterion with no task → add it to the spec. Do not ask.
- Spec asserts something the ticket contradicts → ask. This is real ambiguity.

Completion criterion: every acceptance criterion in the ticket is accounted for, each either mapped
to a named task or raised as a contradiction.

This gate is what catches a plausible spec for the wrong problem.

## Report and stop

```
Ticket    WC-1234 — <summary>  (<type>, <status>)
Under-    <one-sentence problem statement>
stood as
Repo      web-widgets
Worktree  <path>
Branch    wc-1234/<slug>
Spec      openspec/changes/<name>/
Zendesk   <n> linked ticket(s), not accessible from here — paste any repro or test project
Next      /openspec-apply to implement
```

Write no product code. Do not commit. Do not push.
