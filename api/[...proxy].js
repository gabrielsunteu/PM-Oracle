export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { pathname, search } = new URL(req.url);
  const proxiedPath = pathname.replace(/^\/?/, "");
  const apiUrl = `https://api.clob.polymarket.com/${proxiedPath}${search}`;

  try {
    const res = await fetch(apiUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.get("Authorization") && {
          "Authorization": req.headers.get("Authorization"),
        }),
      },
      body: req.method !== "GET" ? await req.text() : undefined,
    });

    const data = await res.text();

    return new Response(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Proxy error", details: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
