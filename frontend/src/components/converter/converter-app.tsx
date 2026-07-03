"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  downloadTaskResult,
  formatBytes,
  getFormats,
  getTaskPreviewUrl,
  isApiOfflineError,
  listTasks,
  uploadFile,
  type ConversionParams,
  type InputFormat,
  type OutputFormat,
  type SupportedFormat,
  type Task,
} from "@/lib/api/client";
import { AttributeTable } from "@/components/converter/attribute-table";
import { ConfigPanel } from "@/components/converter/config-panel";
import { ConverterErrorBoundary } from "@/components/converter/converter-error-boundary";
import { LazyMapPreview } from "@/components/converter/lazy-map-preview";
import { ProgressDashboard } from "@/components/converter/progress-dashboard";
import { Uploader } from "@/components/converter/uploader";

type MobileTab = "convert" | "preview";

export function ConverterApp() {
  const [supportedFormats, setSupportedFormats] = useState<SupportedFormat[]>([]);
  const [inputFormat, setInputFormat] = useState<InputFormat>("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("geojson");
  const [targetCrs, setTargetCrs] = useState("");
  const [params, setParams] = useState<ConversionParams>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFormat, setPreviewFormat] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [apiOffline, setApiOffline] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("convert");

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeTaskId) ?? null,
    [tasks, activeTaskId]
  );

  const hasActiveTasks = tasks.some(
    (t) => t.status === "pending" || t.status === "processing"
  );

  const refreshTasks = useCallback(async () => {
    const { tasks: data } = await listTasks();
    setTasks(data);
    setApiOffline(false);
    return data;
  }, []);

  useEffect(() => {
    getFormats()
      .then(setSupportedFormats)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshTasks().catch((e) => {
      if (isApiOfflineError(e)) {
        setApiOffline(true);
      } else {
        setBanner(e instanceof Error ? e.message : "Failed to load tasks");
      }
    });
    const intervalMs = hasActiveTasks ? 2000 : 5000;
    const interval = setInterval(() => {
      refreshTasks().catch((e) => {
        if (isApiOfflineError(e)) setApiOffline(true);
      });
    }, intervalMs);
    return () => clearInterval(interval);
  }, [refreshTasks, hasActiveTasks]);

  useEffect(() => {
    if (!activeTask) {
      setPreviewUrl(null);
      setPreviewFormat(null);
      return;
    }

    setPreviewFormat(activeTask.output_format);

    if (activeTask.status !== "completed") {
      setPreviewUrl(null);
      return;
    }

    setPreviewUrl(getTaskPreviewUrl(activeTask.id));
  }, [activeTask]);

  const handleDownload = async (taskId: string) => {
    try {
      await downloadTaskResult(taskId);
    } catch (err) {
      setBanner(err instanceof Error ? err.message : "Download failed");
    }
  };

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    setBanner(null);
    const errors: string[] = [];
    let lastTaskId: string | null = null;

    for (const file of files) {
      try {
        const res = await uploadFile(
          file,
          outputFormat,
          targetCrs || undefined,
          params,
          inputFormat || undefined
        );
        lastTaskId = res.task_id;
      } catch (err) {
        errors.push(`${file.name}: ${err instanceof Error ? err.message : "upload failed"}`);
      }
    }

    if (lastTaskId) {
      setActiveTaskId(lastTaskId);
      setMobileTab("preview");
    }
    if (errors.length) setBanner(errors.join(" | "));
    await refreshTasks().catch(() => undefined);
    setUploading(false);
  };

  const handleSelectTask = (taskId: string) => {
    setActiveTaskId(taskId);
    setMobileTab("preview");
  };

  const isRaster = previewFormat === "cog" || previewFormat === "geotiff";
  const showMap = previewFormat === "geojson" || isRaster;

  const previewPanel = (
    <>
      <section className="preview-map-section" aria-label="Map preview">
        <div className="preview-section-header">
          <h3>Map preview</h3>
          <p className="muted">
            {showMap && previewUrl
              ? "GeoJSON and GeoTIFF/COG outputs render on an interactive map."
              : "Convert to GeoJSON or GeoTIFF/COG to visualize results here."}
          </p>
        </div>

        {showMap && previewUrl ? (
          <LazyMapPreview url={previewUrl} format={previewFormat} />
        ) : activeTask?.status === "completed" && previewFormat && !showMap ? (
          <div className="map-preview empty">
            <p>
              Map preview is not available for <strong>{previewFormat}</strong> output. Use
              Download to retrieve the file.
            </p>
          </div>
        ) : activeTask &&
          (activeTask.status === "pending" || activeTask.status === "processing") ? (
          <div className="map-preview empty">
            <p>Map will appear here when the conversion finishes.</p>
          </div>
        ) : (
          <div className="map-preview empty">
            <p>Upload a file and convert to GeoJSON or GeoTIFF/COG to preview it on the map.</p>
          </div>
        )}
      </section>

      {activeTask?.status === "completed" && (
        <div className="results-panel">
          <h3>Conversion complete</h3>
          <dl className="results-meta">
            <div>
              <dt>Output file</dt>
              <dd>{activeTask.output_filename ?? "—"}</dd>
            </div>
            <div>
              <dt>File size</dt>
              <dd>{formatBytes(activeTask.output_size_bytes)}</dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>{activeTask.output_format}</dd>
            </div>
          </dl>
          <button
            type="button"
            className="results-download"
            onClick={() => handleDownload(activeTask.id)}
          >
            Download result
          </button>
        </div>
      )}

      {activeTask && (activeTask.status === "pending" || activeTask.status === "processing") && (
        <div className="results-panel processing">
          <h3>Converting…</h3>
          <p>
            {activeTask.input_filename} → {activeTask.output_format}
            {activeTask.progress_percent > 0 ? ` (${activeTask.progress_percent}%)` : ""}
          </p>
          <div className="progress-track animated">
            <div
              className="progress-fill"
              style={{
                width: `${Math.max(activeTask.progress_percent, 5)}%`,
                background: "#3b82f6",
              }}
            />
          </div>
        </div>
      )}

      <AttributeTable url={previewUrl} format={previewFormat} />
    </>
  );

  return (
    <ConverterErrorBoundary>
      <div className="converter-app">
        <header className="converter-header">
          <div>
            <h1>GIS Converter</h1>
            <p>Upload geospatial files and convert between vector &amp; raster formats</p>
          </div>
        </header>

        {apiOffline && (
          <div className="banner error api-offline" role="alert">
            <div>
              <strong>Backend not connected</strong>
              <p>
                The conversion API is not reachable. Start Docker Desktop, then run{" "}
                <code>docker compose up</code> from the project root folder.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                refreshTasks().catch((e) =>
                  setBanner(e instanceof Error ? e.message : "Still cannot reach API")
                )
              }
            >
              Retry
            </button>
          </div>
        )}

        {banner && !apiOffline && (
          <div className="banner error" role="alert">
            <span>{banner}</span>
            <button type="button" onClick={() => setBanner(null)}>
              Dismiss
            </button>
          </div>
        )}

        <div className="converter-tabs" role="tablist" aria-label="Converter sections">
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === "convert"}
            className={mobileTab === "convert" ? "active" : ""}
            onClick={() => setMobileTab("convert")}
          >
            Convert
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === "preview"}
            className={mobileTab === "preview" ? "active" : ""}
            onClick={() => setMobileTab("preview")}
          >
            Preview
          </button>
        </div>

        <main className="layout">
          <section
            className={`left-panel ${mobileTab === "convert" ? "panel-visible" : "panel-hidden"}`}
          >
            <ConfigPanel
              supportedFormats={supportedFormats}
              inputFormat={inputFormat}
              outputFormat={outputFormat}
              targetCrs={targetCrs}
              params={params}
              onInputFormatChange={setInputFormat}
              onOutputFormatChange={setOutputFormat}
              onTargetCrsChange={setTargetCrs}
              onParamsChange={setParams}
              disabled={uploading}
            />
            <Uploader onUpload={handleUpload} disabled={uploading} />
            <ProgressDashboard
              tasks={tasks}
              activeTaskId={activeTaskId}
              onRefresh={refreshTasks}
              onSelect={handleSelectTask}
              onError={setBanner}
            />
          </section>

          <section
            className={`right-panel ${mobileTab === "preview" ? "panel-visible" : "panel-hidden"}`}
          >
            {previewPanel}
          </section>
        </main>
      </div>
    </ConverterErrorBoundary>
  );
}
