---
name: Preview UI mode
description: The current frontend is intentionally running without live auth or backend services.
---

The frontend is a faithful copy of the public DevAudit UI, with a preview-only auth gate and local sample responses so the complete navigation can be explored without the backend or database.

**Why:** The product is being visually iterated before live identity, persistence, and repository services are connected.

**How to apply:** Keep preview data and the authentication-coming-soon gate until the user explicitly asks to wire the backend back in.