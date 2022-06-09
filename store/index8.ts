import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";
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
  renderer.setClearColor(new THREE.Color(0xCCCCCC));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  camera = new THREE.PerspectiveCamera(
    cameraOptions.fovy,
    cameraOptions.aspect,
    cameraOptions.near,
    cameraOptions.far
  );
  camera.position.set(100,100,100);
  camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
  orbitControls = new OrbitControls(camera, renderer.domElement);

  if (output != null) {
    output.appendChild(renderer.domElement);
  }

  const gltfLoader = new GLTFLoader();
  const chairUrl: string = '/assets/3d/misc_chair01.glb';
  let chairModel;
  gltfLoader.load(
    chairUrl,
    function(gltf) {
      chairModel = gltf.scene;
      chairModel.scale.set(10, 10, 10);
      chairModel.position.set(0, (window.innerHeight / 3 * -1), 0);
      scene.add(chairModel);
    }
  );

  const colladaLoader = new ColladaLoader();
  const truckUrl: string = '/assets/3d/dae/Truck_dae.dae';
  let truckModel;
  colladaLoader.load(
    truckUrl,
    function(collada) {
      truckModel = collada.scene.children[0].children[0].clone();
      truckModel.scale.set(4,4,4);
      truckModel.position.set(0,0,0,);
      scene.add(truckModel);
    }
  );


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
