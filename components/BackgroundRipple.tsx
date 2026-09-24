"use client";

import { useEffect, useRef, useState } from "react";

const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform vec2 u_imageSize;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_mouseStrength;
uniform vec2 u_ripples[8];
uniform float u_rippleAges[8];

varying vec2 v_uv;

vec2 coverUV(vec2 uv, vec2 container, vec2 image) {
  float containerRatio = container.x / container.y;
  float imageRatio = image.x / image.y;
  vec2 scale = vec2(1.0);

  if (containerRatio > imageRatio) {
    scale.y = imageRatio / containerRatio;
  } else {
    scale.x = containerRatio / imageRatio;
  }

  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 uv = coverUV(v_uv, u_resolution, u_imageSize);
  vec2 offset = vec2(0.0);

  // Expanding ripples from pointer path (local only)
  for (int i = 0; i < 8; i++) {
    float age = u_rippleAges[i];
    if (age < 0.0 || age > 1.8) continue;

    vec2 center = coverUV(u_ripples[i], u_resolution, u_imageSize);
    float dist = distance(uv, center);
    float wave = age * 0.28;
    float band = abs(dist - wave);
    float falloff = exp(-dist * 14.0) * exp(-age * 1.8);
    float ripple = exp(-band * 42.0) * falloff * 0.032;
    vec2 dir = normalize(uv - center + 0.0001);
    offset += dir * ripple;
  }

  // Soft local lens around cursor only
  vec2 mouseUv = coverUV(u_mouse, u_resolution, u_imageSize);
  float mDist = distance(uv, mouseUv);
  float mouseMask = exp(-mDist * 18.0) * u_mouseStrength;
  float mouseRipple =
    sin(mDist * 55.0 - u_time * 8.0) * mouseMask * 0.014;
  vec2 mouseDir = normalize(uv - mouseUv + 0.0001);
  offset += mouseDir * mouseRipple;

  vec2 sampleUv = clamp(uv + offset, 0.001, 0.999);
  gl_FragColor = texture2D(u_image, sampleUv);
}
`;

type Ripple = { x: number; y: number; born: number };

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function BackgroundRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useWebGL, setUseWebGL] = useState(false);

  useEffect(() => {
    const lgQuery = window.matchMedia("(min-width: 1024px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncMode = () => {
      setUseWebGL(lgQuery.matches && !motionQuery.matches);
    };

    syncMode();
    lgQuery.addEventListener("change", syncMode);
    motionQuery.addEventListener("change", syncMode);
    return () => {
      lgQuery.removeEventListener("change", syncMode);
      motionQuery.removeEventListener("change", syncMode);
    };
  }, []);

  useEffect(() => {
    if (!useWebGL) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) {
      setUseWebGL(false);
      return;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      setUseWebGL(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setUseWebGL(false);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      setUseWebGL(false);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uImage = gl.getUniformLocation(program, "u_image");
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uImageSize = gl.getUniformLocation(program, "u_imageSize");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uMouseStrength = gl.getUniformLocation(program, "u_mouseStrength");
    const uRipples: WebGLUniformLocation[] = [];
    const uRippleAges: WebGLUniformLocation[] = [];
    for (let i = 0; i < 8; i++) {
      uRipples.push(gl.getUniformLocation(program, `u_ripples[${i}]`)!);
      uRippleAges.push(gl.getUniformLocation(program, `u_rippleAges[${i}]`)!);
    }

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([240, 239, 231, 255]),
    );

    const imageSize = { w: 1, h: 1 };
    const img = new Image();
    img.decoding = "async";
    img.src = "/background.png";
    img.onload = () => {
      imageSize.w = img.naturalWidth;
      imageSize.h = img.naturalHeight;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    };

    const mouse = { x: 0.5, y: 0.5, strength: 0 };
    const ripples: Ripple[] = [];
    let lastRippleAt = 0;
    let raf = 0;
    const start = performance.now();
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const toUv = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left) / rect.width,
        y: (clientY - rect.top) / rect.height,
      };
    };

    const pushRipple = (x: number, y: number) => {
      const now = performance.now();
      if (now - lastRippleAt < 90) return;
      lastRippleAt = now;
      ripples.push({ x, y, born: now });
      if (ripples.length > 8) ripples.shift();
    };

    const onPointerMove = (e: PointerEvent) => {
      const uv = toUv(e.clientX, e.clientY);
      mouse.x = uv.x;
      mouse.y = uv.y;
      mouse.strength = Math.min(1, mouse.strength + 0.18);
      pushRipple(uv.x, uv.y);
    };

    const onPointerDown = (e: PointerEvent) => {
      const uv = toUv(e.clientX, e.clientY);
      mouse.x = uv.x;
      mouse.y = uv.y;
      mouse.strength = 1;
      lastRippleAt = 0;
      pushRipple(uv.x, uv.y);
    };

    const onPointerLeave = () => {
      mouse.strength = 0;
    };

    const render = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(render);

      const t = (now - start) / 1000;
      mouse.strength *= 0.96;

      gl.clearColor(0.94, 0.937, 0.906, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1i(uImage, 0);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uImageSize, imageSize.w, imageSize.h);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uMouseStrength, mouse.strength);

      for (let i = 0; i < 8; i++) {
        const r = ripples[i];
        if (r) {
          gl.uniform2f(uRipples[i], r.x, r.y);
          gl.uniform1f(uRippleAges[i], (now - r.born) / 1000);
        } else {
          gl.uniform2f(uRipples[i], 0, 0);
          gl.uniform1f(uRippleAges[i], -1);
        }
      }

      while (ripples.length && (now - ripples[0].born) / 1000 > 1.8) {
        ripples.shift();
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    raf = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerleave", onPointerLeave);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
    };
  }, [useWebGL]);

  return (
    <>
      {/* Static background below lg (and when WebGL is off) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/background.png"
        alt=""
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover object-center ${
          useWebGL ? "hidden" : "block"
        }`}
        aria-hidden="true"
      />
      {useWebGL ? (
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}
