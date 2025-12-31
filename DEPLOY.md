# Instrukcje Deploy

## GitHub (jeśli gh CLI nie działa w tym shell)

1. **Utwórz repo ręcznie:**
   - Idź na https://github.com/new
   - Nazwa: `pregabalin-tracker`
   - Publiczne
   - **NIE** inicjalizuj z README/license

2. **Dodaj remote i push:**
   ```bash
   cd "/Users/ogwerset/Downloads/pregabalin tracker"
   git remote add origin https://github.com/TWOJA_NAZWA_UZYTKOWNIKA/pregabalin-tracker.git
   git push -u origin main
   ```

## Vercel

1. **Przez CLI (jeśli działa):**
   ```bash
   cd "/Users/ogwerset/Downloads/pregabalin tracker"
   vercel
   ```

2. **Przez browser:**
   - Idź na https://vercel.com/new
   - Połącz z GitHub repo `pregabalin-tracker`
   - Vercel automatycznie wykryje statyczny HTML
   - Kliknij Deploy

Vercel automatycznie:
- Wdroży stronę na `pregabalin-tracker.vercel.app`
- Skonfiguruje CI/CD (każdy push = nowy deploy)

