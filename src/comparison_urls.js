function getComparisonTarget(domain, comparisonTarget) {
  const parts = domain.split(".");
  if (parts.length > 3) {
    const subdomain = parts.slice(0, -3).join(".");
    return `${subdomain}.${comparisonTarget}`;
  }
  return comparisonTarget;
}

export function getPageUrls(url, urlPart, comparisonTarget) {
  const { host, path } = splitUrl(url);
  const comparison = getComparisonTarget(host, comparisonTarget);
  const pageUrl = formatUrl(comparison, path || urlPart);
  const updatedPageUrl = formatUrl(host, path || urlPart);
  return {
    original: pageUrl,
    updated: updatedPageUrl,
    targetDomain: host,
  };
}

function splitUrl(url) {
  const idx = url.indexOf("/");
  if (idx < 0) {
    return { host: url, path: null };
  }
  return {
    host: url.slice(0, idx),
    path: url.slice(idx + 1),
  };
}

function formatUrl(host, path) {
  const p = path.startsWith('/') ? path : '/' + path
  return `//${host}${p}`;
}

const TARGET_PARAM = "target";
export function getDefaultComparisonSource(defaultComparisonSource) {
  const target = getSearchParam(TARGET_PARAM);
  return target || defaultComparisonSource || window.location.host;
}

export function setDefaultComparisonSource(value) {
  setSearchParam(TARGET_PARAM, value);
}

// Update the target param on the CURRENT history entry. Used when the
// left pane navigates itself: that navigation already added a session
// history entry, so pushing another would make Back need two presses.
export function replaceDefaultComparisonSource(value) {
  setSearchParam(TARGET_PARAM, value, { replace: true });
}

const WIDTH_PARAM = "width";
export function getDefaultWidth() {
  return getSearchParam(WIDTH_PARAM);
}

export function setDefaultWidth(value) {
  setSearchParam(WIDTH_PARAM, value);
}

const DIFF_PARAM = "diff";
export function getDefaultDiff() {
  const diff = getSearchParam(DIFF_PARAM);
  return diff !== null && diff !== "false";
}

export function setDefaultDiff(value) {
  setSearchParam(DIFF_PARAM, value);
}

function getSearchParam(key) {
  const url = new URL(window.location);
  return url.searchParams.get(key);
}

function setSearchParam(key, value, { replace = false } = {}) {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  const method = replace ? "replaceState" : "pushState";
  window.history[method](null, "", url.toString());
}
