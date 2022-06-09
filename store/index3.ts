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
  renderer.setClearColor(new THREE.Color(0xCCCCCC));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  camera = new THREE.PerspectiveCamera(
    cameraOptions.fovy,
    cameraOptions.aspect,
    cameraOptions.near,
    cameraOptions.far
  );
  camera.position.set(50,50,50);
  camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

  if (output != null) {
    output.appendChild(renderer.domElement);
  }

  let spGroup: THREE.Group;
  let hullMesh;

  generatePoints();

  function generatePoints(): void {
    let points: THREE.Vector3[] = [];
    for (let i = 0; i < 20; i++) {
      let randomX = -15 + Math.round(Math.random() * 30);
      let randomY = -15 + Math.round(Math.random() * 30);
      let randomZ = -15 + Math.round(Math.random() * 30);

      points.push(new THREE.Vector3(randomX, randomY, randomZ));
    }
    spGroup = new THREE.Group();
    let material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({color: 0xff0000,transparent: false});
    points.forEach(point => {
      let spGeom: THREE.SphereGeometry = new THREE.SphereGeometry(0.2);
      let spMesh: THREE.Mesh = new THREE.Mesh(spGeom, material);
      spMesh.position.copy(point);
      spGroup.add(spMesh);
    });

    scene.add(spGroup);

    let hullGeometry: ConvexGeometry = new ConvexGeometry(points);
    hullMesh = createMesh(hullGeometry);
    scene.add(hullMesh);
  }

  function createMesh(geom: ConvexGeometry): THREE.Group {
    let meshMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: false});
    meshMaterial.side = THREE.DoubleSide;
    let wireFrameMat = new THREE.MeshBasicMaterial();
    wireFrameMat.wireframe = true;

    let mesh: THREE.Group = SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat]);

    return mesh;
  }


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
