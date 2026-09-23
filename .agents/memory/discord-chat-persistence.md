---
name: Discord chat persistence
description: Ordering constraint for the Discord Bot Cockpit cache.
---

Bot Cockpit messages must have their channel row upserted before message persistence.

**Why:** Chat messages reference the channel row and persistence intentionally uses a channel-backed insert, so saving a message first can silently produce no cached row even when Discord accepted the send.

**How to apply:** Any send or sync path that can encounter a previously unseen channel should upsert the channel before inserting messages.