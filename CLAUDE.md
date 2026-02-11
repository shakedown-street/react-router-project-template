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

## Architecture Highlights

### SOLID Principles & Design Patterns

This codebase follows SOLID principles with OOP design patterns:

- **Single Responsibility**: Each class has one reason to change (PasswordService, PasswordValidator, SessionManager, etc.)
- **Open/Closed**: Extensible via strategy pattern (e.g., add new validation rules without modifying validator)
- **Liskov Substitution**: All implementations conform to interfaces (`IUserRepository`, `IAuthenticationService`, etc.)
- **Interface Segregation**: Clients depend only on what they need (factory provides specific services)
- **Dependency Inversion**: Routes depend on abstractions (interfaces), not concrete implementations; factory handles injection

### Authentication Module Structure

```
app/lib/auth/
├── services/          # Core business logic
│   ├── IAuthenticationService.ts
│   ├── AuthenticationService.ts
│   ├── IPasswordService.ts
│   └── PasswordService.ts
├── repositories/      # Data access abstraction
│   ├── IUserRepository.ts
│   └── PrismaUserRepository.ts
├── validators/        # Extensible validation rules
│   ├── IPasswordValidator.ts
│   └── PasswordValidator.ts
├── session/           # Session management
│   ├── ISessionManager.ts
│   └── SessionManager.ts
├── types/             # Type definitions
│   └── IUser.ts
├── errors.ts          # Custom error classes
├── config.ts          # Configuration
└── factory.ts         # Dependency injection
```

---

## Code Architecture

### File Structure

```
app/
├── routes/                 # File-based routing (auto-discovered by React Router)
│   └── auth/               # Route grouping by feature
├── components/
│   ├── ui/                # shadcn/ui components from registry
│   └── (custom components)
├── lib/
│   ├── prisma.ts          # Prisma Client singleton (Node.js adapter)
│   ├── auth/               # Authentication module (OOP architecture)
│   │   ├── factory.ts      # Service factory (dependency injection)
│   │   ├── config.ts       # Configuration (session storage, rules)
│   │   ├── errors.ts       # Custom error classes (domain errors)
│   │   ├── services/       # Business logic services
│   │   ├── repositories/   # Data access layer (Prisma)
│   │   ├── validators/     # Validation strategy classes
│   │   ├── session/        # Session management
│   │   └── types/          # Type definitions (IUser, etc.)
│   └── utils.ts            # Utility functions
├── app.css                # Global styles (includes Tailwind imports)
├── root.tsx               # Root layout and error boundary
└── routes.ts              # Route configuration (generated)

prisma/
├── schema.prisma          # Prisma schema definition
└── generated/             # Generated Prisma Client (git-ignored)
```

### TypeScript Paths & Conventions

- Path alias: `~/*` → `./app/*` (e.g., `import Button from '~/components/ui/button'`)
- `.server.ts` suffix: Files ending in `.server.ts` are server-only and never included in client bundles
- `I*` prefix: Interfaces defining contracts (e.g., `IUserRepository`, `IAuthenticationService`)
- Service classes vs interfaces: Always depend on interfaces, not concrete implementations

### Database Integration

- **Prisma Client**: Instantiated in `app/lib/prisma.ts` with PostgreSQL adapter via `@prisma/adapter-pg`
- **Data Access Layer**: Database queries are organized in `app/db/*.db.server.ts` files for separation of concerns
- **Schema**: Defined in `prisma/schema.prisma`
- **Migrations**: Run with `npm run migrate`
- **Generated types**: Located in `prisma/generated/` (git-ignored)

### Authentication & Session Management (OOP Architecture)

The authentication system follows SOLID principles with clear separation of concerns:

- **AuthenticationService** (`app/lib/auth/services/`): Core business logic for login/signup
- **PasswordService** (`app/lib/auth/services/`): Hashing and verification with bcrypt
- **PasswordValidator** (`app/lib/auth/validators/`): Extensible validation rules
- **PrismaUserRepository** (`app/lib/auth/repositories/`): Data access abstraction
- **SessionManager** (`app/lib/auth/session/`): React Router session management
- **AuthServiceFactory** (`app/lib/auth/factory.ts`): Dependency injection factory
- **Custom Errors** (`app/lib/auth/errors.ts`): Type-safe error handling
- **Configuration** (`app/lib/auth/config.ts`): Centralized settings (password rules, session config)

### React Router Specifics

- **SSR**: Enabled by default (see `react-router.config.ts`)
- **File-based routing**: Files in `app/routes/` automatically become routes; nested folders create route hierarchies
- **Server functions**: `.server.ts` files are tree-shaken on the client
- **HMR**: Vite integration provides Hot Module Replacement during development
- **Type generation**: Auto-generated React Router types in `.react-router/` (git-ignored)

### UI Components & Styling

- **shadcn/ui**: Components installed in `app/components/ui/`
- **Adding components**: `npm run shadcn add <component-name>`
- **Built with**: Radix UI primitives and Tailwind CSS v4
- **Styling utilities**: `clsx` and `tailwind-merge` for combining Tailwind classes
- **Prettier integration**: Auto-sorts Tailwind classes; configured via `prettier-plugin-tailwindcss`

### Code Quality Standards

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier with Tailwind CSS and Prisma plugins
- **Type checking**: Run with `npm run typecheck`

## Important Files

- `react-router.config.ts` - React Router configuration (SSR enabled)
- `vite.config.ts` - Vite build configuration with Tailwind and React Router plugins
- `components.json` - shadcn/ui CLI configuration
- `.env.example` - Template for environment variables
- `tsconfig.json` - TypeScript configuration with path aliases
- `.prettierrc` - Prettier configuration
- `app/lib/auth/factory.ts` - Service factory for dependency injection
- `app/lib/auth/config.ts` - Authentication configuration (rules, session settings)
- `app/lib/auth/errors.ts` - Custom error classes

## Common Development Patterns

### Using the Auth Factory

Always use `AuthServiceFactory` to initialize authentication services with dependency injection:

```typescript
import { AuthServiceFactory } from '~/lib/auth/factory';
import { prisma } from '~/lib/prisma';

export async function loader({ request }: Route.LoaderArgs) {
  const { sessionManager } = AuthServiceFactory.create(prisma);
  const user = await sessionManager.getUser(request);
  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  const { authService, sessionManager } = AuthServiceFactory.create(prisma);

  try {
    const user = await authService.login(email, password);
    const sessionToken = await sessionManager.create(user.id);
    return redirect('/', { headers: { 'Set-Cookie': sessionToken } });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { error: 'Login failed' };
    }
    throw error;
  }
}
```

### Authentication Error Handling

Use custom error classes for type-safe error handling:

```typescript
import { AuthenticationError, InvalidPasswordError, EmailAlreadyExistsError } from '~/lib/auth/errors';

try {
  const user = await authService.login(email, password);
} catch (error) {
  if (error instanceof InvalidPasswordError) {
    return { error: 'Wrong password' };
  }
  if (error instanceof AuthenticationError) {
    return { error: 'Authentication failed' };
  }
  throw error;
}
```

### Adding New Validation Rules

Extend validation without modifying existing code:

```typescript
// app/lib/auth/validators/rules/CustomRule.ts
export class CustomPasswordRule extends PasswordRule {
  validate(password: string): string | null {
    // Your validation logic
    return null; // null = valid, string = error message
  }
}

// Add to PasswordValidator in validators/PasswordValidator.ts
this.rules.push(new CustomPasswordRule());
```

### Swapping Implementations

The repository pattern allows switching database implementations easily:

```typescript
// Create a different repository implementation
export class MockUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    // Mock implementation for testing
  }
  // ... other methods
}

// Factory can be updated to use mock for testing
const mockRepo = new MockUserRepository();
const authService = new AuthenticationService(mockRepo, ...);
```

### Protected Routes

Use the session manager to protect routes:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const { sessionManager } = AuthServiceFactory.create(prisma);
  const user = await sessionManager.requireUser(request); // Throws redirect if not authenticated
  return { user };
}
```

### Route Actions

Handle form submissions with proper error handling:

```typescript
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'POST') {
    throw new Response(null, { status: 405 });
  }

  const formData = await request.formData();
  const { authService, sessionManager } = AuthServiceFactory.create(prisma);

  try {
    const user = await authService.signup(email, password);
    const sessionToken = await sessionManager.create(user.id);
    return redirect('/', { headers: { 'Set-Cookie': sessionToken } });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { error: error.message };
    }
    throw error;
  }
}
```

## Environment Setup

Required environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string for Prisma
- `SESSION_SECRET` - Secret key for encrypting session cookies (must be at least 32 characters)
