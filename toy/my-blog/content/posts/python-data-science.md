---
title: "Python 数据科学与机器学习入门"
date: 2026-04-22
author: weipeiluo
description: "从零开始学习 Python 数据科学生态，掌握 NumPy、Pandas、Scikit-learn 等核心工具，快速上手机器学习。"
category: "ai-ml"
tags:
  - python
  - ai
  - llm
  - tutorial
published: true
featured: false
---

## Python 数据科学生态

Python 拥有最完善的数据科学生态系统。

### 核心库

1. **NumPy** — 数值计算基础库
2. **Pandas** — 数据处理与分析
3. **Matplotlib** — 数据可视化
4. **Scikit-learn** — 经典机器学习
5. **PyTorch / TensorFlow** — 深度学习框架

## Pandas 数据处理

```python
import pandas as pd

df = pd.read_csv("data.csv")
print(df.describe())

# 数据清洗
df = df.dropna()
df["feature"] = df["feature"].fillna(df["feature"].mean())
```

## 机器学习工作流

1. 数据收集与清洗
2. 特征工程
3. 模型选择与训练
4. 评估与优化
5. 部署与监控

## LLM 应用

大语言模型正在改变 AI 应用的方式，通过 API 调用即可集成强大的语言理解能力。
