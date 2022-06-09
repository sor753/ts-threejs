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
  camera.position.set(-30,40,30);
  camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
  orbitControls = new OrbitControls(camera, renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0x0c0c0c);
  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-40, 60, -10);

  scene.add(spotLight);

  if (output != null) {
    output.appendChild(renderer.domElement);
  }

  const planeGeometry = new THREE.PlaneGeometry(60,20,1,1);
  const planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 15;
  plane.position.y = 0;
  plane.position.z = 0;

  scene.add(plane);

  const cubeGeometry = new THREE.BoxGeometry(4,4,4);
  const cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
  const cube  = new THREE.Mesh(cubeGeometry, cubeMaterial);

  cube.position.x = -9;
  cube.position.y = 3;
  cube.position.z = 0;

  scene.add(cube);

  const sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
  const sphereMaterial = new THREE.MeshLambertMaterial({color: 0x7777ff});
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

  sphere.position.x = 20;
  sphere.position.y = 0;
  sphere.position.z = 2;

  scene.add(sphere);

  const cylinderGeometry = new THREE.CylinderGeometry(2, 2, 20);
  const cylinderMaterial = new THREE.MeshLambertMaterial({color: 0x77ff77});
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

  cylinder.position.set(0, 0, 1);

  scene.add(cylinder);

  let step: number = 0;
  let scalingStep: number = 0;

  const guiControls = {
    rotationSpeed : 0.02,
    bouncingSpeed : 0.03,
    scalingSpeed : 0.03,
  };

  const gui = new GUI();
  gui.add(guiControls, 'rotationSpeed', 0, 0.5);
  gui.add(guiControls, 'bouncingSpeed', 0, 0.5);
  gui.add(guiControls, 'scalingSpeed', 0, 0.5);

  render();

  function render(): void {
    cube.rotation.x += guiControls.rotationSpeed;
    cube.rotation.y += guiControls.rotationSpeed;
    cube.rotation.z += guiControls.rotationSpeed;

    step += guiControls.bouncingSpeed;
    sphere.position.x = 20 + (10 * (Math.cos(step)));
    sphere.position.y = 2 + (10 * Math.abs(Math.sin(step)));

    scalingStep += guiControls.scalingSpeed;
    const scaleX = Math.abs(Math.sin(scalingStep / 4));
    const scaleY = Math.abs(Math.cos(scalingStep / 5));
    const scaleZ = Math.abs(Math.sin(scalingStep / 7));
    cylinder.scale.set(scaleX, scaleY, scaleZ);
    
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
