import { describe, it, expect } from "vitest";
import { parseAiJson } from "../lib/ai/parse";

describe("parseAiJson", () => {
  it("parses clean minified JSON", () => {
    const r = parseAiJson('{"topic":"React","summary":"Debugging","narrative":"Fixing hydration.","todos":[],"groups":[],"continueHint":"Resume SO tab."}');
    expect(r.topic).toBe("React");
    expect(r.summary).toBe("Debugging");
    expect(r.continueHint).toBe("Resume SO tab.");
  });

  it("strips ```json code fences", () => {
    const r = parseAiJson('```json\n{"topic":"Go"}\n```');
    expect(r.topic).toBe("Go");
  });

  it("recovers a JSON block embedded in prose", () => {
    const r = parseAiJson('Here is your result: {"topic":"Rust"} hope that helps');
    expect(r.topic).toBe("Rust");
  });

  it("returns safe defaults for total garbage", () => {
    const r = parseAiJson("not json at all");
    expect(r).toEqual({ topic: "Unknown", summary: "", narrative: "", todos: [], groups: [], continueHint: "" });
  });

  it("returns safe defaults for empty input", () => {
    const r = parseAiJson("");
    expect(r.topic).toBe("Unknown");
    expect(r.todos).toEqual([]);
  });

  it("accepts todos given as bare strings", () => {
    const r = parseAiJson('{"todos":["Fix the bug","Write a test"]}');
    expect(r.todos).toEqual([{ text: "Fix the bug" }, { text: "Write a test" }]);
  });

  it("keeps a valid deadline and drops a malformed one", () => {
    const r = parseAiJson('{"todos":[{"text":"Ship","deadline":"2026-06-30"},{"text":"Later","deadline":"soon"}]}');
    expect(r.todos[0].deadline).toBe("2026-06-30");
    expect(r.todos[1].deadline).toBeUndefined();
  });

  it("drops todo objects with no text", () => {
    const r = parseAiJson('{"todos":[{"deadline":"2026-06-30"},{"text":"Real"}]}');
    expect(r.todos).toEqual([{ text: "Real", deadline: undefined, source: undefined }]);
  });

  it("filters non-numeric tabIds and empty-label groups", () => {
    const r = parseAiJson('{"groups":[{"label":"Docs","tabIds":[1,"2",3]},{"label":"","tabIds":[4]},{"label":"Empty","tabIds":[]}]}');
    expect(r.groups).toEqual([{ label: "Docs", tabIds: [1, 3] }]);
  });

  it("clamps over-long fields", () => {
    const long = "x".repeat(1000);
    const r = parseAiJson(JSON.stringify({ topic: long, summary: long, narrative: long, continueHint: long }));
    expect(r.topic.length).toBe(40);
    expect(r.summary.length).toBe(200);
    expect(r.narrative.length).toBe(600);
    expect(r.continueHint.length).toBe(200);
  });

  it("caps todos at 8 and groups at 6", () => {
    const todos = Array.from({ length: 20 }, (_, i) => ({ text: `t${i}` }));
    const groups = Array.from({ length: 20 }, (_, i) => ({ label: `g${i}`, tabIds: [i] }));
    const r = parseAiJson(JSON.stringify({ todos, groups }));
    expect(r.todos).toHaveLength(8);
    expect(r.groups).toHaveLength(6);
  });
});
