declare type TOptions = {
  fontPath: string;
  outputDir: string;
  fontFamily?: string;
  formats?: Array<'woff' | 'woff2' | 'ttf' | 'eot' | 'svg'>;
  fontWeight?: string;
  fontStyle?: string;
  fontDisplay?: string;
};

declare function createFontSlice(options: TOptions): Promise<any>;

export default createFontSlice;

export = createFontSlice;
