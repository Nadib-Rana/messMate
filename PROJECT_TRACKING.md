# 📋 MessMate Project Tracking & Work Log

This document maintains a continuous record of features, architecture updates, bug fixes, and tasks completed in the **MessMate** repository.

---

## 🏗️ Project Overview

**MessMate** is a full-stack mess/hostel management web application designed to automate meal calculations, bazar expense management, member utility bills, and monthly financial settlements.

### Repository Structure
- **`MessMate/`**: Frontend web application built with **React**, **Vite**, **TypeScript**, and **TailwindCSS**.
- **`MessMate_backend/`**: Backend API service built with **NestJS**, **Prisma ORM**, and **PostgreSQL**.

---

## 🛠️ Key Modules & Capabilities

1. **Authentication & Roles**: Multi-role system (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `MEMBER`) with OTP verification, JWT access tokens, and refresh tokens.
2. **Meal Management**:
   - Daily meal tracking (Breakfast, Lunch, Dinner with configurable weights).
   - Meal stop requests with approval workflow.
   - Guest meal tracking with auto cost estimation based on active meal rates.
3. **Market & Expenses**:
   - Market duty rotation and scheduling.
   - Bazar expense submissions with item breakdowns and receipt uploads.
   - Utility bill tracking (Electricity, Rent, Gas, Water, Internet, Maid salary).
4. **Finance & Settlement Engine**:
   - Member wallets and payment approvals.
   - Automated monthly closing snapshot & meal rate calculation.
   - Individual member financial breakdown (responsibility, payments, net balance).

---

## 📝 Recent Activity & Change Log

### 📅 September 1, 2026

#### 1. GitHub Code Synchronization
- Pulled latest updates from `origin/main` branch (94 files changed, +4,550 / -4,202 lines).
- Updated context hooks, modularized UI components, refactored NestJS services, and updated Prisma schema.

#### 2. Backend Fixes (`MessMate_backend`)
- **Prisma Client Regeneration**: Executed `npx prisma generate` to align the generated Prisma Client types with the updated schema (`schema.prisma`).
- **Resolved Compilation Errors**: Fixed `TS2339` and `TS2353` errors in `src/modules/meals/meals_requests.service.ts` where `breakfast`, `lunch`, and `dinner` properties were missing on generated types.
- **Backend Build Verification**: Confirmed `npx tsc --noEmit` and `npm run build` pass with **0 errors**.

#### 3. Frontend Fixes (`MessMate`)
- **Type Definitions Update**: Updated `HouseExpense`, `Fine`, `MemberSettlement`, and `NotificationItem` in `src/types/finance.ts` and `src/types/index.ts` to support optional status fields (`"applied"`, `"cancelled"`, `"settled"`), reading metrics, and timestamp fields.
- **Import Path Fix**: Corrected relative import path for `MarketItem` in `src/pages/market/components/AddMarketExpenseModal.tsx`.
- **Frontend Build Verification**: Confirmed `npx tsc --noEmit` passes with **0 errors**.

#### 4. User Profile Update Feature Implementation
- **Backend APIs Integration**: Connected `PATCH /api/v1/users/profile` and `POST /api/v1/auth/change-password` endpoints in `src/services/api.ts`.
- **Global Context Integration**: Added `updateUserProfile` and `changePassword` handler functions to `AppContext` and `AppContextType`.
- **Profile UI Component (`ProfileModal.tsx`)**: Built a tabbed profile editing modal allowing users to edit First Name, Last Name, Phone Number, Avatar URL, and change account passwords with validation and feedback alerts.
- **Header & Sidebar Triggers**: Added clickable user avatar button in `Header.tsx` and "My Profile" item in `Sidebar.tsx` to open `ProfileModal`.
- **Settings Page Tab**: Added "My Profile" tab to `Settings.tsx` allowing in-page profile editing and security credential updates.

#### 5. Real-Time Terminal HTTP Request & User Tracking Logging
- **Global Logging Interceptor**: Registered `LoggingInterceptor` globally in `main.ts`.
- **Rich Output Formatting**: Terminal now logs incoming API requests with timestamp, HTTP method, route, request payload keys/query params, HTTP status code, execution duration, user identity (email/username), and client IP address.

#### 6. Database Seeding & Real Member Data Sync
- **PostgreSQL Database Seed**: Executed `npx prisma db push --force-reset` and `npm run db:seed` to reset database tables and seed "Bashundhara Mess" (Invite Code `HM-7777`) along with 7 active users/members (Nadib Rana, Sumon, Monna, Foysan, Azijul, Shohan, Showhan).
- **Service & Controller UUID Validation**: Refactored `findMyHouses` in `houses.service.ts` to perform strict UUID checks, preventing Prisma P2023 `Invalid UUID` exceptions.
- **Frontend AppDataSync Fix**: Fixed `useAppDataSync.ts` to extract `activeHouseId` and load all 7 members (`setMembers(matchedHouse.members)`) immediately into React `AppContext`, while guarding against invalid empty house ID calls (`/houses//...`).

#### 8. Prisma P2023 Invalid UUID Error Diagnosis & Fix
- **Root Cause Identified**: The backend was previously passing non-UUID demo string `"demo-user-id"` to `prisma.house.findMany({ where: { members: { some: { userId } } } })`. Position 3 in `"demo-user-id"` is `'m'`, which is an invalid hex character for a PostgreSQL `@db.Uuid` column, causing Prisma Rust query engine to reject the invocation with error code `P2023` (`found 'm' at 3`).
- **Strict UUID Pre-validation**: Updated `houses.service.ts`, `finance.service.ts`, `meals_requests.service.ts`, and `market.service.ts` to strictly validate `userId`, `houseId`, `memberId`, and entity IDs with a regex UUID check (`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`) prior to issuing Prisma query invocations, and to resolve house IDs safely using `resolveHouseId`.
- **Stale `dist/` Artifact Cleanup**: Removed stale pre-compiled build artifacts inside `MessMate_backend/dist/src/modules/houses/houses.controller.js` that were being loaded by NestJS watcher. Added a `"prebuild"` script (`node -e "fs.rmSync('dist', { recursive: true, force: true })"`) to [package.json](file:///home/nadib-rana/Downloads/mess/MessMate_backend/package.json).
- **Verified**: Confirmed `npm run dev` now starts cleanly and `GET /api/v1/houses/my-houses` returns `200 OK` with full house and member data.

#### 9. Dashboard Financial & Deposit Summary Enhancement
- **Calculated Total Member Deposits**: Added calculation for `totalCollected` (sum of all approved member wallet deposits across all 7 members).
- **Live Cash Flow Indicators**: Enhanced [Dashboard.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/Dashboard.tsx) with prominent StatCards and a "Current Month Financials" live card displaying:
  - **Total Deposited** (মোট জমা টাকা)
  - **Total Food & Utility Expense** (মোট খরচ)
  - **Remaining Cash in Hand / Mess Balance** (অবশিষ্ট ব্যালেন্স/ক্যাশ, Surplus/Deficit badge).

---

## 🚦 Current Health & Status

| Module | Compilation Status | Build Command | Status |
| :--- | :--- | :--- | :--- |
| **MessMate Backend** | 🟢 Clean (0 Errors) | `npm run build` | Ready |
| **MessMate Frontend** | 🟢 Clean (0 Errors) | `npx tsc --noEmit` | Ready |

---

## 🎯 Next Steps & Recommendations

- [ ] Run end-to-end testing with PostgreSQL database connected (`npm run dev` in both frontend & backend).
- [ ] Verify API endpoints for meal stop requests and market expense approvals.
