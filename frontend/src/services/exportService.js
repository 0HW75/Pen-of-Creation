import { saveAs } from 'file-saver';
import axios from 'axios';

// 生成带时间戳的文件名
const generateFileName = (title, format) => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const baseName = title || 'document';
  const extensions = {
    word: 'docx',
    pdf: 'pdf',
    markdown: 'md',
    text: 'txt'
  };
  return `${baseName}_${timestamp}.${extensions[format] || format}`;
};

// 导出为Word格式
export const exportToWord = async (content, title, onProgress) => {
  try {
    onProgress && onProgress(20, '正在准备导出Word文档...');
    
    // 这里使用后端API来生成Word文档
    const response = await axios.post('http://localhost:5000/api/export/word', {
      content,
      title
    }, {
      responseType: 'blob'
    });
    
    onProgress && onProgress(80, '正在下载Word文档...');
    
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const fileName = generateFileName(title, 'word');
    saveAs(blob, fileName);
    
    onProgress && onProgress(100, 'Word文档导出成功！');
    return { success: true, message: `Word文档 "${fileName}" 导出成功！` };
  } catch (error) {
    console.error('Error exporting to Word:', error);
    // 降级方案：使用前端生成简单的Word文档
    onProgress && onProgress(50, '后端服务不可用，正在使用前端降级方案...');
    
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title || 'Document'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            .content { line-height: 1.6; }
            p { margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <h1>${title || 'Document'}</h1>
          <div class="content">${content.replace(/\n/g, '<p>')}</div>
        </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const fileName = generateFileName(title, 'word').replace('.docx', '.doc');
    saveAs(blob, fileName);
    
    onProgress && onProgress(100, 'Word文档（降级方案）导出成功！');
    return { 
      success: true, 
      message: `Word文档 "${fileName}" 导出成功（使用前端降级方案）！`,
      degraded: true 
    };
  }
};

// 导出为PDF格式
export const exportToPdf = async (content, title, onProgress) => {
  try {
    onProgress && onProgress(20, '正在准备导出PDF文档...');
    
    // 这里使用后端API来生成PDF文档
    const response = await axios.post('http://localhost:5000/api/export/pdf', {
      content,
      title
    }, {
      responseType: 'blob'
    });
    
    onProgress && onProgress(80, '正在下载PDF文档...');
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const fileName = generateFileName(title, 'pdf');
    saveAs(blob, fileName);
    
    onProgress && onProgress(100, 'PDF文档导出成功！');
    return { success: true, message: `PDF文档 "${fileName}" 导出成功！` };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    // 降级方案：使用前端生成HTML
    onProgress && onProgress(50, '后端服务不可用，正在使用HTML降级方案...');
    
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title || 'Document'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1 { color: #333; text-align: center; margin-bottom: 30px; }
            .content { max-width: 800px; margin: 0 auto; }
            p { margin-bottom: 12px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>${title || 'Document'}</h1>
          <div class="content">${content.replace(/\n/g, '<p>')}</div>
        </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const fileName = generateFileName(title, 'pdf').replace('.pdf', '.html');
    saveAs(blob, fileName);
    
    onProgress && onProgress(100, 'HTML文档（PDF降级方案）导出成功！');
    return { 
      success: true, 
      message: `HTML文档 "${fileName}" 导出成功（PDF降级方案）！`,
      degraded: true 
    };
  }
};

// 导出为Markdown格式
export const exportToMarkdown = (content, title, onProgress) => {
  onProgress && onProgress(50, '正在生成Markdown文档...');
  
  const markdownContent = `# ${title || 'Document'}\n\n${content}`;
  const blob = new Blob([markdownContent], { type: 'text/markdown' });
  const fileName = generateFileName(title, 'markdown');
  saveAs(blob, fileName);
  
  onProgress && onProgress(100, 'Markdown文档导出成功！');
  return { success: true, message: `Markdown文档 "${fileName}" 导出成功！` };
};

// 导出为纯文本格式
export const exportToText = (content, title, onProgress) => {
  onProgress && onProgress(50, '正在生成纯文本文档...');
  
  const textContent = `${title || 'Document'}\n\n${content}`;
  const blob = new Blob([textContent], { type: 'text/plain' });
  const fileName = generateFileName(title, 'text');
  saveAs(blob, fileName);
  
  onProgress && onProgress(100, '纯文本文档导出成功！');
  return { success: true, message: `纯文本文档 "${fileName}" 导出成功！` };
};

// 导出所有章节
export const exportAllChapters = async (chapters, format, projectTitle, onProgress) => {
  onProgress && onProgress(10, '正在准备批量导出...');
  
  // 按章节顺序排序
  const sortedChapters = [...chapters].sort((a, b) => a.order_index - b.order_index);
  
  // 生成带章节编号的内容
  const content = sortedChapters.map((chapter, index) => {
    const chapterNumber = index + 1;
    return `# 第${chapterNumber}章 ${chapter.title}\n\n${chapter.content}`;
  }).join('\n\n---\n\n');
  
  onProgress && onProgress(30, '正在生成导出内容...');
  
  let result;
  switch (format) {
    case 'word':
      result = await exportToWord(content, projectTitle, onProgress);
      break;
    case 'pdf':
      result = await exportToPdf(content, projectTitle, onProgress);
      break;
    case 'markdown':
      result = exportToMarkdown(content, projectTitle, onProgress);
      break;
    case 'text':
      result = exportToText(content, projectTitle, onProgress);
      break;
    default:
      return { success: false, message: '不支持的导出格式！' };
  }
  
  if (result.success) {
    result.message = `批量导出成功！共导出 ${chapters.length} 个章节。`;
  }
  
  return result;
};

// 本地数据存储
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// 从本地存储加载数据
export const loadFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

// 数据备份
export const backupData = (data, projectTitle) => {
  const backupContent = JSON.stringify(data, null, 2);
  const blob = new Blob([backupContent], { type: 'application/json' });
  saveAs(blob, `${projectTitle || 'backup'}_${new Date().toISOString().slice(0, 10)}.json`);
};

// 数据恢复
export const restoreData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(file);
  });
};