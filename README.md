# 🌱 Smart Mandi Procurement System

A comprehensive, multi-role Progressive Web Application (PWA) designed to digitize, streamline, and optimize agricultural procurement at Mandi centres. 

This prototype was built to demonstrate a full end-to-end ecosystem that solves the real-world problems of congestion, offline accessibility, and operational opacity in agricultural procurement.

---

## 🌟 Key Features

### 1. 📱 Multi-Role Ecosystem
The application serves 5 distinct personas through a single, unified architecture:
- **Farmer App (PWA & Offline SMS):** Book slots, view live queue status, and track procurement journey. Features multi-language support (English/Hindi) and an offline SMS chatbot simulator.
- **Gate Guard App:** Real-time QR and Token validation for entry management. Validates arrival times against booked slots.
- **Centre Manager Dashboard:** A command centre to call the next farmer in the queue, manage active counters, and monitor real-time congestion and load balancing.
- **Quality Lab & Weighbridge:** Digital entry of gross/tare weight with automatic net weight calculation. Quality grading parameters (Moisture, Foreign Matter).
- **Public Display TV:** A high-contrast digital signage UI meant for large monitors at the Mandi, displaying real-time Token status, counter assignments, and announcements.

### 2. ⚡ Real-Time Architecture
- **Supabase Realtime:** Uses PostgreSQL combined with Supabase Realtime WebSockets to ensure that actions taken by one role (e.g., Gate Guard scanning a token) instantly update the UI for all other roles (e.g., Public Display and Centre Manager) without page reloads.
- **Optimistic UI:** State management is handled globally via Zustand with persistent local storage, providing instant visual feedback while database syncing happens asynchronously in the background.

### 3. 📡 Offline & Feature-Phone Accessibility
- **SMS Sandbox Simulator:** An interactive state-machine bot simulating Twilio/USSD integration. Farmers without internet access can text `BOOK WHEAT 50` or `STATUS WHE-C01-123` to book slots and check live queue ETA directly from a basic feature phone.

### 4. 🧠 Intelligent Load Balancing
- The queue system dynamically calculates Estimated Wait Time (ETA) based on the number of `ACTIVE` counters at a centre.
- When the Centre Manager clicks "Call Next", the system automatically routes the farmer to an available active counter and flashes the assignment on the Public Display.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** Zustand (with persist middleware)
- **Database & Realtime:** Supabase (PostgreSQL)
- **Icons:** Lucide React

---

## 🚀 Local Setup & Installation

### Prerequisites
1. Node.js (v18+)
2. A Supabase account / Local Supabase CLI

### 1. Clone & Install
```bash
git clone <repository-url>
cd "SIH Project"
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
*(Note: Ensure your Supabase project has the correct schema initialized via the SQL migration scripts).*

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. 

### 4. Testing the Ecosystem
- Use the **Role Switcher** in the bottom right corner to seamlessly switch between the Farmer, Centre Manager, Gate Guard, Quality Lab, and Public Display views.
- **Network Testing:** To test across multiple devices on the same Wi-Fi network, the `next.config.ts` includes a proxy rewrite to bypass mobile CORS/Firewall restrictions when accessing Supabase.

---

## 📂 Project Structure Overview

- `/src/app`: Next.js App Router (Main Entry `page.tsx`)
- `/src/components`:
  - `/farmer`: SMS Simulator, Profile, Dashboard, Booking Flow
  - `/centre`: Centre Manager Load Balancing Dashboard
  - `/guard`: Token QR Scanner & Entry Validation
  - `/quality`: Weighbridge and QC data entry
  - `/public`: Digital Signage Display TV
- `/src/store/index.ts`: Global Zustand state & Supabase Realtime listeners
- `/src/types/index.ts`: Core TypeScript interfaces (Tokens, Queue, Bookings)
- `/src/app/api/whatsapp`: Backend Webhook ready for live Twilio API integration

---
*Built for SIH 2024* 🚀
