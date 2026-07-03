"use client";

import { UploadCloud, CheckCircle2, Trash2, FileText } from "lucide-react";
import { C } from "@/lib/dashboard-theme";
import { Panel } from "@/components/ui/panel";
import { StepBadge } from "@/components/ui/step-badge";
import type { ConverterForm } from "@/hooks/use-converter-form";

export function UploadPanel({ form }: { form: ConverterForm }) {
  const { file, setFile, dragOver, setDragOver, fileRef, onPick, onDrop } = form;

  return (
    <Panel style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 18 }}>
        <StepBadge n={1} />{" "}
        <span style={{ fontWeight: 700, fontSize: 16 }}>Upload File</span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `1.5px dashed ${dragOver ? C.green : C.border}`,
          borderRadius: 12,
          background: dragOver ? "rgba(63,185,80,0.05)" : "transparent",
          padding: "44px 20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all .15s",
        }}
      >
        <input ref={fileRef} type="file" hidden onChange={onPick} />
        <UploadCloud size={42} color={C.green} strokeWidth={1.6} />
        <div style={{ fontWeight: 700, margin: "14px 0 4px" }}>
          Drag &amp; drop your file here
        </div>
        <div style={{ color: C.faint, fontSize: 13, marginBottom: 12 }}>or</div>
        <span
          style={{
            display: "inline-block",
            padding: "9px 18px",
            background: C.greenDim,
            color: "#fff",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13.5,
          }}
        >
          Browse Files
        </span>
        <div style={{ color: C.faint, fontSize: 12.5, marginTop: 16 }}>
          Supported formats: GeoJSON, GeoTIFF, Shapefile, CSV, KML, KMZ, COG, GPKG and
          more.
        </div>
      </div>

      {file && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            marginTop: 16,
            padding: "13px 15px",
            background: C.input,
            border: `1px solid ${C.borderSoft}`,
            borderRadius: 10,
          }}
        >
          <FileText size={26} color={C.sub} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 14,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {file.name}
            </div>
            <div style={{ color: C.faint, fontSize: 12.5 }}>
              {file.fmt} · {file.size}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: C.green,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} /> File ready
          </div>
          <div style={{ width: 1, height: 26, background: C.border, margin: "0 4px" }} />
          <Trash2
            size={17}
            color={C.faint}
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              setFile(null);
            }}
          />
        </div>
      )}
    </Panel>
  );
}
