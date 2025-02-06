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

// Check if document is ready or load when DOM is complete
if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
  preload();
} else {
  document.addEventListener("DOMContentLoaded", preload);
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

// CreateParticles Class
class CreateParticles {
  constructor(scene, font, particleImg, camera, renderer) {
    this.scene = scene;
    this.font = font;
    this.particleImg = particleImg;
    this.camera = camera;
    this.renderer = renderer;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-200, 200);
    this.colorChange = new THREE.Color();
    this.buttom = false;

    this.data = {
      text: 'FUTURE\nIS NOW',
      amount: 1500,
      particleSize: 1,
      particleColor: 0xffffff,
      textSize: 16,
      area: 250,
      ease: 0.05,
    };

    this.setup();
    this.bindEvents();
  }

  setup() {
    // Create geometry for the particles based on the font and text
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const sizes = [];
    const colors = [];

    // Create text mesh (particles based on text)
    const textGeometry = new THREE.TextGeometry(this.data.text, {
      font: this.font,
      size: this.data.textSize,
      height: 0.1
    });
    
    const vertices = textGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      positions.push(vertices[i], vertices[i + 1], vertices[i + 2]);
      sizes.push(this.data.particleSize);
      colors.push(this.data.particleColor, this.data.particleColor, this.data.particleColor);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // Create material for the particles
    const material = new THREE.PointsMaterial({
      size: this.data.particleSize,
      vertexColors: true,
      map: this.particleImg,
      transparent: true,
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  bindEvents() {
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('click', this.onClick.bind(this));
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  onClick(event) {
    // Toggle between interactive states (or add more actions)
    this.buttom = !this.buttom;
  }

  render() {
    // Update raycasting and particle system
    this.raycaster.update();
    this.particleSystem.rotation.y += 0.01;
  }
}