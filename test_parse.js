// 测试 parseOutlineContent 函数

const parseOutlineContent = (content) => {
  if (!content) return '';

  try {
    // 尝试解析JSON格式
    const parsed = JSON.parse(content);

    // 如果有 ai_generated_content 字段，优先使用
    if (parsed.ai_generated_content) {
      return parsed.ai_generated_content;
    }

    // 构建格式化的 Markdown 内容
    let markdownContent = '';

    // 添加标题
    if (parsed.title) {
      markdownContent += `# ${parsed.title}\n\n`;
    }

    // 添加核心冲突
    if (parsed.core_conflict) {
      markdownContent += `## 核心冲突\n\n${parsed.core_conflict}\n\n`;
    }

    // 添加内容/主线剧情
    if (parsed.content) {
      markdownContent += `## 内容概要\n\n${parsed.content}\n\n`;
    }
    if (parsed.main_plot) {
      markdownContent += `## 主线剧情\n\n${parsed.main_plot}\n\n`;
    }

    // 添加次要情节
    if (parsed.sub_plots && Array.isArray(parsed.sub_plots) && parsed.sub_plots.length > 0) {
      markdownContent += `## 次要情节\n\n`;
      parsed.sub_plots.forEach((plot, index) => {
        markdownContent += `${index + 1}. ${plot}\n`;
      });
      markdownContent += `\n`;
    }

    // 添加关键事件
    if (parsed.key_events && Array.isArray(parsed.key_events) && parsed.key_events.length > 0) {
      markdownContent += `## 关键事件\n\n`;
      parsed.key_events.forEach((event, index) => {
        markdownContent += `${index + 1}. ${event}\n`;
      });
      markdownContent += `\n`;
    }

    // 添加角色弧线
    if (parsed.character_arcs && Array.isArray(parsed.character_arcs) && parsed.character_arcs.length > 0) {
      markdownContent += `## 角色弧线\n\n`;
      parsed.character_arcs.forEach((arc, index) => {
        markdownContent += `${index + 1}. ${arc}\n`;
      });
      markdownContent += `\n`;
    }

    // 添加主题
    if (parsed.theme) {
      markdownContent += `## 主题\n\n${parsed.theme}\n\n`;
    }

    // 如果以上字段都没有，返回原始内容的字符串表示
    if (!markdownContent) {
      // 遍历所有字段并显示
      Object.keys(parsed).forEach(key => {
        const value = parsed[key];
        if (typeof value === 'string' && value.trim()) {
          markdownContent += `## ${key}\n\n${value}\n\n`;
        } else if (Array.isArray(value) && value.length > 0) {
          markdownContent += `## ${key}\n\n`;
          value.forEach((item, index) => {
            markdownContent += `${index + 1}. ${item}\n`;
          });
          markdownContent += `\n`;
        }
      });
    }

    return markdownContent || content;
  } catch (e) {
    // 不是JSON，直接返回原文
    console.log('Parse error:', e.message);
    return content;
  }
};

// 测试数据 - 模拟截图中的内容
const testContent = JSON.stringify({
  "title": "双界工程：举国开发魔法纪元",
  "core_conflict": "以陈启和国家为代表的地球文明，在系统性、和平开发魔法世界'艾瑟兰'的过程中，与艾瑟兰内部守旧势力、既得利益集团、潜藏的远古灾厄以及觊觎两个世界通道的其他地球国家或组织，产生的关于发展理念、资源分配、文明主导权与生存安全的全方位、多层次冲突。核心是'有序共赢开发'与'混乱掠夺/保守封闭'之间的路线之争。",
  "content": "普通历史系毕业生陈启，在整理祖宅时意外触碰古物，获得了每周可双向穿越地球与魔法世界'艾瑟兰'的能力。最初，他只是利用两界差异进行倒买倒卖，改善生活。但随着对艾瑟兰了解的深入，他意识到这个魔法世界的巨大战略价值，以及其社会结构的落后性。陈启逐渐从一个投机者转变为两个世界文明交流的桥梁。他引入现代科技与管理理念，帮助艾瑟兰本地势力发展，同时也将魔法资源与知识引入地球，推动科技革命。然而，他的行动引起了艾瑟兰保守派贵族、地球野心家以及异界神明的注意。陈启必须在复杂的政治博弈中，维护两个世界的和平，推动文明的共同进步，最终建立起一个跨世界的合作体系。"
});

console.log('=== 测试 parseOutlineContent ===\n');
console.log('输入内容:');
console.log(testContent);
console.log('\n\n解析结果:');
console.log(parseOutlineContent(testContent));
