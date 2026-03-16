# AI设定生成功能优化规格文档

## 变更ID
ai-generation-optimization

## 为什么
当前AI设定生成功能存在以下问题影响用户体验：
1. **无法中止生成** - 用户开始生成后无法取消，必须等待完成或刷新页面
2. **无中间状态存储** - 提取、解析、生成等中间环节失败后需从头开始，浪费时间和API调用
3. **重复概念未合并** - 相同概念（如同一主角在不同章节被提取）会生成多个重复条目
4. **输入输出不一致** - 解析阶段显示的内容与实际AI处理的内容不匹配，导致用户困惑

## 有什么变化

### 新增功能
- **生成中止机制** - 支持用户随时取消正在进行的AI生成流程
- **中间状态持久化** - 提取、解析的中间结果自动保存，支持断点续传
- **智能概念合并** - 基于语义相似度合并重复概念，叠加不重复内容
- **输入输出一致性校验** - 确保显示给用户的输入与实际发送给AI的内容一致

### 修改功能
- 优化 `WorldviewElementExtractor` 的 `_merge_results` 方法
- 增强 `AIGenerateModal` 的状态管理
- 改进流式API的错误处理和恢复机制

### 影响范围
- 后端：`worldview_generation.py`, `worldview_element_extractor.py`, `result_parser.py`
- 前端：`AIGenerateModal.jsx`, 相关流式处理逻辑
- 数据库：新增 `ai_generation_checkpoint` 表用于存储中间状态

## 需求规格

### 需求1: 生成中止功能
系统 SHALL 允许用户中止正在进行的AI生成流程。

#### 场景1.1: 用户主动中止
- **GIVEN** 用户正在使用AI生成功能
- **WHEN** 用户点击"中止生成"按钮
- **THEN** 系统应在3秒内停止AI调用
- **AND** 保留已生成的部分结果
- **AND** 显示"生成已中止"提示

#### 场景1.2: 自动清理资源
- **GIVEN** 用户已中止生成
- **WHEN** 中止信号发送后
- **THEN** 后端应关闭AI流式连接
- **AND** 释放相关资源

### 需求2: 中间状态存储
系统 SHALL 在关键节点自动保存中间结果，支持失败后恢复。

#### 场景2.1: 提取阶段断点续传
- **GIVEN** 用户正在提取设定元素
- **WHEN** 已完成大纲和卷纲提取，章纲提取失败
- **THEN** 系统应保存大纲和卷纲的提取结果
- **AND** 用户重新发起时可选择从断点继续

#### 场景2.2: 生成阶段断点续传
- **GIVEN** 用户正在批量生成详细设定
- **WHEN** 已完成3个角色生成，第4个失败
- **THEN** 系统应保存前3个角色的生成结果
- **AND** 用户可选择仅生成剩余角色

#### 场景2.3: 检查点自动清理
- **GIVEN** 检查点数据存在超过7天
- **WHEN** 系统执行清理任务
- **THEN** 应自动删除过期检查点

### 需求3: 重复概念合并
系统 SHALL 识别并合并重复概念，叠加不重复的内容。

#### 场景3.1: 同名概念合并（按章节组织）
- **GIVEN** 从不同章节提取到同名角色"张三"
- **WHEN** 系统检测到名称匹配
- **THEN** 应将两个条目合并为一个
- **AND** 简介字段应按章节组织，格式为：
  ```
  【第一章】简介A
  【第三章】简介B（新出现的特性）
  ```
- **AND** 证据字段应标注来源章节
- **AND** 如果同一属性在不同章节有变化（如状态、能力等级），应显示变化轨迹

#### 场景3.2: 相似概念合并
- **GIVEN** 提取到"魔法学院"和"魔法学院总部"
- **WHEN** 系统计算语义相似度超过阈值(0.85)
- **THEN** 应将两者识别为同一概念
- **AND** 使用更具体的名称作为合并后名称
- **AND** 叠加两个条目的所有信息

#### 场景3.3: 属性变化追踪
- **GIVEN** 角色"张三"在第一章是"学徒"，在第五章成为"法师"
- **WHEN** 系统合并这两个条目
- **THEN** 应识别出"等级/身份"属性的变化
- **AND** 在合并结果中显示变化轨迹：
  ```
  等级/身份变化：
  【第一章】学徒
  【第五章】法师
  ```

#### 场景3.4: 合并预览
- **GIVEN** 系统检测到可合并的重复概念
- **WHEN** 向用户展示提取结果
- **THEN** 应以视觉标识标出将被合并的条目
- **AND** 显示按章节组织的合并预览效果
- **AND** 突出显示新出现的特性和变化
- **AND** 允许用户手动调整合并决策

### 需求4: 输入输出一致性
系统 SHALL 确保用户看到的输入与实际发送给AI的内容一致。

#### 场景4.1: 提取阶段一致性
- **GIVEN** 系统显示"正在解析门能力"
- **WHEN** 查看实际发送给AI的prompt
- **THEN** prompt中应包含门能力相关内容
- **AND** 不应包含其他无关内容

#### 场景4.2: 生成阶段一致性
- **GIVEN** 系统显示"正在生成《主角》的设定"
- **WHEN** 查看实际发送给AI的请求
- **THEN** 请求内容应与主角相关
- **AND** 不应出现"玛娜力量体系"等其他内容

#### 场景4.3: 一致性校验日志
- **GIVEN** AI生成流程执行中
- **WHEN** 每个阶段切换时
- **THEN** 系统应记录当前处理的目标
- **AND** 记录实际发送的prompt摘要
- **AND** 便于排查不一致问题

## 技术方案

### 数据库表设计

```sql
-- AI生成检查点表
CREATE TABLE ai_generation_checkpoint (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(64) NOT NULL,  -- 生成会话ID
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    stage VARCHAR(50) NOT NULL,  -- 阶段: extraction, generation
    checkpoint_type VARCHAR(50),  -- 类型: outline, volume, chapter, element
    checkpoint_data TEXT,  -- JSON格式的检查点数据
    progress_percent INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'in_progress',  -- in_progress, completed, aborted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,  -- 过期时间，默认7天后
    INDEX idx_session (session_id),
    INDEX idx_project_user (project_id, user_id),
    INDEX idx_expires (expires_at)
);

-- 概念合并记录表
CREATE TABLE concept_merge_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(64) NOT NULL,
    concept_type VARCHAR(50) NOT NULL,
    source_concepts TEXT,  -- JSON数组，被合并的源概念（包含章节来源信息）
    merged_concept TEXT,  -- JSON，合并后的概念（按章节组织）
    attribute_changes TEXT,  -- JSON，属性变化轨迹记录
    similarity_score FLOAT,  -- 相似度分数
    merge_strategy VARCHAR(20),  -- name_match, semantic_similarity, manual
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session (session_id)
);
```

### API扩展

```python
# 新增API端点

# 中止生成
POST /api/worldview/abort-generation
{
    "session_id": "gen_sess_xxx"
}

# 恢复生成（从检查点）
POST /api/worldview/resume-generation
{
    "checkpoint_id": 123
}

# 获取检查点列表
GET /api/worldview/checkpoints?project_id=1

# 删除检查点
DELETE /api/worldview/checkpoints/:id

# 预览概念合并
POST /api/worldview/preview-merge
{
    "elements": {...},
    "merge_config": {
        "similarity_threshold": 0.85,
        "enable_semantic_merge": true
    }
}
```

### 前端组件扩展

```jsx
// AIGenerateModal 新增功能
- 中止按钮（生成过程中显示）
- 检查点恢复选项
- 合并预览面板
- 输入内容展开查看
```

## 验收标准

1. **中止功能**: 点击中止后3秒内停止生成，资源释放
2. **断点续传**: 网络中断后重新进入可恢复进度
3. **概念合并**: 重复概念自动合并率 > 90%
4. **一致性**: 显示内容与发送内容100%匹配
5. **性能**: 合并算法处理100个元素 < 1秒
