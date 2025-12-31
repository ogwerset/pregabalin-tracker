# Pregabalin Tracker Dashboard

Single-file HTML dashboard do wizualizacji dawkowania pregabaliny i efektów leczenia.

## Funkcje

- 📊 **12 wykresów analitycznych**: Trajektoria GAD, Profil Dobowy, Stabilność ADHD, Stacked Area, Korelacje, Sen vs Objawy, Rolling Average, Porównanie Tygodniowe, Radar Profilu, i więcej
- 📈 **Raport dla Lekarza**: Automatycznie generowany raport z analizą statystyczną i tabelą okresów 3-dniowych
- 💾 **Import Danych**: Wsparcie dla CSV i tekstowego formatu z walidacją
- 🎨 **Dark/Light Mode**: Przełączanie motywów
- 📱 **Responsywny Design**: Działa na desktop i mobile
- 🖨️ **Eksport**: PNG dla wykresów, PDF dla raportu

## Użycie

1. Otwórz `pregabalin-tracker.html` w przeglądarce
2. Zaimportuj dane w zakładce "Import Danych"
3. Przejrzyj wykresy w zakładce "Dashboard"
4. Wygeneruj raport w zakładce "Raport dla Lekarza"

## Technologie

- **Plotly.js** - Wykresy interaktywne
- **jStat** - Obliczenia statystyczne
- **LocalStorage** - Persystencja danych
- **Vanilla JavaScript** - Zero zależności buildowych

## Deploy

Strona jest gotowa do deploy na Vercel, Netlify lub GitHub Pages jako statyczny HTML.

