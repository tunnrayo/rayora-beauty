"use client";

import { useActionState } from "react";
import { payDemoAction, payOnlineAction } from "@/actions/checkout";
import FormMessage from "./FormMessage";
import SubmitButton from "./SubmitButton";

export default function PayButton({ orderNumber, label, demo }: { orderNumber: string; label: string; demo: boolean }) {
  const [state, action] = useActionState(demo ? payDemoAction : payOnlineAction, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <FormMessage error={state?.error} />
      <SubmitButton className="btn-primary w-full" pendingText="Processing payment...">{label}</SubmitButton>
    </form>
  );
}
