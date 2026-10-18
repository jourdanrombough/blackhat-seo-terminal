# Offline research and defense teaching kit

Version **1.0.0**. All inputs are invented fixtures. This kit makes no network requests, installs no packages, runs no malware, calls no language model and changes no site or ranking. It demonstrates bounded local mechanisms and common interpretation errors.

## Run

Download this folder, or extract `offline-defense.zip` from the Labs page. Keep `run_labs.py`, `fixtures.json` and `expected-results.json` together. Use a terminal in the extracted `offline-defense` folder:

```sh
python3 run_labs.py
```

On Windows with the Python launcher:

```powershell
py -3 run_labs.py
```

Requires Python 3.10 or newer; the committed run used CPython 3.14.2 on macOS. Other Python/OS combinations have not been exercised in this edition. There are **zero external dependencies**. The fixture and kit versions are fixed; `expected-results.json` includes the fixture SHA-256. A code or fixture change that alters the result fails the expected-output comparison. Review an intentional change before replacing the baseline.

Output goes to `run-output/` beside the script. Use `--output-dir /path/to/folder` if the extracted folder is read-only. Existing `results.json`, `results.txt` and `runtime.json` in that output directory are replaced. All other files are left alone.

Expected terminal output:

```text
PASS lab 1: lab1
PASS lab 2: lab2
PASS lab 3: lab3
PASS lab 4: lab4
PASS lab 5: lab5
PASS lab 6: lab6
PASS: 6 offline demonstrations, 33 assertions
PASS: output matches committed expected-results.json
Scope: synthetic fixtures only; no search-engine or LLM efficacy measured.
```

## Artifacts and what they establish

| File | Purpose |
| --- | --- |
| `fixtures.json` | Human-readable, invented inputs for all six demonstrations. |
| `run_labs.py` | Complete standard-library implementation with explicit correctness assertions. |
| `expected-results.json` | Committed output baseline; generated from the reviewed fixtures and code, not an independently measured dataset. |
| `captured-run/results.json` | Actual output of the authoring run. |
| `captured-run/results.txt` | Actual successful command output. |
| `captured-run/runtime.json` | Actual interpreter and operating-system details. |
| `observation-template.json` | Blank record structure for a future authorized observation. It is not a result. |

The run verifies the supplied arithmetic, parsers and rules on these fixtures. It does not estimate general accuracy, real-world prevalence, false-positive rates, ranking effects, vendor effectiveness or LLM vulnerability rates. Tests and fixtures were written together for instruction, so this is not independent validation.

## Six demonstrations

1. **Confounding and controls.** A single joint change of 3 is compatible with link effects `(3, 0)`, `(0, 3)` and `(1, 2)`. The source-specific effect is not identified. A separate synthetic treated/control calculation returns a difference in differences of 3. Real studies additionally require a justified parallel-trends assumption, uncertainty estimates and independent units.
2. **File-integrity triage.** Hash three baseline files and compare an observed snapshot. Detect one added page, one deleted page and two modifications. An approved CSS deployment is separated from three unreviewed changes. A hash mismatch is a change, not proof of compromise.
3. **Crawler/browser response comparison.** Formatting-only HTML yields the same normalized text; an unrelated content response needs review; a 403/200 mismatch needs access-control diagnosis. The small parser is not a browser or CSS visibility engine. User-agent labels in a fixture do not authenticate a real crawler.
4. **Citation measurement.** Six fictional response records produce `2/3` cited runs in each condition. Two anchors on the same URL in one response count once. Missing citations remain in the denominator. No search engine was queried and no content format has a measured advantage.
5. **Instruction/data boundary.** A deliberately vulnerable deterministic toy appends `BANANA` for a document instruction. Removing the fixture's hidden element stops that one input but leaves a visible instruction effective. A fixed fact schema emits only the product and power, or abstains when a required fact is absent. That restriction is implemented in code; it is not an LLM guardrail efficacy claim. This regex parser is not a general extraction or security library.
6. **Synthetic poisoning-pattern triage.** One invented event combines an unapproved new page, a material response difference and download-lure text. It is escalated for a human; an approved release and a new campaign page show why one signal is insufficient. There is no executable attachment or live indicator. This three-signal rule is a teaching example, not a production rule or trained detector.

## Troubleshooting and controlled changes

- `python3` not found: install an appropriate supported Python distribution using your normal software-management process, or use the Windows launcher. No install command is embedded in the kit.
- `FileNotFoundError`: extract all files together. Running only the downloaded script is insufficient.
- Expected-output mismatch: check the fixture SHA-256, local edits and interpreter version. Preserve the failing output and investigate; do not make a failure disappear by accepting any new output.
- Permission denied for outputs: select a writable `--output-dir`.
- To test a new case, copy the kit to a separate working folder, describe the expected outcome first, add a fixture and a corresponding assertion, then review the resulting changes. Keep the committed teaching baseline intact.

## Moving from this kit to actual research

The four studies in the website's Experiments chapter remain **proposed and unexecuted**. Before collecting any public-web observation, define the research question, unit of analysis, sampling frame, outcome, stopping rule and exclusions. Record access authority, dates, product/model version, query, locale, device, account/session conditions and raw artifacts. Preserve unsuccessful and null observations. Do not treat a local simulator or a before/after traffic change as a controlled experiment on a search engine.

Use only systems you are authorized to inspect. Keep synthetic local demonstrations offline. Nothing here instructs readers to buy links, generate deceptive clicks, deliver malware or publish low-value pages into a live index.
