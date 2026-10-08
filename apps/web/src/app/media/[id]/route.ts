const API = process.env.API_URL ?? "http://localhost:4000";

// Generated product images are stored by the API. This serves them from the shop's own address.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  try {
    const res = await fetch(`${API}/api/v1/media/${id}`, { cache: "force-cache" });
    if (!res.ok) return new Response("Not found", { status: 404 });
    return new Response(res.body, {
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Unavailable", { status: 502 });
  }
}
