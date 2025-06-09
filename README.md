# ThreeJsLoader

A web-based viewer and utility for displaying, customizing, and renaming 3D jewelry models (GLB format) using Three.js.

## Features

- **GLB Viewer**: View and interact with jewelry models directly in your browser.
- **Customizable Appearance**: Change metal colors (White Gold, Gold, Rose Gold) and gemstone types (various diamond colors).
- **Interactive UI**: Toggle auto-rotation, reset viewer, and easily switch between material and diamond options.
- **GLB Auto-Renamer**: Automatically rename meshes in a GLB by diamond shape or metal for easier identification and material assignment.

## Getting Started

### 1. View a 3D Model

Open `index.html` in your browser.  
- The main viewer loads `renamed_by_shape.glb` by default.
- Use the UI panel to select different metal and diamond colors.
- Use "Toggle Auto-Rotate" or "Reset" to interact with the scene.

### 2. Rename GLB Meshes by Shape

Open `rename-glb.html` in your browser.  
- Upload a `.glb` file.
- The utility will automatically rename diamond and metal meshes based on shape detection.
- The renamed file will download as `renamed_by_shape.glb`.

## Project Structure

- `index.html` — Main 3D viewer interface.
- `Temp.js` — Three.js logic for rendering, controls, and material updates.
- `rename-glb.html` — GLB renaming utility, using Three.js and GLTF utilities.
- `renamed_by_shape.glb` — Example output GLB model with renamed nodes.

## Dependencies

- [Three.js](https://threejs.org/) (via CDN)
- OrbitControls, GLTFLoader, RGBELoader, GLTFExporter (via CDN)

## Customization

Metal and diamond colors are customizable via the UI.  
The code is structured for easy extension to support more materials or features.

## Usage Notes

- Works best in modern browsers supporting ES modules.
- Large GLB files may take some time to load.
- The renaming utility is for offline, local use—no files are uploaded to a server.

## License

MIT License.  
See [LICENSE](LICENSE) for details.

---

*Created by aayusht200. Powered by Three.js.*
