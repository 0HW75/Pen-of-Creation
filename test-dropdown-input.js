const puppeteer = require('puppeteer');

async function testDropdownInput() {
  console.log('开始测试下拉框自由输入功能...');
  
  try {
    // 启动浏览器
    const browser = await puppeteer.launch({
      headless: false, // 设置为false可以看到浏览器操作
      defaultViewport: { width: 1200, height: 800 }
    });
    
    // 打开新页面
    const page = await browser.newPage();
    
    // 导航到应用页面
    await page.goto('http://localhost:5173/');
    console.log('已导航到 http://localhost:5173/');
    
    // 等待页面加载完成
    await page.waitForTimeout(2000);
    
    // 点击"创建项目"按钮（如果有的话）
    try {
      await page.click('button:has-text("创建项目")');
      console.log('点击了创建项目按钮');
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('没有找到创建项目按钮，可能已经在创建页面');
    }
    
    // 等待项目创建表单加载
    await page.waitForSelector('.project-creation', { timeout: 10000 });
    console.log('项目创建表单已加载');
    
    // 填写作品名
    await page.type('input[placeholder="请输入作品名"]', '测试作品');
    console.log('已填写作品名');
    
    // 填写笔名
    await page.type('input[placeholder="请输入笔名"]', '测试作者');
    console.log('已填写笔名');
    
    // 测试作品类型下拉框 - 输入自定义内容
    console.log('开始测试作品类型下拉框...');
    const genreSelector = '.form-group:nth-child(3) .ant-select';
    await page.click(genreSelector);
    await page.waitForSelector('.ant-select-dropdown', { timeout: 5000 });
    
    // 输入自定义作品类型
    await page.type('.ant-select-search__field', '自定义类型');
    console.log('已在作品类型下拉框输入"自定义类型"');
    
    // 按Enter键确认输入
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // 验证输入是否成功
    const genreValue = await page.evaluate((selector) => {
      const input = document.querySelector(`${selector} .ant-select-selection-item`);
      return input ? input.textContent : '';
    }, genreSelector);
    console.log('作品类型下拉框当前值:', genreValue);
    
    // 测试目标读者下拉框 - 输入自定义内容
    console.log('\n开始测试目标读者下拉框...');
    const audienceSelector = '.form-group:nth-child(4) .ant-select';
    await page.click(audienceSelector);
    await page.waitForSelector('.ant-select-dropdown', { timeout: 5000 });
    
    // 输入自定义目标读者
    await page.type('.ant-select-search__field', '自定义读者群体');
    console.log('已在目标读者下拉框输入"自定义读者群体"');
    
    // 按Enter键确认输入
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // 验证输入是否成功
    const audienceValue = await page.evaluate((selector) => {
      const input = document.querySelector(`${selector} .ant-select-selection-item`);
      return input ? input.textContent : '';
    }, audienceSelector);
    console.log('目标读者下拉框当前值:', audienceValue);
    
    // 填写核心主题
    await page.type('textarea[placeholder="请输入作品的核心主题或价值观"]', '测试核心主题');
    console.log('已填写核心主题');
    
    // 填写一句话梗概
    await page.type('input[placeholder="用一句话概括作品的核心内容"]', '测试梗概');
    console.log('已填写一句话梗概');
    
    // 测试创作风格下拉框 - 输入自定义内容
    console.log('\n开始测试创作风格下拉框...');
    const styleSelector = '.form-group:nth-child(7) .ant-select';
    await page.click(styleSelector);
    await page.waitForSelector('.ant-select-dropdown', { timeout: 5000 });
    
    // 输入自定义创作风格
    await page.type('.ant-select-search__field', '自定义风格');
    console.log('已在创作风格下拉框输入"自定义风格"');
    
    // 按Enter键确认输入
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // 验证输入是否成功
    const styleValue = await page.evaluate((selector) => {
      const input = document.querySelector(`${selector} .ant-select-selection-item`);
      return input ? input.textContent : '';
    }, styleSelector);
    console.log('创作风格下拉框当前值:', styleValue);
    
    // 填写参考作品
    await page.type('input[placeholder="请输入类似风格的参考作品"]', '测试参考作品');
    console.log('已填写参考作品');
    
    // 点击下一步按钮
    await page.click('.next-button');
    console.log('已点击下一步按钮');
    await page.waitForTimeout(1000);
    
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
    await page.waitForTimeout(3000);
    
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
