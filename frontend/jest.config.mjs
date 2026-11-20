import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: import.meta.dirname });

export default createJestConfig({
  displayName: "frontend",
  // Node by default; a test that needs the DOM adds `@jest-environment jsdom` and installs jest-environment-jsdom.
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.{ts,tsx}"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
});
