import { redirect } from "next/navigation";
import Notice from "@/components/Notice";
import { apiCall, requireUser } from "@/lib/session";

export default async function PaymentCallback({ searchParams }: { searchParams: Promise<{ reference?: string; trxref?: string }> }) {
  const params = await searchParams;
  const reference = params.reference ?? params.trxref;
  await requireUser("/account/orders");
  if (!reference) redirect("/account/orders");

  const r = await apiCall<{ orderNumber: string; paid: boolean }>(
    `/payments/paystack/verify?reference=${encodeURIComponent(reference)}`,
    { auth: true }
  );
  if (r.data?.paid) redirect(`/order-confirmation/${r.data.orderNumber}`);
  if (r.data) redirect(`/checkout/pay/${r.data.orderNumber}`);
  return (
    <Notice
      title="We could not confirm your payment"
      message="If money left your account, do not worry. Check your orders in a few minutes, or contact us with your payment reference."
      actionHref="/account/orders"
      actionLabel="View my orders"
    />
  );
}
