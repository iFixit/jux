import React, { useState } from "react";
import Modal from "@material-ui/core/Modal";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import { Search } from "@core-ds/icons/16";
import styled from "styled-components";

export function SearchPane({ pages }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const updateSearch = (evt) => {
    setSearch(evt.target.value);
  };
  const closeModal = () => setOpen(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} title="Find URL">
        <Search />
      </Button>
      <Modal open={open} onClose={closeModal}>
        <SearchDialog>
          <div>
            <input
              type="text"
              autoFocus
              placeholder="Filter pages…"
              onChange={updateSearch}
            ></input>
          </div>
          <Results close={closeModal} search={search} pages={pages} />
        </SearchDialog>
      </Modal>
    </>
  );
}

function Results({ search, close, pages }) {
  let re;
  try {
    re = new RegExp(search, "i");
  } catch {
    // Invalid regex (e.g. an unclosed paren while typing) — match nothing
    // instead of throwing and white-screening the whole app.
    re = null;
  }
  const matches = re
    ? pages
        .map((page, idx) => ({ page, idx }))
        .filter(({ page }) => re.test(page))
    : [];
  return (
    <Scroller>
      {matches.length === 0 ? (
        <NoResults>No matching pages</NoResults>
      ) : (
        matches.map(({ page, idx }) => (
          <ResultLink key={idx} onClick={close} href={`#${idx}`}>
            {page}
          </ResultLink>
        ))
      )}
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

const NoResults = styled.div`
  padding: 8px 0;
  color: rgba(0, 0, 0, 0.5);
`;
