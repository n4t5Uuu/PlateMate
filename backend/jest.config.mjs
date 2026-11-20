export default {
  displayName: "backend",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  // SWC strips types only; `pnpm typecheck` checks them.
  transform: { "^.+\\.ts$": ["@swc/jest"] },
};
