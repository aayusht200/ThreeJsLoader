import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js";

// Scene setup
const scene = new THREE.Scene();
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

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.zoomSpeed = 1.0;
controls.minDistance = 50;
controls.maxDistance = 100;

// Lighting
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 1.0);
scene.add(hemiLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Load HDR environment map
new RGBELoader()
  .setDataType(THREE.UnsignedByteType)
  .load(
    "https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr",
    (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture; // for lighting
      scene.background = new THREE.Color(0xffffff); // keep solid white background
    }
  );

const metalColors = {
  gold: 0xffd700,
  rose: 0xb76e79,
  silver: 0xd9d9d9,
  platinum: 0xe5e4e2,
  whiteGold: 0xe0e0e0,
};

let currentModel = null;
const diamondNames = ["Diamond_Pear", "Diamond_Pear_1", "Diamond_Round"];
let currentDiamondColor = new THREE.Color("#e6f7ff");

const loader = new GLTFLoader();
loader.load("./BL-1773.glb", (gltf) => {
  currentModel = gltf.scene;
  currentModel.rotation.x = -Math.PI / 2;
  scene.add(currentModel);

  currentModel.traverse((child) => {
    if (!child.isMesh) return;

    // Diamond setup
    if (diamondNames.includes(child.name)) {
      child.material = new THREE.MeshPhysicalMaterial({
        color: currentDiamondColor, // Base color (typically icy white or light blue for diamonds)
        metalness: 0, // Diamonds are not metallic, keep this at 0
        roughness: 0.05, // Low roughness = shiny surface with sharp reflections
        ior: 3.417, // Index of Refraction for diamond (~2.417 is realistic, 3.417 is exaggerated for effect)
        transmission: 1.0, // Full transparency like glass
        thickness: 1.5, // How deep the light travels inside (affects refraction)
        reflectivity: 1.0, // Maximize reflectivity to simulate sparkle
        clearcoat: 1.0, // Extra reflective clear layer on top
        clearcoatRoughness: 0.0, // Make the clear coat perfectly smooth
        envMapIntensity: 2.0, // Amplify environment reflections for bright sparkle
      });
    }

    // Metal setup
    if (child.name === "mesh_0") {
      child.material.color = new THREE.Color(metalColors.gold);
      child.material.roughness = 0.1;
      child.material.metalness = 0.5;
    }
  });

  console.log("Model loaded:", currentModel);
});

// Change metal color
window.setMetalColor = function (type) {
  if (!currentModel) return;
  const targetColor = new THREE.Color(metalColors[type]);

  currentModel.traverse((child) => {
    if (child.isMesh && child.name === "mesh_0" && child.material?.color) {
      child.material.color.copy(targetColor);
      child.material.needsUpdate = true;
    }
  });
};

// Change metal finish
window.setMetalFinish = function (type) {
  if (!currentModel) return;

  currentModel.traverse((child) => {
    if (child.isMesh && child.name === "mesh_0") {
      if (type === "polished") {
        child.material.roughness = 0.1;
        child.material.metalness = 0.5;
      } else if (type === "brushed") {
        child.material.roughness = 0.8;
        child.material.metalness = 0.5;
      }
      child.material.needsUpdate = true;
    }
  });
};

// Change diamond color
window.setDiamondColor = function (hex) {
  if (!currentModel) return;
  currentDiamondColor = new THREE.Color(hex);

  currentModel.traverse((child) => {
    if (child.isMesh && diamondNames.includes(child.name)) {
      child.material = new THREE.MeshPhysicalMaterial({
        color: currentDiamondColor, // Tint for fancy colored diamonds
        metalness: 0.0, // Non-metallic
        roughness: 0.02, // Ultra-polished surface
        ior: 2.417, // Index of refraction for diamond
        transmission: 1.0, // Full transparency
        thickness: 2.0, // Simulates internal depth
        reflectivity: 0.9, // Strong reflections (max ~1.0)
        clearcoat: 1.0, // Extra shine layer
        clearcoatRoughness: 0.0, // Mirror finish
        attenuationDistance: 0.8, // How deep light tints through (good for color depth)
        attenuationColor: currentDiamondColor, // Matches diamond tint
        envMapIntensity: 3.0, // Brighter sparkle from reflections
      });
    }
  });
};

// Animate
function animate() {
  requestAnimationFrame(animate);
  pointLight.position.x = Math.sin(Date.now() * 0.001) * 3;
  controls.update();
  renderer.render(scene, camera);
}
animate();
