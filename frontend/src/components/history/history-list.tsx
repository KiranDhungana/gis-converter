"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthUser } from "@/components/auth/auth-provider";
import { downloadTaskResult, listTasks, type Task, type TaskStatus } from "@/lib/api/client";
import { ROUTES } from "@/lib/routes";
import { formatDate } from "@/utils";

const STATUS_STYLE: Record<TaskStatus, string> = {
  completed: "text-signal",
  failed: "text-red-400",
  processing: "text-amber-300",
  pending: "text-mute",
};

export function HistoryList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthUser();
  const isSignedIn = Boolean(user);

  useEffect(() => {
    listTasks()
      .then(({ tasks: data }) => setTasks(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (taskId: string) => {
    try {
      await downloadTaskResult(taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    }
  };

  if (loading) {
    return <p className="mt-8 text-sm text-mute">Loading history…</p>;
  }

  if (error) {
    return <p className="mt-8 text-sm text-red-400">{error}</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-5 py-10 text-center">
        <p className="text-sm text-mute">No conversions yet.</p>
        <Link href={ROUTES.dashboard} className="mt-3 inline-block text-sm font-medium text-signal hover:underline">
          Start converting
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--line)]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--panel-2)] text-xs uppercase tracking-wide text-mute">
          <tr>
            <th className="px-5 py-3 font-semibold">File</th>
            <th className="px-5 py-3 font-semibold">Conversion</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 font-semibold">Created</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)] text-[#cfdbd4]">
          {tasks.map((task) => (
            <tr key={task.id} className="bg-[var(--panel)]">
              <td className="px-5 py-4 font-medium text-white">{task.input_filename}</td>
              <td className="px-5 py-4 uppercase">
                {task.input_format} → {task.output_format}
              </td>
              <td className={`px-5 py-4 font-semibold capitalize ${STATUS_STYLE[task.status]}`}>
                {task.status}
              </td>
              <td className="px-5 py-4 text-mute">{formatDate(task.created_at)}</td>
              <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-4">
                  {task.status === "completed" && (
                    <button
                      type="button"
                      onClick={() => handleDownload(task.id)}
                      className="font-medium text-signal hover:underline"
                    >
                      Download
                    </button>
                  )}
                  <Link href={ROUTES.result(task.id)} className="font-medium text-signal hover:underline">
                    View
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!isSignedIn && (
        <p className="border-t border-[var(--line)] bg-[var(--panel-2)] px-5 py-3 text-xs text-mute">
          Showing conversions from this browser session.{" "}
          <Link href={ROUTES.signup} className="font-medium text-signal hover:underline">
            Sign up
          </Link>{" "}
          to keep history across devices.
        </p>
      )}
    </div>
  );
}
