/**
 * TypeScript 类型声明：让 TS 识别 .glsl?raw 导入为字符串
 */
declare module '*.glsl?raw' {
  const content: string;
  export default content;
}
