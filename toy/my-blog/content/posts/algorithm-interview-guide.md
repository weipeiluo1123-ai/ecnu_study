---
title: "常见算法面试题精讲：从入门到精通"
date: 2026-04-14
author: weipeiluo
description: "系统梳理算法面试中最高频的题型：双指针、滑动窗口、动态规划、二叉树、图论，每类题型附详细解题思路和代码实现。"
category: "algorithm"
tags:
  - 教程
  - javascript
  - 心得
published: true
featured: false
---

算法面试是技术面试中最具挑战性的环节之一。本文系统梳理了各大厂面试中最高频的算法题型，帮助你在有限时间内高效备考。

## 双指针技巧

双指针是解决数组和字符串问题的利器，典型场景包括：有序数组的两数之和、反转字符串、判断回文等。

### 两数之和 II

```javascript
function twoSum(numbers, target) {
  let left = 0, right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    if (sum < target) left++;
    else right--;
  }
  return [-1, -1];
}
```

**时间复杂度**: O(n)，空间复杂度: O(1)

## 滑动窗口

滑动窗口用于解决子数组/子字符串问题，核心是维护一个窗口，通过移动左右指针来调整窗口大小。

### 无重复字符的最长子串

```javascript
function lengthOfLongestSubstring(s) {
  const map = new Map();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (map.has(char) && map.get(char) >= left) {
      left = map.get(char) + 1;
    }
    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}
```

## 动态规划

DP 的核心是找到状态转移方程。以下是最长递增子序列的经典解法：

```javascript
function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1);
  let max = 1;
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    max = Math.max(max, dp[i]);
  }
  return max;
}
```

### 背包问题模板

```javascript
function knapsack(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}
```

## 二叉树遍历

掌握递归和迭代两种写法，尤其要熟练使用栈模拟递归：

```javascript
function inorderTraversal(root) {
  const result = [], stack = [];
  let curr = root;
  while (curr || stack.length) {
    while (curr) {
      stack.push(curr);
      curr = curr.left;
    }
    curr = stack.pop();
    result.push(curr.val);
    curr = curr.right;
  }
  return result;
}
```

## 图论：岛屿数量

```javascript
function numIslands(grid) {
  let count = 0;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] === "1") {
        dfs(grid, i, j);
        count++;
      }
    }
  }
  return count;
}

function dfs(grid, i, j) {
  if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] === "0") return;
  grid[i][j] = "0";
  dfs(grid, i - 1, j);
  dfs(grid, i + 1, j);
  dfs(grid, i, j - 1);
  dfs(grid, i, j + 1);
}
```

## 排序算法速查

| 算法 | 平均时间复杂度 | 空间复杂度 | 稳定性 |
|------|---------------|-----------|-------|
| 快速排序 | O(n log n) | O(log n) | 不稳定 |
| 归并排序 | O(n log n) | O(n) | 稳定 |
| 堆排序 | O(n log n) | O(1) | 不稳定 |

算法面试不是背题，而是理解核心思想。建议每道题至少练习 3 遍：第一遍理解思路，第二遍独立写出，第三遍优化时间和空间复杂度。
