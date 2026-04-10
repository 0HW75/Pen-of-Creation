import React, { useState, useEffect } from 'react';
import { Modal, Steps, Button, message, Spin } from 'antd';
import { RobotOutlined, FileTextOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import Step1WithStream from './Step1WithStream';
import Step2ConfirmList from './Step2ConfirmList';
import Step3Generate from './Step3Generate';
import { worldviewGenerationApi } from '../../services/api';

const { Step } = Steps;

const CreateWorldWizard = ({ visible, onCancel, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // 步骤1数据
  const [step1Data, setStep1Data] = useState({
    projectId: null,
    contentScope: null,
    storyContext: null, // 保存故事上下文（大纲、卷纲、章纲内容）
  });
  
  // 步骤2数据
  const [step2Data, setStep2Data] = useState({
    extractionId: null,
    elements: {},
    selectedElements: {},
  });
  
  // 步骤3数据
  const [step3Data, setStep3Data] = useState({
    generationSessionId: null,
    batches: [],
    generatedWorldId: null,
    parentCheckpointId: null, // 关联的Step1检查点ID
  });

  // 重置状态
  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      setStep1Data({ projectId: null, contentScope: null, storyContext: null });
      setStep2Data({ extractionId: null, elements: {}, selectedElements: {} });
      setStep3Data({ generationSessionId: null, batches: [], generatedWorldId: null, parentCheckpointId: null });
    }
  }, [visible]);

  // 步骤1完成（流式提取完成后调用）
  const handleStep1Complete = async (data) => {
    console.log('步骤1完成，流式提取结果:', data);
    setLoading(true);
    try {
      setStep1Data(data);
      
      // 流式提取已经完成，直接使用返回的数据
      if (data.extractionResult) {
        const { elements, statistics } = data.extractionResult;
        
        // 默认全选所有元素
        const selectedElements = {};
        Object.keys(elements).forEach(key => {
          selectedElements[key] = elements[key].map(el => el.id);
        });
        
        setStep2Data({
          extractionId: `ext_${data.projectId}_${Date.now()}`,
          elements,
          selectedElements,
        });
        
        setCurrentStep(1);
        const totalElements = Object.values(statistics).reduce((a, b) => a + b, 0);
        message.success(`成功提取 ${totalElements} 个设定元素`);
      } else {
        // 如果没有流式结果，使用传统API调用（备用）
        const response = await worldviewGenerationApi.extractBlueprintElements({
          project_id: data.projectId,
          content_scope: data.contentScope,
          extraction_config: {
            target_types: ['characters', 'locations', 'factions', 'items', 'dimensions', 'regions', 'celestial_bodies', 'natural_laws', 'energy_systems', 'civilizations', 'social_classes', 'political_systems', 'economic_systems', 'cultural_customs', 'timeline_events', 'relations'],
            strategy: 'infer_potential',
          },
        });
        
        if (response.data.code === 200) {
          const { extraction_id, elements, statistics } = response.data.data;
          
          const selectedElements = {};
          Object.keys(elements).forEach(key => {
            selectedElements[key] = elements[key].map(el => el.id);
          });
          
          setStep2Data({
            extractionId: extraction_id,
            elements,
            selectedElements,
          });
          
          setCurrentStep(1);
          message.success(`成功提取 ${Object.values(statistics).reduce((a, b) => a + b, 0)} 个设定元素`);
        }
      }
    } catch (error) {
      console.error('处理提取结果失败:', error);
      message.error('提取设定元素失败：' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 步骤2完成
  const handleStep2Complete = async (selectedElements) => {
    setLoading(true);
    try {
      setStep2Data(prev => ({ ...prev, selectedElements }));
      
      // 保存用户选择的清单
      await worldviewGenerationApi.saveExtractionList({
        extraction_id: step2Data.extractionId,
        selections: selectedElements,
      });
      
      // 创建生成批次 - 传递实际的元素数据
      const response = await worldviewGenerationApi.createGenerationBatches({
        extraction_id: step2Data.extractionId,
        elements: step2Data.elements,  // 所有提取的元素
        selected_elements: selectedElements,  // 用户选择的元素ID
        batch_config: {
          batch_size: 5,
          priority_order: ['energy_systems', 'characters', 'locations', 'factions', 'dimensions', 'regions', 'celestial_bodies', 'natural_laws', 'civilizations', 'social_classes', 'political_systems', 'economic_systems', 'cultural_customs', 'items', 'timeline_events', 'relations'],
          generation_strategy: 'moderate',
          conflict_resolution: 'prompt',
        },
      });
      
      if (response.data.code === 200) {
        setStep3Data({
          generationSessionId: response.data.data.generation_session_id,
          batches: response.data.data.batches,
          generatedWorldId: null,
          parentCheckpointId: step1Data.checkpointId, // 保存Step1的检查点ID
        });

        setCurrentStep(2);
        message.success('已创建生成批次，共 ' + response.data.data.batches.length + ' 个批次');
      }
    } catch (error) {
      message.error('创建生成批次失败：' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 步骤3完成
  const handleStep3Complete = (worldId) => {
    setStep3Data(prev => ({ ...prev, generatedWorldId: worldId }));
    onComplete(worldId);
  };

  // 上一步
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      title: '选择蓝图',
      icon: <FileTextOutlined />,
      content: (
        <Step1WithStream
          onComplete={handleStep1Complete}
          initialData={step1Data}
        />
      ),
    },
    {
      title: '确认清单',
      icon: <CheckCircleOutlined />,
      content: (
        <Step2ConfirmList
          elements={step2Data.elements}
          selectedElements={step2Data.selectedElements}
          onComplete={handleStep2Complete}
          onPrev={handlePrev}
          loading={loading}
          onElementsUpdate={(integratedElements) => {
            setStep2Data(prev => ({
              ...prev,
              elements: integratedElements,
            }));
          }}
        />
      ),
    },
    {
      title: '生成设定',
      icon: <RobotOutlined />,
      content: (
        <Step3Generate
          generationSessionId={step3Data.generationSessionId}
          batches={step3Data.batches}
          onComplete={handleStep3Complete}
          onPrev={handlePrev}
          projectId={step1Data.projectId}
          worldId={step3Data.generatedWorldId}
          storyContext={step1Data.storyContext}
          parentCheckpointId={step3Data.parentCheckpointId}
        />
      ),
    },
  ];

  return (
    <Modal
      title="AI从故事蓝图生成世界观"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnHidden
      maskClosable={false}
    >
      <Spin
        spinning={loading}
        indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
        tip="处理中..."
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              icon={step.icon}
            />
          ))}
        </Steps>
        
        <div style={{ minHeight: 400 }}>
          {steps[currentStep].content}
        </div>
      </Spin>
    </Modal>
  );
};

export default CreateWorldWizard;
