# git sparse-checkout 稀疏检出

## 场景

多台电脑协同开发同一仓库：
- **台式机**：开发全量项目（重型 + 轻量）
- **MacBook**：只想同步轻量内容（笔记 / 文档 / 简单代码），不想 pull 重型项目

## 一句话原理

sparse-checkout 让 git **只检出**（写入磁盘）你指定的目录，其余目录只存在于 `.git` 历史中，**不出现在文件系统上**。

---

## 初始设置

### 已 clone 的仓库

```bash
# 1. 启用 sparse checkout（cone 模式，高效）
git sparse-checkout init --cone

# 2. 设置你需要的目录（白名单）
git sparse-checkout set docs/ notes/ leetcode/ 工具脚本/

# 3. 不在白名单的目录自动消失
```

### 尚未 clone

```bash
git clone --filter=blob:none <仓库URL>
cd repo
git sparse-checkout init --cone
git sparse-checkout set docs/ notes/ leetcode/
```

`--filter=blob:none` 是 partial clone，**只下载 commit 元数据**，文件内容按需获取，更进一步省流量和磁盘。

### 已 clone 后补充 partial clone

```bash
git config remote.origin.promisor true
git config remote.origin.partialCloneFilter blob:none
git fetch origin
```

---

## 日常使用

```bash
# 正常 pull，只更新白名单内的文件
git pull

# 添加新的保留目录
git sparse-checkout add another-dir/

# 查看当前白名单
git sparse-checkout list

# 恢复完整检出（全部文件回到磁盘）
git sparse-checkout disable
```

---

## 注意

- 不在白名单的目录**不会出现在磁盘**，但 git 历史里仍有它们（`git log` / `git show` / `git checkout` 时能访问）
- partial clone 下 `git diff` 未检出的文件会触发按需下载
- 适用于**文件级**粒度，propose 配置已足够用
