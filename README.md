# PFM Tool - Personal Finance Management Dashboard

A Privacy-First, Local-First Personal Finance Management (PFM) application developed as part of a Level 6 Computing Dissertation at Southampton Solent University. The tool addresses the "Budgeting Trap" (the psychological tendency to view a remaining balance as a "license to spend") by reframing static balances into dynamic behavioural nudges.

This application was evaluated in a usability survey and received a System Usability Scale (SUS) score of 85 (Grade A).

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-6.0.0-646CFF?style=flat&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?style=flat&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-2.99.2-3ECF8E?style=flat&logo=supabase)

## Key Features

### Core Functionality
- **Multi-Account Management** — Track multiple bank accounts, credit cards, and investment accounts
- **Budget Tracking** — Create and monitor budgets with category-based spending limits
- **Savings Goals** — Set financial goals with progress tracking and automated savings
- **Transaction Management** — Import transactions via CSV/Excel or add manually
- **Transfer Funds** — Move money between accounts with full transaction history

### Dashboard & Analytics
- **Financial Overview** — Real-time summary of net worth, income, and expenses
- **Insights & Analytics** — Visual charts and trends using Recharts
- **Spending Analysis** — Category breakdown with pie charts and trend lines
- **Streak Widget** — Stay motivated with daily engagement tracking

### User Experience
- **Learning Hub** — In-app financial education articles and tips
- **Contextual Tips** — Smart, context-aware financial advice
- **Notification System** — Budget alerts, goal milestones, and account updates
- **Profile & Settings** — Customize your experience and manage privacy

### Technical Highlights
- **Hybrid Storage** — Supabase (cloud) + Dexie/IndexedDB (local) for offline capability
- **Authentication** — Secure email-based auth via Supabase
- **State Management** — Zustand for lightweight, performant state
- **Responsive Design** — Mobile-first Tailwind CSS design

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, React Router 7 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 3.4 |
| State | Zustand 5 |
| Charts | Recharts 3 |
| Icons | Lucide React |
| Backend | Supabase (Auth + PostgreSQL) |
| Local DB | Dexie 4 (IndexedDB) |
| Data Import | PapaParse, read-excel-file |
| Image Export | html-to-image |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/coreymaltby/pfm-tool-dissertation.git
cd pfm-tool-dissertation

# Install dependencies
npm install

# Set up environment variables
# Create a .env file with your Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Development

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
pfm-tool-dissertation/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── addAccountForm.jsx
│   │   ├── addBudgetForm.jsx
│   │   ├── addGoalForm.jsx
│   │   ├── CSVUploadForm.jsx
│   │   ├── DashboardSidebar.jsx
│   │   ├── Navbar.jsx
│   │   └── ...
│   ├── constants/         # Static data (articles, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and clients
│   │   ├── db.js          # Dexie database config
│   │   └── supabaseClient.js
│   ├── pages/             # Route pages
│   │   ├── DashboardOverview.jsx
│   │   ├── DashboardAccounts.jsx
│   │   ├── DashboardBudgets.jsx
│   │   ├── DashboardInsights.jsx
│   │   ├── DashboardSavings.jsx
│   │   ├── DashboardTransactions.jsx
│   │   └── ...
│   ├── services/          # Business logic
│   │   └── dataService.js
│   ├── store/             # Zustand stores
│   │   └── useSettingsStore.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── eslint.config.js
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## License

MIT License — feel free to use this project for learning or personal projects.

---
