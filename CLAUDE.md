# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal study repository — algorithmic problem-solving (Luogu / LeetCode) and developer tool learning notes. The owner is preparing for graduate studies at East China Normal University (ECNU) in embedded systems (Fall 2026).

## AI Interaction Style (Algorithm Questions)

当用户在 algorithm/ 目录下询问算法题时，遵循以下原则：

- **永远不要直接给出答案或完整代码**。采用苏格拉底式引导，通过提问和提示让用户自己推理出解法
- **先了解用户的思路**：问他"你怎么想的？"、"第一反应是什么？"
- **从核心概念切入**：抛出一个关键问题让用户思考（如"2 的幂在二进制里长什么样？"）
- **逐层深入**：用户答对一步，再抛出下一个问题；用户卡住，就换一个角度提示
- **分析错误时同样引导**：用 trace 具体例子让用户自己发现 bug，而不是直接指出来
- **总结规律**：用户理解后，帮他把 pattern 抽象出来，便于以后举一反三
- 可以讨论多种解法及其 trade-off，但让用户自己选择用哪种
- 在确保用户完全理解前，不要替他写完整实现

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

## Study Roadmap: ECNU Software Engineering (Embedded / Robotics)

华东师范大学软工专硕（2026 秋入学），目标就业方向：嵌入式软件 / 机器人，目标公司：NVIDIA 上海等。

### 核心策略

- **分阶段聚焦**，不贪多嚼不烂
- 研一上：抓绩点 + 定论文方向 + 保持算法手感
- 研一下：做实验写小论文 + 准备暑期实习面试
- 研一暑假：争取大厂实习（NVIDIA / 大疆 / 华为等）
- 课程追求 85-90 分即可，时间留给技术和面试准备

### 开学前 3 个月（2026.05 - 2026.09）重点

1. **C++ 深度 + LeetCode**（80% 精力）
   - 精读《C++ Primer》第5版：第1-16章为核心，第12/13/15章是重中之重
   - 配合《Effective Modern C++》补充面试知识点
   - 力扣用 C++ 刷 100-150 题，保持手感
2. **ROS 2 + Isaac Sim 入门**（20% 精力）
   - ROS 2 Humble 官方教程走一遍
   - Isaac Sim 装起来跑几个 demo

### C++ Primer 学习节奏

| 周次 | 内容 | 配合刷题 |
|------|------|---------|
| 第1-2周 | 第1-6章：变量、类型、表达式、函数 | 简单题练语法 |
| 第3-4周 | 第7章：类（OOP 核心） | 写小类练手 |
| 第5-6周 | 第9、11章：顺序/关联容器 | vector/map 相关题 |
| 第7-8周 | 第12、13章：动态内存 + 拷贝控制 | **重中之重** |
| 第9-10周 | 第15章：面向对象 | 虚函数相关题 |
| 第11-12周 | 回顾 + 综合刷题 | 综合题实战 |

### Conventions

- C++17 standard, solutions include `<bits/stdc++.h>` (local fallback provided)
- LeetCode solutions include the `@lc` app=leetcode comment header and compile with a `main()` test harness
- Luogu solutions are documented as Markdown files with code blocks, not standalone `.cpp` files
- All documentation is in Chinese (zh-CN)
- New algorithm topics should use `topic_template.cpp`; new LeetCode solutions should use `leetcode_template.cpp`
- Images are stored in `algorithm/images/` and linked from Markdown files with relative paths
