import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import GUI from "lil-gui";
import Stats from "three/examples/jsm/libs/stats.module"

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let camera: any;
let orbitControls: OrbitControls;
let stats: Stats;
let clock: THREE.Clock;
let earthTexture: THREE.Texture;
let departureVector: THREE.Vector3;
let arrivalVector: THREE.Vector3;
let normalVector: THREE.Vector3;
let cos: number;
let moveQtn: THREE.Quaternion;
let rotateQtn: THREE.Quaternion;
let returnQtn: THREE.Quaternion;
let goWashington: boolean = true;
let goTokyo: boolean = false;

window.addEventListener("DOMContentLoaded", (): void => {
  load()
  .then(() => {
    init();
  });
});

function load(): Promise<void> {
  return new Promise<void>((resolve): void => {
    const loader = new THREE.TextureLoader();

    const earthPath: string = './assets/earth.jpg';
    const moonPath: string = './assets/moon.jpg';
    loader.load(earthPath, (tmpEarthTexture) => {
      earthTexture = tmpEarthTexture;
      resolve();
    })
  })
}

function init(): void {
  const output: HTMLDivElement | null = document.getElementById("webGL-output") as HTMLDivElement | null;
  const cameraOptions: {
    fovy: number;
    aspect: number;
    near: number;
    far: number;
  } = {
    fovy: 60,
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
  camera.position.set(-200,200,0);
  camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
  orbitControls = new OrbitControls(camera, renderer.domElement);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const axes = new THREE.AxesHelper(100);
  scene.add(axes);

  stats = Stats();
  document.body.appendChild(stats.dom);

  if (output != null) {
    output.appendChild(renderer.domElement);
  }

  // 3次元球のジオメトリ
  const sphereGeometry = new THREE.SphereGeometry(50, 32, 32);

  // 地球
  const earthMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
  // earthMaterial.transparent = true;
  // earthMaterial.opacity = 0.6;
  earthMaterial.map = earthTexture;
  const earth = new THREE.Mesh(sphereGeometry, earthMaterial);
  scene.add(earth);

  // 補助線の立方体
  // const boxGeometry = new THREE.BoxGeometry(100,100,100);
  // const boxMaterial = new THREE.MeshLambertMaterial({color: 0x0000ff});
  // boxMaterial.transparent = true;
  // boxMaterial.opacity = 0.2;
  // const box = new THREE.Mesh(boxGeometry, boxMaterial);
  // scene.add(box);

  // 点のマテリアル
  const pointMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
  pointMaterial.transparent = true;
  pointMaterial.opacity = 0.4;
  // 出発地点
  const departurePoint = new THREE.Mesh(sphereGeometry, pointMaterial);
  scene.add(departurePoint);
  departurePoint.scale.setScalar(0.04);
  // (r=50, θ=222, φ=55)
  departurePoint.position.set(-30.43743015, 28.67882182, -27.4059852);

  // 出発地点の補助点
  const departureRefPoint =  new THREE.Mesh(sphereGeometry, pointMaterial);
  // scene.add(departureRefPoint);
  departureRefPoint.scale.setScalar(0.04);
  departureRefPoint.position.set(-30.43743015, 28.67882182, -27.4059852);

  // 到着地点
  const arrivalPoint = new THREE.Mesh(sphereGeometry, pointMaterial);
  scene.add(arrivalPoint);
  arrivalPoint.scale.setScalar(0.04);
  // (r=50, θ=13, φ=15)
  arrivalPoint.position.set(8.982695001, 30.09075116, 38.90832668);

  // 移動点
  const moveMaterial = new THREE.MeshLambertMaterial({color: 0xffff00});
  const move = new THREE.Mesh(sphereGeometry, moveMaterial);
  scene.add(move);
  move.scale.setScalar(0.01);
  move.position.set(-30.43743015, 28.67882182, -27.4059852);

  // 移動点を補助する原点からの球体
  const moveContainerMaterial = new THREE.MeshBasicMaterial();
  moveContainerMaterial.transparent = true;
  moveContainerMaterial.opacity = 0;
  const moveContainer = new THREE.Mesh(sphereGeometry, moveContainerMaterial);
  scene.add(moveContainer);

  // 移動点を補助球体とグループ化
  const moveGroup = new THREE.Group();
  moveGroup.add(moveContainer);
  moveGroup.add(move);
  scene.add(moveGroup);

  // 地球を回転させるためにグループ化
  const earthGroup = new THREE.Group();
  earthGroup.add(earth);
  earthGroup.add(moveGroup);
  earthGroup.add(departurePoint);
  earthGroup.add(arrivalPoint);
  scene.add(earthGroup);

  // 出発点、到着点、法線のベクトル化
  departureVector = new THREE.Vector3(departurePoint.position.x, departurePoint.position.y, departurePoint.position.z);
  arrivalVector = new THREE.Vector3(arrivalPoint.position.x, arrivalPoint.position.y, arrivalPoint.position.z);
  normalVector = new THREE.Vector3().crossVectors(departureVector.normalize(), arrivalVector.normalize()).normalize();
  
  // 法線を可視化するための点
  // const normalPoint = new THREE.Mesh(sphereGeometry, pointMaterial);
  // scene.add(normalPoint);
  // normalPoint.scale.setScalar(0.06);
  // normalPoint.position.x = normalVector.x * 50;
  // normalPoint.position.y = normalVector.y * 50;
  // normalPoint.position.z = normalVector.z * 50;

  // 移動のクォータニオン
  // 東京-ワシントン
  moveQtn = new THREE.Quaternion().setFromAxisAngle(normalVector, 0.01);
  // ワシントン-東京
  returnQtn = new THREE.Quaternion().setFromAxisAngle(normalVector, -0.01);
  // y軸のベクトル化
  const yVector = new THREE.Vector3(0, 1, 0).normalize();
  // 回転のクォータニオン
  rotateQtn = new THREE.Quaternion().setFromAxisAngle(yVector,  Math.PI / 900);

  // GUIコントロール
  const guiControls: {
    rotation: boolean;
    move: boolean;
  } = {
    rotation : false,
    move : false,
  };

  const gui = new GUI();
  gui.add(guiControls, 'rotation');
  gui.add(guiControls, 'move');

  let count = 0;

  // 移動方向を制御
  function moveDirectionFlag(): void {
    // 現時点での移動点、出発点、到着点のグローバル座標
    let currentPoint = move.getWorldPosition(new THREE.Vector3());
    let currentDeparturePoint = departurePoint.getWorldPosition(new THREE.Vector3());
    let currentArrivalPoint = arrivalPoint.getWorldPosition(new THREE.Vector3());
    // 移動方向と、zx平面での象限によって到着判定を行い、反転
    if (goWashington) { // ワシントン方向ならば
      if (currentPoint.x >= 0 && currentPoint.z >= 0) {
        // 現在地点が第1象限
        if (currentArrivalPoint.x >= 0 && currentArrivalPoint.z >= 0) {
          // かつ到着地点が第1象限
          if (currentPoint.x > currentArrivalPoint.x) {
            goWashington = false;
            goTokyo = true;
            console.log('arrive in Washington 1');
          }
        }
      } else if (currentPoint.x < 0 && currentPoint.z >= 0) {
        // 現在地点が第2象限
        if (currentArrivalPoint.x < 0 && currentArrivalPoint.z >= 0) {
          // かつ到着地点が第2象限
          if (currentPoint.z > currentArrivalPoint.z) {
            goWashington = false;
            goTokyo = true;
            console.log('arrive in Washington 2');
          }
        }
      } else if (currentPoint.x < 0 && currentPoint.z < 0) {
        // 現在地点が第3象限
        if (currentArrivalPoint.x < 0 && currentArrivalPoint.z < 0) {
          // かつ到着地点が第3象限
          if (currentPoint.x < currentArrivalPoint.x) {
            goWashington = false;
            goTokyo = true;
            console.log('arrive in Washington 3');
          }
        }
      } else if (currentPoint.x >= 0 && currentPoint.z < 0) {
        // 現在地点が第4象限
        if (currentArrivalPoint.x >= 0 && currentArrivalPoint.z < 0) {
          // かつ到着地点が第4象限
          if (currentPoint.z < currentArrivalPoint.z) {
            goWashington = false;
            goTokyo = true;
            console.log('arrive in Washington 4');
          }
        }
      } else {
        console.log('error');
      }
    }
    if (goTokyo) { // 東京方向ならば
      if (currentPoint.x >= 0 && currentPoint.z >= 0) {
        // 現在地点が第1象限
        if (currentDeparturePoint.x >= 0 && currentDeparturePoint.z >= 0) {
          // かつ到着地点が第1象限
          if (currentPoint.z > currentDeparturePoint.z) {
            goWashington = true;
            goTokyo = false;
            console.log('arrive in Tokyo 1');
          }
        }
      } else if (currentPoint.x < 0 && currentPoint.z >= 0) {
        // 現在地点が第2象限
        if (currentDeparturePoint.x < 0 && currentDeparturePoint.z >= 0) {
          // かつ到着地点が第2象限
          if (currentPoint.x < currentDeparturePoint.x) {
            goWashington = true;
            goTokyo = false;
            console.log('arrive in Tokyo 2');
          }
        }
      } else if (currentPoint.x < 0 && currentPoint.z < 0) {
        // 現在地点が第3象限
        if (currentDeparturePoint.x < 0 && currentDeparturePoint.z < 0) {
          // かつ到着地点が第3象限
          if (currentPoint.z < currentDeparturePoint.z) {
            goWashington = true;
            goTokyo = false;
            console.log('arrive in Tokyo 3');
          }
        }
      } else if (currentPoint.x >= 0 && currentPoint.z < 0) {
        // 現在地点が第4象限
        if (currentDeparturePoint.x >= 0 && currentDeparturePoint.z < 0) {
          // かつ到着地点が第4象限
          if (currentPoint.x > currentDeparturePoint.x) {
            goWashington = true;
            goTokyo = false;
            console.log('arrive in Tokyo 4');
          }
        }
      } else {
        console.log('error');
      }
    }
  }

  // 象限をコンソールに表示する関数
  function orthant(): void {
    let currentPoint = move.getWorldPosition(new THREE.Vector3());
    let currentDeparturePoint = departurePoint.getWorldPosition(new THREE.Vector3());
    let currentArrivalPoint = arrivalPoint.getWorldPosition(new THREE.Vector3());
    if (currentPoint.x >= 0 && currentPoint.z >= 0) {
      console.log('1');
    } else if (currentPoint.x < 0 && currentPoint.z >= 0) {
      console.log('2');
    } else if (currentPoint.x < 0 && currentPoint.z < 0) {
      console.log('3');
    } else if (currentPoint.x >= 0 && currentPoint.z < 0) {
      console.log('4');
    } else {
      console.log('error');
    }
  }

  // 移動クォータニオンを方向によって切り替えkirikae
  function moveDirection(): void {
    if (goWashington) {
      moveGroup.quaternion.multiply(moveQtn);
    } else if (goTokyo) {
      moveGroup.quaternion.multiply(returnQtn);
    }
  }

  render();

  function render(): void {
    // if (count > 5000) {
    //   count = 0
    // } else {
    //   count += 1
    // }
    // if (count%300 === 0) {
    //   orthant();
    // }

    moveDirectionFlag();

    // GUIコントロールによって移動、回転を制御
    if (guiControls.rotation && guiControls.move) {
      earthGroup.quaternion.multiply(rotateQtn);
      moveDirection();
    } else if (!guiControls.rotation && guiControls.move) {
      moveDirection();
    } else if (guiControls.rotation && !guiControls.move) {
      earthGroup.quaternion.multiply(rotateQtn);
    }

    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
