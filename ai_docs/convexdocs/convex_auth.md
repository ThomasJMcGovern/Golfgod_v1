convex_auth_analysis:
overview:
name: "Convex Auth"
type: "Authentication Library"
description: "A library for implementing authentication directly within your Convex backend without needing external authentication services or hosting servers"
repository: "https://github.com/get-convex/convex-auth"
package: "@convex-dev/auth"
status: "Beta"
license: "Open Source"
ecosystem: "Auth.js (80+ OAuth providers)"

current_status:
maturity: "Beta - API may change based on user feedback"
stability: "In active development with backward-incompatible changes possible"
community_feedback: "Discord community for support and feedback"
experimental_features: - "Next.js server components support" - "Next.js API routes integration" - "Next.js middleware authentication" - "Server-Side Rendering (SSR)"

core_features:
architecture:
type: "Self-hosted authentication"
storage: "Users table integrated directly in Convex database"
no_external_dependencies: "No third-party auth service required"
backend_integration: "Runs entirely on Convex deployment"

    data_management:
      user_storage: "Built-in users table in Convex database"
      session_management: "authSessions table for tracking user sessions"
      direct_access: "Query users table directly in Convex functions"
      no_syncing_required: "No data synchronization with external services"

    security:
      password_encryption: "Scrypt by default (customizable)"
      jwt_tokens: "JSON Web Tokens for authentication"
      refresh_tokens: "Automatic token refresh mechanism"
      session_invalidation: "Sign out from single or all devices"

authentication_methods:
oauth:
description: "One-click login with social identity providers"
providers_count: "80+"
provider_ecosystem: "Auth.js provider ecosystem"
popular_providers: - "GitHub" - "Google" - "Apple" - "Facebook" - "Twitter"
security: "Higher security guarantees via OAuth 2.0"
configuration:
setup: "Import from @auth/core/providers"
environment_variables: "Provider-specific credentials required"
redirect_handling: "Automatic OAuth flow management"
example_providers:
github:
import: "GitHub from '@auth/core/providers/github'"
env_vars: ["AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET"]
google:
import: "Google from '@auth/core/providers/google'"
env_vars: ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"]
apple:
import: "Apple from '@auth/core/providers/apple'"
env_vars: ["AUTH_APPLE_ID", "AUTH_APPLE_SECRET"]
special_notes: "Requires custom profile function for name handling"

    magic_links:
      description: "Email-based passwordless authentication with clickable links"
      flow: "User receives email with one-time link to sign in"
      provider_example: "Resend"
      benefits:
        - "Quick and smooth login process"
        - "No password to remember"
        - "Reduced password-related support burden"
      configuration:
        email_provider: "Requires email service integration (e.g., Resend)"
        redirect_handling: "Custom redirectTo parameter support"

    otp:
      description: "One-Time Password sent via email or SMS"
      types:
        - "Email OTP"
        - "Phone OTP (SMS)"
      flow: "Two-step process - request code, then verify code"
      features:
        rate_limiting: "Built-in rate limiting for failed attempts"
        code_expiration: "Time-limited verification codes"
      benefits:
        - "Smooth login experience"
        - "No password management"
        - "Additional security layer"

    password:
      description: "Traditional email and password authentication"
      encryption: "Scrypt by default (customizable)"
      flows:
        sign_up: "Account creation with email and password"
        sign_in: "Login with credentials"
        password_reset: "Password recovery flow"
        email_verification: "Optional email verification step"
      configuration:
        provider: "Password from '@convex-dev/auth/providers/Password'"
        custom_encryption: "Support for custom encryption mechanisms"
      security_features:
        - "Secure password hashing with Scrypt"
        - "Configurable password policies"
        - "Built-in password reset functionality"

    anonymous:
      description: "Guest access without credentials"
      use_cases:
        - "Guest checkout"
        - "Try before signup"
        - "Progressive onboarding"
      features:
        captcha_support: "Optional CAPTCHA integration to prevent abuse"
        upgrade_path: "Can link anonymous accounts to authenticated accounts"

login_logout_functionality:
sign_in:
client_side:
react_hook: "useAuthActions() from '@convex-dev/auth/react'"
method: "signIn(provider, params)"
parameters:
provider: "ID of the provider (lowercase name or configured id)"
params: "FormData or object containing sign-in parameters"
optional_fields:
redirectTo: "Custom destination after OAuth/magic link completion"
code: "OTP code or OAuth authorization code"
return_value:
signingIn: "Boolean indicating immediate successful sign-in"
redirect: "URL for OAuth flow browser redirect (if applicable)"
examples:
oauth: "signIn('github', { redirectTo: '/dashboard' })"
email_otp: "signIn('email', { code: '123456' })"
password: "signIn('password', { email, password, flow: 'signIn' })"
anonymous: "signIn('anonymous')"
magic_link: "signIn('resend', formData)"

      server_side:
        type: "Convex Action"
        location: "Exported from convex/auth.ts"
        functionality:
          - "Initiates user sign-in process"
          - "Refreshes existing authentication session"
          - "Validates credentials"
          - "Creates session tokens"

      authentication_flows:
        oauth_flow:
          step_1: "Client calls signIn with provider ID"
          step_2: "Returns redirect URL to OAuth provider"
          step_3: "User authorizes on provider site"
          step_4: "Provider redirects back with authorization code"
          step_5: "Client calls signIn again with code parameter"
          step_6: "Server validates and creates session"

        magic_link_flow:
          step_1: "Client calls signIn with email"
          step_2: "Server sends email with magic link"
          step_3: "User clicks link in email"
          step_4: "Redirects to app with code parameter"
          step_5: "Client calls signIn with code"
          step_6: "Server validates and creates session"

        otp_flow:
          step_1: "Client calls signIn with email"
          step_2: "Server sends OTP code via email/SMS"
          step_3: "User enters code in form"
          step_4: "Client calls signIn with code"
          step_5: "Server validates code and creates session"

        password_flow:
          step_1: "Client calls signIn with email, password, and flow type"
          step_2: "Server validates credentials"
          step_3: "Server creates session if valid"
          step_4: "Returns authentication tokens"

    sign_out:
      client_side:
        react_hook: "useAuthActions() from '@convex-dev/auth/react'"
        method: "signOut()"
        return_value: "Promise<void>"
        functionality:
          - "Invalidates server session"
          - "Deletes local JWT token"
          - "Removes refresh token"
          - "Clears authentication state"
        example: "await signOut()"

      server_side:
        type: "Convex Action"
        location: "Exported from convex/auth.ts"
        functionality:
          - "Invalidates current user session"
          - "Removes session from authSessions table"
          - "Clears authentication context"

      advanced_sign_out:
        sign_out_all_devices:
          description: "Sign out from all devices except current"
          method: "invalidateSessions(ctx, { userId, except: [currentSessionId] })"
          use_case: "Security measure when suspicious activity detected"

        sign_out_everywhere:
          description: "Sign out from all devices including current"
          method: "invalidateSessions(ctx, { userId })"
          use_case: "Password reset or security breach response"

    authentication_state:
      check_authenticated:
        client_side:
          method_1: "useAuthToken() - Returns JWT token or null"
          method_2: "useConvexAuth() - Returns { isLoading, isAuthenticated }"
          components:
            - "<Authenticated> - Renders when signed in"
            - "<Unauthenticated> - Renders when signed out"
            - "<AuthLoading> - Renders during auth check"

        server_side:
          functions:
            - "getAuthUserId(ctx) - Returns current user ID or null"
            - "getAuthSessionId(ctx) - Returns session ID or null"
            - "isAuthenticated() - Returns Promise<boolean>"
          context_types:
            - "QueryCtx - For queries"
            - "MutationCtx - For mutations"
            - "ActionCtx - For actions"
          nextjs_middleware: "convexAuth.isAuthenticated() in middleware"

configuration:
setup_steps:
installation:
command: "npm install @convex-dev/auth"
dependencies: "Automatically installs @auth/core"

      initialization:
        automated: "npx @convex-dev/auth"
        manual_alternative: "Follow manual setup guide"

      schema_setup:
        required_tables:
          - "users - User accounts"
          - "authSessions - Active sessions"
          - "authAccounts - Provider-specific account data"
          - "authVerificationCodes - OTP/magic link codes"
          - "authRefreshTokens - Refresh tokens"
        import: "authTables from '@convex-dev/auth/server'"
        location: "convex/schema.ts"

      auth_configuration:
        file: "convex/auth.ts"
        exports:
          - "auth - HTTP action helper"
          - "signIn - Sign in action"
          - "signOut - Sign out action"
          - "store - Internal mutation for DB operations"
          - "isAuthenticated - Auth state utility"
        function: "convexAuth({ providers: [...] })"

      http_routes:
        file: "convex/http.ts"
        setup: "auth.addHttpRoutes(http)"
        purpose: "Register authentication endpoints"

      frontend_provider:
        react:
          component: "ConvexAuthProvider"
          import: "from '@convex-dev/auth/react'"
          replaces: "ConvexProvider from 'convex/react'"
          location: "Root component wrapper (main.tsx or index.tsx)"

        nextjs:
          component: "ConvexAuthNextjsServerProvider"
          location: "Layout component"
          additional: "convexAuthNextjsMiddleware for route protection"

        react_native:
          component: "ConvexAuthProvider"
          additional_setup: "OAuth redirect URI configuration"
          dependencies: "expo-auth-session, expo-web-browser"

    environment_variables:
      required:
        SITE_URL:
          description: "Application URL for OAuth redirects and magic links"
          examples:
            - "http://localhost:5173 - Vite"
            - "http://localhost:3000 - Next.js"
          not_needed_for: "Password-only authentication (except React Native OTP)"
          command: "npx convex env set SITE_URL <url>"

      provider_specific:
        oauth_providers:
          github:
            - "AUTH_GITHUB_ID"
            - "AUTH_GITHUB_SECRET"
          google:
            - "AUTH_GOOGLE_ID"
            - "AUTH_GOOGLE_SECRET"
          apple:
            - "AUTH_APPLE_ID"
            - "AUTH_APPLE_SECRET"

        email_providers:
          resend:
            - "AUTH_RESEND_KEY"

      configuration_file:
        location: "convex/auth.config.ts"
        purpose: "Server-side provider configuration"
        structure:
          providers:
            - domain: "process.env.CONVEX_SITE_URL"
              applicationID: "convex"

    callbacks:
      redirect:
        description: "Custom redirect URL validation after OAuth/magic link"
        parameters:
          redirectTo: "Target URL from client request"
        return: "Validated absolute or relative URL string"
        use_cases:
          - "Validate redirectTo parameter"
          - "Implement custom redirect logic"
          - "Prevent open redirect vulnerabilities"

supported_platforms:
current_support: - "React (Vite)" - "React Native mobile apps" - "Next.js (experimental)" - "CDN-served React apps"

    nextjs_support:
      status: "Under active development"
      features:
        - "Server components (experimental)"
        - "API routes (experimental)"
        - "Middleware authentication (experimental)"
        - "SSR support (experimental)"
      middleware:
        function: "convexAuthNextjsMiddleware"
        features:
          - "Route protection"
          - "Authentication checks"
          - "Redirect handling"
        utilities:
          - "isAuthenticatedNextjs()"
          - "convexAuthNextjsToken()"
          - "createRouteMatcher()"
          - "nextjsMiddlewareRedirect()"
      server_components:
        token_access: "convexAuthNextjsToken()"
        auth_check: "isAuthenticatedNextjs()"

api_reference:
server_functions:
convexAuth:
description: "Primary configuration function"
parameters:
config: "ConvexAuthConfig object"
returns:
auth: "HTTP action helper"
signIn: "Sign-in action"
signOut: "Sign-out action"
store: "Internal mutation"
isAuthenticated: "Auth state utility"
location: "convex/auth.ts"

      getAuthUserId:
        description: "Get current authenticated user ID"
        parameters:
          ctx: "Query, Mutation, or Action context"
        returns: "User ID (Doc ID) or null"
        example: "const userId = await getAuthUserId(ctx)"

      getAuthSessionId:
        description: "Get current session ID"
        parameters:
          ctx: "Query, Mutation, or Action context"
        returns: "Session ID or null"
        example: "const sessionId = await getAuthSessionId(ctx)"

      invalidateSessions:
        description: "Invalidate user sessions"
        parameters:
          ctx: "Action context"
          options:
            userId: "User to sign out"
            except: "Session IDs to preserve (optional)"
        use_cases:
          - "Sign out all devices"
          - "Sign out except current device"
          - "Force re-authentication"

      retrieveAccount:
        description: "Retrieve account by provider and credentials"
        use_cases:
          - "Custom authentication flows"
          - "Account verification"
          - "Multi-factor authentication"

      signInViaProvider:
        description: "Chain authentication through multiple providers"
        use_cases:
          - "Multi-step verification"
          - "Email verification after password login"
          - "Progressive authentication"

    client_hooks:
      useAuthActions:
        description: "Access signIn and signOut methods in React"
        import: "from '@convex-dev/auth/react'"
        returns:
          signIn: "Function to initiate sign-in"
          signOut: "Function to sign out user"
        example: "const { signIn, signOut } = useAuthActions()"

      useAuthToken:
        description: "Get current JWT authentication token"
        import: "from '@convex-dev/auth/react'"
        returns: "JWT token string or null"
        use_cases:
          - "Authenticating HTTP requests"
          - "Custom API calls"
          - "Third-party integrations"
        example: "const token = useAuthToken()"

      useConvexAuth:
        description: "Get authentication state"
        import: "from 'convex/react'"
        returns:
          isLoading: "Boolean - Auth check in progress"
          isAuthenticated: "Boolean - User is signed in"
        example: "const { isLoading, isAuthenticated } = useConvexAuth()"

    react_components:
      Authenticated:
        description: "Renders children only when user is authenticated"
        import: "from 'convex/react'"
        usage: "<Authenticated>{content}</Authenticated>"

      Unauthenticated:
        description: "Renders children only when user is not authenticated"
        import: "from 'convex/react'"
        usage: "<Unauthenticated>{signInForm}</Unauthenticated>"

      AuthLoading:
        description: "Renders children during authentication state check"
        import: "from 'convex/react'"
        usage: "<AuthLoading>{loadingIndicator}</AuthLoading>"

database_schema:
tables:
users:
description: "Primary user accounts table"
fields: - "name - User display name" - "email - User email address" - "emailVerified - Email verification timestamp" - "image - Profile image URL"
access: "Direct queries in Convex functions"
integration: "No third-party service sync needed"

      authSessions:
        description: "Active user sessions"
        usage: "Track logged-in devices and session state"
        access: "getAuthSessionId(ctx)"

      authAccounts:
        description: "Provider-specific account data"
        purpose: "Link users to OAuth providers and credentials"

      authVerificationCodes:
        description: "OTP and magic link verification codes"
        features:
          - "Time-limited codes"
          - "Single-use verification"

      authRefreshTokens:
        description: "Session refresh tokens"
        purpose: "Extend user sessions without re-authentication"

use_cases:
ideal_for: - "Convex applications wanting minimal external services" - "Self-hosted authentication requirements" - "Full control over user data" - "Direct database integration needs" - "React and React Native applications" - "Rapid prototyping with built-in auth"

    not_ideal_for:
      - "Applications needing mature auth features not yet in Convex Auth"
      - "Production apps requiring stable, unchanging APIs (due to beta status)"
      - "Complex enterprise auth requirements"
      - "Applications needing extensive compliance features"

    alternatives_to_consider:
      clerk:
        reason: "More mature feature set"
        integration: "Works well with Convex"

      auth0:
        reason: "Enterprise features and compliance"
        integration: "Works well with Convex"

      workos:
        reason: "B2B and enterprise capabilities"
        integration: "Works well with Convex"

integration_patterns:
authorization:
approach: "Function-level access control"
pattern: "Check authentication at function start"
flexibility: "No opinionated framework like RLS"
example_pattern: |
Check if user is authenticated
Verify user has permission for action
Perform business logic

    http_actions:
      authentication: "Bearer token in Authorization header"
      token_source: "useAuthToken() hook"
      endpoint_format: "https://{deployment}.convex.site/{endpoint}"

    custom_providers:
      supported: true
      base_class: "ConvexCredentials"
      customize:
        - "authorize() method"
        - "profile() method"
        - "Custom verification flows"
      examples:
        - "Phone number authentication"
        - "Custom OTP providers"
        - "Multi-factor authentication"
        - "Chained authentication flows"

debugging:
client_side:
verbose_logging:
enable: "ConvexReactClient({ verbose: true })"
output: "Browser console"

    server_side:
      logs: "Convex dashboard logs"
      inspection: "Database tables inspection"

    common_issues:
      environment_variables: "Check all required env vars are set"
      provider_configuration: "Run npx convex dev after config changes"
      oauth_redirects: "Verify SITE_URL matches application URL"

security_features:
password_security:
hashing: "Scrypt algorithm by default"
customization: "Support for alternative encryption"

    session_management:
      jwt_tokens: "Secure token-based authentication"
      refresh_tokens: "Automatic session renewal"
      session_invalidation: "Single or multi-device sign-out"

    oauth_security:
      protocol: "OAuth 2.0 standard"
      state_management: "CSRF protection"
      redirect_validation: "Custom redirect callbacks"

    rate_limiting:
      otp_attempts: "Built-in rate limiting for OTP verification"

limitations:
beta_status: - "API may change in backward-incompatible ways" - "Not feature-complete compared to mature auth providers" - "Active development means frequent updates"

    platform_support:
      - "Limited Next.js support (experimental)"
      - "No native support for other frameworks beyond React"
      - "SSR support still in development"

    missing_features:
      - "Some enterprise features available in Auth0/Clerk"
      - "Advanced compliance features"
      - "Extensive audit logging"
      - "Advanced SSO capabilities"

comparison_with_alternatives:
vs_clerk:
clerk_advantages: - "More mature and stable API" - "Extensive UI components" - "Advanced enterprise features"
convex_auth_advantages: - "Self-hosted" - "No external service dependency" - "Direct database integration" - "Lower cost for high-volume apps"

    vs_auth0:
      auth0_advantages:
        - "Enterprise-grade features"
        - "Extensive compliance certifications"
        - "Advanced SSO and federation"
      convex_auth_advantages:
        - "Simpler setup"
        - "No external service costs"
        - "Full data control"

    vs_firebase_supabase_auth:
      similarities:
        - "Backend-integrated authentication"
        - "Multiple auth methods"
        - "Self-contained solution"
      differences:
        - "Convex Auth: Runs on Convex backend specifically"
        - "Firebase/Supabase: Tied to their respective platforms"
        - "Convex Auth: Still in beta with fewer features"

best_practices:
setup: - "Use automated setup with npx @convex-dev/auth" - "Configure environment variables properly" - "Set up auth.config.ts for provider settings" - "Test authentication flows thoroughly"

    security:
      - "Validate redirectTo parameters in redirect callback"
      - "Implement proper authorization checks in functions"
      - "Use CAPTCHA with anonymous authentication"
      - "Invalidate sessions on security events"
      - "Use HTTPS in production"

    user_experience:
      - "Provide clear loading states with AuthLoading"
      - "Handle authentication errors gracefully"
      - "Offer multiple sign-in options"
      - "Implement password reset flows"
      - "Add email verification for sensitive operations"

    code_organization:
      - "Keep auth logic in convex/auth.ts"
      - "Create reusable auth components"
      - "Centralize authentication state management"
      - "Use TypeScript for type safety"

community_and_support:
primary_channel: "Discord community"
documentation: "https://labs.convex.dev/auth"
github: "https://github.com/get-convex/convex-auth"
examples: "Example implementations available in repository"
feedback: "Active beta testing and community feedback encouraged"

pricing_implications:
costs: - "Runs on Convex infrastructure" - "No separate authentication service fees" - "Included in Convex pricing" - "Scales with Convex usage"
advantages: - "Predictable costs" - "No per-user pricing" - "No external service bills"

future_roadmap:
planned_improvements: - "Stable Next.js integration" - "Additional framework support" - "More authentication features" - "Enhanced enterprise capabilities" - "Migration from beta to stable release"
community_driven: - "Feature requests via Discord" - "Open to community contributions" - "Responsive to user feedback"

getting_started:
quick_start:
step_1: "Install: npm install @convex-dev/auth"
step_2: "Initialize: npx @convex-dev/auth"
step_3: "Configure providers in convex/auth.ts"
step_4: "Wrap app in ConvexAuthProvider"
step_5: "Implement sign-in/sign-out UI"
step_6: "Test authentication flows"

    learning_resources:
      - "Official documentation: https://labs.convex.dev/auth"
      - "Setup guide: https://labs.convex.dev/auth/setup"
      - "API reference: https://labs.convex.dev/auth/api_reference"
      - "Configuration guides for each auth method"
      - "Example applications in GitHub repository"
      - "Community Discord for questions"

conclusion:
summary: "Convex Auth is a powerful, self-hosted authentication library that integrates seamlessly with Convex backends, offering OAuth, magic links, OTPs, passwords, and anonymous authentication without external dependencies"

    best_use_cases:
      - "New Convex applications"
      - "Projects prioritizing self-hosting"
      - "Apps wanting full control over user data"
      - "React and React Native applications"
      - "Rapid prototyping and MVPs"

    considerations:
      - "Beta status means potential API changes"
      - "Less feature-rich than mature providers like Clerk or Auth0"
      - "Best for applications comfortable with evolving APIs"
      - "Consider alternatives for complex enterprise requirements"

    recommendation: "Ideal for Convex applications that want minimal external dependencies and are comfortable with a library in beta. For production applications requiring stable APIs and extensive features, consider mature alternatives like Clerk or Auth0 which integrate well with Convex."
