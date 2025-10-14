---
description: Load Convex Auth documentation context
---

You are working with **Convex Auth** (@convex-dev/auth) - a self-hosted authentication library for Convex backends.

## Context Loading

Read comprehensive Convex Auth documentation:
- `/Users/tjmcgovern/golfgod_x_convex/docs/convex/convexauth/convex_auth.yaml`

## Key Information

**Status**: Beta (API may change)
**Package**: `@convex-dev/auth`
**Docs**: https://labs.convex.dev/auth

### Core Features
- **Self-hosted**: No external auth service needed
- **Multiple methods**: OAuth, magic links, OTP, password, anonymous
- **80+ OAuth providers**: GitHub, Google, Apple, Facebook, Twitter, etc.
- **Direct DB integration**: Users table in your Convex database
- **Session management**: JWT tokens with refresh capability

### Quick Setup
```bash
npm install @convex-dev/auth
npx @convex-dev/auth
```

### Database Tables (Auto-created)
- `users` - User accounts
- `authSessions` - Active sessions
- `authAccounts` - Provider account data
- `authVerificationCodes` - OTP/magic link codes
- `authRefreshTokens` - Refresh tokens

### Client Hooks (React)
```typescript
import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';

const { signIn, signOut } = useAuthActions();
const { isLoading, isAuthenticated } = useConvexAuth();
```

### Server Functions
```typescript
import { getAuthUserId } from '@convex-dev/auth/server';

// In any query/mutation
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("Unauthorized");
```

### Common Patterns
- **OAuth**: `signIn('github', { redirectTo: '/dashboard' })`
- **Password**: `signIn('password', { email, password, flow: 'signIn' })`
- **OTP**: `signIn('email', { code: '123456' })`
- **Magic Link**: `signIn('resend', formData)`
- **Sign Out**: `await signOut()`

### Environment Variables
```bash
npx convex env set SITE_URL http://localhost:3000
# Plus provider-specific: AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, etc.
```

### Configuration Files
- `convex/auth.ts` - Auth setup with providers
- `convex/auth.config.ts` - Server-side provider config
- `convex/schema.ts` - Import authTables
- `convex/http.ts` - Register auth routes

### Components
```tsx
<Authenticated>{/* Signed in content */}</Authenticated>
<Unauthenticated>{/* Sign in form */}</Unauthenticated>
<AuthLoading>{/* Loading spinner */}</AuthLoading>
```

### Security Features
- Scrypt password hashing (customizable)
- JWT token authentication
- Automatic refresh tokens
- Rate limiting for OTP
- Session invalidation (single or all devices)
- OAuth 2.0 with CSRF protection

### Best Practices
✅ Use automated setup: `npx @convex-dev/auth`
✅ Validate `redirectTo` parameters
✅ Implement authorization checks in functions
✅ Use CAPTCHA with anonymous auth
✅ Invalidate sessions on security events
✅ Test all auth flows thoroughly

### Platform Support
- ✅ React (Vite)
- ✅ React Native
- ⚠️ Next.js (experimental)
- ❌ Other frameworks (limited)

### Ideal For
- New Convex applications
- Self-hosting requirements
- Full control over user data
- React/React Native apps
- Rapid prototyping

### Alternatives (if needs don't match)
- **Clerk**: More mature, extensive features
- **Auth0**: Enterprise features, compliance
- **WorkOS**: B2B/enterprise capabilities

---

**After reading this command**: You should be able to implement authentication, configure providers, handle sign-in/sign-out, protect routes, and manage user sessions in Convex applications using Convex Auth.

**Refer to**: `convex_auth.yaml` for complete implementation details, troubleshooting, API reference, and advanced patterns.
