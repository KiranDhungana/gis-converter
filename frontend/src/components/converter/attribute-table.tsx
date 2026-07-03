"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/client";

interface AttributeTableProps {
  url: string | null;
  format: string | null;
}

const MAX_ROWS = 100;

type Row = Record<string, unknown>;

function parseCsv(text: string): Row[] {
  const rows: string[][] = [];
  let field = "";
  let record: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      record.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      record.push(field);
      rows.push(record);
      field = "";
      record = [];
    } else {
      field += char;
    }
  }
  if (field.length || record.length) {
    record.push(field);
    rows.push(record);
  }

  const nonEmpty = rows.filter((r) => r.some((c) => c !== ""));
  if (nonEmpty.length < 1) return [];
  const header = nonEmpty[0];
  return nonEmpty.slice(1).map((cells) => {
    const obj: Row = {};
    header.forEach((h, idx) => (obj[h] = cells[idx] ?? ""));
    return obj;
  });
}

function geojsonToRows(json: { features?: { properties?: Row }[] }): Row[] {
  if (!Array.isArray(json.features)) return [];
  return json.features.map((f) => f.properties ?? {});
}

export function AttributeTable({ url, format }: AttributeTableProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supported = format === "geojson" || format === "csv";

  useEffect(() => {
    if (!url || !supported) {
      setRows([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchWithAuth(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load data (${r.status})`);
        return format === "csv" ? r.text() : r.json();
      })
      .then((payload) => {
        if (cancelled) return;
        const parsed = format === "csv" ? parseCsv(payload as string) : geojsonToRows(payload);
        setRows(parsed);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [url, format, supported]);

  if (!url || !supported) return null;

  const columns = rows.length ? Object.keys(rows[0]) : [];
  const visible = rows.slice(0, MAX_ROWS);

  return (
    <div className="attribute-table">
      <div className="dashboard-header">
        <h3>Attribute Table</h3>
        <span className="muted">
          {rows.length} feature{rows.length === 1 ? "" : "s"}
          {rows.length > MAX_ROWS ? ` (showing ${MAX_ROWS})` : ""}
        </span>
      </div>

      {loading && <p className="empty">Loading attributes…</p>}
      {error && <p className="error-msg">{error}</p>}

      {!loading && !error && rows.length === 0 && (
        <p className="empty">No attributes to display.</p>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c} title={String(row[c] ?? "")}>
                      {String(row[c] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
