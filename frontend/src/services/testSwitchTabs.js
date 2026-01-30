// 测试脚本：模拟快速切换标签页的行为
import { characterApi, locationApi, itemApi, factionApi } from './api.js';

// 模拟项目ID
const projectId = 1;

// 模拟快速切换标签页的函数
const simulateTabSwitching = async (iterations = 10, delay = 100) => {
  console.log(`开始模拟快速切换标签页，共 ${iterations} 次，每次延迟 ${delay}ms`);
  
  const tabs = ['characters', 'locations', 'items', 'factions'];
  let currentTabIndex = 0;
  
  for (let i = 0; i < iterations; i++) {
    const currentTab = tabs[currentTabIndex];
    console.log(`第 ${i + 1} 次切换到标签页: ${currentTab}`);
    
    try {
      let response;
      switch (currentTab) {
        case 'characters':
          response = await characterApi.getCharacters(projectId);
          console.log(`获取角色数据成功，共 ${response.data.length} 条`);
          break;
        case 'locations':
          response = await locationApi.getLocations(projectId);
          console.log(`获取地点数据成功，共 ${response.data.length} 条`);
          break;
        case 'items':
          response = await itemApi.getItems(projectId);
          console.log(`获取物品数据成功，共 ${response.data.length} 条`);
          break;
        case 'factions':
          response = await factionApi.getFactions(projectId);
          console.log(`获取势力数据成功，共 ${response.data.length} 条`);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`切换到 ${currentTab} 标签页时出错:`, error);
    }
    
    // 切换到下一个标签页
    currentTabIndex = (currentTabIndex + 1) % tabs.length;
    
    // 等待指定的延迟
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  console.log('标签页切换模拟完成');
};

// 运行测试
simulateTabSwitching(20, 50);
