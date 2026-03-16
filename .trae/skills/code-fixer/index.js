const fs = require('fs');
const path = require('path');

/**
 * 长代码文件修复工具
 * 功能：修复长代码文件中的常见问题
 */
class CodeFixerSkill {
  constructor() {
    this.name = 'code-fixer';
    this.description = '长代码文件修复工具，用于检测和修复长代码文件中的常见问题';
  }

  /**
 * 修复长代码文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<Object>} 修复结果
 */
async fixCodeFile(filePath) {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        throw new Error(`文件不存在: ${filePath}`);
      }

      // 读取文件内容
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 分析文件长度
      const lines = content.split('\n');
      const fileLength = lines.length;
      
      console.log(`开始修复文件: ${filePath}`);
      console.log(`文件长度: ${fileLength} 行`);

      // 修复常见问题（使用分块处理避免token截断）
      const fixedContent = await this.fixContentInChunks(lines);
      let fixes = [];

      // 计算修复的问题数量
      const originalLines = content.split('\n');
      const fixedLines = fixedContent.split('\n');
      
      fixedLines.forEach((line, index) => {
        if (index < originalLines.length && line !== originalLines[index]) {
          fixes.push({
            line: index + 1,
            type: 'codeFix',
            description: '修复代码格式'
          });
        }
      });

      // 写入修复后的内容
      if (fixes.length > 0) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log(`修复完成，共修复 ${fixes.length} 个问题`);
      } else {
        console.log('文件无需修复');
      }

      return {
        success: true,
        filePath,
        fileLength,
        fixesCount: fixes.length,
        fixes
      };
    } catch (error) {
      console.error('修复文件时出错:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 分块处理文件内容，避免token截断
   * @param {string[]} lines - 文件行数组
   * @returns {Promise<string>} 修复后的内容
   */
  async fixContentInChunks(lines) {
    const chunkSize = 500; // 每块处理500行
    const fixedChunks = [];
    
    for (let i = 0; i < lines.length; i += chunkSize) {
      // 确定块的结束位置，尽量在代码结构边界处分割
      let endIndex = Math.min(i + chunkSize, lines.length);
      
      // 尝试在函数、类或代码块结束处分割
      for (let j = endIndex - 1; j >= i; j--) {
        const line = lines[j].trim();
        if (line === '}' || line === ');' || line === '];' || line === '};') {
          endIndex = j + 1;
          break;
        }
      }
      
      // 提取当前块
      const chunkLines = lines.slice(i, endIndex);
      const chunkContent = chunkLines.join('\n');
      
      console.log(`处理块 ${Math.floor(i / chunkSize) + 1}: 第 ${i + 1} 行到第 ${endIndex} 行`);
      
      // 修复当前块
      let fixedChunk = chunkContent;
      
      // 1. 修复缩进问题
      const indentFixes = this.fixIndentation(fixedChunk);
      if (indentFixes.fixed) {
        fixedChunk = indentFixes.content;
      }

      // 2. 修复多余空行
      const emptyLinesFixes = this.fixEmptyLines(fixedChunk);
      if (emptyLinesFixes.fixed) {
        fixedChunk = emptyLinesFixes.content;
      }

      // 3. 修复行尾空格
      const trailingSpacesFixes = this.fixTrailingSpaces(fixedChunk);
      if (trailingSpacesFixes.fixed) {
        fixedChunk = trailingSpacesFixes.content;
      }

      // 4. 修复代码格式
      const formatFixes = this.fixCodeFormat(fixedChunk);
      if (formatFixes.fixed) {
        fixedChunk = formatFixes.content;
      }
      
      fixedChunks.push(fixedChunk);
      
      // 更新i的值
      i = endIndex - 1;
    }
    
    // 合并所有块
    return fixedChunks.join('\n');
  }

  /**
   * 修复缩进问题
   * @param {string} content - 文件内容
   * @returns {Object} 修复结果
   */
  fixIndentation(content) {
    const lines = content.split('\n');
    const fixedLines = [];
    const fixes = [];
    let fixed = false;

    lines.forEach((line, index) => {
      // 检查并修复混合缩进（空格和制表符）
      if (line.match(/^\t/)) {
        // 将制表符转换为4个空格
        const fixedLine = line.replace(/^\t+/g, match => ' '.repeat(match.length * 4));
        if (fixedLine !== line) {
          fixedLines.push(fixedLine);
          fixes.push({
            line: index + 1,
            type: 'indentation',
            description: '将制表符缩进转换为空格缩进'
          });
          fixed = true;
        } else {
          fixedLines.push(line);
        }
      } else {
        fixedLines.push(line);
      }
    });

    return {
      fixed,
      content: fixedLines.join('\n'),
      fixes
    };
  }

  /**
   * 修复多余空行
   * @param {string} content - 文件内容
   * @returns {Object} 修复结果
   */
  fixEmptyLines(content) {
    const lines = content.split('\n');
    const fixedLines = [];
    const fixes = [];
    let fixed = false;
    let emptyLineCount = 0;

    lines.forEach((line, index) => {
      if (line.trim() === '') {
        emptyLineCount++;
        // 最多保留2个连续空行
        if (emptyLineCount <= 2) {
          fixedLines.push(line);
        } else {
          fixes.push({
            line: index + 1,
            type: 'emptyLines',
            description: '移除多余的空行'
          });
          fixed = true;
        }
      } else {
        emptyLineCount = 0;
        fixedLines.push(line);
      }
    });

    return {
      fixed,
      content: fixedLines.join('\n'),
      fixes
    };
  }

  /**
   * 修复行尾空格
   * @param {string} content - 文件内容
   * @returns {Object} 修复结果
   */
  fixTrailingSpaces(content) {
    const lines = content.split('\n');
    const fixedLines = [];
    const fixes = [];
    let fixed = false;

    lines.forEach((line, index) => {
      const fixedLine = line.replace(/\s+$/g, '');
      if (fixedLine !== line) {
        fixedLines.push(fixedLine);
        fixes.push({
          line: index + 1,
          type: 'trailingSpaces',
          description: '移除行尾空格'
        });
        fixed = true;
      } else {
        fixedLines.push(line);
      }
    });

    return {
      fixed,
      content: fixedLines.join('\n'),
      fixes
    };
  }

  /**
   * 修复代码格式
   * @param {string} content - 文件内容
   * @returns {Object} 修复结果
   */
  fixCodeFormat(content) {
    const lines = content.split('\n');
    const fixedLines = [];
    const fixes = [];
    let fixed = false;

    lines.forEach((line, index) => {
      let fixedLine = line;
      
      // 修复操作符周围的空格
      if (line.match(/[=+\-*/%&|^!<>:]=?/)) {
        const originalLine = fixedLine;
        fixedLine = fixedLine
          .replace(/([=+\-*/%&|^!<>:]=?)/g, ' $1 ')  // 在操作符周围添加空格
          .replace(/\s+/g, ' ')  // 合并多个空格
          .trim();  // 移除首尾空格
        
        if (fixedLine !== originalLine) {
          fixes.push({
            line: index + 1,
            type: 'codeFormat',
            description: '修复操作符周围的空格'
          });
          fixed = true;
        }
      }
      
      fixedLines.push(fixedLine);
    });

    return {
      fixed,
      content: fixedLines.join('\n'),
      fixes
    };
  }

  /**
   * 批量修复目录下的所有代码文件
   * @param {string} directoryPath - 目录路径
   * @param {string[]} extensions - 文件扩展名数组
   * @returns {Promise<Array>} 修复结果数组
   */
  async batchFixCodeFiles(directoryPath, extensions = ['.js', '.ts', '.jsx', '.tsx', '.css', '.scss']) {
    try {
      // 检查目录是否存在
      if (!fs.existsSync(directoryPath)) {
        throw new Error(`目录不存在: ${directoryPath}`);
      }

      const results = [];
      
      // 递归遍历目录
      const traverseDirectory = (currentPath) => {
        const files = fs.readdirSync(currentPath);
        
        files.forEach(file => {
          const filePath = path.join(currentPath, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            // 跳过node_modules等目录
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'build') {
              traverseDirectory(filePath);
            }
          } else if (extensions.includes(path.extname(file))) {
            // 修复符合扩展名的文件
            const result = this.fixCodeFile(filePath);
            results.push(result);
          }
        });
      };

      traverseDirectory(directoryPath);
      
      // 等待所有修复完成
      const finalResults = await Promise.all(results);
      
      return finalResults;
    } catch (error) {
      console.error('批量修复时出错:', error);
      return [{ success: false, error: error.message }];
    }
  }
}

// 导出skill
module.exports = CodeFixerSkill;

// 示例用法
if (require.main === module) {
  const codeFixer = new CodeFixerSkill();
  
  // 示例：修复单个文件
  if (process.argv.length > 2) {
    const filePath = process.argv[2];
    codeFixer.fixCodeFile(filePath)
      .then(result => {
        console.log('修复结果:', result);
      })
      .catch(error => {
        console.error('修复失败:', error);
      });
  } else {
    console.log('请提供要修复的文件路径');
    console.log('用法: node index.js <filePath>');
  }
}