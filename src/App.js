import React from "react";
import { useState, useEffect, useCallback } from "react";
import config from "./pages.json";
import { SearchPane } from "./SearchPane.js";
import styled from "styled-components";
import {
  ChevronLeft,
  ChevronRight,
  Rewind,
  Link,
  Image,
} from "@core-ds/icons/16";
import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import MaterialLink from "@material-ui/core/Link";
import {
  getPageUrls,
  getDefaultComparisonSource,
  setDefaultComparisonSource,
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

const FitPageFrame = styled(BasePageFrame)`
  width: 100%;
`;

const ScaledPageFrame = styled(BasePageFrame)`
  width: ${(props) => props.width};
  transform: ${(props) => getScale(props.width, 2)};
  transform-origin: top left;
  position: absolute;
`;

const PageFrame = ({ width, ...props }) => {
  if (width) {
    return <ScaledPageFrame width={width} {...props} />;
  } else {
    return <FitPageFrame width={width} {...props} />;
  }
};

const PageLink = styled.div`
  overflow: hidden;
  height: 1.5em;
  word-wrap: anywhere;
`;

const PageWrapper = styled.div`
  flex-basis: 50%;
  flex-grow: 1;
`;

function Page({ src, width }) {
  return (
    <PageWrapper>
      <PageLink>
        <MaterialLink target="_blank" rel="noopener noreferrer" href={src}>
          {src}
        </MaterialLink>
      </PageLink>
      <PageFrame src={src} width={width} />
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
    window.addEventListener("hashchange", () => setIdxValue(getDefaultIdx));
  }, [setIdxValue]);
  const urlPart = pages[idx];
  const {
    original: original_url,
    updated: updated_url,
    targetDomain,
  } = getPageUrls(url, urlPart, comparison_target);

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

  const [prefs, setPrefs] = useState(() => {
    return {
      width: getDefaultWidth() || "",
      diff: getDefaultDiff() || false,
      screenshot: false,
    };
  });
  const width = prefs.width;
  const diff = prefs.diff;
  const screenshot = prefs.screenshot;

  const updateComparisonSource = () => {
    setDefaultComparisonSource(url);
    setDefaultWidth(width);
    setDefaultDiff(diff);
  };

  const defaults = {
    width,
    diff,
    screenshot,
  };

  const handlePreferences = (prefs) => {
    setPrefs(prefs);
  };

  const original = screenshot ? getScreenshotUrl(original_url) : original_url;
  const updated = screenshot ? getScreenshotUrl(updated_url) : updated_url;

  function watchSnapshot(url) {
    let id = null;
    id = setInterval(async () => {
      const res = await fetch(url);
      if (res.ok) {
        clearInterval(id);
        setUrl((u) => {
          return new String(u);
        });
      }
    }, 500);
  }
  const triggerSnapshot = () => {
    fetch(getTriggerUrl(original_url));
    fetch(getTriggerUrl(updated_url));
    watchSnapshot(original);
    watchSnapshot(updated);
  };

  useEffect(() => {
    document.addEventListener("keyup", keyHandler);
  }, [keyHandler]);
  useEffect(() => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [original, updated]);

  const Comparison = prefs.diff ? DiffComparison : SideBySideComparison;

  return (
    <div className="App">
      <Header>
        <LinearProgress
          variant="determinate"
          value={(100 * (idx + 1)) / pages.length}
        />
        <Controls>
          <Button onClick={first} title="First">
            <Rewind />
          </Button>
          <Button onClick={prev} title="Previous">
            <ChevronLeft />
          </Button>
          <Button onClick={next} title="Next">
            <ChevronRight />
          </Button>
          <UrlSelector onSave={setUrl} startUrl={url} />
          <Button onClick={updateComparisonSource} title="Synchronize to URL">
            <Link />
          </Button>
          <Button onClick={triggerSnapshot} title="Trigger snapshot">
            <Image />
          </Button>
          <SearchPane pages={pages} />
          <Preferences onSave={handlePreferences} defaults={defaults} />
        </Controls>
      </Header>
      <Comparison width={width} original={original} updated={updated} />
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

function SideBySideComparison({ width, updated, original }) {
  return (
    <Comparison>
      <Page width={width} src={updated} />
      <Page width={width} src={original} />
    </Comparison>
  );
}

function getScreenshotUrl(url) {
  const parse = new URL("http://localhost:3000/screenshot");
  parse.searchParams.set("url", url);
  return parse.toString();
}

function getTriggerUrl(url) {
  const parse = new URL("http://localhost:3000/start");
  parse.searchParams.set("url", url);
  return parse.toString();
}

export default App;
