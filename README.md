# Volunteer OS

**A Full-Stack Operational Management Platform & Conversational Engine for NGO Learning Centers**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=flat-square&logo=sqlite)](https://www.sqlite.org/)

---

## Overview

Volunteer OS is a full-stack enterprise operating system designed to manage the operational lifecycle of volunteer-led education centers (inspired by U&I India). 

While traditional NGO software focuses primarily on donor fundraising or upfront volunteer recruitment ATS pipelines, Volunteer OS addresses the post-onboarding operational layer: automating weekly roster RSVPs, field check-ins, educational session logging, and chapter retention analytics.

---

## Architecture & System Design

Volunteer OS combines an event-driven API layer with a relational database model and interactive client dashboards.

```
                                  +---------------------------------------+
                                  |        WhatsApp Cloud API /           |
                                  |     In-App WhatsApp Simulator         |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |     Next.js Webhook Controller        |
                                  |    (/api/webhooks/whatsapp/route.ts)  |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |    Conversational Bot State Machine    |
                                  |   (RSVP, Check-In, Session Logging)   |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |        Prisma ORM & SQLite DB         |
                                  |  (Centers, Volunteers, Sessions, etc) |
                                  +---------------------------------------+
                                                      |
               +--------------------------------------+--------------------------------------+
               |                                                                             |
               v                                                                             v
+---------------------------------------------+                               +---------------------------------------------+
|        Coordinator Console Engine           |                               |      Chapter Leader Analytics Dashboard     |
|   (Roster Management & Holiday Pauses)      |                               |      (Retention Watchlist & AI Copilot)     |
+---------------------------------------------+                               +---------------------------------------------+
```

---

## Core System Pillars

### 1. WhatsApp Conversational Automation Engine
- **Automated Friday RSVP Loop:** Proactively dispatches interactive button pings (`[ Attending ]`, `[ Request Absence ]`, `[ Standby Backup ]`) to rostered volunteers.
- **Field Check-In System:** Verifies physical arrival on Saturday afternoons and auto-calculates logged volunteer contribution hours.
- **Conversational Session Logging:** Captures session topics and student observations directly from WhatsApp message payloads.
- **Coordinator Text Commands:** Allows coordinators to query center status by sending `/status` directly to the bot.
- **In-App Web Simulator:** Integrated smartphone mockup for instant browser-based workflow validation.

### 2. Center Coordinator Console
- **Holiday Exception Controls:** One-click toggle (`isPausedForHoliday`) to suspend automated Friday broadcasts during vacation weeks.
- **Roster & Backup Allocation:** Real-time visibility into weekly session staffing ratios with quick backup assignment.
- **Educational Progress Logbook:** Tracks topics taught, group activities, and flags students requiring targeted academic support.

### 3. Chapter Leader Analytics Dashboard
- **Retention Risk Watchlist:** Algorithms automatically flag volunteers missing two or more consecutive sessions to prevent churn.
- **Chapter-Wide Metrics:** Real-time aggregation of active volunteers, total verified hours, student reach, and session completion rates.
- **AI Impact Copilot:** Synthesizes field logs into structured donor grant summaries.

---

## API Reference & Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/dashboard` | `GET` | Aggregates chapter-wide KPIs, active rosters, center capacities, and retention risk list. |
| `/api/centers` | `GET`, `POST`, `PATCH` | Manages center profiles, target volunteer/student ratios, and holiday pause states. |
| `/api/volunteers` | `GET`, `POST`, `PATCH` | Handles volunteer onboarding, skill tagging, status updates, and center assignments. |
| `/api/sessions` | `GET`, `POST`, `PATCH` | Creates upcoming weekend sessions, populates rosters, and updates post-session logs. |
| `/api/attendance` | `PATCH` | Updates volunteer RSVP statuses, check-in timestamps, verified hours, and student records. |
| `/api/webhooks/whatsapp` | `GET`, `POST` | Meta WhatsApp Cloud API verification challenge and conversational message handler. |
| `/api/whatsapp/send` | `POST` | Outbound WhatsApp broadcast dispatcher respecting holiday pause controls. |
| `/api/ai-summary` | `POST` | AI-assisted executive impact report generator for donor communications. |

---

## Data Model (Prisma Schema)

The core relational database model comprises eight primary entities:

- **Organization:** Root NGO entity (e.g., U&I Trust).
- **City:** Geographic cluster (e.g., Bangalore, Chennai).
- **Center:** Individual operational unit with assigned day, slot time, and targets (e.g., Vihana Center).
- **Volunteer:** User profile containing role (`CHAPTER_LEADER`, `COORDINATOR`, `VOLUNTEER`), status (`ACTIVE`, `AT_RISK`), skills, and total verified hours.
- **Student:** Student record assigned to a center with grade level.
- **Session:** Scheduled weekend instance tracking topics, activities, challenges, and completion status.
- **VolunteerAttendance:** Join model tracking individual RSVP status, check-in status, bot state, and logged hours.
- **StudentAttendance:** Tracked student presence and learning needs per session.

---

## Local Setup & Installation

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/cashwin1203/volunteer-os.git
   cd volunteer-os
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Initialize and seed the database:**
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   Navigate to `http://localhost:3000` in your browser.
