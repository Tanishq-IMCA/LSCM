const canvas = document.getElementById('kinetic-canvas');

// Wait for the DOM to be fully loaded and the canvas to exist
if (canvas) {
    const ctx = canvas.getContext('2d', { alpha: false });

    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    const CONFIG = {
        bgColor: '#08080a',
        dotColor: '#4ade80',
        dotSize: 1.5,
        spacing: 35,
        friction: 0.85,
        ease: 0.1,
        repelForce: 20
    };

    function initCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }

    class Particle {
        constructor(x, y) {
            this.originX = x;
            this.originY = y;
            this.x = x;
            this.y = y;
            this.vx = 0;
            this.vy = 0;
            this.baseAlpha = 0.3 + Math.random() * 0.5;
        }

        draw() {
            ctx.fillStyle = `rgba(74, 222, 128, ${this.baseAlpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, CONFIG.dotSize, 0, Math.PI * 2);
            ctx.fill();
        }

        update() {
            if (mouse.x != null && mouse.y != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let force = (mouse.radius - distance) / mouse.radius;
                    let directionX = forceDirectionX * force * CONFIG.repelForce;
                    let directionY = forceDirectionY * force * CONFIG.repelForce;

                    this.vx -= directionX;
                    this.vy -= directionY;
                }
            }

            this.vx += (this.originX - this.x) * CONFIG.ease;
            this.vy += (this.originY - this.y) * CONFIG.ease;
            this.vx *= CONFIG.friction;
            this.vy *= CONFIG.friction;
            this.x += this.vx;
            this.y += this.vy;

            this.draw();
        }
    }

    function initParticles() {
        particles = [];
        for (let y = 0; y < canvas.height; y += CONFIG.spacing) {
            for (let x = 0; x < canvas.width; x += CONFIG.spacing) {
                particles.push(new Particle(x, y));
            }
        }
    }

    function animate() {
        ctx.fillStyle = CONFIG.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', initCanvas);

    // CRITICAL FIX: Track mouse on the whole window, not just the canvas
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    initCanvas();
    animate();
} else {
    console.error("Kinetic Canvas element not found in DOM.");
}