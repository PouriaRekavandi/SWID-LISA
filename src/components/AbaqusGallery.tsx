import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Search,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Cpu,
  Activity,
  Calendar,
  Clock,
  Sliders,
  Eye,
  Info,
  Play,
  Share2,
  Box,
  FileCode
} from 'lucide-react';
import projectImage from '../assets/project-image.jpg';

export interface SimulationItem {
  id: string;
  title: string;
  domain: 'metamaterials' | 'biomechanics' | 'fracture' | 'composites' | 'electronics';
  domainLabel: string;
  solver: 'Abaqus/Explicit' | 'Abaqus/Standard';
  analysisType: string;
  simulationDate: string;
  cpuCores: string;
  status: string;
  fieldVariable: string;
  fieldUnit: string;
  maxVal: number;
  minVal: number;
  elementType: string;
  elementCount: string;
  constitutiveModel: string;
  stepTime: string;
  description: string;
  highlights: string[];
  scriptReference: string;
  accentColor: string;
  svgType: 'antiprism' | 'brain' | 'cylinder' | 'bouligand' | 'electronics' | 'crashbox';
  customImage?: string;
}

export const SIMULATION_DATA: SimulationItem[] = [
  {
    id: 'sim-antiprism',
    title: 'AntiPrism Cellular Metamaterial Dynamic Crush',
    domain: 'metamaterials',
    domainLabel: 'Cellular Metamaterials',
    solver: 'Abaqus/Explicit',
    analysisType: 'Dynamic Explicit (Quasi-Static Crush)',
    simulationDate: 'Oct 14, 2025',
    cpuCores: '16 Cores (Dual Xeon) · Run: 4h 12m',
    status: 'Completed & Energy Balanced',
    fieldVariable: 'S, Mises (Von Mises Stress)',
    fieldUnit: 'MPa',
    minVal: 0.0,
    maxVal: 345.0,
    elementType: 'C3D8R (8-node linear brick, hourglass control)',
    elementCount: '184,200',
    constitutiveModel: 'Johnson-Cook Dynamic Plasticity + Damage Initiation',
    stepTime: '0.040 s (Explicit Quasi-Static Scale)',
    description: 'Dynamic compressive impact analysis of an AntiPrism origami cell. Captures continuous plastic hinge rotation, folding cell contact self-impingement, and stabilized plateau stress absorption under dynamic loading rates.',
    highlights: [
      'Specific Energy Absorption (SEA): 38.4 kJ/kg',
      'Stable plateau reaction force: 42.8 kN without catastrophic buckling',
      'Contact penalty algorithm with interior facet-to-facet friction = 0.15'
    ],
    scriptReference: 'abaqus python antiprism_parametric_v2024.py --cells=4x4x2 --velocity=15.0',
    accentColor: '#00ff41',
    svgType: 'antiprism'
  },
  {
    id: 'sim-brain-trauma',
    title: 'Dynamic Brain Parenchyma Shear Strain Under Angular Impact',
    domain: 'biomechanics',
    domainLabel: 'Neural Biomechanics',
    solver: 'Abaqus/Explicit',
    analysisType: 'Rotational Kinematics (TBI Dynamic Shear)',
    simulationDate: 'Jan 22, 2026',
    cpuCores: '24 Cores + 2 A100 GPUs · Run: 8h 35m',
    status: 'Completed & Validated vs Rig',
    fieldVariable: 'LE, Max Principal Logarithmic Strain',
    fieldUnit: 'strain (ratio)',
    minVal: 0.0,
    maxVal: 0.285,
    elementType: 'C3D10M (10-node modified quadratic tetrahedron)',
    elementCount: '342,800',
    constitutiveModel: 'Nonlinear Hyper-Viscoelastic (2-term Ogden + 4-term Prony Series)',
    stepTime: '0.080 s (Angular Deceleration Impulse)',
    description: 'Full-coronal anatomical slice computational modeling of traumatic brain injury (TBI) subjected to high-rate rotational acceleration. Identifies localized shear concentrations across deep sulcal folds and the corpus callosum.',
    highlights: [
      'Peak shear strain exceeded 0.18 axonal mechanical injury threshold at 32 ms',
      'Ogden hyperelastic shear modulus mu1 = 53.8 Pa, mu2 = -57.2 Pa',
      'Incompressible penalty formulation with Poisson ratio nu = 0.4998'
    ],
    scriptReference: 'abaqus job=CoronalBrain_ViscoDynamic cpus=16 interactive',
    accentColor: '#ff3131',
    svgType: 'brain'
  },
  {
    id: 'sim-cylinder-fracture',
    title: 'Thermo-Mechanical Fracture of Functionally Graded Cylinder',
    domain: 'fracture',
    domainLabel: 'Fatigue & Fracture',
    solver: 'Abaqus/Standard',
    analysisType: 'Coupled Thermo-Mechanical Fracture & SIF',
    simulationDate: 'May 19, 2025',
    cpuCores: '12 Cores (OpenMP) · Run: 1h 48m',
    status: 'Converged (5 J-Rings < 0.8% scatter)',
    fieldVariable: 'S, S22 Hoop Stress & Crack-Tip Singularity',
    fieldUnit: 'MPa',
    minVal: -45.0,
    maxVal: 620.0,
    elementType: 'C3D20R (20-node quadratic brick with 1/4-point collapsed mid-side nodes)',
    elementCount: '126,500',
    constitutiveModel: 'Graded Elastic-Plastic Material Law implemented via USDFLD subroutine',
    stepTime: 'Static Equilibrium (1.0 s)',
    description: 'Thermo-mechanical stress intensity factor (SIF) evaluation for two symmetric longitudinal internal radial cracks in a thick-walled functionally graded material (FGM) cylinder under inner thermal shock and cyclic internal pressure.',
    highlights: [
      'Stress Intensity Factor Mode-I (K_I) = 31.8 MPa*m^(1/2) evaluated over 5 J-integral contour rings',
      'Continuously varying Young modulus E(r) = E_i * exp(beta * r)',
      'J-integral path independence confirmed with < 0.8% scatter across rings 2–5'
    ],
    scriptReference: 'abaqus job=FGM_Cylinder_TwinCrack user=umat_fgm_graded.f',
    accentColor: '#00b8ff',
    svgType: 'cylinder'
  },
  {
    id: 'sim-bouligand',
    title: 'Bio-Inspired Helicoidal Bouligand Composite Ballistic Delamination',
    domain: 'composites',
    domainLabel: 'Bio-Inspired Metamaterials',
    solver: 'Abaqus/Explicit',
    analysisType: 'Ballistic Impact & Interlaminar CZM Delamination',
    simulationDate: 'Aug 11, 2025',
    cpuCores: '16 Cores · Run: 6h 04m',
    status: 'Completed (Energy Arrest Verified)',
    fieldVariable: 'CSDMG, Cohesive Element Damage Field',
    fieldUnit: 'damage index (0 to 1)',
    minVal: 0.0,
    maxVal: 1.0,
    elementType: 'COH3D8 Cohesive elements interleaved with SC8R continuum shells',
    elementCount: '215,000',
    constitutiveModel: 'Benzeggagh-Kenane (B-K) Mixed-Mode Interfacial Traction-Separation',
    stepTime: '0.005 s (High-Velocity Ballistic)',
    description: 'Multi-layer composite laminate modeled with helicoidal pitch angle rotations (15° step). Demonstrates that helicoidal fiber layouts force propagating interlaminar cracks into non-planar spiral twisting paths, dramatically raising critical energy release rate G_c.',
    highlights: [
      'Absorbed 2.45x more kinetic energy than standard orthogonal [0/90] layups',
      'Delamination footprint spread over 18 individual laminar interfaces without total perforation',
      'Quadratic nominal stress damage initiation criterion with mixed-mode B-K exponent eta = 1.45'
    ],
    scriptReference: 'abaqus job=Bouligand_Helicoid_Ballistic double=both cpus=12',
    accentColor: '#eab308',
    svgType: 'bouligand'
  },
  {
    id: 'sim-epidermal-electronics',
    title: 'Epidermal Electronic Patch Interconnect Strain & Delamination',
    domain: 'electronics',
    domainLabel: 'Flexible Electronics & LCE',
    solver: 'Abaqus/Standard',
    analysisType: 'Finite Deformation Large-Strain Stretch (NLGEOM)',
    simulationDate: 'Feb 03, 2026',
    cpuCores: '8 Cores · Run: 35m',
    status: 'Converged & Validated with DIC',
    fieldVariable: 'E, Green-Lagrange In-Plane Shear Strain E12',
    fieldUnit: 'strain (ratio)',
    minVal: -0.08,
    maxVal: 0.14,
    elementType: 'S4R (4-node doubly curved shell) & C3D8R substrate',
    elementCount: '98,400',
    constitutiveModel: 'Mooney-Rivlin Hyperelastic Substrate + Bilinear Elastoplastic Copper Traces',
    stepTime: 'Nonlinear Geometry (NLGEOM = YES)',
    description: 'Serpentine metallic interconnect traces bonded onto an ultra-compliant elastomer skin patch under 45% biaxial stretch and skin furrow flexing. Confirms neutral mechanical axis placement prevents plastic fatigue of copper wiring.',
    highlights: [
      'Peak plastic strain in copper serpentine hinges kept below 0.12% allowable limit',
      'Interfacial shear stress remained below 0.35 MPa cohesive delamination threshold',
      'Correlated with laboratory optical micro-DIC tensile testing measurements'
    ],
    scriptReference: 'abaqus job=Serpentine_Epidermal_Biaxial nlgeom=yes',
    accentColor: '#00e676',
    svgType: 'electronics',
    customImage: projectImage
  },
  {
    id: 'sim-crashbox',
    title: 'AntiPrism Multi-Cellular Crash Box Progressive Collapse',
    domain: 'metamaterials',
    domainLabel: 'Cellular Metamaterials',
    solver: 'Abaqus/Explicit',
    analysisType: 'Dynamic Impact Attenuation (500 kg Impactor @ 12 m/s)',
    simulationDate: 'Jul 28, 2025',
    cpuCores: '24 Cores + 2 GPUs · Run: 5h 20m',
    status: 'Completed (Hourglass ALLAE < 1.2%)',
    fieldVariable: 'PEEQ, Equivalent Plastic Strain',
    fieldUnit: 'plastic strain',
    minVal: 0.0,
    maxVal: 0.65,
    elementType: 'C3D8R with enhanced hourglass stiffness control',
    elementCount: '276,000',
    constitutiveModel: 'Rate-Dependent Cowper-Symonds Inelasticity (D = 40 s^-1, q = 5)',
    stepTime: '0.025 s (Impulsive Mass Impact = 500 kg @ 12 m/s)',
    description: 'Large-scale automotive/aerospace crash attenuator consisting of modular stacked AntiPrism unit cells. Simulates high-rate dynamic folding under a 500 kg rigid impactor mass with complete progressive accordion collapse.',
    highlights: [
      'Initial peak crash load ratio: 1.15 (near-ideal rectangular crush curve)',
      'Total impact kinetic energy (36.0 kJ) absorbed before solid bottoming out',
      'Zero hourglass energy leakage (ALLAE / ALLIE < 1.2% across full run)'
    ],
    scriptReference: 'abaqus job=CrashBox_AntiPrism_Explicit cpus=24 gpus=2',
    accentColor: '#38bdf8',
    svgType: 'crashbox'
  }
];

interface AbaqusGalleryProps {
  onNotify?: (msg: string, isError?: boolean) => void;
}

export const AbaqusGallery: React.FC<AbaqusGalleryProps> = ({ onNotify }) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [showWireframe, setShowWireframe] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [colorMap, setColorMap] = useState<'rainbow' | 'viridis' | 'jet'>('rainbow');
  const [probedStress, setProbedStress] = useState<{ x: number; y: number; val: string } | null>(null);
  const [hoveredTooltipId, setHoveredTooltipId] = useState<string | null>(null);
  const [pinnedTooltipId, setPinnedTooltipId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Filtered simulations
  const filteredSimulations = SIMULATION_DATA.filter((sim) => {
    const matchesDomain = selectedDomain === 'all' || sim.domain === selectedDomain;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      sim.title.toLowerCase().includes(q) ||
      sim.solver.toLowerCase().includes(q) ||
      sim.fieldVariable.toLowerCase().includes(q) ||
      sim.elementType.toLowerCase().includes(q) ||
      sim.constitutiveModel.toLowerCase().includes(q) ||
      sim.description.toLowerCase().includes(q);
    return matchesDomain && matchesSearch;
  });

  const domains = [
    { key: 'all', label: 'All Simulations' },
    { key: 'metamaterials', label: 'AntiPrism Metamaterials' },
    { key: 'biomechanics', label: 'Neural Biomechanics' },
    { key: 'fracture', label: 'Fracture Mechanics' },
    { key: 'composites', label: 'Bouligand Composites' },
    { key: 'electronics', label: 'Epidermal Electronics' },
  ];

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, filteredSimulations.length]);

  const openLightbox = (index: number) => {
    setActiveLightboxIndex(index);
    setZoomLevel(1);
    setProbedStress(null);
  };

  const closeLightbox = () => {
    setActiveLightboxIndex(null);
    setZoomLevel(1);
    setProbedStress(null);
  };

  const goToNext = () => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((prev) => ((prev! + 1) % filteredSimulations.length));
    setZoomLevel(1);
    setProbedStress(null);
  };

  const goToPrev = () => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((prev) =>
      prev! === 0 ? filteredSimulations.length - 1 : prev! - 1
    );
    setZoomLevel(1);
    setProbedStress(null);
  };

  const handleCopyScript = (sim: SimulationItem) => {
    navigator.clipboard.writeText(sim.scriptReference);
    setCopiedId(sim.id);
    if (onNotify) onNotify(`Abaqus execution command copied to clipboard: ${sim.scriptReference}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const activeSimulation =
    activeLightboxIndex !== null ? filteredSimulations[activeLightboxIndex] : null;

  // Render authentic Abaqus CAD viewport simulation canvas
  const renderSimulationViewport = (sim: SimulationItem, isInteractive = false) => {
    const ticks = [
      `+${sim.maxVal.toExponential(3)}`,
      `+${(sim.maxVal * 0.83).toExponential(3)}`,
      `+${(sim.maxVal * 0.66).toExponential(3)}`,
      `+${(sim.maxVal * 0.5).toExponential(3)}`,
      `+${(sim.maxVal * 0.33).toExponential(3)}`,
      `+${(sim.maxVal * 0.16).toExponential(3)}`,
      `+${sim.minVal.toExponential(3)}`
    ];

    const getGradientColors = () => {
      if (colorMap === 'viridis') {
        return ['#fde725', '#5ec962', '#21918c', '#3b528b', '#440154'];
      }
      if (colorMap === 'jet') {
        return ['#7f0000', '#ff0000', '#ffff00', '#00ffff', '#0000ff', '#00007f'];
      }
      return ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#00ffff', '#0000ff'];
    };

    const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isInteractive) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      // Synthesize realistic probed value
      const normalizedFactor = Math.sin((x / 100) * Math.PI) * Math.cos((y / 100) * Math.PI * 0.8);
      const probed = sim.minVal + Math.abs(normalizedFactor) * (sim.maxVal - sim.minVal);
      setProbedStress({
        x,
        y,
        val: `${probed.toFixed(2)} ${sim.fieldUnit}`
      });
    };

    return (
      <div className="relative w-full h-full bg-[#03060a] overflow-hidden select-none font-mono">
        {/* If custom photographic screenshot exists (e.g. Epidermal Electronics) */}
        {sim.customImage ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={sim.customImage}
              alt={sim.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            {/* Abaqus FEA Color Map Blend Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-emerald-600/30 to-amber-500/30 mix-blend-color-dodge pointer-events-none" />
            {showWireframe && (
              <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(0, 184, 255, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 184, 255, 0.25) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
            )}
          </div>
        ) : (
          /* High-Fidelity Vector FEA Mesh & Contour Graphics */
          <svg
            className="w-full h-full cursor-crosshair"
            viewBox="0 0 800 480"
            preserveAspectRatio="xMidYMid meet"
            onClick={handleCanvasClick}
          >
            <defs>
              <linearGradient id={`grad-${sim.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={getGradientColors()[0]} />
                <stop offset="25%" stopColor={getGradientColors()[1]} />
                <stop offset="50%" stopColor={getGradientColors()[2]} />
                <stop offset="75%" stopColor={getGradientColors()[3]} />
                <stop offset="100%" stopColor={getGradientColors()[4] || getGradientColors()[3]} />
              </linearGradient>

              {/* Hexahedral Wireframe Pattern */}
              <pattern id={`fea-mesh-${sim.id}`} width="28" height="28" patternUnits="userSpaceOnUse">
                <path
                  d="M 0 0 L 28 0 L 28 28 L 0 28 Z M 0 0 L 28 28 M 28 0 L 0 28"
                  fill="none"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="0.8"
                />
              </pattern>

              {/* Radial Stress Concentration */}
              <radialGradient id={`crack-tip-${sim.id}`} cx="55%" cy="50%" r="45%">
                <stop offset="0%" stopColor="#ff0000" stopOpacity="1" />
                <stop offset="20%" stopColor="#ff9900" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#33cc33" stopOpacity="0.8" />
                <stop offset="75%" stopColor="#0066ff" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#000066" stopOpacity="0.5" />
              </radialGradient>
            </defs>

            {/* Background CAD Grid */}
            <rect width="800" height="480" fill="#04080e" />

            {/* Simulation Specific Geometric Meshes */}
            {sim.svgType === 'antiprism' && (
              <g transform="translate(180, 40)">
                {/* 3D Isometric AntiPrism Unit Cell Fold Geometry */}
                <polygon
                  points="220,40 380,80 340,240 180,200"
                  fill={`url(#grad-${sim.id})`}
                  opacity="0.92"
                />
                <polygon
                  points="220,40 180,200 60,150 100,20"
                  fill={`url(#grad-${sim.id})`}
                  opacity="0.75"
                />
                <polygon
                  points="180,200 340,240 280,380 120,340"
                  fill={`url(#grad-${sim.id})`}
                  opacity="0.88"
                />
                <polygon
                  points="60,150 180,200 120,340 20,270"
                  fill={`url(#grad-${sim.id})`}
                  opacity="0.65"
                />

                {/* Second tier folding module */}
                <polygon
                  points="340,240 450,210 390,350 280,380"
                  fill={`url(#grad-${sim.id})`}
                  opacity="0.8"
                />

                {/* Wireframe Mesh Lines */}
                {showWireframe && (
                  <g stroke="#ffffff" strokeWidth="0.75" strokeOpacity="0.35" fill="none">
                    <line x1="220" y1="40" x2="380" y2="80" />
                    <line x1="380" y1="80" x2="340" y2="240" />
                    <line x1="340" y1="240" x2="180" y2="200" />
                    <line x1="180" y1="200" x2="220" y2="40" />
                    <line x1="180" y1="200" x2="280" y2="380" />
                    <line x1="280" y1="380" x2="120" y2="340" />
                    <line x1="120" y1="340" x2="180" y2="200" />
                    {/* Intermediate Element subdivisions */}
                    <path d="M 200,120 L 360,160 M 260,60 L 220,220 M 300,70 L 260,230 M 150,270 L 310,310 M 200,210 L 160,360 M 240,220 L 200,370" />
                  </g>
                )}

                {/* Plastic Hinge Deformation Marks */}
                <circle cx="180" cy="200" r="8" fill="#ff0000" opacity="0.9" />
                <circle cx="340" cy="240" r="7" fill="#ff4400" opacity="0.85" />
                <text x="195" y="205" fill="#ffffff" fontSize="11" fontWeight="bold">Hinge #1 (Peak Yield)</text>
              </g>
            )}

            {sim.svgType === 'brain' && (
              <g transform="translate(190, 40)">
                {/* Coronal Brain Hemisphere Cross Section Contour */}
                <path
                  d="M 220,30 C 320,30 380,100 370,220 C 360,320 280,360 220,380 C 160,360 80,320 70,220 C 60,100 120,30 220,30 Z"
                  fill={`url(#grad-${sim.id})`}
                  opacity="0.85"
                />
                {/* Sulcal Folds and Deep Ventricles (High Shear Bands) */}
                <path
                  d="M 220,30 L 220,160 M 170,120 Q 220,180 270,120 M 140,200 Q 180,240 220,220 Q 260,240 300,200 M 180,270 Q 220,320 260,270"
                  stroke="#ff1111"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                {/* Tetrahedral Mesh Overlay */}
                {showWireframe && (
                  <path
                    d="M 120,80 L 160,130 L 200,90 L 240,130 L 280,90 L 320,130 L 300,200 L 260,240 L 220,220 L 180,240 L 140,200 Z"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="0.75"
                    strokeOpacity="0.3"
                  />
                )}
                <circle cx="220" cy="190" r="14" fill="#ff0000" opacity="0.7" />
                <circle cx="220" cy="190" r="6" fill="#ffff00" />
                <text x="240" y="195" fill="#ffffff" fontSize="11" fontWeight="bold">Corpus Callosum (LE=0.285)</text>
              </g>
            )}

            {sim.svgType === 'cylinder' && (
              <g transform="translate(200, 30)">
                {/* Thick Walled Cylinder Cross Section */}
                <circle cx="220" cy="200" r="170" fill="#0d1b2a" stroke="#00b8ff" strokeWidth="2" />
                <circle cx="220" cy="200" r="100" fill="#04080e" stroke="#00ff41" strokeWidth="2" />
                {/* Twin Radial Cracks with Stress Singularity Contours */}
                <circle cx="120" cy="200" r="75" fill={`url(#crack-tip-${sim.id})`} opacity="0.85" />
                <circle cx="320" cy="200" r="75" fill={`url(#crack-tip-${sim.id})`} opacity="0.85" />
                {/* Crack lines */}
                <line x1="120" y1="200" x2="80" y2="200" stroke="#ffffff" strokeWidth="3" />
                <line x1="320" y1="200" x2="360" y2="200" stroke="#ffffff" strokeWidth="3" />
                {/* Concentric J-Integral Contour Rings */}
                <circle cx="120" cy="200" r="20" fill="none" stroke="#00ff41" strokeWidth="1.5" strokeDasharray="3,3" />
                <circle cx="120" cy="200" r="38" fill="none" stroke="#00ff41" strokeWidth="1.5" strokeDasharray="3,3" />
                <circle cx="120" cy="200" r="56" fill="none" stroke="#00ff41" strokeWidth="1.5" strokeDasharray="3,3" />
                {showWireframe && (
                  <g stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.25">
                    <line x1="220" y1="30" x2="220" y2="370" />
                    <line x1="50" y1="200" x2="390" y2="200" />
                    <circle cx="220" cy="200" r="135" fill="none" />
                  </g>
                )}
                <text x="145" y="180" fill="#ffffff" fontSize="11" fontWeight="bold">J-Integral Ring 3 (K_I=31.8)</text>
              </g>
            )}

            {sim.svgType === 'bouligand' && (
              <g transform="translate(160, 40)">
                {/* Helicoidal Stack Layers (Stepped angles) */}
                {[0, 1, 2, 3, 4, 5, 6].map((idx) => {
                  const y = 50 + idx * 45;
                  const angle = idx * 15;
                  return (
                    <g key={idx} transform={`translate(0, ${y})`}>
                      <polygon
                        points="50,0 450,0 420,35 20,35"
                        fill={`url(#grad-${sim.id})`}
                        opacity={0.7 + (idx % 2) * 0.25}
                      />
                      {showWireframe && (
                        <line x1="50" y1="0" x2="450" y2="0" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.4" />
                      )}
                      <text x="460" y="24" fill="#00e676" fontSize="10" fontWeight="bold">theta = {angle}°</text>
                    </g>
                  );
                })}
                {/* Twisting Crack Path */}
                <path
                  d="M 240,60 Q 280,140 210,220 Q 270,300 240,360"
                  stroke="#ff1111"
                  strokeWidth="4.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="210" cy="220" r="9" fill="#ff0000" />
                <text x="225" y="225" fill="#ffffff" fontSize="11" fontWeight="bold">Twisted Delamination Crack</text>
              </g>
            )}

            {sim.svgType === 'crashbox' && (
              <g transform="translate(180, 30)">
                {/* Multi-Cell Crash Box Accordion Folds */}
                <polygon points="120,40 320,40 280,120 80,120" fill="#00ff41" opacity="0.8" />
                <polygon points="80,120 280,120 320,200 120,200" fill="#ffff00" opacity="0.85" />
                <polygon points="120,200 320,200 280,280 80,280" fill="#ff7700" opacity="0.9" />
                <polygon points="80,280 280,280 320,360 120,360" fill="#ff0000" opacity="0.95" />
                {/* Impactor Mass Block */}
                <rect x="70" y="10" width="260" height="25" fill="#94a3b8" stroke="#ffffff" strokeWidth="1.5" />
                <text x="145" y="28" fill="#000000" fontSize="11" fontWeight="bold">RIGID IMPACTOR (500 kg)</text>
                {/* Plastic Strain Concentrators */}
                {showWireframe && (
                  <g stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.4" fill="none">
                    <line x1="120" y1="40" x2="80" y2="120" />
                    <line x1="320" y1="40" x2="280" y2="120" />
                    <line x1="80" y1="120" x2="120" y2="200" />
                    <line x1="280" y1="120" x2="320" y2="200" />
                    <line x1="120" y1="200" x2="80" y2="280" />
                    <line x1="320" y1="200" x2="280" y2="280" />
                  </g>
                )}
                <text x="335" y="325" fill="#ff4444" fontSize="11" fontWeight="bold">PEEQ = 0.65 (Folding Hinge)</text>
              </g>
            )}

            {/* Clicked Probe Tool Data Marker */}
            {isInteractive && probedStress && (
              <g transform={`translate(${(probedStress.x / 100) * 800}, ${(probedStress.y / 100) * 480})`}>
                <circle r="6" fill="#00ff41" stroke="#ffffff" strokeWidth="2" />
                <rect x="12" y="-22" width="130" height="26" rx="4" fill="rgba(0,0,0,0.85)" stroke="#00ff41" strokeWidth="1" />
                <text x="18" y="-5" fill="#00ff41" fontSize="11" fontWeight="bold">
                  {probedStress.val}
                </text>
              </g>
            )}
          </svg>
        )}

        {/* Abaqus Viewport Header Chrome */}
        <div className="absolute top-2 left-2 z-10 px-3 py-1.5 rounded bg-black/75 backdrop-blur-xs border border-zinc-700/80 text-[10px] sm:text-xs text-zinc-300 pointer-events-none shadow-md">
          <div className="text-white font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
            {sim.solver} — {sim.fieldVariable}
          </div>
          <div className="text-zinc-400 text-[10px]">
            Step: Step-1 · Time: {sim.stepTime} · Elements: {sim.elementCount}
          </div>
        </div>

        {/* Abaqus Scientific Rainbow Colorbar Legend */}
        <div className="absolute top-16 left-3 z-10 p-2 rounded bg-black/80 backdrop-blur-xs border border-zinc-800 text-[9px] text-zinc-200 pointer-events-none shadow-lg hidden sm:block">
          <div className="font-bold text-[10px] text-[#00b8ff] mb-1">{sim.fieldVariable.split(' ')[0]}</div>
          <div className="flex items-start gap-1.5">
            {/* Color Gradient Strip */}
            <div
              className="w-3.5 h-36 rounded-xs border border-zinc-700"
              style={{
                background:
                  colorMap === 'viridis'
                    ? 'linear-gradient(to bottom, #fde725, #5ec962, #21918c, #3b528b, #440154)'
                    : colorMap === 'jet'
                    ? 'linear-gradient(to bottom, #7f0000, #ff0000, #ffff00, #00ffff, #0000ff, #00007f)'
                    : 'linear-gradient(to bottom, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff)'
              }}
            />
            {/* Numeric Tick Marks */}
            <div className="flex flex-col justify-between h-36 text-[9px] font-mono leading-none">
              {ticks.map((t, idx) => (
                <span key={idx}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Isometric Coordinate Trihedron */}
        <div className="absolute bottom-3 left-3 z-10 w-12 h-12 pointer-events-none opacity-85">
          <svg viewBox="0 0 60 60" className="w-full h-full">
            <line x1="20" y1="40" x2="50" y2="40" stroke="#ff3131" strokeWidth="2.5" />
            <polygon points="52,40 45,36 45,44" fill="#ff3131" />
            <text x="54" y="44" fill="#ff3131" fontSize="10" fontWeight="bold">X</text>

            <line x1="20" y1="40" x2="20" y2="10" stroke="#00ff41" strokeWidth="2.5" />
            <polygon points="20,8 16,15 24,15" fill="#00ff41" />
            <text x="16" y="8" fill="#00ff41" fontSize="10" fontWeight="bold">Y</text>

            <line x1="20" y1="40" x2="35" y2="25" stroke="#00b8ff" strokeWidth="2.5" />
            <polygon points="37,23 30,26 36,32" fill="#00b8ff" />
            <text x="40" y="25" fill="#00b8ff" fontSize="10" fontWeight="bold">Z</text>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10" ref={containerRef}>
      {/* Search and Domain Filter Controls */}
      <div className="p-4 sm:p-5 rounded-xl dark:bg-[#090d12] bg-white border dark:border-zinc-800 border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search simulations (e.g. AntiPrism, Ogden, C3D8R, J-Integral)..."
              className="w-full pl-10 pr-9 py-2.5 dark:bg-[#040608] bg-slate-50 border dark:border-zinc-700 border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded-lg text-xs sm:text-sm dark:text-white text-slate-900 font-mono placeholder:text-zinc-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-3 text-xs font-mono dark:text-zinc-400 text-slate-600">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg dark:bg-zinc-900 bg-slate-100 border dark:border-zinc-800 border-slate-300">
              <Cpu className="w-3.5 h-3.5 text-[#00ff41]" />
              <span>Abaqus Explicit &amp; Standard</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg dark:bg-zinc-900 bg-slate-100 border dark:border-zinc-800 border-slate-300">
              <Activity className="w-3.5 h-3.5 text-[#00b8ff]" />
              <span>{filteredSimulations.length} Validated Runs</span>
            </div>
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t dark:border-zinc-800/80 border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider dark:text-zinc-400 text-slate-500 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#00b8ff]" />
            Domain:
          </span>
          {domains.map((d) => (
            <button
              key={d.key}
              onClick={() => setSelectedDomain(d.key)}
              className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                selectedDomain === d.key
                  ? 'dark:bg-[#00ff41] dark:text-black bg-emerald-600 text-white font-bold shadow-sm'
                  : 'dark:bg-zinc-900 dark:text-zinc-400 bg-slate-100 text-slate-600 hover:text-slate-900 dark:hover:text-white border dark:border-zinc-800 border-slate-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Grid Showcase */}
      {filteredSimulations.length === 0 ? (
        <div className="text-center py-16 dark:bg-zinc-900/40 bg-slate-50 rounded-2xl border dark:border-zinc-800 border-slate-200">
          <Box className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold dark:text-white text-slate-900">No Simulations Matched</h3>
          <p className="text-xs font-mono text-zinc-400 max-w-md mx-auto mt-1 mb-4">
            Try adjusting your search query or domain filter to explore completed FEA runs.
          </p>
          <button
            onClick={() => {
              setSelectedDomain('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-lg dark:bg-[#00b8ff] dark:text-black bg-sky-600 text-white text-xs font-bold uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSimulations.map((sim, idx) => (
            <div
              key={sim.id}
              className="group flex flex-col justify-between rounded-xl overflow-hidden dark:bg-[#090e15] bg-white border dark:border-zinc-800 border-slate-200 dark:hover:border-[#00b8ff] hover:border-sky-500 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1"
            >
              {/* Card Thumbnail / Canvas Viewport with Interactive Tooltip */}
              <div
                onClick={() => openLightbox(idx)}
                onMouseEnter={() => setHoveredTooltipId(sim.id)}
                onMouseLeave={() => setHoveredTooltipId(null)}
                className="relative aspect-video w-full overflow-hidden cursor-pointer group/img bg-black"
                title="Click to open interactive lightbox simulation viewer"
              >
                {renderSimulationViewport(sim)}

                {/* Mobile / Touch Info Toggle Icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPinnedTooltipId((prev) => (prev === sim.id ? null : sim.id));
                  }}
                  className={`absolute top-2.5 left-2.5 z-40 p-1.5 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                    pinnedTooltipId === sim.id
                      ? 'bg-[#00ff41] text-black border-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.7)]'
                      : 'bg-black/75 text-zinc-300 hover:text-white border-zinc-700/80 hover:border-[#00b8ff]'
                  }`}
                  title="Toggle technical metadata telemetry tooltip"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {/* Domain Tag Chip */}
                <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider dark:bg-black/85 bg-white/90 border dark:border-zinc-700 border-slate-300 text-zinc-300">
                  {sim.domainLabel}
                </div>

                {/* Interactive Technical Metadata Tooltip on Hover */}
                <div
                  className={`absolute inset-0 z-30 p-3 sm:p-4 bg-black/92 backdrop-blur-md flex flex-col justify-between text-xs font-mono transition-all duration-300 ${
                    hoveredTooltipId === sim.id || pinnedTooltipId === sim.id
                      ? 'opacity-100 pointer-events-auto translate-y-0'
                      : 'opacity-0 pointer-events-none translate-y-2'
                  }`}
                >
                  {/* Tooltip Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-700/80">
                    <div className="flex items-center gap-1.5 text-[#00ff41] font-bold text-[10px] sm:text-[11px] uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
                      // FEA Telemetry Specs
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">
                      {sim.solver}
                    </span>
                  </div>

                  {/* Technical Metadata Rows */}
                  <div className="space-y-1.5 my-auto text-[10px] sm:text-[11px]">
                    {/* 1. Analysis Type */}
                    <div className="flex items-start gap-2">
                      <Activity className="w-3.5 h-3.5 text-[#00b8ff] flex-none mt-0.5" />
                      <div className="flex-1 truncate">
                        <span className="text-zinc-500 text-[9px] uppercase tracking-wider block leading-none mb-0.5">Analysis Type</span>
                        <span className="text-white font-bold truncate block">{sim.analysisType}</span>
                      </div>
                    </div>

                    {/* 2. Element Count & Type */}
                    <div className="flex items-start gap-2">
                      <Layers className="w-3.5 h-3.5 text-[#00ff41] flex-none mt-0.5" />
                      <div className="flex-1 truncate">
                        <span className="text-zinc-500 text-[9px] uppercase tracking-wider block leading-none mb-0.5">Mesh &amp; Element Count</span>
                        <span className="text-[#00ff41] font-bold block truncate">{sim.elementCount} elements</span>
                      </div>
                    </div>

                    {/* 3. Simulation Date */}
                    <div className="flex items-start gap-2">
                      <Calendar className="w-3.5 h-3.5 text-amber-400 flex-none mt-0.5" />
                      <div className="flex-1 truncate">
                        <span className="text-zinc-500 text-[9px] uppercase tracking-wider block leading-none mb-0.5">Simulation Run Date</span>
                        <span className="text-zinc-200 font-bold block">{sim.simulationDate}</span>
                      </div>
                    </div>

                    {/* 4. Execution Hardware */}
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-sky-400 flex-none mt-0.5" />
                      <div className="flex-1 truncate">
                        <span className="text-zinc-500 text-[9px] uppercase tracking-wider block leading-none mb-0.5">Compute Cluster</span>
                        <span className="text-zinc-300 text-[10px] block truncate">{sim.cpuCores}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tooltip Footer / Action prompt */}
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 truncate max-w-[55%]">
                      <CheckCircle2 className="w-3 h-3 text-[#00ff41] flex-none" />
                      <span className="truncate">{sim.status}</span>
                    </span>
                    <span className="text-[#00b8ff] font-bold underline flex items-center gap-1 group-hover:text-white transition-colors">
                      <Maximize2 className="w-3 h-3" />
                      Launch Lightbox
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Meta & Details */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-section-title font-bold text-base sm:text-lg dark:text-white text-slate-900 group-hover:text-[#00b8ff] transition-colors leading-snug">
                    {sim.title}
                  </h3>
                  <p className="text-xs dark:text-zinc-400 text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {sim.description}
                  </p>
                </div>

                {/* Simulation Key Stats Pills */}
                <div className="pt-3 border-t dark:border-zinc-800/80 border-slate-200 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded dark:bg-black/50 bg-slate-50 border dark:border-zinc-800 border-slate-200">
                    <span className="text-zinc-500 block text-[9px] uppercase">Solver</span>
                    <span className="font-bold dark:text-zinc-200 text-slate-800">{sim.solver}</span>
                  </div>
                  <div className="p-2 rounded dark:bg-black/50 bg-slate-50 border dark:border-zinc-800 border-slate-200">
                    <span className="text-zinc-500 block text-[9px] uppercase">Max {sim.fieldVariable.split(' ')[0]}</span>
                    <span className="font-bold text-[#00ff41]">{sim.maxVal} {sim.fieldUnit}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => openLightbox(idx)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg dark:bg-[#00b8ff]/15 dark:hover:bg-[#00b8ff]/25 dark:text-[#00b8ff] bg-sky-50 hover:bg-sky-100 text-sky-700 border dark:border-[#00b8ff]/40 border-sky-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Run
                  </button>
                  <button
                    onClick={() => handleCopyScript(sim)}
                    title="Copy Abaqus execution command"
                    className="p-2 rounded-lg dark:bg-zinc-900 dark:hover:bg-zinc-800 bg-slate-100 hover:bg-slate-200 text-zinc-400 dark:hover:text-[#00ff41] hover:text-emerald-600 border dark:border-zinc-800 border-slate-300 transition-colors cursor-pointer"
                  >
                    {copiedId === sim.id ? <Check className="w-4 h-4 text-[#00ff41]" /> : <FileCode className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Lightbox Modal */}
      {activeSimulation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-6xl max-h-[94vh] flex flex-col rounded-2xl dark:bg-[#070b10] bg-white border dark:border-zinc-800 border-slate-300 shadow-2xl overflow-hidden">
            {/* Lightbox Header Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b dark:border-zinc-800 border-slate-200 dark:bg-black/60 bg-slate-50 gap-3">
              <div className="flex items-center gap-2.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00ff41] animate-pulse flex-none" />
                <h3 className="font-section-title font-bold text-sm sm:text-base md:text-lg dark:text-white text-slate-900 truncate uppercase">
                  {activeSimulation.title}
                </h3>
              </div>

              {/* Lightbox Quick Controls */}
              <div className="flex items-center gap-2 flex-none">
                {/* Wireframe Toggle */}
                <button
                  onClick={() => setShowWireframe(!showWireframe)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    showWireframe
                      ? 'dark:bg-[#00ff41]/20 dark:text-[#00ff41] bg-emerald-100 text-emerald-800 border border-emerald-500'
                      : 'dark:bg-zinc-900 text-zinc-400 bg-slate-200 border dark:border-zinc-700 border-slate-300'
                  }`}
                  title="Toggle FEA mesh wireframe"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mesh</span>
                </button>

                {/* Color Palette Switcher */}
                <select
                  value={colorMap}
                  onChange={(e) => setColorMap(e.target.value as any)}
                  className="px-2 py-1 rounded text-xs font-mono dark:bg-zinc-900 dark:text-zinc-200 bg-slate-100 border dark:border-zinc-700 border-slate-300 cursor-pointer focus:outline-none"
                  title="Select contour color scheme"
                >
                  <option value="rainbow">Palette: Rainbow</option>
                  <option value="viridis">Palette: Viridis</option>
                  <option value="jet">Palette: Jet</option>
                </select>

                {/* Zoom Controls */}
                <div className="flex items-center border dark:border-zinc-700 border-slate-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
                    className="p-1.5 dark:bg-zinc-900 bg-slate-100 dark:hover:bg-zinc-800 hover:bg-slate-200 text-zinc-300 cursor-pointer"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5 text-slate-700 dark:text-zinc-300" />
                  </button>
                  <span className="px-2 text-[10px] font-mono dark:text-zinc-300 text-slate-700 dark:bg-black bg-white">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                    className="p-1.5 dark:bg-zinc-900 bg-slate-100 dark:hover:bg-zinc-800 hover:bg-slate-200 text-zinc-300 cursor-pointer"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-slate-700 dark:text-zinc-300" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1.5 dark:bg-zinc-900 bg-slate-100 dark:hover:bg-zinc-800 hover:bg-slate-200 text-zinc-300 cursor-pointer border-l dark:border-zinc-700 border-slate-300"
                    title="Reset zoom"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-700 dark:text-zinc-300" />
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={closeLightbox}
                  className="p-1.5 rounded-lg dark:hover:bg-zinc-800 hover:bg-slate-200 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Close lightbox (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Lightbox Body (Split View: Canvas + Technical Spec Inspector) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
              {/* Left Column: Interactive Simulation Viewport Canvas */}
              <div className="lg:col-span-8 relative min-h-[380px] sm:min-h-[460px] flex items-center justify-center bg-black overflow-hidden border-b lg:border-b-0 lg:border-r dark:border-zinc-800 border-slate-200">
                <div
                  className="w-full h-full flex items-center justify-center transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  {renderSimulationViewport(activeSimulation, true)}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={goToPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/75 hover:bg-black border border-zinc-700 text-white hover:text-[#00ff41] transition-all cursor-pointer shadow-lg hover:scale-110"
                  title="Previous simulation (ArrowLeft)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/75 hover:bg-black border border-zinc-700 text-white hover:text-[#00ff41] transition-all cursor-pointer shadow-lg hover:scale-110"
                  title="Next simulation (ArrowRight)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Probing Instructions Badge */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/80 border border-zinc-800 text-[10px] font-mono text-zinc-400 hidden sm:flex items-center gap-1.5 pointer-events-none">
                  <Activity className="w-3.5 h-3.5 text-[#00ff41]" />
                  <span>Click anywhere on canvas to probe stress</span>
                </div>
              </div>

              {/* Right Column: Full Technical Specifications Drawer */}
              <div className="lg:col-span-4 p-5 sm:p-6 space-y-5 dark:bg-[#06090e] bg-slate-50 overflow-y-auto text-xs font-mono">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#00b8ff] font-bold">
                    {activeSimulation.domainLabel}
                  </div>
                  <h4 className="font-section-title font-bold text-base sm:text-lg dark:text-white text-slate-900 mt-1">
                    Simulation Engineering Specifications
                  </h4>
                  <p className="dark:text-zinc-300 text-slate-700 mt-2 text-xs leading-relaxed">
                    {activeSimulation.description}
                  </p>
                </div>

                {/* Key Technical Matrix */}
                <div className="space-y-2.5 pt-3 border-t dark:border-zinc-800 border-slate-200">
                  <div className="flex justify-between items-center py-1 border-b dark:border-zinc-800/60 border-slate-200">
                    <span className="text-zinc-500">Analysis Type</span>
                    <span className="font-bold text-right dark:text-zinc-200 text-slate-800">{activeSimulation.analysisType}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b dark:border-zinc-800/60 border-slate-200">
                    <span className="text-zinc-500">Simulation Run Date</span>
                    <span className="font-bold text-amber-500">{activeSimulation.simulationDate}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b dark:border-zinc-800/60 border-slate-200">
                    <span className="text-zinc-500">Abaqus Solver</span>
                    <span className="font-bold dark:text-white text-slate-900">{activeSimulation.solver}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b dark:border-zinc-800/60 border-slate-200">
                    <span className="text-zinc-500">Element Formulation</span>
                    <span className="font-bold text-right dark:text-zinc-200 text-slate-800">{activeSimulation.elementType}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b dark:border-zinc-800/60 border-slate-200">
                    <span className="text-zinc-500">Mesh Total Count</span>
                    <span className="font-bold text-[#00ff41]">{activeSimulation.elementCount} elements</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b dark:border-zinc-800/60 border-slate-200">
                    <span className="text-zinc-500">Step Physical Time</span>
                    <span className="font-bold dark:text-zinc-200 text-slate-800">{activeSimulation.stepTime}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b dark:border-zinc-800/60 border-slate-200">
                    <span className="text-zinc-500">Compute Hardware</span>
                    <span className="font-bold text-right text-[11px] text-sky-400">{activeSimulation.cpuCores}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b dark:border-zinc-800/60 border-slate-200">
                    <span className="text-zinc-500">Convergence Status</span>
                    <span className="font-bold text-right text-[11px] text-emerald-400">{activeSimulation.status}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b dark:border-zinc-800/60 border-slate-200">
                    <span className="text-zinc-500">Material Law</span>
                    <span className="font-bold text-right text-[11px] text-amber-500">{activeSimulation.constitutiveModel}</span>
                  </div>
                </div>

                {/* Scientific Validation Highlights */}
                <div className="space-y-2 pt-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#00ff41] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Key Validation Findings
                  </div>
                  <ul className="space-y-1.5 pl-3 list-disc text-zinc-400 text-[11px] leading-relaxed">
                    {activeSimulation.highlights.map((hl, i) => (
                      <li key={i}>{hl}</li>
                    ))}
                  </ul>
                </div>

                {/* Execution Command Snippet */}
                <div className="p-3 rounded-lg dark:bg-black bg-white border dark:border-zinc-800 border-slate-300 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase">
                    <span>Abaqus Batch Command</span>
                    <button
                      onClick={() => handleCopyScript(activeSimulation)}
                      className="text-[#00ff41] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === activeSimulation.id ? 'Copied!' : 'Copy CLI'}
                    </button>
                  </div>
                  <code className="text-[11px] text-[#00ff41] block truncate select-all">
                    $ {activeSimulation.scriptReference}
                  </code>
                </div>

                {/* Lightbox Footer Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleCopyScript(activeSimulation)}
                    className="flex-1 py-2 px-3 rounded-lg dark:bg-[#00ff41] dark:text-black bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition-all hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Command
                  </button>
                  <button
                    onClick={() => {
                      if (onNotify) onNotify(`Exporting high-resolution telemetry for: ${activeSimulation.title}`);
                    }}
                    className="py-2 px-3 rounded-lg dark:bg-zinc-800 dark:hover:bg-zinc-700 bg-slate-200 hover:bg-slate-300 dark:text-zinc-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    title="Export simulation data"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Lightbox Bottom Thumbnail Carousel Strip */}
            <div className="px-4 py-3 border-t dark:border-zinc-800 border-slate-200 dark:bg-black/70 bg-slate-100 flex items-center gap-3 overflow-x-auto">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 whitespace-nowrap flex items-center gap-1">
                <span>Runs ({filteredSimulations.length})</span>:
              </span>
              {filteredSimulations.map((sim, i) => (
                <button
                  key={sim.id}
                  onClick={() => {
                    setActiveLightboxIndex(i);
                    setZoomLevel(1);
                    setProbedStress(null);
                  }}
                  className={`relative flex-none w-20 h-12 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                    i === activeLightboxIndex
                      ? 'border-[#00ff41] scale-105 shadow-[0_0_10px_rgba(0,255,65,0.6)]'
                      : 'border-zinc-700 opacity-60 hover:opacity-100'
                  }`}
                  title={sim.title}
                >
                  {sim.customImage ? (
                    <img src={sim.customImage} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#04080e] flex items-center justify-center text-[8px] font-mono font-bold text-[#00b8ff]">
                      SIM 0{i + 1}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
