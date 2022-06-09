import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry";
import * as SceneUtils from "three/examples/jsm/utils/SceneUtils";
import GUI from "lil-gui";

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let camera: any;
let orbitControls: OrbitControls;

window.addEventListener("DOMContentLoaded", init);

function init(): void {
  const output: HTMLDivElement | null = document.getElementById("webGL-output") as HTMLDivElement | null;
  const cameraOptions: {
    fovy: number;
    aspect: number;
    near: number;
    far: number;
  } = {
    fovy: 45,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 10000,
  };
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(new THREE.Color(0x000000));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  camera = new THREE.PerspectiveCamera(
    cameraOptions.fovy,
    cameraOptions.aspect,
    cameraOptions.near,
    cameraOptions.far
  );
  camera.position.set(0,0,150);
  camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

  if (output != null) {
    output.appendChild(renderer.domElement);
  }

  orbitControls = new OrbitControls(camera, renderer.domElement);

  const getTexture = function(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(-81, -84);
      ctx.fillStyle = "orange";
      ctx.beginPath();
      ctx.moveTo(83, 116);
      ctx.lineTo(83, 102);
      ctx.bezierCurveTo(83, 94, 89, 88, 97, 88);
      ctx.bezierCurveTo(105, 88, 111, 94, 111, 102);
      ctx.lineTo(111, 116);
      ctx.lineTo(106.333, 111.333);
      ctx.lineTo(101.666, 116);
      ctx.lineTo(97, 111.333);
      ctx.lineTo(92.333, 116);
      ctx.lineTo(87.666, 111.333);
      ctx.lineTo(83, 116);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.moveTo(91, 96);
      ctx.bezierCurveTo(88, 96, 87, 99, 87, 101);
      ctx.bezierCurveTo(87, 103, 88, 106, 91, 106);
      ctx.bezierCurveTo(94, 106, 95, 103, 95, 101);
      ctx.bezierCurveTo(95, 99, 94, 96, 91, 96);
      ctx.moveTo(103, 96);
      ctx.bezierCurveTo(100, 96, 99, 99, 99, 101);
      ctx.bezierCurveTo(99, 103, 100, 106, 103, 106);
      ctx.bezierCurveTo(106, 106, 107, 103, 107, 101);
      ctx.bezierCurveTo(107, 99, 106, 96, 103, 96);
      ctx.fill();
      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.arc(101, 102, 2, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(89, 102, 2, 0, Math.PI * 2, true);
      ctx.fill();
    }

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  function createParticles(
    size: number,
    transparent: boolean | undefined,
    opacity: number | undefined,
    sizeAttenuation: boolean | undefined,
    color: THREE.ColorRepresentation | undefined
    ): void {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/assets/textures/particles/raindrop-1.png")
    const geom = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
      size: size,
      transparent: transparent,
      opacity: opacity,
      depthWrite: false,
      map: texture,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: sizeAttenuation,
      color: color
    });

    const range = 500;
    let vertices: number[] = [];
    for (let i = 0; i < 1500; i++) {
      const x = Math.random() * range - range / 2;
      const y = Math.random() * range - range / 2;
      const z = Math.random() * range - range / 2;
      vertices.push(x, y, z);
    }
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const mesh = new THREE.Points(geom, material);
    scene.add(mesh);
  }

  const testColor = new THREE.Color(0xffffff);
  createParticles(3,true,0.6,true,testColor);
  render();

  function render(): void {
    requestAnimationFrame(render);
    // orbitControls.update();
    renderer.render(scene, camera);
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
