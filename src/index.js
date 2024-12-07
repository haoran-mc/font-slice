const fs = require('fs');
const path = require('path');
const { Font } = require('fonteditor-core');
const Fontmin = require('fontmin');
const bufferToVinyl = require('buffer-to-vinyl');
const unicodeRanges = require('./google-font-unicode-range.json');
const utils = require('./utils');
const generateCss = require('./template');

const generateFontSubsetName = (fontFileName, index) =>
  `${fontFileName}.${index + 1}`;

async function createFontSlice({
  fontPath,
  outputDir,
  fontFamily,
  formats,
  fontWeight,
  fontStyle,
  fontDisplay,
}) {
  const fontBuffer = fs.readFileSync(fontPath);

  const isOtf = path.extname(fontPath) === '.otf';

  if (!['.otf', '.ttf'].includes(path.extname(fontPath)))
    throw new Error(`support ttf, otf font file only`);

  const font = Font.create(fontBuffer, {
    type: isOtf ? 'otf' : 'ttf',
  });

  // 获取输入字体包含的所有 unicode
  const charMap = font.data.cmap;

  // 自定义字体的分割格式，默认为 google fonts 的 unicode-range
  // 和 unicodeRange 做 filter，只保留输入字体中包含的 unicode
  const filteredRanges = unicodeRanges
    .map(({ unicodes }) => {
      return unicodes.filter((unicode) => unicode in charMap);
    })
    .filter((item) => item.length > 0);

  // 转换后字体文件的名字
  const { name } = path.parse(fontPath);
  const outputFontFamily = utils.formatFontFamily(fontFamily || name);

  const fontSubsetMap = Object.create(null);

  const cssList = await Promise.all(
    filteredRanges.map(async (range, index) => {
      const fileName = generateFontSubsetName(name, index);
      if (fileName in fontSubsetMap)
        throw new Error(`duplicate font subset name "${fileName}"`);

      fontSubsetMap[fileName] = true;

      const fontmin = new Fontmin();
      fontmin.getFiles = () => {
        return bufferToVinyl.stream(fontBuffer, fileName);
      };

      if (isOtf) {
        fontmin.use(Fontmin.otf2ttf());
      }

      fontmin.use(
        Fontmin.glyph({
          text: utils.unicodeToSubset(range),
          hinting: false,
        }),
      );

      formats.map((format) => {
        // 'woff' | 'woff2' | 'ttf' | 'eot' | 'svg'
        if (format === 'woff') {
          fontmin.use(Fontmin.ttf2woff());
          return;
        }
        if (format === 'woff2') {
          fontmin.use(Fontmin.ttf2woff2());
          return;
        }
        if (format === 'eot') {
          fontmin.use(Fontmin.ttf2eot());
          return;
        }
        if (format === 'svg') {
          fontmin.use(Fontmin.ttf2svg());
          return;
        }
      });

      fontmin.dest(outputDir);

      console.log(`fonts being generated: ${fileName}`);

      await new Promise((resolve, reject) => {
        fontmin.run(function (err, files) {
          if (err) {
            reject(err);
          }
          console.log(`write font ${fileName} successfully`);
          resolve();
        });
      });

      // 如果不包含 ttf 把生成的 ttf 删除
      if (!formats.includes('ttf')) {
        const ttfPath = path.resolve(outputDir, `${fileName}.ttf`);
        if (fs.existsSync(ttfPath)) {
          fs.rmSync(ttfPath);
        }
      }

      return generateCss({
        name: fileName,
        fontFamily: outputFontFamily,
        fontWeight,
        fontStyle,
        fontDisplay,
        formats,
        unicodeRange: utils.createUnicodeRange(range),
      });
    }),
  );
  fs.writeFileSync(
    path.resolve(outputDir, 'font.css'),
    `${cssList.join('\n')}`,
  );
  console.log(`font ${outputFontFamily} file has been generated successfully.`);
}

module.exports = createFontSlice;
