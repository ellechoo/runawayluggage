class Environment {
  constructor() {
    this.particles = [];
    this.particleCount = 2000;
    this.isPreloaded = false;
    this.particleGeometry = null;
    this.particleMaterial = null;
    this.particleSystem = null;
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = null;
    this.container = document.querySelector('#magic');
    
    this.preload();
    this.setup();
    this.bindEvents();
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  setup() {
    this.createCamera();
    this.createRenderer();
  }

  bindEvents() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  preload() {
    const loader = new THREE.TextureLoader();
    const fontLoader = new THREE.FontLoader();
    console.log("Starting preload...");

    loader.load(
      "https://threejs.org/examples/textures/sprites/circle.png",
      (texture) => {
        console.log("Particle texture loaded");
        this.particleMaterial = new THREE.PointsMaterial({
          size: 0.1,
          map: texture,
          blending: THREE.AdditiveBlending,
          transparent: true
        });
        this.checkPreloadComplete();
      },
      undefined,
      (error) => {
        console.error("Error loading particle texture:", error);
      }
    );

    fontLoader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font) => {
        console.log("Font loaded");
        const textGeometry = new THREE.TextGeometry("Hello, World!", {
          font: font,
          size: 1,
          height: 0.1
        });

        const vertices = textGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
          this.particles.push(new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]));
        }
        this.checkPreloadComplete();
      },
      undefined,
      (error) => {
        console.error("Error loading font:", error);
      }
    );
  }

  checkPreloadComplete() {
    if (this.particleMaterial && this.particles.length > 0 && !this.particleSystem) {
      console.log("All resources loaded, proceeding with animation...");
      this.isPreloaded = true;

      // Create and add particle system
      this.particleGeometry = new THREE.BufferGeometry().setFromPoints(this.particles);
      this.particleSystem = new THREE.Points(this.particleGeometry, this.particleMaterial);
      this.scene.add(this.particleSystem);
    }
  }

  animate() {
    if (!this.isPreloaded) {
      requestAnimationFrame(this.animate.bind(this));
      console.log("Waiting for preload...");
      return;
    }

    if (this.particleSystem) {
      this.particleSystem.rotation.x += 0.01;
      this.particleSystem.rotation.y += 0.01;
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));
  }
}

// Run when the document is ready
document.addEventListener("DOMContentLoaded", function () {
  console.log("Document ready, initializing...");
  setTimeout(() => {
    const env = new Environment();
    env.animate();
  }, 500);
});
