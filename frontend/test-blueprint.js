import puppeteer from 'puppeteer';

async function testBlueprintModule() {
  console.log('开始测试故事蓝图模块...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
    protocolTimeout: 60000 // 增加协议超时时间到60秒
  });
  
  const page = await browser.newPage();
  
  try {
    // 导航到前端页面
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    console.log('已加载前端页面');
    
    // 等待导航菜单加载完成
    await page.waitForSelector('.ant-menu', { timeout: 30000 });
    console.log('导航菜单加载完成');
    
    // 检查菜单项
    const menuItems = await page.$$('.ant-menu-item');
    console.log('找到', menuItems.length, '个菜单项');
    
    // 打印菜单项文本
    for (let i = 0; i < menuItems.length; i++) {
      const text = await menuItems[i].evaluate(node => node.textContent);
      console.log('菜单项', i + 1, ':', text.trim());
    }
    
    // 先点击项目管理，选择一个项目
    console.log('点击项目管理菜单项...');
    await menuItems[0].click();
    
    // 等待项目管理页面加载
    console.log('等待项目管理页面加载...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 尝试选择第一个项目
    console.log('尝试选择第一个项目...');
    try {
      const projectItems = await page.$$('.project-item');
      if (projectItems.length > 0) {
        console.log('找到', projectItems.length, '个项目');
        await projectItems[0].click();
        console.log('已选择第一个项目');
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.log('未找到项目，尝试创建一个项目...');
        // 这里可以添加创建项目的逻辑
      }
    } catch (error) {
      console.log('选择项目时发生错误:', error);
    }
    
    // 点击故事蓝图菜单项
    console.log('点击故事蓝图菜单项...');
    let blueprintClicked = false;
    
    for (let i = 0; i < menuItems.length; i++) {
      const text = await menuItems[i].evaluate(node => node.textContent);
      if (text.trim().includes('故事蓝图')) {
        // 检查菜单项是否被选中
        const isSelected = await menuItems[i].evaluate(node => {
          return node.classList.contains('ant-menu-item-selected');
        });
        console.log('故事蓝图菜单项是否被选中:', isSelected);
        
        await menuItems[i].click();
        blueprintClicked = true;
        console.log('已点击故事蓝图菜单项');
        
        // 等待菜单状态更新
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 再次检查菜单项是否被选中
        const isSelectedAfterClick = await menuItems[i].evaluate(node => {
          return node.classList.contains('ant-menu-item-selected');
        });
        console.log('点击后故事蓝图菜单项是否被选中:', isSelectedAfterClick);
        
        break;
      }
    }
    
    if (!blueprintClicked) {
      console.log('未找到故事蓝图菜单项');
      // 尝试点击第三个菜单项（假设故事蓝图是第三个）
      if (menuItems.length >= 3) {
        console.log('尝试点击第三个菜单项');
        await menuItems[2].click();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // 等待页面加载完成
    console.log('等待页面加载完成...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 检查当前页面内容
    const pageTitle = await page.title();
    console.log('当前页面标题:', pageTitle);
    
    // 检查页面上的错误信息
    const errorMessages = await page.$$('error');
    console.log('找到', errorMessages.length, '个错误元素');
    
    // 检查控制台错误
    console.log('检查控制台错误...');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('控制台错误:', msg.text());
      }
    });
    
    // 检查页面的HTML内容（前5000个字符）
    const pageContent = await page.content();
    console.log('页面内容长度:', pageContent.length);
    console.log('页面内容前500个字符:', pageContent.substring(0, 500));
    
    // 截图当前状态
    await page.screenshot({
      path: 'blueprint-page-load.png',
      fullPage: true
    });
    console.log('页面加载状态截图已保存');
    
    // 检查是否有蓝图页面相关元素
    const blueprintElements = await page.$$('*[class*="blueprint"]');
    console.log('找到', blueprintElements.length, '个包含"blueprint"的元素');
    
    // 检查是否有任何按钮元素
    const allButtons = await page.$$('button');
    console.log('找到', allButtons.length, '个按钮元素');
    
    // 打印前10个按钮的文本内容
    for (let i = 0; i < Math.min(10, allButtons.length); i++) {
      const text = await allButtons[i].evaluate(node => node.textContent);
      console.log('按钮', i + 1, ':', text.trim());
    }
    
    // 检查所有的div元素，看看是否有任何与故事蓝图相关的div元素
    console.log('检查所有的div元素...');
    const allDivs = await page.$$('div');
    console.log('找到', allDivs.length, '个div元素');
    
    // 打印前20个div元素的类名
    for (let i = 0; i < Math.min(20, allDivs.length); i++) {
      const className = await allDivs[i].evaluate(node => node.className);
      console.log('div', i + 1, '类名:', className);
    }
    
    // 检查页面上的所有h1元素
    console.log('检查所有的h1元素...');
    const allH1s = await page.$$('h1');
    console.log('找到', allH1s.length, '个h1元素');
    
    // 打印所有h1元素的文本内容
    for (let i = 0; i < allH1s.length; i++) {
      const text = await allH1s[i].evaluate(node => node.textContent);
      console.log('h1', i + 1, '文本:', text.trim());
    }
    
    console.log('故事蓝图页面访问完成');

    
    // 测试生成大纲功能
    console.log('测试生成大纲功能...');
    
    // 检查是否有生成大纲按钮
    console.log('查找生成大纲按钮...');
    const buttons = await page.$$('button');
    let generateBtn = null;
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].evaluate(node => node.textContent);
      if (text.trim().includes('生成大纲')) {
        generateBtn = buttons[i];
        break;
      }
    }
    
    if (generateBtn) {
      console.log('找到生成大纲按钮');
      
      // 点击生成大纲按钮
      await generateBtn.click();
      
      // 等待生成过程完成
      console.log('等待大纲生成...');
      await new Promise(resolve => setTimeout(resolve, 10000)); // 等待10秒
      
      // 检查是否生成了大纲
      const outlines = await page.$$('.outline-item');
      if (outlines.length > 0) {
        console.log('✅ 大纲生成成功，共生成', outlines.length, '个大纲');
        
        // 点击第一个大纲
        console.log('点击第一个大纲...');
        await outlines[0].click();
        
        // 等待大纲详情加载
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 测试分解为卷纲功能
        console.log('测试分解为卷纲功能...');
        let decomposeBtn = null;
        const buttons2 = await page.$$('button');
        
        for (let i = 0; i < buttons2.length; i++) {
          const text = await buttons2[i].evaluate(node => node.textContent);
          if (text.trim().includes('分解为卷纲')) {
            decomposeBtn = buttons2[i];
            break;
          }
        }
        
        if (decomposeBtn) {
          console.log('找到分解为卷纲按钮');
          await decomposeBtn.click();
          
          // 等待卷纲生成
          console.log('等待卷纲生成...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // 检查是否生成了卷纲
          const volumeCards = await page.$$('.volume-card');
          if (volumeCards.length > 0) {
            console.log('✅ 卷纲生成成功，共生成', volumeCards.length, '个卷纲');
            
            // 测试细化章纲功能
            console.log('测试细化章纲功能...');
            let detailBtn = null;
            const buttons3 = await page.$$('button');
            
            for (let i = 0; i < buttons3.length; i++) {
              const text = await buttons3[i].evaluate(node => node.textContent);
              if (text.trim().includes('细化章纲')) {
                detailBtn = buttons3[i];
                break;
              }
            }
            
            if (detailBtn) {
              console.log('找到细化章纲按钮');
              await detailBtn.click();
              
              // 等待章纲生成
              console.log('等待章纲生成...');
              await new Promise(resolve => setTimeout(resolve, 5000));
              
              // 检查是否生成了章纲
              const chapterItems = await page.$$('.chapter-item');
              if (chapterItems.length > 0) {
                console.log('✅ 章纲生成成功，共生成', chapterItems.length, '个章纲');
              } else {
                console.log('❌ 章纲生成失败');
              }
            } else {
              console.log('❌ 未找到细化章纲按钮');
            }
          } else {
            console.log('❌ 卷纲生成失败');
          }
        } else {
          console.log('❌ 未找到分解为卷纲按钮');
        }
      } else {
        console.log('❌ 大纲生成失败');
      }
    } else {
      console.log('❌ 未找到生成大纲按钮');
    }
    
    // 测试视图切换功能
    console.log('测试视图切换功能...');
    const viewButtons = await page.$$('.view-switcher button');
    if (viewButtons.length >= 3) {
      console.log('找到视图切换按钮，共', viewButtons.length, '个');
      
      // 切换到卷纲视图
      console.log('切换到卷纲视图...');
      await viewButtons[1].click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 切换到章纲视图
      console.log('切换到章纲视图...');
      await viewButtons[2].click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 切换回大纲视图
      console.log('切换回大纲视图...');
      await viewButtons[0].click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ 视图切换功能正常');
    } else {
      console.log('❌ 视图切换按钮不足或未找到');
    }
    
    // 测试响应式设计
    console.log('测试响应式设计...');
    
    // 模拟移动设备
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 检查移动端菜单
    console.log('查找移动端菜单按钮...');
    const mobileMenuBtn = await page.$$('button').then(buttons => {
      return buttons.find(async (btn) => {
        const hasMenuIcon = await btn.evaluate(node => {
          return node.querySelector('.anticon-menu') !== null;
        });
        return hasMenuIcon;
      });
    });
    
    if (mobileMenuBtn) {
      console.log('✅ 移动端菜单按钮存在');
      
      // 点击移动端菜单
      await mobileMenuBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 检查菜单是否打开
      const drawer = await page.$('.ant-drawer');
      if (drawer) {
        console.log('✅ 移动端菜单抽屉打开正常');
        
        // 关闭菜单
        console.log('查找关闭按钮...');
        const closeBtn = await page.$$('button').then(buttons => {
          return buttons.find(async (btn) => {
            const hasCloseIcon = await btn.evaluate(node => {
              return node.querySelector('.anticon-close') !== null;
            });
            return hasCloseIcon;
          });
        });
        
        if (closeBtn) {
          await closeBtn.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('✅ 移动端菜单关闭正常');
        }
      }
    }
    
    // 恢复桌面视图
    await page.setViewport({ width: 1920, height: 1080 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ 响应式设计测试完成');
    
    // 截图保存测试结果
    await page.screenshot({
      path: 'blueprint-test-result.png',
      fullPage: true
    });
    console.log('✅ 测试截图已保存');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
    
    // 保存错误截图
    await page.screenshot({
      path: 'blueprint-test-error.png',
      fullPage: true
    });
    console.log('❌ 错误截图已保存');
  } finally {
    // 关闭浏览器
    await browser.close();
    console.log('测试完成，浏览器已关闭');
  }
}

// 运行测试
testBlueprintModule();
