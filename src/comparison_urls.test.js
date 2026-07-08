import { getPageUrls } from "./comparison_urls.js";

test("maps a page path onto both the source and comparison domains", () => {
  const { original, updated, targetDomain } = getPageUrls(
    "es.wikipedia.org",
    "wiki/Kangaroo",
    "en.wikipedia.org"
  );
  expect(updated).toBe("https://es.wikipedia.org/wiki/Kangaroo");
  expect(original).toBe("https://en.wikipedia.org/wiki/Kangaroo");
  expect(targetDomain).toBe("es.wikipedia.org");
});

test("applies sub-subdomains to the comparison target", () => {
  const { original, updated } = getPageUrls(
    "foo.es.wikipedia.org",
    "wiki/Kangaroo",
    "en.wikipedia.org"
  );
  expect(updated).toBe("https://foo.es.wikipedia.org/wiki/Kangaroo");
  expect(original).toBe("https://foo.en.wikipedia.org/wiki/Kangaroo");
});

test("a path on the source URL overrides the page path", () => {
  const { original, updated } = getPageUrls(
    "es.wikipedia.org/custom/path",
    "wiki/Kangaroo",
    "en.wikipedia.org"
  );
  expect(updated).toBe("https://es.wikipedia.org/custom/path");
  expect(original).toBe("https://en.wikipedia.org/custom/path");
});
