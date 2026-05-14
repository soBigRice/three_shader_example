# 案例编写规范

## 目录结构

每个案例放在 `src/cases/<case-name>/` 下，遵循以下约定：

```
src/cases/<case-name>/
├── index.tsx          # React 入口组件（必需）
├── scene.ts           # 场景初始化（必需）
├── shaders/
│   ├── vertex.glsl    # 顶点着色器
│   ├── fragment.glsl  # 片元着色器
│   └── glsl.d.ts      # GLSL 模块类型声明
└── ...                # 其他模块（grid、interaction、gui 等，自由拆分）
```

## 新增案例步骤

### 1. 创建案例目录和入口组件

`src/cases/<case-name>/index.tsx` 是唯一必需遵循约定的文件。它必须是一个 React 组件，使用 `CaseLayout` 包裹：

```tsx
import { useEffect, useRef } from 'react';
import Stats from 'stats.js';
import CaseLayout from '../../components/CaseLayout';
import { createScene } from './scene';

const DESCRIPTION = '案例的一句话简介。 / One-line case description.';

export default function MyCase() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Stats 性能面板 / Stats performance panel
    const stats = new Stats();
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '8px';
    stats.dom.style.left = '8px';
    stats.dom.style.zIndex = '15';
    container.appendChild(stats.dom);

    // 初始化场景（传入容器尺寸） / Init scene (sized to container)
    const { scene, camera, renderer, controls } = createScene(
      container.clientWidth,
      container.clientHeight,
    );
    container.appendChild(renderer.domElement);

    // 容器尺寸变化监听 / Resize observer
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);

    // 渲染循环 / Render loop
    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      stats.begin();
      controls.update();
      renderer.render(scene, camera);
      stats.end();
    }
    animate();

    // 清理 / Cleanup
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
      container.removeChild(stats.dom);
    };
  }, []);

  return (
    <CaseLayout title="案例标题 / Case Title" description={DESCRIPTION}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </CaseLayout>
  );
}
```

### 2. 场景初始化

`scene.ts` 导出 `createScene(width, height)`，返回 `{ scene, camera, renderer, controls }`：

```ts
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface SceneSetup {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
}

export function createScene(width: number, height: number): SceneSetup {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1a1a2e');

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(14, 12, 14);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.update();

  // 灯光、地面等 / Lights, floor, etc.

  return { scene, camera, renderer, controls };
}
```

### 3. 注册路由

在 `src/App.tsx` 添加：

```tsx
import MyCase from './cases/my-case';

// 在 <Routes> 内添加 / Add inside <Routes>
<Route path="/my-case" element={<MyCase />} />
```

### 4. 添加到案例列表

在 `src/pages/Home.tsx` 的 `cases` 数组中添加：

```ts
{
  id: 'my-case',
  titleKey: 'case.myCase.title',
  descKey: 'case.myCase.desc',
  tagKeys: ['case.myCase.tag.0', 'case.myCase.tag.1'],
  path: '/my-case',
}
```

## Shader 规范

- 使用 GLSL ES 1.0 语法（`varying`、`texture2D`、`gl_FragColor` 等）
- 不要声明 `attribute mat4 instanceMatrix;`，Three.js 内部自动注入
- 自定义 per-instance attribute 使用 `InstancedBufferAttribute`
- 大数组 uniform（如波源数据）需配合 `new Float32Array()` 触发 GPU 上传
- 着色器文件通过 Vite 的 `?raw` 后缀导入为字符串

## GUI 面板

如需可调参数，使用 `lil-gui`：

```ts
import GUI from 'lil-gui';

const gui = new GUI({ title: 'Controls', width: 280 });
// 挂载到容器内 / Mount inside container
container.appendChild(gui.domElement);
gui.domElement.style.position = 'absolute';
gui.domElement.style.top = '8px';
gui.domElement.style.right = '8px';
gui.domElement.style.zIndex = '15';
```

## 组件规范

### CaseLayout Props

| Prop | 类型 / Type | 说明 / Description |
|------|------|------|
| `title` | `string` | 案例标题，显示在顶部导航栏 / Case title shown in top nav |
| `description` | `string` | 案例简介，非全屏时显示在预览区下方 / Overview shown below preview when not fullscreen |
| `children` | `ReactNode` | 预览内容，应是一个填满容器的 div / Preview content, should be a div filling the container |

### 生命周期

- `useEffect` 中初始化 Three.js，返回清理函数 / Init Three.js in useEffect, return cleanup
- 清理时必须：取消动画帧、断开 ResizeObserver、释放 Three.js 资源、移除 DOM 节点 / Cleanup must: cancel animation frame, disconnect ResizeObserver, dispose Three.js resources, remove DOM nodes
- 不要在组件外持有 renderer/scene 引用（避免内存泄漏） / Don't hold renderer/scene references outside component (avoid memory leaks)

## 注释规范 / Comment Convention

所有代码注释必须写中英双语，格式为 `中文 / English`。

### 适用范围

- JSDoc 文档注释
- `//` 行注释
- `/* */` 块注释
- `<!-- -->` / `{/* */}` HTML/JSX 注释
- GLSL 着色器中的注释
- CSS 段分隔注释
- GUI 面板中的标签文字（如 folder 名称、参数名称）

### TS/TSX 文件示例

```ts
/**
 * grid.ts — 方块网格核心模块 / Block grid core module
 *
 * 职责： / Responsibilities:
 *   - 创建 InstancedMesh / Create InstancedMesh
 */

/** 网格配置 / Grid configuration */
export interface GridConfig {
  gridSize: number;  // 网格边长 / Grid side length
}

// ---- 1. 几何体 / Geometry ----
// 同步相机位置给 Shader / Sync camera pos to shader
```

### JSX 文件示例

```tsx
{/* ---- Hero / 标题区 ---- */}
{/* 缩略图 / Thumbnail */}
```

### GLSL 文件示例

```glsl
/**
 * JumpBox Fragment Shader — 水波涟漪效果 / Water ripple effect
 */

uniform float uTime;  // 全局时间 / Global time

// ---- 基础色渐变 / Base color gradient ----
// 镜面高光 / Specular highlight
```

### CSS 文件示例

```css
/* ---- Buttons / 按钮 ---- */
/* ---- Preview Container / 预览容器 ---- */
```

### GUI 面板文字示例

```ts
const folder = gui.addFolder('高度 / Height');
folder.add(params, 'speed', 0.5, 10, 0.1)
  .name('传播速度 / Speed');
```

### 格式要点

- 中英文之间用 ` / `（空格 + 斜杠 + 空格）分隔
- 段分隔注释（`----`）保持中英在同一行
- JSDoc 中每行职责列表都需翻译
- GUI 标签文字也遵循此规范，确保中英文用户都能识别

## 性能要求

- 使用 `InstancedMesh` 处理大量重复几何体
- GPU 计算优先：动画逻辑尽量放在 Shader 中
- 避免在渲染循环中创建对象（`new Vector3()` 等）
- 大数组 uniform 更新后必须创建新引用以触发 GPU 上传
