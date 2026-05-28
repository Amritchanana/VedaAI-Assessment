declare module 'pdf-parse' {
  function pdfParse(buffer: Buffer): Promise<{ text: string; [key: string]: any }>;
  export = pdfParse;
}
