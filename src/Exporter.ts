import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

export async function exportToGLB(scene: THREE.Object3D): Promise<string> {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (gltf) => {
        const output = gltf as ArrayBuffer;
        const blob = new Blob([output], { type: "model/gltf-binary" });
        const url = URL.createObjectURL(blob);
        resolve(url);
      },
      (error) => {
        reject(error);
      },
      { binary: true },
    );
  });
}
