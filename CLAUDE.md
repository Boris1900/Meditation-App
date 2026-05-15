# Meditations-App – Projektdokumentation

## Übersicht
Persönliche Meditations-Timer-App für Boris Seedorf. Vorbild: "Meditation Time" App.
Technologie: Reines HTML/CSS/JavaScript (PWA, keine Frameworks).

## Dateistruktur
```
MeditationsApp/
├── index.html        # Haupt-HTML
├── style.css         # Alle Styles
├── app.js            # Gesamte App-Logik
├── manifest.json     # PWA-Manifest (Homescreen-Installation)
├── background.png    # Hintergrundbild (V0.3: Buddha unten, Bambus, Kerze)
├── gong.png          # Gong-Bild (freigestellt, RGBA PNG, V0.1)
├── klang1.mp3        # Eingebauter Klang (781 KB, im Menü auswählbar)
└── CLAUDE.md         # Diese Datei
```

## Aktueller Stand (nach Session 4 – abgeschlossen)

### Alles was funktioniert
- Layout, Gong-Animation (leichtes Zucken noch bekannt), Timer 1–90 Min
- Audio-Menü mit einheitlichem Georgia-Font, goldene Buttons
- Demo-Gong (synthetisch) + Klang 1 (eingebaut) + MP3-Upload
- Wake Lock
- Abdunkelung: einstellbar 0–95%, manuelle Kontrolle
- **Flammen-Schein-Slider: Intensität und Größe einstellbar (Aus bis Sehr stark)**
- **iOS Safari Audio-Fix: AudioContext wird per `resume()` aufgeweckt**
- Timer-Positionierung: per Bildgeometrie-Rechnung exakt zwischen Gong und Buddha
- Gong-Größe: dynamisch, so groß wie möglich ohne Überlappung
- Flammen-Schein: sanft pulsierendes warmes Leuchten, exakt auf Teelicht positioniert
- Navigation: nur Musiknoten-Icon, blendet während Meditation sanft aus
- START/STOP-Label: mittig auf der Gong-Scheibe (skaliert mit Gonggröße)
- Timer-Anzeige springt beim Stoppen nicht mehr
- PWA Manifest + Homescreen-Installation
- GitHub Pages: https://boris1900.github.io/Meditation-App/
- .gitignore für Bild-Backups

### Tipp-Logik
| Situation | Tap auf Gong | Tap woanders |
|---|---|---|
| Timer läuft, abgedunkelt | – (Overlay fängt ab) | Aufhellen (bleibt hell) |
| Timer läuft, hell | Stoppen + Klang + Schwingen | Sofort abdunkeln |
| Timer gestoppt | Starten + Klang + Schwingen | – |

**Wichtig:** Nach dem Aufhellen dunkelt die App NICHT automatisch wieder ab.
Nur Tap auf dunkles Display → aufhellen. Tap auf helles Display → sofort abdunkeln.
Die einzige automatische Abdunkelung: 3 Sekunden nach Timer-Start.

---

## Session 3 – Was neu gemacht wurde

### 1. Weiße Pixellinie oben (3-teilige Lösung)
- `html { background: #1a1a1a; }` als Fallback
- `body::before { top: -2px; }` – Hintergrundbild 2px nach oben versetzt
- `<meta name="viewport" content="..., viewport-fit=cover">` in index.html

### 2. Timer-Positionierung per Bildgeometrie
Statt zu raten: echte Bildkoordinaten berechnen.

```javascript
const IMG_W = 852, IMG_H = 1846;  // Pixelmaße background.png
const BUDDHA_PCT = 0.54;           // Buddha-Kopfkrone bei 54% Bildhöhe
const GONG_ASPECT = 312 / 360;     // Seitenverhältnis gong.png
const MIN_TIMER_ZONE = 115;        // Mindestplatz für Timer+Slider in px

function getBuddhaScreenY() {
  const scale = Math.max(window.innerWidth / IMG_W, window.innerHeight / IMG_H);
  const offsetY = (IMG_H * scale - window.innerHeight) / 2;
  return Math.round(IMG_H * BUDDHA_PCT * scale - offsetY);
}
```

`initLayout()` berechnet maximale Gonggröße, positioniert Timer-Area per `requestAnimationFrame` nach `getBoundingClientRect()`.

### 3. Dynamische Gonggröße
Gong wird so groß wie möglich, aber Buddha und Timer-Zone bleiben frei:
```javascript
const gongH = Math.min(360, buddhaY - MIN_TIMER_ZONE);
```

### 4. Flammen-Schein
Position ebenfalls per Bildgeometrie:
```javascript
const FLAME_X_PCT = 0.85;  // X-Position des Teelichts im Bild
const FLAME_Y_PCT = 0.72;  // Y-Position des Teelichts im Bild
```
Pulsierender Radial-Gradient (`mix-blend-mode: screen`), 6,5-Sekunden-Zyklus.

### 5. Abdunkelung (korrigierte Logik)
- `scheduleAutoDim()` wird nur einmal aufgerufen: 3s nach Timer-Start
- Overlay-Tap → `brighten()` ohne erneutes `scheduleAutoDim`
- Display-Tap (hell, Timer läuft) → sofort `dim()`

### 6. Navigation
- Linkes Icon (Uhr) entfernt – nur noch Musiknoten-Icon
- Nav blendet bei laufendem Timer mit `opacity: 0` aus (1,2s Übergang)
- Slider/Controls blendet mit `opacity: 0` aus (0,6s) – kein Layout-Sprung

### 7. START/STOP-Label
```css
#gong-label {
  position: absolute;
  top: 54%;  /* visuelle Mitte der Gong-Scheibe */
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 8. Menü-Design
Einheitlicher Georgia-Serif-Font, goldene Buttons (`rgba(180,120,50,...)`), abgerundete Ecken.

---

---

## Session 4 – Was neu gemacht wurde

### 1. Flammen-Schein per Slider einstellbar
Neuer Slider im Menü unter Abdunkelung. Steuert:
- **Alpha-Werte** des Radial-Gradienten via CSS-Variablen `--flame-a1`, `--flame-a2`
- **Größe** des Leuchtkreises via `--flame-size` (180px Aus → 400px Sehr stark)

Beschriftung dynamisch: Aus / Sehr leicht / Leicht / Mittel / Stark / Sehr stark.

### 2. Klang 1 als eingebaute Soundoption
- `klang1.mp3` (781 KB) liegt direkt im Repo
- Neuer Button „Klang 1 verwenden" im Menü
- Wird per `fetch` geladen und über die bestehende `customAudioBuffer`-Mechanik abgespielt
- Boris kann später weitere eingebaute Klänge analog hinzufügen

### 3. iOS Safari AudioContext-Fix
```javascript
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
```
Safari startet AudioContext immer im suspended-Zustand. Ohne `resume()` ist auf iPhone kein Ton zu hören.

---

## WICHTIGE Erkenntnis: iOS Stummschalter-Problem

**Apple verbietet allen Browsern auf iPhone den Klang bei aktivem Stummschalter.**
Das betrifft Safari, Chrome, Firefox, Edge – alle nutzen WebKit, alle respektieren den Schalter.
HTML5-Audio, Web Audio API, Video-Audio – kein Unterschied.

**Auf Android (Chrome) funktioniert es problemlos** – dort ist Medien- und Klingelton-Lautstärke getrennt.

**Konsequenz:** Wer die App auf iPhone bei stummem Handy nutzen will (Katharina!), braucht
einen **nativen Wrapper** (PWABuilder oder Capacitor). Dafür nötig:
- Apple Developer Account (99 $/Jahr)
- TestFlight für private Verteilung
- Synergie: gleicher Account nutzbar für TinnitusTracker (gleiches Problem dort!)

**Status:** Vorerst aufgeschoben. Erst Stummschalter-Hinweis im Menü, dann später ggf. nativer Weg.

---

## Bekannte offene Punkte / Nächste Schritte

### Akut für nächste Session
1. **Stummschalter-Hinweis im Menü** einbauen (z.B. „💡 Für Klang: iPhone-Stummschalter aus")
2. **Versionsnummer sichtbar machen** – kleines, dezentes Label
3. Versions-Workflow: bei jeder Änderung Versionsnummer hochzählen

### Mittelfristig
- **Nativer iOS-Wrapper** via PWABuilder/Capacitor (sobald Apple-Developer-Account angeschafft)
- **Gong-Animation zuckt noch** – Schwung-Keyframes weiter verfeinern

### Aufgeschoben
- Multi-MP3-Feature: bis zu 3 eigene MP3s mit Auswahl
- Service Worker (Offline-PWA) – braucht erst Internet beim Laden
- Buddha-Daumen-Animation (Boris' Idee – brauchte separates Hand-PNG)

---

## Wichtige Arbeitsregel (Session 3 festgelegt)
**Immer erst fragen, bevor eine Idee umgesetzt wird.** Boris entscheidet, was gebaut wird –
Claude schlägt vor und wartet auf Freigabe.

---

## Lokaler Entwicklungsserver
```
cd C:\Users\Boris\Projekte\MeditationsApp
npx serve -p 3456 .
```
http://localhost:3456

## Bilder-Versionen (in C:\Users\Boris\Projekte\Medi App\)
- Hintergrundbild_V0.3.png (aktuell aktiv) – Buddha unten, Bokeh oben
- Gong_V0.1.png (aktuell aktiv) – freigestellter Bronze-Gong mit Bügel

## Kontext für neue Session
- Boris ist Heilpraktiker, kein Entwickler – beurteilt visuell, misst keine Pixel
- Boris testet auf OnePlus 5 in Chrome (mit URL-Bar, NICHT als PWA)
- Debug-Overlay-Strategie hat funktioniert (stilles Messen im Hintergrund)
- Boris möchte immer erst gefragt werden, bevor etwas implementiert wird
