import * as THREE from 'three';

/**
 * FUTURE CANVAS: Particle Waveform Visualization
 * Inspired by:
 * - Gravitational Waves (Physics)
 * - Data Flow / Neural Pathways (Technology)
 * 
 * Different from homepage - uses flowing wave patterns instead of strange attractors.
 */

class FutureCanvas {
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
        this.renderer.setClearColor(0x020617, 1);

        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 30, 80);
        this.camera.lookAt(0, 0, 0);

        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2(0, 0);

        this.init();
        this.addListeners();
        this.animate();
    }

    init() {
        // === WAVE FIELD (Gravitational Wave Inspired) ===
        this.createWaveField();

        // === DATA STREAMS (Flowing Lines) ===
        this.createDataStreams();

        // === AMBIENT GLOW ===
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);
    }

    createWaveField() {
        // Create a grid of particles that wave like ocean/gravitational waves
        const gridSize = 100;
        const spacing = 1.5;
        const particleCount = gridSize * gridSize;

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        let index = 0;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x = (i - gridSize / 2) * spacing;
                const z = (j - gridSize / 2) * spacing;

                positions[index * 3] = x;
                positions[index * 3 + 1] = 0; // Will be animated
                positions[index * 3 + 2] = z;

                // Gradient color: Blue -> Purple -> Pink based on distance from center
                const dist = Math.sqrt(x * x + z * z) / (gridSize * spacing / 2);
                colors[index * 3] = 0.38 + dist * 0.5;     // R
                colors[index * 3 + 1] = 0.52 - dist * 0.2; // G
                colors[index * 3 + 2] = 0.98;               // B

                index++;
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });

        this.waveField = new THREE.Points(geometry, material);
        this.waveField.rotation.x = -Math.PI / 4; // Tilt for perspective
        this.scene.add(this.waveField);

        this.wavePositions = positions;
        this.gridSize = gridSize;
    }

    createDataStreams() {
        // Flowing lines representing data/career paths
        const numStreams = 8;
        this.streams = [];

        for (let i = 0; i < numStreams; i++) {
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-60 + Math.random() * 20, Math.random() * 20 - 10, -30),
                new THREE.Vector3(-20 + Math.random() * 10, Math.random() * 20 - 10, Math.random() * 20 - 10),
                new THREE.Vector3(20 + Math.random() * 10, Math.random() * 20 - 10, Math.random() * 20 - 10),
                new THREE.Vector3(60 + Math.random() * 20, Math.random() * 20 - 10, -30)
            ]);

            const geometry = new THREE.TubeGeometry(curve, 64, 0.1 + Math.random() * 0.1, 8, false);

            // Gradient material
            const hue = 0.55 + (i / numStreams) * 0.25; // Blue to pink range
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(hue, 0.8, 0.6),
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending
            });

            const stream = new THREE.Mesh(geometry, material);
            stream.userData = { offset: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 0.5 };
            this.streams.push(stream);
            this.scene.add(stream);
        }
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

        // Animate wave field
        if (this.waveField) {
            const positions = this.waveField.geometry.attributes.position.array;
            const gridSize = this.gridSize;
            const spacing = 1.5;

            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    const index = (i * gridSize + j) * 3;
                    const x = (i - gridSize / 2) * spacing;
                    const z = (j - gridSize / 2) * spacing;

                    // Multiple wave sources for interference pattern
                    const dist1 = Math.sqrt(x * x + z * z);
                    const dist2 = Math.sqrt((x - 30) * (x - 30) + z * z);

                    const wave1 = Math.sin(dist1 * 0.1 - time * 2) * 3;
                    const wave2 = Math.sin(dist2 * 0.12 - time * 2.5) * 2;

                    positions[index + 1] = wave1 + wave2;
                }
            }
            this.waveField.geometry.attributes.position.needsUpdate = true;
        }

        // Animate data streams (subtle pulsing)
        this.streams.forEach(stream => {
            const pulse = Math.sin(time * stream.userData.speed + stream.userData.offset);
            stream.material.opacity = 0.3 + pulse * 0.15;
        });

        // Camera parallax
        this.camera.position.x += (this.mouse.x * 10 - this.camera.position.x) * 0.02;
        this.camera.position.y += (30 + this.mouse.y * 5 - this.camera.position.y) * 0.02;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize
new FutureCanvas('future-canvas');
