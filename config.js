// config.js - 插件统一配置文件

const CONFIG = {
  // API相关设置
  api: {
    providers: {
      openai: {
        name: "OpenAI (ChatGPT)",
        endpoint: "https://api.openai.com/v1/chat/completions",
        models: ["gpt-3.5-turbo", "gpt-4"],
        storageKey: "sk-RrXTeCk8sbbCnkuHV96GWqd7NO3kTezgqAoiQeAlbCETFkUj",
        requiresKey: true
      },
      deepseek: {
        name: "DeepSeek (正式版)",
        endpoint: "https://api.deepseek.com/v1/chat/completions",
        models: ["deepseek-chat", "deepseek-coder"],
        storageKey: "deepseek_api_key",
        requiresKey: true,
        doc: "https://platform.deepseek.com/docs"
      },
      deepseek_trial: {
        name: "DeepSeek (免费体验50次)",
        endpoint: "https://api.deepseek.com/v1/chat/completions",
        models: ["deepseek-chat", "deepseek-coder"],
        storageKey: "deepseek_trial_api_key",
        requiresKey: false,
        defaultApiKey: "sk-26ff7f52cf1344859a010095286c17ba", // 免费体验50次，超出需自填
        doc: "https://platform.deepseek.com/docs",
        realProvider: "deepseek"
      },
      huggingface: {
        name: "Hugging Face (免费版)",
        endpoint: "https://api-inference.huggingface.co/models/",
        models: ["mistralai/Mixtral-8x7B-Instruct-v0.1", "google/gemma-7b"],
        storageKey: "hf_api_key",
        requiresKey: true
      },
      ollama: {
        name: "Ollama (本地模型)",
        endpoint: "http://localhost:11434/api/chat",
        models: ["llama2", "mistral", "gemma"],
        requiresKey: false,
        isLocal: true
      },
      sparkdesk: {
        name: "讯飞星火 (SparkDesk)",
        endpoint: "wss://spark-api.xf-yun.com/v3.1/chat", // 3.1为通用较新版本
        models: ["generalv3", "generalv3.5", "max-32k", "pro-128k", "lite"],
        storageKey: "spark_api_key",
        requiresKey: true,
        doc: "https://www.xfyun.cn/doc/spark/Web.html"
      },
      doubao: {
        name: "豆包 (Doubao)",
        endpoint: "https://chat-api.bytedance.com/api/v2/chat/completions", // 官方API
        models: ["doubao-1.5", "doubao-1.6", "doubao-flash", "doubao-vision"],
        storageKey: "doubao_api_key",
        requiresKey: true, // 默认内置API可用
        defaultApiKey: "db-sk-2e7e2b1e-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // 示例内置key，实际请替换为官方公开体验key
        doc: "https://www.volcengine.com/docs/82379/1093066"
      }
    },
    defaultProvider: "deepseek",
    defaultModel: "deepseek-chat",
    maxTokens: 1000,
    temperature: 0.5
  },
  
  // 插件UI相关设置
  ui: {
    popupWidth: 350,
    popupHeight: 600,
    loadingTimeout: 30000, // 30秒超时
    statusMessageDuration: 3000, // 状态消息显示时间
    highlightDuration: 5000, // 高亮持续时间
    maxHistoryItems: 100, // 最大历史记录数量

  },
  
  // iGEM相关设置
  igem: {
    baseUrl: "https://parts.igem.org/",
    partUrlPrefix: "https://parts.igem.org/Part:",
    maxPageContentLength: 3000 // 分析页面内容的最大长度
  },
  
  // 多语言界面文案
  lang: {
    zh: {
      searchPlaceholder: "请输入您的需求，例如：'我需要一个可以表达荧光蛋白的启动子'",
      searchBtn: "🔍 搜索推荐元件",
      quickTemplates: "快速输入模板:",
      templates: [
        {label: "启动子", value: "我需要一个可以在大肠杆菌中高效表达的启动子"},
        {label: "荧光蛋白", value: "我需要一个绿色荧光蛋白报告基因"},
        {label: "抗性基因", value: "我需要一个抗性基因用于筛选"},
        {label: "终止子", value: "我需要一个终止子"}
      ],
      statusTemplate: "已填入模板，请点击搜索按钮",
      resultTitle: n => `🎯 找到 ${n} 个推荐元件`,
      resultReason: "💡 推荐理由:",
      resultUsage: "📋 使用建议:",
      historyFound: n => `📊 找到 ${n} 个元件`,
      historyTime: t => `⏰ ${t}`,
      notFound: "未找到相关元件推荐",
      success: n => `✅ 成功找到 ${n} 个推荐元件`,
      error: "搜索失败，请重试"
    },
    en: {
      searchPlaceholder: "Enter your requirement, e.g. 'I need a promoter for strong expression in E. coli'",
      searchBtn: "🔍 Search Parts",
      quickTemplates: "Quick Templates:",
      templates: [
        {label: "Promoter", value: "I need a strong promoter for E. coli"},
        {label: "GFP", value: "I need a green fluorescent protein reporter gene"},
        {label: "Resistance", value: "I need an antibiotic resistance gene for selection"},
        {label: "Terminator", value: "I need a terminator"}
      ],
      statusTemplate: "Template filled, click search",
      resultTitle: n => `🎯 Found ${n} recommended parts`,
      resultReason: "💡 Reason:",
      resultUsage: "📋 Usage:",
      historyFound: n => `📊 Found ${n} parts`,
      historyTime: t => `⏰ ${t}`,
      notFound: "No relevant parts found",
      success: n => `✅ Found ${n} recommended parts`,
      error: "Search failed, please try again"
    }
  },
  
  // 多语言提示词
  prompts: {
    recommendParts: (requirement, pageContent, lang) => {
      if (lang === 'en') {
        return `
You are an iGEM synthetic biology expert, good at recommending suitable biological parts.

User requirement: "${requirement}"

Current iGEM Parts Registry page content:
${pageContent.substring(0, CONFIG.igem.maxPageContentLength)}...

Please recommend the 3-7 most suitable parts from the iGEM Parts Registry according to the user's requirement. The results must be highly relevant, accurate, and closely match the user's intent. Avoid generic or irrelevant recommendations.
For each part, provide:
1. Part name and BBa ID
2. Brief description of its function
3. Why it fits the user's requirement (in English, must be specific and precise)
4. Suggestions for using this part (in English, must be practical and targeted)

**Important: Please strictly return in the following JSON format, and do not include any other text:**

{
  "parts": [
    {
      "name": "Part Name",
      "id": "BBa_ID",
      "description": "Brief description",
      "reason": "Reason (English, specific and accurate)",
      "usage": "Usage suggestion (English, practical and targeted)"
    }
  ]
}

Make sure to return valid JSON only, no extra explanation. The reason and usage must be in English, concise, accurate, and highly relevant to the user's requirement.`;
      } else {
        return `
你是一个iGEM合成生物学专家，擅长推荐最贴合用户需求的生物元件。

用户需求: "${requirement}"

当前iGEM Parts Registry页面内容:
${pageContent.substring(0, CONFIG.igem.maxPageContentLength)}...

请根据用户需求，从iGEM Parts Registry中严格筛选3-7个最合适、最相关、最贴切的元件，推荐结果必须与需求高度相关、准确，避免泛泛而谈或无关内容。
对每个元件，请提供：
1. 元件名称和BBa ID
2. 简短描述其功能
3. 为什么它非常贴合用户需求（用中文，必须具体、精准）
4. 针对该需求的使用建议（用中文，必须实用、有针对性）

**重要：请严格按照以下JSON格式返回，不要包含任何其他文本：**

{
  "parts": [
    {
      "name": "元件名称",
      "id": "BBa_ID",
      "description": "简短描述",
      "reason": "推荐理由（中文，具体且准确）",
      "usage": "使用建议（中文，实用且有针对性）"
    }
  ]
}

请确保返回的是有效的JSON格式，不要添加任何解释性文字。
推荐理由和使用建议必须用中文表达，要简洁明了，且与用户需求高度贴合。`;
      }
    }
  },
  
  // 错误消息
  errors: {
    noApiKey: "请先设置API密钥",
    noRequirement: "请输入需求描述",
    apiCallFailed: "调用AI API失败",
    parseResponseFailed: "解析AI响应失败",
    pageContentFailed: "获取页面内容失败",
    localApiUnavailable: "本地API服务不可用，请确认Ollama已启动"
  }
};

// 防止在全局作用域被意外修改
Object.freeze(CONFIG); 