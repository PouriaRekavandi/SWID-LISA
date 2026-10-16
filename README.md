# SWID-SHRK — Mechanical & Aerospace Research Laboratory

A modern, high-performance React application for the **SWID-SHRK** (Something Weird is Discovering / RKV Materials) mechanical and aerospace research lab directed by **Pouria Hejazi Rekavandi**.

## Core Features Preserved & Enhanced

1. **Active Research Initiative**:
   - Interactive announcement banner with modal breakdown of the Liquid Crystal Elastomer (LCE) and PINN neural inverse design initiative.

2. **Cosmic Cyber Hero Stage**:
   - Signature animated stage featuring the `SWID-SHRK` insignia, orbital dashed rings, and twinkling stars.
   - Distinctive typography (`Cinzel Decorative`, `Allura`, `Orbitron`, `Roboto Mono`) and the authentic `MIGA` mark.

3. **Principal Investigator Profile**:
   - Researcher credentials, scanline ambient effects, avatar portrait, research focus tags, the inspirational poem, and personal dedication.

4. **Interactive Research Modules & Tutorials**:
   - **Module I**: Fatigue & Fracture Mechanics (multiaxial life prediction, S-N endurance, crack propagation).
   - **Module II**: Neural Biomechanics (brain parenchyma trauma simulation, high-strain viscoelastic modeling).
   - **Module III**: Energy-Absorbing Metamaterials with embedded interactive video tutorial player for AntiPrism structures (Part 1 and Part 2 switching, progress tracking, fallback direct MP4 download).
   - **Module IV**: Fracture in Cementitious Materials (quasi-brittle fracture, fiber-reinforced composites, DIC full-field measurement).
   - Primary research focus cards (Composite Sandwich Panels, Bio-inspired Helicoidal Bouligand Composites, Computational FEA).

5. **Peer-Reviewed Publications Catalog**:
   - Comprehensive archive of journal papers (*Journal of the Mechanical Behavior of Biomedical Materials*, *Materials & Design*, *Theoretical and Applied Fracture Mechanics*, *International Journal of Fatigue*).
   - Instant search by title, author, journal, or year.
   - Category filtering and one-click BibTeX citation copying.

6. **Thesis Student Supervision Registry (Full CRUD)**:
   - Graduate supervision record tracking (BSc, MSc, PhD, Postdoctoral).
   - Add, edit, and delete student records with date validation.
   - Live search across all fields (name, thesis topic, ID, status).
   - Real-time statistics counters (Total, In Progress, Completed).
   - Export to CSV (`.csv`) and JSON (`.json`), plus JSON file import.
   - Persistent browser storage (`localStorage`) with backward compatibility.
   - Global feedback toast notifications.

7. **Laboratory Infrastructure & Gear**:
   - Details on the 128-core HPC cluster, MTS biaxial servohydraulic dynamic rigs, stereoscopic DIC optical strain diagnostics, and multi-material additive manufacturing.

8. **Direct Communication Portal**:
   - Lab coordinates at the University of Maryland, Baltimore County (UMBC), direct PI contact, and dispatch transmission form.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS with custom cyber neon design tokens
- **Icons**: Lucide React
- **Storage**: LocalStorage with CSV/JSON export & import