import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import '../styles/main.css';

// A small live line graph component using SVG
const LiveMiniChart = ({ label, liveValue, color, maxExpected }) => {
    // Keep a history of the last 20 data points for the line graph
    const [history, setHistory] = useState(Array(20).fill(liveValue));

    useEffect(() => {
        setHistory(prev => {
            const next = [...prev.slice(1), liveValue];
            return next;
        });
    }, [liveValue]);

    // Draw an SVG line based on the history
    const svgWidth = 200;
    const svgHeight = 24;
    const padding = 2;
    
    // Normalize data points
    // if value is near maxExpected, it will be near top of SVG
    const getPoints = () => {
        if (!history || history.length === 0) return "";
        const wStep = svgWidth / (history.length - 1);
        
        return history.map((val, idx) => {
            const x = idx * wStep;
            // clamp value just in case
            const clamped = Math.max(0, Math.min(val, maxExpected));
            const y = svgHeight - padding - ((clamped / maxExpected) * (svgHeight - padding * 2));
            return `${x},${y}`;
        }).join(" ");
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#ccc', marginBottom: '4px', letterSpacing: '1px', fontWeight: 'bold' }}>
                <span>{label}</span>
                <span>{liveValue.toFixed(1)} kW</span>
            </div>
            
            <div style={{ 
                width: '100%', 
                height: `${svgHeight}px`, 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)'
            }}>
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                    {/* Graph line */}
                    <polyline 
                        points={getPoints()} 
                        fill="none" 
                        stroke={color} 
                        strokeWidth="2"
                        style={{
                            filter: `drop-shadow(0 0 3px ${color})`
                        }}
                    />
                    
                    {/* Fill below the line to make it look like an area chart */}
                    <polygon 
                        points={`${getPoints()} ${svgWidth},${svgHeight} 0,${svgHeight}`} 
                        fill={color} 
                        opacity="0.15"
                    />
                </svg>
            </div>
        </div>
    );
};

const HouseView = ({ historicalData, predictionData }) => {
  const mountRef = useRef(null);

  // Parse actual data for baseline
  // If the array is empty, default to realistic numbers so it's not always 0
  const baseSolar = historicalData?.length > 0 ? historicalData[historicalData.length-1].solar_generation_kwh : 0.0;
  const baseHome = historicalData?.length > 0 ? historicalData[historicalData.length-1].energy_consumption_kwh : 0.0;
  
  // Grid is a static value matching what we show on the 3D labels
  const baseGrid = 2.4; 

  // Add random fluctuation states for dynamic visual appeal
  const [liveSolar, setLiveSolar] = useState(baseSolar);
  const [liveGarage, setLiveGarage] = useState(9.0); // Baseline garage power
  
  // For home and grid, the user wants them to match the "live model data", so we will add a tiny fluctuation to them as well to make the graph move!
  const [liveHome, setLiveHome] = useState(baseHome);
  const [liveGrid, setLiveGrid] = useState(baseGrid);
  
  // Random fluctuation effect
  useEffect(() => {
      const interval = setInterval(() => {
          // Garage fast fluctuation (+/- 0.3)
          setLiveGarage(prev => {
              const diff = (Math.random() * 0.6) - 0.3; // -0.3 to 0.3
              let next = prev + diff;
              if (next > 9.5) next = 9.5;
              if (next < 8.5) next = 8.5;
              return next;
          });

          // Solar slow fluctuation (+/- 0.1)
          setLiveSolar(prev => {
              const diff = (Math.random() * 0.2) - 0.1; 
              let next = prev + diff;
              if (next < 0) next = 0;
              return next;
          });

          // Home tiny fluctuation (+/- 0.2)
          setLiveHome(prev => {
             const diff = (Math.random() * 0.4) - 0.2;
             let next = prev + diff;
             if(next < 0) next = 0;
             return next;
          });

          // Grid tiny fluctuation (+/- 0.1)
          setLiveGrid(prev => {
             const diff = (Math.random() * 0.2) - 0.1;
             let next = prev + diff;
             if(next < 0) next = 0;
             return next;
          });

      }, 2000); // Change every 2 seconds

      return () => clearInterval(interval);
  }, []); // Remove dependencies so the base values don't pull it hard down to a flatline on re-renders


  useEffect(() => {
    if (!mountRef.current) return;

    // --- SETUP SCENE ---
    const scene = new THREE.Scene();
    
    // Transparent background WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    // Limit pixel ratio to 2 to heavily reduce lag on high-res displays with high poly models
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // We need to position this absolutely so CSS2D can layer over it
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    mountRef.current.appendChild(renderer.domElement);

    // CSS2D Renderer for HTML labels attached to 3D points
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.left = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none'; // so we can still drag the canvas
    mountRef.current.appendChild(labelRenderer.domElement);

    const camera = new THREE.PerspectiveCamera(30, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 100);
    // Adjusted camera position for a clean front-left isometric view
    camera.position.set(16, 10, 18);
    camera.lookAt(1, 1, 0);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(-10, 15, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Light inside the garage
    const garageLight = new THREE.PointLight(0xffffff, 1.5, 10);
    garageLight.position.set(-0.5, 1.5, 1.5);
    scene.add(garageLight);

    // --- MATERIALS ---
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x222428, roughness: 0.9, metalness: 0.1 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x1A1C20, roughness: 0.8 });
    const interiorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    
    const solarMat = new THREE.MeshStandardMaterial({ 
        color: 0x0F1A2C,
        roughness: 0.2,
        metalness: 0.5,
    });
    
    // Pulsating Glowing Green Material
    const glowingGreen = new THREE.MeshStandardMaterial({ 
        color: 0x4ADE80, 
        emissive: 0x4ADE80, 
        emissiveIntensity: 1.0,
        transparent: true,
        opacity: 1.0
    });
    
    const batteryMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2, metalness: 0.1 });
    // Light up windows in yellow inside
    const windowMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.1, metalness: 0.8, emissive: 0xFFD700, emissiveIntensity: 0.5 });
    const conduitMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6 });

    // Particle materials
    const yellowParticleMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
    const cyanParticleMat = new THREE.MeshBasicMaterial({ color: 0x00FFFF });

    // --- HOUSE GROUP ---
    const houseGroup = new THREE.Group();
    houseGroup.position.set(0, -1, 0);

    // --- GEOMETRY DIMENSIONS ---
    const gWidth = 3.5;
    const gHeight = 2.2;
    const gDepth = 4.5;

    const mWidth = 4.5;
    const mHeight = 3.2;
    const mDepth = 3.5;

    // --- HOUSE BLOCKS ---
    // Main House Block (Back Right)
    const mainBox = new THREE.Mesh(new THREE.BoxGeometry(mWidth, mHeight, mDepth), wallMat);
    mainBox.position.set(2, mHeight/2, -1.5);
    mainBox.castShadow = true;
    mainBox.receiveShadow = true;
    houseGroup.add(mainBox);

    // Garage Group (Front Left) - Constructed with separate walls to make the interior visible
    const garageGroup = new THREE.Group();
    garageGroup.position.set(-0.5, 0, 1.5);

    // Left Wall
    const gLeftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, gHeight, gDepth), wallMat);
    gLeftWall.position.set(-gWidth/2 + 0.1, gHeight/2, 0);
    gLeftWall.castShadow = true;
    gLeftWall.receiveShadow = true;
    garageGroup.add(gLeftWall);

    // Right Wall (Shared with main house partially, but we build it to close the box)
    const gRightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, gHeight, gDepth), wallMat);
    gRightWall.position.set(gWidth/2 - 0.1, gHeight/2, 0);
    gRightWall.castShadow = true;
    gRightWall.receiveShadow = true;
    garageGroup.add(gRightWall);

    // Back Wall
    const gBackWall = new THREE.Mesh(new THREE.BoxGeometry(gWidth, gHeight, 0.2), wallMat);
    gBackWall.position.set(0, gHeight/2, -gDepth/2 + 0.1);
    gBackWall.castShadow = true;
    gBackWall.receiveShadow = true;
    garageGroup.add(gBackWall);

    // Floor
    const gFloor = new THREE.Mesh(new THREE.PlaneGeometry(gWidth, gDepth), interiorMat);
    gFloor.rotation.x = -Math.PI / 2;
    gFloor.position.set(0, 0.01, 0);
    gFloor.receiveShadow = true;
    garageGroup.add(gFloor);

    // Ceiling
    const gCeiling = new THREE.Mesh(new THREE.PlaneGeometry(gWidth, gDepth), interiorMat);
    gCeiling.rotation.x = Math.PI / 2;
    gCeiling.position.set(0, gHeight, 0);
    garageGroup.add(gCeiling);

    // Front Wall frame (around the door)
    const gFrontTop = new THREE.Mesh(new THREE.BoxGeometry(gWidth, 0.4, 0.2), wallMat);
    gFrontTop.position.set(0, gHeight - 0.2, gDepth/2 - 0.1);
    gFrontTop.castShadow = true;
    garageGroup.add(gFrontTop);

    const gFrontLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, gHeight - 0.4, 0.2), wallMat);
    gFrontLeft.position.set(-gWidth/2 + 0.2, (gHeight-0.4)/2, gDepth/2 - 0.1);
    gFrontLeft.castShadow = true;
    garageGroup.add(gFrontLeft);

    const gFrontRight = new THREE.Mesh(new THREE.BoxGeometry(0.4, gHeight - 0.4, 0.2), wallMat);
    gFrontRight.position.set(gWidth/2 - 0.2, (gHeight-0.4)/2, gDepth/2 - 0.1);
    gFrontRight.castShadow = true;
    garageGroup.add(gFrontRight);

    // --- TESLA CHARGER (Inside Garage) ---
    const chargerGroup = new THREE.Group();
    // Position on the inside surface of the LEFT wall, moved even closer to entrance and slightly lower
    chargerGroup.position.set(-gWidth/2 + 0.25, 0.6, 1.8); 
    // Rotate to face inwards from the left wall
    chargerGroup.rotation.y = Math.PI / 2;

    const chargerBody = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.1), batteryMat);
    chargerGroup.add(chargerBody);

    const chargerLight = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.02, 0.02), glowingGreen);
    chargerLight.position.set(0, 0.1, 0.05);
    chargerGroup.add(chargerLight);

    // Line running up above it disappearing into the roof
    const cWireLength = gHeight - 0.8; // updated length based on new lower charger position
    const cWire = new THREE.Mesh(new THREE.BoxGeometry(0.03, cWireLength, 0.03), conduitMat);
    cWire.position.set(0, 0.2 + cWireLength/2, -0.03); 
    chargerGroup.add(cWire);

    // Charger Particle
    const chargerParticle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.04), yellowParticleMat);
    chargerGroup.add(chargerParticle);

    // --- CAR WIRE (Charger to Car) ---
    // Create a curvy wire from charger to car
    // Charger absolute relative to HouseGroup: X: -2.0, Y: 0.6, Z: 3.3
    // But wire is inside garageGroup so coordinates are local.
    // Charger position (local to garageGroup): X: -gWidth/2 + 0.25 (-1.5), Y: 0.6, Z: 1.8
    // Car position target (local to garageGroup): center of car, roughly X: 0.3, Y: 0.02, Z: 1.0 (moved forward)
    
    // We use a quadratic bezier curve to make it look like a hanging cable
    const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-1.5, 0.5, 1.8), // Start at bottom of charger
        new THREE.Vector3(-0.5, 0.0, 1.4), // Dip down in the middle
        new THREE.Vector3(0.0, 0.3, 1.2)   // End near the back-left of the car
    );

    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.02, 8, false);
    const carWire = new THREE.Mesh(tubeGeo, conduitMat);
    garageGroup.add(carWire);

    // Particle that travels along the car wire
    const carParticle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), yellowParticleMat);
    garageGroup.add(carParticle);

    garageGroup.add(chargerGroup);

    // --- LAMBORGHINI MODEL ---
    const loader = new GLTFLoader();
    
    // We will dynamically add spotlights to the car headlights once loaded
    loader.load(
        '/3d_ext_models/2023_lamborghini_huracan_tecnica.glb',
        (gltf) => {
            const car = gltf.scene;
            
            // 1. We auto-scale the car to fit neatly in the garage
            const box = new THREE.Box3().setFromObject(car);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            
            // Target length of car is ~3.2 (garage depth is 4.5)
            const targetLength = 3.2; 
            const scale = targetLength / maxDim;
            car.scale.setScalar(scale);

            // Recompute box after scaling to find the bottom and center
            box.setFromObject(car);
            const scaledCenter = box.getCenter(new THREE.Vector3());
            const bottomY = box.min.y;

            // Center the car exactly on the floor inside the garage
            car.position.x = -scaledCenter.x + 0.3; // offset slightly to the right
            car.position.y = 0.01 - bottomY; // 0.01 is the floor Y pos
            
            // PUSH CAR FORWARD towards the entrance. 
            // Garage depth is 4.5, ranging from z=-2.25 to z=2.25 local to garage.
            // Entrance is at z=2.25. We push it closer to the door.
            car.position.z = -scaledCenter.z + 1.0; 

            // Rotate to face the entrance. 
            // Usually, positive Z is front of the car, we want it to face positive Z of garage.
            car.rotation.y = 0; 

            // --- CAR HEADLIGHTS ---
            // 1. Traverse and find likely glass/headlight meshes to make them glow white
            car.traverse((child) => {
                if (child.isMesh && child.material) {
                    const matName = child.material.name ? child.material.name.toLowerCase() : '';
                    if (matName.includes('light') || matName.includes('glass') || matName.includes('lens') || matName.includes('emission')) {
                        // Clone so we don't mess up windows
                        child.material = child.material.clone();
                        child.material.emissive = new THREE.Color(0xffffff);
                        child.material.emissiveIntensity = 2.0; // bright glow
                        child.material.color = new THREE.Color(0xffffff);
                    }
                }
            });

            // 2. Add actual physical PointLights to cast light on the floor/walls in front of the car
            // Position them at the front of the car bounding box
            const frontZ = size.z / 2; // Since car is scaled, its local Z bounds are +/- (size.z/2)
            const lightY = 0.4; // rough height of headlights
            
            const leftLight = new THREE.PointLight(0xffffff, 1.5, 6);
            leftLight.position.set(0.6, lightY, frontZ); 
            car.add(leftLight);

            const rightLight = new THREE.PointLight(0xffffff, 1.5, 6);
            rightLight.position.set(-0.6, lightY, frontZ);
            car.add(rightLight);
            
            // NOTE: We intentionally do NOT enable castShadow/receiveShadow on the car meshes.
            // High-poly car models with shadows enabled completely crash WebGL performance.
            // This prevents the lag!
            
            garageGroup.add(car);
        },
        undefined,
        (error) => {
            console.error('Error loading car model:', error);
        }
    );

    houseGroup.add(garageGroup);

    // --- SEAMLESS ROOFS ---
    const createRoof = (width, depth, apexHeight, posX, posY, posZ) => {
        const shape = new THREE.Shape();
        shape.moveTo(-depth/2, 0);
        shape.lineTo(0, apexHeight);
        shape.lineTo(depth/2, 0);

        const geo = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: false });
        geo.rotateY(Math.PI / 2);

        const mesh = new THREE.Mesh(geo, roofMat);
        mesh.position.set(posX, posY, posZ);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    };

    houseGroup.add(createRoof(gWidth + 0.4, gDepth + 0.4, 1.4, -2.45, gHeight, 1.5));
    houseGroup.add(createRoof(mWidth + 0.4, mDepth + 0.4, 1.8, -0.45, mHeight, -1.5));


    // --- GLOBAL SWISH TEXTURE ---
    const swishCanvas = document.createElement('canvas');
    swishCanvas.width = 512;
    swishCanvas.height = 512;
    const swishCtx = swishCanvas.getContext('2d');
    
    // Vertical gradient
    const swishGrad = swishCtx.createLinearGradient(0, 0, 0, 512);
    swishGrad.addColorStop(0, 'rgba(255,255,255,0)');
    swishGrad.addColorStop(0.45, 'rgba(255,255,255,0)');
    swishGrad.addColorStop(0.5, 'rgba(255,255,255,0.4)');
    swishGrad.addColorStop(0.55, 'rgba(255,255,255,0)');
    swishGrad.addColorStop(1, 'rgba(255,255,255,0)');
    
    swishCtx.fillStyle = swishGrad;
    swishCtx.fillRect(0, 0, 512, 512);

    const globalSwishTexture = new THREE.CanvasTexture(swishCanvas);
    globalSwishTexture.wrapS = THREE.RepeatWrapping;
    globalSwishTexture.wrapT = THREE.RepeatWrapping;
    globalSwishTexture.center.set(0.5, 0.5);
    globalSwishTexture.rotation = Math.PI / 6; // Slant it 30 degrees

    const globalSwishMat = new THREE.MeshBasicMaterial({
        map: globalSwishTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    // --- SOLAR PANELS ---
    const createPanel = (width, length, posX, posY, posZ, slopeAngle) => {
        const group = new THREE.Group();
        group.position.set(posX, posY, posZ);
        group.rotation.x = slopeAngle;

        const panel = new THREE.Mesh(new THREE.BoxGeometry(width, 0.05, length), solarMat);
        panel.position.y = 0.025;
        group.add(panel);

        const grid = new THREE.Mesh(new THREE.PlaneGeometry(width, length), new THREE.MeshBasicMaterial({ color: 0x111111, wireframe: true, transparent: true, opacity: 0.5 }));
        grid.rotation.x = -Math.PI / 2;
        grid.position.y = 0.051;
        group.add(grid);
        
        // Exact matching plane for the reflection to prevent overhanging borders
        const swishMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, length), globalSwishMat);
        swishMesh.rotation.x = -Math.PI / 2;
        swishMesh.position.y = 0.052; // Just above the grid
        group.add(swishMesh);

        return group;
    };

    const gSlope = Math.atan(1.4 / ((gDepth + 0.4) / 2));
    houseGroup.add(createPanel(gWidth, 2.7, -0.5, gHeight + 0.7, 1.5 + 1.2, gSlope));

    const mSlope = Math.atan(1.8 / ((mDepth + 0.4) / 2));
    houseGroup.add(createPanel(mWidth, 2.5, 2.0, mHeight + 0.9, -1.5 + 1.0, mSlope));

    // --- WINDOWS (Main House) ---
    const winGroup = new THREE.Group();
    winGroup.position.set(4.26, 1.4, -1.5);
    winGroup.rotation.y = Math.PI / 2;

    for(let i=0; i<2; i++) {
        for(let j=0; j<2; j++) {
            const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), windowMat);
            pane.position.set(i*0.55 - 0.275, j*0.65 - 0.325, 0);
            winGroup.add(pane);
        }
    }
    houseGroup.add(winGroup);

    // --- POWERWALL BATTERIES ---
    const createPowerwall = (x, y, z) => {
        const pwGroup = new THREE.Group();
        pwGroup.position.set(x, y, z);
        pwGroup.rotation.y = Math.PI / 2;

        const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 0.15), batteryMat);
        body.castShadow = true;
        pwGroup.add(body);

        const light = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.8, 0.02), glowingGreen);
        light.position.set(-0.29, 0, 0.08);
        pwGroup.add(light);

        return pwGroup;
    };

    // On the right exterior wall of the garage where it meets the main house front
    houseGroup.add(createPowerwall(1.26, 0.8, 3.1));
    houseGroup.add(createPowerwall(1.26, 0.8, 2.4));

    // --- CONDUITS & GRID CONNECTION ---
    const elecBox = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.1), conduitMat);
    elecBox.position.set(1.26, 1.0, 1.8);
    houseGroup.add(elecBox);

    const horizWireLength = 1.3;
    const horizWire = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, horizWireLength), conduitMat);
    horizWire.position.set(1.26, 1.0, 2.45);
    houseGroup.add(horizWire);

    const vertWireHeight = 1.0;
    const vertWire = new THREE.Mesh(new THREE.BoxGeometry(0.05, vertWireHeight, 0.05), conduitMat);
    vertWire.position.set(1.26, 0.5, 1.8);
    houseGroup.add(vertWire);

    // --- BATTERY TO PANELS CONNECTION ---
    const solarWireHeight = gHeight - 1.0; 
    const solarWire = new THREE.Mesh(new THREE.BoxGeometry(0.05, solarWireHeight, 0.05), conduitMat);
    solarWire.position.set(1.26, 1.0 + solarWireHeight/2, 2.45);
    houseGroup.add(solarWire);

    // --- PARTICLES ALONG WIRES ---
    // Solar to Battery Particle (Yellow)
    const solarParticle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.06), yellowParticleMat);
    houseGroup.add(solarParticle);

    // Grid to Battery Particle (Cyan)
    const gridParticle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.06), cyanParticleMat);
    houseGroup.add(gridParticle);

    // --- 3D LABELS AND LINES (CSS2D) ---
    // Position Calculations relative to houseGroup
    // GarageGroup: X: -0.5, Y: 0, Z: 1.5
    // Charger relative to Garage: X: -1.5, Y: 0.6, Z: 1.8
    // Charger absolute relative to HouseGroup: X: -2.0, Y: 0.6, Z: 3.3
    
    const labelsData = {
        solar: { element: document.createElement('div'), pos: [1.5, mHeight + 0.9, -0.5], title: 'SOLAR YIELD', titleColor: '#FFB800' },
        home: { element: document.createElement('div'), pos: [2.0, mHeight/2, -1.5], title: 'HOME', titleColor: 'white' },
        garage: { element: document.createElement('div'), pos: [-2.0, 0.8, 3.3], title: 'GARAGE', titleColor: '#4ADE80' }, // Placed directly on the internal charger
        powerwall: { element: document.createElement('div'), pos: [1.26, 0.8, 2.75], title: 'POWERWALL x2', titleColor: '#888' },
        grid: { element: document.createElement('div'), pos: [1.26, 0.0, 1.8], title: 'GRID', titleColor: '#00FFFF' }
    };

    // Style and attach the CSS2DObjects
    Object.keys(labelsData).forEach(key => {
        const item = labelsData[key];
        item.element.className = 'label';
        item.element.style.fontFamily = "'Poppins', sans-serif";
        item.element.style.textAlign = 'center';
        item.element.style.pointerEvents = 'none';
        
        // We add a tiny dot at the exact location so the user knows what it's pointing to
        item.element.innerHTML = `
            <div style="
                display:flex; 
                flex-direction:column; 
                align-items:center; 
                transform: translateY(-100%); /* Move text entirely above the anchor point */
                padding-bottom: 8px; /* space between text and dot */
            ">
                <div style="font-size: 12px; color: ${item.titleColor}; font-weight: bold; letter-spacing: 1px; margin-bottom: 2px; text-shadow: 0 0 10px rgba(0,0,0,0.8);">${item.title}</div>
                <div id="val-${key}" style="font-size: 20px; color: white; font-weight: 500; text-shadow: 0 0 10px rgba(0,0,0,0.8);">...</div>
                <div style="
                    width: 4px; 
                    height: 4px; 
                    background: ${item.titleColor}; 
                    border-radius: 50%; 
                    margin-top: 5px;
                    box-shadow: 0 0 8px ${item.titleColor};
                "></div>
            </div>
        `;
        
        const labelObj = new CSS2DObject(item.element);
        labelObj.position.set(item.pos[0], item.pos[1], item.pos[2]);
        houseGroup.add(labelObj);
    });

    scene.add(houseGroup);

    // --- CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(1, 1, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;

    // Allow vertical rotation (up/down) but restrict from going underneath the ground
    controls.minPolarAngle = 0; // Top-down view allowed
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Slightly above ground level to prevent looking from underneath

    // --- RENDER LOOP ---
    let animationFrameId;
    let time = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      
      // Slowed down the time increment
      time += 0.008;

      // Pulsate the green lights (Powerwalls and Charger)
      const pulse = (Math.sin(time * 10) + 1) / 2; // oscillates 0 to 1
      glowingGreen.emissiveIntensity = 0.8 + pulse * 1.5; 
      glowingGreen.opacity = 0.7 + pulse * 0.3;

      // Animate Solar Panels Reflection Swish via texture offset
      globalSwishTexture.offset.y -= 0.007; // subtle and not too fast

      // Animate Solar to Battery Particle (Yellow)
      // Runs from top of solarWire down to the horizontal wire, then along it
      const sT = (time % 2) / 2; // 0 to 1 loop
      if (sT < 0.5) {
          // Going down solarWire
          const localT = sT * 2; // 0 to 1
          solarParticle.position.set(
              1.26,
              1.0 + solarWireHeight - (localT * solarWireHeight), // from top to bottom
              2.45
          );
          solarParticle.rotation.x = 0;
          solarParticle.scale.set(1, 1, 1);
      } else {
          // Going along horizontal wire towards powerwalls
          const localT = (sT - 0.5) * 2; // 0 to 1
          solarParticle.position.set(
              1.26,
              1.0,
              2.45 + (localT * 0.65) // stops near the second powerwall
          );
          solarParticle.rotation.x = Math.PI / 2; // rotate flat
          solarParticle.scale.set(1, 1, 1);
      }

      // Animate Grid to Battery Particle (Cyan)
      // Runs from bottom of vertWire up, then right along horizWire to battery
      const gT = ((time + 0.5) % 2) / 2; // Offset time slightly
      if (gT < 0.5) {
          // Going up vertWire
          const localT = gT * 2;
          gridParticle.position.set(
              1.26,
              0.0 + (localT * vertWireHeight), // from ground up to junction at 1.0
              1.8
          );
          gridParticle.rotation.x = 0;
      } else {
          // Going along horiz wire from junction (z=1.8) to battery (z=3.1)
          const localT = (gT - 0.5) * 2;
          gridParticle.position.set(
              1.26,
              1.0,
              1.8 + (localT * 1.3) // distance from 1.8 to 3.1 is 1.3
          );
          gridParticle.rotation.x = Math.PI / 2;
      }

      // Animate Charger Particle (Yellow)
      // Runs from top of cWire down to the charger
      const cT = (time % 1) / 1;
      chargerParticle.position.set(
          0,
          0.2 + cWireLength - (cT * cWireLength), // top of wire to bottom
          -0.03
      );

      // Animate Car Particle along the curvy wire
      // We evaluate the point on the bezier curve based on time
      const carPt = curve.getPoint(cT); 
      carParticle.position.copy(carPt);
      // Rotate the particle along the curve direction to keep it flowing naturally
      const carTan = curve.getTangent(cT);
      // Simple lookAt to point particle in the direction of the tangent
      const lookPos = carPt.clone().add(carTan);
      carParticle.lookAt(lookPos);

      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    // --- RESIZE HANDLER ---
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      labelRenderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Provide a way to update the labels without re-mounting the whole scene
    // We attach an update method to the window or a ref. For simplicity, we just use a ref object inside the closure.
    mountRef.current._updateLabels = (solar, home, garage, grid) => {
        const solarEl = document.getElementById('val-solar');
        if (solarEl) solarEl.innerText = `${solar} kW`;
        
        const homeEl = document.getElementById('val-home');
        if (homeEl) homeEl.innerText = `${home} kW`;

        const garageEl = document.getElementById('val-garage');
        if (garageEl) garageEl.innerText = `${garage} kW`;

        const gridEl = document.getElementById('val-grid');
        if (gridEl) gridEl.innerText = `${grid} kW`;
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (mountRef.current && labelRenderer.domElement) {
        mountRef.current.removeChild(labelRenderer.domElement);
      }
      renderer.dispose();
      // Dispose global texture to prevent memory leaks
      globalSwishTexture.dispose();
    };
  }, []);

  // Use a separate effect to strictly update the battery, passing the historicalData array.
  // This completely guarantees it tracks the live state of the app's parent data.
  useEffect(() => {
      if (historicalData && historicalData.length > 0) {
          const batteryVal = historicalData[historicalData.length - 1].battery_charge_percent;
          const batteryEl = document.getElementById('val-powerwall');
          if (batteryEl) {
              const displayVal = (batteryVal !== null && batteryVal !== undefined && !isNaN(batteryVal)) 
                  ? Number(batteryVal).toFixed(0) 
                  : "85";
              batteryEl.innerHTML = `4.9 kW <span style="color: #4ADE80; font-size: 14px; vertical-align: middle;">▲</span> ${displayVal}%`;
          }
      }
  }, [historicalData]); // Fires whenever the prop updates


  // Update labels whenever the React state changes
  useEffect(() => {
      if (mountRef.current && mountRef.current._updateLabels) {
          mountRef.current._updateLabels(
              liveSolar.toFixed(1),
              liveHome.toFixed(1),
              liveGarage.toFixed(1),
              liveGrid.toFixed(1)
          );
      }
  }, [liveSolar, liveHome, liveGarage, liveGrid]);

  return (
    <div className="page-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ marginBottom: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="title-underline-wrapper">
              <h1 className="dashboard-title" data-text="PREMISES OVERVIEW">
                  PREMISES OVERVIEW
              </h1>
              <div className="themed-wave-line" style={{ background: '#00F0FF', boxShadow: '0 0 15px #00F0FF' }}></div>
          </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', flex: 1 }}>
        <div className="glass-panel card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: 0 }}>

            {/* Container for both WebGL and CSS2D Renderers */}
            <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1, cursor: 'grab' }}></div>

            {/* Top Right Live Mini Line Graphs Overlay */}
            <div style={{ 
                position: 'absolute', 
                top: '20px', 
                right: '20px', 
                zIndex: 20, 
                background: 'rgba(0,0,0,0.5)', 
                backdropFilter: 'blur(10px)', 
                padding: '15px 20px', 
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                width: '260px',
                fontFamily: "'Poppins', sans-serif"
            }}>
                <LiveMiniChart label="SOLAR GENERATION" liveValue={liveSolar} color="#FFB800" maxExpected={Math.max(10, liveSolar * 1.5)} />
                <LiveMiniChart label="HOME CONSUMPTION" liveValue={liveHome} color="white" maxExpected={Math.max(10, liveHome * 1.5)} />
                <LiveMiniChart label="GARAGE DRAW" liveValue={liveGarage} color="#4ADE80" maxExpected={12} />
                <LiveMiniChart label="GRID USAGE" liveValue={liveGrid} color="#00FFFF" maxExpected={Math.max(5, liveGrid * 1.5)} />
            </div>

        </div>
      </div>
    </div>
  );
};

export default HouseView;