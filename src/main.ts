import "./style.css";
import { Clawd } from "./Clawd";
import { exportToGLB } from "./Exporter";

const appDiv = document.querySelector<HTMLDivElement>("#app")!;

appDiv.innerHTML = `
  <div id="overlay">
    <h1>Claw'd AR</h1>
    <p>Generating AR Model...</p>
  </div>
`;

async function init() {
  try {
    // 1. Create Claw'd
    const clawd = new Clawd();

    // Scale him up a bit for the viewer? Or keep as is.
    // In model-viewer, auto-rotate and camera-controls handle view.
    // AR placement handles scale.

    // 2. Export to GLB
    const glbUrl = await exportToGLB(clawd.mesh);

    // 3. Inject Model Viewer
    const modelViewer = document.createElement("model-viewer");
    modelViewer.setAttribute("src", glbUrl);
    modelViewer.setAttribute("alt", "A 3D model of Claw'd");
    modelViewer.setAttribute("auto-rotate", "");
    modelViewer.setAttribute("camera-controls", "");
    modelViewer.setAttribute("ar", "");
    modelViewer.setAttribute("ar-modes", "webxr scene-viewer quick-look");
    modelViewer.setAttribute("ar-scale", "auto");
    modelViewer.style.width = "100%";
    modelViewer.style.height = "100%";
    modelViewer.style.backgroundColor = "#242424"; // Match background

    // Clear loading message and append viewer
    appDiv.innerHTML = "";
    appDiv.appendChild(modelViewer);

    // Add title overlay back on top
    const overlay = document.createElement("div");
    overlay.id = "overlay";
    overlay.innerHTML = `<h1>Claw'd AR</h1><p>Tap the icon in the corner to view in your space.</p>`;
    // Allow pointer events to pass through overlay to viewer, except maybe for buttons?
    // Actually model-viewer handles the FAB (floating action button) itself.
    overlay.style.pointerEvents = "none";
    appDiv.appendChild(overlay);
  } catch (e) {
    document.querySelector("#overlay")!.innerHTML = `<h1>Error</h1><p>${e}</p>`;
    console.error(e);
  }
}

init();
