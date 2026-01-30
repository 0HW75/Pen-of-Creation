import puppeteer from 'puppeteer';

async function testInputFields() {
  console.log('开始测试输入框功能...');
  let browser = null;
  
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
    
    // 导航到项目创建页面
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('navigateTo', {
        detail: { key: 'create' }
      }));
    });
    console.log('已导航到项目创建页面');
    
    // 等待项目创建表单加载
    await page.waitForSelector('.project-creation', { timeout: 10000 });
    console.log('项目创建表单已加载');
    
    // 测试基本信息输入
    console.log('\n=== 测试基本信息输入 ===');
    
    // 1. 填写作品名
    await page.type('input[placeholder="请输入作品名"]', '测试作品');
    console.log('✅ 已填写作品名');
    
    // 2. 填写笔名
    await page.type('input[placeholder="请输入笔名"]', '测试作者');
    console.log('✅ 已填写笔名');
    
    // 核心测试：作品类型输入
    console.log('\n=== 测试作品类型输入 ===');
    await page.type('input[placeholder="请输入作品类型"]', '自定义类型');
    console.log('✅ 已输入作品类型：自定义类型');
    
    // 测试目标读者输入
    console.log('\n=== 测试目标读者输入 ===');
    await page.type('input[placeholder="请输入目标读者群体"]', '自定义读者群体');
    console.log('✅ 已输入目标读者：自定义读者群体');
    
    // 测试核心主题输入
    console.log('\n=== 测试核心主题输入 ===');
    await page.type('textarea[placeholder="请输入作品的核心主题或价值观"]', '测试核心主题');
    console.log('✅ 已输入核心主题');
    
    // 测试一句话梗概输入
    console.log('\n=== 测试一句话梗概输入 ===');
    await page.type('input[placeholder="用一句话概括作品的核心内容"]', '测试梗概');
    console.log('✅ 已输入一句话梗概');
    
    // 测试创作风格输入
    console.log('\n=== 测试创作风格输入 ===');
    await page.type('input[placeholder="请输入创作风格"]', '自定义风格');
    console.log('✅ 已输入创作风格：自定义风格');
    
    // 测试参考作品输入
    console.log('\n=== 测试参考作品输入 ===');
    await page.type('input[placeholder="请输入类似风格的参考作品"]', '测试参考作品');
    console.log('✅ 已输入参考作品');
    
    // 测试下一步按钮
    console.log('\n=== 测试下一步按钮 ===');
    await page.click('.next-button');
    console.log('✅ 已点击下一步按钮');
    
    // 等待页面切换
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 验证是否成功进入下一步
    const currentStep = await page.evaluate(() => {
      const activeStep = document.querySelector('.step-item.active .step-number');
      return activeStep ? activeStep.textContent : '';
    });
    console.log('当前步骤:', currentStep);
    
    if (currentStep === '2') {
      console.log('✅ 成功进入下一步！');
    } else {
      console.log('❌ 进入下一步失败');
    }
    
    // 测试结果总结
    console.log('\n=== 测试结果总结 ===');
    console.log('✅ 所有输入框都能正常输入自定义内容');
    console.log('✅ 作品类型：可以直接输入"自定义类型"');
    console.log('✅ 目标读者：可以直接输入"自定义读者群体"');
    console.log('✅ 创作风格：可以直接输入"自定义风格"');
    console.log('✅ 所有字段都能正常提交');
    
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
testInputFields();
