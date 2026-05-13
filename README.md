# Three.js Shader 案例库

基于 React + Three.js 的 GPU Shader 交互效果集合。每个案例独立目录，路由隔离，支持实时参数调节与全屏预览。

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | React 19 + TypeScript |
| 路由 | react-router-dom v7 |
| 3D | Three.js 0.184 (WebGL 2) |
| 着色器 | 自定义 GLSL (ShaderMaterial) |
| 工具 | Vite 8、lil-gui、stats.js、OrbitControls |

## 快速开始

```bash
# 安装依赖
yarn

# 启动开发服务器
yarn dev

# 访问
open http://localhost:5173
```

## 项目结构

```
src/
├── main.tsx              # React 入口
├── App.tsx               # 路由配置
├── style.css             # 全局样式
├── pages/
│   └── Home.tsx          # 案例目录首页
├── components/
│   └── CaseLayout.tsx    # 案例页共享布局
└── cases/
    └── waterRipple/      # 水波涟漪
        ├── index.tsx     # React 组件
        ├── scene.ts      # 场景初始化
        ├── grid.ts       # 方块网格 + ShaderMaterial
        ├── gui.ts        # 参数调节面板
        ├── interaction.ts # 鼠标交互
        └── shaders/
            ├── vertex.glsl
            └── fragment.glsl
```

## 案例列表

### 🌊 水波涟漪

点击方块产生 Morlet 小波涟漪扩散。GPU Vertex Shader 中计算阻尼波动方程，每个方块根据到波源的距离实时计算高度。

- **路由**：`/water-ripple`
- **技术点**：Morlet 小波、InstancedMesh、DataTexture、多点交互、智能波源回收
- **可调参数**：传播速度、衰减系数、频率、振幅、最大高度

## 添加新案例

参见 [CASE_GUIDE.md](./CASE_GUIDE.md)
