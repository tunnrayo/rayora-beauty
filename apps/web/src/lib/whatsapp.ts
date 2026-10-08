/** Turns a Nigerian number like 0803 123 4567 into 2348031234567 for wa.me links. */
export function whatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

export function whatsappLink(phone: string, text: string): string {
  return `https://wa.me/${whatsappNumber(phone)}?text=${encodeURIComponent(text)}`;
}
