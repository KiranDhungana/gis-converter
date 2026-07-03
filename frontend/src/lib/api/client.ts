import { clearToken, ensureAuthToken, getAuthHeaders } from "@/lib/api/token";

export type OutputFormat =
  | "geojson"
  | "shapefile"
  | "kml"
  | "gpkg"
  | "csv"
  | "geotiff"
  | "cog";

export type InputFormat = "" | OutputFormat;

export type TaskStatus = "pending" | "processing" | "completed" | "failed";

export interface ConversionParams {
  resolution?: string;
  bands?: string;
  nodata?: string;
  attribute?: string;
  all_touched?: boolean;
  ignore_zero?: boolean;
}

export interface SupportedFormat {
  name: string;
  extensions: string[];
  kind: string;
  can_read: boolean;
  can_write: boolean;
}

export interface Task {
  id: string;
  input_filename: string;
  input_format: string;
  output_format: string;
  output_filename: string | null;
  output_size_bytes: number | null;
  progress_percent: number;
  target_crs: string | null;
  status: TaskStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface UploadResponse {
  task_id: string;
  input_filename: string;
  input_format: string;
  status: TaskStatus;
  message: string;
}

export interface DownloadResponse {
  task_id: string;
  download_url: string;
  output_format: string;
  output_filename: string | null;
  output_size_bytes: number | null;
  expires_in: number;
}

const API_BASE = "/api/v1";

const API_OFFLINE_MSG =
  "Conversion API is not running. Start Docker Desktop, then from the project root run: docker compose up";

export function isApiOfflineError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message === API_OFFLINE_MSG ||
    error.message.includes("Failed to fetch") ||
    error.message.includes("NetworkError")
  );
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function parseErrorDetail(text: string): string | undefined {
  try {
    const body = JSON.parse(text) as { detail?: unknown };
    const { detail } = body;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item) =>
          typeof item === "object" && item && "msg" in item
            ? String((item as { msg: string }).msg)
            : String(item)
        )
        .join("; ");
    }
  } catch {
  }
  return undefined;
}

export function getTaskPreviewUrl(taskId: string): string {
  return `${API_BASE}/tasks/${taskId}/content`;
}

export async function fetchWithAuth(
  input: string,
  init?: RequestInit
): Promise<Response> {
  await ensureAuthToken();
  const headers = new Headers(init?.headers);
  for (const [key, value] of Object.entries(getAuthHeaders())) {
    headers.set(key, value);
  }
  return fetch(input, { ...init, headers });
}

async function request<T>(path: string, init?: RequestInit, retried = false): Promise<T> {
  await ensureAuthToken();
  const headers = new Headers(init?.headers);
  for (const [key, value] of Object.entries(getAuthHeaders())) {
    headers.set(key, value);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new Error(API_OFFLINE_MSG);
  }

  if (!res.ok) {
    const text = await res.text();
    const detail = parseErrorDetail(text);

    if (res.status === 401 && !retried) {
      clearToken();
      return request<T>(path, init, true);
    }

    if (res.status >= 500 && !detail) {
      throw new Error(API_OFFLINE_MSG);
    }

    throw new Error(detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    if (!res.ok) return false;
    const body = await res.json().catch(() => null);
    return body?.status === "ok";
  } catch {
    return false;
  }
}

export async function getFormats(): Promise<SupportedFormat[]> {
  const data = await request<{ formats: SupportedFormat[] }>("/formats");
  return data.formats;
}

export async function uploadFile(
  file: File,
  outputFormat: OutputFormat,
  targetCrs?: string,
  params?: ConversionParams,
  inputFormat?: InputFormat
): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("output_format", outputFormat);
  if (inputFormat) form.append("input_format", inputFormat);
  if (targetCrs) form.append("target_crs", targetCrs);

  if (params) {
    if (params.resolution) form.append("resolution", params.resolution);
    if (params.bands) form.append("bands", params.bands);
    if (params.nodata) form.append("nodata", params.nodata);
    if (params.attribute) form.append("attribute", params.attribute);
    if (params.all_touched) form.append("all_touched", "true");
    if (params.ignore_zero) form.append("ignore_zero", "true");
  }

  return request<UploadResponse>("/upload", { method: "POST", body: form });
}

export async function listTasks(): Promise<{ tasks: Task[]; total: number }> {
  return request("/tasks");
}

export async function getTask(taskId: string): Promise<Task> {
  return request(`/tasks/${taskId}`);
}

export async function getDownloadUrl(taskId: string): Promise<DownloadResponse> {
  return request(`/download/${taskId}`);
}

export async function downloadTaskResult(taskId: string): Promise<void> {
  const task = await getTask(taskId);
  if (task.status !== "completed") {
    throw new Error(`Task is not ready for download (status: ${task.status})`);
  }

  const res = await fetchWithAuth(`${API_BASE}/tasks/${taskId}/content`);
  if (!res.ok) {
    const text = await res.text();
    const detail = parseErrorDetail(text);
    throw new Error(detail || `Download failed: ${res.status}`);
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = task.output_filename ?? `converted-${taskId}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}
