# iGEM Parts AI助手 - 多浏览器安装指南

## 支持的浏览器
- Chrome/Chromium (推荐)
- Firefox
- Microsoft Edge
- 其他基于Chromium的浏览器

## 安装前准备

### 1. 准备图标文件
在`images`文件夹中放置以下图标文件：
- `icon16.png` (16×16像素)
- `icon48.png` (48×48像素)  
- `icon128.png` (128×128像素)

### 2. 选择manifest文件
根据目标浏览器选择合适的manifest文件：
- **Chrome/Edge/Chromium**: 使用 `manifest.json`
- **Firefox**: 使用 `manifest-firefox.json`

## Chrome/Chromium/Edge 安装方法

### 方法1: 开发者模式安装
1. 打开Chrome浏览器
2. 在地址栏输入: `chrome://extensions/`
3. 开启右上角"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹
6. 插件安装完成

### 方法2: 打包安装
1. 在扩展程序页面点击"打包扩展程序"
2. 选择项目根目录
3. 点击"打包扩展程序"
4. 生成`.crx`文件
5. 拖拽`.crx`文件到扩展程序页面安装

## Firefox 安装方法

### 方法1: 临时安装 (开发测试)
1. 打开Firefox浏览器
2. 在地址栏输入: `about:debugging`
3. 点击"此 Firefox"
4. 点击"临时载入附加组件"
5. 选择项目中的`manifest-firefox.json`文件
6. 插件临时安装完成

### 方法2: 正式安装
1. 将`manifest-firefox.json`重命名为`manifest.json`
2. 打包为`.xpi`文件
3. 在Firefox中打开`about:addons`
4. 点击齿轮图标，选择"从文件安装附加组件"
5. 选择`.xpi`文件安装

## 浏览器特定配置

### Chrome/Edge
- 使用Manifest V3
- 支持所有功能
- 推荐使用

### Firefox
- 使用Manifest V2
- 部分API可能有限制
- 需要特殊处理通知功能

## 验证安装

安装完成后，请按以下步骤验证：

1. 打开浏览器扩展程序页面
2. 确认插件已启用
3. 访问 https://parts.igem.org/
4. 点击插件图标
5. 在设置中配置API密钥
6. 测试搜索功能

## 故障排除

### 常见问题

**Q: 插件无法加载**
A: 检查manifest文件是否正确，确保所有必需文件存在

**Q: 图标不显示**
A: 确保images文件夹中有正确尺寸的图标文件

**Q: API调用失败**
A: 检查API密钥是否正确设置，网络连接是否正常

**Q: Firefox中功能异常**
A: Firefox对某些API有限制，建议使用Chrome获得最佳体验

### 调试方法

1. 打开浏览器开发者工具
2. 查看Console标签页的错误信息
3. 检查Network标签页的API调用
4. 在扩展程序页面点击"检查视图"查看后台脚本

## 更新插件

### Chrome/Edge
1. 修改代码后重新加载插件
2. 在扩展程序页面点击刷新按钮

### Firefox
1. 修改代码后重新临时载入
2. 或重新打包`.xpi`文件安装

## 注意事项

- 不同浏览器的API实现可能有差异
- Firefox对某些权限要求更严格
- 建议优先使用Chrome获得最佳兼容性
- 定期检查浏览器更新，确保插件兼容性 