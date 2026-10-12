# -*- coding: utf-8 -*-
"""
extract_geometry.py
Abaqus Python script to extract burr geometry from the finished CEL ODB.
Run via: abaqus python extract_geometry.py
"""

from odbAccess import openOdb
import sys, math

def get_burr_geometry(odb_path, step_name='Recovery', frame_idx=-1):
    try:
        odb = openOdb(odb_path)
    except Exception as e:
        print("Error opening ODB: {}".format(e))
        return

    step = odb.steps[step_name]
    frame = step.frames[frame_idx]

    try:
        evf_field = frame.fieldOutputs['EVF_PA6']
    except KeyError:
        print("EVF_PA6 field output not found. Please ensure it was requested.")
        odb.close()
        return

    # In a real CEL script, we would query the Eulerian nodes and elements
    # to reconstruct the free surface where EVF crosses 0.5.
    # This involves building a marching cubes or slicing algorithm.

    print("=" * 60)
    print("  Burr Geometry Extraction (Stub)")
    print("=" * 60)
    print("ODB: {}".format(odb_path))
    print("Step: {}, Frame: {}".format(step_name, frame_idx))
    print("To extract geometry:")
    print("  1. Query element EVF > 0.5 to find boundary elements.")
    print("  2. Intersect nodal coordinates with EVF gradient.")
    print("  3. Calculate groove depth, neck opening, inner width, and inward lean.")
    print("  4. Compare extracted metrics to quantitative targets (Section 2.2).")
    print("=" * 60)

    odb.close()

if __name__ == '__main__':
    odb_file = "PA6-CEL-v13.odb"
    if os.path.exists(odb_file):
        get_burr_geometry(odb_file)
    else:
        print("Cannot extract geometry: {} not found.".format(odb_file))
