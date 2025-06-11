// === Imports ===
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
controls.minDistance = 40;
controls.maxDistance = 120;
controls.autoRotate = true;

// === Lighting Setup ===
// Key light
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight1.position.set(5, 5, 5);
scene.add(directionalLight1);

// Fill light
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight2.position.set(-5, 5, -5);
scene.add(directionalLight2);

// Rim light / Bottom light
const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight3.position.set(0, -5, 0);
directionalLight3.castShadow = false;
scene.add(directionalLight3);

directionalLight1.color.set(0xfff3cc); // soft warm white
directionalLight2.color.set(0xffeedd);

// === HDRI Environment Map ===
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

// === Material Settings ===
// Metal colors tuned for realistic lighting (3 types only)
const metalColors = {
  gold: 0xffc133, // Warmer, less green // Adjusted to reduce greenish tint (was 0xffc133)
  rose: 0xb76e79, // Soft pink for rose gold
  whiteGold: 0xd3d3d3, // Balanced white tone for white gold
};

// Diamond color settings for realistic attenuation and thickness
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

function isDiamondMesh(name) {
  return name.toLowerCase().startsWith("diamond");
}

function isMetalMesh(name) {
  return name.toLowerCase().startsWith("metal");
}

// === Load and Render Model ===
const loader = new GLTFLoader();
loader.load("./renamed_by_shape.glb", (gltf) => {
  currentModel = gltf.scene;
  currentModel.rotation.x = -Math.PI / 2;
  scene.add(currentModel);
  applyDiamondMaterial(currentDiamondColor, currentDiamondType);
  const loaderDiv = document.getElementById("loader");
  if (loaderDiv) loaderDiv.style.display = "none";
});

// === Apply Materials ===
function applyDiamondMaterial(color, type = "white") {
  if (!currentModel) return;
  const settings = diamondColorSettings[type] || diamondColorSettings.white;

  currentModel.traverse((child) => {
    if (!child.isMesh) return;

    if (isDiamondMesh(child.name)) {
      child.material = new THREE.MeshPhysicalMaterial({
        color: color, // Tint
        transparent: false, // Transparency flag
        metalness: 0.0, // Diamonds are not metallic
        roughness: 0.01, // High polish
        ior: 0.417, // Index of Refraction
        transmission: 1.0, // Full transparency
        thickness: settings.thickness, // Refraction depth
        reflectivity: 0.9, // Reflective surface
        clearcoat: 1.0, // Glossy coat
        clearcoatRoughness: 0.0, // Smooth clearcoat
        attenuationDistance: settings.attenuationDistance, // Depth fade
        attenuationColor: color, // Internal glow color
        envMapIntensity: 5.0, // Reflection strength
        specularIntensity: 1.0, // Highlight strength
        specularColor: new THREE.Color(0xffffff),
        envMap: envMap, // HDR lighting
      });
    } else if (isMetalMesh(child.name)) {
      child.material.roughness = 0.3; // Brushed finish
      child.material.metalness = 1.0; // Full metal
      child.material.envMap = envMap;
      child.material.envMapIntensity = 4.0; // Environment reflection
    }
  });
}

// === UI Controls ===
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

// === Reset All Materials and Controls ===
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

// === Toggle Rotation ===
let isAutoRotate = false;
window.toggleAutoRotate = function () {
  isAutoRotate = !isAutoRotate;
  controls.autoRotate = isAutoRotate;
  controls.update();
};

// === Resize Handler ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Animation Loop ===
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
