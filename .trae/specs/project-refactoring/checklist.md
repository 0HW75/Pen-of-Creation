# Checklist

## Phase 1: 清理废弃文档

- [ ] Task 1.1: 识别并删除 `.trae/documents/` 中已过时的文档
  - [ ] 已检查每个文档的内容和相关性
  - [ ] 已删除已完成的过时计划文档
  - [ ] 保留了 `ai-generation-optimization` 相关文档

## Phase 2: 清理临时调试脚本

- [ ] Task 2.1: 识别并删除 `backend/` 根目录下的临时调试脚本
  - [ ] 已删除 `check_*.py` 系列（8个）
  - [ ] 已删除 `find_*.py`, `fix_checkpoints.py`, `search_chenqi_all.py`
  - [ ] 已删除 `show_db_path.py`, `analyze_databases.py`
  - [ ] 已删除 `test_*.py` 系列（4个）
  - [ ] 已删除已完成的数据迁移脚本 `migrate_*.py`

## Phase 3: 拆分过长后端文件

- [ ] Task 3.1: 拆分 `backend/app/api/setting.py`
  - [ ] 已分析文件结构
  - [ ] 已提取公共辅助函数
  - [ ] 已按功能模块拆分
  - [ ] 所有路由仍正常工作

- [ ] Task 3.2: 拆分 `backend/app/api/worldview_generation.py`
  - [ ] 已提取元素提取逻辑
  - [ ] 已提取生成器相关逻辑
  - [ ] API路由层保持完整

- [ ] Task 3.3: 拆分 `backend/app/api/energy_society.py`
  - [ ] 已按功能拆分

- [ ] Task 3.4: 拆分其他超过1200行的后端文件
  - [ ] `blueprint.py` 已拆分
  - [ ] `worlds.py` 已拆分
  - [ ] `ai_generation_routes.py` 已拆分

## Phase 4: 拆分过长前端文件

- [ ] Task 4.1: 拆分 `frontend/src/hooks/useBlueprintManagement.js`
  - [ ] 已提取公共逻辑
  - [ ] 已按功能拆分hook

- [ ] Task 4.2: 拆分 `frontend/src/components/CreateWorldWizard/Step3Generate.jsx`
  - [ ] 已提取状态管理逻辑
  - [ ] 已拆分复杂UI组件

- [ ] Task 4.3: 拆分 `frontend/src/components/WorldSetting/SocietySystem.jsx`
  - [ ] 已按子组件拆分

- [ ] Task 4.4: 拆分其他超过1200行的前端文件
  - [ ] `WorldArchitecture.jsx` 已拆分
  - [ ] `HistoryTimeline.jsx` 已拆分
  - [ ] `AIChat.jsx` 已拆分
  - [ ] `SettingManagement/index.jsx` 已拆分
  - [ ] `api.js` 服务文件已拆分

## Phase 5: 验证

- [ ] Task 5.1: 后端代码可以正常导入
- [ ] Task 5.2: 前端代码可以正常编译
- [ ] Task 5.3: 所有拆分的文件仍保持原有功能
