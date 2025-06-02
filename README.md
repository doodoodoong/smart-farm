## Common Commands

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Development server runs on http://localhost:3000
```

## Project Architecture

### Core Technologies
- **Next.js 15** with App Router and React 19
- **Firebase** for authentication and real-time database
- **TypeScript** with strict mode enabled
- **Tailwind CSS v4** for styling
- **OpenAI API** for chatbot functionality

### Authentication System
Authentication uses Firebase Auth with email/password and static role mapping in `/src/lib/types.ts`. User roles are hardcoded for demo purposes:

```typescript
// Roles: "student" | "teacher" | "admin"
USER_ROLES: Record<string, UserRole>     // Standard users
STUDENT_NAMES: Record<string, string>    // Student display names
SPECIAL_STUDENT_NAMES: Record<string, string>  // Special education students
```

### Dual Interface Pattern
The application provides two complete interfaces:
- **Standard routes**: `/login`, `/dashboard`, `/learning`, `/growing`
- **Special education routes**: `/special-login`, `/special-dashboard`, `/special-learning`, `/special-growing`

Each special route provides simplified, more accessible versions of the same functionality.

### Firebase Database Structure
```
users/{uid}/
├── plants/              # Plant growth records
├── diaries/            # Observation diary entries
└── role/               # User role (optional)

answers/
├── germination/        # Learning module answers
└── growth/            # Growth condition answers
```

### Component Organization
- **`/src/components/ui/`**: shadcn/ui components (buttons, dialogs, etc.)
- **`/src/blocks/`**: Third-party animated components from reactbits.dev
- **`/src/components/dashboards/`**: Role-based dashboard components
- **`/src/components/auth/`**: Authentication-related components

### Real-time Data Pattern
Components use Firebase real-time listeners with cleanup:

```typescript
useEffect(() => {
  const dataRef = ref(database, `users/${user.uid}/plants`);
  const unsubscribe = onValue(dataRef, (snapshot) => {
    // Handle data updates
  });
  return () => unsubscribe();
}, [user]);
```

### Environment Variables Required
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_DATABASE_URL
OPENAI_API_KEY
```

### Animation Libraries
- **Framer Motion**: Page transitions and component animations
- **GSAP**: Complex interactive animations (primarily in `/blocks/` components)
- **Tailwind CSS**: Utility-based animations and transitions

### Role-Based Dashboard Routing
Dashboard component selection is determined by user email lookup in the static role mappings. The main dashboard page (`/src/app/dashboard/page.tsx`) renders different dashboard components based on the user's role.

### TypeScript Path Mapping
Import aliases are configured with `@/*` pointing to `./src/*` for cleaner imports throughout the codebase.
