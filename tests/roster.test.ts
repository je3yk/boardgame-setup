import { beforeEach, describe, expect, test } from 'bun:test';
import { Window } from 'happy-dom';
import { initRoster } from '../src/scripts/roster';

const storageKey = 'druzyna-srodziemia:choices:v1';
let window: Window;
function fixtureCard(hero: string, player: string, name: string) {
  return `<article data-hero="${hero}" data-player="${player}" data-name="${name}"><div class="hero-identity"><p>Walka</p></div><span class="selected-mark" hidden></span><select><option>Kapitan</option><option>Łowca</option></select><button data-choose>Wybieram: ${name}</button></article>`;
}
function setup(stored?: string) {
  window = new Window({ url: 'https://example.test/boardgame-setup/gracze/' });
  Object.assign(globalThis, { document: window.document, localStorage: window.localStorage, location: window.location });
  window.document.body.innerHTML = `<div data-party-slot="jedrzej"><span data-party-name></span><small data-party-role></small><button data-clear="jedrzej" hidden></button></div><div data-party-slot="piotr"><span data-party-name></span><small data-party-role></small><button data-clear="piotr" hidden></button></div><button data-player-filter="all"></button><button data-player-filter="piotr"></button><input id="hero-search"/><section data-player-section="jedrzej">${fixtureCard('aragorn','jedrzej','Aragorn')}${fixtureCard('arwen','jedrzej','Arwena')}</section><section data-player-section="piotr">${fixtureCard('boromir','piotr','Boromir')}</section><p id="empty-state" hidden></p><p id="choice-status"></p><p id="storage-error" hidden></p>`;
  if (stored) window.localStorage.setItem(storageKey, stored);
}
const element = (selector: string) => window.document.querySelector(selector) as unknown as HTMLElement;

describe('local hero choices', () => {
  beforeEach(() => setup());
  test('persists a hero and role and replaces only that player choice', () => {
    initRoster();
    element('[data-hero="aragorn"] [data-choose]').click();
    element('[data-hero="boromir"] [data-choose]').click();
    element('[data-hero="arwen"] [data-choose]').click();
    expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual({jedrzej:{hero:'arwen',role:'Kapitan'},piotr:{hero:'boromir',role:'Kapitan'}});
    expect(element('[data-hero="aragorn"]').classList.contains('is-selected')).toBe(false);
    expect(element('[data-party-slot="jedrzej"] [data-party-name]').textContent).toBe('Arwena');
  });
  test('updates the selected role and clears a saved choice', () => {
    initRoster();
    element('[data-hero="aragorn"] [data-choose]').click();
    const select = element('[data-hero="aragorn"] select') as HTMLSelectElement;
    select.value = 'Łowca';
    select.dispatchEvent(new window.Event('change') as unknown as Event);
    expect(JSON.parse(localStorage.getItem(storageKey)!).jedrzej.role).toBe('Łowca');
    element('[data-clear="jedrzej"]').click();
    expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual({});
    expect(element('[data-hero="aragorn"]').classList.contains('is-selected')).toBe(false);
  });
  test('restores validated choices after reopening the page', () => {
    setup(JSON.stringify({jedrzej:{hero:'aragorn',role:'Łowca'}}));
    initRoster();
    expect(element('[data-hero="aragorn"]').classList.contains('is-selected')).toBe(true);
    expect((element('[data-hero="aragorn"] select') as HTMLSelectElement).value).toBe('Łowca');
  });
  test('ignores a saved hero assigned to a different player', () => {
    setup(JSON.stringify({jedrzej:{hero:'boromir',role:'Kapitan'}}));
    initRoster();
    expect(window.document.querySelectorAll('.is-selected').length).toBe(0);
  });
  test('handles malformed storage without breaking selection', () => {
    setup('{invalid');
    initRoster();
    expect(element('#storage-error').hidden).toBe(false);
    element('[data-hero="aragorn"] [data-choose]').click();
    expect(element('[data-hero="aragorn"]').classList.contains('is-selected')).toBe(true);
  });
  test('combines player and search filters with a clear empty state', () => {
    initRoster();
    element('[data-player-filter="piotr"]').click();
    expect(element('[data-player-section="jedrzej"]').hidden).toBe(true);
    const search = element('#hero-search') as HTMLInputElement;
    search.value = 'aragorn';
    search.dispatchEvent(new window.Event('input') as unknown as Event);
    expect(element('#empty-state').hidden).toBe(false);
    element('[data-player-filter="all"]').click();
    expect(element('#empty-state').hidden).toBe(true);
    expect(element('[data-hero="aragorn"]').hidden).toBe(false);
  });
  test('supports player deep links', () => {
    window.location.hash = 'piotr';
    initRoster();
    expect(element('[data-player-section="jedrzej"]').hidden).toBe(true);
    expect(element('[data-player-section="piotr"]').hidden).toBe(false);
  });
});
