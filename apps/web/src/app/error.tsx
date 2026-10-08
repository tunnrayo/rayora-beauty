"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h2 className="text-3xl font-semibold">Something went wrong</h2>
      <p className="mt-3 text-cocoa">Please try again. If the problem continues, message us and we will help.</p>
      <button type="button" onClick={reset} className="btn-primary mt-6">Try again</button>
    </div>
  );
}
