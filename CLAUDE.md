# Meditations-App – Projektdokumentation

## Übersicht
Persönliche Meditations-Timer-App (Boris + Katharina). PWA + Android APK via Capacitor.
GitHub Pages: https://boris1900.github.io/Meditation-App/ | Repo: Boris1900/Meditation-App

## Dateistruktur
```
MeditationsApp/
├── index.html, style.css, app.js, sw.js, manifest.json  # Hauptdateien
├── background.jpg               # Hintergrundbild (Buddha, Bambus, Kerze)
├── background_laecheln_v0.4.jpg # Buddha-Lächeln-Bild (aktuelle Version)
├── gong.png                     # Gong-Bild (freigestellt)
├── icon-1024.png                # App-Icon-Quelle 1024x1024
├── Sounds/                      # Klangschalen-MP3s
├── build-android.ps1            # Build-Skript für Android APK
├── test_aura_v136.html          # Testseite: Buddha-Aura-Position
├── test_flamme.html             # Testseite: Flammen-Position
├── test_eyes.html               # Testseite: Augen-Effekt
├── xold/                        # Archivierte alte Dateiversionen
├── www/                         # Build-Artefakt Android (nicht bearbeiten)
├── android/                     # Capacitor Android-Projekt (nicht bearbeiten)
└── CLAUDE.md                    # Diese Datei
```

## Aktueller Stand – v1.52
- Timer 1–90 Min, Wake Lock ab App-Start, Abdunkelung 0–95%
- **Lebendige Flamme** (Checkbox): Flackern + Schein Stärke 30 in einem Schalter
- Buddha-Lächeln + Aura: immer aktiv, bei Start/Stop + alle 30–45 Sek.
- Gong-Animation, 3 Klangschalen (localStorage), Update-Funktion (APK-Download)
- PWA (iOS Safari + Android Chrome), Service Worker, Offline-Nutzung

### Wichtige Konstanten (app.js)
```
FLAME_X_PCT = 0.8449,  FLAME_Y_PCT = 0.7378
AURA_X_PCT  = 0.28,    AURA_Y_PCT  = 0.59   ← zuletzt OK, so lassen
AURA_SIZE_PCT = 0.46
```
Testseiten: `test_flamme.html` / `test_aura_v136.html`

### Technische Notiz
Weiße Linie Android (Power-Button → Chrome-Reload) → Webtech-Grenze, in der APK kein Problem.

## Build-Workflow Android
⚠️ Reihenfolge einhalten – sonst landet alte Version in der APK!

1. Änderungen in Hauptdateien vornehmen
2. Version hochzählen: `app.js` (APP_VERSION) + `sw.js` (CACHE_NAME) → aktuell `v1.52`
3. `.\build-android.ps1` ausführen
4. Android Studio → Shift+Shift → „Generate APKs" → umbenennen → GitHub Release hochladen

APK: `android\app\build\outputs\apk\debug\app-debug.apk`
iOS: `git push` → GitHub Pages → Katharina tippt „Auf Update prüfen"

**Neue Datei hinzugefügt?** → Auch in `build-android.ps1` eintragen!

## Offene Punkte

### Nächste Session – v1.53/v1.54

**Feature A: Hintergrundfarbe wählen**
- 8 tippbare Farbfelder im Menü: Schwarz, Sehr dunkel, Dunkelgrau, Dunkelblau, Dunkelgrün, Mittelgrün (Grasgrün), Warmes Gelb, Buddha (= zurück zum Bild)
- Bei Farbwahl: Buddha-Hintergrundbild ausblenden, Vollfarbe einblenden
- Timer-Text bleibt lesbar (hat bereits Textschatten, reicht für alle dunklen Farben)
- Kein Helligkeits-Slider – zu komplex, nicht nötig
- Auswahl per localStorage speichern

**Feature B: Zwischengong**
- Im Menü: Checkbox „Zwischen-Gong" an/aus + Slider darunter (nur sichtbar wenn an)
- Slider: 1 Min bis (Gesamtzeit – 1 Min), in Minuten ab Start
- Wenn Gesamtzeit kleiner als Zwischengong-Zeit → Zwischengong wird ignoriert (kein Fehler)
- Auf dem Hauptscreen (nur wenn aktiv + Timer läuft): kleiner Countdown rechts neben dem Haupttimer, Label „Zwischen-Gong" drüber
- Wenn Zwischengong feuert: Gong-Sound einmal abspielen, kleines Display verschwindet einfach (kein ✓, kein Effekt)
- Einstellung per localStorage speichern

### Mittelfristig
- Play Store (25€), weitere Klangschalen

### Aufgeschoben
- Multi-MP3, Service Worker iOS optimieren

## Arbeitsregel
**Immer erst fragen, bevor eine Idee umgesetzt wird.**

## Lokaler Server
`npx serve -p 3456 .`

## Kontext für neue Session
- Boris: Heilpraktiker, kein Entwickler, beurteilt visuell
- Testgeräte: OnePlus 5 (Android 10) + iPhone Katharina (iOS/Safari)
- Android Studio Panda 4, debug APK, StatusBar transparent via `@capacitor/status-bar`
