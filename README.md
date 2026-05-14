# Three.js Shader 案例库

[English Version](./README.en.md)

基于 React + Three.js 的 GPU Shader 交互效果集合。每个案例独立目录、路由隔离，支持参数实时调节与全屏预览。

## 功能特性

- 三个独立可运行案例（案例列表页统一入口）
- 自定义 GLSL Shader（非后期特效拼接）
- 右侧控制面板实时调参
- 支持中英文切换
- 案例页支持全屏预览

## 技术栈

| 层级 | 技术 |
|---|---|
| 框架 | React 19 + TypeScript |
| 路由 | react-router-dom v7 |
| 3D 渲染 | Three.js 0.184 |
| Shader | GLSL + ShaderMaterial |
| 工具链 | Vite 8、lil-gui、stats.js、OrbitControls |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发环境
npm run dev

# 构建生产包
npm run build

# 本地预览构建结果
npm run preview
```

默认访问地址：`http://localhost:5173`

## 项目结构

```text
src/
├── main.tsx
├── App.tsx
├── style.css
├── pages/
│   └── Home.tsx
├── components/
│   └── CaseLayout.tsx
├── i18n/
│   ├── context.tsx
│   ├── translations.ts
│   └── types.ts
└── cases/
    ├── waterRipple/          # 案例1：水波涟漪
    ├── sphereDissolve/       # 案例2：消融球体
    └── letterDissolve/       # 案例3：信纸消散
```

## 案例列表

### 🌊 案例1：水波涟漪（`/water-ripple`）

点击方块产生 Morlet 小波涟漪扩散，Vertex Shader 实时计算阻尼波动。

- 关键技术：InstancedMesh、多波源叠加、波源自动回收
- 可调参数：传播速度、时间衰减、空间衰减、频率、振幅、最大高度

### 🔮 案例2：消融球体（`/sphere-dissolve`）

3D FBM 噪声驱动的球体消融，支持实体/线框切换与自动动画。

- 关键技术：Fragment Shader 消融、边缘辉光、Blinn-Phong 光照
- 可调参数：消融进度、边缘宽度、噪声缩放、颜色、光照、高光

### ✉️ 案例3：信纸消散（`/letter-dissolve`）

可编辑信件内容实时转贴图，叠加信纸顶部消散/破洞消散与粒子逸散。

- 关键技术：Canvas 动态纹理、分字段模板输入、双模式消散、粒子同步
- 可调参数：消散模式、进度、噪声强度/尺度/速度、边缘参数

## 开发说明

- 新增案例规范请参考：[CASE_GUIDE.md](./CASE_GUIDE.md)
- 案例3问题记录（踩坑与解决方案）在：`src/cases/letterDissolve/ISSUES.md`

## NPM Scripts

- `npm run dev`：开发模式
- `npm run build`：类型检查 + 生产构建
- `npm run preview`：预览构建产物
