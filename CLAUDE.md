# EvalTrust Project Context

## Project Overview
EvalTrust is a premium hackathon evaluation platform built with React, Vite, and Supabase. It features high-fidelity UI animations (Framer Motion, Spline) and a focus on "transparency" and "trust" in the evaluation process.

## Build & Development
- **Dev Server**: `npm run dev`
- **Production Build**: `npm run build`
- **Linting**: `npm run lint`

## Tech Stack
- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS + custom UI components in `src/components/ui`
- **Animations**: Framer Motion, Three.js (@react-three/fiber), Spline
- **Backend**: Supabase (Auth, DB, Storage)
- **Utilities**: Lucide Icons, QR Code generation (qrcode.react)

## Coding Standards
- **Style**: Functional components with hooks.
- **UI**: Use the "Atomic" UI library components (`Button`, `Card`, `Badge`, `Input`) located in `src/components/ui`.
- **Aesthetics**: Maintain a "Premium SaaS" look with dark/light mode compatibility, subtle gradients, and micro-animations.
- **Naming**: PascalCase for components, camelCase for variables/functions.
- **Logic**: Prefer Supabase for data fetching. Handle loading and error states explicitly.

## Project Structure
- `src/components/ui`: Core UI design system.
- `src/pages`: Main application screens.
- `src/supabase`: Supabase client configuration.
- `src/components/dashboard`: Feature-specific components.
