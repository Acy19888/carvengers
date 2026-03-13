# 🚗 Carvengers

**[🇬🇧 English](#english) | [🇩🇪 Deutsch](#deutsch)**

---

<a name="english"></a>
## 🇬🇧 English

**AI-powered used car inspection — Buy with confidence.**

Carvengers is a mobile app that helps used car buyers inspect vehicles before purchasing. Through a combination of AI analysis, structured photo documentation, and optional expert inspection, users receive a comprehensive inspection report.

### Features

- 🔐 **Authentication** — Email, Google Login
- 🚘 **Vehicle Entry** — Real makes & models for the German market with engine variants
- 📸 **Guided Photo Upload** — 8 categories with camera overlays (Turo-style)
- 🔍 **VIN Scanner** — Camera-based VIN scan (OCR ready)
- 🤖 **AI Analysis** — OCR for odometer reading, mock findings (extensible)
- 📋 **Inspection Report** — Structured report with overall rating
- 📜 **VIN History** — All inspections per vehicle
- 💳 **Payments** — Stripe, PayPal, Google/Apple Pay (mock for MVP)
- 🌙 **Dark Mode** — Auto-detect + manual toggle
- 👤 **Profile** — Photo, personal info, change password

### Tech Stack

- **Frontend:** React Native + Expo (SDK 54)
- **Language:** TypeScript
- **Routing:** Expo Router
- **State:** Zustand
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Forms:** React Hook Form + Zod
- **Camera:** expo-camera + SVG Overlays
- **Payments:** Stripe/PayPal (architecture prepared)

### Installation

```bash
git clone https://github.com/Acy19888/carvengers.git
cd carvengers
npm install --legacy-peer-deps
```

#### Firebase Setup

1. Copy `.env.example` to `.env`
2. Enter your Firebase values
3. Enable in Firebase Console: Authentication (Email + Google), Firestore, Storage

#### Run

```bash
npx expo start
```

Scan the QR code with the Expo Go app (Android/iOS).

### Project Structure

```
app/                  # Expo Router Screens
  auth/               # Login, Signup
  (tabs)/             # Home, History, Profile
  case/               # Create, Upload, Detail, Report
components/
  ui/                 # Button, Input, Picker, AnimatedCard, etc.
  media/              # GuidedCamera, CameraOverlay, VinScanner, OCR Modal
  case/               # TierPicker, PaymentMethodPicker
services/
  firebase/           # Auth, Cases, Media, Findings, Profile, VIN History
  ocr/                # OCR abstraction (mock)
  payments/           # Stripe/PayPal abstraction (mock)
  vin/                # VIN Decoder abstraction
store/                # Zustand Stores + Theme Context
types/                # TypeScript Interfaces
constants/            # Theme, Vehicle data, Prices, Labels
```

### Roadmap

- [ ] Real OCR integration (Google Vision API)
- [ ] Real payment processing (Stripe SDK)
- [ ] VIN Decoder API integration
- [ ] Apple Sign-In
- [ ] PDF export for reports
- [ ] Push notifications
- [ ] Inspector dashboard
- [ ] Multilingual support (DE/EN)
- [ ] Firebase Storage upload (Blaze Plan)

### License

Proprietary — © 2026 Carvengers

---

<a name="deutsch"></a>
## 🇩🇪 Deutsch

**KI-gestützte Gebrauchtwagenprüfung — Vertrauen beim Autokauf.**

Carvengers ist eine mobile App, die Käufer von Gebrauchtwagen bei der Fahrzeugprüfung unterstützt. Durch eine Kombination aus KI-Analyse, strukturierter Fotodokumentation und optionaler Expertenprüfung erhalten Nutzer einen fundierten Inspektionsbericht.

### Features

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

### Tech Stack

- **Frontend:** React Native + Expo (SDK 54)
- **Sprache:** TypeScript
- **Routing:** Expo Router
- **State:** Zustand
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Forms:** React Hook Form + Zod
- **Kamera:** expo-camera + SVG Overlays
- **Zahlung:** Stripe/PayPal (Architektur vorbereitet)

### Installation

```bash
git clone https://github.com/Acy19888/carvengers.git
cd carvengers
npm install --legacy-peer-deps
```

#### Firebase einrichten

1. Kopiere `.env.example` zu `.env`
2. Trage deine Firebase-Werte ein
3. Aktiviere in Firebase Console: Authentication (E-Mail + Google), Firestore, Storage

#### Starten

```bash
npx expo start
```

Scanne den QR-Code mit der Expo Go App (Android/iOS).

### Projektstruktur

```
app/                  # Expo Router Screens
  auth/               # Login, Signup
  (tabs)/             # Home, Verlauf, Profil
  case/               # Erstellen, Upload, Detail, Bericht
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

### Roadmap

- [ ] Echte OCR-Integration (Google Vision API)
- [ ] Echte Zahlungsabwicklung (Stripe SDK)
- [ ] VIN-Decoder API Integration
- [ ] Apple Login
- [ ] PDF-Export für Berichte
- [ ] Push-Benachrichtigungen
- [ ] Inspector-Dashboard
- [ ] Mehrsprachigkeit (DE/EN)
- [ ] Firebase Storage Upload (Blaze Plan)

### Lizenz

Proprietär — © 2026 Carvengers
