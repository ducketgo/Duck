# DUCK Feature Status and Repository Audit

Updated: 2026-11-07

## Audit Summary

- Stack: Next.js 15 App Router, React 19, TypeScript, Supabase JS, Vercel. The web bundle no longer depends on Firebase.
- Auth: Supabase email/password sign-up, sign-in, email confirmation, sign-out, and password reset screens exist. Supabase reports email provider enabled and email auto-confirm disabled. The public sign-up form is live, and the production/local redirect URLs are allowlisted. A full email confirmation/reset cycle still needs a user-account test.
- Founder identity: `duckdev-service@protonmail.com` exists in Supabase Auth, is confirmed, has server-managed `app_metadata.duck_role=admin`, and now has `public.profiles.role=admin`.
- Admin: `/admin` lists and edits profiles through the admin-only SQL RPC `admin_update_profile`; changes are audited in `public.admin_audit_log`. The three DuckAuth migrations are applied to the configured project.
- Data: The organization currently has one Supabase project. Auth/profile schema is applied there, but the separate platform project and trusted cross-project token validation are not configured. The `public.software` table still returns HTTP 404.
- Existing working surfaces: public presentation pages, service directory, Supabase Auth screens, member dashboard shell, and guest-transfer UI/Edge Function implementation. Transfer service activation and end-to-end behavior are not verified.
- Validation available: `npm run type-check` passes; the latest Vercel build completed successfully. No automated test suite is configured.

## Feature Matrix

| ID | Area and requested capability | Status | Real implementation and evidence | Dependencies, next work, tests, known limits |
| --- | --- | --- | --- | --- |
| DUCK-01 | Mission, identity, founder, community language | En développement | Public pages and about content in `src/app/about/page.tsx`, `src/app/page.tsx` | Review all public claims and legal identity; no registered-organization claim should be added without evidence. |
| DUCK-02 | Service branches and extensible registry | En développement | Typed branch list in `src/lib/services.ts`; service pages in `src/app/services/` | Descriptions are informational; each branch needs its own real data/features and acceptance tests. |
| DUCK-03 | Design system, colors, responsive visual system | En développement | Global styles in `src/app/globals.css`; shared shell in `src/components/site-shell.tsx` | Audit contrast, keyboard focus, mobile layouts, reduced motion; no visual regression suite. |
| DUCK-04 | Original duck mascot and logo variants | À planifier | Text/mark brand only | Create original assets and variants; no mascot asset currently exists. |
| DUCK-05 | Sidebar, universal navigation, breadcrumbs, search, notifications | En développement | Responsive top navigation in `src/components/site-shell.tsx` | Sidebar categories, breadcrumbs, search, notification center, profile/settings navigation are absent. |
| DUCK-06 | Motion and reduced-motion controls | En développement | Some CSS transitions and `prefers-reduced-motion` rules | No user preference control or page transitions; test keyboard and reduced-motion behavior. |
| DUCK-07 | Public home, service links, news and public statistics | En développement | Static home in `src/app/page.tsx` | No published-news feed or verified live statistics; do not present invented metrics. |
| DUCK-08 | Privacy-respecting community circle | À planifier | No member discovery surface | Requires public-profile RLS, privacy model, and tests proving private profiles never leak. |
| DUCK-09 | Personalized member dashboard and widgets | En développement | Basic authenticated dashboard in `src/app/dashboard/page.tsx` | Widgets, activity, projects, events, preferences, and persisted layout are not implemented. |
| DUCK-10 | Loading, empty, error, offline, denied states | En développement | Several forms and pages have local loading/error states | No shared state system or offline handling; audit every route and backend failure. |
| DUCK-11 | Registration, confirmation, login, reset, logout | À tester | Supabase Auth forms in `src/components/auth/`; signup is public on production and redirects are allowlisted | Test a complete email confirmation, login, and reset cycle with a real user. |
| DUCK-12 | Universal DuckAuth SSO/OIDC and client registry | À planifier | Supabase Auth session only | Requires separate DuckAuth/platform projects, OAuth client registry, redirect validation, token revocation, and security tests. |
| DUCK-13 | Member profiles and profile editor | En développement | `public.profiles` is live; `/admin` can inspect and edit profile fields through an admin-only RPC | Member self-service profile editing and privacy tests remain. |
| DUCK-14 | Privacy controls, friends, follows, groups, blocks | À planifier | No relationship model/UI | Requires privacy schema, server-enforced authorization, export/delete policies, and access tests. |
| DUCK-15 | Posts, comments, reactions, official feed | À planifier | No publication schema or UI | Requires visibility-aware data model, moderation, pagination, and RLS tests. |
| DUCK-16 | Community servers, channels, roles, invitations | À planifier | No server/channel implementation | Requires role/permission model, audit log, moderation tools, and authorization tests. |
| DUCK-17 | Private messaging, attachments, audio/video calls | À planifier | No messaging or calling implementation | Requires private conversation schema, realtime authorization, storage policies, WebRTC signaling/TURN, and security testing. |
| DUCK-18 | Software catalogue, versions, downloads, documentation | En développement | `src/app/software/page.tsx` is an explicit empty state; `supabase/platform/migrations/202611070001_public_catalog.sql` defines a table | Catalog migration is not verified as applied; implement admin CRUD only after platform identity/RLS design is in place. |
| DUCK-19 | Admin account, console, site-wide content management | En développement | Founder has protected Auth and profile admin roles; `/admin` provides audited profile editing and `/admin/visual` is reserved to the founder for visual site and home-page editing | Apply `202611070005_visual_site_editor.sql` then `202611070006_duckadmin_founder_only.sql` to the active DuckAuth project before visual settings can be persisted. Content management beyond the visual editor remains future work. |
| DUCK-20 | Data privacy, legal compliance, security controls | En développement | Supabase RLS migrations and legal routes exist | Legal pages remain preliminary; no complete export/delete flow, abuse protection, or incident process. Review every deployed RLS policy. |
| DUCK-21 | Notification center and channel preferences | À planifier | No notification model or UI | Requires event sources, delivery service, preferences, and deduplication tests. |
| DUCK-22 | Universal search with privacy-aware results | À planifier | No search implementation | Requires indexed data, permission-filtered queries, rate limits, and privacy leak tests. |
| DUCK-23 | Theme editor and marketplace | En développement | `/admin/visual` has 91 typed controls, immediate local preview, JSON import/export, reset, admin-only save RPC, and change history | Apply `202611070005_visual_site_editor.sql` in the DuckAuth project. Marketplace and theme sharing are not implemented; imported files are parsed as data and never execute JavaScript. |
| DUCK-24 | Human moderation and public-content AI assistance | À planifier | No moderation queue or AI integration | Requires reports, human decisions, explainability, privacy boundaries, and a configured provider. Private messages must remain excluded. |
| DUCK-25 | Public/admin statistics | À planifier | No verified metrics | Define aggregation and privacy thresholds; do not expose private-member activity. |
| DUCK-26 | Events, calendar, attendance, reminders | À planifier | No event schema or UI | Requires scheduling, notifications, visibility and cancellation workflows. |
| DUCK-27 | DjDuck audio/video/playlists/podcasts | À planifier | Branch description only | Requires media rights, storage/streaming, playback, moderation, and content-management tools. |
| DUCK-28 | Courses, workshops, exercises, progress | À planifier | No learning system | Requires course/content models, progress persistence, and clear internal-certificate labeling. |
| DUCK-29 | DUCK AI assistant and specialized agents | À planifier | No AI service | Requires provider configuration, scoped tools, consent, audit, cost limits, and human approval for sensitive actions. |
| DUCK-30 | Public API, SDK, plugin marketplace | À planifier | No API or plugin system | Requires OAuth/scopes, key lifecycle, rate limits, sandboxing, docs, and security reviews. |
| DUCK-31 | Donations and funding | À planifier | No payment integration | Keep unpublished/inactive until a provider and legal/accounting review are complete. |
| DUCK-32 | Multilingual UI and content | À planifier | French-first static content | No locale routing or translation pipeline; test locale fallback and distinguish human/automatic translations. |
| DUCK-33 | Backups, export, restore | À planifier | No user export/restore workflow | Define retention, protected exports, integrity checks, and recovery procedures. |
| DUCK-34 | Contests, points ledger, virtual shop | À planifier | `profiles.duck_points` is only a field in the proposed schema | No transactions, contest, or purchase system; all balances and awards must be atomic server-side operations. |
| DUCK-35 | Persistent virtual desktop and widgets | À planifier | Dashboard placeholder and unused widget types | Requires storage schema and persisted layout; do not treat type declarations as working features. |
| DUCK-36 | Support, incident reporting, content reports | En développement | Contact email link in shared footer | No ticket/report database or delivery workflow; do not claim submissions are recorded. |
| DUCK-37 | Project structure, migrations, separated Supabase domains | En développement | Next.js/Supabase clients and split SQL directories exist | Only one project URL is configured; establish Auth/platform separation and trusted cross-project JWT validation before data CRUD. |
| DUCK-38 | Accessibility, performance, documentation, release quality | En développement | `npm run type-check` and Vercel production build pass; docs updated | No automated test suite, accessibility audit, load test, or full auth E2E test. Add these gates by phase. |

## Phased Delivery Plan

1. **Foundation and authorization:** profile/admin migrations, founder role, and audited profile RPC are implemented; verify member/admin boundaries in a fresh session.
2. **Identity and profiles:** test the full email flow; add member self-service profile editing, privacy preferences, account export/delete, and session security.
3. **Platform project and content administration:** create/configure the separate platform Supabase project; validate DuckAuth tokens there; implement software catalog admin CRUD with RLS and audit history.
4. **Community core:** posts, comments, reactions, groups, servers, moderation and privacy-aware discovery.
5. **Communication:** private messaging, protected attachments, notifications, then calls only after signaling/TURN is configured.
6. **Product domains:** events, learning, media, contests/points, themes, support and search, each backed by real storage and server-side authorization.
7. **Quality and launch:** automated tests, accessibility/performance/security reviews, legal review, backup/restore drills and staged production rollout.

## Immediate Blockers

- Supabase CLI is unavailable; the configured project's migrations were applied through the authenticated SQL Editor.
- The second, platform Supabase project and its trusted Auth-token validation are not configured.
- The founder must sign in again to refresh the admin claim in the browser session.
- The visual-editor migration `supabase/duckauth/migrations/202611070005_visual_site_editor.sql` must be applied to the Supabase project used by `NEXT_PUBLIC_SUPABASE_URL` before publication of theme changes.
