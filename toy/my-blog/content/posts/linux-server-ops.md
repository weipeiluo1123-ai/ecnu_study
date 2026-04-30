---
title: "Linux 服务器运维与性能优化指南"
date: 2026-04-12
author: weipeiluo
description: "Linux 服务器日常运维命令、性能监控与调优、日志管理、安全加固等实用技巧总结。"
category: "devops"
tags:
  - linux
  - security
  - performance
published: true
featured: false
---

## 日常运维命令

### 系统监控

```bash
top                    # 进程监控
htop                   # 更友好的进程监控
df -h                  # 磁盘使用率
free -h                # 内存使用
iostat -x 1            # IO 性能
netstat -tlnp          # 端口监听
```

### 日志管理

```bash
journalctl -u nginx -f  # 实时查看 nginx 日志
tail -f /var/log/syslog # 系统日志
logrotate               # 日志轮转配置
```

## 性能调优

### 内核参数优化

```bash
# /etc/sysctl.conf
net.core.somaxconn = 65535
vm.swappiness = 10
fs.file-max = 100000
```

## 安全加固

1. SSH 密钥登录，禁用密码
2. 配置防火墙（UFW/iptables）
3. 定期安全更新
4. Fail2ban 防暴力破解
5. SELinux/AppArmor 强制访问控制

## 备份策略

3-2-1 备份法则：3 份副本，2 种介质，1 份异地。
