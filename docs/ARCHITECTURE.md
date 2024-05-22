# Architecture

evm.codes is a [NextJS](https://nextjs.org/) and [TailwindCSS](https://tailwindcss.com/) backed React application. It communicates with a backend that is currently closed source. It's written in TypeScript and uses the latest ES6 language features.

Below is the structure of the app:

```
app
├── components  - React components used throughout the application
|───── layouts  - Layout components
|───── ui       - Reusable UI components
├── context     - Shared React Contexts for the application-wide state
├── docs        - Documentation and MDX files used in the reference table
├── lib         - Common libraries and reusable React hooks
├── pages       - NextJS pages and server-side API routes
├── public      - Public static assets
├── styles      - Global CSS styles
├── types       - TypeScript type definitions
└── utils       - Utility methods
```
