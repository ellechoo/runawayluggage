let camera, scene, renderer;
let particles = [];
let particleCount = 2000;
let particleGeometry, particleMaterial, particleSystem;
let isPreloaded = false; // Flag to track preload completion

// Ensure Three.js is loaded
if (typeof THREE === "undefined") {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => console.log("Three.js loaded!");
    document.head.appendChild(script);
}

// Preload function defined before init
function preload() {
    const loader = new THREE.TextureLoader();
    const fontLoader = new THREE.FontLoader();
    console.log("Starting preload...");

    let textureLoaded = false;
    let fontLoaded = false;

    // Load particle texture
    loader.load(
        "https://res.cloudinary.com/dfvtkoboz/image/upload/v1605013866/particle_a64uzf.png",
        function (texture) {
            console.log("Particle texture loaded");

            particleMaterial = new THREE.PointsMaterial({
                size: 0.1,
                map: texture,
                blending: THREE.AdditiveBlending,
                transparent: true,
            });

            textureLoaded = true;
            checkPreloadComplete();
        },
        undefined,
        function (error) {
            console.error("Error loading particle texture:", error);
        }
    );

    // Load font
    fontLoader.load(
        "https://res.cloudinary.com/dydre7amr/raw/upload/v1612950355/font_zsd4dr.json",
        function (font) {
            console.log("Font loaded");

            const textGeometry = new THREE.TextGeometry("Hello, World!", {
                font: font,
                size: 1,
                height: 0.1,
            });

            // Create particles from the text geometry
            const vertices = textGeometry.attributes.position.array;
            for (let i = 0; i < vertices.length; i += 3) {
                const particle = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
                particles.push(particle);
            }

            fontLoaded = true;
            checkPreloadComplete();
        },
        undefined,
        function (error) {
            console.error("Error loading font:", error);
        }
    );
}

// Check if all resources have been loaded
function checkPreloadComplete() {
    if (particleMaterial && particles.length > 0) {
        console.log("All resources loaded, proceeding with animation...");
        isPreloaded = true;

        // Create particle system
        particleGeometry = new THREE.BufferGeometry().setFromPoints(particles);
        particleSystem = new THREE.Points(particleGeometry, particleMaterial);

        // Add particle system to scene
        scene.add(particleSystem);
    }
}

// Initialize the scene
function init() {
    console.log("Initializing scene...");

    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Handle window resizing
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Start loading resources
    preload();
}

// Animation loop
function animate() {
    // Wait for preload to finish
    if (!isPreloaded) {
        requestAnimationFrame(animate);
        console.log("Waiting for preload...");
        return;
    }

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
document.addEventListener("DOMContentLoaded", function () {
    console.log("Document ready, initializing...");
    setTimeout(() => {
        init();
        animate();
    }, 500);
});
