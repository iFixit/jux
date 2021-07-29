import config from "./pages.json";

export function getScreenshotUrl(url) {
  const targetUrl = getScreenshotTarget();
  if (!targetUrl) {
    return "";
  }
  const parse = new URL(targetUrl);
  parse.pathname = parse.pathname + "screenshot";
  parse.searchParams.set("url", url);
  return parse.toString();
}

function getTriggerUrl(url) {
  const targetUrl = getScreenshotTarget();
  if (!targetUrl) {
    return "";
  }
  const parse = new URL(targetUrl);
  parse.pathname = parse.pathname + "start";
  parse.searchParams.set("url", url);
  return parse.toString();
}

// function watchSnapshot(url, trigger) {
//   let id = null;
//   id = setInterval(async () => {
//     const res = await fetch(url);
//     if (res.ok) {
//       clearInterval(id);
//       setUrl((u) => {
//         return new String(u);
//       });
//     }
//   }, 500);
// }

export async function triggerScreenshot(url) {
  const res = await fetch(getTriggerUrl(url));
  return res.ok;
  //watchSnapshot(getScreenshotUrl(url));
}

export function getScreenshotTarget() {
  const parse = new URL(window.location.toString());
  return config.screenshot_url || parse.searchParams.get("screenshot_url");
}
