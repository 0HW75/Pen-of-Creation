import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Space, Tag, message } from 'antd';
import { SaveOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const ChapterDetailEditor = ({ chapter, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [scenes, setScenes] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [inputValues, setInputValues] = useState({ scenes: '', characters: '', keywords: '' });

  useEffect(() => {
    if (chapter) {
      form.setFieldsValue({
        title: chapter.title,
        core_event: chapter.core_event,
        content: chapter.content,
        emotional_goal: chapter.emotional_goal,
        word_count_estimate: chapter.word_count_estimate,
      });

      // 解析数组字段
      setScenes(parseArrayField(chapter.scenes));
      setCharacters(parseArrayField(chapter.characters));
      setKeywords(parseArrayField(chapter.keywords));
    }
  }, [chapter, form]);

  const parseArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      return JSON.parse(field);
    } catch (e) {
      return field ? [field] : [];
    }
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const updatedChapter = {
        ...chapter,
        ...values,
        scenes,
        characters,
        keywords,
      };
      onSave(updatedChapter);
    });
  };

  const handleAddTag = (type, value) => {
    if (!value.trim()) return;
    const setter = type === 'scenes' ? setScenes : type === 'characters' ? setCharacters : setKeywords;
    const current = type === 'scenes' ? scenes : type === 'characters' ? characters : keywords;
    if (!current.includes(value.trim())) {
      setter([...current, value.trim()]);
      setInputValues({ ...inputValues, [type]: '' });
    }
  };

  const handleRemoveTag = (type, tag) => {
    const setter = type === 'scenes' ? setScenes : type === 'characters' ? setCharacters : setKeywords;
    const current = type === 'scenes' ? scenes : type === 'characters' ? characters : keywords;
    setter(current.filter((t) => t !== tag));
  };

  const renderTagInput = (type, label, placeholder) => (
    <Form.Item label={label}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space wrap>
          {(type === 'scenes' ? scenes : type === 'characters' ? characters : keywords).map((tag) => (
            <Tag
              key={tag}
              closable
              onClose={() => handleRemoveTag(type, tag)}
              color={type === 'scenes' ? 'blue' : type === 'characters' ? 'green' : 'purple'}
            >
              {tag}
            </Tag>
          ))}
        </Space>
        <Space>
          <Input
            placeholder={placeholder}
            value={inputValues[type]}
            onChange={(e) => setInputValues({ ...inputValues, [type]: e.target.value })}
            onPressEnter={() => handleAddTag(type, inputValues[type])}
            style={{ width: 200 }}
          />
          <Button
            icon={<PlusOutlined />}
            onClick={() => handleAddTag(type, inputValues[type])}
          >
            添加
          </Button>
        </Space>
      </Space>
    </Form.Item>
  );

  return (
    <div className="chapter-detail-editor">
      <Form
        form={form}
        layout="vertical"
        className="chapter-edit-form"
      >
        <Form.Item
          label="章节标题"
          name="title"
          rules={[{ required: true, message: '请输入章节标题' }]}
        >
          <Input placeholder="请输入章节标题" />
        </Form.Item>

        <Form.Item
          label="核心事件"
          name="core_event"
        >
          <TextArea
            rows={2}
            placeholder="请输入核心事件（2-3句话概括）"
          />
        </Form.Item>

        <Form.Item
          label="内容概要"
          name="content"
        >
          <TextArea
            rows={6}
            placeholder="请输入内容概要"
          />
        </Form.Item>

        {renderTagInput('scenes', '场景', '输入场景名称，按回车或点击添加')}
        {renderTagInput('characters', '出场角色', '输入角色名称，按回车或点击添加')}

        <Form.Item
          label="情感目标"
          name="emotional_goal"
        >
          <TextArea
            rows={2}
            placeholder="请输入情感目标（1-2句话描述本章要传达的情感）"
          />
        </Form.Item>

        {renderTagInput('keywords', '关键词', '输入关键词，按回车或点击添加')}

        <Form.Item
          label="预估字数"
          name="word_count_estimate"
        >
          <InputNumber
            min={500}
            max={50000}
            step={100}
            style={{ width: '100%' }}
            placeholder="请输入预估字数"
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
            >
              保存
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={onCancel}
            >
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChapterDetailEditor;
