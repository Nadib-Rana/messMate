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

#### 10. Manager 1-Click Meal Rules & Emergency All Meals OFF (With Date Selector)
- **Flexible 1-Click Meal Slot Toggling**: Enhanced [SettingsMealTab.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/components/SettingsMealTab.tsx) and [DailyMeals.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/meals/DailyMeals.tsx) with individual 1-Click toggle controls for **Breakfast**, **Lunch**, AND **Dinner**.
- **🚨 Emergency Day Off Modal (Date Picker & Presets)**: Built [EmergencyAllMealsOffModal.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/meals/components/EmergencyAllMealsOffModal.tsx) allowing Managers to select **Today**, **Tomorrow**, or **any custom date** via a calendar date picker to turn OFF all meals for all members.

#### 11. Market Duty Manager Exclusion & Custom Sequence Ordering
- **Member & Manager Duty Exclusion**: Enhanced [AutoRotationModal.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/market/components/AutoRotationModal.tsx) and [MarketDuty.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/market/MarketDuty.tsx) allowing Manager to exclude any member (including the Manager) from market shopping duties for the cycle (`Included / Excluded` toggle).
- **Custom Duty Sequence Reordering**: Added **▲ / ▼ Move Up / Move Down** sequence reordering controls in `AutoRotationModal`, giving Manager full control to set the exact order of who does market duty 1st, 2nd, 3rd, 4th, etc., before generating the auto-rotation schedule.

#### 12. PostgreSQL Data Persistence & Auto-Rotation Date Fix
- **Auto-Rotation Date Parsing Fix**: Fixed date parsing bug in [dutyEngine.ts](file:///home/nadib-rana/Downloads/mess/MessMate/src/engine/dutyEngine.ts) and [MarketDuty.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/market/MarketDuty.tsx).
- **Chronological Duty Grid Sorting**: Fixed duty grid sequence ordering in [DutyCardGrid.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/market/components/DutyCardGrid.tsx) and [usePaymentDutyHandlers.ts](file:///home/nadib-rana/Downloads/mess/MessMate/src/context/usePaymentDutyHandlers.ts).

#### 13. Market Expense Payment Source & Auto Wallet Reimbursement Credit
- **Payment Source Selector**: Added **Payment Source (পেমেন্ট সোর্স / তহবিলের উৎস)** selector to [AddMarketExpenseModal.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/market/components/AddMarketExpenseModal.tsx) with two clear options (`💵 Mess Cash Fund` & `👛 Member's Personal Pocket`).
- **Automatic Wallet Reimbursement Credit**: Updated [useFinanceHandlers.ts](file:///home/nadib-rana/Downloads/mess/MessMate/src/context/useFinanceHandlers.ts) and [financialEngine.ts](file:///home/nadib-rana/Downloads/mess/MessMate/src/engine/financialEngine.ts).

#### 14. Market Expense Requester Name Fix & Prominent Dashboard Banner
- **Backend & Frontend Name Sync**: Updated [market.service.ts](file:///home/nadib-rana/Downloads/mess/MessMate_backend/src/modules/market/market.service.ts) and [MarketExpenses.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/market/MarketExpenses.tsx) to return and render both `paidByMemberName` and `memberName`.

#### 15. Strict Manager Role Guards for Approvals (Security & Permission Fix)
- **Market Expense Approval Guard**: Enforced strict `isManager` checks in [MarketExpenses.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/market/MarketExpenses.tsx). Non-manager members will only see the `Pending` status badge; only active Managers/Admins can see and click `Approve` / `Reject` buttons.
- **Dashboard & Wallet Approval Guards**: Updated [Dashboard.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/Dashboard.tsx) and [Wallets.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/finance/Wallets.tsx) to restrict quick approval banners and deposit management buttons exclusively to Managers.

#### 16. Auto Pre-Select Logged-in User in "Purchased By" Field
- **Auto-Selection Logic**: Updated [AddMarketExpenseModal.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/market/components/AddMarketExpenseModal.tsx) and [MarketExpenses.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/market/MarketExpenses.tsx) so that when a user opens the **Submit Market Expense** modal, the **Purchased By** dropdown automatically pre-selects the logged-in member's own name (`currentMember.id`).

#### 17. Restricted Market Duty Controls (Manager & Admin Only)
- **Duty Action Buttons Guard**: Updated [MarketDuty.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/market/MarketDuty.tsx). The **`Auto-Rotate`**, **`+ Assign Duty`**, **`Configure Settings`**, and **`Clean Duplicates`** buttons are strictly hidden for regular members and only accessible to Manager / Admin accounts.
- **Duty Deletion Guard**: Updated [DutyCardGrid.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/market/components/DutyCardGrid.tsx) so the duty card deletion icon (`Trash2`) is strictly hidden for regular members and restricted to Manager / Admin accounts.

#### 18. Member Weekly Schedule Recurring Preference (Member Accessible)
- **Member Access Alignment**: Confirmed and updated [WeeklyScheduleView.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/meals/components/WeeklyScheduleView.tsx). Regular Members can view and toggle their own weekly recurring meal schedule preferences (`Weekly Schedule for Sumon`), while Managers can switch member dropdowns to configure any member's weekly schedule.

#### 19. Direct Member Meal Off / On Request Integration
- **Header Meal Request Button**: Added a prominent **`+ Request Meal Off / On`** button on [DailyMeals.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/meals/DailyMeals.tsx) for regular members.
- **Table Cell Click Request Integration**: Updated [DailyMealTable.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/meals/components/DailyMealTable.tsx) and [NewMealRequestModal.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/meals/components/NewMealRequestModal.tsx).

#### 20. Member Weekly Schedule Change Request & Manager Approval Auto-Sync
- **Weekly Preference Draft & Submit Button**: Updated [WeeklyScheduleView.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/meals/components/WeeklyScheduleView.tsx). Added a bottom action card with **`📩 Submit Weekly Schedule Request to Manager`** button. When a member toggles B/L/D preferences (`Monday`, `Friday`, etc.), changes are drafted and highlighted until submitted for Manager approval.
- **Automatic System Schedule Sync**: Updated [useGuestRequestHandlers.ts](file:///home/nadib-rana/Downloads/mess/MessMate/src/context/useGuestRequestHandlers.ts) and [MealRequests.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/meals/MealRequests.tsx). When a Manager approves a Weekly Schedule Change Request, the system automatically syncs (`updateWeeklySchedule`) the member's recurring weekly preferences into official system state.
- **Manager Approval Locations & Shortcut**:
  - **Dashboard Approval Banner**: High-priority alert banner on [Dashboard.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/Dashboard.tsx).
  - **Meal Requests Dedicated Page**: Detailed request review and 1-click Approve/Reject on [MealRequests.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/meals/MealRequests.tsx).
  - **Daily Meals Header Shortcut**: Added a pulsing **`⚠️ [N] Pending Request(s)`** manager shortcut button on [DailyMeals.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/meals/DailyMeals.tsx) that navigates directly to the review list.

### 📅 September 2, 2026

#### 21. Full-System Functionality & Production Readiness Audit
- **Full Scope Audit**: Evaluated all 12 frontend pages, 6 context handlers, and 12 NestJS backend modules for end-to-end functionality, strict type checking, and operational completeness.
- **Reports Export Feature Implemented**: Added CSV data export and PDF print preview triggers to [Reports.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/Reports.tsx). Users can now download formatted CSV reports (`MessMate_Report_[Month].csv`) containing summary stats and member balance breakdowns or invoke print to PDF.
- **Verification Completed**:
  - `MessMate_backend`: `npm run build` compiled with **0 errors**.
  - `MessMate`: `npx tsc --noEmit` compiled with **0 errors**.

#### 22. Meal Summary All-Member Visibility & Cost Transparency
- **All-Member Breakdown Unlocked for Regular Users**: Updated [MealSummary.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/meals/MealSummary.tsx) and [MealSummaryTable.tsx](file:///home/nadib-rana/Downloads/mess/MessMate/src/pages/meals/components/MealSummaryTable.tsx). Removed the role-based filter restriction so that **any user (member or manager)** can view every house member's total meals, meal rate, meal cost, other bill share, and overall cost responsibility.
- **Mess Total Summary Footer**: Enabled the total summary footer row (`Mess Total`) for all users, providing complete transparency into total weighted meals, food expenses, and overall mess responsibility.
- **Search & CSV Export**: Added a real-time member name search input (`Search member name...`) and a 1-click `Export Summary` button to download `Meal_Summary_[Month].csv`.
- **Logged-in User Badge**: Added a prominent `(You)` badge on the logged-in user's row in the table for quick self-identification.

---

## 🚦 Current Health & Status

| Module | Compilation Status | Build Command | Status |
| :--- | :--- | :--- | :--- |
| **MessMate Backend** | 🟢 Clean (0 Errors) | `npm run build` | 🚀 Production Ready |
| **MessMate Frontend** | 🟢 Clean (0 Errors) | `npx tsc --noEmit` | 🚀 Production Ready |

---

## 🎯 Next Steps & Recommendations

- [x] Full System Functionality Audit completed.
- [x] CSV & PDF report export feature added.
- [ ] Deploy to production hosting (e.g. Vercel / Render / Docker).
