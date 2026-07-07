import React from "react";
import { render, fireEvent } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  window.location.hash = "";
  // jsdom doesn't implement scrolling.
  window.scroll = () => {};
});

test("n advances to the next page", () => {
  render(<App />);
  fireEvent.keyUp(document.body, { key: "n" });
  expect(window.location.hash).toBe("#1");
});

test("keys typed into an input don't change the page", () => {
  const { getByTitle, baseElement } = render(<App />);
  fireEvent.click(getByTitle("Find URL"));
  // The search input is the last one rendered (the modal portal is
  // appended to the end of the body).
  const inputs = baseElement.querySelectorAll("input");
  const searchInput = inputs[inputs.length - 1];
  fireEvent.keyUp(searchInput, { key: "n" });
  expect(window.location.hash).toBe("#0");
});
