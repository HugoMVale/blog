(function () {
    const CANVAS_ID = 'equilibrium-diacid';
    const NUM_MOLECULES = 35;
    const UPDATE_INTERVAL_MS = 500;
    const COLOR_NON_IONIZED = '#2b8a3e';
    const COLOR_IONIZED = '#e03131';
    const COLOR_BACKBONE = '#495057';

    let canvas = document.getElementById(CANVAS_ID);
    if (!canvas) return;

    let ctx = canvas.getContext('2d');
    let alpha = 0.5;
    let molecules = [];
    let lastUpdate = 0;

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.gap = '12px';
    container.style.margin = '20px 0';

    const sliderContainer = document.createElement('div');
    sliderContainer.style.display = 'flex';
    sliderContainer.style.alignItems = 'center';
    sliderContainer.style.gap = '10px';
    sliderContainer.style.fontFamily = 'sans-serif';
    sliderContainer.style.fontSize = '14px';

    const label = document.createElement('label');
    label.setAttribute('for', 'alpha-slider');
    label.innerHTML = 'Degree of ionization (α): <strong id="alpha-val">0.50</strong>';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'alpha-slider';
    slider.min = '0';
    slider.max = '1';
    slider.step = '0.01';
    slider.value = alpha;

    slider.addEventListener('input', (e) => {
        alpha = parseFloat(e.target.value);
        document.getElementById('alpha-val').textContent = alpha.toFixed(2);
    });

    sliderContainer.appendChild(label);
    sliderContainer.appendChild(slider);

    canvas.parentNode.insertBefore(container, canvas);
    container.appendChild(canvas);
    container.appendChild(sliderContainer);

    function resizeCanvas() {
        const rect = container.getBoundingClientRect();
        const width = Math.min(rect.width, 650);
        const height = 320;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx.scale(dpr, dpr);
        initMolecules(width, height);
    }

    function initMolecules(width, height) {
        molecules = [];
        const maxAttempts = 1000;

        for (let i = 0; i < NUM_MOLECULES; i++) {
            const length = 45 + Math.random() * 15;
            const radius = length / 2 + 6;
            let x, y, overlaps, attempts = 0;

            do {
                x = radius + Math.random() * (width - 2 * radius);
                y = radius + Math.random() * (height - 2 * radius);
                overlaps = false;

                for (let j = 0; j < molecules.length; j++) {
                    const other = molecules[j];
                    const dist = Math.hypot(x - other.x, y - other.y);
                    if (dist < radius + other.radius) {
                        overlaps = true;
                        break;
                    }
                }
                attempts++;
            } while (overlaps && attempts < maxAttempts);

            if (attempts < maxAttempts) {
                molecules.push({
                    x: x,
                    y: y,
                    angle: Math.random() * Math.PI * 2,
                    length: length,
                    radius: radius,
                    waves: 3,
                    leftIonized: Math.random() < alpha,
                    rightIonized: Math.random() < alpha
                });
            }
        }
    }

    function updateStates() {
        molecules.forEach(m => {
            m.leftIonized = Math.random() < alpha;
            m.rightIonized = Math.random() < alpha;
        });
    }

    function drawWavyLine(x1, y1, x2, y2, waves, amplitude) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        const ux = dx / len;
        const uy = dy / len;
        const nx = -uy;
        const ny = ux;

        ctx.beginPath();
        ctx.moveTo(x1, y1);

        const steps = waves * 4;
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const px = x1 + ux * len * t;
            const py = y1 + uy * len * t;
            const side = (i % 2 === 0) ? 0 : (i % 4 === 1 ? 1 : -1);
            const offX = nx * amplitude * side;
            const offY = ny * amplitude * side;

            ctx.lineTo(px + offX, py + offY);
        }

        ctx.strokeStyle = COLOR_BACKBONE;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function render(time) {
        if (time - lastUpdate > UPDATE_INTERVAL_MS) {
            updateStates();
            lastUpdate = time;
        }

        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        ctx.clearRect(0, 0, width, height);

        molecules.forEach(m => {
            const cos = Math.cos(m.angle);
            const sin = Math.sin(m.angle);
            const halfLen = m.length / 2;

            const x1 = m.x - cos * halfLen;
            const y1 = m.y - sin * halfLen;
            const x2 = m.x + cos * halfLen;
            const y2 = m.y + sin * halfLen;

            drawWavyLine(x1, y1, x2, y2, m.waves, 4);

            ctx.beginPath();
            ctx.arc(x1, y1, 5, 0, Math.PI * 2);
            ctx.fillStyle = m.leftIonized ? COLOR_IONIZED : COLOR_NON_IONIZED;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x2, y2, 5, 0, Math.PI * 2);
            ctx.fillStyle = m.rightIonized ? COLOR_IONIZED : COLOR_NON_IONIZED;
            ctx.fill();
        });

        requestAnimationFrame(render);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    requestAnimationFrame(render);
})();