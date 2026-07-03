declare module "georaster" {
  export interface GeoRaster {
    noDataValue: number | null;
    numberOfRasters: number;
    mins?: number[];
    maxs?: number[];
    width: number;
    height: number;
    [key: string]: unknown;
  }
  export default function parseGeoraster(
    data: ArrayBuffer | string | unknown,
    ...args: unknown[]
  ): Promise<GeoRaster>;
}

declare module "georaster-layer-for-leaflet" {
  import { GridLayer, GridLayerOptions, LatLngBounds } from "leaflet";
  import { GeoRaster } from "georaster";

  export interface GeoRasterLayerOptions extends GridLayerOptions {
    georaster?: GeoRaster;
    georasters?: GeoRaster[];
    resolution?: number;
    opacity?: number;
    pixelValuesToColorFn?: (values: number[]) => string | null;
  }

  export default class GeoRasterLayer extends GridLayer {
    constructor(options: GeoRasterLayerOptions);
    getBounds(): LatLngBounds;
  }
}
