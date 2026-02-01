import * as THREE from "three";
import { Clawd } from "./Clawd";

export class ARApp {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private session: XRSession | null = null;
  private reticle: THREE.Mesh;
  private hitTestSource: XRHitTestSource | null = null;
  private hitTestSourceRequested = false;
  private clawd: Clawd;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      20,
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    document.body.appendChild(this.renderer.domElement);

    // Light
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    this.scene.add(light);

    // Reticle
    this.reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xffffff }), // White reticle
    );
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);

    // Clawd
    this.clawd = new Clawd();
    // Initially hide Clawd until placed
    this.clawd.mesh.visible = false;

    // Scale Claw'd down a bit, he might be too big if 1 unit = 1 meter
    // In WebXR, 1 unit = 1 meter.
    // My Claw'd is ~1.2m wide, 1m tall. That's a BIG robot.
    // Let's scale him down to be cute toy size (e.g., 20cm tall).
    this.clawd.mesh.scale.set(0.2, 0.2, 0.2);

    this.scene.add(this.clawd.mesh);

    // Controller events
    const controller = this.renderer.xr.getController(0);
    controller.addEventListener("select", this.onSelect.bind(this));
    this.scene.add(controller);

    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  async init() {
    if ("xr" in navigator) {
      const button = document.createElement("button");
      button.style.display = "none";
      document.body.appendChild(button);

      const isArSupported =
        await navigator.xr?.isSessionSupported("immersive-ar");
      if (isArSupported) {
        button.textContent = "ENTER AR";
        button.style.display = "block";
        button.className = "ar-button"; // logic moved to css
        button.addEventListener("click", this.onButtonClicked.bind(this));
      } else {
        button.textContent = "AR NOT SUPPORTED";
        button.style.display = "block";
        button.disabled = true;
      }
    } else {
      const message = document.createElement("div");
      message.textContent = "WebXR not available";
      document.body.appendChild(message);
    }
  }

  private async onButtonClicked() {
    if (!this.session) {
      const session = await navigator.xr!.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test"],
      });
      session.addEventListener("end", () => {
        this.session = null;
        this.hitTestSource = null;
        this.hitTestSourceRequested = false;
      });

      this.renderer.xr.setReferenceSpaceType("local");
      await this.renderer.xr.setSession(session);
      this.session = session;

      this.renderer.setAnimationLoop(this.render.bind(this));
    }
  }

  private onSelect() {
    if (this.reticle.visible) {
      // Position Clawd at reticle
      // If already placed, just move him? Or maybe spawn multiple?
      // Let's just move him for now to keep it simple.

      // We need to decompose the reticle matrix to set position/quaternion
      this.reticle.matrix.decompose(
        this.clawd.mesh.position,
        this.clawd.mesh.quaternion,
        this.clawd.mesh.scale,
      );

      // Ensure scale is correct (0.2) because decompose might overwrite it if reticle scale is 1
      this.clawd.mesh.scale.set(0.2, 0.2, 0.2);

      this.clawd.mesh.visible = true;
    }
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private render(_timestamp: number, frame: XRFrame) {
    if (frame) {
      const referenceSpace = this.renderer.xr.getReferenceSpace();
      const session = this.renderer.xr.getSession();

      if (this.hitTestSourceRequested === false && session && referenceSpace) {
        // Check if session exists to be safe
        session.requestReferenceSpace("viewer").then((referenceSpace) => {
          session.requestHitTestSource!({ space: referenceSpace })!.then(
            (source) => {
              this.hitTestSource = source;
            },
          );
        });
        session.addEventListener("end", () => {
          this.hitTestSourceRequested = false;
          this.hitTestSource = null;
        });
        this.hitTestSourceRequested = true;
      }

      if (this.hitTestSource && referenceSpace) {
        // Check if referenceSpace exists
        const hitTestResults = frame.getHitTestResults(this.hitTestSource);
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(referenceSpace);

          if (pose) {
            this.reticle.visible = true;
            this.reticle.matrix.fromArray(pose.transform.matrix);
          }
        } else {
          this.reticle.visible = false;
        }
      }
    }
    this.renderer.render(this.scene, this.camera);
  }
}
