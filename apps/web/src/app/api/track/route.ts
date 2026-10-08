import { apiCall } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await apiCall("/analytics/event", { method: "POST", body });
  } catch {
    // Tracking must never get in the way of shopping
  }
  return new Response(null, { status: 204 });
}
