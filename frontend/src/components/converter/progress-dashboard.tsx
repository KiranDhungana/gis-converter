"use client";

import { downloadTaskResult, formatBytes, type Task } from "@/lib/api/client";

interface ProgressDashboardProps {
  tasks: Task[];
  activeTaskId: string | null;
  onRefresh: () => void;
  onSelect: (taskId: string) => void;
  onError?: (message: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  completed: "#22c55e",
  failed: "#ef4444",
};

function taskProgress(task: Task): number {
  if (task.status === "failed") return 100;
  if (task.progress_percent > 0) return task.progress_percent;
  if (task.status === "pending") return 5;
  if (task.status === "processing") return 50;
  return 100;
}

export function ProgressDashboard({
  tasks,
  activeTaskId,
  onRefresh,
  onSelect,
  onError,
}: ProgressDashboardProps) {
  const handleDownload = async (taskId: string) => {
    try {
      await downloadTaskResult(taskId);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Download failed");
    }
  };

  return (
    <div className="progress-dashboard">
      <div className="dashboard-header">
        <h3>Conversion Tasks &amp; History</h3>
        <button onClick={onRefresh}>Refresh</button>
      </div>

      {tasks.length === 0 ? (
        <p className="empty">No tasks yet. Upload a file to get started.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => {
            const active = task.status === "pending" || task.status === "processing";
            const progress = taskProgress(task);
            return (
              <li
                key={task.id}
                className={`task-item ${activeTaskId === task.id ? "active" : ""}`}
                onClick={() => onSelect(task.id)}
              >
                <div className="task-info">
                  <span className="filename">{task.input_filename}</span>
                  <span className="formats">
                    {task.input_format} → {task.output_format}
                    {task.target_crs ? ` · ${task.target_crs}` : ""}
                  </span>
                  {task.status === "completed" && task.output_filename && (
                    <span className="output-meta">
                      Output: {task.output_filename} ({formatBytes(task.output_size_bytes)})
                    </span>
                  )}
                </div>

                <div className="task-actions">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: STATUS_COLORS[task.status] }}
                  >
                    {task.status}
                    {active ? ` · ${progress}%` : ""}
                  </span>
                  {task.status === "completed" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(task.id);
                      }}
                    >
                      Download
                    </button>
                  )}
                </div>

                <div className={`progress-track ${active ? "animated" : ""}`}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progress}%`,
                      background: STATUS_COLORS[task.status],
                    }}
                  />
                </div>

                {task.error_message && (
                  <p className="error-msg">{task.error_message.split("\n")[0]}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
