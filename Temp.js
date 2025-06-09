import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Scene setup
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
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.HemisphereLight(0xffffff, 0x222222, 1.5);
scene.add(light);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.zoomSpeed = 1.0;
controls.minDistance = 30;
controls.maxDistance = 100;

// Environment map for reflections
const envMap = new THREE.CubeTextureLoader()
  .setPath("https://threejs.org/examples/textures/cube/Bridge2/")
  .load([
    "posx.jpg",
    "negx.jpg",
    "posy.jpg",
    "negy.jpg",
    "posz.jpg",
    "negz.jpg",
  ]);
scene.environment = envMap;

// Metal color presets
const metalColors = {
  gold: 0xffd700, // Rich yellow gold (render-friendly)
  rose: 0xb76e79, // Soft warm rose gold (blush tone)
  silver: 0xd9d9d9, // Polished platinum/silver look
  platinum: 0xe5e4e2, // Brighter, slightly cooler silver tone
  whiteGold: 0xe0e0e0, // Neutral white gold tone
};

let currentModel = null;

// Load model
const loader = new GLTFLoader();
const diamondNames = ["Diamond_Pear", "Diamond_Pear_1", "Diamond_Round"];
const diamondColor = new THREE.Color("#e6f7ff"); // realistic icy white-blue

loader.load("./BL-1773.glb", (gltf) => {
  currentModel = gltf.scene;
  currentModel.rotation.x = -Math.PI / 2;
  scene.add(currentModel);

  currentModel.traverse((child) => {
    if (!child.isMesh) return;

    // Diamond setup
    if (diamondNames.includes(child.name)) {
      child.material = new THREE.MeshPhysicalMaterial({
        color: diamondColor,
        metalness: 0.0,
        roughness: 0.05,
        transmission: 0.6,
        thickness: 1.0,
        envMap: envMap,
        envMapIntensity: 1.5,
        clearcoat: 1.0,
        reflectivity: 1.0,
      });
    }

    // Metal default
    if (child.name === "mesh_0") {
      child.material.roughness = 0.1;
      child.material.metalness = 0.5;
      child.material.envMap = envMap;
      child.material.envMapIntensity = 1.0;
    }
  });

  console.log("Model loaded:", currentModel);
});

// Change metal color
window.setMetalColor = function (type) {
  if (!currentModel) return;
  const targetColor = new THREE.Color(metalColors[type]);

  currentModel.traverse((child) => {
    if (child.isMesh && child.name === "mesh_0") {
      if (child.material?.color) {
        child.material.color.copy(targetColor);
        child.material.needsUpdate = true;
      }
    }
  });
};

// Change metal polish level
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

// Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
