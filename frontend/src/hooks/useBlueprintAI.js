import { useState, useCallback, useRef } from 'react';
import { aiVersionAPI } from '../services/api';

export const useBlueprintAI = (projectId, selectedOutline, selectedArchitect, worldviewStructurePrompt, callAIAPI) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingOutput, setStreamingOutput] = useState('');

  const fixMalformedJSON = async (malformedContent) => {
    if (!callAIAPI) {
      console.error('callAIAPI 不可用，无法修复 JSON');
      return null;
    }

    console.log('[AI修复JSON] 发送内容给AI修复...');

    const fixPrompt = `你是一个 JSON 修复专家。请将以下不规范的 JSON 修正为完全合法的 JSON。

## 修复规则（严格执行）

1. **定界符**：所有键名和字符串值必须使用英文双引号 " 包裹
2. **转义内部英文双引号**：字符串值内部如果出现英文双引号 "，必须加反斜杠转义：\\"
3. **中文引号保留原样**：中文引号 "..." '...' 『』 等不需要转义，作为普通字符保留
4. **单引号定界符转换**：如果使用单引号 ' 作为字符串定界符，改为英文双引号；但字符串内容中的单引号（如 It's）保留原样
5. **控制字符转义**：换行符 \\n、制表符 \\t、反斜杠 \\ 必须正确转义（反斜杠写成 \\\\）
6. **移除非法内容**：删除注释（// 或 /* */），删除末尾逗号（如 [1,2,] → [1,2]）
7. **提取代码块**：如果输入包含 Markdown 代码块，只提取代码块内的内容
8. **输出格式**：只输出纯 JSON 字符串，不包含任何解释、注释或 markdown 代码块

## 示例修复

输入: {"name": "张三", "message": "他说"你好"，然后说"再见"", 'status': '完成'}
输出: {"name": "张三", "message": "他说"你好"，然后说\"再见\"", "status": "完成"}

输入: {name: '测试'}
输出: {"name": "测试"}

要修复的JSON：
${malformedContent}`;

    try {
      const messages = [{ role: 'user', content: fixPrompt }];
      const response = await callAIAPI(messages, 2000, 0.3, null, { type: 'json_object' });
      console.log('[AI修复JSON] 原始响应:', response);

      let fixed = response.trim();
      fixed = fixed.replace(/^```json\s*/gim, '');
      fixed = fixed.replace(/^```\s*/gim, '');
      fixed = fixed.replace(/\s*```$/gim, '');
      fixed = fixed.trim();

      console.log('[AI修复JSON] 提取后:', fixed);
      return fixed;
    } catch (error) {
      console.error('[AI修复JSON] 失败:', error);
      return null;
    }
  };

  const safeJSONParse = async (content, defaultValue = null) => {
    if (!content) return defaultValue;

    console.log('[AI原始输出]', content);

    let cleaned = content.trim();
    cleaned = cleaned.replace(/^```json\s*/gim, '');
    cleaned = cleaned.replace(/^```\s*/gim, '');
    cleaned = cleaned.replace(/\s*```$/gim, '');
    cleaned = cleaned.trim();

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('JSON解析失败，尝试本地修复...', e.message);

      let fixed = cleaned;

      fixed = fixed.replace(/\u201c/g, '"');
      fixed = fixed.replace(/\u201d/g, '"');
      fixed = fixed.replace(/\u2018/g, "'");
      fixed = fixed.replace(/\u2019/g, "'");
      fixed = fixed.replace(/[""]/g, '"');
      fixed = fixed.replace(/['']/g, "'");
      fixed = fixed.replace(/`/g, '"');

      fixed = fixed.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

      fixed = fixed.replace(/,\s*([}\]])/g, '$1');

      fixed = fixed.replace(/\[\s*,/g, '[');
      fixed = fixed.replace(/,\s*\]/g, ']');

      fixed = fixed.replace(/:\s*"([^"]*)"([^,}\]]+)/g, (match, val, rest) => {
        if (rest.includes('"')) {
          return ': "' + val.replace(/"/g, '') + '"' + rest.replace(/"/g, '');
        }
        return match;
      });

      try {
        return JSON.parse(fixed);
      } catch (e2) {
        console.error('本地修复失败，尝试AI修复...', e2.message);
        console.log('[本地修复尝试]', fixed.substring(0, 500));

        const aiFixed = await fixMalformedJSON(cleaned);
        if (aiFixed) {
          try {
            console.log('[AI修复后]', aiFixed);
            return JSON.parse(aiFixed);
          } catch (e3) {
            console.error('AI修复后仍无法解析:', e3.message);
            console.log('[AI修复失败内容]', aiFixed.substring(0, 500));
          }
        }
      }
    }
    return defaultValue;
  };

  return {
    isStreaming,
    setIsStreaming,
    streamingOutput,
    setStreamingOutput,
    safeJSONParse,
  };
};
