import * as THREE from "three";

export class Clawd {
  mesh: THREE.Group;

  constructor() {
    this.mesh = new THREE.Group();
    this.createModel();
  }

  private createModel() {
    const materialRed = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const materialBlack = new THREE.MeshStandardMaterial({ color: 0x000000 });

    // Body: Large red rectangle
    // Based on image: looks like width > height, somewhat flat depth?
    // Let's guess dimensions: Width 1.2, Height 0.8, Depth 0.4
    const bodyGeo = new THREE.BoxGeometry(1.2, 0.8, 0.4);
    const body = new THREE.Mesh(bodyGeo, materialRed);
    body.position.y = 0.6; // Raise it up so legs can be below
    this.mesh.add(body);

    // Eyes: Black cubes
    // Positioned on the front face
    const eyeSize = 0.15;
    const eyeGeo = new THREE.BoxGeometry(eyeSize, eyeSize, 0.1);

    const leftEye = new THREE.Mesh(eyeGeo, materialBlack);
    leftEye.position.set(-0.3, 0.75, 0.2); // x, y (relative to origin/body center?), z
    // Adjust Y relative to body center which is at 0.6
    // Body center Y=0.6. Top is 0.6 + 0.4 = 1.0.
    // Eye Y=0.75 seems okay.
    // Z needs to be slightly protruding from body front (0.4/2 = 0.2)

    const rightEye = new THREE.Mesh(eyeGeo, materialBlack);
    rightEye.position.set(0.3, 0.75, 0.2);

    this.mesh.add(leftEye);
    this.mesh.add(rightEye);

    // Legs: 4 small red legs
    // Positioned at bottom of body.
    // Body bottom is at 0.6 - 0.4 = 0.2.
    // So legs should go from Y=0 to Y=0.2.
    const legW = 0.15;
    const legH = 0.2;
    const legD = 0.15;
    const legGeo = new THREE.BoxGeometry(legW, legH, legD);

    // Readjusting legs based on Image 1 (Red block with 4 legs)
    // They are spaced out.
    // Let's place them evenly.
    // Body width 1.2. Left -0.6 to Right 0.6.
    // Let's put legs at -0.45, -0.15, 0.15, 0.45

    const legXOffsets = [-0.45, -0.15, 0.15, 0.45];

    legXOffsets.forEach((x) => {
      const leg = new THREE.Mesh(legGeo, materialRed);
      leg.position.set(x, 0.1, 0); // Y center is 0.1 (half height)
      this.mesh.add(leg);
    });

    // Arms: Small blocks on sides.
    // Roughly centered vertically on body?
    // Body Y center 0.6.
    // Stick out from sides (x = +/- 0.6)
    const armW = 0.2;
    const armH = 0.3;
    const armD = 0.2;
    const armGeo = new THREE.BoxGeometry(armW, armH, armD);

    const leftArm = new THREE.Mesh(armGeo, materialRed);
    leftArm.position.set(-0.7, 0.6, 0); // -0.6 (body edge) - 0.1 (half arm width)

    const rightArm = new THREE.Mesh(armGeo, materialRed);
    rightArm.position.set(0.7, 0.6, 0);

    this.mesh.add(leftArm);
    this.mesh.add(rightArm);
  }
}
