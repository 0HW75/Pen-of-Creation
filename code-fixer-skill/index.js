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

      // 修复常见问题
      let fixedContent = content;
      let fixes = [];

      // 1. 修复缩进问题
      const indentFixes = this.fixIndentation(fixedContent);
      if (indentFixes.fixed) {
        fixedContent = indentFixes.content;
        fixes.push(...indentFixes.fixes);
      }

      // 2. 修复多余空行
      const emptyLinesFixes = this.fixEmptyLines(fixedContent);
      if (emptyLinesFixes.fixed) {
        fixedContent = emptyLinesFixes.content;
        fixes.push(...emptyLinesFixes.fixes);
      }

      // 3. 修复行尾空格
      const trailingSpacesFixes = this.fixTrailingSpaces(fixedContent);
      if (trailingSpacesFixes.fixed) {
        fixedContent = trailingSpacesFixes.content;
        fixes.push(...trailingSpacesFixes.fixes);
      }

      // 4. 修复代码格式
      const formatFixes = this.fixCodeFormat(fixedContent);
      if (formatFixes.fixed) {
        fixedContent = formatFixes.content;
        fixes.push(...formatFixes.fixes);
      }

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
          fixes