"use client";

import { useEffect, useState } from "react";
import {
  downloadTaskResult,
  formatBytes,
  getTask,
  type Task,
} from "@/lib/api/client";
import { formatDate } from "@/utils";

interface ResultDetailProps {
  taskId: string;
}

export function ResultDetail({ taskId }: ResultDetailProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getTask(taskId)
      .then(setTask)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load result"))
      .finally(() => setLoading(false));
  }, [taskId]);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      await downloadTaskResult(taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <p className="mt-8 text-sm text-mute">Loading result…</p>;
  }

  if (error && !task) {
    return (
      <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (!task) {
    return null;
  }

  const canDownload = task.status === "completed";

  return (
    <>
      <h1 className="mt-4 font-display text-2xl font-bold text-white">Conversion result</h1>
      <p className="mt-1 text-sm text-mute">
        {task.input_filename} · {formatDate(task.created_at)}
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8 max-w-xl rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-mute">Output file</div>
            <div className="mt-1 truncate font-medium text-white">
              {task.output_filename ?? "—"}
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
              task.status === "completed"
                ? "bg-signal/15 text-signal"
                : task.status === "failed"
                  ? "bg-red-500/15 text-red-400"
                  : "bg-amber-500/15 text-amber-300"
            }`}
          >
            {task.status}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-mute">Input format</dt>
            <dd className="mt-0.5 font-medium uppercase text-white">{task.input_format}</dd>
          </div>
          <div>
            <dt className="text-mute">Output format</dt>
            <dd className="mt-0.5 font-medium uppercase text-white">{task.output_format}</dd>
          </div>
          <div>
            <dt className="text-mute">CRS</dt>
            <dd className="mt-0.5 font-medium text-white">{task.target_crs ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-mute">Size</dt>
            <dd className="mt-0.5 font-medium text-white">
              {formatBytes(task.output_size_bytes)}
            </dd>
          </div>
        </dl>

        {task.status === "failed" && task.error_message && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {task.error_message}
          </p>
        )}

        {canDownload ? (
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="mt-6 w-full rounded-xl bg-signal px-4 py-3 text-sm font-semibold text-[#04130b] transition-colors hover:bg-leaf disabled:opacity-60"
          >
            {downloading ? "Preparing download…" : "Download result"}
          </button>
        ) : (
          <p className="mt-6 text-sm text-mute">
            {task.status === "failed"
              ? "This conversion failed and has no output to download."
              : "Download will be available when the conversion completes."}
          </p>
        )}
      </div>
    </>
  );
}
