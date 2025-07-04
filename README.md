# Smart Farm Educational Platform

This project is a Next.js application designed as an educational platform for "smart farming." It provides tailored interfaces for both standard and special education students to learn about plant growth, observe their virtual plants, and interact with educational content.

## Core Technologies

- **Framework**: [Next.js](https://nextjs.org/) 15 (with App Router)
- **UI Library**: [React](https://react.dev/) 19
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Authentication and Realtime Database)
- **AI Chatbot**: [OpenAI API](https://openai.com/)
- **Charting**: [Recharts](https://recharts.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/)

## Getting Started

### Prerequisites

- Node.js (v20 or later recommended)
- npm or a compatible package manager
- Firebase project setup

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd smart-farm
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables. Create a `.env.local` file in the root of the project and add the required Firebase and OpenAI API keys:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
    OPENAI_API_KEY=your_openai_api_key
    ```

### Running the Development Server

To start the development server (with Turbopack):
```bash
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Creates a production-ready build.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.

## Project Architecture

### Dual Interface for Accessibility

The application features a unique dual-interface system to cater to different learning needs:
- **Standard Routes**: Located at `/login`, `/dashboard`, `/learning`, etc.
- **Special Education Routes**: Simplified and more accessible versions located at `/special-login`, `/special-dashboard`, etc.

### Authentication

Authentication is handled by Firebase Auth. User roles (`student`, `teacher`) are statically mapped in `/src/lib/types.ts` for this demonstration version.

### Directory Structure

- **`src/app/`**: Contains all pages and routes, following the Next.js App Router structure. Includes separate directories for standard and special education routes.
- **`src/components/`**: Reusable React components.
    - `ui/`: Components from shadcn/ui.
    - `dashboards/`: Role-specific dashboard components.
    - `auth/`: Authentication-related components.
- **`src/blocks/`**: Contains more complex, third-party animated components.
- **`src/lib/`**: Core utility functions, Firebase configuration (`firebase.ts`), API helpers, and type definitions (`types.ts`).
- **`public/`**: Static assets like images, videos, and SVGs.

### Firebase Realtime Database

The database stores user-specific data, including plant growth records and observation diaries. Components subscribe to real-time updates from Firebase to ensure the UI is always in sync.

```
/users/{uid}/
  ├── plants/      # Plant growth data
  └── diaries/     # Observation diary entries

/answers/
  ├── germination/ # Learning module answers
  └── growth/      # Growth condition answers
```