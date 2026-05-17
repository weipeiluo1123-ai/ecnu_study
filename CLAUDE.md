# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal study repository — algorithmic problem-solving (Luogu / LeetCode) and developer tool learning notes. The owner is preparing for graduate studies at East China Normal University (ECNU) in embedded systems (Fall 2026).

## Commands

```bash
# Build all LeetCode C++ solutions
cd algorithm && make

# Build and run a specific LeetCode solution
cd algorithm && make leetcode/1_two_sum && ./leetcode/1_two_sum

# Clean build artifacts
cd algorithm && make clean
```

- **Build flags**: `-std=c++17 -O2 -Wall -Wextra -Iinclude`
- **Run single file directly**: `g++ -std=c++17 -O2 -Iinclude algorithm/leetcode/<file>.cpp -o /tmp/out && /tmp/out`

## Code Architecture

### algorithm/ — Algorithm solutions
- **luogu/**: Problem write-ups in Markdown (`P{id}.md`) — problem analysis, solution approach, code snippets, and screenshots
- **leetcode/**: C++ solution files (`{id}.{slug}.cpp`) — ready to compile and run with `main()` test harness
- **templates/**: Boilerplate for new LeetCode solutions (`leetcode_template.cpp`) and general algorithm topics (`topic_template.cpp`)
- **include/bits/stdc++.h**: Local fallback of the common CP convenience header (macOS doesn't ship it by default)
- **images/**: Screenshots and diagrams referenced by luogu markdown files
- **notes/**: General algorithm learning notes
- **Makefile**: Builds all `.cpp` files in `leetcode/`

### toolbox/ — Developer tool notes
- **git/**: Git version control study notes
- **vim/**: Vim editor notes (includes `vimtutor` content)
- **shell/**: Shell learning notes (Missing Semester lecture series)

### docs/ — Personal planning
- Embedded systems graduate study roadmap,导师 analysis, competition strategy, risk management

## Conventions

- C++17 standard, solutions include `<bits/stdc++.h>` (local fallback provided)
- LeetCode solutions include the `@lc` app=leetcode comment header and compile with a `main()` test harness
- Luogu solutions are documented as Markdown files with code blocks, not standalone `.cpp` files
- All documentation is in Chinese (zh-CN)
- New algorithm topics should use `topic_template.cpp`; new LeetCode solutions should use `leetcode_template.cpp`
- Images are stored in `algorithm/images/` and linked from Markdown files with relative paths
