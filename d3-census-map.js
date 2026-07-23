const DATA_FILES = {
  1960: "./data/processed/soho_migration_1960.geojson",
  1970: "./data/processed/soho_migration_1970.geojson",
};

const BOUNDARY_FILE = "./data/processed/downtown_study_boundary.geojson";

const METRICS = {
  recent_mover_pct: {
    label: "Recent movers",
    unit: "%",
    format: (value) => `${d3.format(".1f")(value)}%`,
  },
  vacancy_pct: {
    label: "Vacant housing units",
    unit: "%",
    format: (value) => `${d3.format(".1f")(value)}%`,
  },
  renter_pct: {
    label: "Renter-occupied units",
    unit: "%",
    format: (value) => `${d3.format(".1f")(value)}%`,
  },
  median_rent: {
    label: "Median monthly rent",
    unit: "USD, nominal",
    format: (value) => `$${d3.format(",.0f")(value)}`,
  },
};

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function metricValue(feature, metric) {
  if (metric === "median_rent") {
    return (
      numberOrNull(feature.properties.median_gross_rent) ??
      numberOrNull(feature.properties.median_contract_rent)
    );
  }
  return numberOrNull(feature.properties[metric]);
}

function tractLabel(feature) {
  return (
    feature.properties.tract ||
    feature.properties.TRACTA ||
    feature.properties.TRACT ||
    feature.properties.GISJOIN ||
    "Unknown"
  );
}

export class CensusMigrationMap {
  constructor(root) {
    this.root = root;
    this.frame = root.querySelector("[data-map-frame]");
    this.status = root.querySelector("[data-map-status]");
    this.legend = root.querySelector("[data-map-legend]");
    this.metricSelect = root.querySelector("[data-metric]");
    this.yearButtons = [...root.querySelectorAll("[data-year]")];
    this.year = 1960;
    this.metric = "recent_mover_pct";
    this.datasets = new Map();
    this.boundary = null;
    this.resizeObserver = new ResizeObserver(() => this.render());

    this.bindControls();
    this.resizeObserver.observe(this.frame);
    this.load();
  }

  bindControls() {
    this.yearButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.year = Number(button.dataset.year);
        this.yearButtons.forEach((candidate) => {
          candidate.setAttribute(
            "aria-pressed",
            String(candidate === button),
          );
        });
        this.render();
      });
    });

    this.metricSelect.addEventListener("change", (event) => {
      this.metric = event.target.value;
      this.render();
    });
  }

  async load() {
    const yearRequests = Object.entries(DATA_FILES).map(
      async ([year, path]) => {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`${year}: ${response.status}`);
        }
        this.datasets.set(Number(year), await response.json());
      },
    );

    const boundaryRequest = fetch(BOUNDARY_FILE).then((response) => {
      if (!response.ok) return null;
      return response.json();
    });

    const results = await Promise.allSettled([...yearRequests, boundaryRequest]);
    const boundaryResult = results.at(-1);
    if (boundaryResult.status === "fulfilled") {
      this.boundary = boundaryResult.value;
    }

    if (this.datasets.size === 0) {
      this.showMissingData();
      return;
    }

    this.status.hidden = true;
    this.render();
  }

  showMissingData() {
    this.frame.querySelector("svg")?.remove();
    this.legend.replaceChildren();
    this.status.hidden = false;
    this.status.innerHTML =
      "The map is ready, but its processed census files are not present yet. " +
      "Add an IPUMS API key locally, fetch the NHGIS extract, and run the " +
      "Python preparation script.";
  }

  render() {
    const geojson = this.datasets.get(this.year);
    if (!geojson || this.frame.clientWidth === 0) {
      if (this.datasets.size > 0) {
        this.status.hidden = false;
        this.status.textContent = `${this.year} data are not available in this build.`;
      }
      return;
    }

    this.status.hidden = true;
    this.frame.querySelector("svg")?.remove();
    this.frame.querySelector(".chart-tooltip")?.remove();

    const width = this.frame.clientWidth;
    const height = Math.max(460, Math.min(720, width * 0.62));
    const svg = d3
      .select(this.frame)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr(
        "aria-label",
        `${this.year} downtown Manhattan census tract map of ${METRICS[this.metric].label}`,
      );

    const projection = d3
      .geoMercator()
      .fitExtent(
        [
          [20, 20],
          [width - 20, height - 20],
        ],
        geojson,
      );
    const path = d3.geoPath(projection);
    const values = geojson.features
      .map((feature) => metricValue(feature, this.metric))
      .filter((value) => value !== null)
      .sort(d3.ascending);

    if (values.length === 0) {
      this.status.hidden = false;
      this.status.textContent =
        `${METRICS[this.metric].label} is not available for ${this.year}.`;
      return;
    }

    const lower = d3.quantile(values, 0.05) ?? d3.min(values);
    const upper = d3.quantile(values, 0.95) ?? d3.max(values);
    const domain = lower === upper ? [0, upper || 1] : [lower, upper];
    const color = d3
      .scaleSequential()
      .domain(domain)
      .interpolator(d3.interpolateBlues)
      .clamp(true);
    const tooltip = d3
      .select(this.frame)
      .append("div")
      .attr("class", "chart-tooltip")
      .attr("role", "status")
      .style("opacity", 0);

    const showTooltip = (event, feature) => {
      const value = metricValue(feature, this.metric);
      tooltip
        .style("opacity", 1)
        .html(
          `<span class="eyebrow">${this.year} · tract ${tractLabel(feature)}</span>` +
            `<strong>${METRICS[this.metric].label}</strong>` +
            `<span>${value === null ? "No data" : METRICS[this.metric].format(value)}</span>`,
        );
      this.moveTooltip(event, tooltip.node());
    };

    svg
      .append("g")
      .selectAll("path")
      .data(geojson.features)
      .join("path")
      .attr("class", "census-map__tract")
      .attr("d", path)
      .attr("fill", (feature) => {
        const value = metricValue(feature, this.metric);
        return value === null ? "#e8e5de" : color(value);
      })
      .attr("tabindex", 0)
      .attr("aria-label", (feature) => {
        const value = metricValue(feature, this.metric);
        const rendered =
          value === null ? "No data" : METRICS[this.metric].format(value);
        return `Census tract ${tractLabel(feature)}: ${rendered}`;
      })
      .on("pointerenter pointermove", showTooltip)
      .on("pointerleave", () => tooltip.style("opacity", 0))
      .on("focus", (event, feature) => showTooltip(event, feature))
      .on("blur", () => tooltip.style("opacity", 0));

    if (this.boundary) {
      svg
        .append("path")
        .datum(this.boundary)
        .attr("class", "census-map__study-boundary")
        .attr("d", path);
    }

    this.renderLegend(color, domain);
  }

  moveTooltip(event, node) {
    const bounds = this.frame.getBoundingClientRect();
    const left = Math.min(
      event.clientX - bounds.left + 14,
      bounds.width - node.offsetWidth - 8,
    );
    const top = Math.max(8, event.clientY - bounds.top - node.offsetHeight - 12);
    node.style.left = `${Math.max(8, left)}px`;
    node.style.top = `${top}px`;
  }

  renderLegend(color, domain) {
    const metric = METRICS[this.metric];
    const stops = d3.range(6).map((index) =>
      d3.interpolateNumber(domain[0], domain[1])(index / 5),
    );
    const fragment = document.createDocumentFragment();

    const title = document.createElement("span");
    title.className = "census-map__legend-title";
    title.textContent = `${metric.label} (${metric.unit})`;
    fragment.append(title);

    stops.forEach((value) => {
      const item = document.createElement("span");
      item.className = "legend__item";
      const swatch = document.createElement("span");
      swatch.className = "census-map__legend-swatch";
      swatch.style.background = color(value);
      const label = document.createElement("span");
      label.textContent = metric.format(value);
      item.append(swatch, label);
      fragment.append(item);
    });

    this.legend.replaceChildren(fragment);
  }
}

