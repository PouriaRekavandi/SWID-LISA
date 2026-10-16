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
    authors: 'Hejazi Rekavandi, P., et al.',
    journal: 'Journal of the Mechanical Behavior of Biomedical Materials',
    year: 2024,
    url: 'https://swid-shrk.umbc.edu/',
    doi: '10.1016/j.jmbbm.2024.106421',
    category: 'Neural Biomechanics',
    bibtex: `@article{rekavandi2024neural,
  title={Neural Biomechanics and Stress Distribution in Axonal Structures under Dynamic Impact},
  author={Hejazi Rekavandi, Pouria and others},
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
    authors: 'Hejazi Rekavandi, P., et al.',
    journal: 'Materials & Design / Computational Mechanics',
    year: 2023,
    url: 'https://swid-shrk.umbc.edu/',
    doi: '10.1016/j.matdes.2023.111890',
    category: 'Energy-Absorbing Metamaterials',
    bibtex: `@article{rekavandi2023energy,
  title={Energy Absorption Optimization in 3D AntiPrism Metamaterial Architectures},
  author={Hejazi Rekavandi, Pouria and others},
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
    authors: 'Hejazi Rekavandi, P., et al.',
    journal: 'Theoretical and Applied Fracture Mechanics',
    year: 2023,
    url: 'https://swid-shrk.umbc.edu/',
    doi: '10.1016/j.tafmec.2023.103980',
    category: 'Fracture Mechanics',
    bibtex: `@article{rekavandi2023quasibrittle,
  title={Quasi-Brittle Fracture and Crack Propagation Analysis in Fiber-Reinforced Cementitious Composites},
  author={Hejazi Rekavandi, Pouria and others},
  journal={Theoretical and Applied Fracture Mechanics},
  volume={125},
  pages={103980},
  year={2023},
  publisher={Elsevier}
}`
  },
  {
    id: 'pub-4',
    title: 'Fatigue Life Prediction under Multiaxial Loading Using Machine Learning & Abaqus Subroutines',
    authors: 'Hejazi Rekavandi, P., et al.',
    journal: 'International Journal of Fatigue',
    year: 2022,
    url: 'https://swid-shrk.umbc.edu/',
    doi: '10.1016/j.ijfatigue.2022.107055',
    category: 'Fatigue & Life Prediction',
    bibtex: `@article{rekavandi2022fatigue,
  title={Fatigue Life Prediction under Multiaxial Loading Using Machine Learning & Abaqus Subroutines},
  author={Hejazi Rekavandi, Pouria and others},
  journal={International Journal of Fatigue},
  volume={163},
  pages={107055},
  year={2022},
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
