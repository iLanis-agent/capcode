# CapCode

Capacitor marking decoder, encoder, and electrolytic lifetime estimator. Static, no build, no dependencies. Open `app.html` or visit the GitHub Pages site.

## What it does

- **Decode markings**: 3-digit EIA codes (`104` = 100 nF), unit-letter shorthand (`4u7` = 4.7 uF, `n47` = 0.47 nF, `4R7` = 4.7 pF), bare picofarad numbers (`47`), and trailing tolerance letters (`103K` = 10 nF, 10%).
- **Encode**: enter a value in pF/nF/uF and get the standard EIA or shorthand marking.
- **Lifetime**: electrolytic lifetime estimate using the Arrhenius approximation - life doubles for every 10 degC below the rated temperature.

## Tolerance letters

F = 1%, G = 2%, J = 5%, K = 10%, M = 20%, Z = -20/+80% (reported as 80%).

## Approximations and limits

- Multiplier digit 7-9 in a 3-digit code is rejected: in practice those denote pF-range parts and are ambiguous with tolerances.
- EIA-96 SMD resistor-style codes are not supported.
- The lifetime estimate is the standard 10-degree doubling rule, a common approximation; real parts vary with ripple current and series.

## Development

Pure JS engine (`engine.js`), browser and Node compatible. Tests run the engine against a python oracle (`tests/build_corpus.py` generates `tests/expected.json`):

```
python3 tests/build_corpus.py
node tests/run_tests.js
```

Built as app #393 of the app factory.
