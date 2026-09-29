# 03: End-of-game result screens

Spec: [Even scoring across games](../../even-scoring/spec.md). Vocabulary: the domain glossary (`CONTEXT.md`).

**What to build:** Ending a game now shows two host-paced screens before Home. **Beat 1**: the final game scores ranked, with the winner as the title, the winner's row glowing, and a burst of confetti in the winner's colour. **Beat 2**: tonight's standings shown in their old order, then sliding into the new order, each row showing the placement points it just earned ("+14"). Space or a button moves from beat 1 to beat 2, and from beat 2 to Home. The room never sees the formula, only "+N".

**Blocked by:** 02: Tracer bullet: a game in progress, End game, and derived night standings

**Status:** ready-for-agent

- [x] Beat 1 is full-screen: the game and "final scores" as a heading, "<winner> wins" as the title ("<a> & <b> tie for the win" for a shared top score), and every entity ranked by game score with its place number; the winner's row has the accent glow. No placement points on beat 1.
- [x] Confetti fires once as beat 1 appears, for about two seconds, in the winner's entity colour (both colours for a shared win); none when every entity ties; none when the system asks for reduced motion. No external asset.
- [x] With more than 6 entities, beat 1 shows two columns that read down each column.
- [x] "Tonight's standings →" or Space moves to beat 2: "Night standings", rows in the old order with old totals, then after a short pause each row slides to its new position, its total updates, and its "+N" appears. Ranks show, with tied totals sharing a place. Reduced motion skips the slide.
- [x] "Back to Home" or Space returns to Home, where the row shows the ranked standings; nothing else carries over from the result.
- [x] Place points, pie share and weight are never shown on these screens.
- [ ] By hand: 2 teams, 4 teams and a 12-player free-for-all all read from across a room.
