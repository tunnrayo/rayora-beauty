import { apiCall } from "@/lib/session";

export async function POST(req: Request) {
  let message = "";
  try {
    message = String((await req.json()).message ?? "");
  } catch {
    return Response.json({ error: "Please type a question." }, { status: 400 });
  }
  const r = await apiCall("/ai/assist", { method: "POST", body: { message } });
  if (!r.ok) {
    return Response.json({ error: r.error ?? "The assistant is not available right now." }, { status: r.status || 502 });
  }
  return Response.json(r.data);
}
