# CLAUDE.md

## Business Context — Halo Collective

**One-liner:** Halo Collective is a done-for-you fan relationship service that turns athletes' social media reach into an owned, monetizable email audience.

**Tagline:** *"The Home for Athlete Fandom"*

**Category:** Athlete CRM-as-a-service / fan-relationship-as-a-service. Not software (HubSpot, Brevo, Pinpoint do the plumbing) — Halo sells a productized playbook + execution. Closest analogues: DTC growth agencies (Common Thread, Homestead Studio) but for athletes; Substack-for-creators logic, but managed and B2B-monetized; what NBA/ATP do for themselves at the league level, brought down to the individual athlete.

**Positioning:** For elite athletes and their agents who have built large social followings but no direct relationship with their fans. Halo converts that reach into a consented, segmented email database, then activates it weekly through a branded newsletter, sponsorship integrations, and direct commerce. Unlike traditional sports marketing agencies (PR/deals) or social media managers (operated layer only), Halo owns the full stack from acquisition to monetization — giving agents a new commercial asset to sell to sponsors, and athletes a recurring D2C revenue line.

**Real buyer:** The deck is dressed up as athlete-facing, but the buyer is **the agent**. The "your client now has X followers AND Y verified engaged fans" line is a sales arming kit — Halo gives agents a sharper story to walk into Rolex, Emirates, Lacoste with. Without that, the pitch wouldn't close.

**Implicit business model:** Pilot is free (loss-leader to prove value), tools at cost. Real revenue comes after — almost certainly monthly retainer + revenue share on sponsorship inventory and Kit Room commerce. The deck is silent on this on purpose; it's the "land" before the "expand."

**Product surfaces (likely):**
- Acquisition flows (lead magnets, IG/TikTok funnels → email capture)
- Owned email database (segmented, consented)
- Weekly branded newsletter
- Sponsorship integrations (paid placements inside the newsletter)
- Kit Room — direct commerce (merch, drops)

When building features, ask: *does this help an agent close a sponsorship, or help Halo convert raw social reach into owned, monetizable fandom?* If neither, it's probably not the priority.

---

## Tech Stack

- **Next.js 16** (App Router) + TypeScript + React 19
- **Prisma 7** + PostgreSQL (Supabase) — uses `@prisma/adapter-pg` driver adapter
- **Better Auth** for authentication (email/password + magic links)
- **Stripe** (v22, API `2026-04-22.dahlia`) for payments
- **Resend** + React Email for transactional emails (OTP, password reset, welcome, waitlist)
- **Brevo** + **MJML** (`@faire/mjml-react`) for the newsletter render and send pipeline
- **React Query** (via `useApi` hook) for client-side data fetching
- **Zustand** for client-side global state
- **react-hook-form** + Zod for form handling and validation
- **Tailwind CSS v4** + shadcn/ui for styling
- **PostHog** for analytics

## Commands

```bash
npm run dev            # Start dev server
npm run build          # Production build
npm run lint           # ESLint
npm run db:generate         # Generate Prisma client
npm run db:migrate          # Create + apply a new migration in dev (prisma migrate dev)
npm run db:migrate:deploy   # Apply pending migrations (used by Vercel build)
npm run db:reset            # Drop DB, re-apply all migrations, run seed (dev only)
npm run db:seed             # Run the seed script
npm run db:studio           # Open Prisma Studio
npm run email:dev           # Preview email templates
```

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── api/              # Route handlers
│   │   ├── auth/         # Better Auth routes
│   │   ├── webhooks/     # Stripe webhooks
│   │   └── waitlist/     # Waitlist endpoints
│   ├── (home)/           # Public layout
│   └── (dashboard)/      # Authenticated layout
├── components/           # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── sections/         # Landing sections
│   ├── navbar/           # Navigation
│   └── providers/        # Context providers
├── lib/
│   ├── api/              # Axios instance with interceptors
│   ├── better-auth/      # Auth setup
│   ├── constants/        # App constants
│   ├── db/               # Prisma client + schema
│   ├── emails/           # React Email transactional templates + emails/mjml/ MJML newsletter renderer
│   ├── errors/           # errorHandler
│   ├── hooks/            # useApi, etc.
│   ├── resend/           # Resend client
│   ├── schemas/          # Zod schemas
│   ├── seo/              # SEO utilities
│   ├── services/         # Business logic
│   ├── stores/           # Zustand stores
│   ├── stripe/           # Stripe client (API: 2026-04-22.dahlia)
│   ├── tracking/         # PostHog
│   └── utils.ts
└── data/                 # Static metadata
```

## Key Files

| File                                  | Purpose                               |
| ------------------------------------- | ------------------------------------- |
| `prisma.config.ts`                    | Prisma 7 config (schema, datasource, seed) |
| `config.json`                         | Project name, SEO, pricing, social    |
| `src/lib/config.ts`                   | Typed accessor for `config.json`      |
| `src/lib/hooks/useApi.ts`             | Centralized React Query hook          |
| `src/lib/constants/errorMessage.ts`   | Centralized error messages            |
| `src/lib/errors/errorHandler.ts`      | API route error handler               |
| `src/lib/better-auth/auth.ts`         | Auth configuration                    |
| `src/lib/db/prisma.ts`                | PrismaClient with pg driver adapter   |

## Coding Standards

### Core Principles

1. **Type Safety First** — no `any` unless unavoidable.
2. **Server Components Default** — Client Components only when needed.
3. **Reusability** — extract logic into utilities, hooks, services.
4. **No index files** — never `index.ts` for re-exports; import from source.

### File Naming

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities/hooks/services**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE

### API Routes — Authenticated

```typescript
import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { auth } from "@/lib/better-auth/auth";
import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { error: errorMessages.UNAUTHORIZED },
        { status: 401 },
      );
    }

    const body = await req.json();
    const validatedData = someSchema.parse(body);
    const result = await someService({
      userId: session.user.id,
      data: validatedData,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
```

### API Routes — Public

```typescript
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = someSchema.parse(body);
    const result = await someService({ data: validatedData });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
```

### Client-Side Data Fetching

Always use `useApi`. Never axios directly.

```typescript
const { useGet, usePost } = useApi();

const { data, isLoading, error } = useGet("/endpoint", { param: "value" });

const { mutate: createItem, isPending } = usePost("/endpoint", {
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
});
```

### Service Layer

All DB logic lives in `src/lib/services/` — single-responsibility, reusable.

### Validation

Zod schemas in `src/lib/schemas/`, used in API routes and forms.

### Forms

Always `react-hook-form` + Zod resolver + shadcn/ui `Form` components.

### Styling

- Tailwind utility classes only.
- shadcn/ui from `@/components/ui/` for all primitives.
- Theme-aware tokens (`text-foreground`, `bg-background`, `text-muted-foreground`).
- Don't introduce new colors or design patterns without approval.

### Imports

```typescript
// External
import { NextRequest } from "next/server";
import { z } from "zod";

// Internal
import { prisma } from "@/lib/db/prisma";
import { errorHandler } from "@/lib/errors/errorHandler";

// Types
import type { User } from "@prisma/client";
```

## Environment Variables

```env
# Database (Supabase Postgres)
DATABASE_URL=
DIRECT_URL=

# Storage (Supabase Storage)
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SECRET_KEY=             # service role key, server-only
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # required for browser direct-uploads via signed URLs

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
NEXT_PUBLIC_BASE_URL=

# Email (Resend — transactional)
RESEND_API_KEY=
RESEND_FROM_EMAIL=           # e.g. login@halocollective.co (used for magic-link login)

# Newsletter (Brevo — campaigns)
BREVO_API_KEY=
BREVO_SENDER_EMAIL=          # e.g. news@halocollective.co (must be a verified sender in Brevo)
BREVO_REPLY_TO_EMAIL=        # e.g. fans@halocollective.co (where fan replies land)
BREVO_DEFAULT_FOLDER_ID=     # Brevo folder id for athlete contact lists

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# App env
NEXT_PUBLIC_APP_ENV=

# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

```

## Prisma 7 Notes

- Schema lives at `src/lib/db/schema.prisma` and **does not** declare `url`/`directUrl` — those come from `prisma.config.ts`.
- Connection runs through the **`@prisma/adapter-pg`** driver adapter (Prisma 7 requirement).
- Migrations live in `src/lib/db/migrations/` and are the **source of truth** for the schema. Never use `prisma db push` against any environment — always create a migration with `npm run db:migrate -- --name <change>` and commit the generated SQL.
- Vercel build runs `prisma migrate deploy` before `next build` (see `vercel-build` in `package.json`) — pending migrations are applied automatically on every deploy.
- Seed script: `tsx src/lib/db/seed.ts`, declared in `prisma.config.ts`.

## Configuration

`config.json` centralizes:
- Project name, brand, description, tagline
- SEO metadata
- Contact + social links
- Pricing plans (incl. `stripePriceId` and `checkoutUrl`)
- Feature flags (`auth`, `waitlist`, `payments`)

## Getting Started

1. `cp .env.example .env` and fill values
2. `npm install`
3. `npm run db:generate`
4. `npm run db:push`
5. `npm run dev` → `http://localhost:3000`
