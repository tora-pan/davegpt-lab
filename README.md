# DaveGPT Lab

> **An AI-native experimentation platform for building production-ready financial assistants.**

DaveGPT Lab is a side project inspired by Dave's mission of making financial services more accessible and approachable. Rather than building another generic chatbot, this project explores what a production-ready AI assistant could look like if it were deeply integrated into a financial application.

The goal is to focus on **LLM engineering**, **tool orchestration**, **conversation memory**, and **developer experience** rather than simply wrapping an LLM with a chat interface.

---

## Vision

Modern AI assistants shouldn't just answer questions—they should reason over user context, retrieve relevant information, invoke backend tools, and explain their decisions in a trustworthy way.

DaveGPT Lab aims to explore those concepts in a modular, production-inspired architecture.

Example interactions:

- *Can I afford dinner tonight?*
- *How much did I spend on groceries this month?*
- *What subscriptions am I paying for?*
- *Should I consider using ExtraCash this week?*
- *How much would I have left after paying rent?*

Instead of relying solely on the LLM's knowledge, the assistant will retrieve financial context and invoke domain-specific tools before generating a response.

---

# Goals

- Build a production-inspired LLM architecture
- Explore AI tool orchestration
- Experiment with long-term conversation memory
- Implement streaming AI responses
- Build a polished developer experience
- Keep every major system modular and replaceable
- Document architectural decisions throughout development

---

# Tech Stack

## Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- TanStack Query
- Zustand
- React Router
- Framer Motion

---

## Backend

- Node.js
- TypeScript
- Fastify
- PostgreSQL
- Drizzle ORM
- pgvector
- OpenAI SDK

---

## AI

The AI layer is intentionally framework-light to better understand the underlying mechanics of modern LLM applications.

Areas being explored include:

- Prompt orchestration
- Tool calling
- Conversation memory
- Embeddings
- Retrieval
- Context management
- Streaming responses
- Evaluation
- Token usage
- Prompt versioning

---

# High-Level Architecture

```
apps/
    web/
    api/

packages/
    ai/
    tools/
    prompts/
    database/
    shared/
    types/

docs/
docker/
```

The project is organized as a monorepo to encourage clean separation between the frontend, backend, AI orchestration, shared libraries, and infrastructure.

Each package is designed to evolve independently as the project grows.

---

# Core Features

## AI Chat

A conversational interface capable of streaming responses while maintaining conversation state.

---

## Tool Calling

Rather than relying exclusively on LLM reasoning, the assistant can invoke backend tools such as:

- Account balances
- Transactions
- Spending analysis
- Cash flow prediction
- Subscription lookup
- Budget insights
- Conversation memory

---

## Conversation Memory

Long conversations become difficult to manage efficiently.

The assistant will experiment with:

- Conversation summarization
- Embeddings
- Memory retrieval
- Context ranking
- Long-term memory

---

## Streaming Responses

Responses stream token-by-token to create a more natural conversational experience.

---

## Prompt Management

Prompts are versioned and organized independently from application logic to make experimentation easier.

---

## Developer Dashboard

A built-in debugging interface will expose:

- Tool calls
- Prompt composition
- Retrieved context
- Latency
- Token usage
- Estimated cost
- AI reasoning flow

This is intended to make the system transparent during development.

---

# Current Status

## Phase 1 — Foundation

- [ ] Monorepo setup
- [ ] Frontend scaffold
- [ ] Backend scaffold
- [ ] Shared packages
- [ ] Docker environment
- [ ] Database setup

---

## Phase 2 — Chat Experience

- [ ] Chat UI
- [ ] Streaming responses
- [ ] Conversation history
- [ ] Session persistence

---

## Phase 3 — AI Orchestration

- [ ] Prompt pipeline
- [ ] OpenAI integration
- [ ] Tool registry
- [ ] Tool execution
- [ ] Response generation

---

## Phase 4 — Memory

- [ ] Conversation summaries
- [ ] Embeddings
- [ ] Vector search
- [ ] Memory retrieval
- [ ] Context ranking

---

## Phase 5 — Financial Tools

- [ ] Mock transactions
- [ ] Balance lookup
- [ ] Spending insights
- [ ] Budget analysis
- [ ] Cash flow prediction
- [ ] Subscription detection

---

## Phase 6 — Developer Experience

- [ ] Tool execution viewer
- [ ] Prompt inspector
- [ ] Token usage
- [ ] Cost tracking
- [ ] Latency metrics
- [ ] Error tracing

---

## Phase 7 — Polish

- [ ] Responsive UI
- [ ] Animations
- [ ] Better error handling
- [ ] Documentation
- [ ] Testing
- [ ] Deployment

---

# Design Philosophy

The objective is not to build the most feature-rich chatbot.

Instead, this project emphasizes:

- Maintainability
- Observability
- Extensibility
- Developer experience
- Production-inspired architecture
- AI engineering best practices

Every major subsystem should be independently replaceable without affecting the rest of the application.

---

# Future Ideas

Some ideas currently being explored include:

- Multi-agent orchestration
- Financial planning workflows
- AI evaluations
- Prompt A/B testing
- Multiple model providers
- Function caching
- Model routing
- Voice conversations
- MCP integration
- Human-in-the-loop review
- Fine-grained permissioning

---

# Why This Project?

Large language models are quickly becoming application orchestrators rather than simple text generators.

DaveGPT Lab is an opportunity to explore what that architecture looks like in practice while experimenting with the design patterns, tooling, and infrastructure that support production-quality AI applications.