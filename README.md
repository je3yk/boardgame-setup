# Drużyna Śródziemia

Responsywny, nieoficjalny pomocnik do **Władcy Pierścieni: Podróże przez Śródziemie**. Astro + TypeScript + Bun. Całość jest statyczna, bez backendu i bez bazy danych wymagającej serwera.

## Uruchomienie

Wymagania: Bun 1.3.14+ i Node.js 22.12+ (Astro 6).

```sh
bun install
bun run dev
```

Strona działa pod `http://localhost:4321/boardgame-setup/`.

```sh
bun run check
bun test
bun run build
bun run preview
```

Testy przeglądarkowe (Chromium, szerokości 1440 / 390 / 320 px):

```sh
bunx playwright install chromium
bun run test:e2e
```

## Strony

- `/` — początek wyprawy, skróty do pul graczy i kampanii.
- `/zasady/` — podstawy, bohater a rola, cechy, przebieg rundy, kolekcja i źródła.
- `/gracze/` — wszystkie 17 postaci, statystyki, progi, natchnienie, ekwipunek, zdolności, role, filtrowanie i wybory.
- `/kampanie/` — pięć kampanii dostępnych gospodarzowi, wymagania i preferencja dotycząca Kości Arnoru.

## Przydział i wybory

`src/data/assignments.json` zawiera wynik jednorazowego losowania: Jędrzej ma 5 bohaterów, pozostali po 4. Każdy z 17 bohaterów występuje dokładnie raz. Wielki Niedźwiedź jest formą Beorna, a nie osobnym bohaterem. **Build ani odświeżenie nie zmieniają pul**. Można ręcznie zmienić JSON lub świadomie wykonać nowe losowanie:

```sh
bun run draw          # zachowuje istniejący plik
bun run draw --force  # zastępuje przydział nowym losowaniem
```

Wybór bohatera i roli jest zapisany w `localStorage` pod kluczem `druzyna-srodziemia:choices:v1`. **To zapis wyłącznie w danej przeglądarce, bez synchronizacji między urządzeniami.** Każdy może na swoim telefonie wybrać postać z przypisanej puli i przekazać wybór grupie. Zapis nie jest powiązany z oficjalną aplikacją. Role i wyposażenie należy uzgodnić przy stole: lista pokazuje propozycje, a nie rezerwacje kart. Czyszczenie danych przeglądarki usuwa wybory, ale nie pule.

## GitHub Pages

W `astro.config.mjs` skonfigurowano `site: https://je3yk.github.io` i `base: /boardgame-setup`. Linki i lokalne grafiki uwzględniają prefiks. Przy zmianie nazwy repozytorium lub domeny zaktualizuj tę konfigurację.

1. W repozytorium otwórz **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Wypchnij kod na `main` lub uruchom ręcznie workflow **Deploy to GitHub Pages**.
3. Workflow instaluje zależności przez Bun, sprawdza typy, wykonuje testy, buduje i publikuje `dist/`.

Docelowy adres: `https://je3yk.github.io/boardgame-setup/`. Workflow jest przygotowany, ale samo utworzenie plików nie publikuje strony. Nie ma tu automatycznego pushowania ani zmiany ustawień repozytorium.

## Treść i grafiki

- `src/data/heroes.ts` — 17 bohaterów z podstawki i obu dużych rozszerzeń; porządek cech: Siła, Mądrość, Zwinność, Duch, Spryt.
- `src/data/campaigns.ts` — autorskie, bezspoilerowe opisy kampanii i odnośniki do wydawcy.
- `src/pages/zasady.astro` — streszczenie oraz źródła: instrukcje FFG, prezentacje wydawcy i JIME Companion.
- `public/heroes/` — lokalne portrety z ilustracji gry, pobrane z publicznego JIME Companion. Nie są hotlinkowane. Prawa do ilustracji i znaków pozostają przy ich właścicielach.
- `src/components/Landscape.astro` — krajobraz SVG tworzony w kodzie, bez zewnętrznych obrazów.
- Fonty Google są opcjonalnym zewnętrznym zasobem; bez nich działają fonty systemowe.

Polskie nazwy ról i ekwipunku są pomocniczymi tłumaczeniami, a zdolności streszczeniami. Dokładny tekst sprawdzaj na kartach z posiadanej edycji oraz w aplikacji. Część archiwalnych artykułów FFG przekierowuje już do nowego serwisu. Dane i treść przygotowano 4 listopada 2026; spotkanie opisano jako piątek 6 listopada 2026 wieczorem.
