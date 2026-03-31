# P6-Worldview提取模块重构计划

## 一、问题分析

### 1.1 现状问题

当前 `worldview_extraction.py` (API层) 和 `worldview_element_extractor.py` (服务层) 存在架构问题：

**架构层次混乱**
```
❌ 当前架构：
worldview_extraction.py (API层)
    ↓ 直接构建prompt ❌ 问题所在
    ↓ 调用AI

✅ 目标架构：
worldview_extraction.py (API层)
    ↓ 调用
worldview_element_extractor.py (服务层)
    ↓ 调用
WorldviewElementExtractor._build_extraction_prompt()
```

### 1.2 具体问题

| 问题 | 文件 | 说明 |
|-----|------|------|
| Prompt 构建重复 | `_extract_with_ai` (685行) | 自己构建 prompt，未复用 `_build_extraction_prompt()` |
| Prompt 构建重复 | `_extract_with_ai_stream` (805行) | 同上，流式版本 |
| 9 vs 13 类型不一致 | `_extract_with_ai` | 旧版用 9 种类型+evidence |
| 代码冗余 | 两个函数 | 与 `worldview_element_extractor.py` 功能重复 |

### 1.3 重构目标

1. **统一 prompt 构建**：所有提取逻辑使用同一个 `_build_extraction_prompt()` 方法
2. **移除代码冗余**：删除 `worldview_extraction.py` 中重复的 prompt 构建代码
3. **保持向后兼容**：确保 API 接口不变

## 二、重构方案

### 2.1 方案选择

**推荐方案：最小改动重构**

- 保留 `worldview_extraction.py` 的 API 结构
- 将 `_extract_with_ai` 和 `_extract_with_ai_stream` 改为调用 `WorldviewElementExtractor._build_extraction_prompt()`
- 删除重复的 prompt 构建代码

### 2.2 重构步骤

```
Step 1: 分析 _build_extraction_prompt() 方法
        ↓
Step 2: 修改 _extract_with_ai() 调用 _build_extraction_prompt()
        ↓
Step 3: 修改 _extract_with_ai_stream() 调用 _build_extraction_prompt()
        ↓
Step 4: 删除重复的 prompt 构建代码（原 685-896 行附近）
        ↓
Step 5: 测试验证功能一致性
```

## 三、实施细节

### 3.1 需要修改的函数

| 函数 | 文件 | 修改内容 |
|-----|------|---------|
| `_extract_with_ai` | worldview_extraction.py | 改为调用 `extractor._build_extraction_prompt()` |
| `_extract_with_ai_stream` | worldview_extraction.py | 同上，流式版本 |
| `_build_extraction_prompt` | worldview_element_extractor.py | 可能需要适配以支持两种调用方式 |

### 3.2 需要验证的功能

- [ ] 同步提取 (`_extract_with_ai`)
- [ ] 流式提取 (`_extract_with_ai_stream`)
- [ ] 检查点恢复
- [ ] 进度回调
- [ ] 历史记录

## 四、风险评估

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| 重构后功能不一致 | 高 | 全面测试验证 |
| API 兼容性问题 | 中 | 保持接口不变 |
| prompt 模板差异 | 中 | 对比两个 prompt 的差异 |

## 五、验收标准

1. **功能一致**：重构前后提取结果一致
2. **代码精简**：删除重复代码约 200 行
3. **架构清晰**：API 层只负责调用，服务层负责逻辑
4. **测试通过**：所有现有测试通过

## 六、后续优化建议（可选）

1. 考虑将 `worldview_extraction.py` 完全迁移到 `worldview_element_extractor.py`
2. 统一配置管理
3. 添加更多单元测试
