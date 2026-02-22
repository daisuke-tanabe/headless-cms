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

## Project Configuration

Command templates below use `<placeholder>` tokens for project-specific values. Before executing, resolve each placeholder using the table below.

**Resolution order:** Look for a code-metrics configuration section in CLAUDE.md first. If the section exists, substitute each token with the corresponding setting. If absent, apply the Fallback rule.

| Placeholder | What to look for in CLAUDE.md | Expansion Format | Fallback |
|-------------|------------------------------|-----------------|----------|
| `<src_dir>` | Source directory | as-is | Detect from project structure (`src/`, `lib/`, `app/`, or `.`) |
| `<ext_glob>` | Target file extensions (glob form) | `-name '*.ext1' -o -name '*.ext2'` | Detect from project config (e.g. `tsconfig.json` -> `*.ts *.tsx`) |
| `<ext_include>` | Target file extensions (glob form) | `--include='*.ext1' --include='*.ext2'` | Same detection as `<ext_glob>` |
| `<ext_comma>` | Target file extensions (comma form) | as-is | Same detection as `<ext_glob>`, comma-separated without `*.` |
| `<exclude_path>` | Excluded paths | as-is | Omit the exclusion filter |
| `<dep_tool>` | Dependency analysis tool | as-is | Check installed tools (`madge`, `dependency-cruiser`); skip circular-dep analysis if none found |

---

## Layer 1: Physical Metrics

Measures raw code characteristics per file.

### Collection Commands

```bash
# Lines of code per file (exclude blank lines and node_modules)
find <src_dir> <ext_glob> | xargs wc -l | sort -rn | head -30

# Function count per file
grep -rn 'function \|=> {' <src_dir> <ext_include> | \
  cut -d: -f1 | sort | uniq -c | sort -rn | head -20

# Export count per file
grep -rn '^export ' <src_dir> <ext_include> | \
  cut -d: -f1 | sort | uniq -c | sort -rn | head -20

# Nesting depth (proxy: count leading whitespace levels)
grep -rn '^\s\{12,\}' <src_dir> <ext_include> | \
  cut -d: -f1 | sort | uniq -c | sort -rn | head -20

# Function parameter count (functions with 4+ params)
grep -rPn '\(([^)]*,){3,}[^)]*\)' <src_dir> <ext_include> | head -20

# Import count per file
grep -rn '^import ' <src_dir> <ext_include> | \
  cut -d: -f1 | sort | uniq -c | sort -rn | head -20

# Cyclomatic complexity proxy (branching keyword count per file)
for f in $(find <src_dir> <ext_glob>); do
  count=$(grep -c -E '\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b|\bcase\b|\bcatch\b|\?\?|&&|\|\|' "$f" 2>/dev/null || echo 0)
  [ "$count" -gt 0 ] && echo "$count $f"
done | sort -rn | head -20
# NOTE: File-level proxy. For files scoring high, drill into per-function
# analysis by reading the file and counting branches per function body.
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
npx <dep_tool> --circular --extensions <ext_comma> <src_dir>

# Full dependency graph as JSON (for fan-in/fan-out analysis)
npx <dep_tool> --json --extensions <ext_comma> <src_dir>

# Layer violation detection
# If CLAUDE.md defines layer architecture rules (import constraints between modules),
# for each rule:
#   grep -rn "<must_not_import_pattern>" <source_path> <ext_include>
#   If the rule has exceptions, pipe through: | grep -v "<exception_pattern>"
# If no layer rules are defined, skip this step.
```

### Fan-In / Fan-Out Analysis

From the `<dep_tool> --json` output:
- **Fan-out** = number of modules a file imports (direct dependencies)
- **Fan-in** = number of modules that import a file (reverse dependencies)
- **God module** = file with highest `fan-in x fan-out` product

### Coupling Weight

Measures how many symbols each file imports per dependency. Distinguishes lightweight connections (1-2 symbols) from heavyweight ones (many symbols from a single source).

#### Collection Command

```bash
# Per-dependency import breadth (runtime imports only)
grep -rn "^import " <src_dir> <ext_include> | grep -v "import type " | \
  sed -n 's/.*{\([^}]*\)}.*/\1/p' | \
  awk -F',' '{print NF}' | \
  awk '{sum+=$1; if($1>max)max=$1} END {print "files:", NR, "mean:", (NR?sum/NR:0), "max:", max}'

# Top files by total coupling weight (sum of all imported symbols)
for f in $(find <src_dir> <ext_glob>); do
  w=$(grep "^import " "$f" 2>/dev/null | grep -v "import type " | \
    sed -n 's/.*{\([^}]*\)}.*/\1/p' | awk -F',' '{s+=NF} END {print s+0}')
  [ "$w" -gt 0 ] && echo "$w $f"
done | sort -rn | head -20

# Heaviest single dependencies (most symbols from one source)
grep -rPn "^import \{[^}]+\} from " <src_dir> <ext_include> | grep -v "import type " | \
  while IFS= read -r line; do
    symbols=$(echo "$line" | sed -n 's/.*{\([^}]*\)}.*/\1/p' | awk -F',' '{print NF}')
    [ "$symbols" -gt 5 ] && echo "$symbols  $line"
  done | sort -rn | head -20
```

#### Evaluation

- **Per-dependency weight**: Count of named symbols in each import statement (excluding type-only imports)
- **Total module weight**: Sum of all per-dependency weights for a file
- **Type-only imports** (`import type { ... }`) are excluded -- they create no runtime coupling

### Module Cohesion

Detects files that export symbols belonging to multiple unrelated domains/responsibilities.

#### Collection Command

```bash
# List files with 2+ exports and their public symbols
for f in $(find <src_dir> <ext_glob> | grep -v '<exclude_path>'); do
  count=$(grep -c '^export ' "$f" 2>/dev/null || echo 0)
  if [ "$count" -gt 1 ]; then
    echo "=== $f ($count exports) ==="
    grep '^export ' "$f"
    echo ""
  fi
done
```

#### Evaluation Criteria

- All exports belong to the same domain -> **OK**
- Matches a known cohesive pattern (see exclusions below) -> **OK** (skip)
- 2 domains mixed -> **WARN**
- 3+ domains mixed -> **CRITICAL**

#### Exclusion Patterns (Known Cohesive Exports)

If CLAUDE.md defines cohesion exclusion patterns (under the code-metrics configuration section), apply them -- matching files are inherently cohesive and should NOT be flagged. If absent, apply only universal patterns: barrel files (re-export-only modules) and constant-only files.

### Thresholds

| Metric | OK | WARN | CRITICAL |
|--------|-----|------|----------|
| Circular deps (count) | 0 | -- | > 0 |
| Layer violations (count) | 0 | -- | > 0 |
| Fan-out (imports per file) | < 8 | 8-12 | > 12 |
| Fan-in (dependents per file) | < 10 | 10-15 | > 15 |
| God module (fan-in x fan-out) | < 50 | 50-100 | > 100 |
| Module Cohesion violations | 0 | 1-2 | > 2 |
| Coupling weight (per dep) | < 5 | 5-10 | > 10 |
| Coupling weight (per file total) | < 30 | 30-60 | > 60 |

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

### Temporal Coupling

Detects files that frequently change together in the same commit, revealing hidden coupling not visible in import graphs.

#### Collection Command

```bash
# Temporal coupling: file pairs committed together in last 90 days
git log --since="90 days ago" --name-only --format="COMMIT_SEP" -- <src_dir> | \
  awk '/^COMMIT_SEP$/{for(i in f) for(j in f) if(i<j) p[i" <-> "j]++; delete f; next} NF{f[$0]=1} END{for(k in p) if(p[k]>=5) print p[k], k}' | \
  sort -rn | head -20
```

#### Evaluation

- **Co-change count >= 5**: Files changed together 5+ times in 90 days
- Pairs within the same module/feature are expected -- flag only cross-module pairs
- Cross-layer pairs (e.g., a route + a UI component) indicate leaking abstractions
- High temporal coupling + no import relationship = hidden dependency (CRITICAL)
- High temporal coupling + direct import = expected but review coupling weight

### Thresholds

| Metric | OK | WARN | CRITICAL |
|--------|-----|------|----------|
| Churn (lines/90d) | < 500 | 500-1500 | > 1500 |
| Change frequency (commits/90d) | < 15 | 15-30 | > 30 |
| Bug-fix ratio | < 20% | 20-40% | > 40% |
| Author concentration | < 70% | 70-90% | > 90% |
| Temporal coupling (cross-module) | 0 | 1-3 | > 3 |
| Temporal coupling (co-change count) | < 5 | 5-10 | > 10 |

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
| Module Cohesion | Do all public symbols belong to the same domain/responsibility? Are there mixed concerns (e.g., UI + API, auth + routing)? |

4. Tag each finding with a severity:
    - `[INFO]` -- Minor observation, no action needed
    - `[WARN]` -- Should be addressed in next refactoring cycle
    - `[CRITICAL]` -- Violates core architecture, fix immediately

---

## Composite Scores (0-10)

Calculate after collecting raw metrics.

**Normalization**: For each component, normalize to a 0-10 scale:
`component_norm = (file_value / max_value_in_codebase) * 10`, clamped to [0, 10].
If the codebase maximum is 0 for a component, set all normalized values to 0.

| Score | Formula | Meaning |
|-------|---------|---------|
| **Hotspot Index** | `complexity_norm * 0.4 + churn_norm * 0.35 + centrality_norm * 0.25` | Files most likely to cause future issues. Higher = more urgent. |
| **Architectural Drift** | `violations * 2 + cycles * 3 + god_modules + cohesion_violations + coupling_weight_violations` | Degree of architecture degradation. 0 = clean. |
| **Cognitive Load Index** | `(complexity_norm * 3 + nesting_norm * 2 + params_norm + func_length_norm * 2) / 8` | How hard the code is to understand. Higher = harder. |

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
## Code Metrics Report -- {mode} mode

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

**Module Cohesion Violations**: {count} found
{list of files with mixed-domain exports and severity}

**Coupling Weight Violations**: {count} found
{list of files with heavy dependencies and their weight}

### Layer 3: Evolution Metrics

**Hotspot Files** (high churn + high complexity):

| File | Churn | Frequency | Bug-Fix % | Author Conc. | Hotspot Score |
|------|-------|-----------|-----------|-------------|---------------|
| ... | ... | ... | ... | ... | ... |

**Temporal Coupling** (cross-module co-changes):

| File A | File B | Co-changes | Relationship |
|--------|--------|------------|--------------|
| ... | ... | ... | import / hidden / same-module |

### Layer 4: Semantic Analysis (full mode only)

{Per-file findings with severity tags}

---

### ACTION ITEMS (prioritized)

1. [CRITICAL] {description} -- {file}
2. [HIGH] {description} -- {file}
3. [MEDIUM] {description} -- {file}
```
