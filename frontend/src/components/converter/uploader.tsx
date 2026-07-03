"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";

interface UploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  disabled?: boolean;
}

const ACCEPT = ".geojson,.json,.zip,.kml,.gpkg,.csv,.shp,.tif,.tiff";

export function Uploader({ onUpload, disabled }: UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isDisabled = Boolean(disabled || uploading);

  const openFilePicker = () => {
    if (!isDisabled) inputRef.current?.click();
  };

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (isDisabled) return;
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length) setFiles(dropped);
    },
    [isDisabled]
  );

  const handleSubmit = async () => {
    if (!files.length) return;
    setUploading(true);
    try {
      await onUpload(files);
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  const totalKb = files.reduce((sum, f) => sum + f.size, 0) / 1024;

  return (
    <div className="uploader">
      <div
        className={`dropzone ${dragOver ? "drag-over" : ""} ${isDisabled ? "dropzone-disabled" : ""}`}
        onClick={openFilePicker}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isDisabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFilePicker();
          }
        }}
        aria-disabled={isDisabled}
      >
        {files.length ? (
          <div className="selected-files">
            <strong>
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </strong>
            <span className="muted"> ({totalKb.toFixed(1)} KB)</span>
            <ul>
              {files.map((f) => (
                <li key={f.name}>{f.name}</li>
              ))}
            </ul>
            <button
              type="button"
              className="dropzone-browse-btn"
              onClick={(e) => {
                e.stopPropagation();
                openFilePicker();
              }}
              disabled={isDisabled}
            >
              Choose different files
            </button>
          </div>
        ) : (
          <div className="dropzone-empty">
            <p>Drag & drop GIS file(s) here</p>
            <span className="dropzone-or muted">or</span>
            <button
              type="button"
              className="dropzone-browse-btn"
              onClick={(e) => {
                e.stopPropagation();
                openFilePicker();
              }}
              disabled={isDisabled}
            >
              Browse files
            </button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          className="dropzone-input"
          multiple
          accept={ACCEPT}
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          disabled={isDisabled}
          tabIndex={-1}
          aria-hidden
        />
      </div>
      <button onClick={handleSubmit} disabled={!files.length || isDisabled}>
        {uploading
          ? "Uploading…"
          : files.length > 1
            ? `Upload & Convert ${files.length} files`
            : "Upload & Convert"}
      </button>
    </div>
  );
}
