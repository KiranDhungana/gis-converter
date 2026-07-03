"use client";

import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Globe,
  X,
  Zap,
  RotateCcw,
} from "lucide-react";
import { C, selStyle, inpStyle } from "@/lib/dashboard-theme";
import {
  FORMATS,
  CONVERSION_TYPES,
  CRS,
  RESAMPLING_METHODS,
  COMPRESSION_METHODS,
  TILE_SIZES,
  BAND_OPTIONS,
  RESOLUTION_UNITS,
} from "@/lib/conversion-options";
import { Panel } from "@/components/ui/panel";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { StepBadge } from "@/components/ui/step-badge";
import type { ConverterForm } from "@/hooks/use-converter-form";

export function ConversionSettings({ form }: { form: ConverterForm }) {
  const {
    inFmt,
    setInFmt,
    outFmt,
    setOutFmt,
    convType,
    setConvType,
    crs,
    setCrs,
    res,
    setRes,
    unit,
    setUnit,
    outName,
    setOutName,
    advOpen,
    setAdvOpen,
    resample,
    setResample,
    compression,
    setCompression,
    tiling,
    setTiling,
    tileSize,
    setTileSize,
    noData,
    setNoData,
    band,
    setBand,
    overviews,
    setOverviews,
  } = form;

  return (
    <Panel style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 20 }}>
        <StepBadge n={2} />{" "}
        <span style={{ fontWeight: 700, fontSize: 16 }}>Conversion Settings</span>
      </div>

      <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
        <Field label="Input Format">
          <Select value={inFmt} onChange={(e) => setInFmt(e.target.value)} options={FORMATS} />
        </Field>
        <Field label="Output Format">
          <Select value={outFmt} onChange={(e) => setOutFmt(e.target.value)} options={FORMATS} />
        </Field>
        <Field label="Conversion Type">
          <Select
            value={convType}
            onChange={(e) => setConvType(e.target.value)}
            options={CONVERSION_TYPES}
          />
        </Field>
      </div>

      <div style={{ display: "flex", gap: 18, marginBottom: 8, alignItems: "flex-start" }}>
        <Field label="Coordinate Reference System (EPSG)">
          <div style={{ position: "relative" }}>
            <select
              value={crs}
              onChange={(e) => setCrs(e.target.value)}
              style={{ ...selStyle, padding: "11px 56px 11px 36px" }}
            >
              {CRS.map((c) => (
                <option key={c.code} value={c.code} style={{ background: C.panel }}>
                  {c.code} - WGS 84 / {c.label}
                </option>
              ))}
            </select>
            <Globe
              size={15}
              color={C.green}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <X
              size={14}
              color={C.faint}
              style={{
                position: "absolute",
                right: 32,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
            />
            <ChevronDown
              size={16}
              color={C.faint}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
          </div>
        </Field>
        <Field label="Resolution (Pixel Size)">
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={res}
              onChange={(e) => setRes(e.target.value)}
              style={{ ...inpStyle, width: 80 }}
            />
            <div style={{ flex: 1 }}>
              <Select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                options={RESOLUTION_UNITS}
              />
            </div>
          </div>
        </Field>
        <Field label="Output File Name (optional)">
          <input
            value={outName}
            onChange={(e) => setOutName(e.target.value)}
            style={inpStyle}
          />
        </Field>
      </div>

      <button
        type="button"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: C.green,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          padding: "4px 0 16px",
        }}
      >
        View on map <ExternalLink size={13} />
      </button>

      <button
        type="button"
        onClick={() => setAdvOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: "none",
          border: "none",
          color: C.green,
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          marginBottom: advOpen ? 16 : 0,
        }}
      >
        {advOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />} Advanced Options
      </button>

      {advOpen && (
        <div style={{ border: `1px solid ${C.borderSoft}`, borderRadius: 12, padding: 18 }}>
          <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
            <Field label="Resampling Method">
              <Select
                value={resample}
                onChange={(e) => setResample(e.target.value)}
                options={RESAMPLING_METHODS}
              />
            </Field>
            <Field label="Compression">
              <Select
                value={compression}
                onChange={(e) => setCompression(e.target.value)}
                options={COMPRESSION_METHODS}
              />
            </Field>
            <Field label="Tiling">
              <Select
                value={tiling}
                onChange={(e) => setTiling(e.target.value)}
                options={["Yes", "No"]}
              />
            </Field>
            <Field label="Tile Size">
              <Select
                value={tileSize}
                onChange={(e) => setTileSize(e.target.value)}
                options={TILE_SIZES}
              />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-end" }}>
            <Field label="NoData Value">
              <input
                value={noData}
                onChange={(e) => setNoData(e.target.value)}
                style={inpStyle}
              />
            </Field>
            <Field label="Band Selection">
              <Select
                value={band}
                onChange={(e) => setBand(e.target.value)}
                options={BAND_OPTIONS}
              />
            </Field>
            <Field label="Create Overviews">
              <div style={{ display: "flex", alignItems: "center", gap: 11, height: 44 }}>
                <button
                  type="button"
                  onClick={() => setOverviews((v) => !v)}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    background: overviews ? C.green : C.border,
                    position: "relative",
                    transition: "background .15s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      left: overviews ? 22 : 2,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left .15s",
                    }}
                  />
                </button>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                  {overviews ? "Yes" : "No"}
                </span>
              </div>
            </Field>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 22px",
            background: C.greenDim,
            color: "#fff",
            border: "none",
            borderRadius: 9,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Convert Now <Zap size={16} />
        </button>
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 22px",
            background: "transparent",
            color: C.text,
            border: `1px solid ${C.border}`,
            borderRadius: 9,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          <RotateCcw size={15} /> Reset
        </button>
      </div>
    </Panel>
  );
}
