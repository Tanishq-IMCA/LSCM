---
name: Nested frontend installs
description: Package installation behavior for imported projects whose app lives below the repository root.
---

For imported projects whose runnable app is inside a nested directory, install dependencies from that app directory using its lockfile; the generic package helper may otherwise create a new root package manifest.

**Why:** The preview workflow runs from the nested app directory, so root-level dependencies do not make its binaries available.

**How to apply:** Check the workflow working directory and package manifest location before installing; keep generated root manifests out of the imported project.