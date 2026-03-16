---
name: "code-fixer"
description: "修复长代码文件中的常见问题，如缩进、空行、行尾空格和代码格式。当用户需要修复长代码文件时调用。"
---

# 长代码文件修复工具

## 功能描述

此技能用于修复长代码文件中的常见问题，包括：

- **缩进问题**：修复混合缩进（空格和制表符），将制表符转换为4个空格
- **多余空行**：移除连续的多余空行，最多保留2个连续空行
- **行尾空格**：移除行尾的多余空格
- **代码格式**：修复操作符周围的空格，使代码格式更加规范
- **长代码处理**：采用分块处理技术，避免由于token输出长度导致的截断问题，确保长代码文件也能被完整修复

## 使用场景

当遇到以下情况时，应该调用此技能：

- 用户需要修复长代码文件的格式问题
- 用户希望统一代码风格
- 代码文件存在缩进混乱的问题
- 代码文件包含过多的空行或行尾空格
- 用户需要批量修复目录下的多个代码文件

## 调用方式

### 修复单个文件

```bash
node index.js <filePath>
```

### 批量修复目录

```javascript
const CodeFixerSkill = require('./index');
const codeFixer = new CodeFixerSkill();

// 批量修复目录下的所有代码文件
codeFixer.batchFixCodeFiles('./src', ['.js', '.ts', '.jsx', '.tsx', '.css', '.scss'])
  .then(results => {
    console.log('修复结果:', results);
  })
  .catch(error => {
    console.error('修复失败:', error);
  });
```

## 修复结果

修复完成后，技能会返回以下信息：

- **success**：修复是否成功
- **filePath**：修复的文件路径
- **fileLength**：文件长度（行数）
- **fixesCount**：修复的问题数量
- **fixes**：详细的修复信息，包括：
  - **line**：修复的行号
  - **type**：修复的类型（indentation、emptyLines、trailingSpaces、codeFormat）
  - **description**：修复的描述

## 示例

### 输入：存在缩进问题的代码

```javascript
function hello() {
	console.log('Hello world');
	if (true) {
		console.log('True');
	}
}
```

### 输出：修复后的代码

```javascript
function hello() {
    console.log('Hello world');
    if (true) {
        console.log('True');
    }
}
```

## 注意事项

- 此技能会直接修改原始文件，请确保在修复前备份重要文件
- 修复过程中会保留文件的原始编码和行尾格式
- 对于非常大的文件，修复过程可能会需要一些时间
- 此技能主要针对常见的代码格式问题，不会修复逻辑错误或语法错误

## 依赖

- Node.js 14+
- 无需额外依赖包

## 安装

1. 将此技能复制到项目的 `.trae/skills/code-fixer/` 目录
2. 确保 `index.js` 文件存在并具有执行权限
3. 可以通过 `node index.js <filePath>` 直接运行

## 扩展

此技能可以通过以下方式扩展：

- 添加更多的代码格式规则
- 支持更多的文件类型
- 提供配置选项，允许用户自定义修复规则
- 添加代码语法错误检测和修复功能
- 集成到编辑器或IDE中，提供实时修复功能