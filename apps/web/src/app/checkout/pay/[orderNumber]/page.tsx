import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import OrderDetail from "@/components/OrderDetail";
import PayButton from "@/components/PayButton";
import { formatKobo } from "@/lib/format";
import { apiCall, requireUser, type Order } from "@/lib/session";

export const metadata: Metadata = { title: "Review and pay" };

export default async function PayPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  await requireUser(`/checkout/pay/${orderNumber}`);
  const [order, config] = await Promise.all([
    apiCall<Order>(`/orders/${orderNumber}`, { auth: true }),
    apiCall<{ mode: "demo" | "paystack" }>("/payments/config"),
  ]);
  if (!order.data) notFound();
  if (order.data.paymentStatus === "paid") redirect(`/order-confirmation/${orderNumber}`);
  if (order.data.status === "cancelled") notFound();

  const demo = config.data?.mode !== "paystack";
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-4xl font-semibold">Review and pay</h1>
      <p className="mt-1 text-sm text-cocoa">Order {order.data.orderNumber}</p>
      {demo && (
        <p className="mt-4 rounded-xl bg-blush px-4 py-3 text-sm">
          <strong>Demo payment environment.</strong> No real money is taken. Pressing the button below marks this order as paid so you can test the full journey.
        </p>
      )}
      <div className="mt-6"><OrderDetail order={order.data} /></div>
      <div className="mt-6 max-w-sm">
        <PayButton
          orderNumber={order.data.orderNumber}
          demo={demo}
          label={demo ? `Complete demo payment of ${formatKobo(order.data.totalKobo)}` : `Pay ${formatKobo(order.data.totalKobo)} securely`}
        />
      </div>
    </div>
  );
}
