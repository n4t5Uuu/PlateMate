import { tablesWithRlsOff } from "../db/src/verify-rls";

describe("tablesWithRlsOff", () => {
  it("is empty when every table has RLS on", () => {
    expect(
      tablesWithRlsOff([{ relname: "users", relrowsecurity: true }]),
    ).toEqual([]);
  });

  it("names every table with RLS off", () => {
    expect(
      tablesWithRlsOff([
        { relname: "users", relrowsecurity: true },
        { relname: "workspaces", relrowsecurity: false },
        { relname: "projects", relrowsecurity: false },
      ]),
    ).toEqual(["workspaces", "projects"]);
  });
});
