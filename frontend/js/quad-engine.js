import * as THREE from 'three';

/**
 * QUAD-ENGINE: 4 Concurrent Science Simulations
 * Uses Scissor Testing to render 4 scenes on one canvas.
 */

class QuadEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setScissorTest(true);

        this.scenes = [];
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.mouse = new THREE.Vector2();

        this.initScenes();
        this.addListeners();
        this.animate();
    }

    initScenes() {
        // 1. PHYSICS (Top Left) - Gravity/Planetary
        this.scenes.push({
            scene: this.createPhysicsScene(),
            camera: this.createCamera(),
            update: (time) => this.updatePhysics(time),
            background: new THREE.Color(0x050510),
            viewport: [0, 0.5, 0.5, 0.5] // x, y, w, h (Top Left in Three.js coords is y=0.5)
        });

        // 2. CHEMISTRY (Top Right) - Atom
        this.scenes.push({
            scene: this.createChemistryScene(),
            camera: this.createCamera(),
            update: (time) => this.updateChemistry(time),
            background: new THREE.Color(0x001005),
            viewport: [0.5, 0.5, 0.5, 0.5]
        });

        // 3. BIOLOGY (Bottom Left) - DNA
        this.scenes.push({
            scene: this.createBiologyScene(),
            camera: this.createCamera(),
            update: (time) => this.updateBiology(time),
            background: new THREE.Color(0x100005),
            viewport: [0, 0, 0.5, 0.5]
        });

        // 4. MATH (Bottom Right) - Tesseract/Hypercube
        this.scenes.push({
            scene: this.createMathScene(),
            camera: this.createCamera(),
            update: (time) => this.updateMath(time),
            background: new THREE.Color(0x050010),
            viewport: [0.5, 0, 0.5, 0.5]
        });
    }

    createCamera() {
        const camera = new THREE.PerspectiveCamera(45, (this.width / 2) / (this.height / 2), 0.1, 100);
        camera.position.z = 10;
        return camera;
    }

    // --- SCENE CREATORS ---

    createPhysicsScene() {
        const scene = new THREE.Scene();

        // Central Star
        const geometry = new THREE.IcosahedronGeometry(1.5, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x60a5fa,
            wireframe: true
        });
        const star = new THREE.Mesh(geometry, material);
        scene.add(star);
        scene.userData = { star: star, satellites: [] };

        // Orbiting Satellites
        for (let i = 0; i < 3; i++) {
            const satGeo = new THREE.SphereGeometry(0.3, 16, 16);
            const satMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 100 });
            const sat = new THREE.Mesh(satGeo, satMat);
            scene.add(sat);
            scene.userData.satellites.push({ mesh: sat, speed: 0.5 + i * 0.3, radius: 3 + i * 1.5, angle: Math.random() * Math.PI * 2 });
        }

        const light = new THREE.PointLight(0x60a5fa, 2, 20);
        light.position.set(0, 0, 0);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0x404040));

        return scene;
    }

    createChemistryScene() {
        const scene = new THREE.Scene();
        const group = new THREE.Group();

        // Nucleus
        const nucGeo = new THREE.SphereGeometry(1, 32, 32);
        const nucMat = new THREE.MeshPhongMaterial({ color: 0x34d399, emissive: 0x064e3b });
        const nucleus = new THREE.Mesh(nucGeo, nucMat);
        group.add(nucleus);

        // Electrons (Rings)
        const ringGeo = new THREE.TorusGeometry(3, 0.05, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.3 });

        const ring1 = new THREE.Mesh(ringGeo, ringMat);
        const ring2 = new THREE.Mesh(ringGeo, ringMat);
        const ring3 = new THREE.Mesh(ringGeo, ringMat);

        ring1.rotation.x = Math.PI / 2;
        ring2.rotation.x = Math.PI / 2;
        ring2.rotation.y = Math.PI / 3;
        ring3.rotation.x = Math.PI / 2;
        ring3.rotation.y = -Math.PI / 3;

        group.add(ring1, ring2, ring3);

        scene.add(group);
        scene.userData = { molecule: group };

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0x222222));

        return scene;
    }

    createBiologyScene() {
        const scene = new THREE.Scene();
        const group = new THREE.Group();

        // DNA Double Helix
        const count = 40;
        const radius = 2;
        const height = 8;

        for (let i = 0; i < count; i++) {
            const t = i / count;
            const angle = t * Math.PI * 4;
            const y = (t - 0.5) * height;

            const x1 = Math.cos(angle) * radius;
            const z1 = Math.sin(angle) * radius;
            const x2 = Math.cos(angle + Math.PI) * radius;
            const z2 = Math.sin(angle + Math.PI) * radius;

            // Spheres
            const sphereGeo = new THREE.SphereGeometry(0.2, 16, 16);
            const mat1 = new THREE.MeshPhongMaterial({ color: 0xf472b6 });
            const mat2 = new THREE.MeshPhongMaterial({ color: 0xa78bfa });

            const s1 = new THREE.Mesh(sphereGeo, mat1);
            s1.position.set(x1, y, z1);
            const s2 = new THREE.Mesh(sphereGeo, mat2);
            s2.position.set(x2, y, z2);

            group.add(s1);
            group.add(s2);

            // Connector (Base pair)
            const cylGeo = new THREE.CylinderGeometry(0.05, 0.05, radius * 2, 8);
            const cylMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
            const cyl = new THREE.Mesh(cylGeo, cylMat);
            cyl.position.set(0, y, 0);
            cyl.rotation.y = -angle; // Rotate to match
            cyl.rotation.z = Math.PI / 2; // Lie flat
            group.add(cyl);
        }

        scene.add(group);
        scene.userData = { dna: group };

        const light = new THREE.PointLight(0xffffff, 1, 20);
        light.position.set(2, 2, 5);
        scene.add(light);

        return scene;
    }

    createMathScene() {
        const scene = new THREE.Scene();

        // Tesseract (Wireframe Cube inside Cube)
        const g1 = new THREE.BoxGeometry(2, 2, 2);
        const g2 = new THREE.BoxGeometry(4, 4, 4);

        const m1 = new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true });
        const m2 = new THREE.MeshBasicMaterial({ color: 0x4c1d95, wireframe: true, transparent: true, opacity: 0.5 });

        const cube1 = new THREE.Mesh(g1, m1);
        const cube2 = new THREE.Mesh(g2, m2);

        const group = new THREE.Group();
        group.add(cube1);
        group.add(cube2);

        // Connecting lines (vertices)
        // Simplified for visual effect

        scene.add(group);
        scene.userData = { tesseract: group, inner: cube1, outer: cube2 };

        return scene;
    }

    // --- UPDATERS ---

    updatePhysics(time) {
        const { star, satellites } = this.scenes[0].scene.userData;
        star.rotation.y = time * 0.2;
        star.rotation.z = time * 0.1;

        satellites.forEach(sat => {
            sat.angle += sat.speed * 0.01;
            sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
            sat.mesh.position.z = Math.sin(sat.angle) * sat.radius;
            sat.mesh.rotation.y += 0.05;
        });
    }

    updateChemistry(time) {
        const { molecule } = this.scenes[1].scene.userData;
        molecule.rotation.x = Math.sin(time * 0.5) * 0.5;
        molecule.rotation.y = time * 0.3;
    }

    updateBiology(time) {
        const { dna } = this.scenes[2].scene.userData;
        dna.rotation.y = time * 0.5;
    }

    updateMath(time) {
        const { tesseract, inner, outer } = this.scenes[3].scene.userData;
        tesseract.rotation.x = time * 0.2;
        tesseract.rotation.y = time * 0.3;

        // Tesseract breathing
        const scale = 1 + Math.sin(time * 1.5) * 0.2;
        inner.scale.set(scale, scale, scale);
    }

    // --- RENDER ---

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.width = width;
        this.height = height;

        this.renderer.setSize(width, height);

        this.scenes.forEach(s => {
            s.camera.aspect = (width / 2) / (height / 2);
            s.camera.updateProjectionMatrix();
        });
    }

    addListeners() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = performance.now() * 0.001;

        // Render each scene
        this.scenes.forEach((s, i) => {
            const { scene, camera, update, viewport, background } = s;

            // Calculate Viewport
            const width = this.width;
            const height = this.height;

            const left = Math.floor(width * viewport[0]);
            const bottom = Math.floor(height * viewport[1]);
            const w = Math.floor(width * viewport[2]);
            const h = Math.floor(height * viewport[3]);

            this.renderer.setViewport(left, bottom, w, h);
            this.renderer.setScissor(left, bottom, w, h);
            this.renderer.setClearColor(background);

            update(time);

            // Simple interaction: Camera look slightly at mouse
            // camera.position.x += (this.mouse.x * 2 - camera.position.x) * 0.05;
            // camera.lookAt(0, 0, 0);

            this.renderer.render(scene, camera);
        });
    }
}

// Init
new QuadEngine('quad-canvas');
