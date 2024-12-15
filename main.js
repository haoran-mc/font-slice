const path = require('path');

const createFontSlice = require('./');

createFontSlice({
  // 源字体，支持 ttf 和 otf
  fontPath: path.resolve(__dirname, './assets/jinkai.ttf'),
  // 保存到的目录
  outputDir: path.resolve(__dirname, './output'),
  // 转换为的字体格式
  formats: ['woff2'],
  // css font-family 字体名称
  fontFamily: 'Jinkai',
  // css font-weight 字重
  fontWeight: 'normal',
  // css font-style 字体样式，正常、粗体、斜体
  fontStyle: 'normal',
  // css font-display auto, block, swap
  fontDisplay: 'swap',
});
