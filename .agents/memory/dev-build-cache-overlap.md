---
name: Dev/build cache overlap
description: Next.js development and production build processes can interfere when sharing the same .next directory.
---

Keep production builds separate from the running Next.js dev workflow when possible. If the dev server starts returning missing chunk or manifest errors after a build, restart the configured workflow once so Next can regenerate its development cache cleanly.

**Why:** Concurrent writes to the shared `.next` directory caused route-wide 500 responses even though type checking and the production build were successful.

**How to apply:** Run checks in a way that avoids overlapping `next dev` and `next build`; after any cache corruption, restart the existing workflow before diagnosing page code.