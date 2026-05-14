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
├── background.png    # Hintergrundbild (aktuell V0.3: Buddha, Bambus, Kerze)
├── gong.png          # Gong-Bild (freigestellt, RGBA PNG, V0.1)
└── CLAUDE.md         # Diese Datei
```

## Aktueller Stand (Session 1)

### Fertig & funktionierend
- Layout: Gong oben, Timer + Slider in der Mitte, Buddha unten frei
- Gong-Bild (freigestellt) mit Schwingungs-Animation (vor/zurück, sanft)
- Timer: 1–90 Minuten, Slider + +/- Buttons
- Display-Abdunkelung nach 3 Sekunden (schwarzes Overlay, 93% Deckkraft)
- Hell/Dunkel Toggle: Antippen → hell für 5 Sek → wieder dunkel
- Wenn hell: Klicks gehen durch Overlay (pointer-events: none) → Gong/STOP erreichbar
- Timer Ende → Gong-Sound + Display wieder normal
- Audio-Menü: Eigene MP3 hochladen oder Demo-Gong verwenden
- Demo-Gong: Synthetisch per Web Audio API (kein Download nötig)
- Wake Lock: Verhindert automatisches Screen-Ausschalten
- GitHub: https://github.com/Boris1900/Meditation-App

### Bekannte Bugs / ToDo
- START-Label sitzt noch auf dem Gong-Bügel statt auf der Scheibe (kosmetisch)
- Gong-Sound beim Tippen startet Timer mit 500ms Verzögerung (gewollt, aber prüfen)
- Abdunkelung wurde in Session 1 repariert (opacity/pointerEvents Reset beim Start)

### Offene Features (noch nicht gebaut)
- PWA Manifest + Service Worker (für Installation auf Homescreen)
- Auf echtem Handy testen

## Design-Entscheidungen
- Hintergrundbild: ChatGPT-generiert, Boris wählt Version (aktuell V0.3)
- Gong: Separates freigestelltes PNG → kann animiert werden
- Kein Zwischengong gewünscht
- Kein "MEDITATIONSDAUER"-Label (wurde entfernt)
- Abdunkelung per CSS-Overlay (Hardware-Dimming nicht über Web-APIs möglich)
- Schleier über Hintergrundbild: keiner (Boris wollte das volle Bild sehen)

## Lokaler Entwicklungsserver
```
cd C:\Users\Boris\Projekte\MeditationsApp
npx serve -p 3456 .
```
Dann: http://localhost:3456

## Bilder-Versionen (liegen in C:\Users\Boris\Projekte\Medi App\)
- Hintergrundbild_V0.1.png – dunkel, erste Version
- Hintergrundbild_V0.2.png – heller, freundlicher
- Hintergrundbild_V0.3.png – Buddha weiter unten, viel Bokeh oben (aktuell aktiv)
- Gong_V0.1.png – freigestellter Bronze-Gong mit Bügel (aktuell aktiv)
