// background.js - 插件的后台服务脚本

// 浏览器兼容性处理
const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

// 插件安装或更新时执行
browserAPI.runtime.onInstalled.addListener(details => {
  console.log('iGEM Parts AI助手已安装/更新:', details.reason);
  
  // 初次安装时显示欢迎信息
  if (details.reason === 'install') {
    // 创建欢迎通知
    if (typeof browserAPI.notifications !== 'undefined') {
      browserAPI.notifications.create('welcome', {
        type: 'basic',
        iconUrl: 'images/icon128.png',
        title: '欢迎使用iGEM Parts AI助手',
        message: '请先在插件设置中添加您的API密钥以开始使用',
        priority: 2
      });
    } else {
      console.log('欢迎使用iGEM Parts AI助手！请先在插件设置中添加您的API密钥以开始使用');
    }
  }
});

// 与内容脚本通信的消息处理
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchPartsData') {
    fetchPartsData(request.query)
      .then(data => sendResponse({success: true, data}))
      .catch(error => sendResponse({success: false, error: error.message}));
    
    // 确保异步响应正常工作
    return true;
  }
});

// 当标签页更新时，向内容脚本发送消息
browserAPI.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('parts.igem.org')) {
    // 页面加载完成，可以发送消息给内容脚本
    console.log('iGEM页面已加载，准备与内容脚本通信');
  }
});

// 侧边栏功能
let sidePanelWindowId = null;

// 监听插件图标点击事件
browserAPI.action.onClicked.addListener(async (tab) => {
  // 检查是否在iGEM页面
  if (tab.url && tab.url.includes('parts.igem.org')) {
    // 如果侧边栏已经打开，则聚焦到侧边栏
    if (sidePanelWindowId) {
      try {
        await browserAPI.windows.update(sidePanelWindowId, {focused: true});
        return;
      } catch (error) {
        // 侧边栏可能已关闭，重置ID
        sidePanelWindowId = null;
      }
    }
    
    // 创建新的侧边栏
    try {
      const sidePanel = await browserAPI.windows.create({
        url: browserAPI.runtime.getURL('popup.html'),
        type: 'popup',
        width: 400,
        height: 600,
        left: tab.width - 420,
        top: 50
      });
      
      sidePanelWindowId = sidePanel.id;
      
      // 监听侧边栏关闭事件
      browserAPI.windows.onRemoved.addListener((windowId) => {
        if (windowId === sidePanelWindowId) {
          sidePanelWindowId = null;
        }
      });
    } catch (error) {
      console.error('创建侧边栏失败:', error);
    }
  } else {
    // 不在iGEM页面时，显示提示
    if (typeof browserAPI.notifications !== 'undefined') {
      browserAPI.notifications.create('not-igem', {
        type: 'basic',
        iconUrl: 'images/icon128.png',
        title: 'iGEM Parts AI助手',
        message: '请在iGEM Parts Registry页面使用此插件',
        priority: 1
      });
    }
  }
});

// 监听标签页激活事件，保持侧边栏状态
browserAPI.tabs.onActivated.addListener(async (activeInfo) => {
  if (sidePanelWindowId) {
    try {
      const tab = await browserAPI.tabs.get(activeInfo.tabId);
      if (tab.url && tab.url.includes('parts.igem.org')) {
        // 确保侧边栏保持打开状态
        await browserAPI.windows.update(sidePanelWindowId, {focused: false});
      }
    } catch (error) {
      // 侧边栏可能已关闭
      sidePanelWindowId = null;
    }
  }
});

// 监听页面跳转，保持侧边栏状态
browserAPI.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('parts.igem.org')) {
    // 页面加载完成后，确保侧边栏保持打开
    if (sidePanelWindowId) {
      console.log('iGEM页面已加载，保持侧边栏状态');
    }
  }
});

// 从iGEM API获取元件数据
async function fetchPartsData(query) {
  // iGEM API在未来可能会变化，这里使用模拟数据
  // 实际应用中，应替换为真实的API调用
  
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 返回模拟数据
  return {
    parts: [
      {
        id: 'BBa_E0040',
        name: 'GFP',
        description: '绿色荧光蛋白基因',
        category: 'Reporter',
        sequence: 'ATGCGTAAAGGAGAAGAACT...'
      },
      {
        id: 'BBa_J23100',
        name: 'J23100',
        description: '构成型启动子',
        category: 'Promoter',
        sequence: 'TTGACGGCTAGCTCAGTCCTA...'
      }
      // 实际应用中会返回更多根据查询相关的结果
    ]
  };
} 