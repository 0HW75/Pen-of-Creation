import React, { useState, useEffect } from 'react';
import { projectApi, aiApi } from '../services/api';
import { Select } from 'antd';
import './ProjectCreation.css';

// 项目创建组件
const ProjectCreation = () => {
  // 步骤状态
  const [currentStep, setCurrentStep] = useState(0);
  
  // 表单数据
  const [formData, setFormData] = useState({
    title: '',
    pen_name: '',
    genre: '',
    target_audience: '',
    core_theme: '',
    synopsis: '',
    writing_style: '',
    reference_works: '',
    daily_word_goal: 1000,
    total_word_goal: 100000,
    estimated_completion_date: '',
    selected_opening: '',
    emotion_board_images: []
  });
  
  // 智能开篇选项
  const [openingOptions, setOpeningOptions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 步骤配置
  const steps = [
    { title: '基础信息', description: '填写作品的基本信息和创作方向' },
    { title: '智能开篇', description: '生成并选择适合的故事开篇' },
    { title: '目标设定', description: '设定创作目标和时间计划' },
    { title: '情绪板', description: '上传参考图片，建立视觉风格' }
  ];
  
  // 作品类型选项
  const genres = [
    '玄幻', '言情', '悬疑', '科幻', '奇幻', '历史', '都市', '武侠', '仙侠', '恐怖', '喜剧', '悲剧'
  ];
  
  // 目标读者选项
  const targetAudiences = [
    '青少年', '成人', '儿童', '特定群体'
  ];
  
  // 创作风格选项
  const writingStyles = [
    '华丽', '简洁', '悬疑', '温馨', '幽默', '严肃', '浪漫', '写实', '奇幻', '科幻'
  ];
  
  // 处理表单输入变化
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // 生成智能开篇
  const generateOpenings = async () => {
    setIsGenerating(true);
    try {
      const prompt = `${formData.core_theme} - ${formData.synopsis}`;
      const response = await aiApi.generateOpening({
        prompt,
        genre: formData.genre,
        length: 300,
        count: 3,
        writing_style: formData.writing_style
      });
      
      if (response.data.success) {
        setOpeningOptions(response.data.openings || []);
      }
    } catch (error) {
      console.error('生成开篇失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 选择开篇
  const selectOpening = (opening) => {
    setFormData(prev => ({
      ...prev,
      selected_opening: opening
    }));
  };
  
  // 上传情绪板图片
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        // 这里暂时使用临时ID，实际应该在项目创建后使用真实ID
        const response = await projectApi.addEmotionBoardImage(1, formData);
        if (response.data) {
          setFormData(prev => ({
            ...prev,
            emotion_board_images: [...prev.emotion_board_images, response.data]
          }));
        }
      } catch (error) {
        console.error('上传图片失败:', error);
      }
    }
  };
  
  // 提交项目创建
  const handleSubmit = async () => {
    try {
      const response = await projectApi.createProject(formData);
      if (response.data) {
        // 创建成功后触发导航事件
        window.dispatchEvent(new CustomEvent('navigateTo', {
          detail: { key: 'editor' }
        }));
        // 同时设置选中的项目ID
        window.dispatchEvent(new CustomEvent('selectProject', {
          detail: { projectId: response.data.id }
        }));
      }
    } catch (error) {
      console.error('创建项目失败:', error);
    }
  };
  
  // 下一步
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // 上一步
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // 渲染步骤指示器
  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        {steps.map((step, index) => (
          <div key={index} className={`step-item ${index <= currentStep ? 'active' : ''}`}>
            <div className="step-number">{index + 1}</div>
            <div className="step-info">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
            {index < steps.length - 1 && <div className="step-line"></div>}
          </div>
        ))}
      </div>
    );
  };
  
  // 渲染基础信息步骤
  const renderBasicInfoStep = () => {
    return (
      <div className="step-content">
        <h3>基础信息填写</h3>
        
        <div className="form-group">
          <label>作品名</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="请输入作品名"
            required
          />
        </div>
        
        <div className="form-group">
          <label>笔名</label>
          <input
            type="text"
            value={formData.pen_name}
            onChange={(e) => handleInputChange('pen_name', e.target.value)}
            placeholder="请输入笔名"
            required
          />
        </div>
        
        <div className="form-group">
          <label>作品类型</label>
          <input
            type="text"
            value={formData.genre}
            onChange={(e) => handleInputChange('genre', e.target.value)}
            placeholder="请输入作品类型"
            required
          />
        </div>
        
        <div className="form-group">
          <label>目标读者</label>
          <input
            type="text"
            value={formData.target_audience}
            onChange={(e) => handleInputChange('target_audience', e.target.value)}
            placeholder="请输入目标读者群体"
            required
          />
        </div>
        
        <div className="form-group">
          <label>核心主题</label>
          <textarea
            value={formData.core_theme}
            onChange={(e) => handleInputChange('core_theme', e.target.value)}
            placeholder="请输入作品的核心主题或价值观"
            rows={3}
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label>一句话梗概</label>
          <input
            type="text"
            value={formData.synopsis}
            onChange={(e) => handleInputChange('synopsis', e.target.value)}
            placeholder="用一句话概括作品的核心内容"
            required
          />
        </div>
        
        <div className="form-group">
          <label>创作风格</label>
          <input
            type="text"
            value={formData.writing_style}
            onChange={(e) => handleInputChange('writing_style', e.target.value)}
            placeholder="请输入创作风格"
          />
        </div>
        
        <div className="form-group">
          <label>参考作品</label>
          <input
            type="text"
            value={formData.reference_works}
            onChange={(e) => handleInputChange('reference_works', e.target.value)}
            placeholder="请输入类似风格的参考作品"
          />
        </div>
      </div>
    );
  };
  
  // 渲染智能开篇步骤
  const renderOpeningStep = () => {
    return (
      <div className="step-content">
        <h3>智能开篇生成</h3>
        
        <div className="opening-generator">
          <button 
            onClick={generateOpenings}
            disabled={isGenerating || !formData.core_theme}
            className="generate-button"
          >
            {isGenerating ? '生成中...' : '生成开篇'}
          </button>
          
          <div className="opening-options">
            {openingOptions.map((opening, index) => (
              <div 
                key={index} 
                className={`opening-card ${formData.selected_opening === opening ? 'selected' : ''}`}
                onClick={() => selectOpening(opening)}
              >
                <div className="opening-header">
                  <h4>开篇 {index + 1}</h4>
                </div>
                <div className="opening-content">
                  {opening}
                </div>
                <div className="opening-actions">
                  <button className="select-button">
                    {formData.selected_opening === opening ? '已选择' : '选择'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染目标设定步骤
  const renderGoalSettingStep = () => {
    return (
      <div className="step-content">
        <h3>目标设定</h3>
        
        <div className="form-group">
          <label>每日目标字数: {formData.daily_word_goal}</label>
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={formData.daily_word_goal}
            onChange={(e) => handleInputChange('daily_word_goal', parseInt(e.target.value))}
          />
        </div>
        
        <div className="form-group">
          <label>总目标字数: {formData.total_word_goal}</label>
          <input
            type="range"
            min="10000"
            max="500000"
            step="10000"
            value={formData.total_word_goal}
            onChange={(e) => handleInputChange('total_word_goal', parseInt(e.target.value))}
          />
        </div>
        
        <div className="form-group">
          <label>预计完成时间</label>
          <input
            type="date"
            value={formData.estimated_completion_date}
            onChange={(e) => handleInputChange('estimated_completion_date', e.target.value)}
          />
        </div>
      </div>
    );
  };
  
  // 渲染情绪板步骤
  const renderEmotionBoardStep = () => {
    return (
      <div className="step-content">
        <h3>情绪板</h3>
        
        <div className="emotion-board">
          <div className="upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
            />
            <label className="upload-button">
              上传参考图片
            </label>
          </div>
          
          <div className="image-grid">
            {formData.emotion_board_images.map((image, index) => (
              <div key={index} className="image-item">
                <img src={image.image_url} alt={`参考图片 ${index + 1}`} />
                <div className="image-actions">
                  <button className="delete-button">删除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染当前步骤内容
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderOpeningStep();
      case 2:
        return renderGoalSettingStep();
      case 3:
        return renderEmotionBoardStep();
      default:
        return null;
    }
  };
  
  return (
    <div className="project-creation">
      <div className="creation-header">
        <h2>创建新项目</h2>
        <p>通过智能辅助和结构化流程，快速启动您的创作之旅</p>
      </div>
      
      {renderStepIndicator()}
      
      <div className="creation-content">
        {renderCurrentStep()}
      </div>
      
      <div className="creation-footer">
        <button 
          onClick={prevStep}
          disabled={currentStep === 0}
          className="prev-button"
        >
          上一步
        </button>
        
        {currentStep === steps.length - 1 ? (
          <button 
            onClick={handleSubmit}
            className="submit-button"
          >
            完成创建
          </button>
        ) : (
          <button 
            onClick={nextStep}
            className="next-button"
          >
            下一步
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectCreation;