import config from "./pages.json";
const { pages, comparison_target, default_comparison_source } = config;

export function getComparisonTarget(domain) {
  const parts = domain.split(".");
  if (parts.length > 3) {
    const subdomain = parts.slice(0, -3).join(".");
    return `${subdomain}.${comparison_target}`;
  }
  return comparison_target;
}
