# 项目开发规则

## 一、数据库字段修改同步规范

**核心原则：修改数据库字段时，必须同时修改前端和后端代码。**

### 1.1 修改字段时的必做检查项

**后端修改：**
- 数据库模型（Model）
- API 接口（接收参数、返回数据）
- 数据库迁移脚本（如有）

**前端修改：**
- 表单字段名
- 表单验证规则
- 列表展示列（dataIndex）
- API 调用参数

### 1.2 修改流程

```
修改字段前 → 检查前端使用位置 → 检查后端使用位置 → 同时修改 → 测试创建/编辑/列表功能
```

---

## 二、前后端命名统一规范

**核心原则：后端数据库字段名为标准，前端必须适配后端。**

### 2.1 通用命名规则

| 后端字段名 | 前端表单字段名 | 说明 |
|-----------|---------------|------|
| `name` | `xxx_name` | 名称字段，前端加前缀区分，如 `civilization_name` |
| `description` | `description` | 描述字段，保持一致 |
| `type` / `xxx_type` | `type` / `xxx_type` | 类型字段，保持一致 |
| `level` | `level` / `level_number` | 等级数字 |
| `world_id` | - | 自动注入，无需表单字段 |
| `id`, `status`, `created_at` | - | 前端只读字段 |

### 2.2 字段映射规则

前后端字段名不一致时，在 `handleSubmit` 中转换：

```javascript
const handleSubmit = async (values) => {
  const data = {
    name: values.civilization_name,      // 前端 -> 后端
    development_level: values.development_stage,  // 字段名不同需转换
    world_id: worldId,
    description: values.description || '',
    // ... 其他字段
  };
  await api.create(data);
};
```

编辑时反向映射回填表单：

```javascript
form.setFieldsValue({
  civilization_name: record.name,
  development_stage: record.development_level,
  // ... 其他字段反向映射
});
```

### 2.3 表格列 dataIndex

表格列必须使用**后端返回的字段名**：

```javascript
// ❌ 错误
{ title: '文明名称', dataIndex: 'civilization_name' }

// ✅ 正确
{ title: '文明名称', dataIndex: 'name' }
```

---

## 三、禁止行为

- ❌ 只改前端不改后端
- ❌ 只改后端不改前端
- ❌ 前后端字段不一致且不转换
- ❌ 表格列 dataIndex 使用前端字段名
- ❌ 编辑时直接 `form.setFieldsValue(record)` 不做反向映射

---

## 四、代码文件长度规范

**核心原则：单个页面代码行数超过 1200 行时，需考虑拆分成不同文件。**

### 4.1 拆分建议

- 将独立的业务逻辑抽离为自定义 Hook
- 将复杂的表单逻辑拆分为独立的表单组件
- 将表格相关逻辑拆分为独立的表格组件
- 将工具函数提取到单独的 utils 文件中

### 4.2 拆分原则

- 保持单一职责原则，每个文件只负责一个明确的功能
- 拆分后的组件应具有良好的可复用性
- 避免过度拆分导致文件过于零散

---

## 五、快速检查清单

修改涉及前后端数据交互的功能时，检查：

- [ ] 后端 API 期望什么字段名？
- [ ] 前端表单字段名是什么？
- [ ] 是否需要字段映射转换？
- [ ] 表格列 dataIndex 是否正确？
- [ ] 编辑回显是否反向映射？
- [ ] 测试创建功能是否正常？
- [ ] 测试编辑功能是否正常？
- [ ] 当前文件是否超过 1200 行，需要拆分？
