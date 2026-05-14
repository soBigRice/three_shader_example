/**
 * Sphere Dissolve Vertex Shader — 球体消融效果 / Sphere dissolve effect
 *
 * 职责： / Responsibilities:
 *   - 传递世界空间位置、法线给 fragment 做光照 / Pass world pos/normal to fragment for lighting
 *   - 标准 MVP 变换 / Standard MVP transform
 */

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
