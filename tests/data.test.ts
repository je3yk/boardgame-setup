import { describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { heroes } from '../src/data/heroes';
import { campaigns } from '../src/data/campaigns';
import assignments from '../src/data/assignments.json';

describe('collection and permanent draw', () => {
  test('contains all 17 unique heroes from the three boxes', () => {
    expect(heroes).toHaveLength(17);
    expect(new Set(heroes.map(hero => hero.id)).size).toBe(17);
    expect(['base','shadow','war'].map(expansion => heroes.filter(hero => hero.expansion === expansion).length)).toEqual([6,5,6]);
    expect(heroes.some(hero => hero.id === 'the-great-bear')).toBe(false);
  });
  test('assigns every hero to exactly one of the four players', () => {
    const drawn = assignments.players.flatMap(player => player.heroes);
    expect([...drawn].sort()).toEqual(heroes.map(hero => hero.id).sort());
    expect(assignments.players.map(player => player.heroes.length)).toEqual([5,4,4,4]);
    expect(assignments.players.map(player => player.name)).toEqual(['Jędrzej','Piotr','Michał','Miłosz']);
  });
  test('every card has complete characteristics, equipment, ability and local portrait', () => {
    for (const hero of heroes) {
      expect(hero.stats).toHaveLength(5);
      expect(hero.stats.every(value => Number.isInteger(value) && value >= 1 && value <= 5)).toBe(true);
      expect(hero.damage + hero.fear).toBeGreaterThanOrEqual(10);
      for (const field of [hero.gear, hero.role, hero.ability, hero.tip]) expect(field.length).toBeGreaterThan(5);
      expect(existsSync(new URL(`../public/heroes/${hero.id}.png`, import.meta.url))).toBe(true);
    }
  });
  test('includes exactly the five owned campaigns and explains the host preference', () => {
    expect(campaigns).toHaveLength(5);
    expect(new Set(campaigns.map(campaign => campaign.id)).size).toBe(5);
    expect(campaigns.find(campaign => campaign.id === 'arnor')?.reason).toContain('Jędrzej');
    expect(campaigns.find(campaign => campaign.id === 'ember')?.intro).toContain('kwiatu');
  });
});
