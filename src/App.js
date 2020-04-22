import React from "react";
import { useState, useEffect } from "react";
import config from "./pages.json";
import styled from "styled-components";
import { ChevronLeft, ChevronRight, Rewind, Search } from "@core-ds/icons/16";
import Modal from "@material-ui/core/Modal";
import Paper from "@material-ui/core/Paper";

const { pages, comparison_target, default_comparison_source } = config;
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
        <a href={src}>{src}</a>
      </PageLink>
      <PageFrame src={src} width={width} />
    </PageWrapper>
  );
}

const ResultLink = styled.a`
  display: block;
  padding-bottom: 4px;
`;

const Scroller = styled.div`
  width: 100%;
  flex-grow: 1;
  overflow: scroll;
`;

function Results({ search, close }) {
  const re = new RegExp(search, "i");
  return (
    <Scroller>
      {pages.map((page, idx) => {
        if (re.test(page)) {
          return (
            <ResultLink onClick={close} href={`#${idx}`}>
              {page}
            </ResultLink>
          );
        }
      })}
    </Scroller>
  );
}

const SearchDialog = styled(Paper)`
  position: absolute;
  width: max-content;
  max-width: 80%;
  max-height: 80%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
`;

function SearchPane() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const updateSearch = (evt) => {
    setSearch(evt.target.value);
  };
  const closeModal = () => setOpen(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>
        <Search />
      </button>
      <Modal open={open} onClose={closeModal}>
        <SearchDialog>
          <div>
            <input type="text" autoFocus onChange={updateSearch}></input>
          </div>
          <Results close={closeModal} search={search} />
        </SearchDialog>
      </Modal>
    </>
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
    default_comparison_source || window.location.host
  );
  const updateUrl = (evt) => {
    setDomain(evt.target.value);
  };
  const urlPart = pages[idx];
  const updatedPageUrl = `https://${domain}/${urlPart}`;
  const pageUrl = `https://${comparison_target}/${urlPart}`;
  useEffect(() => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pageUrl, updatedPageUrl]);
  const [width, setWidth] = useState();
  const updateWidth = (evt) => {
    setWidth(evt.target.value);
  };
  return (
    <div className="App">
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
        <label>
          Width
          <input type="numeric" onChange={updateWidth} value={width} />
        </label>
        <SearchPane />
      </Controls>
      <Comparison>
        <Page width={width} src={updatedPageUrl} />
        <Page width={width} src={pageUrl} />
      </Comparison>
    </div>
  );
}

export default App;
