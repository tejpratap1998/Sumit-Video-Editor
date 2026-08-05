/* ============================================================
   THREE.JS 3D CINEMATIC CANVAS ENGINE
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

    // Scene & Camera
    this.heroScene = new THREE.Scene();
    this.heroScene.fog = new THREE.FogExp2(0x000000, 0.0012);

    this.heroCamera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    this.heroCamera.position.z = 800;

    // Renderer
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
      // Spread across 3D space
      positions[i3] = (Math.random() - 0.5) * 2000;
      positions[i3 + 1] = (Math.random() - 0.5) * 1400;
      positions[i3 + 2] = (Math.random() - 0.5) * 1600;

      // Color distribution: 60% gold, 30% cyan, 10% white
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

    // Procedural glowing circle particle texture
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

    // Subtle 3D Grid Perspective Floor
    const gridHelper = new THREE.GridHelper(2400, 40, 0xC9A84C, 0x151620);
    gridHelper.position.y = -450;
    gridHelper.material.opacity = 0.18;
    gridHelper.material.transparent = true;
    this.heroScene.add(gridHelper);

    this.animateHero();
  }

  animateHero() {
    requestAnimationFrame(() => this.animateHero());

    // Mouse parallax interpolation (lerp)
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    if (this.heroParticles) {
      this.heroParticles.rotation.y += 0.0006;
      this.heroParticles.rotation.x += 0.0003;

      // Cursor parallax
      this.heroCamera.position.x = this.mouse.x * 0.35;
      this.heroCamera.position.y = -this.mouse.y * 0.35;
      this.heroCamera.lookAt(this.heroScene.position);
    }

    if (this.heroRenderer && this.heroScene && this.heroCamera) {
      this.heroRenderer.render(this.heroScene, this.heroCamera);
    }
  }

  // ------------------------------------------------------------
  // 2. CTA 3D TORUS KNOT MESH
  // ------------------------------------------------------------
  initCtaUniverse() {
    if (!this.ctaCanvas) return;

    this.ctaScene = new THREE.Scene();
    this.ctaCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.ctaCamera.position.z = 24;

    this.ctaRenderer = new THREE.WebGLRenderer({
      canvas: this.ctaCanvas,
      alpha: true,
      antialias: true
    });
    
    this.updateCtaSize();

    // Metallic Torus Knot Geometry
    const geometry = new THREE.TorusKnotGeometry(7, 2.2, 120, 16, 2, 3);
    
    // Wireframe glowing gold material
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0xC9A84C,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });

    this.ctaMesh = new THREE.Mesh(geometry, wireMaterial);
    this.ctaScene.add(this.ctaMesh);

    // Inner glowing sphere core
    const innerGeom = new THREE.IcosahedronGeometry(4, 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    this.ctaInnerMesh = new THREE.Mesh(innerGeom, innerMat);
    this.ctaScene.add(this.ctaInnerMesh);

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

    if (this.ctaMesh && this.ctaInnerMesh) {
      this.ctaMesh.rotation.x += 0.005;
      this.ctaMesh.rotation.y += 0.008;

      this.ctaInnerMesh.rotation.x -= 0.008;
      this.ctaInnerMesh.rotation.y -= 0.005;

      // Mouse influence
      this.ctaMesh.rotation.y += (this.mouse.x * 0.0005);
      this.ctaMesh.rotation.x += (this.mouse.y * 0.0005);
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
