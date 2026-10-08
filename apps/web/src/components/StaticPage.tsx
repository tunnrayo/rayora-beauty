export default function StaticPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-cocoa [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-charcoal [&_a:not(.btn-primary)]:underline [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
