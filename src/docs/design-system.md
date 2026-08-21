# Design System

The Identity design system is characterized as **Monochrome Premium SaaS**.

## Core Tenets
- **Colors**: Strictly Black, White, and Grays (`oklch` scale). Semantic colors are restricted solely to danger/success indicators.
- **Typography**: Geist and Geist Mono.
- **Shapes**: Soft shadows, thin borders, and exactly `12px` border radius (`0.75rem`).
- **Whitespace**: Highly emphasized paddings and large whitespace.

## Implementation
All UI elements are implemented as reusable components in `src/components/ui/` built upon Shadcn UI and customized Tailwind CSS v4 variables in `src/styles/globals.css`.
