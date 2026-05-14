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

## Aktueller Stand (Session 3 – noch offen!)

### Funktioniert
- Layout, Gong-Animation, Timer 1–90 Min
- Audio-Menü, Demo-Gong, MP3-Upload
- Wake Lock
- Abdunkelung mit einstellbarer Stufe (0–95%)
- Tipp-Logik komplett überarbeitet (siehe Tabelle unten)
- PWA Manifest + Homescreen-Installation
- GitHub Pages: https://boris1900.github.io/Meditation-App/
- Wenn Timer läuft: Slider wird ausgeblendet, nur Zeitanzeige bleibt

### Tipp-Logik
| Situation | Tap auf Gong | Tap woanders |
|---|---|---|
| Timer läuft, abgedunkelt | Aufhellen (kein Klang) | Aufhellen |
| Timer läuft, hell | Stoppen + Klang + Schwingen | Nach 3s wieder abdunkeln |
| Timer gestoppt | Starten + Klang + Schwingen | – |

### NOCH NICHT GELÖST: Timer-Position auf verschiedenen Handygrößen

**Boris' Anforderung:** Timer-Anzeige (40:00) und Slider sollen auf JEDEM Handy mittig im freien Raum zwischen Gong-Unterkante und Buddha-Kopfspitze sitzen. Nichts soll Gong oder Buddha überlappen.

**Konkretes Testgerät:** OnePlus 5
- Aus DEBUG-Daten: `window.innerHeight = 651px`, `gongBottom = 283px`
- Visuell: Buddha-Kopf bei ~62% von innerHeight = ~403px
- Verfügbarer Raum zwischen Gong und Buddha: 120px

**Was wir versucht haben (alles fehlgeschlagen):**
1. Hardcoded percentage (68% → 56% → 50%) für buddhaHeadY → entweder Slider auf Buddha oder Timer zu hoch/tief
2. Gong responsive mit `min(360px, 40vh)` → bisschen kleiner, half nicht entscheidend
3. `dvh` statt `vh` für Gong-Höhe → soll vh-Diskrepanz auf Android Chrome lösen
4. Faktor 1.55 (= 62/40) als Verhältnis Buddha-Position zu Gong-Höhe
5. `justify-content: flex-start` für gestoppt vs `center` für laufend
6. Padding-top auf Timer-Area variiert (4px, 8px, 10px)
7. "40 Minuten" Label entfernt → spart 28px
8. adj-btn von 40px auf 36px verkleinert

**Boris' letzte Rückmeldung (kritisch):**
> "ich verstehe das nicht. den gong noch kleiner? es ist so viel platz zwischen gong und buddha kopfspitze für time anzeige und slider. da muss doch nicht der gong noch kleiner."

**Boris hat RECHT:** Der Raum IST groß genug. Das Problem liegt vermutlich in:
- Doppelte CSS-Regel für `#timer-area` (Zeilen 219 und 341 in style.css) → mögliches Cascade-Problem
- Browser-Cache: Boris sieht evtl. alte Versionen
- Visuelle Wahrnehmung: Mein Code positioniert Timer am ANFANG der freien Zone (flex-start + padding-top: 4px), aber visuell scheint er weiter unten zu sitzen
- Möglicherweise ist meine 1.55-Faktor Annahme falsch, weil das Background-Image evtl. anders skaliert als angenommen

### Nächste Schritte für neue Session
1. **Erst messen, dann coden:** Auf OnePlus 5 die ECHTEN Werte für Gong-Bottom UND Buddha-Kopf-Position bekommen (Debug-Overlay einbauen mit beiden Werten, evtl. auch ein vertikaler Strich an der vermuteten Buddha-Position zur visuellen Prüfung)
2. **Nicht vor-rechnen:** Stattdessen Boris fragen, ob er manuell die Position einstellen will (z.B. mit einem versteckten Slider zum Justieren des padding-top), oder per Tipp-Geste
3. **Alternative:** Vielleicht ist das Problem grundsätzlich, dass Timer + Slider zusammen einfach zu hoch sind. Slider ins Audio-Menü verschieben? Oder +/- Buttons direkt neben den Timer setzen statt darunter?

### Offene Bugs
- START-Label sitzt noch auf dem Gong-Bügel statt auf der Scheibe (kosmetisch, niedrige Prio)
- Service Worker für Offline-PWA noch nicht implementiert

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
- Boris ist Heilpraktiker, kein Entwickler – er kann visuell beurteilen, aber keine Pixel messen
- Boris testet auf OnePlus 5 in Chrome (mit URL-Bar sichtbar, NICHT als PWA)
- Wenn Boris gefragt hat das Handy-Modell zu nennen → tat er. Hat funktioniert.
- DEBUG-Overlay-Strategie hat funktioniert um echte Werte zu bekommen
- Boris ist verständlicherweise frustriert nach mehreren Fehlversuchen
