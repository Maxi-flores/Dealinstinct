# Dealinstinct V2 Decisions

This file is append-only. Add a new ADR when a durable decision changes repo governance, architecture, workflow, dependencies, or runtime behavior.

## ADR-001: Repo Receives Sentient/Sapient Agent Contract

Date: 2026-05-23

Status: Accepted

Dealinstinct V2 receives a repo-specific `Agent.md` contract so future agent work has explicit local boundaries, validation expectations, and documentation duties.

## ADR-002: Agents Work In Branches Before Master/Main

Date: 2026-05-23

Status: Accepted

Agents must perform work in task branches before any merge to `master` or `main`. Stable branches only receive reviewed, documented changes.

## ADR-003: Product Code Changes Require Validation And Orchestration Logging

Date: 2026-05-23

Status: Accepted

Any product-code change requires relevant validation and an `Orchestration.md` entry describing files changed, reason, validation, and remaining risks.
