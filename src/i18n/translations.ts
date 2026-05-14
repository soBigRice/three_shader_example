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

  /* ---- Case card: 消融球体 / Case card: Sphere Dissolve ---- */
  'case.sphereDissolve.title': '消融球体',
  'case.sphereDissolve.desc': '3D FBM 噪声驱动球体消融效果，支持实体/线框模式切换。Fragment Shader 实时计算消融边缘霓虹辉光与 Blinn-Phong 光照。',
  'case.sphereDissolve.tag.0': 'Fragment Shader',
  'case.sphereDissolve.tag.1': '消融效果',
  'case.sphereDissolve.tag.2': '3D 噪声',
  'case.sphereDissolve.tag.3': '线框模式',

  /* ---- Case card: 信纸消散 / Case card: Letter Dissolve ---- */
  'case.letterDissolve.title': '信纸消散',
  'case.letterDissolve.desc': '可编辑信件内容实时贴图到复古信纸，顶部向下消散并伴随发光粒子逸散。',
  'case.letterDissolve.tag.0': 'Canvas 贴图',
  'case.letterDissolve.tag.1': '顶向消散',
  'case.letterDissolve.tag.2': '粒子特效',
  'case.letterDissolve.tag.3': '模板输入',

  /* ---- SphereDissolve page / 消融球体页面 ---- */
  'sphereDissolve.pageTitle': '消融球体 · Shader Dissolve',
  'sphereDissolve.description': '球体消融效果 —— 基于 3D FBM（分形布朗运动）噪声驱动。Fragment Shader 中将噪声值与阈值比较，低于阈值的片段被丢弃，形成有机的消融图案。消融边缘产生霓虹辉光，支持实体/线框模式实时切换。线框模式使用重心坐标边缘检测，消融效果同样作用于线框。右侧 lil-gui 面板可实时调节消融进度、边缘宽度、噪声缩放、颜色等参数，支持自动动画。',

  /* ---- LetterDissolve page / 信纸消散页面 ---- */
  'letterDissolve.pageTitle': '信纸消散 · Letter Dissolve',
  'letterDissolve.description': '可编辑信件贴图效果 —— 在右侧模板输入称呼、正文、结尾与署名，内容会实时绘制到复古信纸。点击“开始消散”后，纸张从顶部向下溶解并伴随发光粒子逸散；动画结束后可手动重置恢复。',
  'letterDissolve.form.title': '信件模板 / Letter Template',
  'letterDissolve.field.salutation': '称呼 / Salutation',
  'letterDissolve.field.body': '正文 / Body',
  'letterDissolve.field.closing': '结尾 / Closing',
  'letterDissolve.field.signature': '署名 / Signature',
  'letterDissolve.action.start': '开始消散',
  'letterDissolve.action.reset': '重置信纸',
  'letterDissolve.status.label': '状态',
  'letterDissolve.status.idle': '待机',
  'letterDissolve.status.running': '消散中',
  'letterDissolve.status.finished': '已完成',
  'letterDissolve.default.salutation': '亲爱的朋友：',
  'letterDissolve.default.body': '见字如晤。\\n\\n愿你在每一个平凡的日子里，都能遇见细小但确定的幸福。\\n即使偶尔疲惫，也请记得把温柔留给自己。\\n\\n愿好事正在来的路上。',
  'letterDissolve.default.closing': '此致 敬礼',
  'letterDissolve.default.signature': '你的朋友',
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

  /* ---- Case card: Sphere Dissolve ---- */
  'case.sphereDissolve.title': 'Sphere Dissolve',
  'case.sphereDissolve.desc': '3D FBM noise-driven sphere dissolve with solid/wireframe toggle. Fragment Shader computes real-time dissolve edge neon glow with Blinn-Phong lighting.',
  'case.sphereDissolve.tag.0': 'Fragment Shader',
  'case.sphereDissolve.tag.1': 'Dissolve Effect',
  'case.sphereDissolve.tag.2': '3D Noise',
  'case.sphereDissolve.tag.3': 'Wireframe Mode',

  /* ---- Case card: Letter Dissolve ---- */
  'case.letterDissolve.title': 'Letter Dissolve',
  'case.letterDissolve.desc': 'Editable letter content is rendered as a live paper texture, then dissolved top-down with glowing particles.',
  'case.letterDissolve.tag.0': 'Canvas Texture',
  'case.letterDissolve.tag.1': 'Top Dissolve',
  'case.letterDissolve.tag.2': 'Particle FX',
  'case.letterDissolve.tag.3': 'Template Input',

  /* ---- SphereDissolve page ---- */
  'sphereDissolve.pageTitle': 'Sphere Dissolve · Shader Dissolve',
  'sphereDissolve.description': 'Sphere dissolve effect — driven by 3D FBM (Fractal Brownian Motion) noise. The Fragment Shader compares noise values against a threshold, discarding fragments below it to create organic dissolve patterns. The dissolve edge emits a neon glow, with real-time solid/wireframe mode switching. Wireframe mode uses barycentric coordinate edge detection, and the dissolve effect also applies to the wireframe. The lil-gui panel on the right allows real-time adjustment of dissolve progress, edge width, noise scale, colors, and more, with auto-animation support.',

  /* ---- LetterDissolve page ---- */
  'letterDissolve.pageTitle': 'Letter Dissolve · Shader Case',
  'letterDissolve.description': 'Editable letter texture effect — fill in salutation, body, closing, and signature on the right panel, and the content is painted to a vintage paper texture in real time. Press “Start Dissolve” to run a top-down paper dissolve synchronized with glowing particles; press reset to restore.',
  'letterDissolve.form.title': 'Letter Template',
  'letterDissolve.field.salutation': 'Salutation',
  'letterDissolve.field.body': 'Body',
  'letterDissolve.field.closing': 'Closing',
  'letterDissolve.field.signature': 'Signature',
  'letterDissolve.action.start': 'Start Dissolve',
  'letterDissolve.action.reset': 'Reset Letter',
  'letterDissolve.status.label': 'Status',
  'letterDissolve.status.idle': 'Idle',
  'letterDissolve.status.running': 'Dissolving',
  'letterDissolve.status.finished': 'Finished',
  'letterDissolve.default.salutation': 'Dear Friend,',
  'letterDissolve.default.body': 'I hope this letter finds you well.\\n\\nMay your ordinary days still be lit by small but certain joys.\\nEven when you feel tired, please remember to be gentle with yourself.\\n\\nGood things are on the way.',
  'letterDissolve.default.closing': 'Sincerely,',
  'letterDissolve.default.signature': 'Your Friend',
};

export const translations: Record<Lang, TranslationMap> = { zh, en };
