import * as THREE from 'three';

/**
 * STUNNING HOMEPAGE VISUALIZATION
 * 
 * Beautiful, captivating experience with:
 * - Flowing Lorenz Attractor (mathematical beauty)
 * - Elegant particle constellation
 * - Color palette: Deep blues, purples, soft pinks (matching original design)
 * 
 * Creates instant "WOW" effect while maintaining elegance.
 */

class StunningCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Deep dark background matching original
        this.renderer.setClearColor(0x0a0a1a, 1);

        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 40;

        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2(0, 0);
        this.targetMouse = new THREE.Vector2(0, 0);

        this.init();
        this.addListeners();
        this.animate();
    }

    init() {
        // === LORENZ ATTRACTOR - Mathematical Beauty ===
        this.createLorenzAttractor();

        // === FLOATING PARTICLES - Ambient Magic ===
        this.createFloatingParticles();

        // === CONNECTING LINES - Neural Network Feel ===
        this.createConnectionNetwork();

        // === AMBIENT GLOW SPHERES ===
        this.createGlowSpheres();

        // === LIGHTING ===
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x60a5fa, 2, 100);
        pointLight1.position.set(20, 20, 20);
        this.scene.add(pointLight1);
        this.light1 = pointLight1;

        const pointLight2 = new THREE.PointLight(0xa78bfa, 1.5, 100);
        pointLight2.position.set(-20, -10, 20);
        this.scene.add(pointLight2);
        this.light2 = pointLight2;

        const pointLight3 = new THREE.PointLight(0xf472b6, 1, 80);
        pointLight3.position.set(0, -20, 30);
        this.scene.add(pointLight3);
    }

    createLorenzAttractor() {
        // Lorenz system parameters
        const sigma = 10;
        const rho = 28;
        const beta = 8 / 3;
        const dt = 0.005;
        const numPoints = 15000;

        const positions = [];
        const colors = [];
        let x = 0.1, y = 0, z = 0;

        for (let i = 0; i < numPoints; i++) {
            const dx = sigma * (y - x) * dt;
            const dy = (x * (rho - z) - y) * dt;
            const dz = (x * y - beta * z) * dt;
            x += dx;
            y += dy;
            z += dz;

            // Scale and position
            positions.push(x * 0.6, y * 0.6, (z - 25) * 0.6);

            // Beautiful gradient: Blue → Purple → Pink
            const t = i / numPoints;
            let r, g, b;

            if (t < 0.5) {
                // Blue to Purple
                const localT = t * 2;
                r = 0.37 + localT * 0.28; // 0.37 → 0.65
                g = 0.65 - localT * 0.1;  // 0.65 → 0.55
                b = 0.98 - localT * 0.25; // 0.98 → 0.73
            } else {
                // Purple to Pink
                const localT = (t - 0.5) * 2;
                r = 0.65 + localT * 0.31; // 0.65 → 0.96
                g = 0.55 - localT * 0.1;  // 0.55 → 0.45
                b = 0.73 + localT * 0.05; // 0.73 → 0.78
            }
            colors.push(r, g, b);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.12,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.lorenz = new THREE.Points(geometry, material);
        this.scene.add(this.lorenz);
    }

    createFloatingParticles() {
        const particleCount = 800;
        const positions = [];
        const colors = [];
        const sizes = [];

        for (let i = 0; i < particleCount; i++) {
            // Spread particles around the scene
            const radius = 30 + Math.random() * 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi) - 20
            );

            // Color variation: whites, light blues, soft purples
            const colorChoice = Math.random();
            if (colorChoice < 0.5) {
                // White/light blue
                colors.push(0.9, 0.95, 1.0);
            } else if (colorChoice < 0.8) {
                // Soft blue
                colors.push(0.6, 0.75, 0.98);
            } else {
                // Soft purple
                colors.push(0.75, 0.6, 0.95);
            }

            sizes.push(Math.random() * 0.5 + 0.1);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.4,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.particlePositions = positions.slice();
        this.scene.add(this.particles);
    }

    createConnectionNetwork() {
        // Create elegant connection lines
        const nodeCount = 50;
        const nodes = [];

        for (let i = 0; i < nodeCount; i++) {
            const radius = 15 + Math.random() * 25;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            nodes.push(new THREE.Vector3(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi) - 15
            ));
        }

        const linePositions = [];
        const maxDist = 20;

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (nodes[i].distanceTo(nodes[j]) < maxDist) {
                    linePositions.push(
                        nodes[i].x, nodes[i].y, nodes[i].z,
                        nodes[j].x, nodes[j].y, nodes[j].z
                    );
                }
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

        const material = new THREE.LineBasicMaterial({
            color: 0x60a5fa,
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending
        });

        this.connections = new THREE.LineSegments(geometry, material);
        this.scene.add(this.connections);
        this.connectionNodes = nodes;
    }

    createGlowSpheres() {
        // Subtle glowing spheres for ambient light effect
        this.glowSpheres = [];
        const sphereData = [
            { pos: [25, 15, -30], color: 0x60a5fa, size: 4 },
            { pos: [-20, -10, -25], color: 0xa78bfa, size: 3 },
            { pos: [10, -20, -35], color: 0xf472b6, size: 2.5 },
        ];

        sphereData.forEach((data, i) => {
            const geometry = new THREE.SphereGeometry(data.size, 32, 32);
            const material = new THREE.MeshBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.15,
                blending: THREE.AdditiveBlending
            });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(...data.pos);
            sphere.userData = { basePos: data.pos.slice(), phase: i * Math.PI * 0.5 };
            this.glowSpheres.push(sphere);
            this.scene.add(sphere);

            // Outer glow
            const glowGeo = new THREE.SphereGeometry(data.size * 2, 16, 16);
            const glowMat = new THREE.MeshBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.05,
                blending: THREE.AdditiveBlending
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.copy(sphere.position);
            this.scene.add(glow);
        });
    }

    addListeners() {
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => {
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
    }

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        // Smooth mouse
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.03;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.03;

        // === ANIMATE LORENZ ===
        if (this.lorenz) {
            this.lorenz.rotation.y = time * 0.08;
            this.lorenz.rotation.x = Math.sin(time * 0.15) * 0.15;
            this.lorenz.rotation.z = Math.cos(time * 0.1) * 0.05;
        }

        // === ANIMATE PARTICLES ===
        if (this.particles) {
            this.particles.rotation.y = time * 0.015;
            this.particles.rotation.x = Math.sin(time * 0.08) * 0.03;
        }

        // === ANIMATE CONNECTIONS ===
        if (this.connections) {
            this.connections.rotation.y = time * 0.02;
            this.connections.rotation.z = Math.sin(time * 0.1) * 0.02;
        }

        // === ANIMATE GLOW SPHERES ===
        this.glowSpheres.forEach((sphere, i) => {
            const phase = sphere.userData.phase;
            sphere.position.y = sphere.userData.basePos[1] + Math.sin(time * 0.5 + phase) * 3;
            sphere.scale.setScalar(1 + Math.sin(time + phase) * 0.1);
        });

        // === ANIMATE LIGHTS ===
        if (this.light1) {
            this.light1.position.x = Math.sin(time * 0.3) * 25;
            this.light1.position.z = Math.cos(time * 0.3) * 25 + 10;
        }
        if (this.light2) {
            this.light2.position.x = Math.sin(time * 0.2 + Math.PI) * 20;
            this.light2.position.y = Math.cos(time * 0.25) * 15;
        }

        // === CAMERA PARALLAX ===
        this.camera.position.x += (this.mouse.x * 8 - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mouse.y * 5 - this.camera.position.y) * 0.02;
        this.camera.lookAt(0, 0, -10);

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new StunningCanvas('homepage-canvas');
});

export default StunningCanvas;
