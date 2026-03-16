# 批量修改串行逐个处理优化计划

## 问题分析

当前批量修改是一股脑把所有项目发给AI，存在以下问题：
1. **Token限制**：上下文过大可能超出限制
2. **输出限制**：AI返回内容长度有限，无法完整返回所有项目
3. **逻辑不一致**：AI可能对每个项目的修改逻辑不同

## 优化目标

实现**串行逐个处理**，确保：
1. 逐个发送给AI修改
2. 保持修改逻辑统一（通过全局策略）
3. 实时显示进度
4. 支持中断和恢复

## 实现方案

### 阶段一：重构批量修改流程

#### 1.1 修改 AIChat 组件
文件：`frontend/src/components/AIChat.jsx`

- 新增批量处理状态管理（currentIndex, totalCount, isProcessing）
- 新增逐个处理函数 `processBatchSequentially`
- 新增进度显示组件
- 新增中断/恢复功能

#### 1.2 修改 useBlueprintManagement hook
文件：`frontend/src/hooks/useBlueprintManagement.js`

- 修改 `handleSendMessage` 支持单条处理
- 修改 `handleApplyAIChanges` 支持单条保存
- 新增全局策略缓存（确保逻辑统一）

### 阶段二：实现全局策略机制

#### 2.1 第一步：生成全局修改策略
```
用户输入修改需求 → AI生成全局策略 → 缓存策略
```

全局策略包含：
- 修改目标说明
- 命名规则（如地名替换规则）
- 风格要求
- 一致性约束

#### 2.2 第二步：逐个应用策略
```
对每个项目：
  项目内容 + 全局策略 → AI修改 → 保存 → 下一个
```

### 阶段三：优化提示词

#### 3.1 全局策略生成提示词
```
请根据用户的批量修改需求，生成一份全局修改策略文档：

1. 修改目标：...
2. 命名规则：...
3. 风格要求：...
4. 一致性约束：...
5. 示例：...
```

#### 3.2 单条修改提示词
```
全局策略：
[策略内容]

请根据以上策略，修改以下内容：
[项目内容]

要求：
1. 严格遵循全局策略
2. 保持字段完整性
3. 返回所有字段
```

### 阶段四：UI优化

#### 4.1 进度显示
- 显示当前处理第几个/总共几个
- 显示项目名称
- 显示处理状态（进行中/已完成/失败）

#### 4.2 控制按钮
- 开始批量修改
- 暂停/继续
- 取消

#### 4.3 结果展示
- 成功列表
- 失败列表（可重试）

## 实施步骤

### 步骤1：添加批量处理状态管理
文件：`frontend/src/components/AIChat.jsx`
```javascript
const [batchState, setBatchState] = useState({
  isProcessing: false,
  currentIndex: 0,
  totalCount: 0,
  results: [],
  globalStrategy: null,
  isPaused: false
});
```

### 步骤2：实现全局策略生成
```javascript
const generateGlobalStrategy = async (message, selectedItems) => {
  // 发送所有项目名称给AI，生成统一策略
  const strategy = await onSendMessage({
    type: 'strategy',
    message,
    items: selectedItems.map(i => i.data.title)
  });
  return strategy;
};
```

### 步骤3：实现串行处理函数
```javascript
const processBatchSequentially = async () => {
  // 1. 生成全局策略
  const strategy = await generateGlobalStrategy(inputValue, selectedItems);
  
  // 2. 逐个处理
  for (let i = 0; i < selectedItems.length; i++) {
    if (batchState.isPaused) {
      // 保存状态，等待恢复
      setBatchState(prev => ({ ...prev, currentIndex: i }));
      return;
    }
    
    // 更新进度
    setBatchState(prev => ({ ...prev, currentIndex: i + 1 }));
    
    // 处理当前项目
    const item = selectedItems[i];
    const response = await onSendMessage({
      type: 'single',
      message: inputValue,
      globalStrategy: strategy,
      targetData: item.data,
      context: getSingleItemContent(item)
    });
    
    // 保存修改
    await onApplyChanges({
      type: item.type,
      data: item.data,
      modifiedContent: response
    });
    
    // 延迟，避免请求过快
    await delay(500);
  }
  
  // 完成
  setBatchState(prev => ({ ...prev, isProcessing: false }));
};
```

### 步骤4：更新提示词
- 新增全局策略生成提示词
- 修改单条修改提示词，加入全局策略约束

### 步骤5：添加进度UI
- 进度条组件
- 项目列表（显示状态）
- 控制按钮（暂停/继续/取消）

## 预期效果

1. **逻辑统一**：所有项目遵循同一套全局策略
2. **避免token限制**：逐个处理，上下文小
3. **实时反馈**：用户可以看到处理进度
4. **可中断**：支持暂停和恢复
5. **容错性**：单个项目失败不影响其他项目

## 注意事项

1. 全局策略生成时，可以发送所有项目的标题，但不发送完整内容
2. 单条处理时，只发送当前项目的完整内容 + 全局策略
3. 添加适当的延迟，避免API限流
4. 保存状态到localStorage，支持页面刷新后恢复
