let camera, scene, renderer;
let particles = [];
let particleCount = 2000;
let particleGeometry, particleMaterial, particleSystem;

function preload() {
    // Loading manager to ensure all resources are loaded before rendering
    const loader = new THREE.TextureLoader();
    const fontLoader = new THREE.FontLoader();
    const loadingManager = new THREE.LoadingManager();

    // Texture loading
    loader.load('textures/particle.jpg', function(texture) {
        // Initialize particle system when texture is loaded
        particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            map: texture,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
    });

    // Font loading
    fontLoader.load('fonts/helvetiker_regular.typeface.json', function(font) {
        // Text geometry creation when font is loaded
        const textGeometry = new THREE.TextGeometry('Hello, World!', {
            font: font,
            size: 1,
            height: 0.1
        });

        // Create particles based on text geometry
        const vertices = textGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const particle = new THREE.Vector3(vertices[i], vertices[i+1], vertices[i+2]);
            particles.push(particle);
        }

        // Create particle system
        particleGeometry = new THREE.BufferGeometry().setFromPoints(particles);
        particleSystem = new THREE.Points(particleGeometry, particleMaterial);

        // Add particle system to scene
        scene.add(particleSystem);
    });
}

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Preload resources
    preload();

    // Animation loop
    animate();
}

function animate() {
    // Update particle system
    if (particleSystem) {
        particleSystem.rotation.x += 0.01;
        particleSystem.rotation.y += 0.01;
    }

    // Render scene
    renderer.render(scene, camera);

    // Request the next frame
    requestAnimationFrame(animate);
}

// Initialize the scene when document is ready
document.addEventListener('DOMContentLoaded', init);
