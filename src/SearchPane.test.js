import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { SearchPane } from "./SearchPane.js";

const pages = ["wiki/Kangaroo", "wiki/Wallaby"];

function openSearch() {
  const utils = render(<SearchPane pages={pages} />);
  fireEvent.click(utils.getByTitle("Find URL"));
  const input = utils.baseElement.querySelector("input");
  return { ...utils, input };
}

test("an invalid regex matches nothing instead of throwing", () => {
  const { input, baseElement } = openSearch();
  fireEvent.change(input, { target: { value: "(" } });
  expect(baseElement.querySelectorAll("a").length).toBe(0);
});

test("a valid pattern filters the page list", () => {
  const { input, baseElement } = openSearch();
  fireEvent.change(input, { target: { value: "(" } });
  fireEvent.change(input, { target: { value: "kanga" } });
  const links = baseElement.querySelectorAll("a");
  expect(links.length).toBe(1);
  expect(links[0].textContent).toBe("wiki/Kangaroo");
});
