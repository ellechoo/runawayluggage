//BACKGROUND
document.addEventListener('mousemove', (e) => {
    const background = document.querySelector('.background');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    // Darker colors for the gradient
    const color1 = `rgba(0, 0, 0, 1)`; // Black (fully opaque)
    const color2 = `rgba(0, 7, 50, ${1 - y})`; // Dark Blue
    const color3 = `rgba(0, 10, 100, ${x})`; // Medium Blue
    const color4 = `rgba(0, 5, 130, ${y})`; // Light Blue

    // Yellow patch at the cursor position
    const yellowPatch = `rgba(255, 251, 0, 0.69)`; // Semi-transparent yellow

    // Create the gradient
    const gradient = `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, ${yellowPatch}, transparent 150px),
                      linear-gradient(135deg, ${color1}, ${color2}, ${color3}, ${color4})`;

    // Apply the gradient to the background element
    background.style.background = gradient;
});

//PARTICLES
