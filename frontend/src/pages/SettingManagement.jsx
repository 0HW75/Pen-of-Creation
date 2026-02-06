import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Select,
  message, Popconfirm, Space, Card, Typography,
  Menu
} from 'antd';
import axios from 'axios';

const { TextArea } = Input;
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  UserOutlined, EnvironmentOutlined,
  ToolOutlined, TeamOutlined,
  RocketOutlined, LinkOutlined,
  StarOutlined, DatabaseOutlined, ClockCircleOutlined,
  LeftOutlined, RightOutlined
} from '@ant-design/icons';
import {
  characterApi, locationApi, itemApi, factionApi, relationshipApi, settingApi, aiApi
} from '../services/api';
import { modules } from '../config/moduleConfig.jsx';

const { Title } = Typography;

const SettingManagement = ({ projectId }) => {
  const [activeModule, setActiveModule] = useState('world');
  const [activeSubModule, setActiveSubModule] = useState('worldSettings');
  const [collapsed, setCollapsed] = useState(false);
  const [settings, setSettings] = useState({
    characters: [],
    characterTraits: [],
    characterAbilities: [],
    characterRelationships: [],
    locations: [],
    locationStructures: [],
    specialLocations: [],
    items: [],
    equipmentSystems: [],
    specialItems: [],
    factions: [],
    factionStructures: [],
    factionGoals: [],
    relationships: [],
    timelines: [],
    worldSettings: [],
    energySystems: [],
    societyCultures: [],
    histories: [],
    abilities: [],
    skills: [],
    talents: [],
    races: [],
    creatures: [],
    specialCreatures: [],
    dataAssociations: []
  });
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // 将 form 实例移到 Modal 内部的组件中
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [cancelToken, setCancelToken] = useState(null);
  // AI设定生成状态
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [aiFunction, setAiFunction] = useState('world');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  // 加载设定数据
  const loadSettings = async (type) => {
    if (!projectId) return;
    
    // 取消之前的请求
    if (cancelToken) {
      cancelToken.cancel('请求已取消');
    }
    
    // 创建新的取消令牌
    const source = axios.CancelToken.source();
    setCancelToken(source);
    
    setLoading(true);
    try {
      let response;
      switch (type) {
        case 'characters':
          response = await characterApi.getCharacters(projectId, source.token);
          setSettings(prev => ({ ...prev, characters: response.data }));
          break;
        case 'locations':
          response = await locationApi.getLocations(projectId, source.token);
          setSettings(prev => ({ ...prev, locations: response.data }));
          break;
        case 'items':
          response = await itemApi.getItems(projectId, source.token);
          setSettings(prev => ({ ...prev, items: response.data }));
          break;
        case 'factions':
          response = await factionApi.getFactions(projectId, source.token);
          setSettings(prev => ({ ...prev, factions: response.data }));
          break;
        case 'relationships':
          response = await relationshipApi.getRelationships(projectId, source.token);
          setSettings(prev => ({ ...prev, relationships: response.data }));
          break;
        case 'worldSettings':
          response = await settingApi.getWorldSettings(projectId);
          setSettings(prev => ({ ...prev, worldSettings: response.data }));
          break;
        case 'energySystems':
          response = await settingApi.getEnergySystems(projectId);
          setSettings(prev => ({ ...prev, energySystems: response.data }));
          break;
        case 'societyCultures':
          response = await settingApi.getSocietyCultures(projectId);
          setSettings(prev => ({ ...prev, societyCultures: response.data }));
          break;
        case 'histories':
          response = await settingApi.getHistories(projectId);
          setSettings(prev => ({ ...prev, histories: response.data }));
          break;
        case 'abilities':
          response = await settingApi.getAbilities(projectId);
          setSettings(prev => ({ ...prev, abilities: response.data }));
          break;
        case 'skills':
          response = await settingApi.getSkills(projectId);
          setSettings(prev => ({ ...prev, skills: response.data }));
          break;
        case 'talents':
          response = await settingApi.getTalents(projectId);
          setSettings(prev => ({ ...prev, talents: response.data }));
          break;
        case 'races':
          response = await settingApi.getRaces(projectId);
          setSettings(prev => ({ ...prev, races: response.data }));
          break;
        case 'creatures':
          response = await settingApi.getCreatures(projectId);
          setSettings(prev => ({ ...prev, creatures: response.data }));
          break;
        case 'specialCreatures':
          response = await settingApi.getSpecialCreatures(projectId);
          setSettings(prev => ({ ...prev, specialCreatures: response.data }));
          break;
        case 'timelines':
          response = await settingApi.getTimelines(projectId);
          setSettings(prev => ({ ...prev, timelines: response.data }));
          break;
        case 'characterTraits':
          response = await settingApi.getCharacterTraits(projectId);
          setSettings(prev => ({ ...prev, characterTraits: response.data }));
          break;
        case 'characterAbilities':
          response = await settingApi.getCharacterAbilities(projectId);
          setSettings(prev => ({ ...prev, characterAbilities: response.data }));
          break;
        case 'characterRelationships':
          response = await settingApi.getCharacterRelationships(projectId);
          setSettings(prev => ({ ...prev, characterRelationships: response.data }));
          break;
        case 'factionStructures':
          response = await settingApi.getFactionStructures(projectId);
          setSettings(prev => ({ ...prev, factionStructures: response.data }));
          break;
        case 'factionGoals':
          response = await settingApi.getFactionGoals(projectId);
          setSettings(prev => ({ ...prev, factionGoals: response.data }));
          break;
        case 'locationStructures':
          response = await settingApi.getLocationStructures(projectId);
          setSettings(prev => ({ ...prev, locationStructures: response.data }));
          break;
        case 'specialLocations':
          response = await settingApi.getSpecialLocations(projectId);
          setSettings(prev => ({ ...prev, specialLocations: response.data }));
          break;
        case 'equipmentSystems':
          response = await settingApi.getEquipmentSystems(projectId);
          setSettings(prev => ({ ...prev, equipmentSystems: response.data }));
          break;
        case 'specialItems':
          response = await settingApi.getSpecialItems(projectId);
          setSettings(prev => ({ ...prev, specialItems: response.data }));
          break;
        case 'dataAssociations':
          response = await settingApi.getDataAssociations(projectId);
          setSettings(prev => ({ ...prev, dataAssociations: response.data }));
          break;
        default:
          break;
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        message.error('加载设定失败，请检查网络连接或后端服务是否正常');
        console.error('Error loading settings:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // 当模块或子模块切换时加载数据
  useEffect(() => {
    loadSettings(activeSubModule);
  }, [activeSubModule, projectId]);

  // 处理表单提交
  const handleSubmit = async (values) => {
    if (!projectId) {
      message.error('请先选择项目');
      return;
    }
    console.log('表单提交数据:', values);

    try {
      const data = { ...values, project_id: projectId };
      
      switch (activeSubModule) {
        case 'characters':
          if (isEditing) {
            await characterApi.updateCharacter(currentItem.id, data);
          } else {
            await characterApi.createCharacter(data);
          }
          break;
        case 'locations':
          if (isEditing) {
            await locationApi.updateLocation(currentItem.id, data);
          } else {
            await locationApi.createLocation(data);
          }
          break;
        case 'items':
          if (isEditing) {
            await itemApi.updateItem(currentItem.id, data);
          } else {
            await itemApi.createItem(data);
          }
          break;
        case 'factions':
          if (isEditing) {
            await factionApi.updateFaction(currentItem.id, data);
          } else {
            await factionApi.createFaction(data);
          }
          break;
        case 'relationships':
          if (isEditing) {
            await relationshipApi.updateRelationship(currentItem.id, data);
          } else {
            await relationshipApi.createRelationship(data);
          }
          break;
        case 'worldSettings':
          if (isEditing) {
            await settingApi.updateWorldSetting(currentItem.id, data);
          } else {
            await settingApi.createWorldSetting(data);
          }
          break;
        case 'energySystems':
          if (isEditing) {
            await settingApi.updateEnergySystem(currentItem.id, data);
          } else {
            await settingApi.createEnergySystem(data);
          }
          break;
        case 'societyCultures':
          if (isEditing) {
            await settingApi.updateSocietyCulture(currentItem.id, data);
          } else {
            await settingApi.createSocietyCulture(data);
          }
          break;
        case 'histories':
          if (isEditing) {
            await settingApi.updateHistory(currentItem.id, data);
          } else {
            await settingApi.createHistory(data);
          }
          break;
        case 'abilities':
          if (isEditing) {
            await settingApi.updateAbility(currentItem.id, data);
          } else {
            await settingApi.createAbility(data);
          }
          break;
        case 'skills':
          if (isEditing) {
            await settingApi.updateSkill(currentItem.id, data);
          } else {
            await settingApi.createSkill(data);
          }
          break;
        case 'talents':
          if (isEditing) {
            await settingApi.updateTalent(currentItem.id, data);
          } else {
            await settingApi.createTalent(data);
          }
          break;
        case 'races':
          if (isEditing) {
            await settingApi.updateRace(currentItem.id, data);
          } else {
            await settingApi.createRace(data);
          }
          break;
        case 'creatures':
          if (isEditing) {
            await settingApi.updateCreature(currentItem.id, data);
          } else {
            await settingApi.createCreature(data);
          }
          break;
        case 'specialCreatures':
          if (isEditing) {
            await settingApi.updateSpecialCreature(currentItem.id, data);
          } else {
            await settingApi.createSpecialCreature(data);
          }
          break;
        case 'timelines':
          if (isEditing) {
            await settingApi.updateTimeline(currentItem.id, data);
          } else {
            await settingApi.createTimeline(data);
          }
          break;
        case 'characterTraits':
          if (isEditing) {
            await settingApi.updateCharacterTrait(currentItem.id, data);
          } else {
            await settingApi.createCharacterTrait(data);
          }
          break;
        case 'characterAbilities':
          if (isEditing) {
            await settingApi.updateCharacterAbility(currentItem.id, data);
          } else {
            await settingApi.createCharacterAbility(data);
          }
          break;
        case 'characterRelationships':
          if (isEditing) {
            await settingApi.updateCharacterRelationship(currentItem.id, data);
          } else {
            await settingApi.createCharacterRelationship(data);
          }
          break;
        case 'factionStructures':
          if (isEditing) {
            await settingApi.updateFactionStructure(currentItem.id, data);
          } else {
            await settingApi.createFactionStructure(data);
          }
          break;
        case 'factionGoals':
          if (isEditing) {
            await settingApi.updateFactionGoal(currentItem.id, data);
          } else {
            await settingApi.createFactionGoal(data);
          }
          break;
        case 'locationStructures':
          if (isEditing) {
            await settingApi.updateLocationStructure(currentItem.id, data);
          } else {
            await settingApi.createLocationStructure(data);
          }
          break;
        case 'specialLocations':
          if (isEditing) {
            await settingApi.updateSpecialLocation(currentItem.id, data);
          } else {
            await settingApi.createSpecialLocation(data);
          }
          break;
        case 'equipmentSystems':
          if (isEditing) {
            await settingApi.updateEquipmentSystem(currentItem.id, data);
          } else {
            await settingApi.createEquipmentSystem(data);
          }
          break;
        case 'specialItems':
          if (isEditing) {
            await settingApi.updateSpecialItem(currentItem.id, data);
          } else {
            await settingApi.createSpecialItem(data);
          }
          break;
        case 'dataAssociations':
          if (isEditing) {
            await settingApi.updateDataAssociation(currentItem.id, data);
          } else {
            await settingApi.createDataAssociation(data);
          }
          break;
        default:
          break;
      }
      
      message.success(isEditing ? '更新成功' : '创建成功');
      setIsModalVisible(false);
      loadSettings(activeSubModule);
    } catch (error) {
      console.error('提交失败:', error);
      message.error(isEditing ? '更新失败' : '创建失败');
    }
  };

  // 处理删除设定
  const handleDelete = async (id) => {
    if (!projectId) {
      message.error('请先选择项目');
      return;
    }

    try {
      switch (activeSubModule) {
        case 'characters':
          await characterApi.deleteCharacter(id);
          break;
        case 'locations':
          await locationApi.deleteLocation(id);
          break;
        case 'items':
          await itemApi.deleteItem(id);
          break;
        case 'factions':
          await factionApi.deleteFaction(id);
          break;
        case 'relationships':
          await relationshipApi.deleteRelationship(id);
          break;
        case 'worldSettings':
          await settingApi.deleteWorldSetting(id);
          break;
        case 'energySystems':
          await settingApi.deleteEnergySystem(id);
          break;
        case 'societyCultures':
          await settingApi.deleteSocietyCulture(id);
          break;
        case 'histories':
          await settingApi.deleteHistory(id);
          break;
        case 'abilities':
          await settingApi.deleteAbility(id);
          break;
        case 'skills':
          await settingApi.deleteSkill(id);
          break;
        case 'talents':
          await settingApi.deleteTalent(id);
          break;
        case 'races':
          await settingApi.deleteRace(id);
          break;
        case 'creatures':
          await settingApi.deleteCreature(id);
          break;
        case 'specialCreatures':
          await settingApi.deleteSpecialCreature(id);
          break;
        case 'timelines':
          await settingApi.deleteTimeline(id);
          break;
        case 'characterTraits':
          await settingApi.deleteCharacterTrait(id);
          break;
        case 'characterAbilities':
          await settingApi.deleteCharacterAbility(id);
          break;
        case 'characterRelationships':
          await settingApi.deleteCharacterRelationship(id);
          break;
        case 'factionStructures':
          await settingApi.deleteFactionStructure(id);
          break;
        case 'factionGoals':
          await settingApi.deleteFactionGoal(id);
          break;
        case 'locationStructures':
          await settingApi.deleteLocationStructure(id);
          break;
        case 'specialLocations':
          await settingApi.deleteSpecialLocation(id);
          break;
        case 'equipmentSystems':
          await settingApi.deleteEquipmentSystem(id);
          break;
        case 'specialItems':
          await settingApi.deleteSpecialItem(id);
          break;
        case 'dataAssociations':
          await settingApi.deleteDataAssociation(id);
          break;
        default:
          break;
      }
      
      message.success('删除成功');
      loadSettings(activeSubModule);
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // 显示创建/编辑模态框
  const showModal = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setIsEditing(true);
    } else {
      setCurrentItem(null);
      setIsEditing(false);
    }
    setIsModalVisible(true);
  };

  // 渲染表单字段
  const renderForm = () => {
    const formItems = [];
    
    switch (activeSubModule) {
      case 'characters':
        formItems.push(
          <Form.Item key="name" name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input placeholder="请输入角色名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="角色描述">
            <TextArea rows={4} placeholder="请输入角色描述" />
          </Form.Item>
        );
        break;
      case 'locations':
        formItems.push(
          <Form.Item key="name" name="name" label="地点名称" rules={[{ required: true, message: '请输入地点名称' }]}>
            <Input placeholder="请输入地点名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="地点描述">
            <TextArea rows={4} placeholder="请输入地点描述" />
          </Form.Item>
        );
        break;
      case 'items':
        formItems.push(
          <Form.Item key="name" name="name" label="物品名称" rules={[{ required: true, message: '请输入物品名称' }]}>
            <Input placeholder="请输入物品名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="物品描述">
            <TextArea rows={4} placeholder="请输入物品描述" />
          </Form.Item>
        );
        break;
      case 'factions':
        formItems.push(
          <Form.Item key="name" name="name" label="势力名称" rules={[{ required: true, message: '请输入势力名称' }]}>
            <Input placeholder="请输入势力名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="势力描述">
            <TextArea rows={4} placeholder="请输入势力描述" />
          </Form.Item>
        );
        break;
      case 'relationships':
        formItems.push(
          <Form.Item key="name" name="name" label="关系名称" rules={[{ required: true, message: '请输入关系名称' }]}>
            <Input placeholder="请输入关系名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="关系描述">
            <TextArea rows={4} placeholder="请输入关系描述" />
          </Form.Item>
        );
        break;
      case 'worldSettings':
        formItems.push(
          <Form.Item key="name" name="name" label="世界设定名称" rules={[{ required: true, message: '请输入世界设定名称' }]}>
            <Input placeholder="请输入世界设定名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="世界设定描述">
            <TextArea rows={4} placeholder="请输入世界设定描述" />
          </Form.Item>
        );
        break;
      case 'energySystems':
        formItems.push(
          <Form.Item key="name" name="name" label="能量体系名称" rules={[{ required: true, message: '请输入能量体系名称' }]}>
            <Input placeholder="请输入能量体系名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="能量体系描述">
            <TextArea rows={4} placeholder="请输入能量体系描述" />
          </Form.Item>
        );
        break;
      case 'societyCultures':
        formItems.push(
          <Form.Item key="name" name="name" label="社会文化名称" rules={[{ required: true, message: '请输入社会文化名称' }]}>
            <Input placeholder="请输入社会文化名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="社会文化描述">
            <TextArea rows={4} placeholder="请输入社会文化描述" />
          </Form.Item>
        );
        break;
      case 'histories':
        formItems.push(
          <Form.Item key="name" name="name" label="历史事件名称" rules={[{ required: true, message: '请输入历史事件名称' }]}>
            <Input placeholder="请输入历史事件名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="历史事件描述">
            <TextArea rows={4} placeholder="请输入历史事件描述" />
          </Form.Item>
        );
        break;
      case 'abilities':
        formItems.push(
          <Form.Item key="name" name="name" label="能力名称" rules={[{ required: true, message: '请输入能力名称' }]}>
            <Input placeholder="请输入能力名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="能力描述">
            <TextArea rows={4} placeholder="请输入能力描述" />
          </Form.Item>
        );
        break;
      case 'skills':
        formItems.push(
          <Form.Item key="name" name="name" label="技能名称" rules={[{ required: true, message: '请输入技能名称' }]}>
            <Input placeholder="请输入技能名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="技能描述">
            <TextArea rows={4} placeholder="请输入技能描述" />
          </Form.Item>
        );
        break;
      case 'talents':
        formItems.push(
          <Form.Item key="name" name="name" label="天赋名称" rules={[{ required: true, message: '请输入天赋名称' }]}>
            <Input placeholder="请输入天赋名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="天赋描述">
            <TextArea rows={4} placeholder="请输入天赋描述" />
          </Form.Item>
        );
        break;
      case 'races':
        formItems.push(
          <Form.Item key="name" name="name" label="种族名称" rules={[{ required: true, message: '请输入种族名称' }]}>
            <Input placeholder="请输入种族名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="种族描述">
            <TextArea rows={4} placeholder="请输入种族描述" />
          </Form.Item>
        );
        break;
      case 'creatures':
        formItems.push(
          <Form.Item key="name" name="name" label="生物名称" rules={[{ required: true, message: '请输入生物名称' }]}>
            <Input placeholder="请输入生物名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="生物描述">
            <TextArea rows={4} placeholder="请输入生物描述" />
          </Form.Item>
        );
        break;
      case 'specialCreatures':
        formItems.push(
          <Form.Item key="name" name="name" label="特殊生物名称" rules={[{ required: true, message: '请输入特殊生物名称' }]}>
            <Input placeholder="请输入特殊生物名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="特殊生物描述">
            <TextArea rows={4} placeholder="请输入特殊生物描述" />
          </Form.Item>
        );
        break;
      case 'timelines':
        formItems.push(
          <Form.Item key="name" name="name" label="时间线名称" rules={[{ required: true, message: '请输入时间线名称' }]}>
            <Input placeholder="请输入时间线名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="时间线描述">
            <TextArea rows={4} placeholder="请输入时间线描述" />
          </Form.Item>
        );
        break;
      case 'characterTraits':
        formItems.push(
          <Form.Item key="name" name="name" label="内在特质名称" rules={[{ required: true, message: '请输入内在特质名称' }]}>
            <Input placeholder="请输入内在特质名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="内在特质描述">
            <TextArea rows={4} placeholder="请输入内在特质描述" />
          </Form.Item>
        );
        break;
      case 'characterAbilities':
        formItems.push(
          <Form.Item key="name" name="name" label="能力装备名称" rules={[{ required: true, message: '请输入能力装备名称' }]}>
            <Input placeholder="请输入能力装备名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="能力装备描述">
            <TextArea rows={4} placeholder="请输入能力装备描述" />
          </Form.Item>
        );
        break;
      case 'characterRelationships':
        formItems.push(
          <Form.Item key="name" name="name" label="关系发展名称" rules={[{ required: true, message: '请输入关系发展名称' }]}>
            <Input placeholder="请输入关系发展名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="关系发展描述">
            <TextArea rows={4} placeholder="请输入关系发展描述" />
          </Form.Item>
        );
        break;
      case 'factionStructures':
        formItems.push(
          <Form.Item key="name" name="name" label="组织结构名称" rules={[{ required: true, message: '请输入组织结构名称' }]}>
            <Input placeholder="请输入组织结构名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="组织结构描述">
            <TextArea rows={4} placeholder="请输入组织结构描述" />
          </Form.Item>
        );
        break;
      case 'factionGoals':
        formItems.push(
          <Form.Item key="name" name="name" label="能力目标名称" rules={[{ required: true, message: '请输入能力目标名称' }]}>
            <Input placeholder="请输入能力目标名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="能力目标描述">
            <TextArea rows={4} placeholder="请输入能力目标描述" />
          </Form.Item>
        );
        break;
      case 'locationStructures':
        formItems.push(
          <Form.Item key="name" name="name" label="内部结构名称" rules={[{ required: true, message: '请输入内部结构名称' }]}>
            <Input placeholder="请输入内部结构名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="内部结构描述">
            <TextArea rows={4} placeholder="请输入内部结构描述" />
          </Form.Item>
        );
        break;
      case 'specialLocations':
        formItems.push(
          <Form.Item key="name" name="name" label="特殊地点名称" rules={[{ required: true, message: '请输入特殊地点名称' }]}>
            <Input placeholder="请输入特殊地点名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="特殊地点描述">
            <TextArea rows={4} placeholder="请输入特殊地点描述" />
          </Form.Item>
        );
        break;
      case 'equipmentSystems':
        formItems.push(
          <Form.Item key="name" name="name" label="装备系统名称" rules={[{ required: true, message: '请输入装备系统名称' }]}>
            <Input placeholder="请输入装备系统名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="装备系统描述">
            <TextArea rows={4} placeholder="请输入装备系统描述" />
          </Form.Item>
        );
        break;
      case 'specialItems':
        formItems.push(
          <Form.Item key="name" name="name" label="特殊物品名称" rules={[{ required: true, message: '请输入特殊物品名称' }]}>
            <Input placeholder="请输入特殊物品名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="特殊物品描述">
            <TextArea rows={4} placeholder="请输入特殊物品描述" />
          </Form.Item>
        );
        break;
      case 'dataAssociations':
        formItems.push(
          <Form.Item key="name" name="name" label="数据关联名称" rules={[{ required: true, message: '请输入数据关联名称' }]}>
            <Input placeholder="请输入数据关联名称" />
          </Form.Item>,
          <Form.Item key="description" name="description" label="数据关联描述">
            <TextArea rows={4} placeholder="请输入数据关联描述" />
          </Form.Item>
        );
        break;
      default:
        break;
    }
    
    return formItems;
  };

  // 创建一个内部组件来包含 Form，这样 form 实例就只会在 Modal 可见时创建
  const SettingForm = ({ onSubmit }) => {
    const [form] = Form.useForm();
    
    // 当模态框显示且 currentItem 存在时，设置表单字段的值
    useEffect(() => {
      if (isEditing && currentItem) {
        form.setFieldsValue(currentItem);
      } else {
        form.resetFields();
      }
    }, [isEditing, currentItem, form]);
    
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        {renderForm()}

        <Form.Item style={{ textAlign: 'right' }}>
          <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: '8px' }}>
            取消
          </Button>
          <Button type="primary" htmlType="submit">
            {isEditing ? '更新' : '创建'}
          </Button>
        </Form.Item>
      </Form>
    );
  };

  // 渲染表格列
  const getColumns = (type) => {
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
        width: 400,
      },
      {
        title: '操作',
        key: 'action',
        width: 150,
        fixed: 'right',
        render: (_, record) => (
          <Space size="middle">
            <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
            <Popconfirm title="确定要删除这个设定吗？" onConfirm={() => handleDelete(record.id)}>
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Space>
        ),
      },
    ];
    
    return columns;
  };

  // 获取当前标签页的数据
  const getCurrentData = () => {
    return settings[activeSubModule] || [];
  };

  // 处理模块切换
  const handleModuleChange = (moduleKey) => {
    setActiveModule(moduleKey);
    // 获取该模块的第一个子模块
    const module = modules.find(m => m.key === moduleKey);
    if (module && module.subModules.length > 0) {
      setActiveSubModule(module.subModules[0].key);
    }
  };

  // 处理子模块切换
  const handleSubModuleChange = (subModuleKey) => {
    setActiveSubModule(subModuleKey);
  };

  // 处理AI生成
  const handleAiGenerate = async () => {
    if (!aiPrompt) {
      message.error('请输入创意提示');
      return;
    }
    
    setIsAiLoading(true);
    setAiResult('');
    
    try {
      let messages = [];
      let maxTokens = 1000;
      
      switch (aiFunction) {
        case 'world':
          messages = [
            {
              'role': 'system',
              'content': '你是一位专业的小说世界观设定师，擅长构建丰富、独特的世界观。'
            },
            {
              'role': 'user',
              'content': `请根据以下创意生成一个详细的小说世界观设定，包括但不限于：世界名称、地理环境、历史背景、社会结构、能量体系、主要种族等。\n\n创意：${aiPrompt}`
            }
          ];
          maxTokens = 1500;
          break;
        case 'character':
          messages = [
            {
              'role': 'system',
              'content': '你是一位专业的小说角色设定师，擅长塑造立体、有深度的角色。'
            },
            {
              'role': 'user',
              'content': `请根据以下创意生成一个详细的小说角色设定，包括但不限于：角色名称、性别、年龄、外貌特征、性格特点、背景故事、能力技能等。\n\n创意：${aiPrompt}`
            }
          ];
          maxTokens = 1200;
          break;
        case 'energy':
          messages = [
            {
              'role': 'system',
              'content': '你是一位专业的小说能量体系设定师，擅长设计独特、平衡的能量系统。'
            },
            {
              'role': 'user',
              'content': `请根据以下创意生成一个详细的小说能量体系设定，包括但不限于：能量名称、来源、等级划分、使用方法、限制条件等。\n\n创意：${aiPrompt}`
            }
          ];
          maxTokens = 1200;
          break;
        case 'society':
          messages = [
            {
              'role': 'system',
              'content': '你是一位专业的小说社会文化设定师，擅长构建丰富、真实的社会体系。'
            },
            {
              'role': 'user',
              'content': `请根据以下创意生成一个详细的小说社会文化设定，包括但不限于：社会结构、风俗习惯、宗教信仰、教育体系、艺术形式等。\n\n创意：${aiPrompt}`
            }
          ];
          maxTokens = 1200;
          break;
        case 'history':
          messages = [
            {
              'role': 'system',
              'content': '你是一位专业的小说历史事件设定师，擅长设计有意义、影响深远的历史事件。'
            },
            {
              'role': 'user',
              'content': `请根据以下创意生成一个详细的小说历史事件设定，包括但不限于：事件名称、发生时间、地点、参与方、起因、经过、结果、影响等。\n\n创意：${aiPrompt}`
            }
          ];
          maxTokens = 1200;
          break;
        case 'ability':
          messages = [
            {
              'role': 'system',
              'content': '你是一位专业的小说能力设定师，擅长设计独特、有创意的能力。'
            },
            {
              'role': 'user',
              'content': `请根据以下创意生成一个详细的小说能力设定，包括但不限于：能力名称、等级、类型、使用方法、效果、限制条件等。\n\n创意：${aiPrompt}`
            }
          ];
          maxTokens = 1200;
          break;
        case 'race':
          messages = [
            {
              'role': 'system',
              'content': '你是一位专业的小说种族设定师，擅长设计独特、丰富的种族特性。'
            },
            {
              'role': 'user',
              'content': `请根据以下创意生成一个详细的小说种族设定，包括但不限于：种族名称、起源传说、分布区域、社会形态、生理特性、特殊能力、弱点限制等。\n\n创意：${aiPrompt}`
            }
          ];
          maxTokens = 1500;
          break;
        case 'creature':
          messages = [
            {
              'role': 'system',
              'content': '你是一位专业的小说生物设定师，擅长设计独特、有趣的生物特性。'
            },
            {
              'role': 'user',
              'content': `请根据以下创意生成一个详细的小说生物设定，包括但不限于：生物名称、生物类型、栖息环境、行为习性、特殊能力、弱点天敌、威胁等级等。\n\n创意：${aiPrompt}`
            }
          ];
          maxTokens = 1200;
          break;
        case 'timeline':
          messages = [
            {
              'role': 'system',
              'content': '你是一位专业的小说时间线设定师，擅长设计连贯、有意义的时间脉络。'
            },
            {
              'role': 'user',
              'content': `请根据以下创意生成一个详细的小说时间线设定，包括但不限于：时间线名称、开始时间、结束时间、关键事件、历史意义、影响等。\n\n创意：${aiPrompt}`
            }
          ];
          maxTokens = 1500;
          break;
        default:
          break;
      }
      
      // 使用流式输出
      const response = await aiApi.streamChatCompletion({
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7
      });
      
      // 处理流式响应
      let partialResult = '';
      
      console.log('响应数据类型:', typeof response.data);
      console.log('响应数据:', response.data);
      console.log('响应完整对象:', response);
      
      // 检查response.data的类型
      if (response.data) {
        if (typeof response.data === 'object') {
          console.log('响应数据是对象，检查是否有getReader方法:', typeof response.data.getReader);
          console.log('响应数据是否有on方法:', typeof response.data.on);
          
          if (response.data.getReader) {
            // 如果是ReadableStream对象
            console.log('处理ReadableStream对象');
            const reader = response.data.getReader();
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                console.log('ReadableStream读取完成');
                break;
              }
              
              // 解析SSE数据
              const chunk = new TextDecoder('utf-8').decode(value);
              console.log('ReadableStream读取到数据:', chunk);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.substring(6);
                  if (data === '[DONE]') {
                    console.log('ReadableStream遇到[DONE]');
                    break;
                  }
                  try {
                    const chunkData = JSON.parse(data);
                    console.log('ReadableStream解析到数据:', chunkData);
                    if (chunkData.content) {
                      partialResult += chunkData.content;
                      setAiResult(partialResult);
                    }
                  } catch (error) {
                    console.error('解析流式响应失败:', error);
                  }
                }
              }
            }
          } else if (typeof response.data.on === 'function') {
            // 如果是Node.js风格的流
            console.log('处理Node.js风格的流');
            response.data.on('data', (chunk) => {
              const chunkStr = chunk.toString('utf-8');
              console.log('Node.js流接收到数据:', chunkStr);
              const lines = chunkStr.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.substring(6);
                  if (data === '[DONE]') {
                    console.log('Node.js流遇到[DONE]');
                    return;
                  }
                  try {
                    const chunkData = JSON.parse(data);
                    console.log('Node.js流解析到数据:', chunkData);
                    if (chunkData.content) {
                      partialResult += chunkData.content;
                      setAiResult(partialResult);
                    }
                  } catch (error) {
                    console.error('解析流式响应失败:', error);
                  }
                }
              }
            });

            response.data.on('end', () => {
              console.log('Node.js流结束');
            });

            response.data.on('error', (error) => {
              console.error('Node.js流错误:', error);
              message.error('生成过程中出现错误');
            });
          } else {
            // 如果是普通对象
            console.log('处理普通对象响应');
            if (response.data.content) {
              setAiResult(response.data.content);
            }
          }
        } else if (typeof response.data === 'string') {
          // 如果是字符串
          console.log('处理字符串响应');
          setAiResult(response.data);
        }
      }
    } catch (error) {
      console.error('AI生成错误:', error);
      message.error('生成失败，请检查网络连接或重试');
    } finally {
      setIsAiLoading(false);
    }
  };

  // 应用AI生成结果到表单
  const handleApplyAiResult = () => {
    setIsAiModalVisible(false);
    // 这里可以根据需要解析aiResult并填充到表单
    message.success('AI生成结果已应用');
  };

  // 获取当前模块的子模块
  const getCurrentSubModules = () => {
    const module = modules.find(m => m.key === activeModule);
    return module ? module.subModules : [];
  };

  // 获取当前子模块的信息
  const getCurrentSubModuleInfo = () => {
    const module = modules.find(m => m.key === activeModule);
    if (!module) return null;
    return module.subModules.find(sm => sm.key === activeSubModule);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部标题栏 */}
      <div style={{ height: 64, background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ marginRight: 8 }}
          />
          <Typography.Title level={4} style={{ margin: 0 }}>
            设定管理
          </Typography.Title>
        </div>
        <Button
          type="primary"
          icon={<RocketOutlined />}
          onClick={() => setIsAiModalVisible(true)}
        >
          AI生成设定
        </Button>
      </div>

      {/* 主内容区 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左侧菜单 */}
        <Menu
          mode="inline"
          theme="light"
          inlineCollapsed={collapsed}
          selectedKeys={[activeModule]}
          onSelect={({ key }) => handleModuleChange(key)}
          style={{ width: collapsed ? 80 : 240, background: '#fff', borderRight: '1px solid #f0f0f0' }}
          items={modules.map(module => ({
            key: module.key,
            label: (
              <span>
                {module.icon}
                <span>{module.label}</span>
              </span>
            ),
            children: module.subModules.map(subModule => ({
              key: subModule.key,
              label: subModule.label,
              onClick: () => handleSubModuleChange(subModule.key)
            }))
          }))}
        />

        {/* 右侧内容 */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto', background: '#f5f5f5' }}>
          {/* 子模块选择按钮组 */}
          <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {getCurrentSubModules().map(subModule => (
              <Button
                key={subModule.key}
                type={activeSubModule === subModule.key ? 'primary' : 'default'}
                onClick={() => handleSubModuleChange(subModule.key)}
              >
                {subModule.label}
              </Button>
            ))}
          </div>

          {/* 内容区域 */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                {getCurrentSubModuleInfo()?.label || '设定管理'}
              </Typography.Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
              >
                新增设定
              </Button>
            </div>

            {/* 表格 */}
            <Table
              columns={getColumns(activeSubModule)}
              dataSource={getCurrentData()}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </Card>
        </div>
      </div>

      {/* 设定编辑模态框 */}
      <Modal
        title={isEditing ? '更新设定' : '创建设定'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <SettingForm onSubmit={handleSubmit} />
      </Modal>

      {/* AI生成模态框 */}
      <Modal
        title="AI生成设定"
        open={isAiModalVisible}
        onCancel={() => setIsAiModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsAiModalVisible(false)}>
            取消
          </Button>,
          <Button key="apply" type="primary" onClick={handleApplyAiResult} disabled={!aiResult}>
            应用结果
          </Button>
        ]}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Form layout="vertical">
            <Form.Item label="生成类型">
              <Select
                value={aiFunction}
                onChange={setAiFunction}
                style={{ width: '100%' }}
              >
                <Select.Option value="world">世界观设定</Select.Option>
                <Select.Option value="character">角色设定</Select.Option>
                <Select.Option value="energy">能量体系设定</Select.Option>
                <Select.Option value="society">社会文化设定</Select.Option>
                <Select.Option value="history">历史事件设定</Select.Option>
                <Select.Option value="ability">能力设定</Select.Option>
                <Select.Option value="race">种族设定</Select.Option>
                <Select.Option value="creature">生物设定</Select.Option>
                <Select.Option value="timeline">时间线设定</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="创意提示">
              <TextArea
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="请输入你的创意提示，越详细越好"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                onClick={handleAiGenerate}
                loading={isAiLoading}
                style={{ width: '100%' }}
              >
                开始生成
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, maxHeight: 400, overflowY: 'auto' }}>
          <Typography.Title level={5} style={{ marginBottom: 16 }}>
            生成结果
          </Typography.Title>
          <Typography.Paragraph>
            {aiResult || '生成结果将显示在这里...'}
          </Typography.Paragraph>
        </div>
      </Modal>
    </div>
  );
};

export default SettingManagement;