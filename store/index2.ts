import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let camera: any;
let orbitControls: OrbitControls;

window.addEventListener("DOMContentLoaded", init);

function init(): void {
  const output = document.getElementById("webGL-output") as HTMLDivElement | null;
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(new THREE.Color(0xEEEEEE));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(120,200,180);
  camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

  const planeGeometry = new THREE.PlaneGeometry(180, 180);
  const planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 0;
  plane.position.y = 0;
  plane.position.z = 0;
  scene.add(plane);

  const cubeGeometry = new THREE.BoxGeometry(4,4,4);
  for (let j = 0; j < (planeGeometry.parameters.height / 4); j++) {
    for (let i = 0; i < (planeGeometry.parameters.width / 4); i++) {
      const rnd: number = Math.random() * 0.75 + 0.25;
      const cubeMaterial: THREE.MeshLambertMaterial = new THREE.MeshLambertMaterial();
      cubeMaterial.color = new THREE.Color(0, rnd, 0);
      const cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshLambertMaterial> = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.position.z = -((planeGeometry.parameters.height) / 2) + 2 + (j * 4);
      cube.position.x = -((planeGeometry.parameters.width) / 2) + 2 + (i * 4);
      cube.position.y = 2;

      scene.add(cube);
    }
  }

  const towerGeometry = new THREE.CylinderGeometry(5, 5, 20);
  const towerMaterial = new THREE.MeshPhysicalMaterial({color: 0xcccccc});
  for (let i = 0; i < 5; i++) {
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.receiveShadow = true;
    tower.position.y = 14 + (i * 24);
    scene.add(tower);
  }

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  const ambientLight = new THREE.AmbientLight(0x292929);
  scene.add(ambientLight);
  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(
    50,
    50,
    100
  );
  spotLight.castShadow = true;
  scene.add(spotLight);

  if (output != null) {
    output.appendChild(renderer.domElement);
  }

  orbitControls = new OrbitControls(camera, renderer.domElement);

  const guiControls: {
    perspective: string;
    switchCamera: () => void;
  } = {
    perspective: "Perspective",
    switchCamera: function(): void {
      if(camera instanceof THREE.PerspectiveCamera) {
        camera = new THREE.OrthographicCamera(window.innerWidth / -16, window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -200, 500);
        camera.position.x = 120;
        camera.position.y = 200;
        camera.position.z = 180;
        camera.lookAt(scene.position);
        orbitControls = new OrbitControls(camera, renderer.domElement);
        this.perspective = "Orthographic";
      } else {
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.x = 120;
        camera.position.y = 200;
        camera.position.z = 180;
        camera.lookAt(scene.position);
        orbitControls = new OrbitControls(camera, renderer.domElement);
        this.perspective = "Perspective";
      }
    }
  };

  const gui: GUI = new GUI;
  gui.add( guiControls, 'switchCamera');
  gui.add( guiControls, 'perspective').listen();

  render();

  function render(): void {
    requestAnimationFrame(render);
    orbitControls.update();
    renderer.render(scene, camera);
  }
}
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
