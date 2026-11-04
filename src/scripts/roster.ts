type Choice = { hero: string; role: string };
const key = 'druzyna-srodziemia:choices:v1';

export function initRoster() {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-hero]'));
  const slots = Array.from(document.querySelectorAll<HTMLElement>('[data-party-slot]'));
  const status = document.querySelector<HTMLElement>('#choice-status')!;
  const storageError = document.querySelector<HTMLElement>('#storage-error')!;
  let choices: Record<string, Choice> = {};
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(key) || '{}');
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      for (const slot of slots) {
        const player = slot.dataset.partySlot!;
        const choice = (stored as Record<string, Choice>)[player];
        const card = cards.find(card => card.dataset.player === player && card.dataset.hero === choice?.hero);
        const roles = card?.querySelector<HTMLSelectElement>('select')?.options;
        if (card && roles && Array.from(roles).some(option => option.value === choice.role)) choices[player] = choice;
      }
    }
  } catch { storageError.hidden = false; }

  function render() {
    for (const card of cards) {
      const choice = choices[card.dataset.player!];
      const selected = choice?.hero === card.dataset.hero;
      card.classList.toggle('is-selected', selected);
      card.querySelector<HTMLElement>('.selected-mark')!.hidden = !selected;
      const button = card.querySelector<HTMLButtonElement>('[data-choose]')!;
      button.setAttribute('aria-pressed', String(selected));
      button.firstChild!.textContent = selected ? 'Wybrano do drużyny ' : `Wybieram: ${card.dataset.name} `;
      if (selected) card.querySelector<HTMLSelectElement>('select')!.value = choice.role;
    }
    for (const slot of slots) {
      const choice = choices[slot.dataset.partySlot!];
      const card = choice && cards.find(card => card.dataset.hero === choice.hero);
      slot.querySelector<HTMLElement>('[data-party-name]')!.textContent = card?.dataset.name || 'Jeszcze nie wybrano';
      slot.querySelector<HTMLElement>('[data-party-role]')!.textContent = choice?.role.split(' · ')[0] || '';
      slot.querySelector<HTMLButtonElement>('[data-clear]')!.hidden = !choice;
      slot.classList.toggle('has-choice', Boolean(choice));
    }
  }
  function save(message: string) {
    try { localStorage.setItem(key, JSON.stringify(choices)); } catch { storageError.hidden = false; }
    status.textContent = message;
    render();
  }
  for (const card of cards) {
    const select = card.querySelector<HTMLSelectElement>('select')!;
    card.querySelector('[data-choose]')!.addEventListener('click', () => {
      choices[card.dataset.player!] = { hero: card.dataset.hero!, role: select.value };
      save(`Wybrano ${card.dataset.name}. Rola: ${select.value}.`);
    });
    select.addEventListener('change', () => {
      if (choices[card.dataset.player!]?.hero === card.dataset.hero) {
        choices[card.dataset.player!].role = select.value;
        save(`Zmieniono rolę: ${select.value}.`);
      }
    });
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-clear]')) button.addEventListener('click', () => {
    delete choices[button.dataset.clear!];
    save('Usunięto wybór bohatera.');
  });
  let activePlayer = 'all';
  const search = document.querySelector<HTMLInputElement>('#hero-search')!;
  const normalize = (value: string) => value.toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l');
  function filter() {
    let count = 0;
    for (const card of cards) {
      card.hidden = (activePlayer !== 'all' && card.dataset.player !== activePlayer) || !normalize(`${card.dataset.name} ${card.querySelector('.hero-identity p')?.textContent}`).includes(normalize(search.value.trim()));
      if (!card.hidden) count++;
    }
    for (const section of document.querySelectorAll<HTMLElement>('[data-player-section]')) section.hidden = !Array.from(section.querySelectorAll<HTMLElement>('[data-hero]')).some(card => !card.hidden);
    document.querySelector<HTMLElement>('#empty-state')!.hidden = count > 0;
    for (const tab of document.querySelectorAll<HTMLElement>('[data-player-filter]')) {
      tab.classList.toggle('active', tab.dataset.playerFilter === activePlayer);
      tab.setAttribute('aria-pressed', String(tab.dataset.playerFilter === activePlayer));
    }
  }
  for (const tab of document.querySelectorAll<HTMLElement>('[data-player-filter]')) tab.addEventListener('click', () => {
    activePlayer = tab.dataset.playerFilter!;
    filter();
  });
  search.addEventListener('input', filter);
  const hash = location.hash.slice(1);
  if (slots.some(slot => slot.dataset.partySlot === hash)) activePlayer = hash;
  render(); filter();
}
