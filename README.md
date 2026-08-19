# SpendWise Full System

A complete browser-based personal finance tracker and installable PWA.

## Included
- Income and expense tracking
- Monthly dashboard
- Budget and category limits
- Wants/unnecessary spending
- Recurring expenses and income
- Savings goals
- Six-month spending comparison
- Financial health score
- Action plan and cutting recommendations
- Search and deletion
- Full JSON backup/restore
- PWA installation for Android/iPhone
- Offline app shell

## Publish
Upload all files to an HTTPS host such as GitHub Pages. Then open the website on your phone and choose Install App / Add to Home Screen.

## Data
This version stores data locally in the browser. Backup/Restore is included. Cross-device cloud sync is the next backend layer.


## Authentication

This package includes a polished login/signup interface and a local demo authentication layer so the UI can be tested immediately.

For production, replace the local demo authentication with a real managed authentication provider such as Supabase Auth or Firebase Authentication. The production version should also move transaction data into a per-user cloud database so the same account works on multiple devices.

### Production architecture

Frontend PWA → Auth provider → Per-user database → Expense/budget/goal data.

Do not store production passwords in localStorage. The demo layer is only for UI/testing.


## Supabase connection

This version is connected to the SpendWise Supabase project using the browser-safe publishable key. It uses Supabase Auth and the RLS-protected `transactions` and `budgets` tables.

Before going live:
- Verify email redirect URLs in Supabase Auth URL Configuration.
- Test signup, email confirmation, login, adding/deleting transactions, and budgets.
- Never expose secret/service-role keys.
- Move production secrets/Stripe operations to a server or Edge Function.


## v6 — Spending Analysis Engine
SpendWise now calculates:
- 20% monthly savings guideline from actual income
- Current savings capacity (income minus spending)
- Savings gap
- Category share of income and spending
- Conservative category-specific review opportunities
- Want/unnecessary flags to personalize cut suggestions
- A 50/30/20 starting plan
- A financial-health score and action plan

These are budgeting heuristics, not individualized financial advice.
