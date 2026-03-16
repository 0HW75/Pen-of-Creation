import React, { useState } from 'react';
import { aiApi } from '../services/api';
import './AIProposalModal.css';

const AIProposalModal = ({ isOpen, onClose, onApply }) => {
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState(null);
  const [error, setError] = useState(null);

  // 生成项目提案
  const handleGenerate = async () => {
    if (!idea.trim()) {
      setError('请输入您的创意想法');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedProposal(null);

    try {
      const response = await aiApi.generateProjectProposal({
        idea: idea.trim(),
        temperature: 0.8,
        max_tokens: 2000
      });

      if (response.data.success) {
        setGeneratedProposal(response.data.proposal);
      } else {
        setError(response.data.error || '生成失败，请重试');
      }
    } catch (err) {
      console.error('生成提案失败:', err);
      setError(err.response?.data?.error || '生成失败，请检查AI配置');
    } finally {
      setIsGenerating(false);
    }
  };

  // 应用生成的提案到表单
  const handleApply = () => {
    if (generatedProposal) {
      onApply(generatedProposal);
      handleClose();
    }
  };

  // 关闭弹窗并重置状态
  const handleClose = () => {
    setIdea('');
    setGeneratedProposal(null);
    setError(null);
    onClose();
  };

  // 重新生成
  const handleRegenerate = () => {
    setGeneratedProposal(null);
    handleGenerate();
  };

  if (!isOpen) return null;

  return (
    <div className="ai-proposal-modal-overlay" onClick={handleClose}>
      <div className="ai-proposal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>AI创意提案</h3>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <div className="modal-content">
          {!generatedProposal ? (
            <>
              <div className="input-section">
                <label>请输入您的创意想法</label>
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="例如：我想写一个关于时间旅行者的故事，主角可以穿越到不同的历史时期，但每次穿越都会改变现实..."
                  rows={6}
                  disabled={isGenerating}
                />
                <p className="hint-text">
                  输入任何创意想法、故事概念或灵感，AI将为您生成完整的项目信息
                </p>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="action-buttons">
                <button
                  className="generate-button"
                  onClick={handleGenerate}
                  disabled={isGenerating || !idea.trim()}
                >
                  {isGenerating ? (
                    <>
                      <span className="spinner"></span>
                      AI生成中...
                    </>
                  ) : (
                    '生成项目提案'
                  )}
                </button>
                <button className="cancel-button" onClick={handleClose} disabled={isGenerating}>
                  取消
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="proposal-result">
                <div className="proposal-field">
                  <label>作品名</label>
                  <div className="field-value">{generatedProposal.title}</div>
                </div>

                <div className="proposal-field">
                  <label>笔名</label>
                  <div className="field-value">{generatedProposal.pen_name}</div>
                </div>

                <div className="proposal-field">
                  <label>作品类型</label>
                  <div className="field-value">{generatedProposal.genre}</div>
                </div>

                <div className="proposal-field">
                  <label>目标读者</label>
                  <div className="field-value">{generatedProposal.target_audience}</div>
                </div>

                <div className="proposal-field">
                  <label>核心主题</label>
                  <div className="field-value">{generatedProposal.core_theme}</div>
                </div>

                <div className="proposal-field">
                  <label>一句话梗概</label>
                  <div className="field-value">{generatedProposal.synopsis}</div>
                </div>

                <div className="proposal-field">
                  <label>创作风格</label>
                  <div className="field-value">{generatedProposal.writing_style}</div>
                </div>

                <div className="proposal-field">
                  <label>参考作品</label>
                  <div className="field-value">{generatedProposal.reference_works || '无'}</div>
                </div>

                <div className="proposal-field">
                  <label>AI建议</label>
                  <div className="field-value suggestion">{generatedProposal.suggestion}</div>
                </div>
              </div>

              <div className="action-buttons">
                <button className="apply-button" onClick={handleApply}>
                  应用此提案
                </button>
                <button className="regenerate-button" onClick={handleRegenerate} disabled={isGenerating}>
                  重新生成
                </button>
                <button className="cancel-button" onClick={handleClose}>
                  取消
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIProposalModal;
