# Three.js Shader Case Library

[中文版本](./README.md)

A GPU shader interaction collection built with React + Three.js. Each case is isolated by folder and route, with real-time parameter controls and fullscreen preview.

## Features

- Three independently runnable demo cases
- Custom GLSL shaders (not just post-processing chains)
- Real-time control panel (right side)
- Bilingual UI support (Chinese / English)
- Fullscreen preview on each case page

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Routing | react-router-dom v7 |
| 3D Rendering | Three.js 0.184 |
| Shader | GLSL + ShaderMaterial |
| Tooling | Vite 8, lil-gui, stats.js, OrbitControls |

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```

Default URL: `http://localhost:5173`

## Project Structure

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
    ├── waterRipple/          # Case 1: Water Ripple
    ├── sphereDissolve/       # Case 2: Sphere Dissolve
    └── letterDissolve/       # Case 3: Letter Dissolve
```

## Cases

### 🌊 Case 1: Water Ripple (`/water-ripple`)

Click blocks to emit Morlet wavelet ripples. The vertex shader computes damped wave propagation in real time.

- Highlights: InstancedMesh, multi-source accumulation, automatic source recycling
- Controls: speed, temporal decay, spatial decay, frequency, amplitude, max height

### 🔮 Case 2: Sphere Dissolve (`/sphere-dissolve`)

A 3D FBM-noise-driven dissolve sphere with solid/wireframe switching and auto animation.

- Highlights: fragment-shader dissolve, edge glow, Blinn-Phong lighting
- Controls: dissolve progress, edge width, noise scale, colors, lighting, specular

### ✉️ Case 3: Letter Dissolve (`/letter-dissolve`)

Editable letter content is rendered into a live texture, then dissolved with top-down / holes modes and synchronized particles.

- Highlights: dynamic Canvas texture, structured letter fields, dual dissolve modes, synced particles
- Controls: mode, progress, noise strength/scale/speed, edge tuning

## Development Notes

- For adding new cases, see: [CASE_GUIDE.md](./CASE_GUIDE.md)
- Case 3 issue log (pitfalls and fixes): `src/cases/letterDissolve/ISSUES.md`

## NPM Scripts

- `npm run dev`: development mode
- `npm run build`: type-check + production build
- `npm run preview`: preview built output
