import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Rayora Beauty for shade help, order questions and delivery support.",
};

export default function ContactPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return (
    <StaticPage title="Contact us">
      <p>We are happy to help with shade advice, order questions and delivery updates.</p>
      {whatsapp ? (
        <p>
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello Rayora Beauty, I need some help.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary no-underline"
          >
            Chat with us on WhatsApp
          </a>
        </p>
      ) : (
        <p>Our contact details will be added here shortly.</p>
      )}
      <h2>Support hours</h2>
      <p>Monday to Saturday, 9am to 6pm, West Africa Time.</p>
    </StaticPage>
  );
}
