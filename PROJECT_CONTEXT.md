# Carvengers — Project Context

## Was ist Carvengers?
Eine mobile App zur KI-gestützten Gebrauchtwagenprüfung für den deutschen Markt.

## Zielgruppe
Privatpersonen, die einen Gebrauchtwagen kaufen möchten und eine unabhängige Prüfung wünschen.

## MVP-Status
Das Projekt ist im MVP-Stadium. Folgendes funktioniert:
- Authentifizierung (E-Mail + Google vorbereitet)
- Inspektionsfall erstellen mit echten Marken/Modellen
- Geführter Foto-Upload mit Kamera-Overlays
- Mock-OCR für Tachostand
- Mock-Befunde (KI-Analyse simuliert)
- Strukturierter Inspektionsbericht
- FIN-Verlauf (alle Inspektionen pro Fahrzeug)
- Mock-Zahlungsabwicklung
- Dark Mode
- Profilverwaltung

## Architektur-Entscheidungen
- **Expo Router** für File-based Routing
- **Zustand** für globalen State (Auth, Cases)
- **React Context** für Theme
- **Firebase** als Backend (Auth + Firestore + Storage)
- **Services-Layer** kapselt alle Firebase-Operationen
- **Relative Imports** statt Path-Aliases (Expo Go Kompatibilität)

## Coding-Regeln
- TypeScript überall, kein `any`
- Screens unter 300 Zeilen
- Business-Logik in Services, nicht in Screens
- Firebase-Code nur in `services/firebase/`
- Deutsche UI-Texte (App ist für den deutschen Markt)
- Alle Farben über Theme-Context (Dark Mode Support)

## Mock-Services (für echte Integration vorbereitet)
- `services/ocr/` → Ersetzen mit Google Vision API
- `services/payments/` → Ersetzen mit Stripe SDK
- `services/vin/` → Ersetzen mit VIN-Decoder API (z.B. vindecoder.eu)
- `services/firebase/media.ts` → Upload aktivieren mit Firebase Blaze Plan

## Nächste Schritte
1. Echte Zahlungsintegration (Stripe)
2. Echte OCR (Google Vision)
3. VIN-Decoder API
4. Apple Login
5. PDF-Report-Export
6. Inspector-Dashboard
