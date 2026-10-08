import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Rayora Beauty collects, uses and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy">
      <p>This policy explains what information Rayora Beauty collects and how we use it.</p>
      <h2>What we collect</h2>
      <p>
        When you order or create an account we collect your name, email, phone number and delivery
        address. We also record basic visit information, such as the pages you view, to improve the store.
      </p>
      <h2>How we use it</h2>
      <ul>
        <li>To process and deliver your orders</li>
        <li>To send order updates by email or WhatsApp</li>
        <li>To improve our products and website</li>
      </ul>
      <h2>Payments</h2>
      <p>
        Payments are handled by our payment provider. We never store your full card details on our servers.
      </p>
      <h2>Your rights</h2>
      <p>
        You can ask us to see, correct or delete the personal information we hold about you. Contact us and
        we will respond promptly. We handle personal data in line with Nigerian data protection law.
      </p>
    </StaticPage>
  );
}
