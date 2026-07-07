import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import config from "./pages.json";
import { SearchPane } from "./SearchPane.js";
import styled from "styled-components";
import { ChevronLeft, ChevronRight, Rewind, Link } from "@core-ds/icons/16";
import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import MaterialLink from "@material-ui/core/Link";
import {
  getPageUrls,
  getDefaultComparisonSource,
  setDefaultComparisonSource,
  replaceDefaultComparisonSource,
  getDefaultWidth,
  setDefaultWidth,
  getDefaultDiff,
  setDefaultDiff,
} from "./comparison_urls.js";
import { Preferences } from "./Preferences.js";

const { pages, comparison_target, default_comparison_source } = config;

const UrlField = styled(TextField)`
  flex-grow: 1;
`;

function UrlSelector({startUrl, onSave}) {
  const [url, setUrl] = React.useState(startUrl)
  // Reflect URL changes that originate outside the field (left-pane
  // navigation, back/forward).
  React.useEffect(() => {
    setUrl(startUrl);
  }, [startUrl]);
  const updateUrl = (evt) => {
    setUrl(evt.target.value);
    evt.stopPropagation()
    evt.preventDefault()
  };
  const changeUrl = (evt) => {
    onSave(url)
  }
  const checkUrl = (evt) => {
    if (evt.key === "Enter") {
      onSave(url)
    }
  }
  return <UrlField
    size="small"
    type="text"
    onChange={updateUrl}
    onBlur={changeUrl}
    onKeyDown={checkUrl}
    onKeyUp={e => e.stopPropagation()}
    value={url}
    title="Target URL"
  />

}

const Controls = styled.div`
  display: flex;
  justify-content: start;
  align-content: bottom;
`;

const PageCount = styled.span`
  align-self: center;
  padding: 0 8px;
  white-space: nowrap;
  color: rgba(0, 0, 0, 0.6);
`;

const Header = styled.div`
  position: sticky;
  top: 0px;
  display: flex;
  flex-direction: column;
  width: 100%;
  background: white;
`;

const Comparison = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

function getScale(width, factor) {
  const maxWidth = (window.innerWidth - 20) / factor;
  if (width > maxWidth) {
    return `scale(calc(${maxWidth}/${width}))`;
  } else {
    return null;
  }
}

const BasePageFrame = styled.iframe`
  height: 5000px;
`;

// One component for both the fit (no width preference) and scaled modes:
// switching component types on a width change would unmount the iframe
// and reload it at its initial URL, losing any in-frame navigation.
const PageFrame = styled(BasePageFrame)`
  width: ${(props) => props.width || "100%"};
  transform: ${(props) => (props.width ? getScale(props.width, 2) : null)};
  transform-origin: top left;
  position: ${(props) => (props.width ? "absolute" : null)};
`;

const PageLink = styled.div`
  overflow: hidden;
  height: 1.5em;
  word-wrap: anywhere;
`;

const PageWrapper = styled.div`
  flex-basis: 50%;
  flex-grow: 1;
`;

const PageLabel = styled.div`
  font-weight: 600;
  text-align: left;
`;

// Make URLs comparable across the ways we encounter them: strip the
// protocol so `//host/path`, `https://host/path`, and a bare `host/path`
// compare equal, drop any fragment (`src` never carries one), and remove a
// trailing slash so a server canonicalizing `/Device` to `/Device/`
// doesn't read as a navigation.
function normalizeUrl(url) {
  return url
    .replace(/^(https?:)?\/\//, "")
    .replace(/#.*$/, "")
    .replace(/\/(?=\?|$)/, "");
}

// Where the framed document actually is, or null if it's cross-origin
// (a `target` on someone else's domain) and unreadable.
function getFrameLocation(frame) {
  try {
    const { href, host, pathname, search } = frame.contentWindow.location;
    return { href, hostPath: host + pathname + search };
  } catch (e) {
    return null;
  }
}

function Page({ src, width, label, onNavigate }) {
  const frameRef = useRef(null);
  // The src attribute is only used for the initial load; later changes
  // navigate the frame in place (see below), so the attribute goes stale.
  const initialSrc = useRef(src).current;
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      // The initial load is already underway via the src attribute.
      mounted.current = true;
      return;
    }
    const frame = frameRef.current;
    const location = frame && getFrameLocation(frame);
    if (location && normalizeUrl(location.href) === normalizeUrl(src)) {
      // The frame is already there — this src change is the app catching
      // up to a navigation inside the frame. Navigating again would
      // reload the page the user just landed on.
      return;
    }
    if (frame && frame.contentWindow) {
      // location.replace instead of setting the src attribute: the
      // attribute route adds a session history entry per pane update,
      // which breaks Back/Forward for the whole app. Allowed even when
      // the frame is cross-origin.
      frame.contentWindow.location.replace(src);
    }
  }, [src]);

  const handleLoad = () => {
    if (!onNavigate) {
      return;
    }
    const location = getFrameLocation(frameRef.current);
    if (location && normalizeUrl(location.hostPath) !== normalizeUrl(src)) {
      onNavigate(location.hostPath);
    }
  };

  return (
    <PageWrapper>
      {label && <PageLabel>{label}</PageLabel>}
      <PageLink>
        <MaterialLink target="_blank" rel="noopener noreferrer" href={src}>
          {src}
        </MaterialLink>
      </PageLink>
      <PageFrame src={initialSrc} width={width} ref={frameRef} onLoad={handleLoad} />
    </PageWrapper>
  );
}

const DiffBasePageFrame = styled(BasePageFrame)`
  position: absolute;
  background: white;
`;

const DiffFitPageFrame = styled(DiffBasePageFrame)`
  width: 100%;
`;

const DiffScaledPageFrame = styled(DiffBasePageFrame)`
  width: ${(props) => props.width};
  transform: ${(props) => getScale(props.width, 1)};
  transform-origin: top left;
`;

const DiffPage = ({ width, ...props }) => {
  if (width) {
    return <DiffScaledPageFrame width={width} {...props} />;
  } else {
    return <DiffFitPageFrame width={width} {...props} />;
  }
};

const OverlayDiffPage = styled(DiffPage)`
  mix-blend-mode: difference;
`;

const getDefaultIdx = () => {
  const initPage = Number(window.location.hash.slice(1));
  if (Number.isNaN(initPage)) {
    return 0;
  } else {
    return initPage;
  }
};

function App() {
  const [idx, setIdxValue] = useState(getDefaultIdx);
  const [url, setUrl] = useState(
    getDefaultComparisonSource(default_comparison_source)
  );

  // We're okay with just setting the raw index value when the hash
  // changes: yes, it might be weird if the user's also specified a
  // `target` value with a path, but we'd rather respect the user's
  // wishes than try to be clever and set `url` to the target domain
  // on `hashchange`.
  useEffect(() => {
    const onHashChange = () => setIdxValue(getDefaultIdx);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [setIdxValue]);

  // Back/forward across left-pane navigations: restore the URL from the
  // `target` param, falling back to the default when the entry predates
  // any navigation. Hash-only popstates (next/prev) leave `target`
  // unchanged, so the functional update makes them no-ops.
  useEffect(() => {
    const onPopState = () => {
      const target = getDefaultComparisonSource(default_comparison_source);
      setUrl((prev) => (target !== prev ? target : prev));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [setUrl]);
  const urlPart = pages[idx];
  const { original, updated, targetDomain } = getPageUrls(
    url,
    urlPart,
    comparison_target
  );

  const setIdx = useCallback(
    (f) => {
      if (targetDomain !== url) {
        setUrl(targetDomain);
      }
      setIdxValue(f);
    },
    [targetDomain, url, setUrl, setIdxValue]
  );

  const first = () => setIdx(0);
  const next = useCallback(
    () => setIdx((idx) => (idx + 1 < pages.length ? idx + 1 : idx)),
    [setIdx]
  );
  const prev = useCallback(() => setIdx((idx) => (idx > 0 ? idx - 1 : idx)), [
    setIdx,
  ]);
  useEffect(() => {
    window.location.hash = idx;
  }, [idx]);
  const keyHandler = useCallback(
    (evt) => {
      if (evt.cancelBubble) {
        return
      }
      // Don't hijack keys while the user is typing in a field (search box,
      // width input, etc.) — otherwise n/f/p/b navigate pages mid-type.
      const tag = evt.target && evt.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        return;
      }
      switch (evt.key) {
        case "n":
        case "ArrowRight":
        case "f":
          next();
          return;
        case "p":
        case "b":
        case "ArrowLeft":
          prev();
          return;
        default:
          // Don't do anything for other keys.
          return;
      }
    },
    [next, prev]
  );
  useEffect(() => {
    document.addEventListener("keyup", keyHandler);
    return () => document.removeEventListener("keyup", keyHandler);
  }, [keyHandler]);
  useEffect(() => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [original, updated]);

  const [prefs, setPrefs] = useState(() => {
    return {
      width: getDefaultWidth() || "",
      diff: getDefaultDiff() || false,
    };
  });
  const width = prefs.width;
  const diff = prefs.diff;

  const updateComparisonSource = () => {
    setDefaultComparisonSource(url);
    setDefaultWidth(width);
    setDefaultDiff(diff);
  };

  const defaults = {
    width,
    diff,
  };

  const handlePreferences = (prefs) => {
    setPrefs(prefs);
  };

  // A link click or other navigation inside the left pane: mirror it in
  // the app URL and let the right pane follow. The frame's navigation
  // already added the history entry, so only replace the URL on it —
  // Back/Forward then traverse the frame's own entries and the popstate
  // handler keeps the rest of the app in step.
  const handleFrameNavigate = useCallback(
    (hostPath) => {
      if (hostPath === url) {
        return;
      }
      setUrl(hostPath);
      replaceDefaultComparisonSource(hostPath);
    },
    [url, setUrl]
  );

  const Comparison = prefs.diff ? DiffComparison : SideBySideComparison;

  return (
    <div className="App">
      <Header>
        <LinearProgress
          variant="determinate"
          value={(100 * (idx + 1)) / pages.length}
        />
        <Controls>
          <Button onClick={first} title="First" disabled={idx === 0}>
            <Rewind />
          </Button>
          <Button onClick={prev} title="Previous (p)" disabled={idx === 0}>
            <ChevronLeft />
          </Button>
          <Button
            onClick={next}
            title="Next (n)"
            disabled={idx >= pages.length - 1}
          >
            <ChevronRight />
          </Button>
          <PageCount>
            {idx + 1} / {pages.length}
          </PageCount>
          <UrlSelector
            onSave={setUrl}
            startUrl={url}
          />
          <Button onClick={updateComparisonSource} title="Synchronize to URL">
            <Link />
          </Button>
          <SearchPane pages={pages} />
          <Preferences onSave={handlePreferences} defaults={defaults} />
        </Controls>
      </Header>
      <Comparison
        width={width}
        original={original}
        updated={updated}
        onNavigate={handleFrameNavigate}
      />
    </div>
  );
}

function DiffComparison({ width, updated, original }) {
  return (
    <Comparison>
      <DiffPage width={width} src={updated} />
      <OverlayDiffPage width={width} src={original} />
    </Comparison>
  );
}

function SideBySideComparison({ width, updated, original, onNavigate }) {
  return (
    <Comparison>
      <Page width={width} src={updated} label="Updated" onNavigate={onNavigate} />
      <Page width={width} src={original} label="Original" />
    </Comparison>
  );
}

export default App;
