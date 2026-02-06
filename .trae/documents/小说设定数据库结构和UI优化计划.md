## 第一阶段目标
实现世界观主表和角色模块重构，建立基础UI布局

---

## 具体实施步骤

### 步骤1：安装 Alembic 并初始化
```bash
cd backend
pip install alembic
alembic init migrations
```

### 步骤2：配置 Alembic
编辑 `migrations/env.py`，添加Flask应用配置

### 步骤3：创建世界主表 (worlds)
- world_id (主键)
- world_name
- core_concept
- world_type
- created_at, updated_at

### 步骤4：修改现有表添加 world_id 外键
- characters
- locations
- items
- factions

### 步骤5：重构角色模块
- 扩展 characters 表字段
- 创建 character_backgrounds 子表
- 创建 character_abilities 子表

### 步骤6：创建基础API端点
- /api/worlds - 世界CRUD
- 修改 /api/characters - 支持新字段

### 步骤7：前端布局重构
- 创建 MainLayout 组件
- 左侧导航面板
- 顶部导航栏

### 步骤8：世界管理页面
- 世界列表
- 世界创建/编辑表单
- 世界切换功能

### 步骤9：角色管理页面重构
- 角色卡片视图
- 角色详情编辑（标签页模式）
- 基础信息/背景故事/能力装备

### 步骤10：数据迁移
- 创建迁移脚本
- 迁移现有数据
- 测试验证

---

## 预计完成时间
3-5天

---

确认后开始实施？