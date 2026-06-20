# Augenblick – Projektdokumentation

## Übersicht
Meditations-Timer mit Klangschale für Boris + Katharina, auch weitergebbar.
PWA + Android APK via Capacitor. v1.75 live.
GitHub Pages: https://boris1900.github.io/Meditation-App/ | Repo: Boris1900/Meditation-App
Android-Paketname `de.tinnituspraxis.meditation` bleibt vorerst (Legacy).

## Aktueller Stand – v1.88

**Timer:** 1–90 Min, Wake Lock, 3 Klangschalen, Zwischen-Gong (Checkbox + Slider)

**Menü-Reihenfolge:**
1. Gong-Sound wählen
2. Zwischen-Gong
3. Timeranzeige abdunkeln ☐ – übergeordnet alle Hintergründe; dimmt nach 3s, Tap hellt 2,5s auf
4. Display abdunkeln – Slider 0–95%, gilt für ALLE außer Berg
5. Hintergrund (10 Kästchen: Buddha, Erwachen, Abendrot, Schwarz, Sehr dunkel, Dunkelgrau, Dunkelblau, Dunkelgrün, Grasgrün, Gelb)
6. Lebendige Flamme 🕯️ – erscheint nur bei Buddha
7. Auf Update prüfen

**Immersive Hintergründe:**
- **Erwachen (Berg):** Sonnenaufgang-Animation (schwarz → goldene Morgendämmerung). Gong unsichtbar, Tap → Gong + Timer 2,5s sichtbar. Abdunkelung deaktiviert.
- **Abendrot (Meer):** Sonnenuntergang-Animation. Sonne sinkt, Aura wächst, Wasser 3-Punkte-Farbverlauf (orange → weinrot → dunkel). Gong wie Berg. Abdunkelung aktiv.

**⚠️ Horizont-Regel (ab v1.74, am iPhone verifiziert):**
Positionen IMMER per `getBoundingClientRect()` auf `#app-bg` messen – NIE aus `window.innerHeight` / `screen.height`. Auf iOS weichen diese Werte ab!

**Wichtige Konstanten:**
```
MEER_IMG_W=948, MEER_IMG_H=1659, MEER_HORIZON_FRAC=0.58, MEER_SUN_SIZE=300, MEER_DISC_PCT=0.24
FLAME_X_PCT=0.8449, FLAME_Y_PCT=0.7378, AURA_X_PCT=0.28, AURA_Y_PCT=0.59, AURA_SIZE_PCT=0.46
IMG_W_GONG=1024, IMG_H_GONG=1536, DISC_Y_PCT=0.537, DISC_R_PCT=0.292
```

## Build-Workflow Android
1. Änderungen vornehmen + Version hochzählen: `app.js` (APP_VERSION) + `sw.js` (CACHE_NAME)
2. `.\build-android.ps1`
3. `$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"; $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"; cd android; .\gradlew assembleDebug`
4. `Copy-Item android\app\build\outputs\apk\debug\app-debug.apk Augenblick-vX.XX.apk`
5. `gh release create vX.XX Augenblick-vX.XX.apk --title "..." --notes "..."`

**Neue Datei?** → auch in `build-android.ps1` + `sw.js` eintragen!

## Feature-Historie (kompakt)
- v1.53–v1.62: Zwischen-Gong, Farbhintergründe, Gong-Welleneffekt, Berglandschaft
- v1.63–v1.68: Abendrot-Modus aufgebaut und fertiggestellt
- v1.69–v1.71: Abendrot-Feintuning, Gong-Tap Berg+Meer, Timer-Dimming Berg+Meer
- v1.72: iOS-Fix berglandschaft (nie in Git), Swatch-Größen einheitlich
- v1.74: Horizont geräteunabhängig korrekt (getBoundingClientRect, iPhone verifiziert)
- v1.75: Menü umgebaut, Timeranzeige abdunkeln (alle), Display abdunkeln (alle außer Berg), Lebendige Flamme nur Buddha
- v1.76: Android-Fix Sonne beim ersten Start (Fallback window.innerHeight wenn rect.height=0)
- v1.77: Slider-Label-Abstand vereinheitlicht (gap entfernt, margin-top 10px bei Zgong + Dim)
- v1.78: Sternschnuppen im Berg-Hintergrund (erste nach ~10s, dann alle 1–5 min, Helligkeit-abhängig)
- v1.79: Menü-Icon auf Hamburger (drei Striche) geändert
- v1.80: Statusleiste während Meditation ausgeblendet (StatusBar.hide bei Start, show bei Stop/Finish). Nur Android-APK – iOS-PWA kann Statusleiste nicht per JS ausblenden
- v1.81: Einheitliches Tap-Verhalten beim Restzeit-Blick. Zweiter Tap blendet sofort aus (Gong bei Berg/Meer via hideBergGong; Display-Overlay bei Buddha/Farben). Kein Tap → Auto-Fade nach 4s (vorher Berg/Meer 2,5s, Farben blieben hell)
- v1.82: Hintergrund-Karussell. Wischen in der Hauptansicht (nur im Ruhezustand) blättert durch alle 10 Hintergründe in Menü-Reihenfolge, Endlos-Schleife, mit Slide-Animation (#bg-slide). Seiten-Pünktchen (#bg-dots) zeigen Position, blenden beim Start aus wie der Gong. Bilder werden beim Start vorgeladen. BG_ORDER + slideBgTo + bgBaseStyle. Berg/Meer-Overlays rasten nach dem Slide ein (statisches Bild gleitet, Szene danach)
- v1.83: Seiten-Pünktchen neu positioniert (über der Hamburger-Nav am unteren Bildrand statt darunter) und dezenter (kleiner, geringere Opacity). Reiner Indikator, nicht antippbar (zu fummelig)
- v1.84 (nicht released, in v1.85 enthalten): Hamburger-Balken Milchglas einheitlich
- v1.85: Zwei Dinge. (1) Hamburger-Balken (#bottom-nav) einheitliches Milchglas auf allen Hintergründen: statt deckendem rgba(0,0,0,0.5) jetzt rgba(28,28,30,0.30) + blur(18px) saturate(1.6) + -webkit-backdrop-filter (iOS) + hellere Oberkante (vorher bei Farbflächen schwarzer Klotz). (2) Wischen funktioniert jetzt auf echtem Android: Umstellung von Pointer- auf echte Touch-Events mit preventDefault (passive:false). Pointer-Events brachen mit pointercancel ab → nichts passierte. Hintergrund folgt jetzt LIVE dem Finger (touchmove translatiert #app-bg + Szenen-Overlays + #bg-slide), rastet ab 18% Viewport-Breite ein, sonst Zurückschnappen. slideBgTo entfernt (toter Code)
- v1.86: Slide-Bugfix. Beim Wegwischen von Meer/Berg blitzten die Szenen-Overlays (Meer-Sonne, Reflexion) kurz mittig über dem neuen Hintergrund auf. Ursache: Abschluss-Animation nutzte translateX(-100%), aber die Overlays sind unterschiedlich groß (Sonne nur 300px), rutschten so nicht ganz raus. Fix: Exit jetzt in Pixeln (volle Viewport-Breite, dragViewW) statt Prozent; zusätzlich setBg vor dem Transform-Reset (versteckt Overlays früher)
- v1.87: Berg beim Reinwischen sofort dunkel statt erst hell-dann-dunkel. (1) bgBaseStyle('berg') hat jetzt dunklen Nacht-Schleier eingebacken (linear-gradient rgba(0,13,24,0.9) über dem Bild), damit die Slide-Vorschau dunkel ist. (2) showBergScene setzt den berg-overlay beim Einblenden sofort (transition:none + reflow + restore), sonst blendete er von 0 auf 0.9 über 1,2s ein → kurz hell. Sonnenaufgang-Animation beim Timer bleibt erhalten
- v1.88: Meer-Szene beim Reinwischen sanft einblenden (Option C) statt schlagartig. fadeInMeerScene() animiert Opacity von Sonne/Aura (meer-sun-wrap), Reflexion, Wasser von 0 auf Zielwert (~550ms), aufgerufen am Slide-Abschluss wenn targetKey==='meer'. Fasst die Horizont-Positionierung NICHT an (nur Opacity, risikoarm). Berg bleibt sofort-dunkel (v1.87)

## Offene Punkte

- **Strandbild** geplant (Sonnenuntergang, DALL-E-Prompt in alter CLAUDE.md)
- **Checkliste neue Hintergründe** beachten → Memory: `feedback_neue_hintergruende_checkliste`
- **Tinnitus-Meditations-App** – separates Repo, Field Recordings, Web Audio API gapless loop
- Play Store (25€), weitere Klangschalen

## Arbeitsregeln
⛔ **Nie pushen ohne Boris-OK.** Commit ok, aber vor `git push` immer fragen.
⛔ **Push und APK immer zusammen** – nie nur eines von beiden.
⛔ **Neue visuelle Features erst lokal testen** (`npx serve -p 3456 .`) → Feedback → dann push/APK.
✅ **Immer erst fragen bevor umgesetzt wird.**

## Kontext
- Boris: Heilpraktiker, kein Entwickler, beurteilt visuell
- Testgeräte: OnePlus 5 Android (Boris) + iPhone Katharina
- Android Studio Panda 4, debug APK, StatusBar transparent via `@capacitor/status-bar`
- **Session-Start:** "Lies die CLAUDE.md und sag wo wir stehen"
