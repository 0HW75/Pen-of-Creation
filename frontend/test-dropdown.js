import puppeteer from 'puppeteer';

async function testDropdownInput() {
  console.log('开始测试下拉框自由输入功能...');
  let browser = null;
  let genreValue = '';
  let audienceValue = '';
  let styleValue = '';
  
  try {
    // 启动浏览器
    browser = await puppeteer.launch({
      headless: false, // 设置为false可以看到浏览器操作
      defaultViewport: { width: 1200, height: 800 }
    });
    
    // 打开新页面
    const page = await browser.newPage();
    
    // 导航到应用页面
    await page.goto('http://localhost:5173/');
    console.log('已导航到 http://localhost:5173/');
    
    // 等待页面加载完成
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 直接使用JavaScript触发导航事件到创建项目页面
    console.log('尝试导航到项目创建页面...');
    await page.evaluate(() => {
      // 模拟点击创建项目菜单的效果
      window.dispatchEvent(new CustomEvent('navigateTo', {
        detail: { key: 'create' }
      }));
    });
    console.log('已触发导航事件');
    
    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 检查页面当前状态
    const currentPath = await page.evaluate(() => {
      return window.location.pathname;
    });
    console.log('当前页面路径:', currentPath);
    
    // 检查页面上的内容
    const pageContent = await page.evaluate(() => {
      return document.body.textContent;
    });
    console.log('页面内容包含"创建项目":', pageContent.includes('创建项目'));
    
    // 尝试找到项目创建表单
    try {
      await page.waitForSelector('.project-creation', { timeout: 10000 });
      console.log('项目创建表单已加载');
    } catch (error) {
      console.log('没有找到项目创建表单，尝试检查其他元素...');
      // 检查页面上的所有主要元素
      const pageElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('div');
        return Array.from(elements).slice(0, 20).map((el, index) => {
          return {
            index: index + 1,
            className: el.className,
            id: el.id,
            text: el.textContent.substring(0, 50) + '...'
          };
        });
      });
      console.log('页面上的主要元素:', pageElements);
      
      // 抛出错误，终止测试
      throw new Error('无法找到项目创建表单');
    }
    
    // 填写作品名
    await page.type('input[placeholder="请输入作品名"]', '测试作品');
    console.log('已填写作品名');
    
    // 填写笔名
    await page.type('input[placeholder="请输入笔名"]', '测试作者');
    console.log('已填写笔名');
    
    // 测试作品类型下拉框 - 输入自定义内容
    console.log('开始测试作品类型下拉框...');
    try {
      // 使用更直接的方法 - 直接点击下拉框并输入内容
      await page.evaluate(() => {
        const formGroups = document.querySelectorAll('.form-group');
        for (let group of formGroups) {
          const label = group.querySelector('label');
          if (label && label.textContent === '作品类型') {
            const select = group.querySelector('.ant-select');
            if (select) {
              // 点击下拉框
              select.click();
              
              // 等待下拉框出现
              setTimeout(() => {
                // 尝试找到输入框
                const dropdown = document.querySelector('.ant-select-dropdown');
                if (dropdown) {
                  const input = dropdown.querySelector('input');
                  if (input) {
                    // 输入自定义内容
                    input.value = '自定义类型';
                    // 触发输入事件
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    // 触发键盘事件
                    input.dispatchEvent(new KeyboardEvent('keydown', {
                      key: 'Enter',
                      bubbles: true
                    }));
                    console.log('已在作品类型下拉框输入"自定义类型"');
                  }
                }
              }, 500);
            }
            break;
          }
        }
      });
      
      // 等待输入完成
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 直接检查表单数据是否被正确设置
      genreValue = await page.evaluate(() => {
        // 尝试获取React组件的状态
        // 注意：这只在开发模式下有效，生产模式下可能会被压缩
        const reactRoot = document.querySelector('#root');
        if (reactRoot) {
          // 尝试从组件实例中获取状态
          // 这是一个 hack，实际项目中不推荐使用
          console.log('尝试获取React组件状态...');
        }
        
        // 作为备用，尝试直接从DOM中获取值
        const formGroups = document.querySelectorAll('.form-group');
        for (let group of formGroups) {
          const label = group.querySelector('label');
          if (label && label.textContent === '作品类型') {
            const select = group.querySelector('.ant-select');
            if (select) {
              // 尝试获取选择项
              const selection = select.querySelector('.ant-select-selection-item');
              if (selection) {
                return selection.textContent;
              }
              // 尝试获取输入框值
              const input = select.querySelector('input');
              if (input) {
                return input.value;
              }
              // 尝试获取整个选择器的文本
              return select.textContent;
            }
          }
        }
        return '';
      });
      
      console.log('作品类型下拉框当前值:', genreValue);
    } catch (error) {
      console.log('测试作品类型下拉框时出错:', error.message);
      // 继续测试其他下拉框
    }
    
    // 等待一下，确保页面状态稳定
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试目标读者下拉框 - 输入自定义内容
    console.log('\n开始测试目标读者下拉框...');
    try {
      // 使用evaluate来点击目标读者下拉框并输入内容
      audienceValue = await page.evaluate(() => {
        const formGroups = document.querySelectorAll('.form-group');
        for (let group of formGroups) {
          const label = group.querySelector('label');
          if (label && label.textContent === '目标读者') {
            const select = group.querySelector('.ant-select');
            if (select) {
              // 点击下拉框
              select.click();
              
              // 等待下拉框出现
              setTimeout(() => {
                // 查找搜索输入框
                const searchInput = document.querySelector('.ant-select-input');
                if (searchInput) {
                  // 输入自定义内容
                  searchInput.value = '自定义读者群体';
                  // 触发输入事件
                  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                  // 按Enter键确认
                  searchInput.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Enter',
                    bubbles: true
                  }));
                }
              }, 500);
            }
            break;
          }
        }
        
        // 等待输入完成
        return new Promise(resolve => {
          setTimeout(() => {
            const formGroups = document.querySelectorAll('.form-group');
            for (let group of formGroups) {
              const label = group.querySelector('label');
              if (label && label.textContent === '目标读者') {
                const select = group.querySelector('.ant-select');
                const input = select.querySelector('.ant-select-selection-item');
                resolve(input ? input.textContent : '');
                break;
              }
            }
            resolve('');
          }, 1500);
        });
      });
      console.log('目标读者下拉框当前值:', audienceValue);
    } catch (error) {
      console.log('测试目标读者下拉框时出错:', error.message);
      // 继续测试其他下拉框
    }
    
    // 等待一下，确保页面状态稳定
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 填写核心主题
    await page.type('textarea[placeholder="请输入作品的核心主题或价值观"]', '测试核心主题');
    console.log('已填写核心主题');
    
    // 填写一句话梗概
    await page.type('input[placeholder="用一句话概括作品的核心内容"]', '测试梗概');
    console.log('已填写一句话梗概');
    
    // 测试创作风格下拉框 - 输入自定义内容
    console.log('\n开始测试创作风格下拉框...');
    try {
      // 使用evaluate来点击创作风格下拉框并输入内容
      styleValue = await page.evaluate(() => {
        const formGroups = document.querySelectorAll('.form-group');
        for (let group of formGroups) {
          const label = group.querySelector('label');
          if (label && label.textContent === '创作风格') {
            const select = group.querySelector('.ant-select');
            if (select) {
              // 点击下拉框
              select.click();
              
              // 等待下拉框出现
              setTimeout(() => {
                // 查找搜索输入框
                const searchInput = document.querySelector('.ant-select-input');
                if (searchInput) {
                  // 输入自定义内容
                  searchInput.value = '自定义风格';
                  // 触发输入事件
                  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                  // 按Enter键确认
                  searchInput.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Enter',
                    bubbles: true
                  }));
                }
              }, 500);
            }
            break;
          }
        }
        
        // 等待输入完成
        return new Promise(resolve => {
          setTimeout(() => {
            const formGroups = document.querySelectorAll('.form-group');
            for (let group of formGroups) {
              const label = group.querySelector('label');
              if (label && label.textContent === '创作风格') {
                const select = group.querySelector('.ant-select');
                const input = select.querySelector('.ant-select-selection-item');
                resolve(input ? input.textContent : '');
                break;
              }
            }
            resolve('');
          }, 1500);
        });
      });
      console.log('创作风格下拉框当前值:', styleValue);
    } catch (error) {
      console.log('测试创作风格下拉框时出错:', error.message);
      // 继续测试其他功能
    }
    
    // 等待一下，确保页面状态稳定
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 填写参考作品
    await page.type('input[placeholder="请输入类似风格的参考作品"]', '测试参考作品');
    console.log('已填写参考作品');
    
    // 点击下一步按钮
    await page.click('.next-button');
    console.log('已点击下一步按钮');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 验证是否成功进入下一步
    const currentStep = await page.evaluate(() => {
      const activeStep = document.querySelector('.step-item.active .step-number');
      return activeStep ? activeStep.textContent : '';
    });
    console.log('当前步骤:', currentStep);
    
    // 测试结果总结
    console.log('\n=== 测试结果总结 ===');
    console.log('作品类型下拉框输入:', genreValue === '自定义类型' ? '成功' : '失败');
    console.log('目标读者下拉框输入:', audienceValue === '自定义读者群体' ? '成功' : '失败');
    console.log('创作风格下拉框输入:', styleValue === '自定义风格' ? '成功' : '失败');
    console.log('是否成功进入下一步:', currentStep === '2' ? '成功' : '失败');
    
    // 等待几秒钟以便观察结果
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 关闭浏览器
    await browser.close();
    console.log('\n测试完成，浏览器已关闭');
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
    // 确保浏览器关闭
    if (browser) {
      await browser.close();
    }
  }
}

// 运行测试
testDropdownInput();
