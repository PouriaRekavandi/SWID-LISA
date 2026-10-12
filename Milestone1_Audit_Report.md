# Milestone 1: Model Audit Report
## Reproducing Burr Spring-Back in Abaqus/Explicit CEL Simulation of PA6

### 1. Objective
The purpose of this audit is to identify why the previous iterations of the PA6 Coupled Eulerian-Lagrangian (CEL) cutting simulation failed to reproduce the inward bending (viscoplastic spring-back) of the machined burrs, and to outline the necessary corrections.

### 2. Findings from Code Review

#### 2.1 Lack of Viscoplastic Recovery (The Primary Cause)
The client correctly hypothesized that the original VUMAT (`VUMAT_PA6_v8.f`) lacked a recovery mechanism. In a purely isotropic (e.g., Voce or Johnson-Cook) plasticity model, once the tool unloads the material, the stress drops into the elastic regime, and the plastic strain remains permanently frozen. The burr is left standing upright because there is no driving force to cause time-dependent reverse yielding.

**Correction implemented in v12/v13:** The updated VUMAT introduces an **Armstrong-Frederick kinematic hardening model** coupled with **static (time/temperature-dependent) thermal recovery**.
*   **Kinematic Hardening:** A back-stress tensor ($\alpha$) tracks the center of the yield surface.
*   **Static Recovery:** Even when elastically unloaded, $\alpha$ decays over time according to an Arrhenius relationship ($r_{stat}(T)$). As $\alpha$ decays, the relative stress state can hit the yield surface from the inside, driving *reverse* plastic flow (spring-back) over time.

#### 2.2 Thermal Expansion Inactivity
In Abaqus, when using a `*User Material` of `TYPE=MECHANICAL`, standard thermal expansion options (like `*Expansion`) cannot be used alongside it; the VUMAT must handle thermal strains manually. In previous versions, the expansion coefficient (`props(31)`) was set to $0.0$, meaning thermal contraction during cooling was entirely disabled.

**Correction:** The `PA6_CEL_SpringBack.py` script assigns a non-zero thermal expansion coefficient ($8.5 \times 10^{-5}$ 1/K) to `PROPS[30]`. The VUMAT `v13.for` correctly reads this as `alpha_th` and subtracts the isotropic volumetric thermal strain ($3 \cdot \alpha \cdot \Delta T$) from the mechanical strain increment.

#### 2.3 Time Scale and Mass Scaling Masks
Viscoplastic recovery is a relatively slow, quasi-static process. The original simulation terminated immediately after cutting ($0.0002$ s), giving the material no time to recover or cool. Furthermore, aggressive mass scaling during a recovery phase can introduce artificial inertia that physically suppresses the slow spring-back motion.

**Correction:**
*   A dedicated `Recovery` step has been added, lasting $T_{REC} = 0.20$ s (or scaled to the relaxation time constant $1/r_{stat}$).
*   Variable mass scaling is injected specifically per step. The `Recovery` step uses a target time increment ($2.0 \times 10^{-7}$ s) that is $100\times$ larger than the cutting step, balancing computational cost while minimizing artificial inertia.

### 3. Next Steps (Milestones 2 & 3)
The physical structure to simulate spring-back is now present in `VUMAT_PA6_v13.for` and the Python script. The next critical phases are:
1.  **Calibration:** The constants for kinematic hardening (`C_kin`, `gamma_kin`) and static recovery (`r_stat0`, `Qact_R`) are currently placeholders. They must be tuned to match the macro-scale geometry targets (190 µm pitch, 75 µm depth, 60 µm inner width) for the as-delivered and dried states.
2.  **Validation:** Run the complete 3D CEL simulation and verify that the burr leans inward by 15-25°, matching the experimental micrographs.
3.  **Analysis:** Extract the final geometry using a Python script to formally validate against the $\pm10\%$ acceptance criteria.
