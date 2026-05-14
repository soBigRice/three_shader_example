import type { Lang, TranslationMap } from './types';

const zh: TranslationMap = {
  /* ---- HTML / 页面元信息 ---- */
  'page.title': 'Three.js Shader 案例库',

  /* ---- Home / 首页 ---- */
  'home.title': 'Three.js Shader 案例实验室',
  'home.subtitle': 'GPU 驱动的交互式视觉效果集合 · 每个案例独立可运行',
  'home.moreComing': '更多案例即将添加',
  'home.footer': 'Built with Three.js · React · Vite',
  'home.langSwitch': 'EN',

  /* ---- Case cards / 案例卡片 ---- */
  'case.waterRipple.title': '水波涟漪',
  'case.waterRipple.desc': '点击方块产生 Morlet 小波涟漪扩散，GPU Vertex Shader 实时计算阻尼波动方程，支持多点交互。',
  'case.waterRipple.tag.0': 'Vertex Shader',
  'case.waterRipple.tag.1': '波动方程',
  'case.waterRipple.tag.2': 'InstancedMesh',
  'case.waterRipple.tag.3': '多点交互',

  /* ---- CaseLayout / 案例布局 ---- */
  'layout.back': '← 案例列表',
  'layout.intro': '简介',
  'layout.fullscreen': '全屏预览',
  'layout.exitFullscreen': '退出全屏 (Esc)',

  /* ---- WaterRipple page / 水波涟漪页面 ---- */
  'waterRipple.pageTitle': '水波涟漪 · Morlet Wavelet Ripple',
  'waterRipple.description': '水波涟漪效果 —— 点击方块产生基于 Morlet 小波的涟漪扩散。GPU Vertex Shader 中计算阻尼波动方程，每个方块根据到波源的距离实时计算高度。支持多点同时交互（最多 64 个活跃波源），死波源自动回收。右侧 lil-gui 面板可实时调节传播速度、衰减系数、频率、振幅等参数。',
};

const en: TranslationMap = {
  /* ---- HTML / Page meta ---- */
  'page.title': 'Three.js Shader Lab',

  /* ---- Home / 首页 ---- */
  'home.title': 'Three.js Shader Lab',
  'home.subtitle': 'GPU-driven interactive visual effects collection · Each case runs independently',
  'home.moreComing': 'More cases coming soon',
  'home.footer': 'Built with Three.js · React · Vite',
  'home.langSwitch': '中文',

  /* ---- Case cards / 案例卡片 ---- */
  'case.waterRipple.title': 'Water Ripple',
  'case.waterRipple.desc': 'Click blocks to generate Morlet wavelet ripples. GPU Vertex Shader computes damped wave equation in real time, with multi-touch interaction support.',
  'case.waterRipple.tag.0': 'Vertex Shader',
  'case.waterRipple.tag.1': 'Wave Equation',
  'case.waterRipple.tag.2': 'InstancedMesh',
  'case.waterRipple.tag.3': 'Multi-touch',

  /* ---- CaseLayout / 案例布局 ---- */
  'layout.back': '← Cases',
  'layout.intro': 'Overview',
  'layout.fullscreen': 'Fullscreen',
  'layout.exitFullscreen': 'Exit Fullscreen (Esc)',

  /* ---- WaterRipple page / 水波涟漪页面 ---- */
  'waterRipple.pageTitle': 'Water Ripple · Morlet Wavelet Ripple',
  'waterRipple.description': 'Water ripple effect — click blocks to generate Morlet wavelet-based ripples. The GPU Vertex Shader computes a damped wave equation, calculating height in real time based on distance to wave sources. Supports simultaneous multi-touch interaction (up to 64 active wave sources), with automatic recycling of dead sources. The lil-gui panel on the right allows real-time adjustment of propagation speed, damping coefficient, frequency, amplitude, and other parameters.',
};

export const translations: Record<Lang, TranslationMap> = { zh, en };
