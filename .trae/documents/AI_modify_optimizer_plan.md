# AI大纲修改助手优化计划

## 问题分析

当前AI修改助手存在以下问题：

1. **修改未生效**：AI返回的内容没有被正确提取和保存
2. **字段丢失**：场景、角色、关键词等字段信息在修改后丢失
3. **内容提取不准确**：正则表达式提取逻辑不够健壮

## 优化方案

### 阶段一：改进内容提取逻辑

#### 1.1 重构 `extractModifiedContent` 函数

* 使用更精确的正则表达式匹配

* 支持多行内容提取

* 添加字段完整性检查

#### 1.2 改进字段提取

针对不同类型的数据结构：

**大纲 (outline)**：

* title: 标题

* content: 主要内容

**卷纲 (volume)**：

* title: 标题

* order\_index: 卷号（只读）

* core\_conflict: 核心冲突

* content: 主要内容

* key\_events: 关键事件（数组）

* character\_development: 角色发展

* chapter\_count: 章节数量

**章纲 (chapter)**：

* title: 标题

* order\_index: 章节号（只读）

* core\_event: 核心事件

* content: 主要内容

* scenes: 场景（数组）

* characters: 出场角色（数组）

* emotional\_goal: 情感目标

* keywords: 关键词（数组）

* word\_count\_estimate: 预估字数

### 阶段二：优化AI提示词

#### 2.1 结构化输出要求

要求AI返回JSON格式或结构化文本，包含所有字段：

```
修改后的完整内容：

标题：xxx
核心事件：xxx
主要内容：
xxx

场景：
- 场景1
- 场景2

出场角色：
- 角色1
- 角色2

情感目标：xxx
关键词：
- 关键词1
- 关键词2
```

#### 2.2 明确字段说明

在提示词中明确列出需要修改和保留的所有字段

### 阶段三：改进保存逻辑

#### 3.1 智能合并策略

* 只更新AI明确修改的字段

* 未提及的字段保持原值

* 数组字段特殊处理（JSON字符串 vs 数组）

#### 3.2 添加调试日志

* 记录AI原始返回内容

* 记录提取后的字段值

* 记录实际保存的数据

### 阶段四：测试验证

#### 4.1 测试用例

1. 修改大纲内容
2. 修改卷纲核心冲突
3. 修改章纲场景和角色
4. 批量修改多个章纲

#### 4.2 验证点

* 修改是否生效

* 未修改字段是否保留

* 数组字段格式是否正确

## 实施步骤

### 步骤1：重构内容提取函数

文件：`frontend/src/hooks/useBlueprintManagement.js`

* 重写 `extractModifiedContent` 函数

* 添加多字段提取支持

* 添加数组字段解析

### 步骤2：优化AI提示词

文件：`frontend/src/hooks/useBlueprintManagement.js`

* 更新 `handleSendMessage` 中的 systemContent

* 要求AI返回结构化内容

* 明确列出所有字段

### 步骤3：改进保存逻辑

文件：`frontend/src/hooks/useBlueprintManagement.js`

* 修改 `applySingleChange` 函数

* 添加字段合并逻辑

* 添加调试日志

### 步骤4：添加字段预览

文件：`frontend/src/components/AIChat.jsx`

* 在预览区域显示所有字段

* 高亮显示即将修改的字段

## 预期效果

1. AI修改后的内容能正确保存到数据库
2. 未修改的字段（如场景、角色）保持原值
3. 批量修改时每个项目都能正确更新
4. 用户能清楚看到哪些字段被修改

## 注意事项

1. 保持向后兼容，支持旧格式的AI回复
2. 添加错误处理，避免提取失败导致保存失败
3. 考虑AI回复格式的

