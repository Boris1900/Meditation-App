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
├── gong.png          # Gong-Bild (freigestellt, RGBA PNG)
├── Sounds/           # Alle Klangschalen-MP3s
│   ├── Klangschale Morgenstern.mp3
│   ├── Klangschale Mittagspause.mp3
│   └── Klangschale Abendrot.mp3
└── CLAUDE.md         # Diese Datei
```

## Aktueller Stand (nach Session 10 – v1.20)

### Alles was funktioniert
- Layout, Timer 1–90 Min, Wake Lock
- Abdunkelung: einstellbar 0–95%, manuelle Kontrolle
- Flammen-Schein: Intensität und Größe einstellbar (Aus bis Sehr stark)
- Gong-Animation: rotateX vorwärts-rückwärts, sauber ohne Zucken, weiches Ausschwingen
- Gong-Animation läuft immer zu Ende bevor sie neu starten kann
- `transform-origin: top center` permanent auf #gong (kein Konflikt mit :active)
- `perspective: 800px` auf #gong-container (nicht in Keyframes)
- Klangschalen-Menü: 3 Klangschalen (Morgenstern, Mittagspause, Abendrot) – neue kürzere Samples (24–32 Sek., 44.1 kHz)
- Aktiver Klang-Button farbig markiert (Klasse `.selected`)
- Menü bleibt offen nach Klang-Auswahl – nur X-Button oben rechts schließt
- iOS Stummschalter-Hinweis (nur auf iPhone/iPad via isIOS())
- iOS/Android-Erkennung via isIOS()
- Update-Check-Button im Menü (vergleicht APP_VERSION in app.js)
- Menü scrollbar (max-height: 88vh, overflow-y: auto)
- PWA Manifest + Homescreen-Installation
- GitHub Pages: https://boris1900.github.io/Meditation-App/
- localStorage: merkt Klang, Meditationszeit, Abdunkelung, Flammen-Schein
- Versionsnummer dezent im Menü (APP_VERSION in app.js)
- iOS PWA Audio-Bug gefixt: rawAudioBuffer trennt Fetch von Decode, AudioContext wird erst beim Tippen erstellt
- App-Icon: icon-1024.png (Bambus-Hintergrund + Gong zentriert, 88%), apple-touch-icon in index.html
- **iOS Timer-Fix (v1.1–v1.5):** Jede Ziffer in festem `<span>` (renderTimer()), verhindert Wandern. Auf iOS: Merriweather 700 (lining-nums, gleichmäßige Höhen). Android bleibt Georgia.
- **Hintergrundbild (v1.8):** Direkt auf `html`-Element (background-attachment: fixed), body::before entfernt.
- **Flammen-Animation (v1.9):** CSS-Element exakt über Kerzen-Position (`FLAME_X_PCT = 0.85`, `FLAME_Y_PCT = 0.72`), sanftes Flackern per Keyframes (translateX + scaleY + opacity) – sehr ruhig, lebendig.
- **Update-Funktion (v1.6):** CSS/JS werden vor Reload mit `cache: reload` frisch geladen. Auf iOS funktioniert der Update-Reload noch nicht zuverlässig → dort über Safari direkt laden.

### Erststart-Defaults (wenn localStorage leer)
| Einstellung | Default |
|---|---|
| Klang | Klangschale Morgenstern |
| Meditationszeit | 30 Minuten |
| Abdunkelung | Keine (0%) |
| Flammen-Schein | Mittel (60%) |

### Tipp-Logik
| Situation | Tap auf Gong | Tap woanders |
|---|---|---|
| Timer läuft, abgedunkelt | – (Overlay fängt ab) | Aufhellen (bleibt hell) |
| Timer läuft, hell | Stoppen + Klang + Schwingen | Sofort abdunkeln |
| Timer gestoppt | Starten + Klang + Schwingen | – |

---

## Bekannte offene Punkte / Nächste Schritte

### Akut – Ungeklärter Bug (Priorität hoch)

**Weiße Linie oben – hartnäckig, bisher nicht gelöst (v1.9–v1.20)**

**Exakte Reproduktion:**
- Screen-Off → Screen-On → Android-Statusbar erscheint kurz → zieht sich zurück → weiße Linie bleibt oben
- Nur auf Android (OnePlus 5 / Chrome), iOS kein Problem
- Statusbar manuell runterziehen und wieder hochziehen: KEIN Problem → visualViewport.resize greift dann

**Was wir wissen:**
- Der Viewport-Resize (Statusbar) passiert **während die Seite noch hidden ist** – bevor `visibilitychange` feuert. Deshalb greifen Event-basierte Reparatur-Ansätze zu spät.
- `visualViewport.resize` funktioniert beim manuellen Statusbar-Test, nicht beim Screen-On.
- `z-index: -1` auf `#app-bg` hatte problematisches Verhalten hinter dem body-Stacking-Kontext → auf `z-index: 0` geändert (v1.20).
- Selbst mit `html { background-color: #1a1a1a }` ist die Linie noch weiß – sie kommt also nicht vom html-Element, sondern vermutlich aus dem Android/Chrome-Rendering selbst.

**Aktueller Stand v1.20 (noch ungetestet ob es hilft):**
- `#app-bg`: `position: fixed; z-index: 0; height: window.screen.height`
- `html`: `background-color: #1a1a1a` (Fallback)
- `visibilitychange`: Repaint sofort + nach 150ms + nach 400ms
- `visualViewport.resize`: Repaint wenn Viewport wächst

**Nächste Ansätze falls v1.20 nicht hilft:**
- Möglichkeit: Linie liegt im Browser-Chrome (oberhalb HTML), dann hilft kein CSS-Fix → `theme-color` oder nativer Wrapper nötig
- Möglichkeit: `#app-bg` noch ohne `position: fixed` testen, direkt als body-Hintergrund mit anderem Trick
- Möglichkeit: `overscroll-behavior: none` auf html/body

### Mittelfristig
- **Nativer iOS-Wrapper** via PWABuilder/Capacitor (Stummschalter-Bypass)
- Gong-Animation: Schwung-Keyframes ggf. weiter verfeinern
- Weitere Klangschalen einfach hinzufügbar (Muster: eine Zeile HTML + MP3 in Sounds/)

### Aufgeschoben
- Multi-MP3-Feature: eigene Uploads dauerhaft speichern
- Service Worker (Offline-PWA)

---

## Audio-Architektur (wichtig!)
- **Kein synthetischer Demo-Gong mehr** – wurde in Session 5 entfernt
- Alle Sounds liegen als MP3 im `Sounds/`-Ordner
- Web Audio API: `AudioContext` → `BufferSource` → `destination`
- iOS AudioContext-Fix: `resume()` wird vor jedem `source.start()` awaited
- Klang-Buttons haben `data-file` und `data-label` Attribute → generischer Handler
- Neue Klangschale hinzufügen: HTML-Zeile + MP3-Datei, kein JS nötig

## Versions-Workflow
Bei jeder Änderung in `app.js` die Zeile `const APP_VERSION = 'v1.0'` hochzählen.
Update-Check-Button im Menü prüft dies automatisch.

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

## Kontext für neue Session
- Boris ist Heilpraktiker, kein Entwickler – beurteilt visuell, misst keine Pixel
- Boris testet auf OnePlus 5 in Chrome und iPhone (Katharina)
- Wichtig: iOS PWA Audio-Bug ist bekannt und dokumentiert, Fix-Plan steht oben
