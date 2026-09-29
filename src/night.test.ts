import { describe, it, expect } from 'vitest';
import {
  newNight,
  setTeams,
  setFreeForAll,
  addPlayer,
  removePlayer,
  rename,
  entitiesOf,
  startGame,
  award,
  endGame,
  gameInProgress,
  gameScoreOf,
  finishedGames,
  standings,
  placement,
  setGameScore,
  earnedIn,
  confirmTurn,
  turnsOf,
  nextTurn,
  unevenTurns,
  fullLaps,
  boardStatus,
  TEAM_COLORS,
  TEAM_NAME_DEFAULTS,
  type Night,
  type Board,
  type GameType,
} from './night';
import { WEIGHTS } from './weights';

const names = (n: Night) => entitiesOf(n).map((e) => e.name);
const gameScores = (n: Night) => entitiesOf(n).map((e) => gameScoreOf(n, e.id));
/** Each entity's night standings total, in entity order. */
const totals = (n: Night) =>
  entitiesOf(n).map((e) => standings(n).find((s) => s.entity.id === e.id)!.total);

/** Play a whole game: start it, award each entity its game score, end it.
 *  Jeopardy plays the English board unless another is given. */
function play(n: Night, type: GameType, scores: number[], board: Board = 'en'): void {
  startGame(n, type, board);
  entitiesOf(n).forEach((e, i) => award(n, e.id, scores[i] ?? 0));
  endGame(n);
}

describe('a new night', () => {
  it('has no mode and no entities yet', () => {
    const n = newNight();
    expect(n.mode).toBeNull();
    expect(entitiesOf(n)).toEqual([]);
  });
});

describe('team mode', () => {
  it('names teams from the defaults, each with its own colour', () => {
    const n = newNight();
    setTeams(n, 4);
    expect(names(n)).toEqual(TEAM_NAME_DEFAULTS);
    expect(entitiesOf(n).map((e) => e.color)).toEqual(TEAM_COLORS);
  });

  it('keeps renamed teams when the count grows, and drops the surplus when it shrinks', () => {
    const n = newNight();
    setTeams(n, 2);
    rename(n, entitiesOf(n)[0].id, 'Pharaohs');
    setTeams(n, 3);
    expect(names(n)).toEqual(['Pharaohs', TEAM_NAME_DEFAULTS[1], TEAM_NAME_DEFAULTS[2]]);
    setTeams(n, 2);
    expect(names(n)).toEqual(['Pharaohs', TEAM_NAME_DEFAULTS[1]]);
  });

  it('gives every entity a distinct id', () => {
    const n = newNight();
    setTeams(n, 4);
    const ids = entitiesOf(n).map((e) => e.id);
    expect(new Set(ids).size).toBe(4);
  });
});

describe('game scores', () => {
  it('start at 0 and add up in the game in progress, including negative awards', () => {
    const n = newNight();
    setTeams(n, 2);
    startGame(n, 'jeopardy', 'en');
    const [a, b] = entitiesOf(n);
    award(n, a.id, 400);
    award(n, a.id, -600);
    award(n, b.id, 200);
    expect(gameScores(n)).toEqual([-200, 200]);
  });

  it('go nowhere when no game is in progress', () => {
    const n = newNight();
    setTeams(n, 2);
    award(n, entitiesOf(n)[0].id, 5);
    startGame(n, 'emoji');
    expect(gameScores(n)).toEqual([0, 0]);
  });

  it('are kept when an entity is renamed', () => {
    const n = newNight();
    setTeams(n, 2);
    startGame(n, 'emoji');
    const [a] = entitiesOf(n);
    award(n, a.id, 3);
    rename(n, a.id, 'Pharaohs');
    expect(gameScoreOf(n, a.id)).toBe(3);
  });
});

describe('a game in progress', () => {
  it('is only one at a time', () => {
    const n = newNight();
    setTeams(n, 2);
    expect(startGame(n, 'emoji')).toBe(true);
    expect(startGame(n, 'wavelength')).toBe(false);
    expect(gameInProgress(n)?.type).toBe('emoji');
  });

  it('is never Outburst in free-for-all', () => {
    const n = newNight();
    setFreeForAll(n);
    ['Karim', 'Hana'].forEach((p) => addPlayer(n, p));
    expect(startGame(n, 'outburst')).toBe(false);
    expect(gameInProgress(n)).toBeNull();
    expect(startGame(n, 'emoji')).toBe(true);
  });

  it('needs somebody to play it', () => {
    const n = newNight();
    expect(startGame(n, 'emoji')).toBe(false);
    setFreeForAll(n);
    expect(startGame(n, 'emoji')).toBe(false);
  });

  it('counts for nothing in the standings until it ends', () => {
    const n = newNight();
    setTeams(n, 2);
    startGame(n, 'emoji');
    award(n, entitiesOf(n)[0].id, 6);
    expect(totals(n)).toEqual([0, 0]);
    endGame(n);
    expect(totals(n)).toEqual([15, 3]);
    expect(gameInProgress(n)).toBeNull();
  });

  it('ends with its game scores, the points each entity earned, and the standings before and after', () => {
    const n = newNight();
    setTeams(n, 2);
    const [a, b] = entitiesOf(n);
    play(n, 'emoji', [6, 4]);
    startGame(n, 'wavelength');
    award(n, a.id, 2);
    award(n, b.id, 8);
    const ended = endGame(n)!;
    expect(ended.type).toBe('wavelength');
    expect(ended.gameScores.map((g) => g.score)).toEqual([2, 8]);
    // 2-8 at 1.5x: (3 + 2) and (5 + 8) are 7.5 and 19.5, rounding up.
    expect(ended.earned).toEqual({ [a.id]: 8, [b.id]: 20 });
    expect(ended.before.map((s) => [s.entity.id, s.total])).toEqual([[a.id, 11], [b.id, 7]]);
    expect(ended.after.map((s) => [s.entity.id, s.total])).toEqual([[b.id, 27], [a.id, 19]]);
  });

  it('ends only once', () => {
    const n = newNight();
    setTeams(n, 2);
    play(n, 'emoji', [1, 0]);
    expect(endGame(n)).toBeNull();
    expect(finishedGames(n)).toHaveLength(1);
  });

  it('is a new game when the same type is played again', () => {
    const n = newNight();
    setTeams(n, 2);
    play(n, 'emoji', [6, 4]);
    play(n, 'emoji', [6, 4]);
    expect(finishedGames(n)).toHaveLength(2);
    expect(totals(n)).toEqual([22, 14]);
  });
});

describe('Jeopardy boards', () => {
  it('are separate games, each with its own placement points', () => {
    const n = newNight();
    setTeams(n, 2);
    play(n, 'jeopardy', [800, 900], 'en');
    play(n, 'jeopardy', [900, 800], 'ar');
    expect(finishedGames(n).map((g) => g.board)).toEqual(['en', 'ar']);
    expect(totals(n)).toEqual([72, 72]);
  });

  it('start only with a board', () => {
    const n = newNight();
    setTeams(n, 2);
    expect(startGame(n, 'jeopardy')).toBe(false);
    expect(startGame(n, 'jeopardy', 'ar')).toBe(true);
    expect(gameInProgress(n)?.board).toBe('ar');
  });

  it('are fresh, in progress, then played for the rest of the night', () => {
    const n = newNight();
    setTeams(n, 2);
    expect(boardStatus(n, 'en')).toBe('fresh');
    startGame(n, 'jeopardy', 'en');
    expect(boardStatus(n, 'en')).toBe('in-progress');
    expect(boardStatus(n, 'ar')).toBe('fresh');
    const ended = endGame(n)!;
    expect(ended.board).toBe('en');
    expect(boardStatus(n, 'en')).toBe('played');
  });

  it('can each be played only once a night, even when ended early', () => {
    const n = newNight();
    setTeams(n, 2);
    startGame(n, 'jeopardy', 'en');
    endGame(n);
    expect(startGame(n, 'jeopardy', 'en')).toBe(false);
    expect(startGame(n, 'jeopardy', 'ar')).toBe(true);
    endGame(n);
    expect(startGame(n, 'jeopardy', 'ar')).toBe(false);
  });

  it('are fresh again once the night is cleared', () => {
    const n = newNight();
    setTeams(n, 2);
    play(n, 'jeopardy', [1, 0], 'en');
    setTeams(n, 3);
    expect(boardStatus(n, 'en')).toBe('fresh');
  });
});

describe('night standings', () => {
  it('add up placement points, so a long game counts by its length, not its point scale', () => {
    // Emoji 6-4 is 11 / 7 at 1x; Jeopardy 800-900 is 8 / 10 at 4x, so 32 / 40.
    const n = newNight();
    setTeams(n, 2);
    const [a, b] = entitiesOf(n);
    play(n, 'emoji', [6, 4]);
    play(n, 'jeopardy', [800, 900]);
    expect(standings(n).map((s) => [s.entity.id, s.total, s.place])).toEqual([
      [b.id, 47, 1],
      [a.id, 43, 2],
    ]);
  });

  it('share the better place on a tie, keeping entity order', () => {
    const n = newNight();
    setTeams(n, 3);
    play(n, 'emoji', [0, 0, 0]);
    expect(standings(n).map((s) => [s.entity.name, s.place])).toEqual([
      [TEAM_NAME_DEFAULTS[0], 1],
      [TEAM_NAME_DEFAULTS[1], 1],
      [TEAM_NAME_DEFAULTS[2], 1],
    ]);
  });

  it('work the same in free-for-all', () => {
    const n = newNight();
    setFreeForAll(n);
    ['Karim', 'Hana', 'Salma'].forEach((p) => addPlayer(n, p));
    play(n, 'emoji', [5, 3, 2]);
    expect(standings(n).map((s) => [s.entity.name, s.total])).toEqual([
      ['Karim', 10],
      ['Hana', 6],
      ['Salma', 3],
    ]);
  });

  it('are all cleared when the mode or team count changes', () => {
    const n = newNight();
    setTeams(n, 2);
    play(n, 'emoji', [6, 4]);
    setTeams(n, 3);
    expect(totals(n)).toEqual([0, 0, 0]);
    startGame(n, 'emoji');
    setFreeForAll(n);
    expect(gameInProgress(n)).toBeNull();
    setTeams(n, 3);
    expect(totals(n)).toEqual([0, 0, 0]);
  });
});

describe('score corrections', () => {
  it('re-rank a finished game and update the standings at once', () => {
    // Jeopardy 800-900 is 32 / 40; corrected to 1400-900 it is 44 / 28.
    const n = newNight();
    setTeams(n, 2);
    const [a, b] = entitiesOf(n);
    play(n, 'jeopardy', [800, 900]);
    expect(totals(n)).toEqual([32, 40]);
    expect(setGameScore(n, 0, a.id, 1400)).toBeNull();
    expect(totals(n)).toEqual([44, 28]);
    expect(earnedIn(n, 0)).toEqual({ [a.id]: 44, [b.id]: 28 });
  });

  it('correct only the chosen finished game', () => {
    const n = newNight();
    setTeams(n, 2);
    const [, b] = entitiesOf(n);
    play(n, 'emoji', [6, 4]);
    play(n, 'emoji', [6, 4]);
    setGameScore(n, 1, b.id, 8);
    expect(finishedGames(n).map((g) => g.scores[b.id])).toEqual([4, 8]);
  });

  it('change only the game scores of the game in progress, not the standings', () => {
    const n = newNight();
    setTeams(n, 2);
    const [a] = entitiesOf(n);
    startGame(n, 'emoji');
    award(n, a.id, 2);
    expect(setGameScore(n, 'current', a.id, 5)).toBeNull();
    expect(gameScoreOf(n, a.id)).toBe(5);
    expect(totals(n)).toEqual([0, 0]);
  });

  it('accept only whole numbers', () => {
    const n = newNight();
    setTeams(n, 2);
    startGame(n, 'emoji');
    const [a] = entitiesOf(n);
    expect(setGameScore(n, 'current', a.id, 2.5)).toBe('not-whole');
    expect(setGameScore(n, 'current', a.id, NaN)).toBe('not-whole');
    expect(gameScoreOf(n, a.id)).toBe(0);
  });

  it('accept negative game scores only in Jeopardy', () => {
    const n = newNight();
    setTeams(n, 2);
    const [a] = entitiesOf(n);
    play(n, 'emoji', [3, 1]);
    expect(setGameScore(n, 0, a.id, -1)).toBe('negative');
    expect(finishedGames(n)[0].scores[a.id]).toBe(3);
    play(n, 'jeopardy', [200, 400]);
    expect(setGameScore(n, 1, a.id, -600)).toBeNull();
    expect(finishedGames(n)[1].scores[a.id]).toBe(-600);
  });

  it('are refused without a game, or for an entity that did not play it', () => {
    const n = newNight();
    setFreeForAll(n);
    addPlayer(n, 'Karim');
    addPlayer(n, 'Hana');
    const karim = entitiesOf(n)[0];
    expect(setGameScore(n, 'current', karim.id, 1)).toBe('no-game');
    expect(setGameScore(n, 3, karim.id, 1)).toBe('no-game');
    play(n, 'emoji', [1, 2]);
    const salma = addPlayer(n, 'Salma');
    expect(setGameScore(n, 0, salma.id, 5)).toBe('not-in-game');
    expect(totals(n)).toEqual([6, 12, 0]);
  });
});

describe('turns', () => {
  /** Confirm a round for each named entity, in order. */
  const turns = (n: Night, ...who: number[]) =>
    who.forEach((i) => confirmTurn(n, entitiesOf(n)[i].id));
  const counts = (n: Night) => entitiesOf(n).map((e) => turnsOf(n, e.id));
  const nextIndex = (n: Night) => entitiesOf(n).findIndex((e) => e.id === nextTurn(n));

  it('count confirmed rounds in Wavelength, Act It Out and Outburst, including 0-point rounds', () => {
    for (const type of ['wavelength', 'act', 'outburst'] as const) {
      const n = newNight();
      setTeams(n, 2);
      startGame(n, type);
      turns(n, 0, 1, 0);
      expect(counts(n)).toEqual([2, 1]);
      expect(gameScores(n)).toEqual([0, 0]);
    }
  });

  it('do not exist in Emoji or Jeopardy', () => {
    for (const type of ['emoji', 'jeopardy'] as const) {
      const n = newNight();
      setTeams(n, 2);
      startGame(n, type, 'en');
      turns(n, 0, 0);
      expect(counts(n)).toEqual([0, 0]);
      expect(nextTurn(n)).toBeNull();
      expect(unevenTurns(n)).toBeNull();
    }
  });

  it('are untouched by awards and by corrections', () => {
    const n = newNight();
    setTeams(n, 2);
    startGame(n, 'wavelength');
    const [a] = entitiesOf(n);
    award(n, a.id, 4);
    setGameScore(n, 'current', a.id, 9);
    expect(counts(n)).toEqual([0, 0]);
  });

  it('start again with each new game', () => {
    const n = newNight();
    setTeams(n, 2);
    startGame(n, 'act');
    turns(n, 0);
    endGame(n);
    startGame(n, 'act');
    expect(counts(n)).toEqual([0, 0]);
  });

  describe('the next turn', () => {
    it('rotates through the entities in order when turns are even', () => {
      const n = newNight();
      setTeams(n, 3);
      startGame(n, 'wavelength');
      const order: number[] = [];
      for (let k = 0; k < 6; k++) {
        order.push(nextIndex(n));
        turns(n, nextIndex(n));
      }
      expect(order).toEqual([0, 1, 2, 0, 1, 2]);
    });

    it('goes to whoever has had the fewest turns after the host overrides', () => {
      const n = newNight();
      setTeams(n, 3);
      startGame(n, 'outburst');
      turns(n, 0, 0, 1); // the host picked the first team twice
      expect(nextIndex(n)).toBe(2);
      turns(n, 2);
      expect(nextIndex(n)).toBe(1);
    });

    it('breaks a tie with the first entity after the last turn, wrapping round', () => {
      const n = newNight();
      setTeams(n, 4);
      startGame(n, 'act');
      turns(n, 2);
      expect(nextIndex(n)).toBe(3);
      turns(n, 3);
      expect(nextIndex(n)).toBe(0);
    });

    it('works per player in free-for-all', () => {
      const n = newNight();
      setFreeForAll(n);
      ['Karim', 'Hana', 'Salma'].forEach((p) => addPlayer(n, p));
      startGame(n, 'act');
      turns(n, 1);
      expect(entitiesOf(n)[nextIndex(n)].name).toBe('Salma');
      turns(n, 2);
      expect(entitiesOf(n)[nextIndex(n)].name).toBe('Karim');
    });
  });

  it('finish Outburst at its last full lap, so every team has had as many', () => {
    expect([2, 3, 4].map((teams) => fullLaps(9, teams))).toEqual([8, 9, 8]);
  });

  describe('uneven turns', () => {
    it('are reported whenever anyone is behind the most turns, naming who is short', () => {
      const n = newNight();
      setTeams(n, 3);
      startGame(n, 'wavelength');
      turns(n, 0, 1, 2, 0, 2);
      const u = unevenTurns(n)!;
      expect(u.most).toBe(2);
      expect(u.short.map((s) => [s.entity.name, s.turns])).toEqual([[TEAM_NAME_DEFAULTS[1], 1]]);
      expect(u.ahead.map((e) => e.name)).toEqual([TEAM_NAME_DEFAULTS[0], TEAM_NAME_DEFAULTS[2]]);
    });

    it('are not reported when turns are even, including before anyone has played', () => {
      const n = newNight();
      setTeams(n, 2);
      startGame(n, 'act');
      expect(unevenTurns(n)).toBeNull();
      turns(n, 0, 1);
      expect(unevenTurns(n)).toBeNull();
    });

    it('list every player who is short in free-for-all', () => {
      const n = newNight();
      setFreeForAll(n);
      ['Karim', 'Hana', 'Salma', 'Omar'].forEach((p) => addPlayer(n, p));
      startGame(n, 'wavelength');
      turns(n, 0, 1, 0);
      expect(unevenTurns(n)!.short.map((s) => [s.entity.name, s.turns])).toEqual([
        ['Hana', 1],
        ['Salma', 0],
        ['Omar', 0],
      ]);
    });
  });
});

describe('placement', () => {
  it.each([
    // How do game scores convert into placement points?
    [[50, 30, 10, 10], [10, 6, 2, 2]],
    [[100, 0, 0, 0], [15, 3, 3, 3]],
    [[0, 0, 0], [5, 5, 5]],
    // How are ties and negative game scores placed?
    [[1200, -600, 0], [15, 1, 3]],
    [[300, -800, -200], [15, 1, 3]],
    [[-200, -400], [12, 6]],
    [[-100, -200, -400], [11, 6, 2]],
    [[0, -200, -400], [15, 3, 1]],
    [[-10, -1000], [15, 3]],
  ])('turns game scores %j into %j at 1x', (scores, expected) => {
    expect(placement(scores, 1)).toEqual(expected);
  });

  it('gives 4th place and below no place points', () => {
    expect(placement([40, 30, 20, 10, 0], 1)).toEqual([9, 6, 3, 1, 0]);
  });

  it('applies the weight to place points and pie together, rounding halves up', () => {
    // 11 and 7 at 1x; 16.5 and 10.5 at 1.5x.
    expect(placement([6, 4], 1.5)).toEqual([17, 11]);
    expect(placement([6, 4], 4)).toEqual([44, 28]);
  });

  it('never gives a higher game score fewer placement points', () => {
    for (const weight of [1, 1.5, 2, 4]) {
      for (let a = -5; a <= 12; a++) {
        for (let b = -5; b <= 12; b++) {
          const scores = [a, b, 3, 0];
          const pts = placement(scores, weight);
          scores.forEach((s, i) =>
            scores.forEach((o, j) => {
              if (s > o) expect(pts[i]).toBeGreaterThanOrEqual(pts[j]);
            }),
          );
        }
      }
    }
  });

  it('weights each game type from the config', () => {
    expect(WEIGHTS).toEqual({ emoji: 1, act: 1.5, wavelength: 1.5, outburst: 2, jeopardy: 4 });
  });
});

describe('free-for-all', () => {
  it('keeps the team names while playing free-for-all, and the players while in teams', () => {
    const n = newNight();
    setTeams(n, 2);
    rename(n, entitiesOf(n)[1].id, 'Nile');
    setFreeForAll(n);
    addPlayer(n, 'Salma');
    expect(names(n)).toEqual(['Salma']);
    setTeams(n, 2);
    expect(names(n)).toEqual([TEAM_NAME_DEFAULTS[0], 'Nile']);
    setFreeForAll(n);
    expect(names(n)).toEqual(['Salma']);
  });

  it('adds a player at 0 without touching anyone else', () => {
    const n = newNight();
    setFreeForAll(n);
    addPlayer(n, 'Karim');
    addPlayer(n, 'Hana');
    play(n, 'emoji', [3, 1]);
    addPlayer(n, 'Salma');
    expect(totals(n)).toEqual([13, 6, 0]);
  });

  it('clears the whole night when a player is removed, as before', () => {
    const n = newNight();
    setFreeForAll(n);
    const karim = addPlayer(n, 'Karim');
    addPlayer(n, 'Hana');
    play(n, 'emoji', [1, 4]);
    removePlayer(n, karim.id);
    expect(names(n)).toEqual(['Hana']);
    expect(totals(n)).toEqual([0]);
    expect(finishedGames(n)).toEqual([]);
  });

  it('keeps a player’s colour when someone before them is removed', () => {
    const n = newNight();
    setFreeForAll(n);
    const karim = addPlayer(n, 'Karim');
    const hana = addPlayer(n, 'Hana');
    const before = hana.color;
    removePlayer(n, karim.id);
    expect(entitiesOf(n)[0].color).toBe(before);
  });
});
