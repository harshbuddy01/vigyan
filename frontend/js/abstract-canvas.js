import * as THREE from 'three';

/**
 * ABSTRACT CANVAS: Avant-Garde Science Visualization
 * A unified, immersive experience inspired by:
 * - Morphogenesis (Biological Pattern Formation)
 * - Strange Attractors (Mathematical Chaos)
 * - Fluid Dynamics (Physics)
 * 
 * No labels. No basic shapes. Pure digital art.
 */

class AbstractCanvas {
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
        this.renderer.setClearColor(0x000000, 1);

        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 30;

        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2(0, 0);

        this.init();
        this.addListeners();
        this.animate();
    }

    init() {
        // === LORENZ STRANGE ATTRACTOR (MATH/CHAOS) ===
        // A beautiful, infinitely complex shape that never repeats
        this.createLorenzAttractor();

        // === MORPHOGENESIS FIELD (BIOLOGY) ===
        // Reaction-Diffusion inspired pattern
        this.createMorphField();

        // === AMBIENT PARTICLES (PHYSICS/QUANTUM) ===
        // Floating, ethereal particles
        this.createAmbientParticles();

        // === LIGHTING ===
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x60a5fa, 1, 50);
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xf472b6, 0.8, 50);
        pointLight2.position.set(-10, -10, 10);
        this.scene.add(pointLight2);
    }

    createLorenzAttractor() {
        // Lorenz parameters
        const sigma = 10;
        const rho = 28;
        const beta = 8 / 3;
        const dt = 0.005;
        const numPoints = 10000;

        const positions = [];
        let x = 0.1, y = 0, z = 0;

        for (let i = 0; i < numPoints; i++) {
            const dx = sigma * (y - x) * dt;
            const dy = (x * (rho - z) - y) * dt;
            const dz = (x * y - beta * z) * dt;
            x += dx;
            y += dy;
            z += dz;
            positions.push(x * 0.5, y * 0.5, z * 0.5 - 12);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        // Create gradient colors along the attractor
        const colors = [];
        for (let i = 0; i < numPoints; i++) {
            const t = i / numPoints;
            // Gradient from blue -> purple -> pink
            const r = 0.38 + t * 0.58;
            const g = 0.65 - t * 0.15;
            const b = 0.98 - t * 0.27;
            colors.push(r, g, b);
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.lorenz = new THREE.Points(geometry, material);
        this.scene.add(this.lorenz);
    }

    createMorphField() {
        // A flowing, organic mesh inspired by biological growth
        const geometry = new THREE.IcosahedronGeometry(8, 4);

        const material = new THREE.MeshPhysicalMaterial({
            color: 0x34d399,
            emissive: 0x064e3b,
            emissiveIntensity: 0.2,
            metalness: 0.3,
            roughness: 0.4,
            transparent: true,
            opacity: 0.6,
            wireframe: true,
            wireframeLinewidth: 1
        });

        this.morphMesh = new THREE.Mesh(geometry, material);
        this.morphMesh.position.set(15, 5, -5);
        this.scene.add(this.morphMesh);

        // Store original vertex positions for morphing
        this.morphOriginalPositions = geometry.attributes.position.array.slice();
    }

    createAmbientParticles() {
        const particleCount = 500;
        const positions = [];
        const sizes = [];

        for (let i = 0; i < particleCount; i++) {
            positions.push(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 80
            );
            sizes.push(Math.random() * 0.5 + 0.1);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.3,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });

        this.ambientParticles = new THREE.Points(geometry, material);
        this.scene.add(this.ambientParticles);
    }

    addListeners() {
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
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

        // Rotate Lorenz Attractor slowly
        if (this.lorenz) {
            this.lorenz.rotation.y = time * 0.1;
            this.lorenz.rotation.x = Math.sin(time * 0.2) * 0.2;
        }

        // Morph the organic mesh (reaction-diffusion inspired)
        if (this.morphMesh) {
            this.morphMesh.rotation.y = time * 0.15;
            this.morphMesh.rotation.x = time * 0.08;

            // Vertex displacement for "breathing" effect
            const positions = this.morphMesh.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                const ox = this.morphOriginalPositions[i];
                const oy = this.morphOriginalPositions[i + 1];
                const oz = this.morphOriginalPositions[i + 2];

                const distance = Math.sqrt(ox * ox + oy * oy + oz * oz);
                const wave = Math.sin(distance * 0.5 + time * 2) * 0.3;

                positions[i] = ox + (ox / distance) * wave;
                positions[i + 1] = oy + (oy / distance) * wave;
                positions[i + 2] = oz + (oz / distance) * wave;
            }
            this.morphMesh.geometry.attributes.position.needsUpdate = true;
        }

        // Subtle ambient particle drift
        if (this.ambientParticles) {
            this.ambientParticles.rotation.y = time * 0.02;
        }

        // Camera parallax based on mouse
        this.camera.position.x += (this.mouse.x * 5 - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mouse.y * 3 - this.camera.position.y) * 0.02;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize
new AbstractCanvas('abstract-canvas');
