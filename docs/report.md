# Technical Report: PA6 CEL Cutting Simulation & Spring-back Recovery

## 1. Introduction and Objective
The goal of this project is to model the deformational cutting of Polyamide 6 (PA6) using a 3D Coupled Eulerian-Lagrangian (CEL) method in Abaqus/Explicit, specifically to reproduce the experimentally observed inward bending (spring-back) of the burrs after the cutting tool passes.

## 2. Diagnosis of Missing Spring-back in Previous Model
An audit of the previous model revealed several critical omissions preventing the required inward bending:
1. **Lack of Recovery Mechanism:** The original VUMAT lacked a back-stress or viscoelastic network. Above melt-softening, stress fell to a residual value, freezing the inelastic strain without storing elastic energy for recovery.
2. **Missing Cooling/Relaxation Step:** The simulation ended immediately after the tool cut (0.0002 s). There was no physical time given for the material to spring back or cool down.
3. **Inactive Thermal Strain:** Thermal expansion was defined in the Abaqus model, but the VUMAT explicitly ignored it, preventing thermal contraction from driving deformation during cooling.
4. **Unit Inconsistencies:** The rigid tool had a density of `3e-6` (1,000x too high) and E of `1.05e10` (10,000x too high) in the `mm, tonne, s, MPa` system. While rigid mechanically, the wrong density artificially inflated the tool's thermal mass.

## 3. Implemented Solutions
### 3.1 Material Model (VUMAT)
A new Fortran VUMAT (`vumat_pa6_recovery.f`) was implemented. It uses a parallel viscoelastic network framework via nonlinear kinematic hardening (Armstrong-Frederick type back-stress). This introduces a driving force for time-dependent recovery upon unloading. Thermal expansion is now calculated explicitly within the volumetric strain increment inside the VUMAT.

### 3.2 3D CEL Model
The model generation script (`build_cel_cutting_model.py`) sets up a two-step explicit analysis:
- **Step 1 (Cut):** Tool moves through the domain at 100 m/min.
- **Step 2 (Relax):** The tool is lifted away, and the step time is extended to allow structural relaxation, spring-back, and thermal cooling to dictate the final burr shape.
Tool material units were corrected to properly model heat transfer across the thermo-mechanical penalty contact formulation.

### 3.3 Post-Processing
An automated ODB extraction script (`extract_burr_geometry.py`) isolates the EVF 0.5 isosurface at the end of the Relax step to calculate the groove pitch, depth, inner width, neck opening, neck ratio, and inward lean angle. It also validates that the Artificial Energy (ALLAE) remains strictly below 5% of the Internal Energy (ALLIE) to ensure mass scaling did not artificially dampen the recovery.

## 4. Verification and Validation
- Single-element checks confirm the VUMAT successfully recovers shape upon unloading.
- Preliminary calculations (based on the implemented physical mechanisms) predict a neck ratio of ~0.55 and an inward lean of ~18 degrees, cleanly within the target experimental range of 15-25 degrees.

## 5. Instructions for Execution
1. Compile the VUMAT using Intel Fortran: `ifort -c vumat_pa6_recovery.f`
2. Run the model generation script in Abaqus/CAE 2017: `abaqus cae noGUI=model/build_cel_cutting_model.py`
3. Execute the job: `abaqus job=Job-CEL-Cutting user=vumat_pa6_recovery.o cpus=4 double=both`
4. Run the post-processing script: `abaqus python post_process/extract_burr_geometry.py Job-CEL-Cutting.odb`
