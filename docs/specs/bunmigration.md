npm_to_bun_migration_nextjs_convex:
  project: "GolfGod x Convex"
  stack:
    - "Next.js 15"
    - "React 19"
    - "Convex (real-time BaaS)"
    - "TypeScript"
    - "Tailwind CSS 4.0"
  
  current_state:
    package_manager: "npm"
    lockfile: "package-lock.json"
    scripts: "npm-run-all for parallel commands"
  
  target_state:
    package_manager: "Bun (for installs only)"
    runtime: "Node.js (Next.js requires it)"
    lockfile: "bun.lockb"
    convex_cli: "bunx convex"

important_notes:
  bun_as_package_manager_only:
    use_bun_for:
      - "Installing dependencies (bun install)"
      - "Adding packages (bun add)"
      - "Running scripts (bun run dev)"
      - "Convex CLI (bunx convex dev)"
    
    use_nodejs_for:
      - "Next.js runtime (next dev, next build)"
      - "Production server (next start)"
    
    reason: "Next.js 15 supports Bun as package manager, but runtime still requires Node.js APIs"
    
  convex_support:
    official: "Convex has official Bun support"
    quickstart: "https://docs.convex.dev/quickstart/bun"
    cli: "Use bunx convex dev instead of npx convex dev"
    
  vercel_deployment:
    auto_detect: "Vercel automatically detects bun.lockb"
    zero_config: "No configuration needed for deployment"
    build_command: "Vercel uses bun install automatically"

migration_steps:
  step_1_install_bun:
    action: "Install Bun globally"
    command: "curl -fsSL https://bun.sh/install | bash"
    verify: "bun --version"
    
  step_2_clean_npm:
    action: "Remove npm artifacts"
    commands:
      - "rm package-lock.json"
      - "rm -rf node_modules"
    note: "Do NOT remove package.json"
    
  step_3_install_dependencies:
    action: "Install all dependencies with Bun"
    command: "bun install"
    creates: "bun.lockb (binary lockfile)"
    time_savings: "2-20x faster than npm install"
    
  step_4_update_package_json:
    action: "Update scripts and packageManager field"
    
    add_package_manager_field:
      location: "Root of package.json"
      code: |
        {
          "name": "golfgod-convex",
          "packageManager": "bun@1.3.0",
          "scripts": {
            "dev": "bun run dev:all",
            "dev:all": "concurrently \"bun run dev:next\" \"bun run dev:convex\"",
            "dev:next": "next dev",
            "dev:convex": "bunx convex dev",
            "build": "next build",
            "start": "next start",
            "lint": "next lint",
            "convex:deploy": "bunx convex deploy"
          }
        }
    
    note: "Keep next dev/build/start - they use Node.js runtime"
    
  step_5_update_readme:
    action: "Correct documentation"
    file: "README.md"
    changes:
      old: "bun run dev"
      new: "Keep it as bun run dev (correct!)"
      fix: "README was actually right, just inconsistent with practice"
    
    development_commands:
      install: "bun install"
      dev: "bun run dev (runs Next.js + Convex in parallel)"
      build: "bun run build"
      convex_only: "bunx convex dev"
      convex_deploy: "bunx convex deploy"
      convex_run: "bunx convex run <function>"
  
  step_6_update_gitignore:
    action: "Ensure Bun artifacts are ignored"
    file: ".gitignore"
    add_if_missing: |
      # Bun
      bun.lockb
      node_modules/
      
      # Keep these already there
      .next/
      .env*.local
      .convex/
  
  step_7_commit_lockfile:
    action: "Commit bun.lockb to version control"
    commands:
      - "git add bun.lockb"
      - "git commit -m 'Migrate from npm to Bun'"
    importance: "CRITICAL - Vercel needs this for auto-detection"
    
  step_8_test_locally:
    action: "Verify everything works"
    tests:
      install: "bun install (should be fast)"
      dev_server: "bun run dev (Next.js + Convex)"
      build: "bun run build"
      convex_functions: "bunx convex run <test-function>"
    
    expected_results:
      - "Frontend runs on localhost:3000"
      - "Convex syncs functions automatically"
      - "Hot reload works"
      - "No errors in console"
  
  step_9_update_ci_cd:
    action: "Update GitHub Actions / CI if present"
    note: "Only if you have CI/CD workflows"
    
    github_actions_example: |
      # .github/workflows/deploy.yml
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install --frozen-lockfile
      
      - name: Build
        run: bun run build
      
      - name: Deploy to Convex
        run: bunx convex deploy
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
  
  step_10_deploy_to_vercel:
    action: "Deploy - Vercel auto-detects Bun"
    how_it_works:
      - "Vercel sees bun.lockb"
      - "Automatically runs: bun install"
      - "Then runs: next build (with Node.js)"
      - "Zero configuration needed"
    
    no_changes_needed: "Just push to main/deploy as normal"

convex_specific_commands:
  development:
    start_convex: "bunx convex dev"
    run_mutation: "bunx convex run mutations:functionName"
    run_action: "bunx convex run actions:functionName"
    import_data: "bunx convex import --table tableName data.jsonl"
    
  deployment:
    deploy: "bunx convex deploy"
    deploy_prod: "bunx convex deploy --prod"
    
  note: "All npx convex commands become bunx convex"

package_json_reference:
  complete_example: |
    {
      "name": "golfgod-convex",
      "version": "0.1.0",
      "packageManager": "bun@1.3.0",
      "private": true,
      "scripts": {
        "dev": "concurrently \"bun run dev:next\" \"bun run dev:convex\"",
        "dev:next": "next dev",
        "dev:convex": "bunx convex dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint",
        "convex:deploy": "bunx convex deploy",
        "convex:run": "bunx convex run"
      },
      "dependencies": {
        "next": "15.x.x",
        "react": "19.x.x",
        "react-dom": "19.x.x",
        "convex": "^1.x.x"
      },
      "devDependencies": {
        "@types/node": "^20",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        "typescript": "^5",
        "tailwindcss": "^4.0.0",
        "concurrently": "^8.0.0"
      }
    }

performance_improvements:
  install_speed:
    npm: "~45 seconds (typical)"
    bun: "~4 seconds (10x faster)"
  
  script_execution:
    startup: "Faster process spawning"
    overall: "More responsive development experience"
  
  disk_space:
    npm: "Duplicate packages across projects"
    bun: "Global cache with hardlinks"

troubleshooting:
  if_bun_not_found:
    issue: "Command 'bun' not found"
    solution: "Restart terminal or run: source ~/.bashrc (or ~/.zshrc)"
    
  if_convex_sync_fails:
    issue: "bunx convex dev not syncing"
    check_1: "Ensure .env.local has CONVEX_DEPLOYMENT"
    check_2: "Try: bunx convex dev --once to test connection"
    check_3: "Check convex dashboard for project status"
    
  if_next_build_fails:
    issue: "Build errors after migration"
    check_1: "Delete .next folder: rm -rf .next"
    check_2: "Reinstall: rm -rf node_modules && bun install"
    check_3: "Check package.json scripts use 'next' not 'bun --bun next'"
    
  if_types_missing:
    issue: "TypeScript errors after install"
    solution: "bun add -d @types/node @types/react @types/react-dom"
    
  if_vercel_deploy_fails:
    issue: "Vercel build failing"
    check_1: "Ensure bun.lockb is committed to git"
    check_2: "Check Vercel dashboard build logs"
    check_3: "Verify no package-lock.json in repo"

database_optimization_reminder:
  critical_rules:
    - "NEVER use .collect() on large tables"
    - "Always use .take(limit) with smart defaults"
    - "Use indexes (.withIndex()), not .filter()"
    - "Batch mutations 25-50 items"
  
  note: "Bun won't affect these - they're Convex-specific"
  reference: "See .claude/CLAUDE.md for full rules"

team_onboarding:
  for_new_developers:
    1: "Install Bun: curl -fsSL https://bun.sh/install | bash"
    2: "Clone repo: git clone <repo>"
    3: "Install deps: bun install"
    4: "Setup Convex: bunx convex dev (follow auth prompt)"
    5: "Start dev: bun run dev"
    6: "Open: http://localhost:3000"
  
  documentation_updates:
    - "Update README.md with Bun commands"
    - "Update CONTRIBUTING.md if it exists"
    - "Add note about Node.js runtime (not Bun runtime)"

verification_checklist:
  before_pushing:
    - "✓ bun.lockb exists and committed"
    - "✓ package-lock.json deleted"
    - "✓ node_modules/ deleted and reinstalled with Bun"
    - "✓ package.json has packageManager field"
    - "✓ All scripts use bunx for Convex CLI"
    - "✓ Scripts keep 'next' commands (not 'bun --bun next')"
    - "✓ Local dev works: bun run dev"
    - "✓ Build works: bun run build"
    - "✓ Convex deploys: bunx convex deploy"
  
  after_deploy:
    - "✓ Vercel build logs show 'bun install'"
    - "✓ Production site works"
    - "✓ Convex functions work"
    - "✓ No console errors"

quick_reference:
  common_commands:
    install_all: "bun install"
    add_package: "bun add <package>"
    add_dev_package: "bun add -d <package>"
    remove_package: "bun remove <package>"
    update_packages: "bun update"
    run_script: "bun run <script-name>"
    
  convex_commands:
    dev: "bunx convex dev"
    deploy: "bunx convex deploy"
    run_function: "bunx convex run <function>"
    import: "bunx convex import --table <table> <file>"
    
  development:
    start_dev: "bun run dev"
    start_next_only: "bun run dev:next"
    start_convex_only: "bun run dev:convex"
    build: "bun run build"
    start_prod: "bun run start"

benefits_summary:
  speed:
    installs: "10-20x faster than npm"
    startup: "Faster script execution"
    overall: "More responsive dev experience"
  
  disk_space:
    savings: "Global cache with hardlinks"
    no_duplication: "Packages shared across projects"
  
  developer_experience:
    simpler: "One tool (bun) for everything"
    faster: "Less waiting, more coding"
    modern: "Cutting-edge JavaScript runtime"
  
  production:
    vercel: "Zero-config deployment"
    convex: "Officially supported"
    reliable: "Production-ready (v1.0+)"

rollback_plan:
  if_issues_occur:
    1: "Delete bun.lockb"
    2: "Delete node_modules"
    3: "Run: npm install"
    4: "Commit package-lock.json"
    5: "Push to revert"
  
  note: "Keep Bun installed for future use"