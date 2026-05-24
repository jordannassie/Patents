# Patents

A Next.js application configured for deployment on [Netlify](https://www.netlify.com/).

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Netlify

1. Push this repository to GitHub.
2. In the [Netlify dashboard](https://app.netlify.com/), click **Add new site → Import an existing project**.
3. Connect your GitHub account and select the `jordannassie/Patents` repository.
4. Netlify will detect the settings from `netlify.toml` automatically:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Plugin:** `@netlify/plugin-nextjs`
5. Click **Deploy site**.

Alternatively, use the Netlify CLI:

```bash
npm install -g netlify-cli
netlify init
netlify deploy --prod
```

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Netlify Next.js Runtime](https://docs.netlify.com/frameworks/next-js/overview/)
