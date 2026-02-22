---
name: code-metrics
description: Quantitative code quality analysis across 4 layers (physical, structural, evolution, semantic). Use when evaluating codebase health, identifying refactoring targets, or tracking architectural drift.
---

# Code Metrics Skill

Quantitative code quality analysis providing measurable, repeatable metrics across 4 layers. Complements qualitative `/code-review` with hard numbers.

## When to Activate

- Evaluating overall codebase health
- Identifying refactoring priorities (hotspot detection)
- Checking architectural compliance (layer violations, circular deps)
- Before/after major refactoring to measure improvement
- Sprint retrospectives or technical debt reviews

## Analysis Modes

| Mode | Layers | Use Case |
|------|--------|----------|
| `quick` | L1 only | Fast pulse-check during coding |
| `architecture` | L1 + L2 | Dependency analysis, before/after refactoring |
| `hotspots` | L1 + L3 | Identify refactoring priorities |
| `drift` | L2 focused | Layer violations, circular deps |
| `full` | L1-L4 | Comprehensive health report |

When the user specifies a mode, run only the layers listed. Default to `full` if no mode is specified.

---

## Layer 1: Physical Metrics

Measures raw code characteristics per file.

### Collection Commands

```bash
# Lines of code per file (exclude blank lines and node_modules)
find src -name '*.ts' -o -name '*.tsx' | xargs wc -l | sort -rn | head -30

# Function count per file
grep -rn 'function \|=> {' src --include='*.ts' --include='*.tsx' | \
  cut -d: -f1 | sort | uniq -c | sort -rn | head -20

# Export count per file
grep -rn '^export ' src --include='*.ts' --include='*.tsx' | \
  cut -d: -f1 | sort | uniq -c | sort -rn | head -20

# Nesting depth (proxy: count leading whitespace levels)
grep -rn '^\s\{12,\}' src --include='*.ts' --include='*.tsx' | \
  cut -d: -f1 | sort | uniq -c | sort -rn | head -20

# Function parameter count (functions with 4+ params)
grep -rPn '\(([^)]*,){3,}[^)]*\)' src --include='*.ts' --include='*.tsx' | head -20

# Import count per file
grep -rn '^import ' src --include='*.ts' --include='*.tsx' | \
  cut -d: -f1 | sort | uniq -c | sort -rn | head -20
```

### Thresholds

| Metric | OK | WARN | CRITICAL |
|--------|-----|------|----------|
| File SLOC | < 200 | 200-400 | > 400 |
| Function length (lines) | < 30 | 30-50 | > 50 |
| Cyclomatic complexity | < 6 | 6-10 | > 10 |
| Nesting depth | < 3 | 3-4 | > 4 |
| Parameter count | < 4 | 4-5 | > 5 |
| Import count | < 8 | 8-12 | > 12 |

Report each file that exceeds WARN or CRITICAL thresholds.

---

## Layer 2: Structural Metrics

Measures module dependencies and architectural integrity.

### Collection Commands

```bash
# Circular dependency detection
npx madge --circular --extensions ts,tsx src

# Full dependency graph as JSON (for fan-in/fan-out analysis)
npx madge --json --extensions ts,tsx src

# Layer violation detection (see rules table below)
# client -> server (forbidden)
grep -rn "from ['\"].*src/server" src/client --include='*.ts' --include='*.tsx'
grep -rn "from ['\"]~/server" src/client --include='*.ts' --include='*.tsx' | grep -v "~/server/app"

# client -> prisma (forbidden)
grep -rn "@prisma/client" src/client --include='*.ts' --include='*.tsx'

# server -> react (forbidden)
grep -rn "from ['\"]react" src/server --include='*.ts' --include='*.tsx'

# shared -> client or server (forbidden)
grep -rn "from ['\"].*src/client\|from ['\"].*src/server\|from ['\"]@/\|from ['\"]~/server" src/shared --include='*.ts' --include='*.tsx'

# routes -> prisma (forbidden, use services)
grep -rn "@prisma/client" src/server/routes --include='*.ts' --include='*.tsx'

# services -> routes (forbidden, wrong direction)
grep -rn "from ['\"].*routes" src/server/services --include='*.ts' --include='*.tsx'
```

### Layer Violation Rules (Project-Specific)

| Source | Must NOT Import | Exception | Severity |
|--------|----------------|-----------|----------|
| `src/client/**` | `src/server/**` | `~/server/app` (RPC type-only) | CRITICAL |
| `src/client/**` | `@prisma/client` | -- | CRITICAL |
| `src/server/**` | `react`, `react-dom` | -- | CRITICAL |
| `src/shared/**` | `src/client/**`, `src/server/**` | -- | CRITICAL |
| `src/server/routes/**` | `@prisma/client` | -- | HIGH |
| `src/server/services/**` | `src/server/routes/**` | -- | HIGH |

Any violation is a FAIL. CRITICAL violations block merging. HIGH violations must be addressed before next release.

### Fan-In / Fan-Out Analysis

From the `madge --json` output:
- **Fan-out** = number of modules a file imports (direct dependencies)
- **Fan-in** = number of modules that import a file (reverse dependencies)
- **God module** = file with highest `fan-in x fan-out` product

### Thresholds

| Metric | OK | WARN | CRITICAL |
|--------|-----|------|----------|
| Circular deps (count) | 0 | -- | > 0 |
| Layer violations (count) | 0 | -- | > 0 |
| Fan-out (imports per file) | < 8 | 8-12 | > 12 |
| Fan-in (dependents per file) | < 10 | 10-15 | > 15 |
| God module (fan-in x fan-out) | < 50 | 50-100 | > 100 |

---

## Layer 3: Evolution Metrics

Measures how code changes over time using git history.

### Collection Commands

```bash
# Code churn: files with most additions+deletions in last 90 days
git log --since="90 days ago" --numstat --format="" | \
  awk '{adds[$3]+=$1; dels[$3]+=$2} END {for(f in adds) print adds[f]+dels[f], adds[f], dels[f], f}' | \
  sort -rn | head -20

# Change frequency: most frequently modified files in last 90 days
git log --since="90 days ago" --name-only --format="" | \
  sort | uniq -c | sort -rn | head -20

# Bug-fix concentration: files most often in fix commits
git log --since="180 days ago" --name-only --format="" --grep="^fix" | \
  sort | uniq -c | sort -rn | head -20

# Author concentration: per-file single-author percentage
git log --since="180 days ago" --format="%an" --name-only | \
  awk '/^$/{next} !author{author=$0; next} {files[author][$0]++; total[$0]++; author=""}' \
  # (simplified - use git shortlog for practical analysis)

# Practical author concentration per file
for f in $(git log --since="180 days ago" --name-only --format="" | sort -u | head -30); do
  total=$(git log --since="180 days ago" --format="%an" -- "$f" | wc -l)
  top=$(git log --since="180 days ago" --format="%an" -- "$f" | sort | uniq -c | sort -rn | head -1)
  echo "$top / $total  $f"
done
```

### Thresholds

| Metric | OK | WARN | CRITICAL |
|--------|-----|------|----------|
| Churn (lines/90d) | < 500 | 500-1500 | > 1500 |
| Change frequency (commits/90d) | < 15 | 15-30 | > 30 |
| Bug-fix ratio | < 20% | 20-40% | > 40% |
| Author concentration | < 70% | 70-90% | > 90% |

---

## Layer 4: AI Semantic Analysis

Human-readable assessment of the top hotspot files. Only collected in `full` mode.

### Procedure

1. Identify the top 10 files by Hotspot Index (see Composite Scores)
2. Read each file in full
3. For each file, assess:

| Aspect | What to Look For |
|--------|-----------------|
| SRP Violations | Does this file/module do more than one thing? |
| Naming Quality | Are names descriptive, consistent, and non-ambiguous? |
| Dependency Direction | Do dependencies point inward (toward domain)? |
| Domain Leakage | Does infrastructure detail leak into business logic? |
| Side Effect Spread | Are side effects (I/O, mutations) contained or scattered? |

4. Tag each finding with a severity:
   - `[INFO]` — Minor observation, no action needed
   - `[WARN]` — Should be addressed in next refactoring cycle
   - `[CRITICAL]` — Violates core architecture, fix immediately

---

## Composite Scores (0-10)

Calculate after collecting raw metrics. Normalize each component to 0-10 scale.

| Score | Formula | Meaning |
|-------|---------|---------|
| **Hotspot Index** | `complexity x churn x centrality` | Files most likely to cause future issues. Higher = more urgent. |
| **Architectural Drift** | `violations x 2 + cycles x 3 + god_modules` | Degree of architecture degradation. 0 = clean. |
| **Cognitive Load Index** | `nesting x params x func_length` | How hard the code is to understand. Higher = harder. |

### Score Interpretation

| Range | Label | Action |
|-------|-------|--------|
| 0-2 | Healthy | No action needed |
| 3-5 | Moderate | Plan improvements in next sprint |
| 6-7 | Concerning | Prioritize in current sprint |
| 8-10 | Critical | Address immediately |

---

## Output Format

Present results using this template:

```
## Code Metrics Report — {mode} mode

### Composite Scores

| Score | Value | Status |
|-------|-------|--------|
| Hotspot Index | X.X / 10 | OK / WARN / CRITICAL |
| Architectural Drift | X.X / 10 | OK / WARN / CRITICAL |
| Cognitive Load Index | X.X / 10 | OK / WARN / CRITICAL |

### Layer 1: Physical Metrics

Top files exceeding thresholds:

| File | SLOC | Func Len | Complexity | Nesting | Params | Imports | Status |
|------|------|----------|------------|---------|--------|---------|--------|
| ... | ... | ... | ... | ... | ... | ... | OK/WARN/CRIT |

### Layer 2: Structural Metrics

**Circular Dependencies**: {count} found
{list if any}

**Layer Violations**: {count} found
{list with severity}

**God Modules** (fan-in x fan-out > 100):
{list if any}

### Layer 3: Evolution Metrics

**Hotspot Files** (high churn + high complexity):

| File | Churn | Frequency | Bug-Fix % | Author Conc. | Hotspot Score |
|------|-------|-----------|-----------|-------------|---------------|
| ... | ... | ... | ... | ... | ... |

### Layer 4: Semantic Analysis (full mode only)

{Per-file findings with severity tags}

---

### ACTION ITEMS (prioritized)

1. [CRITICAL] {description} — {file}
2. [HIGH] {description} — {file}
3. [MEDIUM] {description} — {file}
```

---

## Integration with Other Skills

| Skill/Command | Relationship |
|---------------|-------------|
| `/code-review` | Metrics provides **quantitative** data; code-review provides **qualitative** assessment. Run metrics first for context. |
| `/refactor-clean` | Use `hotspots` mode to identify **what** to refactor, then use refactor-clean to execute. |
| `/verify` | Verify checks pass/fail gates; metrics measures **quality trends** over time. |
