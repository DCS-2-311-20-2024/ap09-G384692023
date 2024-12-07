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
    axes: false, // 座標軸
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
  //camera.position.set(0,0,0);
  //camera.position.set(0.5,0.5,0.5);
  //camera.position.set(1,1,1);
  //camera.position.set(-10,10,-15);
  //camera.position.set(15,10,-15);
  camera.lookAt(0,0,0);

  //カメラの設定
  let phi = 0; // 上下の回転（x軸）
  let theta = 0;   // 左右の回転（y軸）


  //視点移動
  const reticle = new THREE.Mesh(
    new THREE.SphereGeometry (0.0005,12,12),
    new THREE.MeshBasicMaterial({ color: 0xffffff }));
  reticle.position.set(
    0,
    0,
    -0.11
  );
  scene.add(reticle);
  document.addEventListener('mousemove', (event) => {
    const sensitivity = 0.002; // マウス感度
    theta -= (event.movementX * sensitivity);  // 左右の回転
    phi -= (event.movementY * sensitivity); // 上下の回転
    // ピッチの制限（首が回りすぎないようにする）
    phi = Math.max(camera.position.y-0.7, Math.min(camera.position.y+0.7, phi));
  });

  updateCamera();//init
  function updateCamera() {
    const radius = 0.11;//半径
    reticle.position.set(
      radius * Math.sin(theta),
      radius * Math.sin(phi),
      radius * Math.cos(theta)
    );
    //console.log(reticle.position.length());
    camera.lookAt(
      reticle.position.x,
      reticle.position.y,
      reticle.position.z
    );
  }

  //クリックされたら視点固定
  document.addEventListener("mousedown", () => {
    document.body.requestPointerLock();
  });
  

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, innerHeight);
    document.getElementById("output").appendChild(renderer.domElement);

  // スコア表示
  let score = 0;
  let life = 0;
  function setScore(score) {
    document.getElementById("score").innerText
    = String(Math.round(score)).padStart(8,"0");
    document.getElementById("life").innerText
    = (life > 0) ? "◯◯◯".substring(0,life):"-- Game 0ver --";
  }

  //平面の作成
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 50),
    new THREE.MeshBasicMaterial({ color: 0x999999 }));
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -1;
  plane.position.z = +20;
  scene.add(plane);

  //天井
  const plane2 = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 50),
    new THREE.MeshBasicMaterial({ color: 0x777777 }));
  plane2.rotation.x = Math.PI / 2;
  plane2.position.y = 9;
  plane2.position.z = +20;
  scene.add(plane2);

  //壁の作成
  const wall1 = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({ color: 0x009943 }));
  wall1.rotation.y = -Math.PI;
  wall1.position.y = 4;
  wall1.position.z = 45;
  scene.add(wall1);

  const wall2 = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 10),
    new THREE.MeshBasicMaterial({ color: 0x008843 }));
  wall2.rotation.y = -Math.PI/2;
  wall2.position.x = 5;
  wall2.position.y = 4;
  wall2.position.z = 20;
  scene.add(wall2);

  const wall3 = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 10),
    new THREE.MeshBasicMaterial({ color: 0x00aa43 }));
  wall3.rotation.y = Math.PI/2;
  wall3.position.x = -5;
  wall3.position.y = 4;
  wall3.position.z = 20;
  scene.add(wall3);

  //銃の生成
  const pistolOver = new THREE.Group;
  const pistol = new THREE.Group;
  const grip = new THREE.Mesh(
    new THREE.BoxGeometry(0.02,0.03,0.07),
    new THREE.MeshBasicMaterial({ color: 0x333333 }));

  grip.rotation.x = -Math.PI / 2.5;
  grip.position.set(0, -0.028, 0);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.021,0.03,0.12),
    new THREE.MeshBasicMaterial({ color: 0x222222 }));
  body.position.z = 0.12/4;

  pistol.add(grip);
  pistol.add(body);
  //銃の場所・向き
  pistol.position.x = - 0.1;
  pistol.position.y = - 0.04;
  pistol.position.z = 0.2;
  /*
  */
  //pistol.rotation.y = Math.PI / 2;

  pistolOver.add(pistol);
  scene.add(pistolOver);
  //scene.add(pistol)


  //銃の動き
  let rotationRecoilVal = 0;//どれだけピストルが上を向いているか
  const recoilVal = -0.3; 
  function fireRecoil(){
    rotationRecoilVal += recoilVal;
    //console.log("a");
  }
  //反動の表現
  function handRecoil(delta){
    const changeAngle = 2;//戻し角(大きければ連射できるようになる)
    //console.log(pistol.rotation.z);
    if((rotationRecoilVal + (changeAngle * delta)) <= 0){
      rotationRecoilVal += (1 * delta);
      //console.log("a");
    }
    else{rotationRecoilVal = 0;
    }
  }
  //どれだけ上を向いているか(リコイル)の度合いで打てるかチェック
  function fireCheck(){
    if((rotationRecoilVal - recoilVal) >= -0.5){
      return true;
    }
    return false;
  }
  //クリックされた時の処理
  window.addEventListener("mousedown", () => {
    if(fireCheck()){
      createBullet();
    }
  }, false);

  //ピストルの向き
  function updatePistolRotation(){
    pistol.rotation.x = rotationRecoilVal;//反動表現
  }
  function updatePistolOverRotation(){
    pistolOver.lookAt(
      reticle.position.x,
      reticle.position.y,
      reticle.position.z
    );
  }


  //弾丸の発射
  let bullets = [];
  function createBullet() {
    const bullet = new THREE.Mesh(
      new THREE.SphereGeometry (0.01,12,12),
      new THREE.MeshBasicMaterial({ color: 0x009999 }));
    
    // カメラの位置から発射される
    bullet.position.copy(camera.position);
    /*
    bullet.position.set(
      firePoint.position.x,
      firePoint.position.y,
      firePoint.position.z
    );
    /*
    */
    
    // カメラの正面方向を弾丸の方向とする
    const direction = new THREE.Vector3();
    pistol.getWorldDirection(direction);
    bullet.userData.direction = direction.clone(); // 弾丸の進行方向を保持
    scene.add(bullet);
    fireRecoil(); 
    bullets.push(bullet);
  }

  // 弾丸を移動させる関数
  function updateBullets(delta) {
    const speed = 10; // 弾丸の移動速度
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      // 移動量を計算
      const moveDistance = speed * delta;
      // 弾丸の移動方向を取得
      const direction = bullet.userData.direction.clone(); // 方向ベクトル
      // 移動方向に距離を掛けて移動量を計算
      const movement = direction.multiplyScalar(moveDistance);
      // 弾丸の位置を更新
      bullet.position.add(movement);
      // 範囲外の弾丸を削除
      if (bullet.position.length() > 10) {
        scene.remove(bullet);
        bullets.splice(i, 1);
      }
    }
  }
  

  //的(メタルロボットの作成)
  let enemies = []; // 敵リスト
  function createEnemy() {
    const enemy = makeMetalRobot();
    enemy.position.set(
      Math.random() * 3 - 1.5,
      Math.random() * 1.5 + 0.5,
      Math.random() * 7 + 3
    );
    scene.add(enemy);
    enemies.push(enemy);
  }
  function makeMetalRobot() {
    // メタルロボットの設定
    const metalRobot = new THREE.Group
    const metalMaterial = new THREE.MeshBasicMaterial({color: 0x222222});
    const metalMaterialHead = new THREE.MeshBasicMaterial({color: 0x660066});
    const redMaterial = new THREE.MeshBasicMaterial({color: 0xc00000});
    const seg = 12; // 円や円柱の分割数
    const gap = 0.005; // 胸のマークなどを浮かせる高さ
    const legRad = 0.025; // 脚の円柱の半径
    const legLen = 0.15; // 脚の円柱の長さ
    const legSep = 0.06; // 脚の間隔
    const bodyW = 0.15; // 胴体の幅
    const bodyH = 0.15; // 胴体の高さ
    const bodyD = 0.1; // 胴体の奥行
    const armRad = 0.02; // 腕の円柱の半径
    const armLen = 0.19; // 腕の円柱の長さ
    const headRad = 0.06; // 頭の半径
    const eyeRad = 0.01; // 目の半径
    const eyeSep = 0.04; // 目の間隔
    const allBody = new THREE.Group;
    //  脚の作成
    const legGeometry
      = new THREE.CylinderGeometry(legRad, legRad, legLen, seg, seg);
    const legR = new THREE.Mesh(legGeometry, metalMaterial);
    legR.position.set(-legSep/2, legLen/2, 0);
    allBody.add(legR);
    const legL = new THREE.Mesh(legGeometry, metalMaterial);
    legL.position.set(legSep/2, legLen/2, 0);
    allBody.add(legL);
    //  胴体の作成
    const bodyGeometry = new THREE.BoxGeometry(bodyW - bodyD,bodyH,bodyD);
    const body = new THREE.Group;
    body.add(new THREE.Mesh(bodyGeometry,metalMaterial));
    const bodyL = new THREE.Mesh(
      new THREE.CylinderGeometry(
        bodyD/2,bodyD/2,bodyH,seg,1,false,0,Math.PI),
        metalMaterial);
    bodyL.position.x = (bodyW - bodyD)/2;
    body.add(bodyL);
    const bodyR = new THREE.Mesh(
      new THREE.CylinderGeometry(
        bodyD/2,bodyD/2,bodyH,seg,1,false,Math.PI,Math.PI),
        metalMaterial);
    bodyR.position.x = -(bodyW - bodyD)/2;
    body.add(bodyR);

    const triangleGeometry = new THREE.BufferGeometry();
    const triangleVertices = new Float32Array( [
      0, 0, bodyD / 2 + gap,
      (bodyW - bodyD) / 2, bodyH / 2, bodyD / 2 + gap,
      -(bodyW - bodyD) / 2, bodyH / 2, bodyD / 2 + gap
    ]);
    triangleGeometry.setAttribute( 'position',
      new THREE.BufferAttribute( triangleVertices,3));
    body.add(new THREE.Mesh(triangleGeometry, redMaterial));

    body.position.y = legLen + bodyH/2;
    allBody.add(body);
    //  腕の作成
    const armGeometry
      = new THREE.CylinderGeometry(armRad, armRad, armLen, seg, seg);
    const armR = new THREE.Mesh(armGeometry, metalMaterial);
    armR.position.set(-(bodyW/2+armRad), legLen + bodyH - armLen/2, 0);
    allBody.add(armR);
    const armL = new THREE.Mesh(armGeometry, metalMaterial);
    armL.position.set(bodyW/2+armRad, legLen + bodyH - armLen/2, 0);
    allBody.add(armL);
    //  頭の作成
    const head = new THREE.Group;
    const headGeometry = new THREE.SphereGeometry (headRad,seg,seg);
    head.add(new THREE.Mesh(headGeometry,metalMaterialHead));

    const circleGeometry = new THREE.CircleGeometry (eyeRad,seg);
    const eyeL = new THREE.Mesh(circleGeometry,redMaterial);

    eyeL.position.set(eyeSep/2,headRad/3,headRad-0.002);
    head.add(eyeL);
    const eyeR = new THREE.Mesh(circleGeometry,redMaterial);
    eyeR.position.set(-eyeSep/2,headRad/3,headRad-0.002);
    head.add(eyeR);
    allBody.position.y = -(legLen + bodyH + headRad);

    metalRobot.add(head);
    metalRobot.add(allBody);
    metalRobot.userData = { allBody, head }; // 衝突判定用に参照を保存

    // 作成結果を戻す
    return metalRobot;
  }

  //敵の移動
  function moveEnemiesTowardsPlayer(playerPosition) {
    for (let i = enemies.length - 1; i >= 0; i--) { // 後ろから順にループ
      const enemy = enemies[i];
  
      // プレイヤーへの方向ベクトルを計算
      const direction = new THREE.Vector3()
        .subVectors(playerPosition, enemy.position)
        .normalize();
  
      // 敵の移動
      enemy.position.addScaledVector(direction, 0.01 + (score*0.00001)); // 速度調整
      enemy.lookAt(camera.position);
  
      // プレイヤーに到達した場合
      if (enemy.position.distanceTo(playerPosition) < 0.01) {
        console.log("Enemy reached the player!");
        life -= 1;
        scene.remove(enemy); // シーンから削除
        enemies.splice(i, 1); // 敵リストから削除
      }
    }
  }
  
  //当たり判定
  const bulletBox = new THREE.Box3();
  const enemyBox = new THREE.Box3();
  function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bulletBox.setFromObject(bullet);
  
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        //enemyBox.setFromObject(enemy);
        const bodyBox = new THREE.Box3().setFromObject(enemy.userData.allBody);
        const headBox = new THREE.Box3().setFromObject(enemy.userData.head);
        if (bulletBox.intersectsBox(headBox)) {
          console.log("Headshot!");
          // ヘッドショット処理
          updateScore(50);
          scene.remove(enemy);
          enemies.splice(j, 1);
  
          scene.remove(bullet);
          bullets.splice(i, 1);
  
          break;

        } else if (bulletBox.intersectsBox(bodyBox)) {
          console.log("Body shot!");
          // 通常ダメージ処理
          updateScore(10);
          scene.remove(enemy);
          enemies.splice(j, 1);
  
          scene.remove(bullet);
          bullets.splice(i, 1);
  
          break;
        }
      }
    }
  }
  //スコア計算
  function updateScore(val) {
    score += val;
    console.log("Score:", score);
  }

  document.addEventListener("mousedown", () => {
    if(life <= 0){
      life = 3;
      score = 0;
      console.log("Life given 3.");
      // 弾丸をリセット
      bullets.forEach(bullet => {
        scene.remove(bullet);
      });
      bullets = [];

      // 敵をリセット
      enemies.forEach(enemy => {
        scene.remove(enemy);
      });
      enemies = [];

      // タイマーのリセット
      enemySpawnClock = 0;
    }
  });

  // 描画処理

  // 描画関数
  const clock = new THREE.Clock(); // 時間の管理
  let enemySpawnClock = 0; // 累積経過時間
  const baseSpawnInterval = 1; // 敵が出現する間隔（秒）
  function render() {
    // 座標軸の表示
    axes.visible = param.axes;
    // 描画
    if(life >= 1){
      let delta = clock.getDelta(); // 経過時間の取得
      enemySpawnClock += delta; // 累積時間を更新
      updateCamera();

      handRecoil(delta);
      updatePistolRotation();
      updatePistolOverRotation();

    // 敵の出現タイミング
    const spawnInterval = Math.max(0.1, baseSpawnInterval - (score * 0.0005)); // スコアに応じて短くする
    if (enemySpawnClock >= spawnInterval) {
      createEnemy();
      enemySpawnClock = 0; // 累積時間をリセット
    }
        
      updateBullets(delta)
      moveEnemiesTowardsPlayer(camera.position);
      checkCollisions();
      
      setScore(score);
    }
    renderer.render(scene, camera);
    // 次のフレームでの描画要請
    requestAnimationFrame(render);
  }

  // 描画開始
  render();
}

init();