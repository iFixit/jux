import React from "react";
import { useState, useEffect } from "react";
import config from "./pages.json";
import { SearchPane } from "./SearchPane.js";
import styled from "styled-components";
import { ChevronLeft, ChevronRight, Rewind } from "@core-ds/icons/16";
import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { getPageUrls, getDefaultComparisonSource } from "./comparison_urls.js";

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

const PageFrame = styled.iframe`
  height: 5000px;
  width: ${(props) => props.width || "100%"};
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

function Page({ src, width }) {
  return (
    <PageWrapper>
      <PageLink>
        <a target="_blank" rel="noopener noreferrer" href={src}>
          {src}
        </a>
      </PageLink>
      <PageFrame src={src} width={width} />
    </PageWrapper>
  );
}

function App() {
  const getIdx = () => {
    const initPage = Number(window.location.hash.slice(1));
    if (Number.isNaN(initPage)) {
      return 0;
    } else {
      return initPage;
    }
  };
  const [idx, setIdx] = useState(getIdx);
  useEffect(() => {
    window.addEventListener("hashchange", () => setIdx(getIdx));
  }, []);
  const first = () => setIdx(0);
  const next = () => setIdx((idx) => (idx + 1 < pages.length ? idx + 1 : idx));
  const prev = () => setIdx((idx) => (idx > 0 ? idx - 1 : idx));
  useEffect(() => {
    window.location.hash = idx;
  }, [idx]);
  const keyHandler = (evt) => {
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
    }
  };
  useEffect(() => {
    document.addEventListener("keyup", keyHandler);
  }, []);
  const [domain, setDomain] = useState(
    getDefaultComparisonSource(default_comparison_source)
  );
  const updateUrl = (evt) => {
    setDomain(evt.target.value);
  };
  const urlPart = pages[idx];
  const { original, updated } = getPageUrls(domain, urlPart, comparison_target);
  useEffect(() => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [original, updated]);
  const [width, setWidth] = useState();
  const updateWidth = (evt) => {
    setWidth(evt.target.value);
  };
  return (
    <div className="App">
      <Header>
        <LinearProgress
          variant="determinate"
          value={(100 * (idx + 1)) / pages.length}
        />
        <Controls>
          <Button onClick={first}>
            <Rewind />
          </Button>
          <Button onClick={prev}>
            <ChevronLeft />
          </Button>
          <Button onClick={next}>
            <ChevronRight />
          </Button>
          <TextField
            size="small"
            type="text"
            onChange={updateUrl}
            value={domain}
          />
          <TextField
            placeholder="Width"
            size="small"
            id="widthField"
            type="numeric"
            onChange={updateWidth}
            value={width}
          />
          <SearchPane pages={pages} />
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
