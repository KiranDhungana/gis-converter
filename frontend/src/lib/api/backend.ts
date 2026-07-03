const API_TARGET = process.env.API_PROXY_TARGET || "http://localhost:8000";

export function backendUrl(path: string, search = ""): string {
  return `${API_TARGET}${path}${search}`;
}

export async function proxyToBackend(
  request: Request,
  apiPath: string
): Promise<Response> {
  const url = new URL(request.url);
  const target = backendUrl(apiPath, url.search);

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const accept = request.headers.get("accept");
  if (accept) headers.set("accept", accept);
  const authorization = request.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.arrayBuffer()
      : undefined;

  try {
    const res = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    const resContentType = res.headers.get("content-type");
    if (resContentType) responseHeaders.set("content-type", resContentType);

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      {
        detail:
          "Conversion API is not running. Start Docker Desktop, then run docker compose up from the project root.",
      },
      { status: 503 }
    );
  }
}
