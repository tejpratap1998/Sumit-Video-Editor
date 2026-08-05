/* ============================================================
   THREE.JS 3D CINEMATIC CANVAS ENGINE
   - Hero: 2,200+ Particle Universe & Depth Grid
   - Contact / CTA: 3D Floating Video Editing Tools Icons (Pr, Ae, CapCut)
   ============================================================ */

class ThreeUniverse {
  constructor() {
    this.heroCanvas = document.getElementById('threeHeroCanvas');
    this.ctaCanvas = document.getElementById('threeCtaCanvas');

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;

    this.initHeroUniverse();
    this.initCtaUniverse();
    this.initMouseEvents();
    this.initResizeHandler();
  }

  // ------------------------------------------------------------
  // 1. HERO PARTICLES UNIVERSE & 3D GRID
  // ------------------------------------------------------------
  initHeroUniverse() {
    if (!this.heroCanvas) return;

    this.heroScene = new THREE.Scene();
    this.heroScene.fog = new THREE.FogExp2(0x000000, 0.0012);

    this.heroCamera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    this.heroCamera.position.z = 800;

    this.heroRenderer = new THREE.WebGLRenderer({
      canvas: this.heroCanvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.heroRenderer.setSize(window.innerWidth, window.innerHeight);
    this.heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Cloud (2,200 particles)
    const particleCount = window.innerWidth < 768 ? 900 : 2200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const goldColor = new THREE.Color(0xC9A84C);
    const cyanColor = new THREE.Color(0x00F0FF);
    const whiteColor = new THREE.Color(0xFFFFFF);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 2000;
      positions[i3 + 1] = (Math.random() - 0.5) * 1400;
      positions[i3 + 2] = (Math.random() - 0.5) * 1600;

      const rand = Math.random();
      let selectedColor = goldColor;
      if (rand > 0.7) selectedColor = cyanColor;
      else if (rand > 0.6) selectedColor = whiteColor;

      colors[i3] = selectedColor.r;
      colors[i3 + 1] = selectedColor.g;
      colors[i3 + 2] = selectedColor.b;

      sizes[i] = Math.random() * 4 + 1.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Glow particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    grad.addColorStop(0.7, 'rgba(255,255,255,0.15)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.heroParticles = new THREE.Points(geometry, material);
    this.heroScene.add(this.heroParticles);

    // Subtle 3D Grid Floor
    const gridHelper = new THREE.GridHelper(2400, 40, 0xC9A84C, 0x151620);
    gridHelper.position.y = -450;
    gridHelper.material.opacity = 0.18;
    gridHelper.material.transparent = true;
    this.heroScene.add(gridHelper);

    this.animateHero();
  }

  animateHero() {
    requestAnimationFrame(() => this.animateHero());

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    if (this.heroParticles) {
      this.heroParticles.rotation.y += 0.0006;
      this.heroParticles.rotation.x += 0.0003;

      this.heroCamera.position.x = this.mouse.x * 0.35;
      this.heroCamera.position.y = -this.mouse.y * 0.35;
      this.heroCamera.lookAt(this.heroScene.position);
    }

    if (this.heroRenderer && this.heroScene && this.heroCamera) {
      this.heroRenderer.render(this.heroScene, this.heroCamera);
    }
  }

  // ------------------------------------------------------------
  // 2. CONTACT / CTA 3D FLOATING TOOLS ICONS (Pr, Ae, CapCut)
  // ------------------------------------------------------------
  createToolTexture(name, sub, bgGradient, textColor, borderGlow) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rounded background box
    const radius = 64;
    ctx.fillStyle = bgGradient[0];
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, bgGradient[0]);
    grad.addColorStop(1, bgGradient[1]);
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.roundRect(16, 16, 480, 480, radius);
    ctx.fill();

    // Glowing border
    ctx.lineWidth = 14;
    ctx.strokeStyle = borderGlow;
    ctx.stroke();

    // Inner subtle glow line
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.roundRect(32, 32, 448, 448, radius - 10);
    ctx.stroke();

    // Big Tool Letters (e.g. Pr, Ae, CC)
    ctx.fillStyle = textColor;
    ctx.font = '900 170px "Syne", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = borderGlow;
    ctx.shadowBlur = 30;
    ctx.fillText(name, 256, 230);

    // Subtitle Tag
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 36px "JetBrains Mono", monospace';
    ctx.letterSpacing = '4px';
    ctx.fillText(sub, 256, 360);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  initCtaUniverse() {
    if (!this.ctaCanvas) return;

    this.ctaScene = new THREE.Scene();
    this.ctaCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.ctaCamera.position.z = 28;

    this.ctaRenderer = new THREE.WebGLRenderer({
      canvas: this.ctaCanvas,
      alpha: true,
      antialias: true
    });
    
    this.updateCtaSize();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.ctaScene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xC9A84C, 2.5, 50);
    pointLight1.position.set(15, 15, 15);
    this.ctaScene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00F0FF, 2, 50);
    pointLight2.position.set(-15, -15, 15);
    this.ctaScene.add(pointLight2);

    // 3D Orbit Group for Tools
    this.toolsOrbitGroup = new THREE.Group();
    this.ctaScene.add(this.toolsOrbitGroup);

    this.toolMeshes = [];

    // Tool 1: Premiere Pro (Pr)
    const prTex = this.createToolTexture('Pr', 'PREMIERE PRO', ['#000030', '#0a0a20'], '#9999FF', '#9999FF');
    // Tool 2: After Effects (Ae)
    const aeTex = this.createToolTexture('Ae', 'AFTER EFFECTS', ['#1a0033', '#110022'], '#D291FF', '#D291FF');
    // Tool 3: CapCut (CC)
    const ccTex = this.createToolTexture('CC', 'CAPCUT PRO', ['#001a1f', '#000c0f'], '#00F0FF', '#00F0FF');
    // Tool 4: 4K Master Video (4K)
    const goldTex = this.createToolTexture('4K', 'ULTRA HD', ['#1f1805', '#0f0a00'], '#C9A84C', '#e6c875');

    const toolConfigs = [
      { texture: prTex, x: -11, y: 5, z: 0, rx: 0.1, ry: 0.3, speed: 0.009 },
      { texture: aeTex, x: 11, y: 6, z: -2, rx: -0.2, ry: -0.3, speed: 0.008 },
      { texture: ccTex, x: -9, y: -6, z: 2, rx: 0.3, ry: -0.2, speed: 0.011 },
      { texture: goldTex, x: 10, y: -5, z: -1, rx: -0.1, ry: 0.2, speed: 0.01 }
    ];

    const boxGeom = new THREE.BoxGeometry(4.8, 4.8, 0.8);

    toolConfigs.forEach((cfg) => {
      const materials = [
        new THREE.MeshStandardMaterial({ color: 0x111115, metalness: 0.8, roughness: 0.2 }), // right
        new THREE.MeshStandardMaterial({ color: 0x111115, metalness: 0.8, roughness: 0.2 }), // left
        new THREE.MeshStandardMaterial({ color: 0x111115, metalness: 0.8, roughness: 0.2 }), // top
        new THREE.MeshStandardMaterial({ color: 0x111115, metalness: 0.8, roughness: 0.2 }), // bottom
        new THREE.MeshStandardMaterial({ map: cfg.texture, roughness: 0.1, metalness: 0.3 }), // front
        new THREE.MeshStandardMaterial({ map: cfg.texture, roughness: 0.1, metalness: 0.3 })  // back
      ];

      const mesh = new THREE.Mesh(boxGeom, materials);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.set(cfg.rx, cfg.ry, 0);

      mesh.userData = {
        baseX: cfg.x,
        baseY: cfg.y,
        baseZ: cfg.z,
        rotSpeed: cfg.speed,
        phase: Math.random() * Math.PI * 2
      };

      this.toolsOrbitGroup.add(mesh);
      this.toolMeshes.push(mesh);
    });

    // Ambient floating ring around tools
    const ringGeom = new THREE.TorusGeometry(14, 0.08, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.25 });
    this.ctaRing = new THREE.Mesh(ringGeom, ringMat);
    this.ctaRing.rotation.x = Math.PI / 3;
    this.ctaScene.add(this.ctaRing);

    this.animateCta();
  }

  updateCtaSize() {
    if (!this.ctaCanvas || !this.ctaRenderer || !this.ctaCamera) return;
    const parent = this.ctaCanvas.parentElement;
    if (!parent) return;

    const width = parent.clientWidth || window.innerWidth;
    const height = parent.clientHeight || 600;

    this.ctaCamera.aspect = width / height;
    this.ctaCamera.updateProjectionMatrix();
    this.ctaRenderer.setSize(width, height);
    this.ctaRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  animateCta() {
    requestAnimationFrame(() => this.animateCta());

    const time = performance.now() * 0.001;

    // Orbit & Bobbing Animation for each 3D Tool
    if (this.toolMeshes) {
      this.toolMeshes.forEach((mesh, index) => {
        const u = mesh.userData;
        mesh.rotation.y += u.rotSpeed;
        mesh.rotation.x = Math.sin(time + u.phase) * 0.2;

        // Floating hover motion
        mesh.position.y = u.baseY + Math.sin(time * 1.5 + u.phase) * 0.8;
        mesh.position.x = u.baseX + Math.cos(time * 1.2 + u.phase) * 0.4;
      });
    }

    if (this.ctaRing) {
      this.ctaRing.rotation.z += 0.003;
      this.ctaRing.rotation.y += 0.002;
    }

    // Mouse influence
    if (this.toolsOrbitGroup) {
      this.toolsOrbitGroup.rotation.y = (this.mouse.x * 0.0008);
      this.toolsOrbitGroup.rotation.x = -(this.mouse.y * 0.0008);
    }

    if (this.ctaRenderer && this.ctaScene && this.ctaCamera) {
      this.ctaRenderer.render(this.ctaScene, this.ctaCamera);
    }
  }

  // ------------------------------------------------------------
  // 3. MOUSE & RESIZE HANDLERS
  // ------------------------------------------------------------
  initMouseEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX - this.windowHalfX;
      this.mouse.targetY = e.clientY - this.windowHalfY;
    });
  }

  initResizeHandler() {
    window.addEventListener('resize', () => {
      this.windowHalfX = window.innerWidth / 2;
      this.windowHalfY = window.innerHeight / 2;

      // Hero resize
      if (this.heroCamera && this.heroRenderer) {
        this.heroCamera.aspect = window.innerWidth / window.innerHeight;
        this.heroCamera.updateProjectionMatrix();
        this.heroRenderer.setSize(window.innerWidth, window.innerHeight);
      }

      // CTA resize
      this.updateCtaSize();
    });
  }
}

// Instantiate Universe once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.threeUniverse = new ThreeUniverse();
});
