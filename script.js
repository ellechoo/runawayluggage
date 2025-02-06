// Check if document is ready or load when DOM is complete
if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
  preload();
} else {
  document.addEventListener("DOMContentLoaded", preload);
}

// Preload function
const preload = () => {
  let manager = new THREE.LoadingManager();
  manager.onLoad = function() {
    // Once resources are loaded, initialize the environment
    const environment = new Environment(typo, particle);
  }

  var typo = null;
  const loader = new THREE.FontLoader(manager);
  loader.load('https://res.cloudinary.com/dydre7amr/raw/upload/v1612950355/font_zsd4dr.json', function (font) {
    typo = font;
  });

  const particle = new THREE.TextureLoader(manager).load('https://res.cloudinary.com/dfvtkoboz/image/upload/v1605013866/particle_a64uzf.png');
}

// Environment Class
class Environment {
  constructor(font, particle) {
    this.font = font;
    this.particle = particle;
    this.container = document.querySelector('#magic');
    this.scene = new THREE.Scene();
    this.createCamera();
    this.createRenderer();
    this.setup();
    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setup() {
    // Create particles in the scene
    this.createParticles = new CreateParticles(this.scene, this.font, this.particle, this.camera, this.renderer);
  }

  render() {
    // Render particles and scene
    this.createParticles.render();
    this.renderer.render(this.scene, this.camera);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(65, this.container.clientWidth / this.container.clientHeight, 1, 10000);
    this.camera.position.set(0, 0, 100);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);
    this.renderer.setAnimationLoop(() => {
      this.render();
    });
  }

  onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
}