# SpendWise — Personal Expense Tracker

SpendWise is a full-stack, responsive Personal Expense Tracker web application built with a modern financial dashboard SaaS aesthetic. It features JWT authentication, comprehensive income and expense tracking, custom category management, interactive financial analytics with Recharts, and MongoDB persistence.

---

## 🚀 Key Features

- **Authentication & Security**
  - Secure user registration and login with bcrypt password hashing (10 salt rounds).
  - Stateless JWT token authorization stored securely with automatic session expiration handling.
  - Strict user-level data isolation (each user can only view, manage, and calculate their own financial data).
  - Profile customization and password change mechanism.

- **Financial Dashboard**
  - 4 Key Summary Cards: Total Balance, Total Income, Total Expenses, and Total Savings (with month-over-month % comparisons).
  - Current Month Spending card comparing current month's expenses against income.
  - Monthly Income vs Expenses bar chart (last 6 months comparison).
  - Expense Breakdown donut chart by category with dynamic color indicators.
  - Recent Transactions table with category icons and quick actions.
  - Quick "Add Transaction" accessible globally from anywhere in the app.

- **Transaction Management**
  - Full CRUD operations: create, read, edit, and delete transactions.
  - Real-time search across title, category, and description.
  - Multi-filtering by transaction type (Income / Expense), custom categories, and custom date ranges.
  - Quick date presets: "This Month", "Last 30 Days", and "All Time".
  - Sorting by date, amount, and title.
  - Pagination controls for high-volume transactions.
  - One-click CSV Export functionality for external accounting or tax reporting.
  - Modal confirmation dialog before deleting transactions to prevent accidental data loss.

- **Categories Management**
  - Default pre-seeded categories for every new user:
    - *Expense:* Food, Shopping, Transportation, Education, Entertainment, Healthcare, Bills, Others.
    - *Income:* Salary, Freelancing, Business, Investments, Gifts, Others.
  - Custom category creation with personalized color picker and icon selection.
  - Safe category deletion: deleting a category automatically reassigns its transactions to "Others" without corrupting transaction history.

- **Analytics & Reporting**
  - Trajectory area chart of monthly expense trends.
  - Month-by-month income vs expense comparative bar chart.
  - Category-wise spending breakdown with visual progress bars.
  - Key financial metrics: Highest Spending Category, Average Monthly Expenses, Average Savings Rate %, and Net Cash Flow.
  - Range toggle for last 6 months vs last 12 months, plus current month vs YTD filters.

- **Responsive Design & UX**
  - Minimal white background with subtle grey cards and borders (`#e2e8f0`).
  - Professional color hierarchy: Green for income, Red for expense, Indigo for primary accents.
  - Collapsible desktop sidebar and mobile-friendly hamburger drawer navigation.
  - Non-blocking toast notifications for success and error messages.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **Charts:** Recharts
- **Icons:** Lucide React
- **HTTP Client:** Axios with JWT request/response interceptors
- **Styling:** Modular CSS variables and utility system

### Backend
- **Runtime:** Node.js
- **Server:** Express.js
- **Database:** MongoDB & Mongoose ODM
- **Authentication:** JSON Web Tokens (jsonwebtoken) & bcryptjs
- **Logging & CORS:** Morgan, CORS, dotenv

---

## 📂 Project Structure

```text
spendwise/
├── client/                     # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components (Modals, Icons, Dialogs)
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # DashboardLayout, Sidebar, Header
│   │   ├── pages/              # Dashboard, Transactions, Analytics, Categories, Settings, Login, Register
│   │   ├── services/           # Axios API services (auth, transactions, categories, dashboard)
│   │   ├── utils/              # Currency formatters, date helpers, CSV export
│   │   ├── App.jsx             # Main Router configuration
│   │   ├── index.css           # Modern design system stylesheet
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend Express REST API
│   ├── config/
│   │   └── db.js               # MongoDB connection with Mongoose
│   ├── controllers/            # Route business logic (auth, transactions, categories, dashboard)
│   ├── middleware/             # JWT auth middleware
│   ├── models/                 # Mongoose schemas (User, Transaction, Category)
│   ├── routes/                 # Express API endpoints
│   ├── utils/                  # Category seeder, default categories
│   ├── server.js               # Express application entry point
│   ├── .env                    # Local environment variables
│   ├── .env.example            # Sample environment variables
│   └── package.json
└── README.md                   # Full documentation
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
Create a file named `.env` in `spendwise/server` with the following keys:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/spendwise
JWT_SECRET=spendwise_super_secure_jwt_secret_key_2026_change_in_production
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or newer recommended, verified on v22)
- MongoDB instance running locally (e.g. `mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

### 1. Backend Setup
```bash
cd spendwise/server
npm install
npm run dev
# The backend will start on http://localhost:5000 and connect to MongoDB
```

### 2. Frontend Setup
```bash
cd spendwise/client
npm install
npm run dev
# The frontend will start on http://localhost:3000 with proxying to backend on port 5000
```

---

## 🔌 API Endpoints Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user, hash password, seed categories |
| POST | `/api/auth/login` | Public | Login with email and password, returns JWT token |
| GET | `/api/auth/me` | Private | Fetch logged-in user profile |
| PUT | `/api/auth/profile` | Private | Update name or currency preference |
| PUT | `/api/auth/change-password` | Private | Update password with current password verification |

### Transactions (`/api/transactions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/transactions` | Private | List transactions with search, type, category, date filters & pagination |
| POST | `/api/transactions` | Private | Create a new transaction |
| GET | `/api/transactions/:id` | Private | Get transaction details by ID |
| PUT | `/api/transactions/:id` | Private | Update transaction by ID |
| DELETE | `/api/transactions/:id` | Private | Delete transaction by ID |

### Dashboard & Analytics (`/api/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Private | Lifetime balance, income, expenses, savings rate & month-over-month comparisons |
| GET | `/api/dashboard/monthly?months=6` | Private | Monthly income and expense aggregation for charts |
| GET | `/api/dashboard/categories?type=expense` | Private | Category spending breakdown with percentages |

### Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/categories?type=expense` | Private | List all user categories (filtered optionally by type) |
| POST | `/api/categories` | Private | Create custom category |
| PUT | `/api/categories/:id` | Private | Update category name, icon, or color |
| DELETE | `/api/categories/:id` | Private | Delete category and safely reassign transactions to 'Others' |

---

## 🔒 Security & Data Isolation
- Passwords are encrypted using salted bcrypt hashing prior to database persistence.
- Queries explicitly enforce `{ userId: req.user._id }` across all endpoints to ensure that one user cannot view, edit, or delete another user's transactions or categories.
- Inputs are sanitized and strictly validated on both frontend and backend.
