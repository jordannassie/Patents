export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 px-8 py-32 text-center">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            Next.js on Netlify
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
            Patents
          </h1>
          <p className="mx-auto max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A modern patent research app, deployed with the Netlify Next.js
            runtime.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            className="flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            href="https://github.com/jordannassie/Patents"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
          <a
            className="flex h-12 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            href="https://docs.netlify.com/frameworks/next-js/overview/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Netlify Docs
          </a>
        </div>
      </main>
    </div>
  );
}
