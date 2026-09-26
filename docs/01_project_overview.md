# 01. Project Overview & Architecture

## Core Objective
Build a complete production-ready full-stack e-commerce website for **SWECHA Studio**.
This is a real, functional, database-driven e-commerce application. The visual UI must exactly mirror the previously developed "Testing Site" (elegant, light theme, premium, minimal, luxury-oriented, mobile-first swipeable galleries).

## Tech Stack (Modern SPA Architecture)
As discussed and approved, this project will utilize the **Laravel + Inertia.js + React** stack to ensure extreme performance ("super fast, zero latency, app-like feel") without needing expensive Node.js hosting.

### Backend
- Laravel (PHP 8.2+)
- MySQL
- Laravel Eloquent ORM
- Laravel validations, migrations, auth, and policies

### Frontend
- **Inertia.js** bridging Laravel and React.
- **React.js** for frontend components to achieve zero-reload SPA speeds.
- Tailwind CSS (using exact variables from the Testing Site).
- No hardcoded styles; use centralized CSS/Tailwind variables.

### Key Tenets
- **Production-Ready & Secure**: Implement CSRF, XSS protection, rate limiting, and server-side payment verification.
- **No Fake Functionality**: Everything must be connected to the database. No fake UI-only buttons.
- **Maintainable & Modular**: Use Service classes (`CartService`, `OrderService`) instead of giant controllers.

## Core Flow Architecture
The complete system is ONE connected commerce system:
**Customer Frontend** → Products → Cart → Checkout → Payment → Order → Shipping → Delivery → Complaint
**Admin Dashboard** → manages the exact same underlying data.
