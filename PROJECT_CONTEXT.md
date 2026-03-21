# Carvengers — Project Context

**[🇬🇧 English](#english) | [🇩🇪 Deutsch](#deutsch)**

---

<a name="english"></a>
## 🇬🇧 English

### What is Carvengers?
A mobile app for AI-powered used car inspections targeting the German market.

### Target Audience
Private individuals looking to buy a used car who want an independent inspection.

### MVP Status
The project is in MVP stage. The following works:
- Authentication (email + Google prepared)
- Create inspection case with real makes/models
- Guided photo upload with camera overlays
- Mock OCR for odometer reading
- Mock findings (AI analysis simulated)
- Structured inspection report
- VIN history (all inspections per vehicle)
- Mock payment processing
- Dark mode
- Profile management

### Architecture Decisions
- **Expo Router** for file-based routing
- **Zustand** for global state (Auth, Cases)
- **React Context** for theme
- **Firebase** as backend (Auth + Firestore + Storage)
- **Services layer** encapsulates all Firebase operations
- **Relative imports** instead of path aliases (Expo Go compatibility)

### Coding Rules
- TypeScript everywhere, no `any`
- Screens under 300 lines
- Business logic in services, not screens
- Firebase code only in `services/firebase/`
- German UI texts (app targets the German market)
- All colors via theme context (dark mode support)

### Mock Services (prepared for real integration)
- `services/ocr/` → Replace with Google Vision API
- `services/payments/` → Replace with Stripe SDK
- `services/vin/` → Replace with VIN Decoder API (e.g. vindecoder.eu)
- `services/firebase/media.ts` → Enable upload with Firebase Blaze Plan

### Next Steps
1. Real payment integration (Stripe)
2. Real OCR (Google Vision)
3. VIN Decoder API
4. Apple Sign-In
5. PDF report export
6. Inspector dashboard

---

<a name="deutsch"></a>
## 🇩🇪 Deutsch

### Was ist Carvengers?
Eine mobile App zur KI-gestützten Gebrauchtwagenprüfung für den deutschen Markt.

### Zielgruppe
Privatpersonen, die einen Gebrauchtwagen kaufen möchten und eine unabhängige Prüfung wünschen.

### MVP-Status
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

### Architektur-Entscheidungen
- **Expo Router** für File-based Routing
- **Zustand** für globalen State (Auth, Cases)
- **React Context** für Theme
- **Firebase** als Backend (Auth + Firestore + Storage)
- **Services-Layer** kapselt alle Firebase-Operationen
- **Relative Imports** statt Path-Aliases (Expo Go Kompatibilität)

### Coding-Regeln
- TypeScript überall, kein `any`
- Screens unter 300 Zeilen
- Business-Logik in Services, nicht in Screens
- Firebase-Code nur in `services/firebase/`
- Deutsche UI-Texte (App ist für den deutschen Markt)
- Alle Farben über Theme-Context (Dark Mode Support)

### Mock-Services (für echte Integration vorbereitet)
- `services/ocr/` → Ersetzen mit Google Vision API
- `services/payments/` → Ersetzen mit Stripe SDK
- `services/vin/` → Ersetzen mit VIN-Decoder API (z.B. vindecoder.eu)
- `services/firebase/media.ts` → Upload aktivieren mit Firebase Blaze Plan

### Nächste Schritte
1. Echte Zahlungsintegration (Stripe)
2. Echte OCR (Google Vision)
3. VIN-Decoder API
4. Apple Login
5. PDF-Report-Export
6. Inspector-Dashboard
