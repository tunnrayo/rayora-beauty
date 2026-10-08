"use client";

import { usePathname } from "next/navigation";

/** Shows the shop header, footer, chat and visit tracking on shop pages only, not in the admin area. */
export default function SiteChrome({
  header,
  footer,
  extras,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  extras: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      {header}
      <main>{children}</main>
      {footer}
      {extras}
    </>
  );
}
