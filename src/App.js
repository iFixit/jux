import React from "react";
import { useState, useEffect, useCallback } from "react";
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
  getDefaultWidth,
  setDefaultWidth,
} from "./comparison_urls.js";
import { Preferences } from "./Preferences.js";

const { pages, comparison_target, default_comparison_source } = config;

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

function getScale(width) {
  const maxWidth = (window.innerWidth - 20) / 2;
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
  transform: ${(props) => getScale(props.width)};
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
  }, [keyHandler]);
  const updateUrl = (evt) => {
    setUrl(evt.target.value);
  };
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
    };
  });
  const width = prefs.width;

  const updateComparisonSource = () => {
    setDefaultComparisonSource(url);
    setDefaultWidth(width);
  };

  const defaults = {
    width,
  };

  const handlePreferences = (prefs) => {
    setPrefs(prefs);
  };

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
          <TextField
            size="small"
            type="text"
            onChange={updateUrl}
            value={url}
            title="Target URL"
          />
          <Button onClick={updateComparisonSource} title="Synchronize to URL">
            <Link />
          </Button>
          <SearchPane pages={pages} />
          <Preferences onSave={handlePreferences} defaults={defaults} />
        </Controls>
      </Header>
      <Comparison>
        <Page width={width} src={updated} />
        <Page width={width} src={original} />
      </Comparison>
    </div>
  );
}

export default App;
