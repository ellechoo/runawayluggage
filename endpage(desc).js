const scale = (a, b, c, d, e) => {
    return (a - b) * (e - d) / (c - b) + d
  }
  const text1 = document.getElementById('text-1')
  const text2 = document.getElementById('text-2')
  const crazy = e => {
    const x = e.clientX || e.touches[0].clientX
    TweenMax.to(text1, .6, {
      attr: {
        startOffset: `${scale(x, 0, window.innerWidth, 0, 75)}%`
      },
      ease: Power3.easeOut,
    })
    TweenMax.to(text2, .8, {
      attr: {
        startOffset: `${scale(x, 0, window.innerWidth, 75, 0)}%`
      },
      ease: Power3.easeOut,
    })
  }
  ['mousemove', 'touchstart', 'touchmove'].forEach(e => {
    window.addEventListener(e, crazy);
  });