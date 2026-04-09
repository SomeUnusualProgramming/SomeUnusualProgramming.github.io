# SomeUnusualProgramming.github.io

Nowoczesne portfolio zawodowe prezentujące moje doświadczenie w pracy z systemami biznesowymi, integracjami i projektami technicznymi.  
Strona jest dostępna pod adresem: https://someunusualprogramming.github.io/

## Szybka obsługa projektu

- Projekty portfolio: `js/projects-data.js`
- Tłumaczenia (PL/EN/DE/ES): `js/i18n/*.js`
- Logika interakcji, misji i easter eggow: `js/theme-scripts.js`
- Glowne style: `css/style.css`

## Konfiguracja misji i easter eggow

- Nazwy i status misji sa renderowane w `updateMissionsUI()` w `js/theme-scripts.js`
- Misja konsultacji jest pod kluczem `consultMode`
- Czas trwania podmiany zdjecia po nagrodzie:
  - `CONFIG.consultPhotoDurationMs` w `js/theme-scripts.js` (obecnie 5 minut)
- Liczba klikniec do aktywacji konsultacji:
  - `CONFIG.consultActivationClicks` w `js/theme-scripts.js` (obecnie 5)

## Klucze localStorage

- `portfolio.lang` - wybrany jezyk
- `portfolio.missions.v1` - stan misji i nagrody
- `tech.easterEggShown.v1` - stan easter egga boost
- `portfolio.consultPhoto.v1` - aktywny wariant zdjecia
- `portfolio.consultPhotoUntil.v1` - timestamp resetu wariantu zdjecia

