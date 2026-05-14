/**
 * Wireframe Mesh Vertex Shader — 线框网格 / Wireframe mesh
 *
 * 传递世界坐标 + 重心坐标给 fragment / Pass world pos + barycentric to fragment
 */

attribute vec3 aBarycentric;

varying vec3 vWorldPos;
varying vec3 vBarycentric;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  vBarycentric = aBarycentric;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
