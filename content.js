// content.js - 在iGEM网页上运行的脚本
console.log('iGEM Parts AI助手已加载');

// 浏览器兼容性处理
const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

// 默认配置
const CONFIG = {
  ui: {
    highlightDuration: 5000
  }
};

// 监听来自插件的消息
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    // 获取当前页面内容
    const pageContent = document.body.innerText;
    sendResponse({content: pageContent});
  }
  
  if (request.action === 'highlightParts') {
    try {
      highlightParts(request.partIds);
      sendResponse({success: true});
    } catch (error) {
      console.error('高亮元件失败:', error);
      sendResponse({success: false, error: error.message});
    }
  }
  
  // 确保异步响应正常工作
  return true;
});

// 高亮页面中的生物元件
function highlightParts(partIds) {
  if (!partIds || !partIds.length) return;
  
  // 查找页面中所有可能的元件链接
  const links = Array.from(document.querySelectorAll('a'));
  
  partIds.forEach(partId => {
    // 查找含有该元件ID的链接
    const partLinks = links.filter(link => 
      link.href.includes(partId) || link.textContent.includes(partId)
    );
    
    // 高亮这些链接
    partLinks.forEach(link => {
      // 保存原样式
      link.dataset.originalStyle = link.style.cssText;
      
      // 应用高亮样式
      link.style.backgroundColor = '#ffff99';
      link.style.border = '2px solid #ff9900';
      link.style.padding = '2px 5px';
      link.style.borderRadius = '3px';
      
      // 滚动到第一个匹配项
      if (partLinks.indexOf(link) === 0) {
        link.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });
  });
  
  // 一段时间后恢复原样式
  setTimeout(() => {
    links.forEach(link => {
      if (link.dataset.originalStyle !== undefined) {
        link.style.cssText = link.dataset.originalStyle;
        delete link.dataset.originalStyle;
      }
    });
  }, CONFIG.ui.highlightDuration);
} 