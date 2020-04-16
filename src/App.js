import React from "react";
import { useState, useEffect } from "react";
import config from "./pages.json";
import styled from "styled-components";
import { ChevronLeft, ChevronRight, Rewind } from "@core-ds/icons/16";

const { pages, comparison_target } = config;
const Controls = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  height: 25px;
`;

const Comparison = styled.div`
  padding-top: 25px;
  width: 100%;
  height: 100%;
  display: flex;
`;

const PageFrame = styled.iframe`
  height: 5000px;
  width: 100%;
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

function Page({ src }) {
  return (
    <PageWrapper>
      <PageLink>
        <a href={src}>{src}</a>
      </PageLink>
      <PageFrame src={src} />
    </PageWrapper>
  );
}

function App() {
  const [idx, setIdx] = useState(() => {
    const initPage = Number(window.location.hash.slice(1));
    if (Number.isNaN(initPage)) {
      return 0;
    } else {
      return initPage;
    }
  });
  const first = () => setIdx(0);
  const next = () => setIdx((idx) => idx + 1);
  const prev = () => setIdx((idx) => idx - 1);
  useEffect(() => {
    window.location.hash = idx;
  }, [idx]);
  const keyHandler = (evt) => {
    switch (evt.key) {
      case "n":
      case "ArrowRight":
        next();
        return;
      case "p":
      case "ArrowLeft":
        prev();
        return;
    }
  };
  const [domain, setDomain] = useState(window.location.host);
  const updateUrl = (evt) => {
    setDomain(evt.target.value);
  };
  const urlPart = pages[idx];
  const updatedPageUrl = `https://${domain}/${urlPart}`;
  const pageUrl = `https://${comparison_target}/${urlPart}`;
  return (
    <div className="App" onKeyUp={keyHandler}>
      <Controls>
        <button onClick={first}>
          <Rewind />
        </button>
        <button onClick={prev}>
          <ChevronLeft />
        </button>
        <button onClick={next}>
          <ChevronRight />
        </button>
        <input type="text" onChange={updateUrl} value={domain} />
      </Controls>
      <Comparison>
        <Page src={updatedPageUrl} />
        <Page src={pageUrl} />
      </Comparison>
    </div>
  );
}

export default App;
