const preload = () => {
  let manager = new THREE.LoadingManager();
  let typo = null;
  let particle = null;

  manager.onLoad = function() {
    if (typo && particle) {
      new Environment( typo, particle);
    }
  }

  const loader = new THREE.FontLoader(manager);
  loader.load('https://res.cloudinary.com/dydre7amr/raw/upload/v1612950355/font_zsd4dr.json', function (font) {
    typo = font;
  });

  const particleLoader = new THREE.TextureLoader(manager);
  particleLoader.load('https://res.cloudinary.com/dfvtkoboz/image/upload/v1605013866/particle_a64uzf.png', function(texture) {
    particle = texture;
  });
}

// Check if document is ready or load when DOM is complete
if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
  preload();
} else {
  document.addEventListener("DOMContentLoaded", preload);
}



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
      text: 'RUNAWAY\nLUGGAGE',
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

  distance (x1, y1, x2, y2){
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
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

  createText() {
    let thePoints = {};
    let shapes = this.font.generateShapes(this.data.text, this.data.textSize);
    let geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();
    this.initialPositions = positions.slice(); // Store the original positions


    const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
    const yMid = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2.85;

    geometry.center();

    let holeShapes = [];

    for (let q = 0; q < shapes.length; q++) {
      let shape = shapes[q];

      if (shape.holes && shape.holes.length > 0) {
        for (let j = 0; j < shape.holes.length; j++) {
          let hole = shape.holes[j];
          holeShapes.push(hole);
        }
      }
    }
    
    shapes.push.apply(shapes, holeShapes);

    let colors = [];
    let sizes = [];
    let positions = [];

    for (let x = 0; x < shapes.length; x++) {
      let shape = shapes[x];

      const amountPoints = (shape.type == 'Path') ? this.data.amount / 2 : this.data.amount;

      let points = shape.getSpacedPoints(amountPoints);

      points.forEach((element, z) => {
        const a = new THREE.Vector3( element.x, element.y, 0 );
        positions.push(a.x, a.y, a.z);  // Push to the positions array
        sizes.push(1);  // size
        colors.push(this.data.particleColor);
      });
    }

    // geometry for the particle system
    let bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    bufferGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    bufferGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));


    const material = new THREE.PointsMaterial({
      size: this.data.particleSize,
      color: this.data.particleColor,
      map: this.particleImg,
      transparent: true
    });

    // Create the Points object (particle system) and add it to the scene
    this.particles = new THREE.Points(bufferGeometry, material);
    this.scene.add(this.particles);
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


  render(level) {
    if (!this.particles) {
      console.error("Particles not initialized yet!");
      return;
    }

    // Time-based calculations
    const time = ((.001 * performance.now()) % 12) / 12;
    const zigzagTime = (1 + Math.sin(time * 2 * Math.PI)) / 6;

    // Raycast setup
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObject(this.planeArea);

    let mouseDistance = Infinity;

    const pos = this.particles.geometry.attributes.position;
    let colors = this.particles.geometry.attributes.color;
    let size = this.particles.geometry.attributes.size;



    if (intersects.length > 0) {


      const mx = intersects[0].point.x;
      const my = intersects[0].point.y;
      const mz = intersects[0].point.z;

      const copy = new THREE.Vector3();

      for (let i = 0, l = pos.count; i < l; i++) {

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

        

        mouseDistance = this.distance(mx, my, px, py);

        let d = (dx = mx - px) * dx + (dy = my - py) * dy;
        const f = -this.data.area / d;
        
        pos.setXYZ(i, px + dx * f, py + dy * f, pz + dz * f);
        
      }

    }else{
		    	
      if( mouseDistance < this.data.area ){

        if(i%5==0){

         const t = Math.atan2( dy, dx );
          px -= .03 * Math.cos( t );
          py -= .03 * Math.sin( t );

          this.colorChange.setHSL( .15 , 1.0 , .5 )
          colors.setXYZ( i, this.colorChange.r, this.colorChange.g, this.colorChange.b )
          colors.needsUpdate = true;

          size.array[ i ]  =  this.data.particleSize /1.2;
          size.needsUpdate = true;

        }
        
        if (someCondition) { 
          // Particle movement logic
          const t = Math.atan2(dy, dx);
          px += f * Math.cos(t);
          py += f * Math.sin(t);
      
          pos.setXYZ(i, px, py, pz);
          pos.needsUpdate = true;
      
          size.array[i] = this.data.particleSize * 1.3;
          size.needsUpdate = true;

        } else {
          // Easing back to initial position
          px += (initX - px) * this.data.ease;
          py += (initY - py) * this.data.ease;
          pz += (initZ - pz) * this.data.ease;
      
          pos.setXYZ(i, px, py, pz);
          pos.needsUpdate = true;
        }

       if ((px > (initX + 10)) || ( px < (initX - 10)) || (py > (initY + 10) || ( py < (initY - 10)))){
          this.colorChange.setHSL( .15, 1.0 , .5 )
          colors.setXYZ( i, this.colorChange.r, this.colorChange.g, this.colorChange.b )
           colors.needsUpdate = true;

          size.array[ i ]  = this.data.particleSize /1.8;
          size.needsUpdate = true;

        }
      } 
      pos.needsUpdate = true;
    }
  }
}