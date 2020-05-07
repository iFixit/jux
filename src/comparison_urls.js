function getComparisonTarget(domain, comparisonTarget) {
  const parts = domain.split(".");
  if (parts.length > 3) {
    const subdomain = parts.slice(0, -3).join(".");
    return `${subdomain}.${comparisonTarget}`;
  }
  return comparisonTarget;
}

export function getPageUrls(domain, urlPart, comparisonTarget) {
  const comparison = getComparisonTarget(domain, comparisonTarget);
  const pageUrl = `https://${comparison}/${urlPart}`;
  const updatedPageUrl = `https://${domain}/${urlPart}`;
  return {
    original: pageUrl,
    updated: updatedPageUrl,
    targetDomain: domain,
  };
}

export function getDefaultComparisonSource(defaultComparisonSource) {
  const url = new URL(window.location);
  if (url.searchParams.has("target")) {
    return url.searchParams.get("target");
  }
  return defaultComparisonSource || url.host;
}
}
