let camera, scene, renderer;
let particles = [];
let particleCount = 2000;
let particleGeometry, particleMaterial, particleSystem;
let isPreloaded = false; // Flag to track preload completion

// Preload function defined before init
function preload() {
    const loader = new THREE.TextureLoader();
    const fontLoader = new THREE.FontLoader();

    // Load particle texture
    loader.load('textures/particle.jpg', function(texture) {
        particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            map: texture,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        // After texture is loaded, check if everything is ready
        checkPreloadComplete();
    });

    // Load font
    fontLoader.load('fonts/helvetiker_regular.typeface.json', function(font) {
        const textGeometry = new THREE.TextGeometry('Hello, World!', {
            font: font,
            size: 1,
            height: 0.1
        });

        // Create particles from the text geometry
        const vertices = textGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const particle = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
            particles.push(particle);
        }

        // Create particle system
        particleGeometry = new THREE.BufferGeometry().setFromPoints(particles);
        particleSystem = new THREE.Points(particleGeometry, particleMaterial);

        // Add particle system to scene
        scene.add(particleSystem);

        // After font is loaded, check if everything is ready
        checkPreloadComplete();
    });
}

// Check if all resources have been loaded
function checkPreloadComplete() {
    if (particleMaterial && particleSystem) {
        isPreloaded = true;
    }
}

// Initialize the scene
function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Start loading resources
    preload();

    // Animation loop
    animate();
}

// Animation loop
function animate() {
    // Wait for preload to finish
    if (!isPreloaded) {
        requestAnimationFrame(animate);
        return;
    }

    // Update particle system
    particleSystem.rotation.x += 0.01;
    particleSystem.rotation.y += 0.01;

    // Render scene
    renderer.render(scene, camera);

    // Request the next frame
    requestAnimationFrame(animate);
}

// Initialize the scene when document is ready
document.addEventListener('DOMContentLoaded', init);
