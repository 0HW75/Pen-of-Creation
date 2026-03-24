# 项目重构计划 Spec

## Why
项目存在以下问题需要解决：
1. 多个文件超过1200行代码规范限制，需要拆分
2. `.trae/documents/`目录存在大量过时的开发计划文档
3. `backend/`根目录存在多个临时调试脚本，可清理

## What Changes

### 1. 清理废弃文档
- 删除 `.trae/documents/` 中已完成的过时计划文档
- 保留当前正在进行的 `ai-generation-optimization` 相关文档

### 2. 清理临时调试脚本
删除 `backend/` 根目录下的临时调试文件：
- `check_*.py` 系列（8个）
- `find_*.py`
- `fix_checkpoints.py`
- `search_chenqi_all.py`
- `show_db_path.py`
- `test_*.py` 系列（4个）
- `analyze_databases.py`
- `migrate_*.py` 系列（已完成的迁移脚本）

保留：
- `run.py`（启动文件）
- `reset_db.py`（如仍在使用）
- `update_models_world_id.py`（如仍在使用）
- `add_*.py`（数据迁移脚本）

### 3. 拆分过长后端文件
拆分以下超过1200行的文件：
- `backend/app/api/setting.py` (~60000字符)
- `backend/app/api/worldview_generation.py` (~111000字符)
- `backend/app/api/energy_society.py` (~45000字符)
- `backend/app/api/blueprint.py` (~28000字符)
- `backend/app/api/worlds.py` (~11000字符)
- `backend/app/api/ai_generation_routes.py` (~9000字符)

### 4. 拆分过长前端文件
拆分以下超过1200行的文件：
- `frontend/src/components/WorldSetting/SocietySystem.jsx` (~43000字符)
- `frontend/src/components/WorldSetting/WorldArchitecture.jsx` (~38000字符)
- `frontend/src/components/WorldSetting/HistoryTimeline.jsx` (~28000字符)
- `frontend/src/components/AIChat.jsx` (~41000字符)
- `frontend/src/components/CreateWorldWizard/Step3Generate.jsx` (~63000字符)
- `frontend/src/components/SettingManagement/index.jsx` (~40000字符)
- `frontend/src/hooks/useBlueprintManagement.js` (~88000字符)
- `frontend/src/services/api.js` (~43000字符)
- 其他超过1200行的组件

## Impact
- 删除约20个废弃文档
- 删除约15个临时调试脚本
- 拆分6个后端文件
- 拆分10+个前端文件

## ADDED Requirements
### Requirement: 代码文件长度限制
单个代码文件不得超过1200行。超过时必须拆分为多个文件或提取公共逻辑到独立模块。

### Requirement: 文档清理规则
已完成的开发计划文档应及时删除或归档，避免积累过时文档。

### Requirement: 临时脚本清理规则
调试/测试用的临时脚本使用完毕后应及时删除，避免污染项目目录。

## MODIFIED Requirements
无

## REMOVED Requirements
无
