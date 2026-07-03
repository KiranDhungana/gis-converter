"use client";

import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { CRS } from "@/lib/conversion-options";

export interface FileInfo {
  name: string;
  fmt: string;
  size: string;
}

function describeFile(file: File): FileInfo {
  return {
    name: file.name,
    fmt: (file.name.split(".").pop() ?? "").toUpperCase(),
    size: `${(file.size / 1048576).toFixed(2)} MB`,
  };
}

export function useConverterForm() {
  const [file, setFile] = useState<FileInfo | null>({
    name: "ne_10m_admin_0_countries.geojson",
    fmt: "GeoJSON",
    size: "2.45 MB",
  });
  const [dragOver, setDragOver] = useState(false);
  const [inFmt, setInFmt] = useState("GeoJSON");
  const [outFmt, setOutFmt] = useState("GeoTIFF (COG)");
  const [convType, setConvType] = useState("Vector to Raster");
  const [crs, setCrs] = useState("3857");
  const [res, setRes] = useState("10");
  const [unit, setUnit] = useState("meters");
  const [outName, setOutName] = useState("countries_10m_webmercator.tif");
  const [advOpen, setAdvOpen] = useState(true);
  const [resample, setResample] = useState("Bilinear");
  const [compression, setCompression] = useState("LZW");
  const [tiling, setTiling] = useState("Yes");
  const [tileSize, setTileSize] = useState("256 x 256");
  const [noData, setNoData] = useState("0");
  const [band, setBand] = useState("All Bands");
  const [overviews, setOverviews] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const crsObj = useMemo(() => CRS.find((c) => c.code === crs), [crs]);

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(describeFile(f));
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(describeFile(f));
  };

  const summary: [string, string][] = [
    ["Input File", file?.name || "—"],
    ["Input Format", inFmt],
    ["Output Format", outFmt],
    ["Conversion Type", convType],
    ["CRS (EPSG)", `${crs} - WGS 84 / ${crsObj?.label.split("/").pop()?.trim() || ""}`],
    ["Resolution", `${res} ${unit}`],
    ["Estimated Output Size", "~ 38.6 MB"],
  ];

  return {
    file,
    setFile,
    dragOver,
    setDragOver,
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
    fileRef,
    crsObj,
    onPick,
    onDrop,
    summary,
  };
}

export type ConverterForm = ReturnType<typeof useConverterForm>;
