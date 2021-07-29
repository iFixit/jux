import React, { useState } from "react";
import Modal from "@material-ui/core/Modal";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { Search, Image } from "@core-ds/icons/16";
import styled from "styled-components";
import { getScreenshotTarget } from "./screenshot_urls";

export function SearchPane({ pages, triggerScreenshot }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const updateSearch = (evt) => {
    setSearch(evt.target.value);
  };
  const re = new RegExp(search, "i");
  const filtered = pages.filter((page) => re.test(page));
  const closeModal = () => setOpen(false);
  const triggerSnapshots = () => {
    filtered.forEach((page) => triggerScreenshot(page));
  };
  return (
    <>
      <Button onClick={() => setOpen(true)} title="Find URL">
        <Search />
      </Button>
      <Modal open={open} onClose={closeModal}>
        <SearchDialog>
          <div>
            <TextField autoFocus onChange={updateSearch} />
            {getScreenshotTarget() && (
              <Button onClick={triggerSnapshots} title="Run Screenshots">
                <Image />
              </Button>
            )}
          </div>
          <Results close={closeModal} pages={filtered} />
        </SearchDialog>
      </Modal>
    </>
  );
}

function Results({ close, pages }) {
  return (
    <Scroller>
      {pages.map((page, idx) => {
        return (
          <ResultLink onClick={close} href={`#${idx}`}>
            {page}
          </ResultLink>
        );
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

const Scroller = styled.div`
  width: 100%;
  flex-grow: 1;
  overflow: scroll;
`;

const ResultLink = styled.a`
  display: block;
  padding-bottom: 4px;
`;
