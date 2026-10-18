# Archive search: paired local census

Run with Node.js 18 or newer (no dependencies and no network):

```sh
node run-study.cjs
```

The output is `run-output/results.json`. The captured run used Node.js 18.20.8. `protocol.json` binds the fixed queries and both snapshots by SHA-256; modified inputs stop the run. The retained result is `captured-run/results.json`.

## Scope and design

This is a completed descriptive evaluation of this archive's own search, using real index artifacts. It is not a Google/AI ranking experiment. Before = preserved v9 audit baseline; after = the corrected v9.1 snapshot before this report was inserted. Later edits do not silently change the frozen dataset. The evaluator uses the same scoring rules on both snapshots.

All 45 tool-card IDs present in both versions are included. Two removed venue records and three newly split cards cannot be paired and are listed in the protocol. Current display names form the query set. The editor knew about the indexing problem before fixing the protocol: this is neither blind testing nor independent preregistration.

## Results

| Metric | Before | After |
|---|---:|---:|
| Target's indexed text contains every query token | 2/45 | 45/45 |
| Exact target at rank 1 | 42/45 | 45/45 |
| Exact target within top 5 | 42/45 | 45/45 |
| Mean reciprocal rank | 0.933333 | 1.000000 |

Correct title matches masked widespread misattached body text in the old index. The corrected snapshot satisfies both retrieval and text alignment for the matched set. The 45 rows and top-five results are supplied, including the three failed old queries.

## Limits

Both code and content changed between editions, so the contrast does not isolate a causal code-change effect. Tool-name queries are easy, selected by construction and not representative of natural reader questions. Substring token presence is a narrow alignment check, not a judgment of semantic snippet quality. These are census counts for the frozen set, not a population estimate. No confidence interval or p-value is appropriate for claims about a larger unobserved population. Nothing here establishes manipulation efficacy or live search outcomes.
