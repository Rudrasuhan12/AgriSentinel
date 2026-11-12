import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  RotateCw, 
  Activity, 
  Info,
  Play,
  Pause
} from 'lucide-react';

interface Interactive3DHeapViewerProps {
  height?: string;
  showControls?: boolean;
}

export const Interactive3DHeapViewer: React.FC<Interactive3DHeapViewerProps> = ({ 
  height = '420px',
  showControls = true 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const reqIdRef = useRef<number>(0);

  // 3D Objects refs
  const pointsRef = useRef<THREE.Points | null>(null);
  const wireframeMeshRef = useRef<THREE.LineSegments | null>(null);
  const shadedMeshRef = useRef<THREE.Mesh | null>(null);
  const heapGroupRef = useRef<THREE.Group | null>(null);
  const targetPositionsRef = useRef<Float32Array | null>(null);
  const startPositionsRef = useRef<Float32Array | null>(null);

  // UI Interactive States
  const [viewMode, setViewMode] = useState<'hybrid' | 'points' | 'wireframe'>('hybrid');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isAssembling, setIsAssembling] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 8, theta: Math.PI / 4, phi: Math.PI / 3.2 });

  // Update Camera position from spherical coordinates
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 0.6, 0);
  }, []);

  const resetView = () => {
    sphericalRef.current = { radius: 8, theta: Math.PI / 4, phi: Math.PI / 3.2 };
    updateCameraPosition();
    setAutoRotate(true);
  };

  const reassemblePointCloud = () => {
    if (!pointsRef.current || !targetPositionsRef.current || !startPositionsRef.current) return;
    setIsAssembling(true);
    setProgress(0);

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const count = positions.length;

    // Disperse points randomly into aerial bounding hemisphere
    for (let i = 0; i < count; i += 3) {
      startPositionsRef.current[i] = (Math.random() - 0.5) * 8;
      startPositionsRef.current[i + 1] = Math.random() * 4 + 2;
      startPositionsRef.current[i + 2] = (Math.random() - 0.5) * 8;
      
      positions[i] = startPositionsRef.current[i];
      positions[i + 1] = startPositionsRef.current[i + 1];
      positions[i + 2] = startPositionsRef.current[i + 2];
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const heightPx = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0d0c, 0.08);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group for the entire reconstructed heap
    const heapGroup = new THREE.Group();
    heapGroupRef.current = heapGroup;
    scene.add(heapGroup);

    // 1. Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xb8ee3b, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x34d399, 1.5, 10);
    pointLight.position.set(-3, 4, -2);
    scene.add(pointLight);

    // 2. Ground Datum Plane with Geospatial Grid
    const gridHelper = new THREE.GridHelper(10, 20, 0xb8ee3b, 0x1c3829);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 3. Ground circular bounding ring
    const ringGeo = new THREE.RingGeometry(2.35, 2.4, 64);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0xb8ee3b, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.4 
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.01;
    scene.add(ringMesh);

    // 4. Generate Asymmetric Loose Paddy Heap Geometry
    // Parametric mound model: z(x,y) = H * exp(-(x^2 / 2sx^2 + y^2 / 2sy^2)) + subtle grain noise
    const gridDim = 50;
    const numVertices = gridDim * gridDim;
    const planeGeo = new THREE.PlaneGeometry(5, 5, gridDim - 1, gridDim - 1);
    planeGeo.rotateX(-Math.PI / 2);

    const positionsAttr = planeGeo.attributes.position;
    const targetPositions = new Float32Array(numVertices * 3);
    const startPositions = new Float32Array(numVertices * 3);
    const currentPositions = new Float32Array(numVertices * 3);
    const colors = new Float32Array(numVertices * 3);

    const peakHeight = 1.64; // Scaled meters
    const sigmaX = 1.1;
    const sigmaZ = 1.35;

    for (let i = 0; i < positionsAttr.count; i++) {
      const x = positionsAttr.getX(i);
      const z = positionsAttr.getZ(i);
      const r = Math.sqrt(x * x + z * z);

      // Natural agricultural heap bell curve
      let y = 0;
      if (r < 2.4) {
        const exponent = -((x * x) / (2 * sigmaX * sigmaX) + (z * z) / (2 * sigmaZ * sigmaZ));
        const bell = peakHeight * Math.exp(exponent);
        // Small organic irregularities representing grain packing
        const noise = (Math.sin(x * 6) * Math.cos(z * 6) + Math.sin(x * 12 + z * 10) * 0.5) * 0.045;
        y = Math.max(0, bell + noise);
      }

      targetPositions[i * 3] = x;
      targetPositions[i * 3 + 1] = y;
      targetPositions[i * 3 + 2] = z;

      // Dispersed start positions
      startPositions[i * 3] = (Math.random() - 0.5) * 7;
      startPositions[i * 3 + 1] = Math.random() * 4 + 2;
      startPositions[i * 3 + 2] = (Math.random() - 0.5) * 7;

      currentPositions[i * 3] = startPositions[i * 3];
      currentPositions[i * 3 + 1] = startPositions[i * 3 + 1];
      currentPositions[i * 3 + 2] = startPositions[i * 3 + 2];

      // Dynamic color gradient: Base (dark green/charcoal) -> Crest (vibrant lime/gold)
      const normY = y / peakHeight;
      const c = new THREE.Color().lerpColors(
        new THREE.Color(0x2d5e44),
        new THREE.Color(0xb8ee3b),
        Math.min(1, Math.max(0, normY * 1.1))
      );
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      positionsAttr.setXYZ(i, x, y, z);
    }
    planeGeo.computeVertexNormals();

    targetPositionsRef.current = targetPositions;
    startPositionsRef.current = startPositions;

    // A. Dense Point Cloud (Points)
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    pointsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circular glowing particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.3, 'rgba(184,238,59,0.85)');
      gradient.addColorStop(1, 'rgba(16,37,27,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const particleTex = new THREE.CanvasTexture(canvas);

    const pointsMat = new THREE.PointsMaterial({
      size: 0.12,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(pointsGeo, pointsMat);
    pointsRef.current = points;
    heapGroup.add(points);

    // B. Wireframe Mesh
    const wireframeGeo = new THREE.WireframeGeometry(planeGeo);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const wireframeMesh = new THREE.LineSegments(wireframeGeo, wireframeMat);
    wireframeMeshRef.current = wireframeMesh;
    heapGroup.add(wireframeMesh);

    // C. Shaded Semi-transparent Surface Mesh
    const shadedMat = new THREE.MeshStandardMaterial({
      color: 0x0f291b,
      roughness: 0.8,
      metalness: 0.1,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const shadedMesh = new THREE.Mesh(planeGeo, shadedMat);
    shadedMeshRef.current = shadedMesh;
    heapGroup.add(shadedMesh);

    // Animation Loop
    let animProgress = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Animate Point Cloud Assembly
      if (animProgress < 1) {
        animProgress = Math.min(1, animProgress + delta * 0.7);
        setProgress(Math.round(animProgress * 100));

        // Ease-out cubic
        const t = 1 - Math.pow(1 - animProgress, 3);
        const posAttr = points.geometry.attributes.position;
        const currentArr = posAttr.array as Float32Array;

        for (let i = 0; i < currentArr.length; i++) {
          currentArr[i] = startPositions[i] + (targetPositions[i] - startPositions[i]) * t;
        }
        posAttr.needsUpdate = true;

        if (animProgress >= 1) {
          setIsAssembling(false);
        }
      }

      // Orbital Rotation
      if (autoRotate && !isDraggingRef.current) {
        sphericalRef.current.theta += delta * 0.25;
        updateCameraPosition();
      }

      renderer.render(scene, camera);
    };

    animate();

    // Mouse Controls (Orbit Rotation & Zoom)
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      sphericalRef.current.theta -= deltaX * 0.007;
      sphericalRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, sphericalRef.current.phi - deltaY * 0.007)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      updateCameraPosition();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRef.current.radius = Math.max(
        4,
        Math.min(14, sphericalRef.current.radius + e.deltaY * 0.008)
      );
      updateCameraPosition();
    };

    // Touch support for mobile
    let touchStart = { x: 0, y: 0 };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - touchStart.x;
      const deltaY = e.touches[0].clientY - touchStart.y;

      sphericalRef.current.theta -= deltaX * 0.007;
      sphericalRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, sphericalRef.current.phi - deltaY * 0.007)
      );

      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      updateCameraPosition();
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);

      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      renderer.dispose();
      planeGeo.dispose();
      pointsGeo.dispose();
      wireframeGeo.dispose();
      pointsMat.dispose();
      wireframeMat.dispose();
      shadedMat.dispose();
      particleTex.dispose();
    };
  }, [updateCameraPosition]);

  // Handle View Mode Toggles
  useEffect(() => {
    if (!pointsRef.current || !wireframeMeshRef.current || !shadedMeshRef.current) return;

    if (viewMode === 'points') {
      pointsRef.current.visible = true;
      wireframeMeshRef.current.visible = false;
      shadedMeshRef.current.visible = false;
    } else if (viewMode === 'wireframe') {
      pointsRef.current.visible = false;
      wireframeMeshRef.current.visible = true;
      shadedMeshRef.current.visible = true;
    } else {
      // hybrid
      pointsRef.current.visible = true;
      wireframeMeshRef.current.visible = true;
      shadedMeshRef.current.visible = true;
    }
  }, [viewMode]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-forest-700/80 bg-charcoal-950 shadow-elevated group select-none">
      
      {/* 3D Canvas Mount */}
      <div 
        ref={containerRef} 
        style={{ height }}
        className="w-full cursor-grab active:cursor-grabbing bg-radial from-forest-950/80 via-charcoal-950 to-charcoal-950" 
      />

      {/* Top Floating HUD: Telemetry & Assembly Indicator */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="glass-panel px-3 py-1.5 rounded-lg border border-lime-dim/80 text-[11px] font-mono shadow-md backdrop-blur-md flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-lime-accent animate-pulse" />
          <span className="text-sand-100 font-semibold">3D HEAP RECONSTRUCTION</span>
          <span className="text-olive-400">·</span>
          <span className="text-lime-accent">
            {isAssembling ? `ASSEMBLING CLOUD [${progress}%]` : 'SfM MESH CONVERGED'}
          </span>
        </div>

        <div className="hidden sm:flex glass-panel px-3 py-1.5 rounded-lg border border-forest-700 text-[10px] font-mono text-sand-300 gap-3">
          <span>VERTICES: <strong className="text-lime-accent">2,500</strong></span>
          <span>FACES: <strong className="text-sand-100">4,802</strong></span>
          <span>RMS: <strong className="text-emerald-400">±1.2cm</strong></span>
        </div>
      </div>

      {/* Bottom Floating Overlay: Metric Specifications */}
      <div className="absolute bottom-16 sm:bottom-4 left-4 pointer-events-none">
        <div className="glass-panel p-3 rounded-xl border border-forest-800 text-xs font-mono max-w-xs shadow-xl">
          <div className="text-[10px] uppercase text-olive-400 tracking-wider">Watertight Extracted Volume</div>
          <div className="text-xl font-display font-bold text-sand-50 mt-0.5">
            14.82 <span className="text-xs font-mono text-lime-accent">m³</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-sand-400 mt-1">
            <span>Peak: 1.64m</span>
            <span>·</span>
            <span>Footprint: 22.4m²</span>
            <span>·</span>
            <span className="text-emerald-400">RANSAC Ground Fit</span>
          </div>
        </div>
      </div>

      {/* Floating Interactive Controls Bar */}
      {showControls && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
          
          {/* Mode Switcher */}
          <div className="glass-panel p-1 rounded-lg border border-forest-700 flex items-center gap-1 shadow-lg">
            <button
              onClick={() => setViewMode('hybrid')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase transition-colors ${
                viewMode === 'hybrid'
                  ? 'bg-forest-800 text-lime-accent font-semibold border border-lime-dim'
                  : 'text-sand-300 hover:text-sand-100 hover:bg-forest-900/40'
              }`}
            >
              Hybrid
            </button>
            <button
              onClick={() => setViewMode('points')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase transition-colors ${
                viewMode === 'points'
                  ? 'bg-forest-800 text-lime-accent font-semibold border border-lime-dim'
                  : 'text-sand-300 hover:text-sand-100 hover:bg-forest-900/40'
              }`}
            >
              Points
            </button>
            <button
              onClick={() => setViewMode('wireframe')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase transition-colors ${
                viewMode === 'wireframe'
                  ? 'bg-forest-800 text-lime-accent font-semibold border border-lime-dim'
                  : 'text-sand-300 hover:text-sand-100 hover:bg-forest-900/40'
              }`}
            >
              Mesh
            </button>
          </div>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? 'Pause Rotation' : 'Resume Orbital Rotation'}
            className="p-2 rounded-lg glass-panel border border-forest-700 text-sand-300 hover:text-lime-accent hover:border-lime-dim transition-colors shadow-lg"
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Re-assemble Animation */}
          <button
            onClick={reassemblePointCloud}
            title="Re-assemble Point Cloud"
            className="p-2 rounded-lg glass-panel border border-forest-700 text-sand-300 hover:text-lime-accent hover:border-lime-dim transition-colors shadow-lg"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera View */}
          <button
            onClick={resetView}
            title="Reset Camera View"
            className="px-2.5 py-1.5 rounded-lg glass-panel border border-forest-700 text-[10px] font-mono text-sand-300 hover:text-lime-accent hover:border-lime-dim transition-colors shadow-lg"
          >
            Reset
          </button>
        </div>
      )}

      {/* Dispersed Disclaimer Notice */}
      <div className="absolute top-4 right-4 hidden lg:flex items-center gap-1.5 text-[9px] font-mono text-olive-400 glass-panel-subtle px-2 py-1 rounded border border-forest-800 pointer-events-none">
        <Info className="w-3 h-3 text-lime-accent" />
        <span>CONCEPT RECONSTRUCTION MODEL · ILLUSTRATIVE DEMO</span>
      </div>

    </div>
  );
};
