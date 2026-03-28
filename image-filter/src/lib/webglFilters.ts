import type { FilterSettings } from "../store/editorStore";

// --- GLSL シェーダー ---

// 頂点シェーダー（全フィルタ共通）: テクスチャ座標をそのまま渡す
const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;

// メインフィルタシェーダー: brightness, contrast, saturation, grayscale, sepia, invert を一括処理
const MAIN_FILTER_SHADER = `#version 300 es
precision mediump float;
in vec2 v_texCoord;
out vec4 outColor;

uniform sampler2D u_image;
uniform float u_brightness;  // -1.0..1.0
uniform float u_contrast;    // -1.0..1.0
uniform float u_saturation;  // -1.0..1.0
uniform bool u_grayscale;
uniform bool u_sepia;
uniform bool u_invert;

void main() {
  vec4 color = texture(u_image, v_texCoord);
  vec3 rgb = color.rgb;

  // Brightness
  rgb += u_brightness;

  // Contrast
  float factor = (1.0 + u_contrast) / (1.0 - u_contrast + 0.001);
  rgb = (rgb - 0.5) * factor + 0.5;

  // Saturation
  float gray = dot(rgb, vec3(0.299, 0.587, 0.114));
  float sat = u_saturation + 1.0;
  rgb = vec3(gray) + sat * (rgb - vec3(gray));

  // Grayscale
  if (u_grayscale) {
    float g = dot(rgb, vec3(0.299, 0.587, 0.114));
    rgb = vec3(g);
  }

  // Sepia
  if (u_sepia) {
    vec3 s;
    s.r = dot(rgb, vec3(0.393, 0.769, 0.189));
    s.g = dot(rgb, vec3(0.349, 0.686, 0.168));
    s.b = dot(rgb, vec3(0.272, 0.534, 0.131));
    rgb = s;
  }

  // Invert
  if (u_invert) {
    rgb = 1.0 - rgb;
  }

  outColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
}
`;

// 水平ブラーシェーダー
const BLUR_H_SHADER = `#version 300 es
precision mediump float;
in vec2 v_texCoord;
out vec4 outColor;

uniform sampler2D u_image;
uniform float u_radius;
uniform float u_texelWidth;

void main() {
  vec4 sum = vec4(0.0);
  float count = 0.0;
  for (float i = -20.0; i <= 20.0; i += 1.0) {
    if (i < -u_radius || i > u_radius) continue;
    vec2 offset = vec2(i * u_texelWidth, 0.0);
    sum += texture(u_image, v_texCoord + offset);
    count += 1.0;
  }
  outColor = sum / count;
}
`;

// 垂直ブラーシェーダー
const BLUR_V_SHADER = `#version 300 es
precision mediump float;
in vec2 v_texCoord;
out vec4 outColor;

uniform sampler2D u_image;
uniform float u_radius;
uniform float u_texelHeight;

void main() {
  vec4 sum = vec4(0.0);
  float count = 0.0;
  for (float i = -20.0; i <= 20.0; i += 1.0) {
    if (i < -u_radius || i > u_radius) continue;
    vec2 offset = vec2(0.0, i * u_texelHeight);
    sum += texture(u_image, v_texCoord + offset);
    count += 1.0;
  }
  outColor = sum / count;
}
`;

// シャープネスシェーダー（畳み込みカーネル）
const SHARPEN_SHADER = `#version 300 es
precision mediump float;
in vec2 v_texCoord;
out vec4 outColor;

uniform sampler2D u_image;
uniform float u_amount;
uniform float u_texelWidth;
uniform float u_texelHeight;

void main() {
  float center = 1.0 + 4.0 * u_amount;
  float edge = -u_amount;

  vec4 color = center * texture(u_image, v_texCoord)
    + edge * texture(u_image, v_texCoord + vec2(0.0, -u_texelHeight))
    + edge * texture(u_image, v_texCoord + vec2(0.0,  u_texelHeight))
    + edge * texture(u_image, v_texCoord + vec2(-u_texelWidth, 0.0))
    + edge * texture(u_image, v_texCoord + vec2( u_texelWidth, 0.0));

  outColor = vec4(clamp(color.rgb, 0.0, 1.0), color.a);
}
`;

// --- WebGL ヘルパー ---

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info}`);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, fragSource: string): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSource);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${info}`);
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

// キャッシュ: 一度作った WebGL リソースを再利用
let cachedGL: WebGL2RenderingContext | null = null;
let cachedCanvas: HTMLCanvasElement | null = null;
let mainProgram: WebGLProgram | null = null;
let blurHProgram: WebGLProgram | null = null;
let blurVProgram: WebGLProgram | null = null;
let sharpenProgram: WebGLProgram | null = null;
let quadVAO: WebGLVertexArrayObject | null = null;

function getGL(): WebGL2RenderingContext {
  if (cachedGL) return cachedGL;

  cachedCanvas = document.createElement("canvas");
  const gl = cachedCanvas.getContext("webgl2");
  if (!gl) throw new Error("WebGL2 not supported");

  cachedGL = gl;

  // シェーダープログラムのコンパイル
  mainProgram = createProgram(gl, MAIN_FILTER_SHADER);
  blurHProgram = createProgram(gl, BLUR_H_SHADER);
  blurVProgram = createProgram(gl, BLUR_V_SHADER);
  sharpenProgram = createProgram(gl, SHARPEN_SHADER);

  // 全画面四角形の頂点データ（位置 + テクスチャ座標）
  const quadVerts = new Float32Array([
    // position    texCoord
    -1, -1,        0, 0,
     1, -1,        1, 0,
    -1,  1,        0, 1,
     1,  1,        1, 1,
  ]);

  quadVAO = gl.createVertexArray()!;
  gl.bindVertexArray(quadVAO);

  const vbo = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

  // a_position (location 0)
  const posLoc = gl.getAttribLocation(mainProgram, "a_position");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);

  // a_texCoord (location 1)
  const texLoc = gl.getAttribLocation(mainProgram, "a_texCoord");
  gl.enableVertexAttribArray(texLoc);
  gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8);

  gl.bindVertexArray(null);

  return gl;
}

function createTexture(gl: WebGL2RenderingContext, imageData: ImageData): WebGLTexture {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imageData.width, imageData.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageData.data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return tex;
}

function createFramebuffer(gl: WebGL2RenderingContext, width: number, height: number): { fb: WebGLFramebuffer; tex: WebGLTexture } {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const fb = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

  return { fb, tex };
}

function renderPass(gl: WebGL2RenderingContext, program: WebGLProgram, srcTex: WebGLTexture, target: WebGLFramebuffer | null) {
  gl.useProgram(program);
  gl.bindFramebuffer(gl.FRAMEBUFFER, target);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, srcTex);
  gl.uniform1i(gl.getUniformLocation(program, "u_image"), 0);
  gl.bindVertexArray(quadVAO);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// --- 公開 API ---

export function applyFiltersWebGL(
  originalData: ImageData,
  filters: FilterSettings
): ImageData {
  const gl = getGL();
  const { width, height } = originalData;

  // キャンバスサイズ合わせ
  cachedCanvas!.width = width;
  cachedCanvas!.height = height;
  gl.viewport(0, 0, width, height);

  // 元画像をテクスチャにアップロード
  const srcTex = createTexture(gl, originalData);

  // フレームバッファ2つ（ピンポン用）
  const fb0 = createFramebuffer(gl, width, height);
  const fb1 = createFramebuffer(gl, width, height);

  let currentTex = srcTex;

  // --- Pass 1: メインフィルタ（brightness, contrast, saturation, grayscale, sepia, invert）---
  const hasMainFilter =
    filters.brightness !== 0 ||
    filters.contrast !== 0 ||
    filters.saturation !== 0 ||
    filters.grayscale ||
    filters.sepia ||
    filters.invert;

  if (hasMainFilter) {
    gl.useProgram(mainProgram!);
    gl.uniform1f(gl.getUniformLocation(mainProgram!, "u_brightness"), filters.brightness / 100);
    gl.uniform1f(gl.getUniformLocation(mainProgram!, "u_contrast"), filters.contrast / 255);
    gl.uniform1f(gl.getUniformLocation(mainProgram!, "u_saturation"), filters.saturation / 100);
    gl.uniform1i(gl.getUniformLocation(mainProgram!, "u_grayscale"), filters.grayscale ? 1 : 0);
    gl.uniform1i(gl.getUniformLocation(mainProgram!, "u_sepia"), filters.sepia ? 1 : 0);
    gl.uniform1i(gl.getUniformLocation(mainProgram!, "u_invert"), filters.invert ? 1 : 0);

    renderPass(gl, mainProgram!, currentTex, fb0.fb);
    currentTex = fb0.tex;
  }

  // --- Pass 2: Blur（水平 → 垂直）---
  if (filters.blur > 0) {
    const texelW = 1.0 / width;
    const texelH = 1.0 / height;

    // 水平ブラー
    gl.useProgram(blurHProgram!);
    gl.uniform1f(gl.getUniformLocation(blurHProgram!, "u_radius"), filters.blur);
    gl.uniform1f(gl.getUniformLocation(blurHProgram!, "u_texelWidth"), texelW);
    const blurHTarget = currentTex === fb0.tex ? fb1 : fb0;
    renderPass(gl, blurHProgram!, currentTex, blurHTarget.fb);
    currentTex = blurHTarget.tex;

    // 垂直ブラー
    gl.useProgram(blurVProgram!);
    gl.uniform1f(gl.getUniformLocation(blurVProgram!, "u_radius"), filters.blur);
    gl.uniform1f(gl.getUniformLocation(blurVProgram!, "u_texelHeight"), texelH);
    const blurVTarget = currentTex === fb0.tex ? fb1 : fb0;
    renderPass(gl, blurVProgram!, currentTex, blurVTarget.fb);
    currentTex = blurVTarget.tex;
  }

  // --- Pass 3: Sharpen ---
  if (filters.sharpness > 0) {
    gl.useProgram(sharpenProgram!);
    gl.uniform1f(gl.getUniformLocation(sharpenProgram!, "u_amount"), filters.sharpness / 100);
    gl.uniform1f(gl.getUniformLocation(sharpenProgram!, "u_texelWidth"), 1.0 / width);
    gl.uniform1f(gl.getUniformLocation(sharpenProgram!, "u_texelHeight"), 1.0 / height);
    const sharpenTarget = currentTex === fb0.tex ? fb1 : fb0;
    renderPass(gl, sharpenProgram!, currentTex, sharpenTarget.fb);
    currentTex = sharpenTarget.tex;
  }

  // --- 最終出力: フレームバッファの結果を画面に描画、またはそのまま読み出し ---
  // フィルタが一つも適用されなかった場合は元テクスチャをそのまま描画
  if (currentTex === srcTex) {
    // フィルタなし: 元画像をそのままコピー
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb0.fb);
    gl.useProgram(mainProgram!);
    gl.uniform1f(gl.getUniformLocation(mainProgram!, "u_brightness"), 0);
    gl.uniform1f(gl.getUniformLocation(mainProgram!, "u_contrast"), 0);
    gl.uniform1f(gl.getUniformLocation(mainProgram!, "u_saturation"), 0);
    gl.uniform1i(gl.getUniformLocation(mainProgram!, "u_grayscale"), 0);
    gl.uniform1i(gl.getUniformLocation(mainProgram!, "u_sepia"), 0);
    gl.uniform1i(gl.getUniformLocation(mainProgram!, "u_invert"), 0);
    renderPass(gl, mainProgram!, srcTex, fb0.fb);
    currentTex = fb0.tex;
  }

  // ピクセル読み出し
  const targetFb = currentTex === fb0.tex ? fb0.fb : fb1.fb;
  gl.bindFramebuffer(gl.FRAMEBUFFER, targetFb);
  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  // WebGL は左下原点なので上下反転
  const result = new ImageData(width, height);
  for (let y = 0; y < height; y++) {
    const srcRow = (height - 1 - y) * width * 4;
    const dstRow = y * width * 4;
    result.data.set(pixels.subarray(srcRow, srcRow + width * 4), dstRow);
  }

  // テクスチャ・フレームバッファを解放
  gl.deleteTexture(srcTex);
  gl.deleteTexture(fb0.tex);
  gl.deleteTexture(fb1.tex);
  gl.deleteFramebuffer(fb0.fb);
  gl.deleteFramebuffer(fb1.fb);

  return result;
}
