# Wings of Power dashboard — plan

Teacher and Admin web app. Student and Parent surfaces are outside this plan. Parent accounts, invites, and Parent Corner stay out.

This folder has no application source (`package.json`, `app/`, `src/` are absent). `.cursor/rules/dashboard.mdc` tells agents to wait for a boilerplate. There is nothing to follow, so this plan **is** the stack. [T-DASH-001](tasks/T-DASH-001.md) records it in `dashboard.mdc` after the scaffold exists. Later tasks follow that rule and this file. They do not add a second framework, state library, or API client.

Sources, in the order in [AGENTS.md](../../AGENTS.md):

1. `design/screens/teacher/**` and `design/screens/admin/**`
2. [docs/DECISIONS.md](../../docs/DECISIONS.md)
3. [docs/context/*](../../docs/context/)
4. Assumptions go into `docs/DECISIONS.md` **before** the task that needs them is coded

Screen list: [docs/SCREEN_INVENTORY.md](../../docs/SCREEN_INVENTORY.md). HTTP contract: [docs/API.md](../../docs/API.md). Module priorities: [docs/MODULE_MAP.md](../../docs/MODULE_MAP.md).

Colors below were sampled from the admin dashboard and staff-list PNGs (3200px-wide exports). `design/assets_export/` has no image files and no token export.

## Build order

| Step | Tasks | What lands |
|------|--------|------------|
| 1. Foundation | [001](tasks/T-DASH-001.md) [002](tasks/T-DASH-002.md) [003](tasks/T-DASH-003.md) | App, tokens, shell, generated API client, session and guards |
| 2. Shared UI | [004](tasks/T-DASH-004.md) [005](tasks/T-DASH-005.md) | Table, forms, dialogs, toasts, badges, empty / error / loading |
| 3a. Admin | [006](tasks/T-DASH-006.md) through [014](tasks/T-DASH-014.md) | Auth screens, then each admin feature |
| 3b. Teacher | [015](tasks/T-DASH-015.md) through [020](tasks/T-DASH-020.md) | Home, classes and students, chapter quizzes, profile and settings, Safe Space list, points |
| Later | [021](tasks/T-DASH-021.md) [022](tasks/T-DASH-022.md) | Kindness Corner (blocked) and game-show question packs (P1) |

One task at a time. A task touches only the files it lists, plus its own Status and Notes when it finishes.

## Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js App Router, TypeScript strict |
| Package manager | npm |
| Style | Tailwind CSS and shadcn/ui. Override shadcn’s default neutral theme with the tokens in this plan |
| Server state | TanStack Query |
| Tables | TanStack Table |
| Forms | react-hook-form, zod, `@hookform/resolvers` |
| HTTP | `openapi-typescript` + `openapi-fetch`, wrapped so callers see `data` from `{ success, message?, data? }` |
| Charts | Recharts, added in [T-DASH-007](tasks/T-DASH-007.md) when the first chart ships. One chart library |
| Tests | Vitest and Testing Library |
| Auth library | None. Session is the small module in T-DASH-003 |

Versions are whatever `create-next-app` and `shadcn` install on the day T-DASH-001 runs. That task writes the exact versions into its Notes. Later tasks do not upgrade them.

Env: `NEXT_PUBLIC_API_URL` pointing at the Nest API (global prefix `/api`, Swagger at `/api/docs`). Commit `.env.example` only.

## Folder structure

```
wings_of_power_dashboard/
├── docs/
│   ├── PLAN.md
│   └── tasks/T-DASH-###.md
├── public/auth/                  hero crop used by the auth layout
├── src/
│   ├── app/
│   │   ├── layout.tsx            root: fonts, QueryClient, toaster
│   │   ├── (auth)/               sign-in, sign-up, verify, reset, accept-invite
│   │   └── (dashboard)/
│   │       ├── layout.tsx        shell + role guard
│   │       ├── admin/...
│   │       └── teacher/...
│   ├── components/
│   │   ├── ui/                   shadcn primitives
│   │   ├── layout/               sidebar, topbar, nav config
│   │   ├── data-table/
│   │   └── feedback/             empty, error, loading, status badge
│   ├── features/
│   │   ├── auth/
│   │   ├── admin/{dashboard,staff,students,classes,stories,points,safe-space,game-show}/
│   │   └── teacher/{dashboard,classes,students,quizzes,profile,settings,safe-space,points,game-packs}/
│   └── lib/
│       ├── api/                  generated types, fetch client, query helpers
│       ├── auth/                 token storage, session provider
│       └── utils.ts
```

A feature folder holds its pages’ components, zod schemas, and query hooks. Route files under `src/app` stay thin and import from `src/features`. Shared pieces live in `components/`, not copied into each feature.

## Design tokens

Sampled from `design/screens/admin/dashboard/Dashboard.png` and `design/screens/admin/staff_management/Staff list.png`. T-DASH-002 puts these in `globals.css` as shadcn CSS variables and checks them against the teacher dashboard, which uses the same chrome.

| Token | Value | Where it shows |
|-------|--------|----------------|
| `sidebar` | `#150901` | Left rail, and the auth form panel |
| `background` | `#F5F5F5` | Page behind the cards |
| `card` | `#FFFFFF` | Cards, table, top bar |
| `foreground` | `#101830` | Headings and table text |
| `muted-foreground` | `#485070` | Secondary lines |
| `primary` | `#E87532` | Page title, active nav label, primary buttons (`#E87030` on the invite button; use `#E87532`) |
| `primary-foreground` | `#FFFFFF` | Label on orange buttons |
| `sidebar-accent` | `#FFFFFF` | Active nav pill |
| `sidebar-accent-foreground` | `#E87532` | Label inside that pill |
| `destructive` | `#C3333F` | Logout outline (nearby sample `#A82D36`, inactive badge `#E83848`) |
| `success` | `#18B030` | Active, Published, Addressed |
| `info` | `#1858A8` | Invitation sent, New |
| `chart-1` | `#F89050` | Reading / quiz bars |
| `chart-2` | `#9060F8` | Listening bars |
| `border` | `#E0E0E0` | Hairline dividers and input borders |

Sidebar ink runs about 280 CSS pixels wide when the 3200px export is treated as 2×. Match the screenshot proportion in the shell.

Type is one sans on every screen. The PNGs do not name the family. T-DASH-002 writes **Inter** into `docs/DECISIONS.md` before applying it, as the dashboard sans, and loads only that family.

Shape, matched by eye from the same PNGs: white cards on the gray page, a white rounded pill for the active nav item, orange buttons with a moderate radius, inputs with a light border. Auth screens are a full-viewport split (illustration left, `#150901` form right). The tablet bezel in the sign-in export is frame chrome, so the page does not draw a device.

## Layout

Two layouts.

**Auth layout** (`(auth)`). Split page from `design/screens/admin/signin_&_signup/`. T-DASH-006 builds it. T-DASH-002 builds the authenticated shell only.

**Dashboard shell** (`(dashboard)`). Same chrome for Teacher and Admin. The nav config changes with the role.

Admin sidebar, from `design/screens/admin/dashboard/Dashboard.png`:

| Label on the screenshot | Route | Task |
|-------------------------|--------|------|
| dashboard | `/admin` | 007 |
| User Management | `/admin/users/staff` (tabs: Staff, Students, Pending Approvals) | 008, 009 |
| Classes | `/admin/classes` | 010 |
| Storie | `/admin/stories` | 011. Keep the screenshot spelling |
| Badges & Points | `/admin/points` | 012 |
| Game Show Activity | `/admin/game-show` | 014 |
| Safe Space Reports | `/admin/safe-space` | 013 |
| Analytics | no route | Painted, disabled. No page |
| Settings | no route | Painted, disabled. No page |
| Logout | `POST /api/auth/logout` | 003, 006 |

Teacher sidebar, from `design/screens/teacher/dashboard/Dashboard.png` and the settings screens:

| Label | Route | Task |
|-------|--------|------|
| dashboard | `/teacher` | 015 |
| Classes | `/teacher/classes` | 016 |
| Students | `/teacher/students` | 016 |
| Safe Space Reports | `/teacher/safe-space` | 019 |
| Points & Badges | `/teacher/points` | 020 |
| Stories & Questions | `/teacher/game-packs` | 022 (P1). Until that task, the item is visible and disabled |
| Profile | `/teacher/profile` | 018 |
| Settings | `/teacher/settings` | 018 |
| Logout | `POST /api/auth/logout` | 003 |

Chapter quizzes (decision A4, task 017) are a teacher feature with no sidebar frame of their own. Entry is `/teacher/chapters/[chapterId]/quiz` from the class student flow’s story list once [T-DASH-017](tasks/T-DASH-017.md) adds the list contract. They do not replace the Stories & Questions wizard.

Top bar, on every authenticated page: orange page title, search field whose placeholder is “Search students…”, bell with a count badge, circular initial, display name. The bell has no staff notifications endpoint in `docs/API.md`, so T-DASH-002 draws it and leaves it without a destination. The search field navigates to that role’s student list with a `q` query. It does not call a global search route.

Teacher week displays are Monday–Friday (decision 6).

## Auth and session

Staff share one sign-in screen (`admin.sign_in`: “Sign in with your staff account”). After login the role picks the home route.

| Step | Who | Endpoint |
|------|-----|----------|
| Create account | First admin | `POST /api/auth/admin/register` |
| Email code | Admin | `POST /api/auth/admin/verify-email` |
| School profile, then “You’re All Set” | Admin | `POST /api/auth/school` |
| Sign in | Teacher or Admin | `POST /api/auth/staff/login` → `{ accessToken, user }` role `TEACHER` or `ADMIN` |
| Forgot / set password | Staff | `POST /api/auth/admin/forgot-password`, `POST /api/auth/admin/reset-password` |
| Accept invite | Teacher | `POST /api/auth/teacher/accept-invite` `{ token, password, name }` |
| Hydrate | Either | `GET /api/auth/me` |
| Log out | Either | `POST /api/auth/logout` |
| Change password | Either, from teacher Security | `PATCH /api/auth/password` |

`POST /api/auth/admin/login` stays in the client because the contract lists it. The shared sign-in form calls staff login so a teacher can use the same screen.

Session, written into `docs/DECISIONS.md` by T-DASH-003 before any auth code:

- The Nest response puts `accessToken` in JSON. The dashboard stores it in `sessionStorage` (`wop.accessToken`).
- The sign-in “Remember the device” checkbox stores that same key in `localStorage` instead. The checkbox is client-only. Staff login’s body stays `email` and `password`, matching API.md.
- The fetch client sends `Authorization: Bearer`.
- Reload calls `GET /api/auth/me`.
- There is no refresh-token route in the contract, so the dashboard does not add one.
- A 401 clears storage and sends the browser to `/sign-in`.
- The `(dashboard)` layout renders nothing until `me` resolves, then redirects. Middleware only sends `/` to `/sign-in`, because it cannot read `sessionStorage`.

Guards:

| Session | May open |
|---------|----------|
| None | `(auth)` routes only |
| `ADMIN` | `/admin/**` and auth routes. `/teacher/**` redirects to `/admin` |
| `TEACHER` | `/teacher/**` and auth routes. `/admin/**` redirects to `/teacher` |
| Any other role | Sign-in. Parent is not a destination |

School profile is an authenticated admin page (`/onboarding/school`) between verify and `/admin`.

## API client

`docs/API.md` is the contract until a generated document exists. The backend plan is `GET /api/docs` plus a future `yarn openapi:export` that writes `docs/openapi.json` at the repo root.

T-DASH-003 adds `npm run openapi:generate`, which reads `WINGS_OPENAPI_PATH` or `../docs/openapi.json`, and can also fetch `${NEXT_PUBLIC_API_URL}/docs-json` when the API is running. Output: `src/lib/api/schema.ts`. The generator fails with a clear message when both sources are missing. It does not commit a hand-written OpenAPI stand-in.

The wrapper:

- Unwraps `{ success, message, data }`. Callers receive `data`.
- Sends the bearer token.
- Lists use `page` and `perPage` and read `{ items, total, page, perPage, lastPage }`.
- Maps `400` onto form errors, `401` onto session clear, `403` onto the error state, `409` and `422` onto the `message` string.

Feature tasks add response fields the screenshot shows, in `docs/API.md`, before coding the page. They add a route only when the screenshot has an action and the contract has no way to perform it (story delete, teacher story list, and the sessions panel are the known cases). Each of those is called out in its task.

## Shared UI (step 2)

**Data table** (004). TanStack Table. Text search, a filter slot the feature fills, footer “Showing 1–12 of 80”, and page control “1 / 7”. Props accept the contract’s pagination object. Row action menu is a slot. The component is generic. Feature tasks pass columns.

**Forms, dialogs, toasts, badges, states** (005).

- Forms: shadcn Form, react-hook-form, zod. Primary action on the right, Cancel as a gray button, matching Create Class and Security.
- Dialogs: shadcn Dialog, used for invite, create class, generate-code success, change teacher, move class, review request, reactivate.
- Toasts: sonner, bottom-right, check icon, title plus one line. Reference: `design/screens/admin/staff_management/Toast.png` (“Invitation Sent”).
- Status badges: Active and Published (`success`), Inactive (`destructive`), Invitation sent and New (`info`), Pending and Reviewing (`primary`), Draft (neutral), Expired (destructive tint), Addressed (`success`).
- Empty, error, and loading: text empty state inside the table or card, error state with the envelope `message` and a retry, skeleton rows and skeleton cards. The exports do not include a dedicated empty illustration, so these states stay typographic.

## Routes

```
/sign-in
/sign-up
/verify-email
/forgot-password
/reset-password
/accept-invite
/onboarding/school

/admin
/admin/users/staff
/admin/users/staff/[id]
/admin/users/students
/admin/users/students/[id]
/admin/users/pending
/admin/classes
/admin/classes/[id]
/admin/classes/requests
/admin/classes/renewals
/admin/stories
/admin/stories/new
/admin/stories/[id]
/admin/points
/admin/safe-space
/admin/safe-space/[id]
/admin/game-show
/admin/game-show/[id]

/teacher
/teacher/classes
/teacher/classes/[id]
/teacher/students
/teacher/students/[id]
/teacher/safe-space
/teacher/points
/teacher/profile
/teacher/settings
/teacher/chapters/[chapterId]/quiz
/teacher/game-packs                  P1, task 022
/teacher/game-packs/new              P1, task 022
```

Create class, invite, move class, change teacher, and generate-code are dialogs on these routes, matching the screenshots.

## Admin features

### 006 — Sign in and sign up

Screens under `design/screens/admin/signin_&_signup/`, except `Sign Up.png` (junk crop). Flow: create account → email code → sign in → school profile → ready. Forgot password and set-new-password are the other two forms. Teacher arrival is `/accept-invite`, not a second registration form.

### 007 — Admin home

`design/screens/admin/dashboard/Dashboard.png`. `GET /api/admin/dashboard`. KPI cards, Mon–Fri reading/listening chart, story completion, quiz completion, story overview, need-attention rows (class requests, student approvals, Safe Space), top students, student donut, recent activity. The donut on the screenshot sums past 100% (74 + 55). Display the API figures. Deep links go to tasks 009, 010, 011, and 013.

### 008 — Teachers and staff

`design/screens/admin/staff_management/` except treating the toast as the shared toast. List columns: Staff, Contact, ID, Role, Assigned Class, Students, Status, Action. Tabs Staff / Students / Pending Approvals live in the user-management header. Actions: view profile, edit, send reminder, reactivate, invite. Invite fields include the Safe Space permission checkbox (`canAccessSafeSpace` on `POST /api/admin/staff/invite`).

The Role column shows “Counselor”. The contract’s staff roles are `TEACHER` and `ADMIN`, plus that permission flag. T-DASH-008 writes this proposed default into `docs/DECISIONS.md` before coding: a teacher with `canAccessSafeSpace` is labeled Counselor; a teacher without it is labeled Teacher. No Counselor enum is added.

### 009 — Students

`design/screens/admin/user_management/`. List columns: Student, ID, Class, Positive Points, Progress, Reports, Status, Action. Statuses Active, Pending, Inactive. Pending Approvals is the third tab and calls `POST /api/admin/students/:id/approve`. Detail tabs and the inactive / pending variants are the Details screenshots. Move class is the modal (`POST .../move-class`). Reactivate is `PATCH` status back to `ACTIVE`.

### 010 — Classes

`design/screens/admin/classes/`. List: Class, Grade, Age Group, Code, Assigned Teacher, Students, Status, Class Created, Action. Expired codes use the Expired badge. Create dialog fields: Class Name, Grade, Age Group, Assigned Teacher, then “Create & Generate Code”, then the code dialog (copy / share). Change teacher is its own dialog. Class requests and the review dialog (Reject, Approve & Generate Code) are `/admin/classes/requests`. Renewal is `/admin/classes/renewals` (`POST /api/admin/code-renewals/:id/approve`).

The create dialog’s age example is “6-9 years”. The table art also shows bands such as 5–6, 7–10, 9–12, 14–17. Decision 2 locks **content** bands at 6–9, 10–13, and adults. T-DASH-010 logs that table conflict in `docs/OPEN_QUESTIONS.md` with this proposed default: the create control offers those three bands, and the table prints `ageGroup` as the API sent it. The search placeholder “Search by class or play mode” is leftover wording. The field searches class name, grade, code, and teacher. The page subtitle “Manage school staff access.” is staff-page copy sitting on the classes screenshot. Use a classes subtitle taken from the page title area only after the task logs the copy clash; the proposed default subtitle is “Manage classes, join codes, and teacher assignment.”

`Class Details.png` disagrees with itself (header versus detail card). `Expired Class Code Renewal Requests` shows a Grade 3 request resolving to a Grade 4 code. Both go in `docs/OPEN_QUESTIONS.md`. The UI renders the class the API returns.

### 011 — Stories and books

`design/screens/admin/storie/Storie.png` and `Storie-1.png`. Library columns: cover, title, author, chapter count, age group, status, updated, actions (publish, edit, delete). Age filter: All, 6–9, 10–13, adults (decision 2). The repeated author “12” and chapter “04” on the export are placeholder cells. Show API values.

Editor (`/admin/stories/new` and `/admin/stories/[id]`) has no frame of its own. It edits what the upload flow in API.md allows: story metadata, age group, chapters, page images, chapter audio, publish. Uploads go to `POST /api/uploads` with `STORY_COVER`, `PAGE_IMAGE`, or `CHAPTER_AUDIO`. Teachers do not upload this media.

The trash icon needs `DELETE /api/admin/stories/:id`. Database soft-delete already covers Story. T-DASH-011 adds that route to `docs/API.md` before wiring the button.

The Kindness Corner tab is visible and disabled until task 021.

### 012 — Points and badges

`design/screens/admin/badges_&_points/Points & Badges.png`. Three rule inputs from decision D8 and the screenshot: story points 1 per question, kindness points 50 per round, teacher award 5. Six badges: Kindness Champion, Story Explorer, Game Show Ready, Helping Hand, Speak Up, Positive Leader. History table underneath. `GET/PATCH /api/admin/point-rules` and `GET/PATCH /api/admin/badges`. Threshold copy stays what the screenshot and the saved rule say. The history category “Game Points” is displayed when the ledger returns it. It does not add a fourth rule input.

### 013 — Safe Space reports

`design/screens/admin/safe_space_reports/`. Filters New, Reviewing, Addressed. Detail: narrative, feel-safe, assignee, status change, add note, change teacher. Endpoints under `/api/admin/safe-space/reports`. Notes are staff notes. Report body stays the student fields in the contract (category, body ≤ 200, feelSafe).

### 014 — Game-show activity and match details

`design/screens/admin/game_show_activity/`. Rules on the page: required stories 2, chapters 6, minimum 70% (decision D2). Edit rule uses `GET/PATCH /api/admin/game/eligibility-config`. History uses `GET /api/admin/game/matches`. Detail (`Match Details.png`, `Match Details-1.png`) is 1v1 and 5v5 from `GET /api/admin/game/matches/:id`. The repeated student name on those PNGs is placeholder art. Render the participants in the payload.

## Teacher features

### 015 — Dashboard home

`design/screens/teacher/dashboard/Dashboard.png`. `GET /api/teacher/dashboard`. Cards: Safe Reports, Flagged Responses, Pending Student, Game Eligible Students. Leaderboard, Mon–Fri quiz chart, class progress, reports-and-approvals table, recent awards. “Flagged Responses / criteria not configured” displays the API count. Eligibility numbers come from the eligibility rule in task 014. They are not a second rule.

The leaderboard art still uses hero characters. Decision 5 is the locked correction: student avatar, student name, and game-edition kindness points. T-DASH-015 follows decision 5 for that widget and says so in its Notes.

### 016 — Classes and students

Class list, class detail (overview / progress / students), and the join-request dialog are the frames that are real product crops:

- `design/screens/teacher/classes/Frame 2147259561.png`
- `design/screens/teacher/classes/Frame 2147259576.png` and `-1` `-2` `-3`
- `design/screens/teacher/classes/Frame 2147259604.png` (Mina Kapoor approve / decline)

Roster crop: `design/screens/teacher/srudents/Frame 2147259589.png`.

Chrome slices and the Jonah Levy frames under `srudents/` are junk (see the register). The teacher student detail page uses `GET /api/teacher/students/:id` inside the teacher shell. It does not reproduce the admin profile tabs from that misfile.

Join approve / reject: `POST /api/teacher/join-requests/:id/approve|reject`. A class has one teacher. A teacher with several classes can switch class (decision D12). The switcher reads `GET /api/teacher/classes`.

### 017 — Quiz upload and edit

This is the chapter quiz CMS. Decision A4 and `PUT /api/teacher/chapters/:chapterId/quiz` (also `GET`). Questions are for that chapter’s story. The teacher does not upload page images or audio here.

The Stories & Questions PNGs are a four-round **game** wizard (age group, stories, MCQ / written rounds). Inventory status: ambiguous, game-builder. They belong to task 022, not this task.

There is no chapter-quiz screenshot and no teacher story-list route. T-DASH-017 adds `GET /api/teacher/stories` to `docs/API.md` first (published stories with chapter id and title, no media fields), then builds a picker plus the quiz editor at `/teacher/chapters/[chapterId]/quiz`.

### 018 — Profile and settings

Profile: `design/screens/teacher/profile/Dashboard.png`. `GET/PATCH /api/teacher/profile`.

Settings: `design/screens/teacher/settings/Dashboard.png` through `Dashboard-5.png`. Tabs Account, Notification, Preferences, Security. Account and the notification / preference controls that fit `GET/PATCH /api/teacher/settings` are in this task. Password is `PATCH /api/auth/password` (current, next, confirm on the client).

`Dashboard-5.png` is Active Sessions (device, browser, location, sign-out). API.md has no session list or revoke route. T-DASH-018 adds that gap to `docs/OPEN_QUESTIONS.md` and leaves the sessions panel out of the build. Proposed default, written in that entry: ship Security as the password form only, until a session contract exists.

### 019 — Safe Space list

`design/screens/teacher/safe_space_reports/Dashboard.png` through `Dashboard-3.png`. Filters All / New / Reviewing / Addressed, privacy banner, `GET /api/teacher/safe-space/reports` scoped to the teacher’s classes. The inventory says there is no teacher detail page. This task does not add one. Detail and private notes stay on the admin detail page (013) and on the P1 teacher endpoints, which have no screen.

### 020 — Points and badges

`design/screens/teacher/points_&Padges/Frame 2147259733.png` and `-1` `-2` (Award, Monitor, History). Award categories in steps of 1 through 5, `POST /api/teacher/points/award`. History `GET /api/teacher/points/history`. Badge matrix `GET /api/teacher/badges/monitor`. The Container and Frame 1457 files in that folder are chrome slices and stay unused.

## Junk register

Checked against [SCREEN_INVENTORY.md](../../docs/SCREEN_INVENTORY.md) and the local PNG tree. These do not get routes, components, or tasks.

### Figma frames named in the brief as UI-kit leftovers

| Frame | What is in the repo | Plan |
|-------|---------------------|------|
| Arrows | `design/screens/teacher/stories_&_questions/Linear/Arrows/Arrow Right.png` and the same file under `game_questions/`. Inventory `teacher.stories_icon`: junk icon | Junk |
| Arrows Action | No PNG, no inventory row | Junk icon set |
| Like | No PNG, no inventory row | Junk |
| Notes | No screen with this name. Admin report “Add Note” is an action on `admin.safe_space_detail` and stays in task 013 | The kit frame is junk |
| Settings Fine Tuning | No PNG. Teacher settings are `teacher/settings/Dashboard*.png` and stay in task 018. Admin Settings has no screenshot | The kit frame is junk |
| School | No icon PNG. School onboarding is `signin_&_signup/Dashboard-5.png` and `Dashboard-6.png` (`admin.school_profile`) and stays in task 006 | The kit frame is junk |
| Users | No icon PNG. User Management is the staff and student screens and stays in tasks 008 and 009 | The kit frame is junk |
| Home V1 / Home V2 | No inventory row and no local file | Junk kit dashboards. Product homes are `admin/dashboard/Dashboard.png` and `teacher/dashboard/Dashboard.png` |
| 04 Dashboard - Light | No inventory row and no local file | Junk kit page |

### Inventory junk already on disk

| screen_id | Path | Why it is junk |
|-----------|------|----------------|
| `teacher.stories_icon` | `stories_&_questions/Linear/Arrows/Arrow Right.png` | Icon |
| `teacher.game_questions_duplicate` | `teacher/game_questions/**` | Byte-duplicate of `stories_&_questions` |
| `teacher.classes_chrome` | `teacher/classes/Container*.png`, `Frame 1457*.png`, `Frame 2147259555.png` | Top bar and sidebar slices |
| `teacher.students_chrome` | `teacher/srudents/Container*.png`, `Frame 1457.png`, `Frame 2147259555.png`, `Frame 2147259590*.png` | Chrome, and an admin sidebar misfile |
| `teacher.student_detail_misfile` | `teacher/srudents/Frame 2147259576*.png` | Admin student profile copied into the teacher folder |
| `teacher.points_chrome` | `teacher/points_&Padges/Container*.png`, `Frame 1457*.png` | Chrome slices |
| `admin.sign_up_crop` | `signin_&_signup/Sign Up.png` | Text crop of the words “Sign Up” |

Crops that **are** product, and easy to mistake for junk: `teacher.class_list_fragment`, `teacher.class_detail_fragment`, `teacher.review_join_request`, `teacher.student_roster_fragment`, `teacher.points_badges`. Tasks 016 and 020 use those and ignore the chrome around them.

## Deferred, with no task

| Item | Why |
|------|-----|
| Admin Analytics | Sidebar only. `GET /api/admin/analytics` is P2. D14 |
| Admin Settings | Sidebar only. `GET/PATCH /api/admin/settings` is P2. D14 |
| Teacher Safe Space detail | No screenshot. List is task 019 |
| Parent | Out of scope |
| Student app and the game client | Other projects |

## Conflicts the feature tasks log, and do not guess in UI

| Topic | Where it is handled |
|-------|---------------------|
| Counselor label versus `TEACHER` + `canAccessSafeSpace` | 008, proposed default in DECISIONS |
| Class age bands on the table versus 6–9 / 10–13 / adults | 010, OPEN_QUESTIONS |
| Class details header versus detail card | 010, OPEN_QUESTIONS |
| Renewal screenshot Grade 3 → Grade 4 | 010, OPEN_QUESTIONS |
| Classes search “play mode” and the staff subtitle on the classes page | 010, proposed default in DECISIONS |
| Kindness Corner modal says image on a video field | 021, blocked |
| Stories & Questions screens are a game wizard, while chapter quizzes are decision A4 | 017 versus 022 |
| Teacher settings sessions have no endpoint | 018, OPEN_QUESTIONS |
| Leaderboard art still shows heroes | 015 follows decision 5 |
| Match detail repeats one student | 014 renders the payload |
| Admin donut 74% + 55% | 007 displays API numbers |

## Task index

| ID | Title | Priority |
|----|--------|----------|
| 001 | Scaffold | P0 |
| 002 | Tokens and layout shell | P0 |
| 003 | API client and auth session | P0 |
| 004 | Data table | P0 |
| 005 | Forms, dialogs, toasts, badges, states | P0 |
| 006 | Sign in and sign up | P0 |
| 007 | Admin dashboard | P0 |
| 008 | Teachers and staff | P0 |
| 009 | Students | P0 |
| 010 | Classes | P0 |
| 011 | Stories and books upload | P0 |
| 012 | Points and badges (admin) | P0 |
| 013 | Safe Space reports (admin) | P0 |
| 014 | Game-show activity and match details | P0 |
| 015 | Teacher dashboard | P0 |
| 016 | Teacher classes and students | P0 |
| 017 | Chapter quiz upload and edit | P0 |
| 018 | Teacher profile and settings | P0 |
| 019 | Teacher Safe Space list | P0 |
| 020 | Teacher points and badges | P0 |
| 021 | Kindness Corner | P1, blocked |
| 022 | Game-show question packs | P1 |

## Definition of done (every task)

- Scope matches the task file.
- Only allowed files changed, plus that task’s Status and Notes.
- Any new assumption is in `docs/DECISIONS.md` before the code that depends on it.
- Any design clash is in `docs/OPEN_QUESTIONS.md` with a proposed default, and the code does not pick a side quietly.
- Route or field changes went through `docs/API.md` first.
- No secrets.
- From `wings_of_power_dashboard/`: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- UI tasks: run the app and walk the flow the task names (the user rule for web verification). A single screenshot of the page is not enough.
