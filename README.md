# TaskFlow ⚡

A dark, sleek task management app built with **Next.js 14**, **TypeScript**, **Supabase**, and **shadcn/ui**.

## Features

- **Multiple Task Lists** — Create and manage separate lists (Work, Personal, Projects, etc.)
- **Rich Task Fields** — Title, description, priority, status, and categories with intuitive form dialog
- **Interactive Due Date Picker** — Calendar popup with time selection and visual disabled date styling
- **Drag & Drop Reordering** — Powered by `@dnd-kit`
- **Calendar View** — Visual timeline of tasks by due date
- **Filtering & Search** — Filter by priority, status, category, overdue; full text search
- **Smart Sorting** — Sort by due date, priority, title, creation date, or manual order
- **Push Notifications** — Browser push for due & overdue tasks via Service Worker
- **User-defined Categories** — Create, color-code, and manage categories per list
- **Delete Confirmations** — Safe deletion with confirmation dialogs for tasks, lists, and categories

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, SPA export) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| State | Zustand (with localStorage persistence) |
| Drag & Drop | @dnd-kit |
| Animations | Framer Motion |
| Date Picker | react-day-picker with Radix UI Popover |
| Notifications | Web Push API + Service Worker |

---

## Getting Started

### 1. Clone & install dependencies

```bash
git clone <your-repo>
cd taskflow
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open **Database → SQL Editor** and run the entire contents of `supabase/schema.sql`
3. Go to **Project Settings → API** and copy your **Project URL** and **anon key**

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## User Experience Features

### Calendar Date Picker
When creating or editing a task, click the **Due Date** field to open an interactive calendar:
- **Navigate months** using forward/back arrows
- **Select any date** for the future or today
- **Set time** with hour/minute inputs
- **Past dates** are visually disabled (grey background) with a hover icon to prevent accidental selection
- **Clear button** to remove the due date

### Delete Confirmations
All destructive operations show confirmation dialogs:
- **Delete Task** — Confirm before removing individual tasks
- **Delete List** — Confirm before removing a list and all its tasks
- **Delete Category** — Confirm before removing a category (tasks become uncategorized)

Each dialog shows what will be deleted and cannot be undone.

---

## Push Notifications

Notifications use the **Web Push API** with a Service Worker (`public/sw.js`).

1. Click **Notifications** at the bottom of the sidebar
2. Click **Enable** and grant browser permission
3. Configure the reminder window (15 min, 30 min, 1 hour, etc.)
4. Toggle overdue task notifications on/off

> **Note:** Push notifications only work in browsers that support the Notification API (Chrome, Edge, Firefox). Safari has limited support.

---

## Project Structure

```
src/
├── app/
│   ├── globals.css       # Dark theme CSS variables
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main SPA page
├── components/
│   ├── ui/               # Primitive UI components (Button, Input, Dialog…)
│   │   ├── date-picker.tsx            # Calendar popup with time selection
│   │   ├── delete-confirmation-dialog.tsx # Safe delete confirmation UI
│   │   └── popover.tsx                # Radix UI popover wrapper
│   ├── lists/
│   │   └── Sidebar.tsx   # List navigation + notification settings + delete dialogs
│   ├── tasks/
│   │   ├── TaskCard.tsx              # Individual task card with DnD + delete confirmation
│   │   ├── TaskFormDialog.tsx        # Create/edit task modal with calendar date picker
│   │   ├── TaskListView.tsx          # List view with filters + DnD context
│   │   └── CategoryManager.tsx       # CRUD for categories + delete confirmation
│   ├── calendar/
│   │   └── CalendarView.tsx    # Month calendar with task dots
│   └── Header.tsx         # Top bar with view switcher
├── hooks/
│   ├── useTasks.ts        # Task CRUD + filtering
│   ├── useLists.ts        # List CRUD
│   ├── useCategories.ts   # Category CRUD
│   └── useNotifications.ts # Push notification logic
├── lib/
│   ├── supabase.ts        # Supabase client
│   ├── db.ts              # Data access layer (all DB queries)
│   └── utils.ts           # Helpers, priority config, color palette
├── store/
│   └── index.ts           # Zustand global state
└── types/
    └── index.ts           # All TypeScript interfaces
```

---

## Adding Authentication (Optional)

This app ships without auth for quick setup. To add Supabase Auth:

1. Enable RLS in `supabase/schema.sql` (lines at the bottom)
2. Add auth policies per table
3. Wrap the app in `<SessionContextProvider>` from `@supabase/auth-helpers-nextjs`
4. Gate the UI behind a login page

---

## Building for Production

```bash
npm run build
```

The `output: 'export'` in `next.config.js` generates a static site in `out/` — deploy anywhere (Vercel, Netlify, S3, GitHub Pages).

For Vercel (recommended):
```bash
npx vercel
```

---

## Customization

- **Colors**: Edit HSL values in `src/app/globals.css` under `:root`
- **Fonts**: Change Google Font imports in `globals.css` and `--font-display`
- **Priority colors**: Edit `PRIORITY_CONFIG` in `src/lib/utils.ts`
- **List icon set**: Edit `LIST_ICONS` array in `src/lib/utils.ts`
