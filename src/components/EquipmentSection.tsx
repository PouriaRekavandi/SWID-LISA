import React from 'react';
import { Cpu, Wrench, Microscope, Gauge } from 'lucide-react';

export const EquipmentSection: React.FC = () => {
  const gear = [
    {
      title: 'HPC Simulation Cluster',
      category: 'Computational Facility',
      icon: <Cpu className="w-6 h-6 dark:text-[#00b8ff] text-sky-600" />,
      desc: 'Dedicated Linux high-performance compute nodes running multi-core parallel Abaqus/Explicit, FEBio, and OpenFOAM simulations for large-deformation metamaterial and brain biomechanics models.',
      specs: ['128 Xeon/EPYC Compute Cores', '512GB ECC DDR5 RAM', 'NVIDIA Tensor Core Acceleration', 'Parallel Fortran UMAT Solvers'],
    },
    {
      title: 'MTS Biaxial Dynamic Servohydraulic Rig',
      category: 'Experimental Testing',
      icon: <Gauge className="w-6 h-6 dark:text-[#00ff41] text-emerald-600" />,
      desc: 'Closed-loop multi-axial fatigue and tension-compression loading frames equipped with high-precision load cells and environmental thermal chambers for cyclic endurance testing.',
      specs: ['100 kN Dynamic Fatigue Capacity', 'Axial-Torsional Combined Loading', 'Sub-ambient to 300°C Temp Chamber', '100 Hz Cyclic Testing Rate'],
    },
    {
      title: 'Stereoscopic Digital Image Correlation (DIC)',
      category: 'Optical Strain Diagnostics',
      icon: <Microscope className="w-6 h-6 dark:text-[#36c7ff] text-sky-600" />,
      desc: 'Dual synchronized 12-Megapixel high-speed CMOS sensors calibrated for 3D full-field strain mapping, microcrack path detection, and cohesive fracture bridging.',
      specs: ['5,000 fps High-Speed Capture', '0.005 pixel Sub-pixel Interpolation', 'Non-contact 3D Strain Fields', 'Direct ABAQUS Mesh Mapping'],
    },
    {
      title: 'Multi-Material Metamaterial Fabricator',
      category: 'Additive Manufacturing',
      icon: <Wrench className="w-6 h-6 dark:text-[#00e676] text-emerald-600" />,
      desc: 'High-resolution stereolithography (SLA) and elastomeric 3D additive synthesis platforms for printing AntiPrism cell topologies and liquid crystal elastomer lattices.',
      specs: ['25 μm XY Laser Spot Precision', 'High-Toughness & Flexible Resins', 'Gradient Modulus Deposition', 'Continuous UV Cure Chamber'],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-block border-b-2 dark:border-[#00b8ff] border-sky-600 pb-1 mb-4">
          <h2 className="font-section-title text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider dark:text-white text-slate-900 flex items-center">
            <span className="dark:text-[#00ff41] text-emerald-600 font-mono mr-2 select-none">//</span>
            <span>Laboratory Infrastructure &amp; Gear</span>
          </h2>
        </div>
        <p className="dark:text-zinc-400 text-slate-600 font-mono text-sm max-w-3xl leading-relaxed">
          State-of-the-art computational clusters, dynamic servo-hydraulic load systems, and synchronized optical measurement instruments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gear.map((item) => (
          <div
            key={item.title}
            className="dark:bg-[#121b24]/70 bg-white border dark:border-[#26333d] border-slate-200 dark:hover:border-[#00b8ff] hover:border-sky-500 rounded-xl p-6 transition-all duration-300 dark:shadow-[0_0_20px_rgba(0,184,255,0.15)] shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded dark:bg-black/60 bg-sky-50 border dark:border-zinc-800 border-sky-100">
                  {item.icon}
                </div>
                <span className="text-[11px] font-mono dark:text-[#00ff41] text-emerald-700 dark:bg-[#00ff41]/10 bg-emerald-50 px-2.5 py-0.5 rounded-full border dark:border-[#00ff41]/30 border-emerald-200 font-bold">
                  {item.category}
                </span>
              </div>

              <h3 className="font-orbitron font-bold text-base sm:text-lg dark:text-white text-slate-900">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm dark:text-zinc-300 text-slate-600 font-mono leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t dark:border-zinc-800/80 border-slate-200">
              <div className="text-[11px] font-bold dark:text-zinc-400 text-slate-500 uppercase tracking-wider mb-2">
                Key Capabilities:
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 list-none p-0 m-0">
                {item.specs.map((spec) => (
                  <li key={spec} className="text-xs dark:text-zinc-300 text-slate-700 font-mono flex items-center gap-1.5">
                    <span className="dark:text-[#00b8ff] text-sky-600 font-bold">•</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
