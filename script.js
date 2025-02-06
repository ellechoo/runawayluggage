let camera, scene, renderer;
let particles = []; // Background particles
let topParticles = []; // Top layer particles
let particleCount = 2000;
let particleGeometry, particleMaterial, particleSystem;
let topParticleGeometry, topParticleMaterial, particleSystemTop;
let isPreloaded = false;

// Ensure Three.js is loaded
if (typeof THREE === "undefined") {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => console.log("Three.js loaded!");
    document.head.appendChild(script);
}

// Preload function
function preload() {
    const loader = new THREE.TextureLoader();
    const fontLoader = new THREE.FontLoader();
    console.log("Starting preload...");

    // Load particle texture
    loader.load(
        "https://threejs.org/examples/textures/sprites/circle.png",
        function (texture) {
            console.log("Particle texture loaded");
            particleMaterial = new THREE.PointsMaterial({
                size: 0.1,
                map: texture,
                blending: THREE.AdditiveBlending,
                transparent: true
            });

            // Material for top layer particles
            topParticleMaterial = new THREE.PointsMaterial({
                size: 0.2, // Larger size for top layer
                map: texture,
                blending: THREE.AdditiveBlending,
                transparent: true,
                color: 0xff0000 // Different color for top layer
            });

            checkPreloadComplete();
        },
        undefined,
        function (error) {
            console.error("Error loading particle texture:", error);
        }
    );

    // Load font
    fontLoader.load(
        "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
        function (font) {
            console.log("Font loaded");
            const textGeometry = new THREE.TextGeometry("Hello, World!", {
                font: font,
                size: 1,
                height: 0.1
            });

            // Convert text geometry into particle points for background
            const vertices = textGeometry.attributes.position.array;
            for (let i = 0; i < vertices.length; i += 3) {
                particles.push(new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]));
            }

            // Create random particles for the top layer
            for (let i = 0; i < particleCount; i++) {
                topParticles.push(new THREE.Vector3(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                ));
            }

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
    if (particleMaterial && topParticleMaterial && particles.length > 0 && topParticles.length > 0 && !particleSystem) {
        console.log("All resources loaded, proceeding with animation...");
        isPreloaded = true;

        // Create and add background particle system
        particleGeometry = new THREE.BufferGeometry().setFromPoints(particles);
        particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particleSystem);

        // Create and add top layer particle system
        topParticleGeometry = new THREE.BufferGeometry().setFromPoints(topParticles);
        particleSystemTop = new THREE.Points(topParticleGeometry, topParticleMaterial);
        scene.add(particleSystemTop);
    }
}

// Initialize the scene
function init() {
    console.log("Initializing scene...");

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Handle window resizing
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Handle mouse interaction for top layer particles
    const mouse = new THREE.Vector2();
    window.addEventListener("mousemove", (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Move top layer particles based on mouse position
        const positions = topParticleGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += (mouse.x - positions[i]) * 0.1;
            positions[i + 1] += (mouse.y - positions[i + 1]) * 0.1;
        }
        topParticleGeometry.attributes.position.needsUpdate = true;
    });

    preload();
}

// Animation loop
function animate() {
    if (!isPreloaded) {
        requestAnimationFrame(animate);
        console.log("Waiting for preload...");
        return;
    }

    if (particleSystem) {
        particleSystem.rotation.x += 0.01;
        particleSystem.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Run when the document is ready
document.addEventListener("DOMContentLoaded", function () {
    console.log("Document ready, initializing...");
    setTimeout(() => {
        init();
        animate();
    }, 500);
});