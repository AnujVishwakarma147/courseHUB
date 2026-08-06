# CourseHUB

CourseHUB ek full-stack Learning Management System (LMS) hai jahan students online courses explore kar sakte hain, purchase kar sakte hain aur complete kar sakte hain. Saath hi instructors/admins ke paas courses create aur manage karne ke tools hote hain.

Is project mein authentication, role-based access, course management, Stripe payments, media uploads aur progress tracking jaise features include hain.

---

## Live Demo

**Live Application:** Coming soon
**Demo Student Account:** Coming soon
**Demo Admin Account:** Coming soon

> Abhi project production deployment ke phase mein hai.

---

## Screenshots

Deployment ke baad screenshots add kiye jayenge.

<!--
![Home Page](./docs/images/home-page.png)
![Student Dashboard](./docs/images/student-dashboard.png)
![Course Player](./docs/images/course-player.png)
![Admin Dashboard](./docs/images/admin-dashboard.png)
-->

---

## Features

### Student Side

* Google ya GitHub se login
* Email OTP login support
* Available courses browse karna
* Course details dekhna
* Stripe ke through course purchase
* Enrolled courses dashboard mein access
* Lessons watch karna
* Progress track karna
* Jahan se chhoda tha wahan se continue karna
* Course completion certificate download/print karna
* Fully responsive UI

### Admin Side

* Admin dashboard access
* Courses create, update aur delete karna
* Courses publish ya archive karna
* Chapters aur lessons add karna
* Course content reorder karna
* Thumbnails aur videos upload karna
* Course aur enrollment details dekhna
* Saara content ek jagah se manage karna

### Payments

* Stripe Checkout integration
* Secure webhook verification
* Payment ke baad automatic enrollment
* INR aur USD support
* Fake/unauthorized requests se protection

### Security

* Google & GitHub OAuth login
* Email OTP verification
* Role-based access control
* Protected admin routes
* Server-side validation
* Stripe webhook signature check
* Secure environment variables handling
* Request protection (Arcjet)
* File upload validation

---

## Tech Stack

### Frontend

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS
* shadcn/ui
* Base UI
* Lucide Icons
* Recharts
* TipTap Editor
* dnd-kit

### Backend

* Next.js Server Actions
* Route Handlers
* Better Auth
* Prisma ORM
* PostgreSQL
* Zod validation

### Services

* Stripe (Payments)
* Cloudinary (Media storage)
* Resend (Emails)
* Arcjet (Security)
* Google OAuth
* GitHub OAuth

---

## How It Works

### Student Flow

1. User login karta hai (Google / GitHub / OTP)
2. Courses browse karta hai
3. Course select karke payment karta hai
4. Stripe payment complete hota hai
5. Webhook trigger hota hai
6. Enrollment create hota hai
7. Course dashboard mein show hota hai
8. Student lessons complete karta hai aur progress track hota hai

### Admin Flow

1. Admin login karta hai
2. Admin dashboard open karta hai
3. New course create karta hai
4. Chapters aur lessons add karta hai
5. Media upload karta hai
6. Course publish karta hai
7. Course students ke liye available ho jata hai

---

## Project Structure

```text
courseHUB/
├── app/            # Pages, layouts aur API routes
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Auth, DB aur utilities
├── middleware/     # Request middleware
├── prisma/         # Database schema & migrations
├── public/         # Static files
├── proxy.ts
└── package.json
```

---

## Getting Started

### Requirements

* Node.js 20+
* pnpm
* PostgreSQL
* Git

OAuth aur services ke liye accounts:

* Google OAuth
* GitHub OAuth
* Stripe
* Cloudinary
* Resend
* Arcjet

---

### 1. Clone Project

```bash
git clone https://github.com/AnujVishwakarma147/courseHUB.git
cd courseHUB
```

---

### 2. Install Dependencies

```bash
pnpm install
```

---

### 3. Environment Setup

`.env` file banao (ya `.env.example` copy karo):

```env
DATABASE_URL="postgresql://username:password@localhost:5432/coursehub"

BETTER_AUTH_SECRET="at-least-32-random-characters"
BETTER_AUTH_URL="http://localhost:3000"

AUTH_GITHUB_CLIENT_ID="your-id"
AUTH_GITHUB_CLIENT_SECRET="your-secret"

GOOGLE_CLIENT_ID="your-id"
GOOGLE_CLIENT_SECRET="your-secret"

RESEND_API_KEY="your-key"
RESEND_FROM_EMAIL="CourseHUB <notifications@your-verified-domain.com>"

# Optional Gmail SMTP; configured ho to Resend se pehle use hoga
GMAIL_USER="your-admin@gmail.com"
GMAIL_APP_PASSWORD="your-16-character-app-password"

ARCJET_KEY="your-key"

CLOUDINARY_CLOUD_NAME="your-name"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"

STRIPE_SECRET_KEY="your-key"
STRIPE_WEBHOOK_SECRET="your-webhook-secret"
STRIPE_CURRENCY="inr"

GROQ_API_KEY="your-groq-api-key"
```

---

### 4. Database Setup

```bash
pnpm exec prisma generate
pnpm exec prisma migrate dev
```

---

### 5. Run Project

```bash
pnpm dev
```

Open:

```
http://localhost:3000
```

---

## Commands

```bash
pnpm dev        # development
pnpm build      # Prisma client + production build
pnpm start      # production server
pnpm lint       # lint check
pnpm typecheck  # strict TypeScript check
pnpm check      # lint + types + Prisma schema validation
```

---

## Vercel Deployment

1. Repository ko Vercel mein import karo. Framework preset `Next.js` aur package manager `pnpm` automatically detect ho jayenge.
2. `.env.example` ke saare required values Vercel **Project Settings → Environment Variables** mein add karo.
3. Production mein `BETTER_AUTH_URL` ko exact public origin par set karo, jaise `https://coursehub.example.com` (trailing slash ke bina).
4. Naye/empty PostgreSQL database par first deployment se pehle schema ek baar apply karo:

```bash
pnpm exec prisma db push
```

`DATABASE_URL` usi target database ko point karna chahiye. Schema changes ko build command mein push mat karo; production migrations ko alag controlled step mein run karo.

OAuth provider dashboards mein production callback URLs allow karo:

```text
https://your-domain.com/api/auth/callback/google
https://your-domain.com/api/auth/callback/github
https://your-domain.com/api/admin-auth/callback/google
https://your-domain.com/api/admin-auth/callback/github
```

Stripe Dashboard mein webhook endpoint add karo:

```text
https://your-domain.com/api/webhooks/stripe
```

Events: `checkout.session.completed` aur `checkout.session.async_payment_succeeded`. Generated signing secret ko `STRIPE_WEBHOOK_SECRET` mein save karo.

Preview deployments ko production database ke schema changes ke liye use na karo. Preview ke liye separate database/branch safer hai.

---

## Stripe Webhook (Local)

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Database Models

* User
* Session
* Account
* Course
* Chapter
* Lesson
* Enrollment
* LessonProgress
* Verification

---

## Future Improvements

* Unit testing (Vitest)
* E2E testing (Playwright)
* CI/CD pipeline (GitHub Actions)
* Quizzes system
* Instructor analytics
* Reviews & ratings
* Search & filters
* Better analytics dashboard

---

## Author

**Anuj Vishwakarma**

GitHub: [@AnujVishwakarma147](https://github.com/AnujVishwakarma147)

---

## Status

Project production deployment ke liye optimized hai. Har release se pehle `pnpm check` aur `pnpm build` run karein.
