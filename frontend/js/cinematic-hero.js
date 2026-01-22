/**
 * Cinematic Particle Morphing System
 * Renders a high-performance interactive particle system that morphs between
 * scientific structures (DNA, Atom, Sphere) using a custom spring physics engine.
 */

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 2000; // High count for "cloud" effect
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        // Configuration
        this.minZ = 500; // Camera distance
        this.focus = 600; // Focal length
        this.currentColor = { r: 96, g: 165, b: 250 }; // Blue start

        // Shape State
        this.shapes = ['sphere', 'dna', 'lattice'];
        this.currentShapeIndex = 0;
        this.lastMorphTime = 0;
        this.morphInterval = 8000; // Morph every 8 seconds

        // Mouse Interaction
        this.mouseX = 0;
        this.mouseY = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Initialize particles
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle(this.width, this.height));
        }

        // Set initial shape
        this.morphTo('sphere');

        // Start Loop
        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.centerX = this.width * 0.7; // Offset to right for desktop
        this.centerY = this.height / 2;

        if (this.width < 768) {
            this.centerX = this.width / 2;
        }

        // Recalculate current shape targets on resize
        this.morphTo(this.shapes[this.currentShapeIndex]);
    }

    handleMouseMove(e) {
        // Normalize mouse for rotation (-1 to 1)
        const normX = (e.clientX - this.width / 2) / (this.width / 2);
        const normY = (e.clientY - this.height / 2) / (this.height / 2);

        this.targetRotationY = normX * 0.5;
        this.targetRotationX = -normY * 0.5;
    }

    morphTo(shape) {
        let targets = [];

        switch (shape) {
            case 'sphere':
                targets = ShapeGenerator.createSphere(this.particleCount, 300);
                this.targetColor = { r: 96, g: 165, b: 250 }; // Blue
                break;
            case 'dna':
                targets = ShapeGenerator.createDNA(this.particleCount, 200, 500);
                this.targetColor = { r: 244, g: 114, b: 182 }; // Pink
                break;
            case 'lattice':
                targets = ShapeGenerator.createLattice(this.particleCount, 400);
                this.targetColor = { r: 45, g: 212, b: 191 }; // Teal
                break;
        }

        // Assign targets to particles
        for (let i = 0; i < this.particleCount; i++) {
            if (targets[i]) {
                this.particles[i].setTarget(targets[i].x, targets[i].y, targets[i].z);
            }
        }
    }

    updateColor() {
        // Simple linear interpolation specifically for ease
        const speed = 0.02;
        this.currentColor.r += (this.targetColor.r - this.currentColor.r) * speed;
        this.currentColor.g += (this.targetColor.g - this.currentColor.g) * speed;
        this.currentColor.b += (this.targetColor.b - this.currentColor.b) * speed;

        return `rgba(${Math.round(this.currentColor.r)}, ${Math.round(this.currentColor.g)}, ${Math.round(this.currentColor.b)},`;
    }

    animate(timestamp) {
        requestAnimationFrame((t) => this.animate(t));

        // Auto Morph Logic
        if (!this.lastMorphTime) this.lastMorphTime = timestamp;
        if (timestamp - this.lastMorphTime > this.morphInterval) {
            this.currentShapeIndex = (this.currentShapeIndex + 1) % this.shapes.length;
            this.morphTo(this.shapes[this.currentShapeIndex]);
            this.lastMorphTime = timestamp;
        }

        // Smooth Rotation
        this.rotationX += (this.targetRotationX - this.rotationX) * 0.05;
        this.rotationY += (this.targetRotationY - this.rotationY) * 0.05;

        // Add auto rotation
        const autoRotate = timestamp * 0.0002;

        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Particles
        // Global Composite for "Glow"
        this.ctx.globalCompositeOperation = 'lighter'; // Additive blending

        const baseColorStr = this.updateColor();
        this.ctx.fillStyle = baseColorStr + ' 0.8)';

        this.particles.forEach(p => {
            p.update();

            // 3D Projection
            // Rotate Point
            let px = p.x;
            let py = p.y;
            let pz = p.z;

            // Rotate Y
            const cosY = Math.cos(this.rotationY + autoRotate);
            const sinY = Math.sin(this.rotationY + autoRotate);
            let x1 = px * cosY - pz * sinY;
            let z1 = pz * cosY + px * sinY;

            // Rotate X
            const cosX = Math.cos(this.rotationX);
            const sinX = Math.sin(this.rotationX);
            let y1 = py * cosX - z1 * sinX;
            let z2 = z1 * cosX + py * sinX;

            // Project
            const scale = this.focus / (this.focus + z2 + 400); // +400 to push back
            const projX = this.centerX + x1 * scale;
            const projY = this.centerY + y1 * scale;

            // Draw
            if (scale > 0) {
                // Size modulation based on depth
                const size = p.size * scale;
                this.ctx.beginPath();
                this.ctx.arc(projX, projY, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        this.ctx.globalCompositeOperation = 'source-over';
    }
}

class Particle {
    constructor(w, h) {
        // Start random
        this.x = (Math.random() - 0.5) * w;
        this.y = (Math.random() - 0.5) * h;
        this.z = (Math.random() - 0.5) * 500;

        this.tx = 0;
        this.ty = 0;
        this.tz = 0;

        this.vx = 0;
        this.vy = 0;
        this.vz = 0;

        // Physics constants
        this.spring = 0.05 + Math.random() * 0.02; // Randomize slightly for organic feel
        this.friction = 0.9 + Math.random() * 0.04;

        this.size = 1 + Math.random() * 1.5;
    }

    setTarget(x, y, z) {
        this.tx = x;
        this.ty = y;
        this.tz = z;
    }

    update() {
        const dx = this.tx - this.x;
        constDy = this.ty - this.y;
        const dz = this.tz - this.z;

        this.vx += dx * this.spring;
        this.vy += constDy * this.spring;
        this.vz += dz * this.spring;

        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vz *= this.friction;

        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
    }
}

class ShapeGenerator {
    static createSphere(count, radius) {
        const points = [];
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

        for (let i = 0; i < count; i++) {
            const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
            const r = Math.sqrt(1 - y * y); // radius at y
            const theta = phi * i;

            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;

            // Add some noise/fuzziness so it's not a perfect wireframe sphere
            const noise = 0.9 + Math.random() * 0.2;

            points.push({
                x: x * radius * noise,
                y: y * radius * noise,
                z: z * radius * noise
            });
        }
        return points;
    }

    static createDNA(count, radius, height) {
        const points = [];

        for (let i = 0; i < count; i++) {
            // Two strands
            const strand = Math.random() > 0.5 ? 0 : Math.PI;
            const t = (i / count) * 4 * Math.PI; // vertically along the helix
            const y = (i / count - 0.5) * height * 2;

            const x = Math.cos(t + strand) * radius;
            const z = Math.sin(t + strand) * radius;

            // Base pairs connections (fill random interior points)
            if (Math.random() > 0.8) {
                points.push({
                    x: (Math.random() - 0.5) * radius,
                    y: y,
                    z: (Math.random() - 0.5) * radius
                });
            } else {
                points.push({ x, y, z });
            }
        }
        return points;
    }

    static createLattice(count, size) {
        const points = [];
        const side = Math.cbrt(count);
        const spacing = size / side;
        const offset = size / 2;

        for (let i = 0; i < count; i++) {
            // Random scatter relative to a grid
            points.push({
                x: (Math.random() - 0.5) * size * 1.5,
                y: (Math.random() - 0.5) * size * 1.5,
                z: (Math.random() - 0.5) * size * 1.5
            });
        }
        // Actually, let's make a cool torus instead of a lattice for better visuals
        return ShapeGenerator.createTorus(count, 200, 80);
    }

    static createTorus(count, R, r) {
        const points = [];
        for (let i = 0; i < count; i++) {
            const u = Math.random() * Math.PI * 2;
            const v = Math.random() * Math.PI * 2;

            const x = (R + r * Math.cos(v)) * Math.cos(u);
            const y = (R + r * Math.cos(v)) * Math.sin(u);
            const z = r * Math.sin(v);

            points.push({ x, y, z });
        }
        return points;
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem('hero-canvas');
});
