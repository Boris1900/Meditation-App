# Augenblick – Projektdokumentation

## Übersicht
Sanfter Meditations-Timer mit Klangschale, ursprünglich für Boris + Katharina, jetzt als
"Augenblick"-App auch an Freunde und Interessierte weitergebbar. PWA + Android APK via Capacitor.
GitHub Pages: https://boris1900.github.io/Meditation-App/ | Repo: Boris1900/Meditation-App

**Hinweis:** Android-Paketname bleibt `de.tinnituspraxis.meditation` (Legacy, nicht sichtbar im
Normalbetrieb). Wird erst beim großen Tinnitus-Meditations-Produkt sauber neu aufgesetzt.

## Dateistruktur
```
MeditationsApp/
├── index.html, style.css, app.js, sw.js, manifest.json  # Hauptdateien
├── background.jpg               # Hintergrundbild (Buddha, Bambus, Kerze)
├── background_laecheln_v0.4.jpg # Buddha-Lächeln-Bild
├── berglandschaft_0.1.jpg       # Berglandschaft (948x1659px, DALL-E generiert)
├── meer_0.2.jpg                 # Spiegelglattes Meer ohne Strand (948x1659px, ChatGPT)
├── gong.png                     # Gong mit Halterung (Buddha-Modus)
├── gong_ohne_halter.png         # Gong ohne Halterung (Farbmodus + Bergmodus)
├── icon-1024.png                # App-Icon-Quelle 1024x1024
├── Sounds/                      # Klangschalen-MP3s
├── build-android.ps1            # Build-Skript für Android APK
├── xold/                        # Archivierte alte Dateiversionen
├── www/                         # Build-Artefakt Android (nicht bearbeiten)
├── android/                     # Capacitor Android-Projekt (nicht bearbeiten)
└── CLAUDE.md                    # Diese Datei
```

## Aktueller Stand – v1.69 (gepusht + APK released)

- Timer 1–90 Min, Wake Lock ab App-Start, Abdunkelung 0–95%
- **Lebendige Flamme** (Checkbox): ausgegraut wenn Farbhintergrund aktiv
- Buddha-Lächeln + Aura: immer aktiv bei Buddha-Hintergrund
- Gong-Animation, 3 Klangschalen (localStorage), Update-Funktion (APK-Download)
- **Zwischen-Gong** (Checkbox + Slider): Countdown rechts neben Haupttimer
- **Hintergrundfarbe** (10 Felder): Buddha, Erwachen, Abendrot, Schwarz, Sehr dunkel, Dunkelgrau, Dunkelblau, Dunkelgrün, Grasgrün, Warmes Gelb
- **Gong-Welleneffekt** (Farbmodus): weicher Schallwellen-Ring statt Swing
- **Erwachen-Hintergrund (Berg):** Dynamischer Sonnenaufgang im Meditationsverlauf:
  - Start: fast schwarz (overlay 0.90), Sterne im oberen 30% mit Helligkeitsgradient
  - Im Verlauf: Overlay hebt sich, Sterne verblassen ab 35%, endet goldene Morgendämmerung
  - Gong unsichtbar beim Laufen, Tap → Gong 2,5 Sek. sichtbar
  - Zwischen-Gong: nur Sound
  - Technisch: `#berg-tap-layer` (z-index 2), `MEER_HORIZON_FRAC` steuert Horizont
- **Abendrot-Hintergrund (Meer, v1.66):** Animierter Sonnenuntergang:
  - Bild: `meer_0.2.jpg` (948×1659px, spiegelglattes Wasser, kein Strand)
  - Start: Sonne als große Halbkugel (300px) genau auf dem Horizont
  - Im Verlauf: Sonne versinkt langsam, wird röter, Aura wächst von 420px auf >1000px
  - Ende: Sonne weg, Szene fast schwarz (overlay 0.85)
  - Gong wie Erwachen: unsichtbar, Tap enthüllt kurz
  - Zwischen-Gong: nur Sound
  - Technisch: `#meer-sun-wrap` (overflow:hidden, Höhe = Horizont-px), Horizont BERECHNET aus Bildmaßen + cover-Skalierung
  - Wichtige Konstanten: `MEER_IMG_W=948`, `MEER_IMG_H=1659`, `MEER_HORIZON_FRAC=0.58`, `MEER_SUN_SIZE=300`, `MEER_DISC_PCT=0.24`

### Wichtige Konstanten (app.js)
```
FLAME_X_PCT = 0.8449,  FLAME_Y_PCT = 0.7378
AURA_X_PCT  = 0.28,    AURA_Y_PCT  = 0.59
AURA_SIZE_PCT = 0.46
IMG_W_GONG = 1024,     IMG_H_GONG = 1536
DISC_Y_PCT = 0.537,    DISC_R_PCT = 0.292
```

### Technische Notiz
Weiße Linie Android (Power-Button → Chrome-Reload) → Webtech-Grenze, in der APK kein Problem.

## Build-Workflow Android
⚠️ Reihenfolge einhalten – sonst landet alte Version in der APK!

1. Änderungen in Hauptdateien vornehmen
2. Version hochzählen: `app.js` (APP_VERSION) + `sw.js` (CACHE_NAME) → aktuell `v1.68`
3. `.\build-android.ps1` ausführen
4. APK per Gradle bauen:
   `$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"`
   `$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"`
   `cd android; .\gradlew assembleDebug`
5. APK umbenennen + GitHub Release erstellen:
   `Copy-Item android\app\build\outputs\apk\debug\app-debug.apk Augenblick-vX.XX.apk`
   `gh release create vX.XX Augenblick-vX.XX.apk --title "..." --notes "..."`

APK: `android\app\build\outputs\apk\debug\app-debug.apk`
iOS: `git push` → GitHub Pages → Katharina tippt „Auf Update prüfen"

**Neue Datei hinzugefügt?** → Auch in `build-android.ps1` + `sw.js` eintragen!
**Ab v1.60:** Nur noch `Augenblick-vX.XX.apk` nötig – ein Name reicht.

## Feature-Historie
- v1.53: Zwischen-Gong
- v1.54: Hintergrundfarbe (8 Felder)
- v1.55: Gong-Swing beim Zwischen-Gong
- v1.57: Gong-Welleneffekt bei Farbhintergrund + App-Rename zu "Augenblick"
- v1.58: iOS-Timer-Zittern behoben
- v1.59: iOS-Digit-Trennlinien entfernt
- v1.60: Audio-Warm-up beim ersten Seitentouch
- v1.61: Berglandschaft-Hintergrund mit dynamischem Sonnenaufgang
- v1.62: Bergmodus verfeinert – Gong unsichtbar, Tap-Enthüllung (2,5s), Stern-Helligkeitsgradient, Zwischen-Gong nur Sound
- v1.63–v1.66: Abendrot-Modus (Meer) – animierter Sonnenuntergang mit versinkender Sonne, wachsender Aura, cover-korrekter Horizontberechnung
- v1.67: Abendrot fertiggestellt – meer_0.2.jpg (kein Strand), Szene bleibt dunkel nach Timer-Ende
- v1.68: Bugfixes – Swatch-Vorschaubild korrigiert, sanfte Sonnen-Animation (CSS transition 1s linear)
- v1.69: Abendrot-Fixes – Abdunkelung im Meer-Modus deaktiviert, Wasserfarbe mit 3-Punkte-Verlauf (orange → weinrot → dunkel), Sonne minimal höher

## Offene Punkte / Nächste Schritte

### Abendrot-Modus: offene Feinarbeit
- Horizont-Feintuning: `MEER_HORIZON_FRAC = 0.58` – Boris sagt "ziemlich gut", ggf. noch minimal anpassen
- Sonne am Handy prüfen (OnePlus 5): sitzt die Halbkugel genau auf der Linie?
- Ggf. Sonnenuntergang-Geschwindigkeit und Aura-Intensität nachjustieren

### Weitere Hintergründe geplant
- **Strandbild:** Sonnenuntergang über dem Meer (hell → dunkel im Meditationsverlauf)
  - Gleiches Konzept wie Bergbild, umgekehrte Richtung
  - Prompt für DALL-E: "Photorealistic ocean sunset, portrait 1024x1792, sun still visible
    just above horizon, warm orange-red sky, calm water reflection, dark sandy beach in lower
    third, no people, no text, meditative atmosphere"

### Tinnitus-Meditations-App (übernächstes Projekt)
Eigenständige neue App für Tinnitus-Patienten. Hintergrundgeräusche (Boris' Field Recordings:
Wasser, Wald, Vögel) in nahtlosem Loop. Kein Gong, kein Buddha. Modernes sachliches Design,
Start/Stop-Button mittig. Web Audio API für gapless loop. Separates Repo + Domain.

### Mittelfristig
- Play Store (25€), weitere Klangschalen

### Aufgeschoben
- Multi-MP3, Service Worker iOS optimieren

## Arbeitsregeln
**Immer erst fragen, bevor eine Idee umgesetzt wird.**

⛔ **NIEMALS eigenständig pushen.** Commit ist okay, aber vor jedem `git push` Boris fragen:
"Soll ich pushen?" – ohne Ausnahme, egal wie fertig der Code ist.

⛔ **Neue visuelle Features erst lokal testen, bevor sie in PWA oder APK landen.**
Ablauf: Code fertig → `npx serve -p 3456 .` → Boris schaut im Browser → Feedback → anpassen
→ erst dann push/APK.

## Lokaler Server
`npx serve -p 3456 .`

## Kontext für neue Session
- Boris: Heilpraktiker, kein Entwickler, beurteilt visuell
- Testgeräte: OnePlus 5 (Android 10) + iPhone Katharina (iOS/Safari)
- Android Studio Panda 4, debug APK, StatusBar transparent via `@capacitor/status-bar`
- Neue Session starten mit: "Lies die CLAUDE.md und sag wo wir stehen"
