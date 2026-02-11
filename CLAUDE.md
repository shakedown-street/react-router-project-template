# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack React Router 7 application with:

- **Frontend**: React 19 with TypeScript, SSR enabled
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Backend**: Node.js runtime via @react-router/node
- **Database**: PostgreSQL with Prisma ORM
- **Build Tool**: Vite

## Common Commands

### Development

- `npm run dev` - Start dev server with HMR (localhost:5173)
- `npm run typecheck` - Run TypeScript type checking and generate types

### Building & Deployment

- `npm run build` - Create production build (outputs to `build/` directory)
- `npm start` - Run production server from built files

### Database

- `npm run migrate` - Create/run Prisma migrations
- `npm run generate` - Regenerate Prisma Client from schema

### Code Quality

- `npm run format` - Format code with Prettier (runs on app, prisma folders and common file types)

## Code Architecture

### File Structure

```
app/
├── routes/                 # File-based routing (auto-discovered by React Router)
├── components/
│   ├── ui/                # shadcn/ui components from registry
│   └── (custom components)
├── lib/
│   ├── prisma.ts         # Prisma Client singleton
│   └── utils.ts          # Utility functions
├── app.css               # Global styles (includes Tailwind imports)
├── root.tsx              # Root layout and error boundary
└── routes.ts             # Route configuration (generated)

prisma/
├── schema.prisma         # Prisma schema definition
└── generated/            # Generated Prisma Client (git-ignored)
```

### Type Paths

TypeScript path alias configured: `~/*` → `./app/*` (e.g., `import Button from '~/components/ui/button'`)

### Database Integration

- Prisma Client is instantiated in `app/lib/prisma.ts` using Node.js adapter for edge function support
- Schema: `prisma/schema.prisma` uses PostgreSQL provider
- Migrations: Run with `npm run migrate`
- Generated types are in `prisma/generated/` (git-ignored)

### React Router Specifics

- SSR is enabled (see `react-router.config.ts`)
- Routes use file-based convention: files in `app/routes/` automatically become routes
- Vite integration provides HMR during development
- TypeScript types are auto-generated in `.react-router/` (git-ignored)

### UI Components

- shadcn/ui components installed in `app/components/ui/`
- Add components via: `npm run shadcn add <component-name>`
- Components are built with Radix UI primitives and Tailwind CSS
- Styling utilities available: `clsx` and `tailwind-merge` for combining Tailwind classes

### Code Quality Rules

- Prettier is configured with Tailwind CSS plugin (auto-sorts classes)
- Prisma Prettier plugin ensures schema formatting consistency
- TypeScript strict mode enabled

## Important Files

- `react-router.config.ts` - React Router configuration (SSR enabled)
- `vite.config.ts` - Vite build configuration with Tailwind and React Router plugins
- `components.json` - shadcn/ui CLI configuration
- `.env.example` - Template for environment variables (DATABASE_URL required for Prisma)
- `tsconfig.json` - TypeScript configuration with path aliases

## Environment Setup

Required environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string for Prisma
