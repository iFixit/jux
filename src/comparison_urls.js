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
  return `https://${host}/${path}`;
}

export function getDefaultComparisonSource(defaultComparisonSource) {
  const target = getSearchParam("target");
  return target || defaultComparisonSource || window.location.host;
}

export function setDefaultComparisonSource(value) {
  setSearchParam("target", value);
}

function getSearchParam(key) {
  const url = new URL(window.location);
  return url.searchParams.get(key);
}

function setSearchParam(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.pushState(null, "", url.toString());
}
