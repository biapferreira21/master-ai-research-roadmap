import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the AI Research Roadmap", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /AI Research Roadmap/);
  assert.match(html, /Learn the field/);
  assert.match(html, /Build the frontier/);
  assert.match(html, /20(?:<!-- -->)? carefully ordered courses/);
  assert.match(html, /350(?:<!-- -->)? lectures complete/);
  assert.match(html, /Research library/);
  assert.match(html, /1,028/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps third-party university PDFs outside the public repository", async () => {
  const [courseData, readme, gitignore] = await Promise.all([
    readFile(new URL("../app/course-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../.gitignore", import.meta.url), "utf8"),
  ]);

  assert.match(courseData, /url: cs229NotesSource/);
  assert.doesNotMatch(courseData, /url: `\/cs229-notes/);
  assert.match(gitignore, /\/public\/cs229-notes\//);
  assert.match(readme, /does \*\*not\*\* redistribute the third-party university PDFs/i);
  await assert.rejects(access(new URL("../public/cs229-notes", import.meta.url)));
});
