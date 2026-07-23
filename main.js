import { CensusMigrationMap } from "./d3-census-map.js";

const mapRoot = document.querySelector("[data-map-root]");

if (mapRoot) {
  new CensusMigrationMap(mapRoot);
}
