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

  visibleWidthAtZDepth(depth, camera) {
    return (depth * 2 * Math.tan(camera.fov * Math.PI / 360));
  }

  visibleHeightAtZDepth(depth, camera) {
    return this.visibleWidthAtZDepth(depth, camera) / camera.aspect;
  }

  setup() {
    // Calculate the visible width and height at z=100 from the camera
    const geometry = new THREE.PlaneGeometry(
      this.visibleWidthAtZDepth(100, this.camera),
      this.visibleHeightAtZDepth(100, this.camera)
    );
    
    // Create a transparent green plane for raycasting
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true });
    this.planeArea = new THREE.Mesh(geometry, material);
    
    // Make the plane invisible in the scene (but still interactable for raycasting)
    this.planeArea.visible = false;
    
    // Add the plane to the scene
    this.scene.add(this.planeArea);
  
    // Create the text or particle system
    this.createText();
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
    // Time-based calculations
    const time = ((.001 * performance.now()) % 12) / 12;
    const zigzagTime = (1 + Math.sin(time * 2 * Math.PI)) / 6;

    // Raycast setup
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObject(this.planeArea);

    if (intersects.length > 0) {

      const pos = this.particles.geometry.attributes.position;


      const mx = intersects[0].point.x;
      const my = intersects[0].point.y;
      const mz = intersects[0].point.z;

      for (let i = 0, l = pos.count; i < l; i++) {
        const initX = copy.getX(i);
        const initY = copy.getY(i);
        const initZ = copy.getZ(i);

        let px = pos.getX(i);
        let py = pos.getY(i);
        let pz = pos.getZ(i);

        this.colorChange.setHSL(0.5, 1, 1);
        colors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
        colors.needsUpdate = true;

        size.array[i] = this.data.particleSize;
        size.needsUpdate = true;

        let dx = mx - px;
        let dy = my - py;
        const dz = mz - pz;

        const mouseDistance = this.distance(mx, my, px, py);
        let d = (dx = mx - px) * dx + (dy = my - py) * dy;
        const f = -this.data.area / d;
        
        pos.setXYZ(i, px + dx * f, py + dy * f, pz + dz * f);
        
      }
      pos.needsUpdate = true;
    }

  }

  // Create the text method (Moved inside the class)
  createText() {
    let thePoints = [];

    let shapes = this.font.generateShapes( this.data.text , this.data.textSize );
    let geometry = new THREE.ShapeGeometry( shapes );
    geometry.computeBoundingBox();

    const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
    const yMid = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2.85;

    geometry.center();

    let holeShapes = [];

    for ( let q = 0; q < shapes.length; q++ ) {
      let shape = shapes[ q ];

      if ( shape.holes && shape.holes.length > 0 ) {
        for ( let j = 0; j < shape.holes.length; j++ ) {
          let hole = shape.holes[ j ];
          holeShapes.push( hole );
        }
      }
    }

    shapes.push.apply( shapes, holeShapes );

    let colors = [];
    let sizes = [];

    for ( let x = 0; x < shapes.length; x++ ) {
      let shape = shapes[ x ];

      const amountPoints = ( shape.type == 'Path') ? this.data.amount / 2 : this.data.amount;

      let points = shape.getSpacedPoints( amountPoints );

      points.forEach( ( element, z ) => {
        const a = new THREE.Vector3( element.x, element.y, 0 );
        thePoints.push( a );
        sizes.push( 1 );
      });
    }
  }
}