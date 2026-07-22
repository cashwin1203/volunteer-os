# Volunteer OS 🚀

**The Operating System for Volunteer-Led NGO Learning Centers**

Volunteer OS is an end-to-end operational platform built for education-focused NGOs (inspired by U&I India). It replaces fragmented WhatsApp chats, paper sign-ins, and spreadsheets with an automated **WhatsApp Conversational Bot**, **Center Coordinator Console**, and **Chapter Leader Executive Dashboard**.

---

## ✨ Features

- **📱 WhatsApp Conversational Bot:**
  - Automated Friday RSVP pings with 1-tap buttons (`[ ✅ Attending ]`, `[ ❌ Request Absence ]`, `[ 🔄 Standby Backup ]`).
  - 1-tap Saturday center check-in (`[ 📍 Check In Now ]`).
  - Conversational text session logging.
  - Text `/status` for instant center roster attendance.
- **🌴 Center Coordinator Console:**
  - 1-click **"Pause RSVPs for Holiday"** toggle to suspend automated alerts during vacation weeks.
  - Real-time Saturday slot roster management.
  - Educational logbook & student support tracker.
- **🛡️ Chapter Leader Executive Dashboard:**
  - Real-time active volunteer retention radar across city centers (Vihana, Mala, Ramamurthynagar).
  - Retention Risk Watchlist (flags volunteers missing 2+ consecutive sessions).
  - **AI Impact Copilot:** Generates executive impact reports for corporate CSR & donor grants.
- **💻 Interactive WhatsApp Web Simulator:**
  - Live in-app mobile phone mockup for instant browser testing without Meta API keys.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Database & ORM:** SQLite with Prisma ORM
- **API & Webhooks:** Next.js Dynamic Route Handlers (`/api/webhooks/whatsapp`, `/api/whatsapp/send`, `/api/dashboard`, `/api/centers`, `/api/sessions`)
- **Styling:** Custom Vanilla CSS with modern dark-mode glassmorphism

---

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/cashwin1203/volunteer-os.git
   cd volunteer-os
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Sync database and seed mock data:**
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 Documentation

- [Product Requirements Document (PRD)](https://github.com/cashwin1203/volunteer-os)
- [Product Case Study](https://github.com/cashwin1203/volunteer-os)
- [User Personas & Journey Maps](https://github.com/cashwin1203/volunteer-os)

---

## 🌐 100% Free Production Deployment

- **Hosting:** Vercel Hobby Tier (Free)
- **Database:** Turso Edge SQLite / Supabase (Free Tier)
- **WhatsApp API:** Meta WhatsApp Cloud API (1,000 free conversations/month)
