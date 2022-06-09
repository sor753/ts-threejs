import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry";
import * as SceneUtils from "three/examples/jsm/utils/SceneUtils";
import GUI from "lil-gui";
import { PlaneGeometry } from "three";

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let camera: any;
let orbitControls: OrbitControls;

window.addEventListener("DOMContentLoaded", init);

function init(): void {
  // 表示要素を取得
  const output: HTMLDivElement | null = document.getElementById("webGL-output") as HTMLDivElement | null;
  // カメラに渡すオプション
  const cameraOptions: {
    fovy: number;
    aspect: number;
    near: number;
    far: number;
  } = {
    fovy: 45,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.01,
    far: 10000,
  };
  // シーンをインスタンス化
  scene = new THREE.Scene();
  // レンダラーをインスタンス化
  renderer = new THREE.WebGLRenderer();
  // レンダラーの背景色を指定
  renderer.setClearColor(new THREE.Color(0xCCCCCC));
  // シーンの大きさをレンダラーに渡す
  renderer.setSize(window.innerWidth, window.innerHeight);
  // レンダラーに影を描画するように設定
  renderer.shadowMap.enabled = true;
  // カメラをインスタンス化
  camera = new THREE.PerspectiveCamera(
    // FIeld Of View カメラの位置から見えるシーンの範囲
    cameraOptions.fovy,
    // 描画範囲のアスペクト比
    cameraOptions.aspect,
    // カメラ側の描画開始位置指定
    cameraOptions.near,
    // カメラと反対側の描画終了位置指定
    cameraOptions.far
  );
  // カメラの位置指定
  camera.position.set(50,50,50);
  // カメラの向き指定
  camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
  // カメラを自由に動かせるように、オービットコントローラをインスタンス化
  orbitControls = new OrbitControls(camera, renderer.domElement);

  // 座標軸をシーンに追加
  const axes = new THREE.AxesHelper(20);
  scene.add(axes);

  // PlaneGeometry ２次元の四角形を描写するジオメトリ 引数は (横幅、高さ、横のセグメント、高さのセグメント)
  const ground = new THREE.PlaneGeometry(100, 100, 50, 50);
  // 指定されたマテリアル用にそれぞれひとつずつメッシュを作成していく 引数は(ジオメトリ、マテリアル)
  const groundMesh = SceneUtils.createMultiMaterialObject(
    ground,
    [
      new THREE.MeshBasicMaterial({wireframe: true, color: 0x000000}),
      new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: 0.5})
    ]
  );
  groundMesh.rotation.x = -0.5 * Math.PI;
  scene.add(groundMesh);

  if (output != null) {
    output.appendChild(renderer.domElement);
  }

  let step: number = 0.03;
  let sphere: THREE.Group;
  let cube: THREE.Group;
  let group: THREE.Group;
  let bboxMesh: THREE.Mesh;

  const guiControls: {
    cubePosX: number;
    cubePosY: number;
    cubePosZ: number;
    spherePosX: number;
    spherePosY: number;
    spherePosZ: number;
    groupPosX: number;
    groupPosY: number;
    groupPosZ: number;
    grouping: boolean;
    rotate: boolean;
    groupScale: number,
    cubeScale: number,
    sphereScale: number,
    redraw: () => void,
    positionBoundingBox: () => void;
  } = {
    cubePosX : 0,
    cubePosY : 3,
    cubePosZ : 10,
    spherePosX : 10,
    spherePosY : 5,
    spherePosZ : 0,
    groupPosX : 10,
    groupPosY : 5,
    groupPosZ : 0,
    grouping : false,
    rotate : false,
    groupScale : 1,
    cubeScale : 1,
    sphereScale : 1,
    redraw : function(): void {
      scene.remove(group);
      sphere = createMesh(new THREE.SphereGeometry(5,10,10));
      cube = createMesh(new THREE.BoxGeometry(6,6,6));
      sphere.position.set(this.spherePosX, this.spherePosY, this.spherePosZ);
      cube.position.set(this.cubePosX, this.cubePosY, this.cubePosZ);
      group = new THREE.Group();
      group.add(sphere);
      group.add(cube);
      scene.add(group);
    },
    positionBoundingBox : function(): void {
      scene.remove(bboxMesh);
      const box = setFromObject(group);
      const width = box.max.x = box.min.x;
      const height = box.max.y - box.min.y;
      const depth = box.max.z - box.min.z;
      const bbox = new THREE.BoxGeometry(width,height,depth);
      bboxMesh = new THREE.Mesh(bbox, new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframeLinewidth: 2,
        wireframe: true
      }));
      bboxMesh.position.x = ((box.min.x + box.max.x) / 2);
      bboxMesh.position.y = ((box.min.y + box.max.y) / 2);
      bboxMesh.position.z = ((box.min.z + box.max.z) / 2);
    }
  }

  const gui: GUI = new GUI;
  const sphereFolder = gui.addFolder("sphere");
  sphereFolder.add(guiControls, "spherePosX", -20, 20).onChange(function(e: number) {
    sphere.position.x = e;
    guiControls.positionBoundingBox()
  });
  sphereFolder.add(guiControls, "spherePosZ", -20, 20).onChange(function (e: number) {
    sphere.position.z = e;
    guiControls.positionBoundingBox()
  });
  sphereFolder.add(guiControls, "spherePosY", -20, 20).onChange(function (e: number) {
      sphere.position.y = e;
      guiControls.positionBoundingBox()
  });
  sphereFolder.add(guiControls, "sphereScale", 0, 3).onChange(function (e: number) {
      sphere.scale.set(e, e, e);
      guiControls.positionBoundingBox()
  });

  const cubeFolder = gui.addFolder("cube");
  cubeFolder.add(guiControls, "cubePosX", -20, 20).onChange(function (e: number) {
      cube.position.x = e;
      guiControls.positionBoundingBox()
  });
  cubeFolder.add(guiControls, "cubePosZ", -20, 20).onChange(function (e: number) {
      cube.position.z = e;
      guiControls.positionBoundingBox()
  });
  cubeFolder.add(guiControls, "cubePosY", -20, 20).onChange(function (e: number) {
      cube.position.y = e;
      guiControls.positionBoundingBox()
  });
  cubeFolder.add(guiControls, "cubeScale", 0, 3).onChange(function (e: number) {
      cube.scale.set(e, e, e);
      guiControls.positionBoundingBox()
  });

  const groupFolder = gui.addFolder("group");
  groupFolder.add(guiControls, "groupPosX", -20, 20).onChange(function (e: number) {
      group.position.x = e;
      guiControls.positionBoundingBox()
  });
  groupFolder.add(guiControls, "groupPosZ", -20, 20).onChange(function (e: number) {
      group.position.z = e;
      guiControls.positionBoundingBox()
  });
  groupFolder.add(guiControls, "groupPosY", -20, 20).onChange(function (e: number) {
      group.position.y = e;
      guiControls.positionBoundingBox()
  });
  groupFolder.add(guiControls, "groupScale", 0, 3).onChange(function (e: number) {
      group.scale.set(e, e, e);
      guiControls.positionBoundingBox()
  });

  gui.add(guiControls, "grouping");
  gui.add(guiControls, "rotate");
  guiControls.redraw();
  render();

  function createMesh(geom: THREE.SphereGeometry | THREE.BoxGeometry): THREE.Group {
    const meshMaterial = new THREE.MeshNormalMaterial();
    meshMaterial.side = THREE.DoubleSide;
    const wireFrameMat = new THREE.MeshBasicMaterial();
    wireFrameMat.wireframe = true;
    const plane = SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat]);
    return plane;
  }

  function render(): void {
    if (guiControls.grouping && guiControls.rotate) {
      group.rotation.y += step;
    }
    if (guiControls.rotate && !guiControls.grouping) {
      sphere.rotation.y += step;
      cube.rotation.y += step;
    }
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  function setFromObject(object: any): THREE.Box3 {
    const box = new THREE.Box3();
    const v1 = new THREE.Vector3();
    object.updateMatrixWorld(true);
    box.makeEmpty();
    object.traverse((node: any) => {
      if (node.geometry !== undefined && node.geometry.vertices !== undefined) {
        const vertices = node.geometry.vertices;
        for (let i = 0; i < vertices.length; i++) {
          v1.copy(vertices[i]);
          v1.applyMatrix4(node.matrixWorld);
          box.expandByPoint(v1);
        }
      }
    })
    return box;
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
