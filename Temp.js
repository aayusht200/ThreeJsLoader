import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js";

// === Scene Setup ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// === Controls ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.zoomSpeed = 1.0;
controls.minDistance = 50;
controls.maxDistance = 100;
controls.autoRotate = true;

// === Lighting ===
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight1.position.set(5, 5, 5);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight2.position.set(-5, 5, -5);
scene.add(directionalLight2);

// === Environment Map ===
let envMap = null;
new RGBELoader()
  .setDataType(THREE.UnsignedByteType)
  .load(
    "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr",
    (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      envMap = texture;
    }
  );

// === Settings ===
const metalColors = {
  gold: 0xf2cc00,
  rose: 0xb76e79,
  silver: 0xd9d9d9,
  platinum: 0xe5e4e2,
  whiteGold: 0xe0e0e0,
};

const diamondColorSettings = {
  white: { hex: "#f5f6f7", attenuationDistance: 0.4, thickness: 2.0 },
  pink: { hex: "#facbf3", attenuationDistance: 0.25, thickness: 2.2 },
  yellow: { hex: "#fffacd", attenuationDistance: 0.3, thickness: 2.0 },
  blue: { hex: "#167d9e", attenuationDistance: 0.2, thickness: 2.5 },
  green: { hex: "#00674F", attenuationDistance: 0.12, thickness: 2.8 },
  champagne: { hex: "#f2d2b6", attenuationDistance: 0.2, thickness: 2.0 },
  cognac: { hex: "#b76e33", attenuationDistance: 0.15, thickness: 2.4 },
};

let currentDiamondColor = new THREE.Color(diamondColorSettings.white.hex);
let currentDiamondType = "white";
let currentModel = null;

// === Helper Functions ===
function isDiamondMesh(name) {
  return name.toLowerCase().startsWith("diamond");
}

function isMetalMesh(name) {
  return name.toLowerCase().startsWith("metal");
}

// === Load Model ===
const loader = new GLTFLoader();
loader.load("./renamed_by_shape.glb", (gltf) => {
  currentModel = gltf.scene;
  currentModel.rotation.x = -Math.PI / 2;
  scene.add(currentModel);
  applyDiamondMaterial(currentDiamondColor, currentDiamondType);

  const loaderDiv = document.getElementById("loader");
  if (loaderDiv) loaderDiv.style.display = "none";

  console.log("Model loaded:", currentModel);
});

// === Apply Material to Diamonds ===
function applyDiamondMaterial(color, type = "white") {
  if (!currentModel) return;
  const settings = diamondColorSettings[type] || diamondColorSettings.white;

  currentModel.traverse((child) => {
    if (!child.isMesh) return;

    if (isDiamondMesh(child.name)) {
      child.material = new THREE.MeshPhysicalMaterial({
        color: color,
        transparent: true,
        metalness: 0.0,
        roughness: 0.02,
        ior: 2.417,
        transmission: 1.0,
        thickness: settings.thickness,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        attenuationDistance: settings.attenuationDistance,
        attenuationColor: color,
        envMapIntensity: 5.0,
        specularIntensity: 1.0,
        specularColor: new THREE.Color(0xffffff),
        envMap: envMap,
      });
    } else if (isMetalMesh(child.name)) {
      child.material.roughness = 0.1;
      child.material.metalness = 0.5;
      child.material.envMap = envMap;
      child.material.envMapIntensity = 1.0;
    } else {
      console.log("Unhandled mesh:", child.name);
    }
  });
}

// === UI Control Functions ===
window.setDiamondColor = function (hex, type = "white") {
  currentDiamondType = type;
  currentDiamondColor = new THREE.Color(hex);
  applyDiamondMaterial(currentDiamondColor, currentDiamondType);
};

window.setMetalColor = function (type) {
  if (!currentModel) return;
  const color = new THREE.Color(metalColors[type]);

  currentModel.traverse((child) => {
    if (child.isMesh && isMetalMesh(child.name)) {
      child.material.color.copy(color);
      child.material.needsUpdate = true;
    }
  });
};

window.setMetalFinish = function (type) {
  if (!currentModel) return;
  currentModel.traverse((child) => {
    if (child.isMesh && isMetalMesh(child.name)) {
      child.material.roughness = type === "polished" ? 0.1 : 0.8;
      child.material.needsUpdate = true;
    }
  });
};

window.resetViewer = function () {
  currentDiamondType = "white";
  currentDiamondColor = new THREE.Color(diamondColorSettings.white.hex);
  applyDiamondMaterial(currentDiamondColor, currentDiamondType);

  const defaultMetalColor = new THREE.Color(metalColors["whiteGold"]);
  if (currentModel) {
    currentModel.traverse((child) => {
      if (child.isMesh && isMetalMesh(child.name)) {
        child.material.color.copy(defaultMetalColor);
        child.material.roughness = 0.1;
        child.material.metalness = 0.5;
        child.material.needsUpdate = true;
      }
    });
  }

  controls.reset();

  const defaultMetal = document.querySelector(
    'input[name="metalColor"][value="whiteGold"]'
  );
  const defaultDiamond = document.querySelector(
    'input[name="stoneColor"][value="white"]'
  );
  if (defaultMetal) defaultMetal.checked = true;
  if (defaultDiamond) defaultDiamond.checked = true;
};

let isAutoRotate = false;
window.toggleAutoRotate = function () {
  isAutoRotate = !isAutoRotate;
  controls.autoRotate = isAutoRotate;
  controls.update();
};

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
