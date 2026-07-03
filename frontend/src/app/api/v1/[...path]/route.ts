import { proxyToBackend } from "@/lib/api/backend";

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const apiPath = `/api/v1/${path.join("/")}`;
  return proxyToBackend(request, apiPath);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
