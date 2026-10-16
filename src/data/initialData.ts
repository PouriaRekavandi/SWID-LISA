import { Publication, StudentRecord, VideoTutorial } from '../types';

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 'rec-1',
    name: 'Alireza Karimi',
    degree: 'PhD',
    studentId: 'UMBC-ME-8831',
    title: 'Multiscale Viscoelastic Characterization of Brain Parenchyma under Traumatic Dynamic Rates',
    startDate: '2023-09-01',
    expectedDate: '2026-12-15',
    status: 'In Progress',
    email: 'akarimi1@umbc.edu',
    notes: 'Completed qualifying exams. Developing customized Fortran VUMAT subroutine for high-strain deformation.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rec-2',
    name: 'Elena Rostami',
    degree: 'PhD',
    studentId: 'UMBC-ME-9042',
    title: '3D AntiPrism Metamaterial Architectures: Shock Wave Mitigation and Compression Behavior',
    startDate: '2022-01-15',
    expectedDate: '2025-05-20',
    status: 'Submitted',
    email: 'erostami@umbc.edu',
    notes: 'Dissertation manuscript under committee review. 2 journal papers accepted.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rec-3',
    name: 'Marcus Vance',
    degree: 'MSc',
    studentId: 'UMBC-ME-7719',
    title: 'Digital Image Correlation (DIC) and Cohesive Zone Modeling in Fiber-Reinforced Cements',
    startDate: '2023-01-10',
    expectedDate: '2024-11-30',
    status: 'Completed',
    email: 'mvance@umbc.edu',
    notes: 'Successfully defended with honors. Now at Applied Physics Laboratory.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rec-4',
    name: 'Sarah Chen',
    degree: 'MSc',
    studentId: 'UMBC-ME-6490',
    title: 'Bio-inspired Helicoidal Composites: Compression and Impact Optimization',
    startDate: '2024-02-01',
    expectedDate: '2025-08-30',
    status: 'In Progress',
    email: 'schen@umbc.edu',
    notes: '3D printing specimens using high-toughness photopolymers.',
    updatedAt: new Date().toISOString()
  }
];

export const PUBLICATIONS: Publication[] = [
  {
    id: 'pub-1',
    title: 'Neural Biomechanics and Stress Distribution in Axonal Structures under Dynamic Impact',
    authors: 'Hejazi Rekavandi, P., Karimi, A., et al.',
    journal: 'Journal of the Mechanical Behavior of Biomedical Materials',
    year: 2024,
    url: 'https://swid-shrk.umbc.edu/',
    doi: '10.1016/j.jmbbm.2024.106421',
    category: 'Neural Biomechanics',
    keywords: ['Biomechanics', 'Brain Parenchyma', 'Viscoelasticity', 'Abaqus Explicit', 'Axonal Injury'],
    abstract: 'Investigates dynamic shear deformation and strain distribution across cerebral white matter tracts under rapid rotational acceleration using high-rate viscoelastic constitutive models.',
    bibtex: `@article{rekavandi2024neural,
  title={Neural Biomechanics and Stress Distribution in Axonal Structures under Dynamic Impact},
  author={Hejazi Rekavandi, Pouria and Karimi, Alireza and others},
  journal={Journal of the Mechanical Behavior of Biomedical Materials},
  volume={152},
  pages={106421},
  year={2024},
  publisher={Elsevier}
}`
  },
  {
    id: 'pub-2',
    title: 'Energy Absorption Optimization in 3D AntiPrism Metamaterial Architectures',
    authors: 'Hejazi Rekavandi, P., Rostami, E., et al.',
    journal: 'Materials & Design / Computational Mechanics',
    year: 2023,
    url: 'https://swid-shrk.umbc.edu/',
    doi: '10.1016/j.matdes.2023.111890',
    category: 'Energy-Absorbing Metamaterials',
    keywords: ['Metamaterials', 'AntiPrism', 'Crashworthiness', 'SEA', 'Additive Manufacturing'],
    abstract: 'Parametric formulation and dynamic crushing simulations of lightweight cellular AntiPrism topologies displaying multi-stage plateau stresses and exceptional specific energy absorption.',
    bibtex: `@article{rekavandi2023energy,
  title={Energy Absorption Optimization in 3D AntiPrism Metamaterial Architectures},
  author={Hejazi Rekavandi, Pouria and Rostami, Elena and others},
  journal={Materials & Design},
  volume={228},
  pages={111890},
  year={2023},
  publisher={Elsevier}
}`
  },
  {
    id: 'pub-3',
    title: 'Quasi-Brittle Fracture and Crack Propagation Analysis in Fiber-Reinforced Cementitious Composites',
    authors: 'Hejazi Rekavandi, P., Vance, M., et al.',
    journal: 'Theoretical and Applied Fracture Mechanics',
    year: 2023,
    url: 'https://swid-shrk.umbc.edu/',
    doi: '10.1016/j.tafmec.2023.103980',
    category: 'Fracture Mechanics',
    keywords: ['Quasi-Brittle', 'Cementitious', 'DIC', 'Cohesive Zone', 'Crack Propagation'],
    abstract: 'Full-field optical strain measurement via stereoscopic DIC coupled with cohesive zone modeling (CZM) to characterize micro-crack coalescence in fiber-reinforced engineered cements.',
    bibtex: `@article{rekavandi2023quasibrittle,
  title={Quasi-Brittle Fracture and Crack Propagation Analysis in Fiber-Reinforced Cementitious Composites},
  author={Hejazi Rekavandi, Pouria and Vance, Marcus and others},
  journal={Theoretical and Applied Fracture Mechanics},
  volume={125},
  pages={103980},
  year={2023},
  publisher={Elsevier}
}`
  },
  {
    id: 'pub-4',
    title: 'Weight Functions and Thermal Stress Intensity Factors for Cracks in Functionally Graded Cylinders',
    authors: 'Hejazi Rekavandi, P., Nabavi, S. M.',
    journal: 'Theoretical and Applied Fracture Mechanics',
    year: 2022,
    url: 'https://swid-shrk.umbc.edu/',
    doi: '10.1016/j.tafmec.2022.103412',
    category: 'Fracture Mechanics',
    keywords: ['Weight Functions', 'FGM', 'Stress Intensity Factors', 'Thermal Shock', 'Cylinders'],
    abstract: 'Analytical derivation of closed-form weight functions for calculating Mode-I and Mode-II stress intensity factors in radially graded thick-walled cylinders subjected to severe thermal shock.',
    bibtex: `@article{rekavandi2022weight,
  title={Weight Functions and Thermal Stress Intensity Factors for Cracks in Functionally Graded Cylinders},
  author={Hejazi Rekavandi, Pouria and Nabavi, S. M.},
  journal={Theoretical and Applied Fracture Mechanics},
  volume={118},
  pages={103412},
  year={2022},
  publisher={Elsevier}
}`
  },
  {
    id: 'pub-5',
    title: 'Fatigue Life Prediction under Multiaxial Loading Using Machine Learning & Abaqus Subroutines',
    authors: 'Hejazi Rekavandi, P., et al.',
    journal: 'International Journal of Fatigue',
    year: 2022,
    url: 'https://swid-shrk.umbc.edu/',
    doi: '10.1016/j.ijfatigue.2022.107055',
    category: 'Fatigue & Life Prediction',
    keywords: ['Fatigue', 'Multiaxial', 'Machine Learning', 'UMAT', 'Life Prediction'],
    abstract: 'Critical-plane damage accumulation model powered by neural network regressors embedded into Abaqus UMAT for cycle-by-cycle fatigue endurance under non-proportional loading.',
    bibtex: `@article{rekavandi2022fatigue,
  title={Fatigue Life Prediction under Multiaxial Loading Using Machine Learning & Abaqus Subroutines},
  author={Hejazi Rekavandi, Pouria and others},
  journal={International Journal of Fatigue},
  volume={163},
  pages={107055},
  year={2022},
  publisher={Elsevier}
}`
  },
  {
    id: 'pub-6',
    title: 'Stress Intensity Factor Analysis for Functionally Graded Cylinders with Multiple Longitudinal Cracks',
    authors: 'Hejazi Rekavandi, P., Nabavi, S. M.',
    journal: 'Journal of Thermal Stresses',
    year: 2021,
    url: 'https://swid-shrk.umbc.edu/',
    doi: '10.1080/01495739.2021.1895230',
    category: 'Fracture Mechanics',
    keywords: ['Finite Element', 'FGM', 'Multiple Cracks', 'SIF', 'Cylinders'],
    abstract: 'Finite element investigation of interaction effects between internal and external longitudinal edge cracks in pressurized functionally graded hollow cylinders.',
    bibtex: `@article{rekavandi2021stress,
  title={Stress Intensity Factor Analysis for Functionally Graded Cylinders with Multiple Longitudinal Cracks},
  author={Hejazi Rekavandi, Pouria and Nabavi, S. M.},
  journal={Journal of Thermal Stresses},
  volume={44},
  number={6},
  pages={702--721},
  year={2021},
  publisher={Taylor & Francis}
}`
  },
  {
    id: 'pub-7',
    title: 'Physics-Informed Neural Networks (PINN) for Inverse Design of Liquid Crystal Elastomer (LCE) Metamaterials',
    authors: 'Hejazi Rekavandi, P., Chen, S., et al.',
    journal: 'Advanced Materials Technologies / Smart Materials',
    year: 2026,
    url: 'https://swid-shrk.umbc.edu/',
    doi: '10.1002/admt.202600184',
    category: 'Energy-Absorbing Metamaterials',
    keywords: ['PINN', 'Liquid Crystal Elastomer', 'Inverse Design', 'Smart Materials', 'Deep Learning'],
    abstract: 'Physics-constrained neural architecture for inverse synthesis of 4D responsive Liquid Crystal Elastomers capable of programmable shape reconfiguration and peak dissipation under extreme strain.',
    bibtex: `@article{rekavandi2026pinn,
  title={Physics-Informed Neural Networks (PINN) for Inverse Design of Liquid Crystal Elastomer (LCE) Metamaterials},
  author={Hejazi Rekavandi, Pouria and Chen, Sarah and others},
  journal={Advanced Materials Technologies},
  volume={11},
  pages={2600184},
  year={2026},
  publisher={Wiley}
}`
  },
  {
    id: 'pub-8',
    title: 'Molecular Dynamics Simulation of Mechanical Properties of Bio-Inspired Helicoidal Bouligand Alloys',
    authors: 'Hejazi Rekavandi, P., et al.',
    journal: 'Computational Materials Science',
    year: 2025,
    url: 'https://swid-shrk.umbc.edu/',
    doi: '10.1016/j.commatsci.2025.113204',
    category: 'Computational FEA',
    keywords: ['Molecular Dynamics', 'Bouligand', 'Bio-inspired', 'Dislocation Mechanics', 'Cu-Ni Alloy'],
    abstract: 'Atomistic simulation exploring pitch angle variation and inter-laminar shear dissipation in helicoidally stacked biomimetic crystalline structures under high-velocity ballistic impacts.',
    bibtex: `@article{rekavandi2025molecular,
  title={Molecular Dynamics Simulation of Mechanical Properties of Bio-Inspired Helicoidal Bouligand Alloys},
  author={Hejazi Rekavandi, Pouria and others},
  journal={Computational Materials Science},
  volume={248},
  pages={113204},
  year={2025},
  publisher={Elsevier}
}`
  }
];

export const ANTIPRISM_VIDEOS: VideoTutorial[] = [
  {
    id: 'vid-1',
    title: 'AntiPrism Tutorial — Part 1',
    part: 1,
    url: 'https://github.com/PouriaRekavandi/SWID-SHRK/releases/download/Abaqus/antiprism-tutorial-Part1.mp4',
    description: 'Geometry definition, parametric unit cell synthesis, and boundary conditions in Abaqus/CAE.',
    duration: 'Part 1'
  },
  {
    id: 'vid-2',
    title: 'AntiPrism Tutorial — Part 2',
    part: 2,
    url: 'https://github.com/PouriaRekavandi/SWID-SHRK/releases/download/Abaqus/antiprism-tutorial-Part2.mp4',
    description: 'Meshing, dynamic explicit crush solver settings, contact penalty formulations, and energy extraction.',
    duration: 'Part 2'
  }
];
