# PA6 Cutting CEL Simulation Project

This project models the deformational cutting of Polyamide 6 (PA6) using a 3D Coupled Eulerian-Lagrangian (CEL) approach in Abaqus/Explicit. It specifically aims to reproduce the inward burr formation (spring-back) driven by viscoplastic recovery after the tool passes.

## Directory Structure
- `vumat/`: Contains the Fortran source code for the VUMAT.
- `model/`: Contains the Python 2.7 script to generate the Abaqus/CAE model.
- `post_process/`: Contains the Python 2.7 script to extract and analyze the ODB results.
- `docs/`: Contains technical reporting and validation documentation.
