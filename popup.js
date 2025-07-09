// 浏览器兼容性处理
const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

// DOM元素
document.addEventListener('DOMContentLoaded', () => {
  // 基本UI元素
  const searchButton = document.getElementById('search-button');
  const requirementInput = document.getElementById('requirement');
  const loadingDiv = document.getElementById('loading');
  const resultsDiv = document.getElementById('results');
  const resultsContent = document.getElementById('results-content');
  const statusDiv = document.getElementById('status');
  const apiProviderSelect = document.getElementById('api-provider');
  const apiModelSelect = document.getElementById('api-model');
  const apiKeyInput = document.getElementById('api-key');
  const saveApiKeyButton = document.getElementById('save-api-key');
  const testApiButton = document.getElementById('test-api-button');
  const apiKeyContainer = document.getElementById('api-key-container');
  const apiKeyLabel = document.getElementById('api-key-label');
  const historyContainer = document.getElementById('history-container');
  const historyCount = document.getElementById('history-count');
  const searchTab = document.getElementById('search-tab');
  const settingsTab = document.getElementById('settings-tab');
  const historyTab = document.getElementById('history-tab');
  const searchContent = document.getElementById('search');
  const settingsContent = document.getElementById('settings');
  const historyContent = document.getElementById('history');
  
  // 当前设置
  let currentSettings = {
    provider: CONFIG.api.defaultProvider,
    model: CONFIG.api.defaultModel,
    apiKey: ''
  };
  
  // 当前语言，默认中文
  let currentLang = localStorage.getItem('igem_lang') || 'zh';
  const langSwitch = document.getElementById('lang-switch');
  langSwitch.value = currentLang;
  
  // 初始化设置
  initializeSettings();
  loadHistory();
  
  // 标签页切换功能
  searchTab.addEventListener('click', () => {
    setActiveTab('search');
  });
  
  settingsTab.addEventListener('click', () => {
    setActiveTab('settings');
  });
  
  historyTab.addEventListener('click', () => {
    setActiveTab('history');
  });
  
  function setActiveTab(tabName) {
    // 移除所有活动状态
    [searchTab, settingsTab, historyTab].forEach(tab => tab.classList.remove('active'));
    [searchContent, settingsContent, historyContent].forEach(content => content.style.display = 'none');
    
    // 设置活动标签
    if (tabName === 'search') {
      searchTab.classList.add('active');
      searchContent.style.display = 'block';
    } else if (tabName === 'settings') {
      settingsTab.classList.add('active');
      settingsContent.style.display = 'block';
    } else if (tabName === 'history') {
      historyTab.classList.add('active');
      historyContent.style.display = 'block';
    }
  }
  
  // 提供商变更事件
  apiProviderSelect.addEventListener('change', () => {
    const selectedProvider = apiProviderSelect.value;
    currentSettings.provider = selectedProvider;
    
    // 更新模型下拉列表
    updateModelOptions(selectedProvider);
    
    // 更新API密钥界面
    const providerConfig = CONFIG.api.providers[selectedProvider];
    if (providerConfig.requiresKey) {
      apiKeyContainer.style.display = 'block';
      apiKeyLabel.textContent = `${providerConfig.name} API密钥:`;
      // 加载该提供商的API密钥
      browserAPI.storage.local.get([providerConfig.storageKey], (result) => {
        if (result[providerConfig.storageKey]) {
          apiKeyInput.value = result[providerConfig.storageKey];
        } else {
          apiKeyInput.value = '';
        }
      });
    } else if (providerConfig.defaultApiKey) {
      // deepseek等内置API，自动填充且隐藏输入框
      apiKeyContainer.style.display = 'none';
      apiKeyInput.value = providerConfig.defaultApiKey;
      currentSettings.apiKey = providerConfig.defaultApiKey;
    } else {
      apiKeyContainer.style.display = 'none';
    }
    
    // 保存设置
    saveCurrentSettings();
  });
  
  // 模型变更事件
  apiModelSelect.addEventListener('change', () => {
    currentSettings.model = apiModelSelect.value;
    saveCurrentSettings();
  });
  
  // 保存API密钥
  saveApiKeyButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    const providerConfig = CONFIG.api.providers[currentSettings.provider];
    
    if (apiKey) {
      browserAPI.storage.local.set({[providerConfig.storageKey]: apiKey}, () => {
        currentSettings.apiKey = apiKey;
        showStatus('API密钥已保存', 'green');
        
        // 自动测试API连接
        testAPIConnection();
      });
    } else {
      showStatus(CONFIG.errors.noApiKey, 'red');
    }
  });
  
  // 测试API连接按钮
  testApiButton.addEventListener('click', () => {
    testAPIConnection();
  });
  
  // 测试API连接
  async function testAPIConnection() {
    const provider = currentSettings.provider;
    const providerConfig = CONFIG.api.providers[provider];
    
    if (!providerConfig.requiresKey) {
      showStatus('本地API无需测试', 'green');
      return;
    }
    
    showStatus('正在测试API连接...', 'blue');
    
    try {
      let testResult = false;
      
      if (provider === 'openai' || provider === 'deepseek') {
        // 测试标准API
        const response = await fetch(`${providerConfig.endpoint.replace('/chat/completions', '/models')}`, {
          headers: {
            'Authorization': `Bearer ${currentSettings.apiKey}`
          }
        });
        testResult = response.ok;
      } else if (provider === 'huggingface') {
        // 测试Hugging Face API
        const response = await fetch('https://huggingface.co/api/whoami', {
          headers: {
            'Authorization': `Bearer ${currentSettings.apiKey}`
          }
        });
        testResult = response.ok;
      }
      
      if (testResult) {
        showStatus('API连接测试成功！', 'green');
      } else {
        showStatus('API连接测试失败，请检查密钥', 'red');
      }
    } catch (error) {
      console.error('API测试失败:', error);
      showStatus('API连接测试失败: ' + error.message, 'red');
    }
  }
  
  // 初始化设置
  function initializeSettings() {
    // 加载保存的设置
    browserAPI.storage.local.get(['ai_settings'], (result) => {
      if (result.ai_settings) {
        currentSettings = result.ai_settings;
      }
      
      // 填充提供商选项
      for (const [providerId, provider] of Object.entries(CONFIG.api.providers)) {
        const option = document.createElement('option');
        option.value = providerId;
        option.textContent = provider.name;
        apiProviderSelect.appendChild(option);
      }
      
      // 设置当前选中的提供商
      apiProviderSelect.value = currentSettings.provider || CONFIG.api.defaultProvider;
      
      // 更新模型选项
      updateModelOptions(currentSettings.provider);
      
      // 自动填充体验key
      const providerConfig = CONFIG.api.providers[currentSettings.provider];
      if (providerConfig && providerConfig.defaultApiKey) {
        apiKeyInput.value = providerConfig.defaultApiKey;
        currentSettings.apiKey = providerConfig.defaultApiKey;
      }
      saveCurrentSettings();
    });
  }
  
  // 更新模型选项
  function updateModelOptions(providerId) {
    // 清除现有选项
    apiModelSelect.innerHTML = '';
    
    // 添加新选项
    const models = CONFIG.api.providers[providerId].models;
    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      apiModelSelect.appendChild(option);
    });
    
    // 设置当前模型
    if (currentSettings.model && models.includes(currentSettings.model)) {
      apiModelSelect.value = currentSettings.model;
    } else {
      apiModelSelect.value = models[0];
      currentSettings.model = models[0];
    }
  }
  
  // 保存当前设置
  function saveCurrentSettings() {
    browserAPI.storage.local.set({ai_settings: currentSettings}, () => {
      console.log('设置已保存:', currentSettings);
    });
  }
  
  // 切换语言事件
  langSwitch.addEventListener('change', () => {
    currentLang = langSwitch.value;
    localStorage.setItem('igem_lang', currentLang);
    updateUILanguage();
  });
  
  // 动态更新界面语言
  function updateUILanguage() {
    const L = CONFIG.lang[currentLang];
    requirementInput.placeholder = L.searchPlaceholder;
    searchButton.textContent = L.searchBtn;
    document.querySelector('.quick-templates label').textContent = L.quickTemplates;
    // 快速模板
    const btns = document.querySelectorAll('.template-btn');
    L.templates.forEach((tpl, i) => {
      if (btns[i]) {
        btns[i].textContent = tpl.label;
        btns[i].setAttribute('data-template', tpl.value);
      }
    });
    // 设置页标题等可继续扩展
  }
  
  // 初始化时切换界面语言
  updateUILanguage();
  
  // 修改搜索按钮事件，传递当前语言
  searchButton.addEventListener('click', async () => {
    const requirement = requirementInput.value.trim();
    if (!requirement) {
      showStatus(CONFIG.lang[currentLang].error, 'red');
      return;
    }
    // 获取当前提供商和模型
    const provider = currentSettings.provider;
    const model = currentSettings.model;
    const providerConfig = CONFIG.api.providers[provider];
    
    // 如果需要API密钥但未设置
    if (providerConfig.requiresKey) {
      if (!currentSettings.apiKey) {
        // 尝试从存储获取
        const result = await browserAPI.storage.local.get([providerConfig.storageKey]);
        if (!result[providerConfig.storageKey]) {
          showStatus(CONFIG.errors.noApiKey, 'red');
          setActiveTab('settings');
          return;
        }
        currentSettings.apiKey = result[providerConfig.storageKey];
      }
    }
    
    // 开始搜索
    searchButton.disabled = true;
    loadingDiv.style.display = 'block';
    resultsDiv.style.display = 'none';
    
    try {
      // 查询当前页面内容
      let pageContent = '未能获取页面内容';
      
      try {
        const [tab] = await browserAPI.tabs.query({active: true, currentWindow: true});
        const results = await browserAPI.scripting.executeScript({
          target: {tabId: tab.id},
          function: () => document.body.innerText
        });
        pageContent = results[0].result;
      } catch (error) {
        console.error(CONFIG.errors.pageContentFailed, error);
      }
      
      // 调用AI API（普通调用）
      const response = await fetchAIRecommendations(requirement, pageContent, currentLang);
      
      // 显示结果
      displayResults(response);
      
      // 保存到历史记录
      addToHistory(requirement, response);
      
      // 向内容脚本发送高亮命令
      if (response && response.parts && response.parts.length > 0) {
        const partIds = response.parts.map(part => part.id);
        try {
          const [tab] = await browserAPI.tabs.query({active: true, currentWindow: true});
          browserAPI.tabs.sendMessage(tab.id, {
            action: 'highlightParts',
            partIds: partIds
          });
        } catch (error) {
          console.error('高亮元件失败:', error);
        }
      }
      
      searchButton.disabled = false;
      loadingDiv.style.display = 'none';
      resultsDiv.style.display = 'block';
      
      // 显示成功信息
      showStatus(`✅ 成功找到 ${response.parts.length} 个推荐元件`, 'green');
      
    } catch (error) {
      console.error('搜索过程中出错:', error);
      
      // 根据错误类型提供友好的错误信息
      let errorMessage = '搜索失败，请重试';
      if (error.message.includes('API密钥')) {
        errorMessage = '🔑 API密钥无效，请检查设置';
      } else if (error.message.includes('网络')) {
        errorMessage = '🌐 网络连接失败，请检查网络';
      } else if (error.message.includes('超限')) {
        errorMessage = '⏰ API调用次数超限，请稍后重试';
      } else if (error.message.includes('格式')) {
        errorMessage = '📝 AI响应格式错误，请重试';
      }
      
      showStatus(errorMessage, 'red');
      searchButton.disabled = false;
      loadingDiv.style.display = 'none';
    }
  });
  
  // 修改fetchAIRecommendations，传递lang
  async function fetchAIRecommendations(requirement, pageContent, lang) {
    const provider = currentSettings.provider;
    const model = currentSettings.model;
    const providerConfig = CONFIG.api.providers[provider];
    const prompt = CONFIG.prompts.recommendParts(requirement, pageContent, lang);
    
    // 根据提供商类型使用不同的API调用方法
    if (provider === 'openai' || provider === 'deepseek') {
      return await callStandardAPI(prompt, providerConfig, model);
    } else if (provider === 'huggingface') {
      return await callHuggingFaceAPI(prompt, providerConfig, model);
    } else if (provider === 'ollama') {
      return await callOllamaAPI(prompt, providerConfig, model);
    } else {
      throw new Error(`未支持的API提供商: ${provider}`);
    }
  }
  
  // 标准API调用（适用于OpenAI和DeepSeek）
  async function callStandardAPI(prompt, providerConfig, model) {
    try {
      const response = await fetch(providerConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSettings.apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{role: 'user', content: prompt}],
          max_tokens: CONFIG.api.maxTokens,
          temperature: CONFIG.api.temperature
        })
      });
      
      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API响应错误:', response.status, errorText);
        
        // 尝试解析错误信息
        let errorMessage = `API调用失败 (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch (e) {
          // 如果不是JSON格式，直接使用错误文本
          if (errorText.includes('Unauthorized') || errorText.includes('Authentication')) {
            errorMessage = 'API密钥无效，请检查密钥是否正确';
          } else if (errorText.includes('rate limit') || errorText.includes('quota')) {
            errorMessage = 'API调用次数超限，请稍后重试';
          } else {
            errorMessage = `API错误: ${errorText.substring(0, 100)}`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // 检查响应格式
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('API响应格式错误:', data);
        throw new Error('API响应格式不正确');
      }
      
      const content = data.choices[0].message.content;
      
      // 尝试解析AI响应内容
      return parseAIResponse(content);
      
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('网络连接失败，请检查网络连接');
      }
      throw error;
    }
  }
  
  // Hugging Face API调用
  async function callHuggingFaceAPI(prompt, providerConfig, model) {
    try {
      const response = await fetch(`${providerConfig.endpoint}${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSettings.apiKey}`
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: CONFIG.api.maxTokens,
            temperature: CONFIG.api.temperature,
            return_full_text: false
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Hugging Face API错误:', response.status, errorText);
        
        let errorMessage = `Hugging Face API调用失败 (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          if (errorText.includes('Unauthorized')) {
            errorMessage = 'Hugging Face API密钥无效';
          } else if (errorText.includes('rate limit')) {
            errorMessage = 'API调用次数超限';
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      try {
        // Hugging Face返回格式可能不同，尝试解析
        const content = Array.isArray(data) ? data[0].generated_text : data.generated_text;
        
        if (!content) {
          throw new Error('Hugging Face API返回内容为空');
        }
        
        // 尝试解析AI响应内容
        return parseAIResponse(content);
      } catch (e) {
        console.error('解析Hugging Face响应失败:', data);
        throw new Error('解析AI响应失败');
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('网络连接失败，请检查网络连接');
      }
      throw error;
    }
  }
  
  // Ollama API调用（本地）
  async function callOllamaAPI(prompt, providerConfig, model) {
    try {
      const response = await fetch(providerConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [{role: 'user', content: prompt}],
          options: {
            temperature: CONFIG.api.temperature
          }
        })
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(CONFIG.errors.localApiUnavailable);
        }
        
        const errorText = await response.text();
        console.error('Ollama API错误:', response.status, errorText);
        
        let errorMessage = 'Ollama API调用失败';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Ollama错误: ${errorText.substring(0, 100)}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      try {
        const content = data.message?.content;
        
        if (!content) {
          throw new Error('Ollama返回内容为空');
        }
        
        // 尝试解析AI响应内容
        return parseAIResponse(content);
      } catch (e) {
        console.error('解析Ollama响应失败:', data);
        throw new Error('解析AI响应失败');
      }
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(CONFIG.errors.localApiUnavailable);
      }
      throw error;
    }
  }
  
  // 解析AI响应内容的通用函数
  function parseAIResponse(content) {
    console.log('AI原始响应:', content);
    
    // 方法1: 尝试直接解析JSON
    try {
      const parsed = JSON.parse(content);
      if (parsed.parts && Array.isArray(parsed.parts)) {
        return parsed;
      }
    } catch (e) {
      console.log('直接JSON解析失败，尝试其他方法');
    }
    
    // 方法2: 查找JSON块
    const jsonMatches = content.match(/\{[\s\S]*\}/g);
    if (jsonMatches) {
      for (const match of jsonMatches) {
        try {
          const parsed = JSON.parse(match);
          if (parsed.parts && Array.isArray(parsed.parts)) {
            console.log('找到有效的JSON块:', parsed);
            return parsed;
          }
        } catch (e) {
          console.log('JSON块解析失败:', match);
        }
      }
    }
    
    // 方法3: 尝试从文本中提取结构化信息
    try {
      const extractedData = extractPartsFromText(content);
      if (extractedData && extractedData.parts && extractedData.parts.length > 0) {
        console.log('从文本中提取到数据:', extractedData);
        return extractedData;
      }
    } catch (e) {
      console.log('文本提取失败:', e);
    }
    
    // 方法4: 返回默认响应
    console.log('无法解析AI响应，返回默认响应');
    return {
      parts: [
        {
          name: "无法解析AI响应",
          id: "ERROR",
          description: "AI返回的内容格式无法识别",
          reason: "请检查API设置或重试",
          usage: "建议重新输入需求或更换AI提供商"
        }
      ]
    };
  }
  
  // 从文本中提取元件信息的函数
  function extractPartsFromText(text) {
    const parts = [];
    
    // 查找可能的元件信息模式
    const patterns = [
      // 匹配 "元件名称 (BBa_ID)" 格式
      /([^(]+)\s*\(([^)]+)\)/g,
      // 匹配 "BBa_XXXXXX" 格式
      /(BBa_[A-Z0-9]+)/g,
      // 匹配包含"元件"、"启动子"、"基因"等关键词的行
      /([^。\n]*[元件启动子基因蛋白][^。\n]*)/g
    ];
    
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          if (match.length > 5) { // 过滤太短的匹配
            parts.push({
              name: match.trim(),
              id: match.includes('BBa_') ? match : 'EXTRACTED',
              description: `从AI响应中提取: ${match}`,
              reason: "AI返回的内容格式不标准，已尝试提取有用信息",
              usage: "请验证提取的信息是否正确"
            });
          }
        }
      }
    }
    
    // 如果找到了元件信息，返回结构化数据
    if (parts.length > 0) {
      return { parts: parts.slice(0, 5) }; // 最多返回5个
    }
    
    return null;
  }
  
  // 显示结果
  function displayResults(response) {
    const L = CONFIG.lang[currentLang];
    resultsContent.innerHTML = '';
    if (!response || !response.parts || !response.parts.length) {
      resultsContent.innerHTML = `<p style="text-align: center; color: #7f8c8d; padding: 20px;">${L.notFound}</p>`;
      return;
    }
    // 显示结果标题
    const titleElement = document.createElement('h3');
    titleElement.textContent = L.resultTitle(response.parts.length);
    titleElement.style.cssText = 'color: #2c3e50; margin-bottom: 15px; text-align: center; font-size: 14px;';
    resultsContent.appendChild(titleElement);
    // 显示每个元件
    response.parts.forEach((part, index) => {
      const partElement = document.createElement('div');
      partElement.className = 'part-item';
      partElement.innerHTML = `
        <div class="part-name">${part.name}</div>
        <div class="part-id">${part.id}</div>
        <div class="part-desc">${part.description}</div>
        <div class="part-reason">${L.resultReason} ${part.reason}</div>
        <div class="part-usage">${L.resultUsage} ${part.usage}</div>
      `;
      partElement.style.cursor = 'pointer';
      partElement.addEventListener('click', () => {
        const url = `${CONFIG.igem.partUrlPrefix}${part.id}`;
        browserAPI.tabs.create({url: url});
      });
      partElement.addEventListener('mouseenter', () => {
        partElement.style.backgroundColor = '#e8f4fd';
      });
      partElement.addEventListener('mouseleave', () => {
        partElement.style.backgroundColor = '#f8f9fa';
      });
      resultsContent.appendChild(partElement);
    });
  }
  
  // 添加历史记录
  function addToHistory(question, response) {
    const historyItem = {
      question: question,
      response: response, // 保存完整的响应信息
      timestamp: Date.now(),
      partsCount: response && response.parts ? response.parts.length : 0
    };
    
    // 获取现有历史记录
    browserAPI.storage.local.get(['search_history'], (result) => {
      let history = result.search_history || [];
      
      // 添加新记录到开头
      history.unshift(historyItem);
      
      // 限制历史记录数量为100条
      if (history.length > CONFIG.ui.maxHistoryItems) {
        history = history.slice(0, CONFIG.ui.maxHistoryItems);
      }
      
      // 保存历史记录
      browserAPI.storage.local.set({search_history: history}, () => {
        updateHistoryDisplay();
      });
    });
  }
  
  // 加载历史记录
  function loadHistory() {
    browserAPI.storage.local.get(['search_history'], (result) => {
      if (result.search_history && result.search_history.length > 0) {
        updateHistoryDisplay();
      }
    });
  }
  
  // 更新历史记录显示
  function updateHistoryDisplay() {
    const L = CONFIG.lang[currentLang];
    browserAPI.storage.local.get(['search_history'], (result) => {
      const history = result.search_history || [];
      if (history.length === 0) {
        historyContainer.innerHTML = `<p style='text-align: center; color: #7f8c8d;'>${L.notFound}</p>`;
        historyCount.textContent = '';
        return;
      }
      historyContainer.innerHTML = '';
      history.forEach((item, index) => {
        const historyElement = document.createElement('div');
        historyElement.className = 'history-item';
        let historyContent = `
          <div class="history-question">${item.question}</div>
          <div class="history-answer">
            <strong>${L.historyFound(item.partsCount)}</strong>
        `;
        if (item.response && item.response.parts && item.response.parts.length > 0) {
          historyContent += '<div class="history-parts">';
          item.response.parts.forEach(part => {
            historyContent += `
              <div class="history-part-item">
                <div class="history-part-name">${part.name} (${part.id})</div>
                <div class="history-part-desc">${part.description}</div>
                <div style="font-size: 9px; color: #27ae60; margin-top: 2px;">${L.resultReason} ${part.reason}</div>
              </div>
            `;
          });
          historyContent += '</div>';
        } else {
          historyContent += `<em>${L.notFound}</em>`;
        }
        historyContent += `
          </div>
          <div class="history-count">${L.historyTime(new Date(item.timestamp).toLocaleString())}</div>
        `;
        historyElement.innerHTML = historyContent;
        historyElement.addEventListener('click', () => {
          requirementInput.value = item.question;
          if (item.response) {
            displayResults(item.response);
            if (item.response.parts && item.response.parts.length > 0) {
              const partIds = item.response.parts.map(part => part.id);
              browserAPI.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (tabs[0]) {
                  browserAPI.tabs.sendMessage(tabs[0].id, {
                    action: 'highlightParts',
                    partIds: partIds
                  }).catch(error => {
                    console.error('高亮元件失败:', error);
                  });
                }
              });
            }
            setActiveTab('search');
            showStatus(`${L.historyFound(item.partsCount)}`, 'green');
          }
        });
        historyContainer.appendChild(historyElement);
      });
      historyCount.textContent = `共 ${history.length} 条记录`;
    });
  }
  
  // 显示状态信息
  function showStatus(message, color) {
    statusDiv.textContent = message;
    statusDiv.style.color = color;
    statusDiv.style.backgroundColor = color === 'red' ? '#ffebee' : 
                                   color === 'green' ? '#e8f5e8' : 
                                   color === 'blue' ? '#e3f2fd' : '#fff3e0';
    statusDiv.style.border = `1px solid ${color === 'red' ? '#f44336' : 
                                        color === 'green' ? '#4caf50' : 
                                        color === 'blue' ? '#2196f3' : '#ff9800'}`;
    
    // 3秒后自动清除状态
    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.style.backgroundColor = '';
      statusDiv.style.border = '';
    }, 3000);
  }
  
  // 弹窗持久化功能
  function setupPopupPersistence() {
    // 监听标签页更新事件
    browserAPI.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url && tab.url.includes('parts.igem.org')) {
        // 页面加载完成后，保持弹窗打开状态
        console.log('iGEM页面已加载，保持弹窗状态');
      }
    });
    
    // 监听标签页激活事件
    browserAPI.tabs.onActivated.addListener((activeInfo) => {
      browserAPI.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url && tab.url.includes('parts.igem.org')) {
          // 切换到iGEM页面时，保持弹窗状态
          console.log('切换到iGEM页面，保持弹窗状态');
        }
      });
    });
    
    // 监听窗口焦点变化
    browserAPI.windows.onFocusChanged.addListener((windowId) => {
      if (windowId !== browserAPI.windows.WINDOW_ID_NONE) {
        // 窗口获得焦点时，保持弹窗状态
        console.log('窗口获得焦点，保持弹窗状态');
      }
    });
  }
  
  // 初始化弹窗持久化
  setupPopupPersistence();
  
  // 快速模板功能
  const templateButtons = document.querySelectorAll('.template-btn');
  templateButtons.forEach(button => {
    button.addEventListener('click', () => {
      const template = button.getAttribute('data-template');
      requirementInput.value = template;
      requirementInput.focus();
      showStatus('已填入模板，请点击搜索按钮', 'blue');
    });
  });
  
  // 回车键快速搜索
  requirementInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      searchButton.click();
    }
  });
}); 