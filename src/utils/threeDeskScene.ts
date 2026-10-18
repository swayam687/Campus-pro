import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Pre-allocated scratch objects for zero-GC render loop
const _vec3 = new THREE.Vector3();
const _targetCameraPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3();

export type CameraPreset = 'overview' | 'bag' | 'workout' | 'clock';

export interface SceneController {
  setCameraPreset: (preset: CameraPreset) => void;
  triggerBagPacking: (isPacked: boolean) => void;
  triggerWorkoutCelebration: () => void;
  toggleLamp: () => boolean;
  dispose: () => void;
}

// Procedural Canvas Textures
function createGridCanvasTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  const step = 32;
  for (let x = 0; x <= 512; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

function createKeyboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = '#1e293b';
  const rows = 5;
  const cols = 14;
  const keyW = 28;
  const keyH = 24;
  const pad = 6;
  const startX = 20;
  const startY = 20;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.beginPath();
      ctx.roundRect(startX + c * (keyW + pad), startY + r * (keyH + pad), keyW, keyH, 3);
      ctx.fill();
    }
  }

  // Trackpad
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(176, 175, 160, 70);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  // Background
  const grad = ctx.createLinearGradient(0, 0, 512, 320);
  grad.addColorStop(0, '#020617');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 320);

  // Header
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(0, 0, 512, 40);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('CampusFlow • Mon Schedule', 20, 26);

  // Time slots on screen
  const slots = [
    { time: '09:30 - 10:20', sub: 'Data Structures & Algorithms', color: '#38bdf8' },
    { time: '10:25 - 11:15', sub: 'Operating Systems', color: '#a855f7' },
    { time: '11:30 - 12:20', sub: 'Database Management Systems', color: '#34d399' },
    { time: '13:00 - 14:40', sub: 'DBMS Lab (Hall 108)', color: '#fbbf24' },
  ];

  slots.forEach((s, idx) => {
    const y = 65 + idx * 56;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(20, y, 472, 46);

    ctx.fillStyle = s.color;
    ctx.fillRect(20, y, 6, 46);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText(s.time, 36, y + 20);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(s.sub, 36, y + 38);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function initThreeDeskScene(container: HTMLDivElement): SceneController {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#090d16');
  scene.fog = new THREE.FogExp2('#090d16', 0.035);

  // Camera
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 4.2, 7.5);
  _targetCameraPos.copy(camera.position);
  _targetLookAt.set(0, 0.8, 0);
  _currentLookAt.copy(_targetLookAt);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Mandatory Studio RoomEnvironment with PMREMGenerator
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  pmremGenerator.dispose();

  // Studio Lighting Rig (Key, Fill, Rim, Desk Spot)
  const keyLight = new THREE.DirectionalLight('#fff1db', 2.8);
  keyLight.position.set(4, 7, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 25;
  const d = 5;
  keyLight.shadow.camera.left = -d;
  keyLight.shadow.camera.right = d;
  keyLight.shadow.camera.top = d;
  keyLight.shadow.camera.bottom = -d;
  keyLight.shadow.bias = -0.0004;
  keyLight.shadow.normalBias = 0.02;
  scene.add(keyLight);

  const fillLight = new THREE.HemisphereLight('#60a5fa', '#0f172a', 1.0);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight('#a78bfa', 1.5);
  rimLight.position.set(-5, 4, -4);
  scene.add(rimLight);

  // Desk Lamp Spotlight
  const lampSpot = new THREE.SpotLight('#fef08a', 4.5, 8, Math.PI / 4, 0.45, 1.2);
  lampSpot.position.set(1.8, 2.7, 0.4);
  lampSpot.target.position.set(0.6, 0.75, 0.2);
  lampSpot.castShadow = true;
  lampSpot.shadow.bias = -0.0002;
  scene.add(lampSpot);
  scene.add(lampSpot.target);

  // Floor Grid with procedural texture
  const floorMat = new THREE.MeshStandardMaterial({
    color: '#0b1329',
    roughness: 0.85,
    metalness: 0.1,
  });
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Contact shadow under desk
  const contactCanvas = document.createElement('canvas');
  contactCanvas.width = 128;
  contactCanvas.height = 128;
  const cctx = contactCanvas.getContext('2d')!;
  const radGrad = cctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  radGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  radGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.3)');
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  cctx.fillStyle = radGrad;
  cctx.fillRect(0, 0, 128, 128);

  const contactTex = new THREE.CanvasTexture(contactCanvas);
  const contactMat = new THREE.MeshBasicMaterial({
    map: contactTex,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  const contactPlane = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), contactMat);
  contactPlane.rotation.x = -Math.PI / 2;
  contactPlane.position.y = 0.01;
  scene.add(contactPlane);

  // ==========================================
  // PROCEDURAL MODELS (3-12 PART GROUPS)
  // ==========================================

  // 1. DESK (Composite Group)
  const deskGroup = new THREE.Group();
  deskGroup.position.set(0, 0, 0);

  const woodMat = new THREE.MeshStandardMaterial({
    color: '#7c5836',
    roughness: 0.4,
    metalness: 0.05,
  });
  const metalLegMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.25,
    metalness: 0.85,
  });

  // Tabletop (Part 1)
  const topGeo = new THREE.BoxGeometry(4.2, 0.12, 2.2);
  const deskTop = new THREE.Mesh(topGeo, woodMat);
  deskTop.position.set(0, 1.25, 0);
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  deskGroup.add(deskTop);

  // Desk Legs (Parts 2-5)
  const legPositions = [
    [-1.9, 0.625, -0.9],
    [1.9, 0.625, -0.9],
    [-1.9, 0.625, 0.9],
    [1.9, 0.625, 0.9],
  ];
  legPositions.forEach(([x, y, z]) => {
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.25, 16);
    const leg = new THREE.Mesh(legGeo, metalLegMat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    deskGroup.add(leg);
  });

  // Cross brace (Part 6)
  const braceGeo = new THREE.BoxGeometry(3.8, 0.03, 0.03);
  const brace = new THREE.Mesh(braceGeo, metalLegMat);
  brace.position.set(0, 0.35, -0.9);
  deskGroup.add(brace);

  scene.add(deskGroup);

  // 2. BACKPACK (6-Part Procedural Group)
  const backpackGroup = new THREE.Group();
  backpackGroup.position.set(-1.4, 1.31, 0.2);

  const canvasFabricMat = new THREE.MeshStandardMaterial({
    color: '#334155', // Charcoal Slate
    roughness: 0.75,
    metalness: 0.05,
  });
  const pocketMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.7,
    metalness: 0.05,
  });
  const buckleBrassMat = new THREE.MeshStandardMaterial({
    color: '#d97706',
    roughness: 0.2,
    metalness: 0.95,
  });

  // Part 1: Main body hull
  const packBodyGeo = new THREE.BoxGeometry(0.7, 0.85, 0.45);
  const packBody = new THREE.Mesh(packBodyGeo, canvasFabricMat);
  packBody.position.set(0, 0.45, 0);
  packBody.castShadow = true;
  backpackGroup.add(packBody);

  // Part 2: Front zipped pocket
  const pocketGeo = new THREE.BoxGeometry(0.55, 0.45, 0.16);
  const pocket = new THREE.Mesh(pocketGeo, pocketMat);
  pocket.position.set(0, 0.28, 0.28);
  pocket.castShadow = true;
  backpackGroup.add(pocket);

  // Part 3: Top Flap
  const flapGeo = new THREE.BoxGeometry(0.68, 0.12, 0.48);
  const flap = new THREE.Mesh(flapGeo, canvasFabricMat);
  flap.position.set(0, 0.88, 0.02);
  flap.castShadow = true;
  backpackGroup.add(flap);

  // Part 4 & 5: Straps with brass buckle trim
  const strapGeo = new THREE.BoxGeometry(0.08, 0.75, 0.04);
  const strapL = new THREE.Mesh(strapGeo, canvasFabricMat);
  strapL.position.set(-0.2, 0.45, -0.24);
  backpackGroup.add(strapL);

  const strapR = strapL.clone();
  strapR.position.set(0.2, 0.45, -0.24);
  backpackGroup.add(strapR);

  // Buckle accents
  const buckleGeo = new THREE.BoxGeometry(0.1, 0.05, 0.06);
  const buckle1 = new THREE.Mesh(buckleGeo, buckleBrassMat);
  buckle1.position.set(-0.2, 0.2, -0.24);
  backpackGroup.add(buckle1);
  const buckle2 = buckle1.clone();
  buckle2.position.set(0.2, 0.2, -0.24);
  backpackGroup.add(buckle2);

  // Grab handle (Curved tube)
  const handleCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.12, 0.9, 0),
    new THREE.Vector3(0, 1.05, 0),
    new THREE.Vector3(0.12, 0.9, 0)
  );
  const handleGeo = new THREE.TubeGeometry(handleCurve, 12, 0.02, 8, false);
  const handle = new THREE.Mesh(handleGeo, canvasFabricMat);
  backpackGroup.add(handle);

  scene.add(backpackGroup);

  // 3. STACK OF SUBJECT NOTEBOOKS (4-Part Procedural Group)
  const notebookStackGroup = new THREE.Group();
  notebookStackGroup.position.set(-0.6, 1.31, 0.1);

  const notebookColors = ['#3b82f6', '#10b981', '#8b5cf6']; // Blue (DSA), Emerald (DBMS), Purple (OS)
  const notebookMeshes: THREE.Group[] = [];

  notebookColors.forEach((color, i) => {
    const bookGroup = new THREE.Group();
    bookGroup.position.set(0, i * 0.075, 0);

    const coverMat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.35,
      metalness: 0.1,
    });
    const paperMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.8,
      metalness: 0.0,
    });
    const spineMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.5,
      metalness: 0.2,
    });

    // Pages Block
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.055, 0.75), paperMat);
    pages.castShadow = true;
    pages.receiveShadow = true;
    bookGroup.add(pages);

    // Front & Back Cover
    const coverTop = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.008, 0.77), coverMat);
    coverTop.position.set(0, 0.03, 0);
    coverTop.castShadow = true;
    bookGroup.add(coverTop);

    const coverBottom = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.008, 0.77), coverMat);
    coverBottom.position.set(0, -0.03, 0);
    bookGroup.add(coverBottom);

    // Spine
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.065, 0.77), spineMat);
    spine.position.set(-0.27, 0, 0);
    bookGroup.add(spine);

    // Subtle rotation variation
    bookGroup.rotation.y = (i - 1) * 0.08;

    notebookStackGroup.add(bookGroup);
    notebookMeshes.push(bookGroup);
  });
  scene.add(notebookStackGroup);

  // 4. MINIMALIST LAPTOP (5-Part Procedural Group)
  const laptopGroup = new THREE.Group();
  laptopGroup.position.set(0.35, 1.31, 0.1);
  laptopGroup.rotation.y = -0.15;

  const aluMat = new THREE.MeshStandardMaterial({
    color: '#64748b', // Slate aluminum
    roughness: 0.25,
    metalness: 0.85,
  });

  // Base chassis
  const baseGeo = new THREE.BoxGeometry(0.9, 0.025, 0.65);
  const laptopBase = new THREE.Mesh(baseGeo, aluMat);
  laptopBase.castShadow = true;
  laptopBase.receiveShadow = true;
  laptopGroup.add(laptopBase);

  // Keyboard Surface
  const kbMat = new THREE.MeshBasicMaterial({
    map: createKeyboardTexture(),
  });
  const kbPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.58), kbMat);
  kbPlane.rotation.x = -Math.PI / 2;
  kbPlane.position.set(0, 0.015, 0);
  laptopGroup.add(kbPlane);

  // Hinge
  const hingeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.85, 16);
  const hinge = new THREE.Mesh(hingeGeo, aluMat);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 0.02, -0.32);
  laptopGroup.add(hinge);

  // Screen Lid (Tilted back ~110 degrees)
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0.02, -0.32);
  lidGroup.rotation.x = 0.38; // Tilted back

  const lidBack = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.018), aluMat);
  lidBack.position.set(0, 0.3, 0);
  lidBack.castShadow = true;
  lidGroup.add(lidBack);

  // Glowing Screen showing class timetable
  const screenMat = new THREE.MeshBasicMaterial({
    map: createScreenTexture(),
  });
  const screenPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.56), screenMat);
  screenPlane.position.set(0, 0.3, 0.01);
  lidGroup.add(screenPlane);

  laptopGroup.add(lidGroup);
  scene.add(laptopGroup);

  // 5. ADJUSTABLE DESK LAMP (6-Part Procedural Group)
  const lampGroup = new THREE.Group();
  lampGroup.position.set(1.5, 1.31, -0.4);

  const lampMetal = new THREE.MeshStandardMaterial({
    color: '#0f172a',
    roughness: 0.3,
    metalness: 0.8,
  });
  const brassJoint = new THREE.MeshStandardMaterial({
    color: '#f59e0b',
    roughness: 0.2,
    metalness: 0.9,
  });

  // Lamp base
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.04, 32), lampMetal);
  lampBase.castShadow = true;
  lampGroup.add(lampBase);

  // Joint 1
  const joint1 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 16), brassJoint);
  joint1.position.set(0, 0.06, 0);
  lampGroup.add(joint1);

  // Lower arm
  const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.7, 16), lampMetal);
  arm1.position.set(-0.12, 0.4, 0);
  arm1.rotation.z = 0.35;
  arm1.castShadow = true;
  lampGroup.add(arm1);

  // Mid joint
  const joint2 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 16), brassJoint);
  joint2.position.set(-0.24, 0.73, 0);
  lampGroup.add(joint2);

  // Upper arm
  const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.65, 16), lampMetal);
  arm2.position.set(-0.45, 0.98, 0);
  arm2.rotation.z = -0.7;
  arm2.castShadow = true;
  lampGroup.add(arm2);

  // Lampshade cone
  const shadeGeo = new THREE.ConeGeometry(0.18, 0.3, 24, 1, true);
  const shade = new THREE.Mesh(shadeGeo, lampMetal);
  shade.position.set(-0.7, 1.15, 0);
  shade.rotation.z = 0.85;
  shade.castShadow = true;
  lampGroup.add(shade);

  // Bulb
  const bulbMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), bulbMat);
  bulb.position.set(-0.66, 1.12, 0);
  lampGroup.add(bulb);

  scene.add(lampGroup);

  // 6. STAINLESS WATER BOTTLE (4-Part Procedural Model)
  const bottleGroup = new THREE.Group();
  bottleGroup.position.set(1.15, 1.31, 0.55);

  const steelMat = new THREE.MeshStandardMaterial({
    color: '#94a3b8',
    roughness: 0.15,
    metalness: 0.95,
  });
  const gripSilicone = new THREE.MeshStandardMaterial({
    color: '#0284c7', // Sky Blue grip
    roughness: 0.6,
    metalness: 0.05,
  });

  // Bottle Body
  const bottleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.55, 32), steelMat);
  bottleBody.position.set(0, 0.275, 0);
  bottleBody.castShadow = true;
  bottleGroup.add(bottleBody);

  // Silicone Grip Band
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.103, 0.103, 0.18, 32), gripSilicone);
  grip.position.set(0, 0.26, 0);
  bottleGroup.add(grip);

  // Neck taper
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.08, 32), steelMat);
  neck.position.set(0, 0.59, 0);
  bottleGroup.add(neck);

  // Threaded Cap + Loop
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.08, 32), steelMat);
  cap.position.set(0, 0.66, 0);
  cap.castShadow = true;
  bottleGroup.add(cap);

  scene.add(bottleGroup);

  // 7. 10-MIN WORKOUT CORNER (Dumbbell + Mat)
  const workoutGroup = new THREE.Group();
  workoutGroup.position.set(-1.8, 0.02, 1.2);

  // Exercise Mat
  const matMat = new THREE.MeshStandardMaterial({
    color: '#065f46', // Deep Emerald Gym Mat
    roughness: 0.7,
    metalness: 0.05,
  });
  const matMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.02, 2.4), matMat);
  matMesh.receiveShadow = true;
  workoutGroup.add(matMesh);

  // Dumbbell (5-Part Procedural Group)
  const dumbbellGroup = new THREE.Group();
  dumbbellGroup.position.set(0, 0.14, 0);
  dumbbellGroup.rotation.y = 0.4;

  const chromeMat = new THREE.MeshStandardMaterial({
    color: '#cbd5e1',
    roughness: 0.2,
    metalness: 0.95,
  });
  const plateRubber = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.6,
    metalness: 0.1,
  });

  // Handle
  const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.45, 24), chromeMat);
  handleBar.rotation.z = Math.PI / 2;
  handleBar.castShadow = true;
  dumbbellGroup.add(handleBar);

  // Left Plates
  const plateL1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.045, 6), plateRubber);
  plateL1.rotation.z = Math.PI / 2;
  plateL1.position.set(-0.16, 0, 0);
  plateL1.castShadow = true;
  dumbbellGroup.add(plateL1);

  const plateL2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 6), plateRubber);
  plateL2.rotation.z = Math.PI / 2;
  plateL2.position.set(-0.21, 0, 0);
  plateL2.castShadow = true;
  dumbbellGroup.add(plateL2);

  // Right Plates
  const plateR1 = plateL1.clone();
  plateR1.position.set(0.16, 0, 0);
  dumbbellGroup.add(plateR1);

  const plateR2 = plateL2.clone();
  plateR2.position.set(0.21, 0, 0);
  dumbbellGroup.add(plateR2);

  workoutGroup.add(dumbbellGroup);
  scene.add(workoutGroup);

  // 8. HOLOGRAPHIC SCHEDULE CLOCK RING (Rotating floating orbit)
  const orbitGroup = new THREE.Group();
  orbitGroup.position.set(0, 3.2, 0);

  const ringGeo = new THREE.TorusGeometry(2.2, 0.02, 16, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: '#6366f1',
    transparent: true,
    opacity: 0.4,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.3;
  orbitGroup.add(ring);

  // College hours markers (9:30 AM to 4:30 PM)
  const markerGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
  const markerMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 1.5 - Math.PI * 0.75;
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(Math.cos(angle) * 2.2, Math.sin(angle) * 0.3, Math.sin(angle) * 1.8);
    orbitGroup.add(marker);
  }
  scene.add(orbitGroup);

  // Pre-warm shaders
  renderer.compile(scene, camera);

  // State
  let isBagPacked = false;
  let isWorkoutCelebrating = false;
  let workoutAnimProgress = 0;
  let isLampOn = true;
  let isRunning = true;
  let lastTime = performance.now();

  // Animation Loop with Smooth Exponential Damping
  const animate = (currentTime: number) => {
    if (!isRunning) return;
    requestAnimationFrame(animate);

    const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;

    // Smooth camera damping: 1 - Math.exp(-k * dt)
    const factor = 1 - Math.exp(-4 * delta);
    camera.position.lerp(_targetCameraPos, factor);
    _currentLookAt.lerp(_targetLookAt, factor);
    camera.lookAt(_currentLookAt);

    // Subtle gentle float on holographic schedule ring
    orbitGroup.rotation.y += 0.25 * delta;

    // Bag Packing Animation (smoothly glides notebooks into backpack when packed)
    const bagTargetY = isBagPacked ? 1.6 : 1.31;
    const bagTargetX = isBagPacked ? -1.4 : -0.6;
    notebookStackGroup.position.x += (bagTargetX - notebookStackGroup.position.x) * (5 * delta);
    notebookStackGroup.position.y += (bagTargetY - notebookStackGroup.position.y) * (5 * delta);
    notebookStackGroup.scale.setScalar(
      THREE.MathUtils.lerp(notebookStackGroup.scale.x, isBagPacked ? 0.6 : 1.0, 5 * delta)
    );

    // Workout celebration bounce
    if (isWorkoutCelebrating) {
      workoutAnimProgress += delta * 6;
      dumbbellGroup.position.y = 0.14 + Math.sin(workoutAnimProgress) * 0.25;
      dumbbellGroup.rotation.z = Math.sin(workoutAnimProgress * 1.5) * 0.3;
      if (workoutAnimProgress > Math.PI * 4) {
        isWorkoutCelebrating = false;
        dumbbellGroup.position.y = 0.14;
        dumbbellGroup.rotation.z = 0;
      }
    }

    renderer.render(scene, camera);
  };

  requestAnimationFrame(animate);

  // Resize handler
  const handleResize = () => {
    if (!container) return;
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);

  return {
    setCameraPreset: (preset: CameraPreset) => {
      switch (preset) {
        case 'overview':
          _targetCameraPos.set(0, 4.2, 7.5);
          _targetLookAt.set(0, 0.8, 0);
          break;
        case 'bag':
          _targetCameraPos.set(-1.4, 2.4, 2.5);
          _targetLookAt.set(-1.2, 1.4, 0.2);
          break;
        case 'workout':
          _targetCameraPos.set(-1.8, 1.8, 3.2);
          _targetLookAt.set(-1.8, 0.4, 1.2);
          break;
        case 'clock':
          _targetCameraPos.set(0.4, 2.6, 2.8);
          _targetLookAt.set(0.3, 1.3, 0);
          break;
      }
    },
    triggerBagPacking: (packed: boolean) => {
      isBagPacked = packed;
    },
    triggerWorkoutCelebration: () => {
      isWorkoutCelebrating = true;
      workoutAnimProgress = 0;
    },
    toggleLamp: () => {
      isLampOn = !isLampOn;
      lampSpot.intensity = isLampOn ? 4.5 : 0;
      bulbMat.color.set(isLampOn ? '#fef08a' : '#334155');
      return isLampOn;
    },
    dispose: () => {
      isRunning = false;
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    },
  };
}
