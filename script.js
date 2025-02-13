const preload = () => {

	let manager = new THREE.LoadingManager();
	manager.onLoad = function() { 
	  const environment = new Environment( typo, particle );
	}
  
	var typo = null;
	const loader = new THREE.FontLoader( manager );
	const font = loader.load('https://raw.githubusercontent.com/ellechoo/runawayluggage/refs/heads/main/fonts/j%20Jackgo_Regular.json', function ( font ) { typo = font; });
	const particle = new THREE.TextureLoader( manager ).load( 'https://res.cloudinary.com/dfvtkoboz/image/upload/v1605013866/particle_a64uzf.png');
  
  }
  
  if ( document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll))
	preload ();
  else
	document.addEventListener("DOMContentLoaded", preload ); 
  
  class Environment {
  
	constructor( font, particle ){ 
  
	  this.font = font;
	  this.particle = particle;
	  this.container = document.querySelector( '#magic' );
	  this.scene = new THREE.Scene();
	  this.createCamera();
	  this.createRenderer();
	  this.setup()
	  this.bindEvents();
	}
  
	bindEvents(){
  
	  window.addEventListener( 'resize', this.onWindowResize.bind( this ));
	  
	}
  
	setup(){ 
  
	  this.createParticles = new CreateParticles( this.scene, this.font,             this.particle, this.camera, this.renderer );
	}
  
	render() {
	  
	   this.createParticles.render()
	   this.renderer.render( this.scene, this.camera )
	}
  
	createCamera() {
  
	  this.camera = new THREE.PerspectiveCamera( 65, this.container.clientWidth /  this.container.clientHeight, 1, 10000 );
	  this.camera.position.set( 0,0, 100 );
  
	}
  
	createRenderer() {
  
	  this.renderer = new THREE.WebGLRenderer();
	  this.renderer.setSize( this.container.clientWidth, this.container.clientHeight );
  
	  this.renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2));
  
	  this.renderer.outputEncoding = THREE.sRGBEncoding;
	  this.container.appendChild( this.renderer.domElement );
  
	  this.renderer.setAnimationLoop(() => { this.render() })
  
	}
  
	onWindowResize(){
  
	  this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
	  this.camera.updateProjectionMatrix();
	  this.renderer.setSize( this.container.clientWidth, this.container.clientHeight );
  
	}
  }
  
  class CreateParticles {
	  
	  constructor( scene, font, particleImg, camera, renderer ) {
	  
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
			  ease: .05,
		  }
  
		  this.setup();
		  this.bindEvents();
  
	  }
  
  
	  setup(){
  
		  const geometry = new THREE.PlaneGeometry( this.visibleWidthAtZDepth( 100, this.camera ), this.visibleHeightAtZDepth( 100, this.camera ));
		  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent: true } );
		  this.planeArea = new THREE.Mesh( geometry, material );
		  this.planeArea.visible = false;
		  this.createText();
  
	  }
  
	  bindEvents() {
  
		  document.addEventListener( 'mousedown', this.onMouseDown.bind( this ));
		  document.addEventListener( 'mousemove', this.onMouseMove.bind( this ));
		  document.addEventListener( 'mouseup', this.onMouseUp.bind( this ));
		  
	  }
  
	  onMouseDown(){
		  
		  this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		  this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  
		  const vector = new THREE.Vector3( this.mouse.x, this.mouse.y, 0.5);
		  vector.unproject( this.camera );
		  const dir = vector.sub( this.camera.position ).normalize();
		  const distance = - this.camera.position.z / dir.z;
		  this.currenPosition = this.camera.position.clone().add( dir.multiplyScalar( distance ) );
		  
		  const pos = this.particles.geometry.attributes.position;
		  this.buttom = true;
		  this.data.ease = .01;
		  
	  }
  
	  onMouseUp(){
  
		  this.buttom = false;
		  this.data.ease = .05;
	  }
  
	  onMouseMove( ) { 
  
		  this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		  this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  
	  }
  
	  render( level ){ 
  
		  const time = ((.001 * performance.now())%12)/12;
		  const zigzagTime = (1 + (Math.sin( time * 2 * Math.PI )))/6;
  
		  this.raycaster.setFromCamera( this.mouse, this.camera );
  
		  const intersects = this.raycaster.intersectObject( this.planeArea );
  
		  if ( intersects.length > 0 ) {
  
			  const pos = this.particles.geometry.attributes.position;
			  const copy = this.geometryCopy.attributes.position;
			  const coulors = this.particles.geometry.attributes.customColor;
			  const size = this.particles.geometry.attributes.size;
  
			  const mx = intersects[ 0 ].point.x;
			  const my = intersects[ 0 ].point.y;
			  const mz = intersects[ 0 ].point.z;
  
			  for ( var i = 0, l = pos.count; i < l; i++) {
  
				  const initX = copy.getX(i);
				  const initY = copy.getY(i);
				  const initZ = copy.getZ(i);
  
				  let px = pos.getX(i);
				  let py = pos.getY(i);
				  let pz = pos.getZ(i);
  
				  this.colorChange.setHSL( .5, 1 , 1 )
				  coulors.setXYZ( i, this.colorChange.r, this.colorChange.g, this.colorChange.b )
				  coulors.needsUpdate = true;
  
				  size.array[ i ]  = this.data.particleSize;
				  size.needsUpdate = true;
  
				  let dx = mx - px;
				  let dy = my - py;
				  const dz = mz - pz;
  
				  const mouseDistance = this.distance( mx, my, px, py )
				  let d = ( dx = mx - px ) * dx + ( dy = my - py ) * dy;
				  const f = - this.data.area/d;
  
				  if( this.buttom ){ 
  
					  const t = Math.atan2( dy, dx );
					  px -= f * Math.cos( t );
					  py -= f * Math.sin( t );
  
					  this.colorChange.setHSL( .5 + zigzagTime, 1.0 , .5 )
					  coulors.setXYZ( i, this.colorChange.r, this.colorChange.g, this.colorChange.b )
					  coulors.needsUpdate = true;
  
					  if ((px > (initX + 70)) || ( px < (initX - 70)) || (py > (initY + 70) || ( py < (initY - 70)))){
  
						  this.colorChange.setHSL( .15, 1.0 , .5 )
						  coulors.setXYZ( i, this.colorChange.r, this.colorChange.g, this.colorChange.b )
						  coulors.needsUpdate = true;
  
					  }
  
				  }else{
				  
					  if( mouseDistance < this.data.area ){
  
						  if(i%5==0){
  
							  const t = Math.atan2( dy, dx );
							  px -= .03 * Math.cos( t );
							  py -= .03 * Math.sin( t );
  
							  this.colorChange.setHSL( .15 , 1.0 , .5 )
							  coulors.setXYZ( i, this.colorChange.r, this.colorChange.g, this.colorChange.b )
							  coulors.needsUpdate = true;
  
							  size.array[ i ]  =  this.data.particleSize /1.2;
							  size.needsUpdate = true;
  
						  }else{
  
							  const t = Math.atan2( dy, dx );
							  px += f * Math.cos( t );
							  py += f * Math.sin( t );
  
							  pos.setXYZ( i, px, py, pz );
							  pos.needsUpdate = true;
  
							  size.array[ i ]  = this.data.particleSize * 1.3 ;
							  size.needsUpdate = true;
						  }
  
						  if ((px > (initX + 10)) || ( px < (initX - 10)) || (py > (initY + 10) || ( py < (initY - 10)))){
  
							  this.colorChange.setHSL( .15, 1.0 , .5 )
							  coulors.setXYZ( i, this.colorChange.r, this.colorChange.g, this.colorChange.b )
							  coulors.needsUpdate = true;
  
							  size.array[ i ]  = this.data.particleSize /1.8;
							  size.needsUpdate = true;
  
						  }
					  }
  
				  }
  
				  px += ( initX  - px ) * this.data.ease;
				  py += ( initY  - py ) * this.data.ease;
				  pz += ( initZ  - pz ) * this.data.ease;
  
				  pos.setXYZ( i, px, py, pz );
				  pos.needsUpdate = true;
  
			  }
		  }
	  }
  

	  //new
	  createText() {
		let geometry = new THREE.TextGeometry(this.data.text, {
			font: this.font,
			size: this.data.textSize,
			height: 5, // Increased thickness for a filled look
			curveSegments: 10,
			bevelEnabled: false
		});
	
		geometry.computeBoundingBox();
		geometry.computeVertexNormals(); // Helps with shading
	
		// Convert TextGeometry to BufferGeometry to access vertex data
		let bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);
		let positionAttribute = bufferGeometry.attributes.position;
		
		if (!positionAttribute) {
			console.error("Position attribute is undefined. Geometry may not be generated correctly.");
			return;
		}
	
		let numVertices = positionAttribute.count;
		let numParticles = Math.min(10000, numVertices); // Adjust for density
		let thePoints = [];
	
		for (let i = 0; i < numParticles; i++) {
			let index = Math.floor(Math.random() * numVertices); // Random vertex index
			let x = positionAttribute.getX(index);
			let y = positionAttribute.getY(index);
			let z = positionAttribute.getZ(index);
	
			thePoints.push(x, y, z);
		}
	
		let geoParticles = new THREE.BufferGeometry();
		geoParticles.setAttribute('position', new THREE.Float32BufferAttribute(thePoints, 3));
	
		const material = new THREE.ShaderMaterial({
			uniforms: {
				color: { value: new THREE.Color(0xffffff) },
				pointTexture: { value: this.particleImg }
			},
			vertexShader: document.getElementById('vertexshader').textContent,
			fragmentShader: document.getElementById('fragmentshader').textContent,
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true,
		});
	
		this.particles = new THREE.Points(geoParticles, material);
		this.scene.add(this.particles);
	}	
	

	
  
	visibleHeightAtZDepth ( depth, camera ) {
  
		const cameraOffset = camera.position.z;
		if ( depth < cameraOffset ) depth -= cameraOffset;
		else depth += cameraOffset;
  
		const vFOV = camera.fov * Math.PI / 180; 
  
		return 2 * Math.tan( vFOV / 2 ) * Math.abs( depth );
	}
  
	visibleWidthAtZDepth( depth, camera ) {
  
		const height = this.visibleHeightAtZDepth( depth, camera );
		return height * camera.aspect;
  
	}
  
	distance (x1, y1, x2, y2){
		 
		return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
	}
}