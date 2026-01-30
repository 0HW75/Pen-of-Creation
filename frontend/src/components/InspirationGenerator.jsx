import React, { useState } from 'react';
import { Card, Button, Tag, Space, Select, Input, Rate, Modal } from 'antd';
import { BulbOutlined, StarOutlined, CheckCircleOutlined, MessageOutlined, LikeOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const InspirationGenerator = ({ inspirations, onGenerate }) => {
  const [selectedType, setSelectedType] = useState('plot');
  const [isApplying, setIsApplying] = useState(false);
  const [selectedInspiration, setSelectedInspiration] = useState(null);
  const [applicationText, setApplicationText] = useState('');

  const defaultInspirations = [
    {
      id: 1,
      type: 'plot',
      content: '主角在一次偶然的机会中发现了一个神秘的物品，这个物品似乎与他的身世有关联。',
      description: '情节转折建议：通过神秘物品引出主角的身世之谜，推动故事发展。',
      rating: 4,
      status: '未使用',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      type: 'conflict',
      content: '主角的好友突然背叛了他，加入了敌对势力，原因是为了保护自己的家人。',
      description: '冲突点子：朋友变敌人的经典冲突，增加故事的戏剧性和情感深度。',
      rating: 5,
      status: '未使用',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      type: 'dialogue',
      content: '"你以为你了解我？你根本不知道我经历了什么！"她的声音颤抖着，眼中闪烁着泪光。',
      description: '对话开场：充满情感张力的对话，瞬间抓住读者的注意力。',
      rating: 4,
      status: '未使用',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      type: 'scene',
      content: '深夜的古城墙下，月光洒在青石板路上，远处传来悠扬的笛声，仿佛在诉说着古老的故事。',
      description: '场景灵感：营造氛围感的场景描写，为故事增添诗意和画面感。',
      rating: 5,
      status: '未使用',
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      type: 'character',
      content: '主角在经历了一系列挫折后，逐渐从一个天真的少年成长为一个有责任感的领袖。',
      description: '角色发展：主角的成长弧线，展现人物的变化和成熟过程。',
      rating: 4,
      status: '未使用',
      created_at: new Date().toISOString()
    }
  ];

  const inspirationList = inspirations.length > 0 ? inspirations : defaultInspirations;

  const getInspirationTypeTag = (type) => {
    const typeConfig = {
      plot: { color: 'blue', text: '情节转折' },
      conflict: { color: 'red', text: '冲突点子' },
      dialogue: { color: 'green', text: '对话开场' },
      scene: { color: 'purple', text: '场景灵感' },
      character: { color: 'orange', text: '角色发展' }
    };

    return typeConfig[type] || { color: 'default', text: '其他灵感' };
  };

  const handleGenerate = () => {
    onGenerate(selectedType);
  };

  const handleApplyInspiration = (inspiration) => {
    setSelectedInspiration(inspiration);
    setApplicationText(inspiration.content);
    setIsApplying(true);
  };

  const handleSaveApplication = () => {
    // 保存应用灵感的逻辑
    console.log('Apply inspiration:', selectedInspiration, applicationText);
    setIsApplying(false);
  };

  const handleRateInspiration = (inspirationId, rating) => {
    // 评分灵感的逻辑
    console.log('Rate inspiration:', inspirationId, rating);
  };

  return (
    <div>
      <Card 
        title="灵感激发器" 
        extra={
          <Space>
            <Select
              defaultValue="plot"
              style={{ width: 120 }}
              onChange={setSelectedType}
            >
              <Option value="plot">情节转折</Option>
              <Option value="conflict">冲突点子</Option>
              <Option value="dialogue">对话开场</Option>
              <Option value="scene">场景灵感</Option>
              <Option value="character">角色发展</Option>
            </Select>
            <Button type="primary" icon={<BulbOutlined />} onClick={handleGenerate}>
              生成灵感
            </Button>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {inspirationList.map(inspiration => {
            const typeConfig = getInspirationTypeTag(inspiration.type);
            const isUsed = inspiration.status === '已使用';
            const isSaved = inspiration.status === '已收藏';

            return (
              <Card
                key={inspiration.id}
                hoverable
                style={{ borderTop: `4px solid ${typeConfig.color}` }}
                actions={[
                  <Button 
                    size="small" 
                    icon={<CheckCircleOutlined />} 
                    onClick={() => handleApplyInspiration(inspiration)}
                  >
                    应用
                  </Button>,
                  <Button 
                    size="small" 
                    icon={<StarOutlined style={{ color: isSaved ? '#fadb14' : '' }} />} 
                  >
                    {isSaved ? '已收藏' : '收藏'}
                  </Button>,
                  <Button 
                    size="small" 
                    icon={<MessageOutlined />} 
                  >
                    分享
                  </Button>
                ]}
              >
                <Tag color={typeConfig.color}>{typeConfig.text}</Tag>
                <h4 style={{ margin: '12px 0' }}>{inspiration.content}</h4>
                <p style={{ color: '#666', fontSize: '12px', marginBottom: 12 }}>
                  {inspiration.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Rate 
                    defaultValue={inspiration.rating} 
                    onChange={(rating) => handleRateInspiration(inspiration.id, rating)}
                  />
                  <span style={{ color: '#999', fontSize: '12px' }}>
                    {new Date(inspiration.created_at).toLocaleString()}
                  </span>
                </div>
                <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
                  状态：{inspiration.status}
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      <Modal
        title="应用灵感"
        open={isApplying}
        onOk={handleSaveApplication}
        onCancel={() => setIsApplying(false)}
        width={600}
      >
        {selectedInspiration && (
          <div>
            <p style={{ marginBottom: 16 }}>灵感内容：{selectedInspiration.content}</p>
            <TextArea
              placeholder="在此基础上修改或扩展..."
              value={applicationText}
              onChange={(e) => setApplicationText(e.target.value)}
              rows={6}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InspirationGenerator;