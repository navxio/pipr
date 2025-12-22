# pipr

Project Intelligence & Planning Runtime

## Description

pipr is an experimental, open-source project planning runtime that uses LLMs and retrieval-augmented generation (RAG) to help teams and solo founders plan, triage, and maintain project context. It is designed to be developer-first, extensible, and production-ready as a hosted SaaS later while remaining fully usable as a self-hosted OSS tool.

⸻

## Goals / Motivation

• Reduce routine product management cognitive load (triage, task decomposition, meeting summaries).
• Make every decision and the reasoning behind it discoverable and auditable.
• Give small teams and solo founders superhuman project memory and context recall.
• Provide a composable agent runtime so teams can create domain-specific planning agents.

⸻

## Features (conceptual)

Core
• Goal-to-tasks decomposition — Agent converts high-level goals into scoped tasks with estimates, dependencies and acceptance criteria.
• Intelligent triage & prioritization — Auto-classify and prioritize incoming requests by urgency, impact, and dependency.
• RAG-backed context store — Local vector index (pgvector or equivalent) with embeddings for docs, meeting transcripts, commit messages, and historical decisions.
• Agent runtime (Mastra-based) — Compose agents and workflows (planner, triage, notifier, auditor) that can call tools and mutate canonical project state.
• Decision history / audit trail — Every agent suggestion includes provenance (retrieved snippets, confidence, timestamps); decisions are recorded in Postgres.

## Developer-focused

• Type-safe API using tRPC and shared TypeScript types across frontend/backend.
• Prisma + Postgres canonical store for ACID state: Project, Task, User, AgentRun, Decision models.
• Embeddings pipeline with configurable model providers and chunking strategy.
• Extensible tools interface so agents can call external systems (GitHub, Slack, Linear, Jira, CI/CD) through authenticated adapters.

UX / Product
• Modern React UI with multiple views: Kanban, Roadmap, Task list, Decision history, Agent suggestions side-by-side.
• Accept/Reject flow — Human-in-the-loop interface to accept or modify agent proposals; every action recorded.
• Notifications & nudges — Scheduled reminders, stale detection, and follow-up automation.

⸻

## Architecture Overview

• Frontend: React + tRPC client (in /apps/frontend). Renders agent outputs, collects user feedback, and forwards actions to backend.
• Backend: Fastify + tRPC server (in /apps/backend) that exposes canonical APIs and agent tool adapters.
• Agent Service: Mastra-based agent runtime (co-located or separate /apps/agents) responsible for running workflows and interacting with tools + vector DB.
• Database: Postgres + Prisma for canonical state. Optional Pgvector extension for vectors.
• Vector store: pgvector or external vector DB (Weaviate/Pinecone/Redis Vector) for embeddings and retrieval.
• Object store: S3-compatible storage for attachments and transcripts.
• Embedding & Model Providers: Pluggable provider layer (OpenAI, local LLMs, Anthropic, etc.) with config-driven selection.

⸻

## Agent Roles (examples)

• Planner — Breaks goals into tasks and proposes milestones.
• Triage agent — Classifies and assigns incoming tasks or issues.
• Summarizer — Converts meeting transcript → decisions + action items.
• Roadmap agent — Proposes roadmap adjustments based on velocity and priority.
• Auditor — Attaches provenance and records final decisions.

⸻

## Data Model (high level)

• Project: id, name, owner, metadata
• Task: id, projectId, title, description, estimate, status, assignee, dependsOn[]
• AgentRun: id, agentName, input, output, provenance, metrics, completedAt
• Decision: id, projectId, summary, rationale, sourceSnippets, createdBy (agent | user)

⸻

## Security & Privacy

• Pluggable access control for retrieval: queries to vector DB may be scoped per project or per user.
• Sensitive sources can be queried at runtime via authenticated tool adapters instead of indexing into a central RAG store.
• Audit logs capture agent tool calls, retrieved snippets, and user actions for accountability.

⸻

## Getting Started (developer)

Clone repo
pnpm install
pnpm --filter @pipr/backend dev (or run the dev script for the monorepo)
Run migrations: pnpm --filter @pipr/backend prisma migrate dev
Seed sample project and start frontend
Run a simple agent locally against a small README ingestion pipeline

⸻

## Roadmap / Milestones

• M1 — Core plumbing (week 0–2)
• monorepo scaffold (pnpm), Fastify + tRPC, React app scaffold, Prisma schemas, basic auth
• M2 — Minimal agent loop (week 2–4)
• integrate Mastra, run a basic “echo” agent, wire agent -> tRPC
• M3 — RAG pipeline (week 3–6)
• ingestion, embeddings, pgvector queries, provenance return
• M4 — Planner & Triage agents (week 5–10)
• goal→tasks; triage incoming issue flow; accept/reject UI
• M5 — UX polish + OSS launch (week 10–14)
• docs, README, contribution guide, licensing (BUSL/Apache decision)

⸻

## Contributing

• Open issues for feature requests and bugs
• Prefer small, focused PRs
• Include tests for backend logic and agent behavior where possible
• Tag PRs that change the agent contract or tool adapters

⸻

## License

• Proposed: Apache-2.0 if you want community adoption, or BUSL-style source-available if you prefer protecting hosted business.

⸻

- @domain: shared domain contracts (no IO, no framework code)
- @api: backend API surface (types only)
- apps/backend: API implementation
- apps/web: frontend client
