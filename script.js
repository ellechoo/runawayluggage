//BACKGROUND
document.addEventListener('mousemove', (e) => {
    const background = document.querySelector('.background');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    const color1 = `rgba(0, 0, 0, ${1 - x})`; // Black
    const color2 = `rgba(0, 6, 50, ${1 - y})`; // Dark Blue
    const color3 = `rgba(0, 6, 80, ${x})`; // Medium Blue
    const color4 = `rgba(0, 40, 60, ${y})`; // Green-blue
    const yellowPatch = `rgb(255, 225, 0)`; // Yellow Patch

    const gradient = `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, ${yellowPatch}, transparent 100px),
                      linear-gradient(135deg, ${color1}, ${color2}, ${color3}, ${color4})`;

    background.style.background = gradient;
});

//PARTICLES
