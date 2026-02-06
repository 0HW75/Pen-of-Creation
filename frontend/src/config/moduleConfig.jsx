import {
  UserOutlined, EnvironmentOutlined,
  ToolOutlined, TeamOutlined,
  RocketOutlined, LinkOutlined,
  StarOutlined, DatabaseOutlined, ClockCircleOutlined
} from '@ant-design/icons';

// 模块配置，按照文档顺序定义
export const modules = [
  {
    key: 'world',
    label: '世界观设定模块',
    icon: <RocketOutlined />,
    subModules: [
      { key: 'worldSettings', label: '世界基本框架' },
      { key: 'energySystems', label: '能量与规则体系' },
      { key: 'societyCultures', label: '社会与文化体系' },
      { key: 'histories', label: '历史脉络' }
    ]
  },
  {
    key: 'character',
    label: '角色设定模块',
    icon: <UserOutlined />,
    subModules: [
      { key: 'characters', label: '基本信息' },
      { key: 'characterTraits', label: '内在特质' },
      { key: 'characterAbilities', label: '能力与装备' },
      { key: 'characterRelationships', label: '关系与发展' }
    ]
  },
  {
    key: 'faction',
    label: '势力组织模块',
    icon: <TeamOutlined />,
    subModules: [
      { key: 'factions', label: '组织概况' },
      { key: 'factionStructures', label: '组织结构' },
      { key: 'factionGoals', label: '能力与目标' }
    ]
  },
  {
    key: 'location',
    label: '地点场景模块',
    icon: <EnvironmentOutlined />,
    subModules: [
      { key: 'locations', label: '地点档案' },
      { key: 'locationStructures', label: '内部结构' },
      { key: 'specialLocations', label: '特殊地点' }
    ]
  },
  {
    key: 'item',
    label: '物品与资源模块',
    icon: <ToolOutlined />,
    subModules: [
      { key: 'items', label: '通用物品' },
      { key: 'equipmentSystems', label: '装备系统' },
      { key: 'specialItems', label: '特殊物品' }
    ]
  },
  {
    key: 'ability',
    label: '能力体系模块',
    icon: <StarOutlined />,
    subModules: [
      { key: 'abilities', label: '力量体系' },
      { key: 'skills', label: '技能系统' },
      { key: 'talents', label: '天赋与特质' }
    ]
  },
  {
    key: 'creature',
    label: '生物图鉴模块',
    icon: <DatabaseOutlined />,
    subModules: [
      { key: 'races', label: '智慧生物' },
      { key: 'creatures', label: '非智慧生物' },
      { key: 'specialCreatures', label: '特殊存在' }
    ]
  },
  {
    key: 'relationship',
    label: '关系网络模块',
    icon: <LinkOutlined />,
    subModules: [
      { key: 'relationships', label: '实体关系' },
      { key: 'timelines', label: '时间关系' }
    ]
  },
  {
    key: 'data',
    label: '数据关联系统',
    icon: <ClockCircleOutlined />,
    subModules: [
      { key: 'dataAssociations', label: '关联规则' }
    ]
  }
];
