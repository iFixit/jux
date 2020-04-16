import React from "react";
import { useState, useEffect } from "react";
import config from "./pages.json";
import styled from "styled-components";
import { ChevronLeft, ChevronRight } from "@core-ds/icons/16";

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
  height: 3000px;
  width: 100%;
`;

const PageLink = styled.a`
  display: block;
`;

const PageWrapper = styled.div`
  flex-grow: 1;
`;

function Page({ src }) {
  return (
    <PageWrapper>
      <PageLink href={src}>{src}</PageLink>
      <PageFrame src={src} />
    </PageWrapper>
  );
}

function App() {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((idx) => idx + 1);
  const prev = () => setIdx((idx) => idx - 1);
  const keyHandler = (evt) => {
    switch (evt.key) {
      case "ArrowRight":
        next();
        return;
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
        <button onClick={prev}>
          <ChevronLeft />
        </button>
        <button onClick={next}>
          <ChevronRight />
        </button>
        <input type="text" onChange={updateUrl} value={domain} />
      </Controls>
      <Comparison>
        <Page src={pageUrl} />
        <Page src={updatedPageUrl} />
      </Comparison>
    </div>
  );
}

export default App;