import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Space, Card, Divider, List, Tag } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const VolumeDetailEditor = ({ volume, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [keyEvents, setKeyEvents] = useState([]);

  useEffect(() => {
    if (volume) {
      form.setFieldsValue({
        title: volume.title,
        core_conflict: volume.core_conflict,
        content: volume.content,
        character_development: volume.character_development,
        chapter_count: volume.chapter_count,
        order_index: volume.order_index
      });
      setKeyEvents(volume.key_events || []);
    }
  }, [volume, form]);

  const handleSave = () => {
    const values = form.getFieldsValue();
    onSave({
      ...volume,
      ...values,
      key_events: keyEvents
    });
  };

  const handleAddKeyEvent = () => {
    setKeyEvents([...keyEvents, '']);
  };

  const handleUpdateKeyEvent = (index, value) => {
    const newEvents = [...keyEvents];
    newEvents[index] = value;
    setKeyEvents(newEvents);
  };

  const handleDeleteKeyEvent = (index) => {
    const newEvents = keyEvents.filter((_, i) => i !== index);
    setKeyEvents(newEvents);
  };

  if (!volume) {
    return <div>请选择一个卷纲</div>;
  }

  return (
    <Card 
      title={`编辑卷纲: ${volume.title}`}
      extra={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            保存
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="卷标题"
          name="title"
          rules={[{ required: true, message: '请输入卷标题' }]}
        >
          <Input placeholder="输入卷标题" />
        </Form.Item>

        <Form.Item
          label="核心冲突"
          name="core_conflict"
        >
          <TextArea 
            rows={3} 
            placeholder="描述本卷的核心冲突..."
          />
        </Form.Item>

        <Form.Item
          label="主要内容"
          name="content"
        >
          <TextArea 
            rows={6} 
            placeholder="描述本卷的主要内容..."
          />
        </Form.Item>

        <Form.Item
          label="角色发展"
          name="character_development"
        >
          <TextArea 
            rows={3} 
            placeholder="描述本卷的角色发展..."
          />
        </Form.Item>

        <Divider />

        <div style={{ marginBottom: 16 }}>
          <h4 style={{ marginBottom: 8 }}>关键事件</h4>
          <List
            dataSource={keyEvents}
            renderItem={(event, index) => (
              <List.Item
                actions={[
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteKeyEvent(index)}
                  >
                    删除
                  </Button>
                ]}
              >
                <Input
                  value={event}
                  onChange={(e) => handleUpdateKeyEvent(index, e.target.value)}
                  placeholder={`关键事件 ${index + 1}`}
                  style={{ width: '100%' }}
                />
              </List.Item>
            )}
          />
          <Button 
            type="dashed" 
            onClick={handleAddKeyEvent} 
            icon={<PlusOutlined />}
            style={{ marginTop: 8 }}
          >
            添加关键事件
          </Button>
        </div>

        <Divider />

        <Space>
          <Form.Item
            label="章节数量"
            name="chapter_count"
          >
            <InputNumber min={1} max={100} />
          </Form.Item>

          <Form.Item
            label="排序"
            name="order_index"
          >
            <InputNumber min={1} disabled />
          </Form.Item>
        </Space>
      </Form>
    </Card>
  );
};

export default VolumeDetailEditor;
