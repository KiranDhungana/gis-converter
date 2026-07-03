"use client";

import type {
  ConversionParams,
  InputFormat,
  OutputFormat,
  SupportedFormat,
} from "@/lib/api/client";

interface ConfigPanelProps {
  supportedFormats: SupportedFormat[];
  inputFormat: InputFormat;
  outputFormat: OutputFormat;
  targetCrs: string;
  params: ConversionParams;
  onInputFormatChange: (fmt: InputFormat) => void;
  onOutputFormatChange: (fmt: OutputFormat) => void;
  onTargetCrsChange: (crs: string) => void;
  onParamsChange: (params: ConversionParams) => void;
  disabled?: boolean;
}

const FORMAT_LABELS: Record<string, string> = {
  geojson: "GeoJSON",
  shapefile: "Shapefile (ZIP)",
  kml: "KML",
  gpkg: "GeoPackage",
  csv: "CSV",
  geotiff: "GeoTIFF (raster)",
  cog: "Cloud-Optimized GeoTIFF",
};

const RASTER_OUTPUTS: OutputFormat[] = ["geotiff", "cog"];

const CRS_PRESETS = ["", "EPSG:4326", "EPSG:3857", "EPSG:32645"];

function formatLabel(name: string): string {
  return FORMAT_LABELS[name] ?? name;
}

export function ConfigPanel({
  supportedFormats,
  inputFormat,
  outputFormat,
  targetCrs,
  params,
  onInputFormatChange,
  onOutputFormatChange,
  onTargetCrsChange,
  onParamsChange,
  disabled,
}: ConfigPanelProps) {
  const isRasterOutput = RASTER_OUTPUTS.includes(outputFormat);

  const inputOptions = supportedFormats.filter((f) => f.can_read);
  const outputOptions = supportedFormats.filter((f) => f.can_write);

  const update = (patch: Partial<ConversionParams>) =>
    onParamsChange({ ...params, ...patch });

  return (
    <div className="config-panel">
      <h3>Conversion Settings</h3>

      <div className="format-row">
        <label>
          Input Format
          <select
            value={inputFormat}
            onChange={(e) => onInputFormatChange(e.target.value as InputFormat)}
            disabled={disabled || inputOptions.length === 0}
          >
            <option value="">Auto-detect (from file extension)</option>
            {inputOptions.map((f) => (
              <option key={f.name} value={f.name}>
                {formatLabel(f.name)}
              </option>
            ))}
          </select>
        </label>

        <span className="format-arrow" aria-hidden="true">
          →
        </span>

        <label>
          Output Format
          <select
            value={outputFormat}
            onChange={(e) => onOutputFormatChange(e.target.value as OutputFormat)}
            disabled={disabled || outputOptions.length === 0}
          >
            {outputOptions.map((f) => (
              <option key={f.name} value={f.name}>
                {formatLabel(f.name)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {supportedFormats.length > 0 && (
        <p className="format-hint muted">
          Accepted:{" "}
          {supportedFormats
            .filter((f) => f.can_read)
            .flatMap((f) => f.extensions)
            .join(", ")}
        </p>
      )}

      <label>
        Target CRS (optional)
        <input
          list="crs-presets"
          value={targetCrs}
          onChange={(e) => onTargetCrsChange(e.target.value)}
          placeholder="e.g. EPSG:4326"
          disabled={disabled}
        />
        <datalist id="crs-presets">
          {CRS_PRESETS.filter(Boolean).map((crs) => (
            <option key={crs} value={crs} />
          ))}
        </datalist>
      </label>

      <details className="advanced-params" open={isRasterOutput}>
        <summary>Advanced parameters</summary>

        {isRasterOutput && (
          <>
            <label>
              Rasterization resolution
              <input
                type="number"
                step="any"
                min="0"
                value={params.resolution ?? ""}
                onChange={(e) => update({ resolution: e.target.value })}
                placeholder="pixel size in CRS units (auto if blank)"
                disabled={disabled}
              />
            </label>
            <label>
              Burn attribute (vector → raster)
              <input
                value={params.attribute ?? ""}
                onChange={(e) => update({ attribute: e.target.value })}
                placeholder="property name (defaults to 1)"
                disabled={disabled}
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={params.all_touched ?? false}
                onChange={(e) => update({ all_touched: e.target.checked })}
                disabled={disabled}
              />
              Burn all touched pixels
            </label>
          </>
        )}

        <label>
          Band selection (raster input/output)
          <input
            value={params.bands ?? ""}
            onChange={(e) => update({ bands: e.target.value })}
            placeholder="e.g. 1 or 1,2,3"
            disabled={disabled}
          />
        </label>

        <label>
          NoData value
          <input
            type="number"
            step="any"
            value={params.nodata ?? ""}
            onChange={(e) => update({ nodata: e.target.value })}
            placeholder="optional"
            disabled={disabled}
          />
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={params.ignore_zero ?? false}
            onChange={(e) => update({ ignore_zero: e.target.checked })}
            disabled={disabled}
          />
          Ignore zero when vectorizing (raster → GeoJSON)
        </label>
      </details>
    </div>
  );
}
