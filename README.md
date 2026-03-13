# 🚗 Carvengers

**KI-gestützte Gebrauchtwagenprüfung — Vertrauen beim Autokauf.**

Carvengers ist eine mobile App, die Käufer von Gebrauchtwagen bei der Fahrzeugprüfung unterstützt. Durch eine Kombination aus KI-Analyse, strukturierter Fotodokumentation und optionaler Expertenprüfung erhalten Nutzer einen fundierten Inspektionsbericht.

## Features

- 🔐 **Authentifizierung** — E-Mail, Google Login
- 🚘 **Fahrzeug-Erfassung** — Echte Marken & Modelle für den deutschen Markt mit Varianten
- 📸 **Geführter Foto-Upload** — 8 Kategorien mit Kamera-Overlays (Turo-Style)
- 🔍 **FIN-Scanner** — Kamerabasierter VIN-Scan (OCR vorbereitet)
- 🤖 **KI-Analyse** — OCR für Tachostand, Mock-Befunde (erweiterbar)
- 📋 **Inspektionsbericht** — Strukturierter Report mit Bewertung
- 📜 **FIN-Verlauf** — Alle Inspektionen pro Fahrzeug
- 💳 **Zahlung** — Stripe, PayPal, Google/Apple Pay (Mock für MVP)
- 🌙 **Dark Mode** — Automatisch + manuell umschaltbar
- 👤 **Profil** — Foto, persönliche Daten, Passwort ändern

## Tech Stack

- **Frontend:** React Native + Expo (SDK 54)
- **Sprache:** TypeScript
- **Routing:** Expo Router
- **State:** Zustand
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Forms:** React Hook Form + Zod
- **Kamera:** expo-camera + SVG Overlays
- **Zahlung:** Stripe/PayPal (Architektur vorbereitet)

## Installation

```bash
git clone https://github.com/Acy19888/carvengers.git
cd carvengers
npm install --legacy-peer-deps
```

### Firebase einrichten

1. Kopiere `.env.example` zu `.env`
2. Trage deine Firebase-Werte ein
3. Aktiviere in Firebase Console: Authentication (E-Mail + Google), Firestore, Storage

### Starten

```bash
npx expo start
```

Scanne den QR-Code mit der Expo Go App (Android/iOS).

## Projektstruktur

```
app/                  # Expo Router Screens
  auth/               # Login, Signup
  (tabs)/             # Home, Verlauf, Profil
  case/               # Create, Upload, Detail, Report
components/
  ui/                 # Button, Input, Picker, AnimatedCard, etc.
  media/              # GuidedCamera, CameraOverlay, VinScanner, OCR Modal
  case/               # TierPicker, PaymentMethodPicker
services/
  firebase/           # Auth, Cases, Media, Findings, Profile, VIN History
  ocr/                # OCR Abstraktion (Mock)
  payments/           # Stripe/PayPal Abstraktion (Mock)
  vin/                # VIN Decoder Abstraktion
store/                # Zustand Stores + Theme Context
types/                # TypeScript Interfaces
constants/            # Theme, Fahrzeugdaten, Preise, Labels
```

## Roadmap

- [ ] Echte OCR-Integration (Google Vision API)
- [ ] Echte Zahlungsabwicklung (Stripe SDK)
- [ ] VIN-Decoder API Integration
- [ ] Apple Login
- [ ] PDF-Export für Berichte
- [ ] Push-Benachrichtigungen
- [ ] Inspector-Dashboard
- [ ] Mehrsprachigkeit (DE/EN)
- [ ] Firebase Storage Upload (Blaze Plan)

## Lizenz

Proprietär — © 2026 Carvengers
