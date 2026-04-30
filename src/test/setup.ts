import "@testing-library/jest-dom/vitest";

Object.defineProperty(window.navigator, "language", {
  value: "de-AT",
  configurable: true,
});

Object.defineProperty(window.navigator, "languages", {
  value: ["de-AT", "de"],
  configurable: true,
});
