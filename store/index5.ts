import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry";
import * as SceneUtils from "three/examples/jsm/utils/SceneUtils";
import GUI from "lil-gui";

let scene: THREE.Scene;
let sceneOrtho: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let camera: any;
let cameraOrtho: any;
let orbitControls: OrbitControls;

class moveSprite extends THREE.Sprite {
  velocityX:number = 0;
}

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
  sceneOrtho = new THREE.Scene();
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
  cameraOrtho = new THREE.OrthographicCamera(0, window.innerWidth, window.innerHeight, 0, -10, 10);

  if (output != null) {
    output.appendChild(renderer.domElement);
  }

  const material = new THREE.MeshNormalMaterial();
  const geom = new THREE.SphereGeometry(15,20,20);
  const mesh = new THREE.Mesh(geom, material);

  scene.add(mesh);

  const getTexture = function(): THREE.Texture {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/assets/textures/particles/sprite-sheet.png");
    return texture;
  }

  createSprite(150,true,0.6,0xffffff,0);

  let step: number = 0;

  render();

  function createSprite(
    size: number,
    transparent: boolean | undefined,
    opacity: number | undefined,
    color: THREE.ColorRepresentation | undefined,
    spriteNumber: number
    ): void {
    const spriteMaterial = new THREE.SpriteMaterial({
      opacity: opacity,
      color: color,
      transparent: transparent,
      map: getTexture()
    });
    if (spriteMaterial.map) {
      spriteMaterial.map.offset = new THREE.Vector2(0.2 * spriteNumber, 0);
      spriteMaterial.map.repeat = new THREE.Vector2(1 / 5, 1);
    }
    spriteMaterial.depthTest = false;
    spriteMaterial.blending = THREE.AdditiveBlending;

    const sprite = new moveSprite(spriteMaterial);
    sprite.scale.set(size, size, size);
    sprite.position.set(100,50,-10);
    sprite.velocityX = 5;

    sceneOrtho.add(sprite);
  }

  function render(): void {
    camera.position.y = Math.sin(step += 0.01) * 20;

    sceneOrtho.children.forEach(e => {
      if (e instanceof moveSprite) {
        e.position.x = e.position.x + e.velocityX;
        if (e.position.x > window.innerWidth) {
          e.velocityX = -5;
        }
        if (e.position.x < 0) {
          e.velocityX = 5;
        }
      }
    });

    requestAnimationFrame(render);

    renderer.render(scene, camera);
    renderer.autoClear = false;
    renderer.render(sceneOrtho, cameraOrtho);
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
