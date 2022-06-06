import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;

window.addEventListener("DOMContentLoaded", () => {
  const output = document.getElementById("webGL-output") as HTMLDivElement | null;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  scene.add(camera);

  renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0xEEEEEE));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  const planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1);
  const planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;

  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 0;
  plane.position.y = 0;
  plane.position.z = 0;

  scene.add(plane);

  camera.position.set(
    -30,
    40,
    30
  )
  camera.lookAt(scene.position);

  const ambientLight = new THREE.AmbientLight(0x0c0c0c);
  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(
    -20,
    30,
    5
  );
  spotLight.castShadow = true;
  scene.add(spotLight);

  if (output != null) {
    output.appendChild(renderer.domElement);
  }

  const controls: {
    rotationSpeed: number;
    numberOfObject: number;
    removeCube: () => void;
    addCube: () => void;
    outputObjects: () => void;
    } = {
    rotationSpeed: 0.02,
    numberOfObject: scene.children.length,
    removeCube: function(): void {
      const allChildren = scene.children;
      const lastObject = allChildren[allChildren.length - 1];
      if (lastObject instanceof THREE.Mesh) {
        scene.remove(lastObject);
        this.numberOfObject = scene.children.length;
      }
    },
    addCube: function(): void {
      const cubeSize: number = Math.ceil((Math.random() * 3));
      const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const cubeMaterial = new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff});
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.castShadow = true;
      cube.name = "cube-" + scene.children.length;

      cube.position.x = -30 + Math.round((Math.random() * planeGeometry.parameters.width));
      cube.position.y = Math.round((Math.random() * 5));
      cube.position.z = -20 + Math.round((Math.random() * planeGeometry.parameters.height));

      scene.add(cube);
      this.numberOfObject = scene.children.length;
    },
    outputObjects: function(): void {
      console.log(scene.children);
    },
  };

  const gui = new GUI();
  gui.add( controls, 'rotationSpeed', 0, 0.5);
  gui.add( controls, 'addCube');
  gui.add( controls, 'removeCube');
  gui.add( controls, 'outputObjects');
  gui.add( controls, 'numberOfObject').listen();

  const orbitControls = new OrbitControls(camera, renderer.domElement);

  render();

  function render(): void {
    scene.traverse(function (obj: THREE.Object3D<THREE.Event>): void {
      if(obj instanceof THREE.Mesh && obj != plane) {
        obj.rotation.x += controls.rotationSpeed;
        obj.rotation.y += controls.rotationSpeed;
        obj.rotation.z += controls.rotationSpeed;
      }
    });

    requestAnimationFrame(render);
    orbitControls.update();
    renderer.render(scene, camera);
  }


  console.log("Hello Three.js!!");
});
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
