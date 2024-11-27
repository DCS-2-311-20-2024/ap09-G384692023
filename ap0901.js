//
// 応用プログラミング 第9,10回 自由課題 (ap0901.js)
// G384-2023 長田 宙大
//
"use strict"; // 厳格モード

// ライブラリをモジュールとして読み込む
import * as THREE from "three";
import { GUI } from "ili-gui";

// ３Ｄページ作成関数の定義
function init() {
  // 制御変数の定義
  const param = {
    axes: true, // 座標軸
  };

  // GUIコントローラの設定
  const gui = new GUI();
  gui.add(param, "axes").name("座標軸");

  // シーン作成
  const scene = new THREE.Scene();

  // 座標軸の設定
  const axes = new THREE.AxesHelper(18);
  scene.add(axes);

    // 光源の設定
  // 環境ライト
  {
    const light = new THREE.AmbientLight();
    light.intensity=0.8;
    scene.add(light);
  }

  // カメラの作成
  const camera = new THREE.PerspectiveCamera(
    50, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0,0,0);
  //camera.lookAt(0,0,0);

  //カメラの設定
  let pitch = 0; // 上下の回転（x軸）
  let yaw = 0;   // 左右の回転（y軸）

  document.addEventListener('mousemove', (event) => {
    const sensitivity = 0.002; // マウス感度
    yaw -= event.movementX * sensitivity;  // 左右の回転
    pitch -= event.movementY * sensitivity; // 上下の回転
    // ピッチの制限（首が回りすぎないようにする）
    pitch = Math.max(-Math.PI / 10, Math.min(Math.PI / 10, pitch));
  });

  function updateCamera() {
    camera.rotation.x = pitch;  // 上下の回転
    camera.rotation.y = yaw;    // 左右の回転
  }

  document.addEventListener('click', () => {
    document.body.requestPointerLock();
  });
  
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement) {
      //console.log('Pointer locked');
    } else {
      //console.log('Pointer unlocked');
    }
  });

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, innerHeight);
    document.getElementById("output").appendChild(renderer.domElement);



  //平面の作成
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({ color: 0x999999 }));
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -1;
  scene.add(plane);

  //弾丸の作成
  const bullet = new THREE.Mesh(
    new THREE.SphereGeometry (0.01,12,12),
    new THREE.MeshBasicMaterial({ color: 0x009999 }));
  bullet.position.set(0,0.5,0);
  scene.add(bullet);

  //銃の生成
  const pistol = new THREE.Group;
  const grip = new THREE.Mesh(
    new THREE.BoxGeometry(0.08,0.03,0.02),
    new THREE.MeshBasicMaterial({ color: 0x333333 }));
  grip.rotation.z = -Math.PI / 2.5;
  grip.position.set(-0.006, -0.03, 0);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.12,0.03,0.021),
    new THREE.MeshBasicMaterial({ color: 0x222222 }));
  body.position.x = -0.12/4;

  pistol.add(grip);
  pistol.add(body);

  pistol.rotation.y = -Math.PI / 2;
  let rotationRecoilVal = 0;
  function updatePistolPosition(){
    pistol.rotation.set(
      camera.rotation.x,
      camera.rotation.y-Math.PI / 2,
      rotationRecoilVal
    );
  }
    pistol.position.y = camera.position.y - 0.07;
    //pistol.position.x = camera.position.x + 0.1;
    pistol.position.z = camera.position.z - 0.15;
  scene.add(pistol);

  //銃の動き
  const recoilVal = -0.3; 
  function fireRecoil(){
    rotationRecoilVal += recoilVal;
    //console.log("a");
  }
  function handRecoil(delta){
    const changeAngle = 2;
    //console.log(pistol.rotation.z);
    if((rotationRecoilVal + (changeAngle * delta)) <= 0){
      rotationRecoilVal += (1 * delta);
      //console.log("a");
    }
  }
  function fireCheck(){
    if((rotationRecoilVal - recoilVal) >= -0.5){
      return true;
    }
    return false;
  }
  window.addEventListener("mousedown", () => {
    if(fireCheck()){
      fireRecoil(); 
    }
  }, false);


  // 描画処理

  // 描画関数
  const clock = new THREE.Clock(); // 時間の管理
  function render() {
    // 座標軸の表示
    axes.visible = param.axes;
    // 描画
    let delta = clock.getDelta(); // 経過時間の取得
    handRecoil(delta);
    updateCamera();
    updatePistolPosition();
    renderer.render(scene, camera);
    // 次のフレームでの描画要請
    requestAnimationFrame(render);
  }

  // 描画開始
  render();
}

init();