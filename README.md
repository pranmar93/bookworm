# BookWorm — Full-Stack Online Bookstore

A complete e-commerce bookstore application built with **React + Tailwind CSS** (frontend) and **Node.js/Express + PostgreSQL** (backend).

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v14+

### 1. Database Setup

```bash
# Create the PostgreSQL database
createdb bookstore

# OR via psql
psql -U postgres -c "CREATE DATABASE bookstore;"
```

### 2. Backend Setup

```bash
cd backend

# Copy environment config
cp .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL connection string

# Install dependencies
npm install

# Run migrations (creates all tables)
npm run migrate

# Seed with sample data (50+ books, 10+ authors, test users)
npm run seed

# Start development server (http://localhost:5000)
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Copy environment config
cp .env.example .env

# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev
```

---

## 📖 API Documentation

Once the backend is running, visit: **http://localhost:5000/api-docs**

Interactive Swagger UI with all 40+ endpoints documented.

---

## 🔑 Test Accounts

After running `npm run seed` in the backend:

| Email | Password |
|-------|----------|
| alice@example.com | password123 |
| bob@example.com | password123 |
| carol@example.com | password123 |

---

## 📁 Project Structure

```
bookstore/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── db.js           # PostgreSQL pool
│   │   │   ├── migrate.js      # Schema migrations
│   │   │   └── seed.js         # Sample data seeder
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.js         # Register/Login/Guest
│   │   │   ├── books.js        # Books catalog + search
│   │   │   ├── categories.js   # Category browsing
│   │   │   ├── authors.js      # Author profiles
│   │   │   ├── cart.js         # Cart management
│   │   │   ├── orders.js       # Order lifecycle
│   │   │   ├── payments.js     # Mock payment gateway
│   │   │   ├── reviews.js      # Book reviews
│   │   │   ├── users.js        # Profile/Wishlist
│   │   │   ├── addresses.js    # Delivery addresses
│   │   │   └── recommendations.js
│   │   └── index.js            # Express app entry
│   ├── openapi.yaml            # OpenAPI 3.0 spec
│   └── package.json
│
└── frontend/
    └── src/
        ├── components/
        │   ├── common/         # Button, Input, Card, Modal, Loader, Header, Footer
        │   ├── auth/           # LoginForm, RegisterForm
        │   ├── catalog/        # BookCard, BookGrid, CategorySidebar, SearchBar
        │   └── checkout/       # AddressForm, PaymentForm, OrderSummary, OrderConfirmation
        ├── pages/              # HomePage, CatalogPage, BookDetailsPage, CartPage,
        │                       # CheckoutPage, OrderHistoryPage, WishlistPage, ProfilePage
        ├── context/            # AuthContext, CartContext
        ├── hooks/              # useAuth, useCart, useBooks, useOrders
        ├── services/           # api.js + 6 service modules
        └── utils/              # formatCurrency, formatDate, validation
```

---

## ✨ Features

| Feature | Status |
|---------|--------|
| User registration & login (JWT) | ✅ |
| Guest checkout | ✅ |
| Browse books by category | ✅ |
| Search by title/author | ✅ |
| Book details with reviews & related reads | ✅ |
| Shopping cart with quantity management | ✅ |
| Delivery address management | ✅ |
| Multi-step checkout flow | ✅ |
| Mock payment gateway (credit card, UPI, wallet) | ✅ |
| Order confirmation with dark modal | ✅ |
| Order history with Buy Again | ✅ |
| Cancel order within 48 hours | ✅ |
| Wishlist management | ✅ |
| Gift points earning & redemption | ✅ |
| Personalized recommendations | ✅ |
| Responsive design (mobile/tablet/desktop) | ✅ |
| API documentation (Swagger UI) | ✅ |
| Database indexing & performance | ✅ |

---

## 🛡️ Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with configurable expiry
- Parameterized SQL queries (no SQL injection)
- Helmet.js security headers
- CORS configured per environment
- Rate limiting (200 req/15min)
- PCI DSS compliant (only last 4 card digits stored)

---

## 🗄️ Database Schema

12 tables: `users`, `categories`, `authors`, `books`, `addresses`, `orders`, `order_items`, `cart`, `cart_items`, `payments`, `reviews`, `wishlist`, `related_products`

See [`backend/src/database/migrate.js`](backend/src/database/migrate.js) for the full schema.

---

## 💡 Development Notes

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:5173` and proxies `/api` to the backend
- Mock payment: call `POST /payments/initiate` then `POST /payments/confirm`
- Gift points: 1 point per ₹50 spent, redeemable at checkout (max 10% of subtotal)
- Free delivery on orders over ₹500
