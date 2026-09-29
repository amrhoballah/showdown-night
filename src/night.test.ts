import { describe, it, expect } from 'vitest';
import {
  newNight,
  setTeams,
  setFreeForAll,
  addPlayer,
  removePlayer,
  rename,
  entitiesOf,
  scoreOf,
  addPoints,
  TEAM_COLORS,
  TEAM_NAME_DEFAULTS,
} from './night';

const names = (n: ReturnType<typeof newNight>) => entitiesOf(n).map((e) => e.name);
const scores = (n: ReturnType<typeof newNight>) => entitiesOf(n).map((e) => scoreOf(n, e.id));

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

describe('scores', () => {
  it('start at 0 and add up, including negative awards', () => {
    const n = newNight();
    setTeams(n, 2);
    const [a, b] = entitiesOf(n);
    addPoints(n, a.id, 400);
    addPoints(n, a.id, -600);
    addPoints(n, b.id, 200);
    expect(scores(n)).toEqual([-200, 200]);
  });

  it('are kept when an entity is renamed', () => {
    const n = newNight();
    setTeams(n, 2);
    const [a] = entitiesOf(n);
    addPoints(n, a.id, 300);
    rename(n, a.id, 'Pharaohs');
    expect(scoreOf(n, a.id)).toBe(300);
  });

  it('are all cleared when the mode or team count changes', () => {
    const n = newNight();
    setTeams(n, 2);
    addPoints(n, entitiesOf(n)[0].id, 300);
    setTeams(n, 3);
    expect(scores(n)).toEqual([0, 0, 0]);
    addPoints(n, entitiesOf(n)[1].id, 5);
    setFreeForAll(n);
    setTeams(n, 3);
    expect(scores(n)).toEqual([0, 0, 0]);
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
    const karim = addPlayer(n, 'Karim');
    addPoints(n, karim.id, 3);
    const hana = addPlayer(n, 'Hana');
    expect(scoreOf(n, karim.id)).toBe(3);
    expect(scoreOf(n, hana.id)).toBe(0);
  });

  it('clears every score when a player is removed, as before', () => {
    const n = newNight();
    setFreeForAll(n);
    const karim = addPlayer(n, 'Karim');
    const hana = addPlayer(n, 'Hana');
    addPoints(n, hana.id, 4);
    removePlayer(n, karim.id);
    expect(names(n)).toEqual(['Hana']);
    expect(scoreOf(n, hana.id)).toBe(0);
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
