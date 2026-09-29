# 01: Prefactor: the Night module behind the existing scoreboard

Spec: [Even scoring across games](../../even-scoring/spec.md). Vocabulary: the domain glossary (`CONTEXT.md`).

**What to build:** A pure **Night** module (no DOM access) becomes the owner of what the shared scoreboard state holds today: the mode, the entities, and their scores. Every **entity** gets a stable id, so scores are keyed by id rather than by position. The existing `award()` and `entities()` calls become thin adapters over the Night, so no game module changes yet.

From the room's point of view **nothing changes**: every game plays and scores exactly as before. This ticket makes the later slices easy.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Vitest is added as a dev dependency, with a `test` script; `npm run build` still typechecks and bundles.
- [ ] The Night module holds the mode, the entities (stable id, name, colour) and each entity's current score, and exposes setup operations (set mode, set team count, add entity, rename) plus score reads and writes. It has no DOM access.
- [ ] The shared scoreboard state is backed by the Night; `award()` and `entities()` keep their signatures as adapters, so every game module works unchanged.
- [ ] An entity's colour stays with the entity, not its position in the list.
- [ ] Tests cover the setup operations through the Night's public interface only.
- [ ] By hand: every scoring game still awards points and the scoreboard row still shows them, in team mode and free-for-all.
