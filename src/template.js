const formatMap = {
  ttf: 'truetype',
  otf: 'opentype',
  svg: 'svg',
  eot: 'embedded-opentype',
  woff: 'woff',
  woff2: 'woff2',
};

function generateCss({
  name,
  fontFamily,
  fontWeight,
  fontStyle,
  fontDisplay,
  formats,
  unicodeRange,
}) {
  const src = formats
    .map((format) => {
      const type = formatMap[format];
      if (!type) {
        console.warn('不支持的格式' + format);
        return '';
      }
      return `url("./${name}.${format}") format("${type}")`;
    })
    .filter(Boolean)
    .join(',\n');

  return `@font-face {
  font-family: ${fontFamily};
  src: ${src};
  font-weight: ${fontWeight};
  font-style: ${fontStyle};
  font-display: ${fontDisplay};
  unicode-range: ${unicodeRange};
}`;
}

module.exports = generateCss;
