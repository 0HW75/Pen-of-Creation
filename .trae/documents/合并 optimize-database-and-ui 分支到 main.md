## 合并计划

### 步骤
1. 切换到 main 分支
2. 拉取最新的 main 分支代码
3. 合并 optimize-database-and-ui 分支到 main
4. 推送到远程 main 分支

### 命令
```bash
git checkout main
git pull origin main
git merge optimize-database-and-ui
git push origin main
```

### 注意事项
- 如果合并过程中出现冲突，需要手动解决
- 合并后会将社会体系模块的文明关联功能合并到主分支