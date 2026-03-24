import { useState, useCallback, useRef } from 'react';
import { aiVersionAPI } from '../services/api';

export const useBlueprintAI = (projectId, selectedOutline, selectedArchitect, worldviewStructurePrompt, callAIAPI) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingOutput, setStreamingOutput] = useState('');

  const safeJSONParse = (content, defaultValue = null) => {
    if (!content) return defaultValue;
    
    let cleaned = content.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
    cleaned = cleaned.trim();
    
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('JSON解析失败，尝试修复...', e.message);
      
      const jsonMatch = cleaned.match(/\{[\s\S]*/);
      if (jsonMatch) {
        let fixed = jsonMatch[0];
        
        fixed = fixed.replace(/[""]/g, '"');
        fixed = fixed.replace(/['']/g, "'");
        fixed = fixed.replace(/,\s*([}\]])/g, '$1');
        fixed = fixed.replace(/[\x00-\x1F\x7F]/g, (char) => {
          if (char === '\n') return '\\n';
          if (char === '\r') return '\\r';
          if (char === '\t') return '\\t';
          return '';
        });
        
        let openBraces = 0;
        let openBrackets = 0;
        let inString = false;
        let escapeNext = false;
        
        for (let i = 0; i < fixed.length; i++) {
          const char = fixed[i];
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          if (char === '"' && !escapeNext) {
            inString = !inString;
            continue;
          }
          if (!inString) {
            if (char === '{') openBraces++;
            else if (char === '}') openBraces--;
            else if (char === '[') openBrackets++;
            else if (char === ']') openBrackets--;
          }
        }
        
        if (inString) {
          fixed += '"';
        }
        
        if (openBraces > 0 || openBrackets > 0) {
          const lastCompleteMatch = fixed.match(/.*[}\]"0-9]\s*(,|\s*$)/);
          if (lastCompleteMatch) {
            fixed = lastCompleteMatch[0].replace(/,\s*$/, '');
          }
          
          openBraces = 0;
          openBrackets = 0;
          inString = false;
          escapeNext = false;
          
          for (let i = 0; i < fixed.length; i++) {
            const char = fixed[i];
            if (escapeNext) {
              escapeNext = false;
              continue;
            }
            if (char === '\\') {
              escapeNext = true;
              continue;
            }
            if (char === '"' && !escapeNext) {
              inString = !inString;
              continue;
            }
            if (!inString) {
              if (char === '{') openBraces++;
              else if (char === '}') openBraces--;
              else if (char === '[') openBrackets++;
              else if (char === ']') openBrackets--;
            }
          }
          
          while (openBrackets > 0) {
            fixed += ']';
            openBrackets--;
          }
          while (openBraces > 0) {
            fixed += '}';
            openBraces--;
          }
        }
        
        try {
          return JSON.parse(fixed);
        } catch (e2) {
          console.error('JSON修复后仍无法解析:', e2.message);
          console.error('修复后的内容前500字符:', fixed.substring(0, 500));
          
          try {
            const result = {};
            const idMatch = fixed.match(/"id"\s*:\s*(\d+)/);
            if (idMatch) result.id = parseInt(idMatch[1]);
            
            const titleMatch = fixed.match(/"title"\s*:\s*"([^"]*)"/);
            if (titleMatch) result.title = titleMatch[1];
            
            const conflictMatch = fixed.match(/"core_conflict"\s*:\s*"([^"]*)"/);
            if (conflictMatch) result.core_conflict = conflictMatch[1];
            
            const contentMatch = fixed.match(/"content"\s*:\s*"([\s\S]*?)"(?:\s*[,}]|$)/);
            if (contentMatch) result.content = contentMatch[1].replace(/\\n/g, '\n');
            
            const orderMatch = fixed.match(/"order_index"\s*:\s*(\d+)/);
            if (orderMatch) result.order_index = parseInt(orderMatch[1]);
            
            const chapterMatch = fixed.match(/"chapter_count"\s*:\s*(\d+)/);
            if (chapterMatch) result.chapter_count = parseInt(chapterMatch[1]);
            
            const eventsMatch = fixed.match(/"key_events"\s*:\s*\[([\s\S]*?)\]/);
            if (eventsMatch) {
              try {
                result.key_events = JSON.parse('[' + eventsMatch[1] + ']');
              } catch {
                result.key_events = [];
              }
            } else {
              result.key_events = [];
            }
            
            const charDevMatch = fixed.match(/"character_development"\s*:\s*"([^"]*)"/);
            if (charDevMatch) result.character_development = charDevMatch[1];
            
            if (Object.keys(result).length > 0) {
              console.log('成功提取部分字段:', result);
              return result;
            }
          } catch (e3) {
            console.error('字段提取失败:', e3);
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