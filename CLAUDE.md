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
└── CLAUDE.md         # Diese Datei
```

## Aktueller Stand (nach Session 3 – abgeschlossen)

### Alles was funktioniert
- Layout, Gong-Animation (leichtes Zucken noch bekannt), Timer 1–90 Min
- Audio-Menü mit einheitlichem Georgia-Font, goldene Buttons
- Demo-Gong (synthetisch) + MP3-Upload
- Wake Lock
- Abdunkelung: einstellbar 0–95%, manuelle Kontrolle
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

## Bekannte offene Punkte

### Gong-Animation zuckt noch
Der Schwung (`gong-strike` Animation) ist besser als zuvor, aber noch nicht perfekt.
Boris hat bestätigt: „lassen wir erstmal."

### Multi-MP3-Feature (aufgeschoben)
Idee: bis zu 3 eigene MP3s laden, mit Auswahl im Menü. Boris: „das machen wir später."

### Service Worker (Offline-PWA)
Noch nicht implementiert – App braucht Internet beim ersten Laden.

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
