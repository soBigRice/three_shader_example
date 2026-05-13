# JumpBox - Shader 交互动效设计文档

## 1. 概述

一个由 GPU Shader 驱动的方块场地，鼠标点击方块后触发**高度抬升**和**颜色渐变**动画，动画逻辑在 Vertex Shader 和 Fragment Shader 中完成。

## 2. 技术架构

```
┌──────────────────────────────────────────────────────┐
│                    main.ts                            │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  Scene   │  │  Camera  │  │  Renderer (WebGL) │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
│                                                       │
│  ┌──────────────────────────────────────────────┐    │
│  │            InstancedMesh (N×N cubes)          │    │
│  │  ┌─────────────────────────────────────────┐ │    │
│  │  │        Custom ShaderMaterial             │ │    │
│  │  │  • vertexShader   → 高度动画             │ │    │
│  │  │  • fragmentShader → 颜色渐变             │ │    │
│  │  │  • uniforms: time, stateTexture          │ │    │
│  │  └─────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────┘    │
│                                                       │
│  ┌──────────────────────────────────────────────┐    │
│  │           Interaction Layer                   │    │
│  │  • Raycaster → 点击检测                      │    │
│  │  • DataTexture → per-instance 状态传递        │    │
│  │  • Tween 队列 → 动画时间管理                  │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

## 3. 核心方案：InstancedMesh + DataTexture

### 3.1 为什么用 InstancedMesh

- N×N（如 20×20 = 400）个方块，用 InstancedMesh 只需 1 次 Draw Call
- 每个 instance 有独立的变换矩阵（位置 + 缩放）
- 通过 DataTexture 把每个方块的状态传进 Shader

### 3.2 DataTexture 状态传递

每个方块占用纹理中的 1 个像素（RGBA），存储其动画状态：

| 通道 | 含义         | 范围    |
|------|-------------|---------|
| R    | 当前高度偏移  | 0.0–1.0 |
| G    | 目标高度偏移  | 0.0–1.0 |
| B    | 颜色过渡进度  | 0.0–1.0 |
| A    | 动画起始时间  | 0.0–1.0 |

纹理尺寸 = N × N，采样时用 `(instanceIndex % N) / N` 和 `(instanceIndex / N) / N` 定位。

## 4. Shader 设计（核心）

### 4.1 Vertex Shader

```glsl
// 关键逻辑
uniform sampler2D uStateTexture;  // 状态纹理
uniform float uTime;              // 全局时间
uniform float uCubeSize;          // 方块尺寸
uniform float uMaxHeight;         // 最大抬升高度
uniform float uAnimDuration;      // 动画时长（秒）
uniform float uGridSize;          // 网格尺寸 N

attribute float aInstanceIndex;   // 实例索引

void main() {
    // 1. 从 DataTexture 读取当前实例的状态
    vec2 uv = vec2(
        mod(aInstanceIndex, uGridSize) / uGridSize,
        floor(aInstanceIndex / uGridSize) / uGridSize
    );
    vec4 state = texture2D(uStateTexture, uv);

    float currentHeight = state.r;  // 当前高度
    float targetHeight  = state.g;  // 目标高度
    float animStart     = state.a;  // 动画起始时间

    // 2. 弹性缓动（easeOutBack → 弹跳感）
    float elapsed = uTime - animStart;
    float t = clamp(elapsed / uAnimDuration, 0.0, 1.0);
    // easeOutBack: overshoot then settle
    float c1 = 1.70158;
    float c3 = c1 + 1.0;
    float ease = 1.0 + c3 * pow(t - 1.0, 3.0) + c1 * pow(t - 1.0, 2.0);

    // 3. 在高度间插值
    float height = mix(currentHeight, targetHeight, ease);

    // 4. 应用到 Y 轴位移
    vec3 pos = position;
    pos.y += height * uMaxHeight;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

### 4.2 Fragment Shader

```glsl
uniform sampler2D uStateTexture;
uniform float uTime;
uniform float uGridSize;
uniform vec3 uBaseColor;      // 默认颜色
uniform vec3 uActiveColor;    // 激活颜色
uniform float uGlowIntensity; // 发光强度

varying float vInstanceIndex;
varying float vHeight;

void main() {
    vec2 uv = vec2(
        mod(vInstanceIndex, uGridSize) / uGridSize,
        floor(vInstanceIndex / uGridSize) / uGridSize
    );
    vec4 state = texture2D(uStateTexture, uv);
    float progress = state.b;

    // 1. 颜色混合
    vec3 color = mix(uBaseColor, uActiveColor, progress);

    // 2. 高度越高，边缘越亮（菲涅尔效果）
    float fresnel = pow(1.0 - abs(dot(normal, vec3(0, 1, 0))), 2.0);
    color += fresnel * progress * uGlowIntensity * 0.3;

    // 3. 顶部面微弱的脉冲（点击后的小呼吸效果）
    float pulse = sin(uTime * 3.0) * 0.05 + 0.95;
    if (vHeight > 0.01) {
        color *= pulse;
    }

    gl_FragColor = vec4(color, 1.0);
}
```

## 5. 交互流程

```
鼠标点击
   │
   ▼
Raycaster 检测 ← 只对 InstancedMesh 做一次检测
   │
   ├── 未命中 → 忽略
   │
   └── 命中 instanceId
         │
         ▼
   更新 DataTexture 中该像素的状态:
     • R = 当前高度（保留）
     • G = 新目标高度（翻转：0→1 或 1→0）
     • B = 新目标颜色（翻转：0→1 或 1→0）
     • A = uTime（记录动画起始时间戳）
         │
         ▼
   GPU 在下一帧的 Shader 中自动计算插值
```

## 6. 数据流

```
         CPU 侧                          GPU 侧
   ┌──────────────┐              ┌─────────────────┐
   │ stateData     │  ──上传──→   │ uStateTexture   │
   │ Float32Array  │  (每帧)     │ (uniform)       │
   │ [N*N*4]       │              └──────┬──────────┘
   └──────┬───────┘                     │
          │                             ▼
          │ 点击时修改             Vertex Shader
          │ R/G/B/A               读取 + 插值计算
          │                       ────────────────
          │                       Fragment Shader
          │                       读取 + 颜色混合
```

- `stateData` 是 CPU 端维护的 `Float32Array(N*N*4)`，作为 DataTexture 的数据源
- 每帧上传一次（或仅在 dirty 时上传以节省带宽）
- 点击事件修改对应像素的 4 个通道值

## 7. 文件结构

```
src/
├── main.ts              # 入口：初始化 Three.js + 启动循环
├── scene.ts             # 场景、相机、灯光、Renderer 创建
├── grid.ts              # 创建 InstancedMesh + ShaderMaterial + DataTexture
├── interaction.ts       # Raycaster 点击检测 + 状态更新
├── shaders/
│   ├── vertex.glsl      # Vertex Shader
│   └── fragment.glsl    # Fragment Shader
└── style.css            # 全局样式
```

## 8. 实现步骤

| 步骤 | 内容                                   | 预估 |
|------|---------------------------------------|------|
| 1    | 安装 three + @types/three，搭建基础场景  | 小   |
| 2    | 创建 InstancedMesh，铺设 N×N 方块场地    | 中   |
| 3    | 编写 Custom ShaderMaterial（顶点+片元）  | 大   |
| 4    | 实现 DataTexture 状态管理               | 中   |
| 5    | 实现 Raycaster 点击检测 + 状态更新       | 中   |
| 6    | 调优缓动曲线、颜色渐变、发光效果          | 小   |

## 9. 关键技术点

- **Shader 内做缓动**：用 `easeOutBack` 公式在 Vertex Shader 中计算，避免 CPU 侧逐帧更新所有实例的矩阵
- **DataTexture 用 NearestFilter**：因为每个像素对应一个方块，不需要插值
- **instanceIndex 传递**：InstancedMesh 自带 `gl_InstanceID`，但自定义 ShaderMaterial 需要通过 attribute 手动传入
- **相机角度**：推荐等距视角（isometric）或 45° 俯视，让高度变化可见
