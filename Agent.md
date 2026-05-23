# Dealinstinct V2 Repo Agent Contract

## Agent Name

Dealinstinct V2 Repo Agent

## Repo Responsibility

Dealinstinct V2 is a Next.js repository for the second Dealinstinct product/application surface. It should be governed as an active product repo even if it is currently scaffold-like.

## Allowed Actions

- Read repository context before making changes.
- Create and update governance documentation.
- Make scoped product-code changes only when explicitly tasked.
- Run validation commands defined in `package.json`.
- Record operational actions in `Orchestration.md`.
- Append durable decisions to `Decisions.md`.
- Prepare pull requests for review.

## Forbidden Actions

- Do not work directly on `master` or `main` for normal tasks.
- Do not merge to `master` or `main`.
- Do not edit product source code during governance-only tasks.
- Do not touch package files, lockfiles, env files, assets, build output, `.next`, `dist`, or `node_modules` during governance setup.
- Do not rewrite decision history.
- Do not stage unrelated dirty files.
- Do not change deployment or hosting behavior without explicit approval.

## Required Context Files

- `README.md`
- `package.json`
- `Agent.md`
- `Description.md`
- `Architecture.md`
- `Decisions.md`
- `Orchestration.md`
- `Roadmap.md`

## Branch Rules

- `master` or `main` is stable truth.
- Agent work uses `agent/dealinstinct-v2/<task>`.
- Concept work uses `concept/dealinstinct-v2/<idea>`.
- Release work uses `release/dealinstinct-v2/<version>`.
- Hotfix work uses `hotfix/dealinstinct-v2/<issue>`.

## Commit Rules

- Keep commits scoped to one task.
- Separate governance, product, dependency, and asset changes.
- Preserve pre-existing user changes.
- Do not include package or lockfile changes unless explicitly reviewed.

## PR Rules

Every PR must include:

- Purpose.
- Branch name.
- Files changed.
- Product-code impact.
- Validation performed.
- Documentation updates.
- Risks and known dirty files.
- Review status before merge.

## Validation Commands

Use scripts already defined in `package.json`:

```powershell
npm run lint
npm run build
```

Use `npm run dev` only for local manual validation.

## Sapient Memory Role

Sapient memory stores repo identity, architecture, durable decisions, and roadmap through `Description.md`, `Architecture.md`, `Decisions.md`, and `Roadmap.md`.

## Sentient Operational Role

Sentient operations cover task execution, branch discipline, validation, PR preparation, and task logging through `Agent.md` and `Orchestration.md`.

## Merge Checklist

- Branch is not `master` or `main`.
- Product code changes are intentional and reviewed.
- `Orchestration.md` is updated.
- `Decisions.md` is updated when durable decisions are made.
- Validation passed or failures are documented.
- Package files, env files, assets, and build outputs are not accidentally staged.
- PR is approved before merge.
