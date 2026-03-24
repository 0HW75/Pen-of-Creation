# Tasks

## Phase 1: 清理废弃文档

- [ ] Task 1.1: 识别并删除 `.trae/documents/` 中已过时的文档
  - 检查每个文档是否与当前工作相关
  - 删除已完成的计划文档
  - 保留当前正在进行的 `ai-generation-optimization` 相关文档

## Phase 2: 清理临时调试脚本

- [ ] Task 2.1: 识别并删除 `backend/` 根目录下的临时调试脚本
  - 删除 `check_*.py` 系列（8个）
  - 删除 `find_*.py`, `fix_checkpoints.py`, `search_chenqi_all.py`
  - 删除 `show_db_path.py`, `analyze_databases.py`
  - 删除 `test_*.py` 系列（4个）
  - 删除已完成的数据迁移脚本 `migrate_*.py`

## Phase 3: 拆分过长后端文件

- [ ] Task 3.1: 拆分 `backend/app/api/setting.py`
  - 分析文件结构，识别可独立拆分的模块
  - 提取公共辅助函数到独立文件
  - 按功能模块拆分为主文件和子模块

- [ ] Task 3.2: 拆分 `backend/app/api/worldview_generation.py`
  - 提取元素提取逻辑到独立服务
  - 提取生成器相关逻辑
  - 保留API路由层

- [ ] Task 3.3: 拆分 `backend/app/api/energy_society.py`
  - 按功能（能源系统/社会文化）拆分

- [ ] Task 3.4: 拆分其他超过1200行的后端文件
  - `blueprint.py`
  - `worlds.py`
  - `ai_generation_routes.py`

## Phase 4: 拆分过长前端文件

- [ ] Task 4.1: 拆分 `frontend/src/hooks/useBlueprintManagement.js`
  - 提取自定义hook的公共逻辑
  - 按功能拆分hook

- [ ] Task 4.2: 拆分 `frontend/src/components/CreateWorldWizard/Step3Generate.jsx`
  - 提取状态管理逻辑
  - 拆分复杂UI组件

- [ ] Task 4.3: 拆分 `frontend/src/components/WorldSetting/SocietySystem.jsx`
  - 按子组件拆分

- [ ] Task 4.4: 拆分其他超过1200行的前端文件
  - `WorldArchitecture.jsx`, `HistoryTimeline.jsx`
  - `AIChat.jsx`, `SettingManagement/index.jsx`
  - `api.js` 服务文件

## Phase 5: 验证

- [ ] Task 5.1: 验证后端代码可以正常导入
- [ ] Task 5.2: 验证前端代码可以正常编译
- [ ] Task 5.3: 检查所有拆分的文件是否仍保持原有功能

# Task Dependencies
- Phase 1 和 Phase 2 可并行执行
- Phase 3 和 Phase 4 可并行执行
- Phase 5 依赖 Phase 1-4 完成
