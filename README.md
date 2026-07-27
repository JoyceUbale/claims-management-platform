<div align="center">

# ClaimFlow — Health Insurance Claims Management Platform

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**A modern, full-stack claims processing platform featuring dual-role portals for Patients and Insurers with real-time database synchronization.**

</div>

---

## 📌 Project Overview

**ClaimFlow** streamlines the health insurance claim submission and review workflow. Designed with a startup-grade UI inspired by platforms like Linear and Vercel, it connects patients and insurance adjusters through dedicated role-based portals.

* **Patient Portal**: Submit claim requests with attachments, monitor live status updates, and track individual claim histories.
* **Insurer Portal**: Evaluate incoming claims, perform dynamic filtering and sorting, approve or reject claims with custom comments and adjust approved amounts.

---

## 🏗️ Architecture & Project Structure

claimflow/
├── server/                    # Node.js + Express Backend API
│   ├── config/                # Database connection (MongoDB / Mongoose)
│   ├── models/                # Claim schema & Mongoose models
│   ├── routes/                # Express API routes (/api/claims)
│   ├── package.json
│   └── server.js / index.js   # Server entry point
│
├── src/                       # React + TypeScript Frontend
│   ├── components/            # UI components (Patient & Insurer views)
│   │   ├── patient/           # PatientDashboard, SubmitClaim
│   │   ├── insurer/           # InsurerDashboard, ClaimsTable
│   │   └── Header.tsx         # Responsive header & role switcher
│   ├── context/               # AuthContext (Role management)
│   ├── hooks/                 # Custom hooks (useClaims with Context API)
│   ├── types/                 # TypeScript interfaces
│   ├── App.tsx                # Main application wrapper
│   └── main.tsx               # Application entry point
│
├── public/                    # Static assets
└── package.json               # Frontend dependencies & scripts

---

## ✨ Features

### 🧑 Patient Portal
* **📊 Live Dashboard**: Metrics summary cards showing Total, Pending, Approved, and Rejected claims.
* **📝 Claim Submission**: User-friendly form with inline validation, document links, and monetary input handling.
* **⚡ Real-Time Sync**: Instant dashboard updates upon new claim submission without page refreshes.

### 🏥 Insurer Portal
* **📈 Analytics Dashboard**: Total review queue overview and aggregate statistics.
* **🔍 Claims Management**: Filter claims by status (Pending/Approved/Rejected) and sort by date or amount.
* **✅ Review Workflow**: Approve or reject claims with structured comments and custom approved settlement values.

### 🛡️ Platform Highlights
* **Shared Context Architecture**: Global state powered by React Context prevents data desynchronization across tabs.
* **Dual Persistence**: Direct integration with MongoDB Atlas/Local DB with fallback local persistence.
* **Responsive Layout**: Designed for mobile, tablet, and desktop screens.

---

## 🛠️ Tech Stack

### Frontend
| Library | Purpose |
| :--- | :--- |
| **React 18** | UI Library |
| **TypeScript** | Type safety and interfaces |
| **Vite** | Fast frontend bundler |
| **Tailwind CSS** | Styling and responsive design |
| **Lucide React** | Modern vector icon set |

### Backend
| Library | Purpose |
| :--- | :--- |
| **Node.js & Express** | RESTful API server |
| **MongoDB & Mongoose** | Database and ODM modeling |
| **CORS / dotenv** | Cross-origin resource sharing & configuration |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher
* **MongoDB**: Local MongoDB instance running on port `27017` or MongoDB Atlas URI

---

### 1. Backend Setup

```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

#Start server
npm run dev
```

###  2. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
# Frontend will run on http://localhost:5173
```
### 3. [LIVE DEMO](https://claims-management-platform-two.vercel.app)

### 🔮 Future Improvements

[ ] Automated OCR receipt scanning for invoice data extraction

[ ] Role-based JWT authentication and password login

[ ] Email notifications for patient updates upon review completion

[ ] PDF summary report generation for approved claims
