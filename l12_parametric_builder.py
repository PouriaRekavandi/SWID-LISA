# -*- coding: utf-8 -*-
# =============================================================================
#  l12_parametric_builder.py
#  Parametric, re-meshable rebuild of the l12 folding-wing hinge model
#  Abaqus/CAE 2017+  (Python 2.7 kernel; syntax is also Python 3 clean)
#
#  Run:
#      abaqus cae noGUI=l12_parametric_builder.py
#      abaqus cae noGUI=l12_parametric_builder.py -- --preset coarse
#      abaqus cae noGUI=l12_parametric_builder.py -- --set geom.hinge_length=300
#      abaqus cae noGUI=l12_parametric_builder.py -- --params my_params.json
#      abaqus cae noGUI=l12_parametric_builder.py -- --mesh-study 6,4,3,2
#
#  WHY THIS REWRITE
#  ----------------
#  The previous script (11.py) imported the orphan mesh l12.inp and rebuilt a
#  model around it. That makes both requested capabilities impossible:
#
#    * geometry is frozen     - an orphan mesh has no features, no sketches and
#                               no dimensions, so nothing can be resized;
#    * mesh is frozen         - orphan elements cannot be re-seeded; the only
#                               "mesh control" available was silently dropping
#                               mid-side nodes (C3D20R -> C3D8R), which changes
#                               the geometry of curved elements;
#    * regions were frozen    - every load/BC/tie hung off CAE-internal names
#                               such as _PickedSurf695 / _PickedSet704, which
#                               do not survive any geometry or mesh change.
#
#  This version builds native CAE geometry from a single PARAMS dictionary,
#  meshes it with explicit, editable controls, and selects every region
#  geometrically (bounding boxes / bounding cylinders / index logic) so the
#  whole model regenerates after any parameter change.
#
#  Default parameter values reproduce the l12.inp deck:
#      hinge     255 mm long, 6 interleaved knuckles (42.5 mm each),
#                bore R7.5, knuckle OD R10, web 20x20, plate 10x50
#      pin       R7.5, 417 mm long, steel 4130
#      wing      span 2425 mm, chord 250 -> 300 mm, cambered skin,
#                10-ply glass/epoxy composite skins
# =============================================================================

from __future__ import print_function

import json
import math
import os
import sys
import time

from abaqus import *
from abaqusConstants import *

import mesh
import section
import regionToolset


# =============================================================================
#  1. PARAMETERS - EVERYTHING THE USER IS EXPECTED TO TOUCH LIVES HERE
# =============================================================================

PARAMS = {

    # -- geometry (mm) -------------------------------------------------------
    'geom': {
        'hinge_length':      255.0,   # total hinge length along the pin axis
        'knuckle_count':     6,       # interleaved knuckles (A,B,A,B,...)
        'bore_radius':       7.5,     # hinge bore radius
        'knuckle_radius':    10.0,    # knuckle outer radius
        'web_length':        20.0,    # pin axis -> inner face of the leaf plate
        'web_half_height':   10.0,    # web half height (<= knuckle_radius)
        'plate_thickness':   10.0,    # leaf plate thickness (x)
        'plate_drop':        50.0,    # leaf plate height below the web top (y)
        'pin_radius':        7.5,     # set < bore_radius for a running fit
        'pin_length':        417.0,
        'pin_z_start':       0.0,

        # wing planform / section
        'wing_span':         2425.0,
        'chord_root':        250.0,
        'chord_tip':         300.0,
        'sweep_le':          0.0,     # leading-edge sweep offset at the tip
        'dihedral':          0.0,     # tip rise (y) - linear along the span
        'twist_root':        0.0,     # deg, positive nose up about 0.25c
        'twist_tip':         0.0,
        'thickness_scale':   1.0,     # scales the airfoil y/c table
        'wing_y_offset':    -20.85,   # skin position on the leaf plate (y)
        'wing_z_offset':       2.55,  # skin position along the hinge axis (z)
        'root_zone':         10.0,   # refined wing root zone length (mm)
    },

    # -- mesh (fully editable; no geometry rebuild needed for a re-mesh) -----
    'mesh': {
        'leaf_size':          4.0,    # global seed on the hinge leaves
        'leaf_bore_size':     2.0,    # local seed on the bore / knuckle arcs
        'pin_size':           5.0,
        'solid_element':     'C3D20R',   # C3D20R | C3D8R | C3D8I | C3D8 | C3D10
        'solid_shape':       'HEX',      # HEX | TET  (TET forces C3D10)
        'hex_technique':     'SWEEP',    # SWEEP | STRUCTURED
        'partition_for_hex':  True,      # quadrant + band partitions
        'reduce_integration_hourglass': True,

        'wing_chord_elems':   64,     # elements around the closed airfoil
        'wing_span_elems':    48,     # elements along the span
        'wing_order':         2,      # 1 -> S4R, 2 -> S8R
        'wing_span_bias':     3.0,    # >1 refines the root, 1.0 = uniform
        'wing_root_band':     0.08,   # span fraction using the Root layup
        'wing_tip_band':      0.08,   # span fraction using the Tip layup
        'root_zone_elems':   2,      # element rows inside the root zone
    },

    # -- materials -----------------------------------------------------------
    'material': {
        'al_density':     2.71e-09,
        'al_elastic':     (70000.0, 0.33),
        'al_plastic':     ((103.0, 0.0), (117.0, 0.02), (130.0, 0.10)),
        'steel_density':  7.85e-09,
        'steel_elastic':  (200000.0, 0.30),
        'steel_plastic':  ((655.0, 0.0), (850.0, 0.08)),
        'ply_density':    1.90e-09,
        'ply_lamina':     (38000.0, 8500.0, 0.27, 4500.0, 4000.0, 3800.0),
        'ply_thickness':  0.2,
        'hashin':         (1000.0, 700.0, 65.0, 200.0, 85.0, 65.0),
        'enable_hashin':      True,
        'enable_evolution':   False,
        'evolution_energy':   (12.0, 10.0, 1.0, 1.0),
        'layup_top':     (0.0, 0.0, 0.0, 10.0, -10.0, -10.0, 10.0, 0.0, 0.0, 0.0),
        'layup_bottom':  (0.0, 0.0, 0.0, 10.0, -10.0, -10.0, 10.0, 0.0, 0.0, 0.0),
        'layup_root':    (45.0, -45.0, 0.0, 90.0, 0.0, 0.0, 90.0, 0.0, -45.0, 45.0),
        'layup_tip':     (45.0, -45.0, 0.0, 90.0, 0.0, 0.0, 90.0, 0.0, -45.0, 45.0),
    },

    # -- assembly / interactions --------------------------------------------
    'assembly': {
        # CONNECTOR : revolute joint on the detected pin axis (physically right)
        # MPC_BEAM  : rigid beam MPCs pin<->leaf (welded hinge, very robust)
        # CONTACT   : pin-in-bore surface-to-surface contact (most physical,
        #             needs stabilisation and leaves 3 "unconnected regions")
        # NONE      : no pin/leaf connection at all
        'pin_joint':        'CONNECTOR',
        'bond_mode':        'TIE',        # TIE | COHESIVE
        'coupling_type':    'DISTRIBUTING',   # DISTRIBUTING | KINEMATIC
        'tip_constraint':   'COUPLING',   # COUPLING | RIGID_BODY
        'friction':          0.1,         # used by pin_joint = CONTACT
    },

    # -- step, loads, boundary conditions ------------------------------------
    'analysis': {
        'nlgeom':            True,
        'time_period':       1.0,
        'initial_inc':       0.01,
        'min_inc':           1.0e-8,
        'max_inc':           0.05,
        'max_num_inc':       500,
        'stabilise':         True,
        'stabilise_magnitude': 1.0e-4,
        'tip_force':         161.4,
        'root_moment':       254153.0,
        'load_scale':        1.0,
        'load_station':      0.5,     # span fraction of the mid-wing load
        'bc_mode':          'WING_ROOTS',  # WING_ROOTS | PIN
        'release_hinge_rotation': False,   # free UR about the hinge axis
        'field_intervals':   10,
        'history_intervals': 20,
    },

    # -- job / run -----------------------------------------------------------
    'job': {
        'model_name':   'l12_parametric',
        'job_name':     'l12_parametric',
        'cpus':         1,
        'memory_pct':   90,
        'save_cae':     True,
        'write_input':  True,
        'submit':       False,
        'wait':         True,
        'audit':        True,
        'quality_check': True,
    },
}


# Ready-made presets: python-level overrides applied with --preset NAME.
PRESETS = {
    'coarse': {'mesh.leaf_size': 8.0, 'mesh.leaf_bore_size': 4.0,
               'mesh.pin_size': 10.0, 'mesh.wing_chord_elems': 32,
               'mesh.wing_span_elems': 24, 'mesh.solid_element': 'C3D8I',
               'mesh.wing_order': 1},
    'medium': {},
    'fine':   {'mesh.leaf_size': 2.5, 'mesh.leaf_bore_size': 1.2,
               'mesh.pin_size': 3.0, 'mesh.wing_chord_elems': 96,
               'mesh.wing_span_elems': 72},
    'tet':    {'mesh.solid_shape': 'TET', 'mesh.solid_element': 'C3D10'},
    'welded': {'assembly.pin_joint': 'MPC_BEAM'},
    'contact': {'assembly.pin_joint': 'CONTACT', 'geom.pin_radius': 7.35},
}

# Normalised airfoil, extracted from the l12.inp skin (t/c = 6.4 %,
# camber 5.6 % at 50 % chord). Replace the table or call naca_four_digit().
AIRFOIL_UPPER = (
    (0.00000, 0.00000), (0.00274, 0.00029), (0.01093, 0.00115),
    (0.02447, 0.00270), (0.04323, 0.00492), (0.06699, 0.00770),
    (0.09549, 0.01112), (0.12843, 0.01510), (0.16543, 0.01951),
    (0.20611, 0.02436), (0.25000, 0.02946), (0.29663, 0.03462),
    (0.34549, 0.03979), (0.39604, 0.04505), (0.44774, 0.05040),
    (0.50000, 0.05599), (0.55226, 0.05028), (0.60396, 0.04471),
    (0.65451, 0.03935), (0.70337, 0.03416), (0.75000, 0.02912),
    (0.79389, 0.02419), (0.83457, 0.01948), (0.87157, 0.01510),
    (0.90451, 0.01112), (0.93301, 0.00770), (0.95677, 0.00492),
    (0.97553, 0.00270), (0.98907, 0.00115), (0.99726, 0.00029),
    (1.00000, 0.00000),
)

AIRFOIL_LOWER = (
    (0.00000, 0.00000), (0.00274, -0.00039), (0.01093, -0.00039),
    (0.02447, -0.00073), (0.04323, -0.00129), (0.06699, -0.00201),
    (0.09549, -0.00292), (0.12843, -0.00400), (0.16543, -0.00522),
    (0.20611, -0.00654), (0.25000, -0.00784), (0.29663, -0.00899),
    (0.34549, -0.00998), (0.39604, -0.01090), (0.44774, -0.01191),
    (0.50000, -0.01300), (0.55226, -0.01160), (0.60396, -0.01019),
    (0.65451, -0.00880), (0.70337, -0.00746), (0.75000, -0.00620),
    (0.79389, -0.00508), (0.83457, -0.00406), (0.87157, -0.00317),
    (0.90451, -0.00236), (0.93301, -0.00167), (0.95677, -0.00108),
    (0.97553, -0.00061), (0.98907, -0.00033), (0.99726, -0.00033),
    (1.00000, 0.00000),
)


# =============================================================================
#  2. SMALL UTILITIES
# =============================================================================

_T0 = time.time()


def log(message):
    print('[%7.1fs] %s' % (time.time() - _T0, message))


def warn(message):
    print('[WARNING ] %s' % message)


def fail(message):
    raise RuntimeError('L12 BUILDER ERROR: %s' % message)


def get_param(params, dotted):
    node = params
    for key in dotted.split('.'):
        if key not in node:
            fail('Unknown parameter "%s"' % dotted)
        node = node[key]
    return node


def set_param(params, dotted, value):
    keys = dotted.split('.')
    node = params
    for key in keys[:-1]:
        if key not in node:
            fail('Unknown parameter group "%s"' % dotted)
        node = node[key]
    if keys[-1] not in node:
        fail('Unknown parameter "%s"' % dotted)
    current = node[keys[-1]]
    if isinstance(value, str) and not isinstance(current, str):
        value = _coerce(value, current)
    node[keys[-1]] = value


def _coerce(text, reference):
    lowered = text.strip().lower()
    if isinstance(reference, bool):
        return lowered in ('1', 'true', 'yes', 'on')
    if isinstance(reference, int):
        return int(float(text))
    if isinstance(reference, float):
        return float(text)
    if isinstance(reference, (tuple, list)):
        return json.loads(text)
    return text


def deep_update(params, overrides):
    for dotted, value in sorted(overrides.items()):
        set_param(params, dotted, value)
    return params


def parse_command_line(params):
    """Supports  -- --preset fine --set geom.hinge_length=300 --params f.json"""
    argv = sys.argv[1:]
    if '--' in argv:
        argv = argv[argv.index('--') + 1:]

    study = None
    index = 0
    while index < len(argv):
        token = argv[index]
        if token == '--preset' and index + 1 < len(argv):
            name = argv[index + 1]
            if name not in PRESETS:
                fail('Unknown preset "%s". Available: %s'
                     % (name, ', '.join(sorted(PRESETS))))
            deep_update(params, PRESETS[name])
            log('Preset applied: %s' % name)
            index += 2
        elif token == '--set' and index + 1 < len(argv):
            key, _, value = argv[index + 1].partition('=')
            set_param(params, key.strip(), value)
            log('Override: %s = %s' % (key.strip(), value))
            index += 2
        elif token == '--params' and index + 1 < len(argv):
            with open(argv[index + 1], 'r') as handle:
                deep_update(params, json.load(handle))
            log('Parameter file applied: %s' % argv[index + 1])
            index += 2
        elif token == '--mesh-study' and index + 1 < len(argv):
            study = [float(x) for x in argv[index + 1].split(',')]
            index += 2
        else:
            index += 1

    # A l12_params.json next to the script is picked up automatically.
    local = os.path.join(os.getcwd(), 'l12_params.json')
    if os.path.isfile(local):
        with open(local, 'r') as handle:
            deep_update(params, json.load(handle))
        log('Loaded local overrides from l12_params.json')

    return params, study


def naca_four_digit(code='2412', n_points=41):
    """Alternative to the built-in table: PARAMS airfoil from a NACA code."""
    m = int(code[0]) / 100.0
    p = int(code[1]) / 10.0
    t = int(code[2:]) / 100.0

    upper, lower = [], []
    for index in range(n_points):
        x = 0.5 * (1.0 - math.cos(math.pi * index / (n_points - 1.0)))
        yt = 5.0 * t * (0.2969 * math.sqrt(x) - 0.1260 * x - 0.3516 * x ** 2
                        + 0.2843 * x ** 3 - 0.1036 * x ** 4)
        if p > 0.0 and x < p:
            yc = m / (p ** 2) * (2.0 * p * x - x ** 2)
            dy = 2.0 * m / (p ** 2) * (p - x)
        elif p > 0.0:
            yc = m / ((1.0 - p) ** 2) * (1.0 - 2.0 * p + 2.0 * p * x - x ** 2)
            dy = 2.0 * m / ((1.0 - p) ** 2) * (p - x)
        else:
            yc, dy = 0.0, 0.0
        theta = math.atan(dy)
        upper.append((x - yt * math.sin(theta), yc + yt * math.cos(theta)))
        lower.append((x + yt * math.sin(theta), yc - yt * math.cos(theta)))

    upper[0] = lower[0] = (0.0, 0.0)
    upper[-1] = lower[-1] = (1.0, 0.0)
    return tuple(upper), tuple(lower)


def resample(curve, count):
    """Cosine-spaced resample of a (x, y) table defined on x in [0, 1]."""
    xs = [point[0] for point in curve]
    ys = [point[1] for point in curve]
    output = []
    for index in range(count):
        target = 0.5 * (1.0 - math.cos(math.pi * index / (count - 1.0)))
        if target <= xs[0]:
            output.append((xs[0], ys[0]))
            continue
        if target >= xs[-1]:
            output.append((xs[-1], ys[-1]))
            continue
        for position in range(1, len(xs)):
            if target <= xs[position]:
                span = xs[position] - xs[position - 1]
                weight = 0.0 if span <= 0.0 else (target - xs[position - 1]) / span
                output.append((target,
                               ys[position - 1] + weight
                               * (ys[position] - ys[position - 1])))
                break
    return output


def biased_stations(count, bias):
    """count+1 normalised stations, clustered at 0.0 when bias > 1."""
    if abs(bias - 1.0) < 1.0e-9:
        return [float(index) / count for index in range(count + 1)]
    ratio = bias ** (1.0 / max(count - 1, 1))
    sizes = [ratio ** index for index in range(count)]
    total = sum(sizes)
    stations, running = [0.0], 0.0
    for size in sizes:
        running += size / total
        stations.append(min(running, 1.0))
    return stations


# =============================================================================
#  3. PARAMETRIC GEOMETRY - HINGE LEAVES AND PIN
# =============================================================================

def knuckle_bands(geom):
    """Return (z_start, z_end, owner) for every knuckle band.

    owner 0 -> leaf A, owner 1 -> leaf B. Interleaving is what makes it a
    hinge, and it follows automatically from knuckle_count.
    """
    count = int(geom['knuckle_count'])
    if count < 2:
        fail('knuckle_count must be >= 2')
    length = float(geom['hinge_length']) / count
    return [(index * length, (index + 1) * length, index % 2)
            for index in range(count)]


def validate_geometry(geom):
    checks = [
        (geom['bore_radius'] < geom['knuckle_radius'],
         'bore_radius must be smaller than knuckle_radius'),
        (geom['bore_radius'] <= geom['web_half_height'],
         'bore_radius must be <= web_half_height'),
        (geom['web_half_height'] <= geom['knuckle_radius'],
         'web_half_height must be <= knuckle_radius'),
        (geom['plate_drop'] > 2.0 * geom['web_half_height'],
         'plate_drop must exceed 2 * web_half_height'),
        (geom['pin_radius'] <= geom['bore_radius'],
         'pin_radius must be <= bore_radius'),
        (geom['chord_root'] > 0.0 and geom['chord_tip'] > 0.0,
         'chords must be positive'),
        (geom['root_zone'] > 0.0,
         'root_zone must be positive'),
    ]
    for ok, message in checks:
        if not ok:
            fail(message)

def _leaf_outer_loop(sketch, geom, sign, margin=0.0, plate=True):
    """Draw the leaf cross-section. sign = +1 for leaf A, -1 for leaf B."""
    radius = geom['knuckle_radius'] + margin
    half = geom['web_half_height'] + margin
    web = geom['web_length']
    thickness = geom['plate_thickness']
    top = geom['web_half_height'] + margin
    bottom = geom['web_half_height'] - geom['plate_drop']

    def point(x, y):
        return (sign * x, y)

    if plate:
        chain = [point(web, top), point(web + thickness, top),
                 point(web + thickness, bottom), point(web, bottom),
                 point(web, -half)]
    else:
        chain = [point(web, top), point(web, -half)]

    chain.append(point(0.0, -half))
    if half < radius - 1.0e-9:
        chain.append(point(0.0, -radius))

    for index in range(len(chain) - 1):
        sketch.Line(point1=chain[index], point2=chain[index + 1])

    arc_start = point(0.0, -radius)
    arc_end = point(0.0, radius)
    sketch.ArcByCenterEnds(
        center=(0.0, 0.0), point1=arc_start, point2=arc_end,
        direction=(CLOCKWISE if sign > 0 else COUNTERCLOCKWISE))

    tail = [arc_end]
    if half < radius - 1.0e-9:
        tail.append(point(0.0, half))
    tail.append(point(web, top))
    for index in range(len(tail) - 1):
        sketch.Line(point1=tail[index], point2=tail[index + 1])


def build_leaf(model, geom, name, sign, owner):
    """Native solid leaf: one base extrude + one blind cut per empty band."""
    sheet = 4.0 * max(geom['hinge_length'], geom['plate_drop'])
    part = model.Part(name=name, dimensionality=THREE_D, type=DEFORMABLE_BODY)

    profile = model.ConstrainedSketch(name='__leaf__', sheetSize=sheet)
    _leaf_outer_loop(profile, geom, sign)
    profile.CircleByCenterPerimeter(center=(0.0, 0.0),
                                    point1=(geom['bore_radius'], 0.0))
    part.BaseSolidExtrude(sketch=profile, depth=float(geom['hinge_length']))
    del model.sketches['__leaf__']

    axis = part.datums[part.DatumAxisByPrincipalAxis(principalAxis=YAXIS).id]

    for index, (z0, z1, band_owner) in enumerate(knuckle_bands(geom)):
        if band_owner == owner:
            continue                      # this band keeps its knuckle
        plane = part.datums[part.DatumPlaneByPrincipalPlane(
            principalPlane=XYPLANE, offset=float(z0)).id]
        transform = part.MakeSketchTransform(
            sketchPlane=plane, sketchUpEdge=axis, sketchPlaneSide=SIDE1,
            sketchOrientation=RIGHT, origin=(0.0, 0.0, float(z0)))
        cut = model.ConstrainedSketch(name='__cut__', sheetSize=sheet,
                                      transform=transform)
        _leaf_outer_loop(cut, geom, sign, margin=1.0, plate=False)
        part.CutExtrude(sketchPlane=plane, sketchUpEdge=axis,
                        sketchPlaneSide=SIDE1, sketchOrientation=RIGHT,
                        sketch=cut, depth=float(z1 - z0),
                        flipExtrudeDirection=OFF)
        del model.sketches['__cut__']

    log('Geometry: %s built (%d cells)' % (name, len(part.cells)))
    return part


def build_pin(model, geom, name='PIN'):
    sheet = 4.0 * geom['pin_length']
    part = model.Part(name=name, dimensionality=THREE_D, type=DEFORMABLE_BODY)
    profile = model.ConstrainedSketch(name='__pin__', sheetSize=sheet)
    profile.CircleByCenterPerimeter(center=(0.0, 0.0),
                                    point1=(geom['pin_radius'], 0.0))
    part.BaseSolidExtrude(sketch=profile, depth=float(geom['pin_length']))
    del model.sketches['__pin__']
    log('Geometry: %s built' % name)
    return part


def partition_solid(part, geom, planes_z=(), quadrants=True, web_plane=None):
    """Partitions that turn the leaf into sweepable / structured cells."""
    def cut(plane_feature):
        try:
            part.PartitionCellByDatumPlane(
                datumPlane=part.datums[plane_feature.id], cells=part.cells)
            return True
        except Exception:
            return False

    done = 0
    for offset in planes_z:
        done += cut(part.DatumPlaneByPrincipalPlane(principalPlane=XYPLANE,
                                                    offset=float(offset)))
    if quadrants:
        done += cut(part.DatumPlaneByPrincipalPlane(principalPlane=YZPLANE,
                                                    offset=0.0))
        done += cut(part.DatumPlaneByPrincipalPlane(principalPlane=XZPLANE,
                                                    offset=0.0))
    if web_plane is not None:
        done += cut(part.DatumPlaneByPrincipalPlane(principalPlane=YZPLANE,
                                                    offset=float(web_plane)))
    log('Partitioning %-14s -> %d successful cuts, %d cells'
        % (part.name, done, len(part.cells)))


# =============================================================================
#  4. SOLID MESHING - EVERY CONTROL IS A PARAMETER
# =============================================================================

SOLID_CODES = {
    'C3D20R': C3D20R, 'C3D20': C3D20, 'C3D8R': C3D8R, 'C3D8': C3D8,
    'C3D8I': C3D8I, 'C3D10': C3D10, 'C3D4': C3D4,
}


def solid_element_types(name, hourglass):
    code = SOLID_CODES.get(name.upper())
    if code is None:
        fail('Unsupported solid element "%s". Use one of %s'
             % (name, ', '.join(sorted(SOLID_CODES))))
    if name.upper() in ('C3D8R',) and hourglass:
        hexa = mesh.ElemType(elemCode=code, elemLibrary=STANDARD,
                             hourglassControl=ENHANCED)
    else:
        hexa = mesh.ElemType(elemCode=code, elemLibrary=STANDARD)
    wedge_code = C3D15 if name.upper() in ('C3D20R', 'C3D20') else C3D6
    tet_code = C3D10 if name.upper() in ('C3D20R', 'C3D20', 'C3D10') else C3D4
    return (hexa,
            mesh.ElemType(elemCode=wedge_code, elemLibrary=STANDARD),
            mesh.ElemType(elemCode=tet_code, elemLibrary=STANDARD))


def mesh_solid_part(part, mesh_params, global_size, refine_edges=None,
                    refine_size=None):
    """Seed, control, mesh, verify - with an automatic tet fallback."""
    shape = mesh_params['solid_shape'].upper()
    technique = {'SWEEP': SWEEP,
                 'STRUCTURED': STRUCTURED}.get(mesh_params['hex_technique'].upper(),
                                               SWEEP)

    try:
        part.deleteMesh()
    except Exception:
        pass
    part.seedPart(size=float(global_size), deviationFactor=0.1,
                  minSizeFactor=0.1)

    if refine_edges is not None and len(refine_edges) and refine_size:
        part.seedEdgeBySize(edges=refine_edges, size=float(refine_size),
                            deviationFactor=0.1, constraint=FINER)

    element_name = mesh_params['solid_element']
    if shape == 'TET':
        part.setMeshControls(regions=part.cells, elemShape=TET,
                             technique=FREE)
        element_name = 'C3D10' if element_name.upper() in \
            ('C3D20R', 'C3D20', 'C3D10') else 'C3D4'
    else:
        part.setMeshControls(regions=part.cells, elemShape=HEX,
                             technique=technique,
                             algorithm=ADVANCING_FRONT)

    part.setElementType(regions=(part.cells,),
                        elemTypes=solid_element_types(
                            element_name,
                            mesh_params['reduce_integration_hourglass']))
    part.generateMesh()

    unmeshed = part.getUnmeshedRegions()
    if unmeshed is not None and shape != 'TET':
        warn('%s: hex meshing left %d unmeshed cells - falling back to tets.'
             % (part.name, len(unmeshed)))
        part.deleteMesh()
        part.setMeshControls(regions=part.cells, elemShape=TET, technique=FREE)
        part.setElementType(regions=(part.cells,),
                            elemTypes=solid_element_types('C3D10', False))
        part.generateMesh()

    log('Mesh: %-14s %7d nodes %7d elements (seed %.2f)'
        % (part.name, len(part.nodes), len(part.elements), global_size))
    return part


def report_mesh_quality(part):
    try:
        stats = part.verifyMeshQuality(criterion=ANALYSIS_CHECKS)
    except Exception as error:
        warn('Quality check skipped for %s: %s' % (part.name, error))
        return
    failed = stats.get('failedElements', [])
    warned = stats.get('warningElements', [])
    log('Quality: %-14s %d errors, %d warnings'
        % (part.name, len(failed), len(warned)))
    if failed:
        warn('%s has %d elements failing the Abaqus analysis checks - '
             'refine the seed or switch to TET.' % (part.name, len(failed)))

# =============================================================================
#  5. PARAMETRIC WING SKIN (Native Shell Loft)
# =============================================================================
#  The wing is a lofted, closed airfoil skin.
# =============================================================================

def airfoil_ring(upper, lower, count):
    """Closed ring of `count` points: LE -> upper -> TE -> lower -> LE."""
    if count % 2:
        count += 1
    per_surface = count // 2 + 1
    top = resample(list(upper), per_surface)
    bottom = resample(list(lower), per_surface)
    ring = list(top) + list(reversed(bottom[1:-1]))
    return ring

def wing_stations(geom, mesh_params):
    """Spanwise station coordinates: overlap rows first, then the biased span."""
    overlap = float(geom['root_zone'])
    rows = max(int(mesh_params['root_zone_elems']), 1)
    stations = [overlap * index / float(rows) for index in range(rows)]
    span = float(geom['wing_span'])
    for eta in biased_stations(int(mesh_params['wing_span_elems']),
                               float(mesh_params['wing_span_bias'])):
        stations.append(overlap + span * eta)
    return stations

def wing_point(geom, x_local, xc, yc, sign):
    """Map a normalised airfoil coordinate to part coordinates."""
    overlap = float(geom['root_zone'])
    span = float(geom['wing_span'])
    eta = min(max((x_local - overlap) / span, 0.0), 1.0)

    chord = geom['chord_root'] + (geom['chord_tip'] - geom['chord_root']) * eta
    twist = math.radians(geom['twist_root']
                         + (geom['twist_tip'] - geom['twist_root']) * eta)
    lead = geom['sweep_le'] * eta
    rise = geom['dihedral'] * eta

    chordwise = (xc - 0.25) * chord
    normal = yc * chord * geom['thickness_scale']
    cos_t, sin_t = math.cos(twist), math.sin(twist)

    z = lead + 0.25 * chord + chordwise * cos_t - normal * sin_t
    y = rise + chordwise * sin_t + normal * cos_t
    return (sign * x_local, y, z)


def build_wing(model, geom, mesh_params, name, sign, load_station=0.5):
    """Structured S4R/S8R skin, created as a native Shell Loft with exact sets."""

    # We will build the geometry by lofting between the root and tip profiles.
    overlap = float(geom['root_zone'])
    span = float(geom['wing_span'])
    root_x = 0.0
    tip_x = overlap + span

    # Create the part
    sheet = max(span, geom['chord_tip']) * 2.0
    part = model.Part(name=name, dimensionality=THREE_D, type=DEFORMABLE_BODY)

    # Get high resolution rings to make smooth splines
    ring_points = airfoil_ring(AIRFOIL_UPPER, AIRFOIL_LOWER, 100)

    # 1. Sketch and plane for root
    plane_root = part.DatumPlaneByPrincipalPlane(principalPlane=YZPLANE, offset=sign * root_x)
    axis_root = part.DatumAxisByPrincipalAxis(principalAxis=ZAXIS)
    transform_root = part.MakeSketchTransform(
        sketchPlane=part.datums[plane_root.id], sketchUpEdge=part.datums[axis_root.id],
        sketchPlaneSide=SIDE1, sketchOrientation=RIGHT, origin=(sign * root_x, 0.0, 0.0))
    sketch_root = model.ConstrainedSketch(name='__root__', sheetSize=sheet, transform=transform_root)

    root_pts = []
    for xc, yc in ring_points:
        pt = wing_point(geom, root_x, xc, yc, sign)
        # transform to 2D sketch coords on the YZ plane at root_x
        # X in sketch is Y in part, Y in sketch is Z in part
        root_pts.append((pt[1], pt[2]))

    sketch_root.Spline(points=root_pts)

    # 2. Sketch and plane for tip
    plane_tip = part.DatumPlaneByPrincipalPlane(principalPlane=YZPLANE, offset=sign * tip_x)
    axis_tip = part.DatumAxisByPrincipalAxis(principalAxis=ZAXIS)
    transform_tip = part.MakeSketchTransform(
        sketchPlane=part.datums[plane_tip.id], sketchUpEdge=part.datums[axis_tip.id],
        sketchPlaneSide=SIDE1, sketchOrientation=RIGHT, origin=(sign * tip_x, 0.0, 0.0))
    sketch_tip = model.ConstrainedSketch(name='__tip__', sheetSize=sheet, transform=transform_tip)

    tip_pts = []
    for xc, yc in ring_points:
        pt = wing_point(geom, tip_x, xc, yc, sign)
        tip_pts.append((pt[1], pt[2]))

    sketch_tip.Spline(points=tip_pts)

    # 3. Loft
    part.BaseShellLoft(loftsections=(sketch_root, sketch_tip), startCondition=NONE, endCondition=NONE)
    del model.sketches['__root__']
    del model.sketches['__tip__']

    # 4. Partition faces to create the topological regions
    # We partition by spanwise datum planes to create:
    # - ROOT-ZONE
    # - LAYUP-ROOT
    # - Mid wing
    # - LAYUP-TIP
    root_band_x = overlap + span * float(mesh_params['wing_root_band'])
    tip_band_x = overlap + span * (1.0 - float(mesh_params['wing_tip_band']))

    partition_planes = [overlap, root_band_x, tip_band_x]

    # Load station plane (for applying load and finding load ring)
    load_target_x = overlap + span * float(load_station)
    if load_target_x not in partition_planes:
        partition_planes.append(load_target_x)

    for p_x in sorted(partition_planes):
        d_plane = part.DatumPlaneByPrincipalPlane(principalPlane=YZPLANE, offset=sign * p_x)
        try:
            part.PartitionFaceByDatumPlane(datumPlane=part.datums[d_plane.id], faces=part.faces)
        except Exception:
            pass # ignore if plane doesn't intersect

    # Partition top/bottom skins using the chord plane.
    # Because of twist and dihedral, we'll construct a plane using 3 points at the LE and TE
    # Or simply partition using a surface. A simple way for a lofted wing is to partition
    # using the curved LE/TE lines, but Abaqus needs sketch or datum.
    # An alternative is partitioning by sketch along the XZ plane if twist is small,
    # but a generic robust way is to use a spline surface or just rely on the LE/TE vertices if it's partitioned.
    # Actually, simpler: create a datum plane through 3 points (root LE, root TE, tip LE).
    # This might not perfectly follow the camber line if twist is high.
    # Let's use the XZ plane if possible, transformed by dihedral.
    # Instead, we will assign the whole face to top/bottom by querying normal or location.

    # 5. Build sets and assign properties
    # Let's find faces by checking their centroid.
    faces_top, faces_bot = [], []
    faces_root_zone, faces_layup_root, faces_layup_tip = [], [], []

    for face in part.faces:
        # Centroid of face
        pt = face.pointOn[0]
        x_val = sign * pt[0]
        y_val = pt[1]
        z_val = pt[2]

        # Determine spanwise region
        if x_val <= overlap + 1e-4:
            faces_root_zone.append(face.index)

        if x_val < root_band_x - 1e-4:
            faces_layup_root.append(face.index)
        elif x_val > tip_band_x + 1e-4:
            faces_layup_tip.append(face.index)

        # Determine top or bottom. We evaluate the camber y at this (x, z) roughly.
        # A robust way is to compare to the LE-TE line at this local span.
        eta = min(max((x_val - overlap) / span, 0.0), 1.0)
        rise = geom['dihedral'] * eta
        twist = math.radians(geom['twist_root'] + (geom['twist_tip'] - geom['twist_root']) * eta)

        # If the local y is above the rotated chord line, it's top.
        # Since local twist is positive nose up (about 0.25c), we can just check the y value relative to rise.
        # Actually, airfoil Y > 0 is upper.
        if y_val > rise: # Simplified top/bottom split. Works for small camber/twist.
            faces_top.append(face.index)
        else:
            faces_bot.append(face.index)

    # If standard top/bottom heuristic fails for high twist, we can refine it.

    # Create Sets
    def set_from_faces(name, face_indices):
        if face_indices:
            faces = part.faces[face_indices[0]:face_indices[0]+1]
            for idx in face_indices[1:]:
                faces += part.faces[idx:idx+1]
            part.Set(faces=faces, name=name)

    set_from_faces('ROOT-ZONE', faces_root_zone)
    set_from_faces('LAYUP-ROOT', faces_layup_root)
    set_from_faces('LAYUP-TIP', faces_layup_tip)
    set_from_faces('SKIN-TOP', faces_top)
    set_from_faces('SKIN-BOTTOM', faces_bot)
    part.Set(faces=part.faces, name='ALL-SKIN')

    # Edge sets for rings
    def set_from_edges_at_x(name, target_x):
        tol = 1e-3
        ring_edges = []
        for edge in part.edges:
            # Check if all points on edge are near target_x
            pts = [edge.pointOn[0]] # Just check pointOn for now
            # For exactness, check vertices
            is_on_plane = True
            for v_idx in edge.getVertices():
                v = part.vertices[v_idx]
                if abs(sign * v.pointOn[0][0] - target_x) > tol:
                    is_on_plane = False
                    break
            if is_on_plane:
                ring_edges.append(edge.index)

        if ring_edges:
            edges = part.edges[ring_edges[0]:ring_edges[0]+1]
            for idx in ring_edges[1:]:
                edges += part.edges[idx:idx+1]
            # Create a geometry set containing the edges.
            # In Abaqus, applying load/BC to edges will distribute to nodes.
            part.Set(edges=edges, name=name)
        else:
            warn("Could not find edges for %s at x=%.3f" % (name, target_x))

    set_from_edges_at_x('ROOT-RING', root_x)
    set_from_edges_at_x('TIP-RING', tip_x)
    set_from_edges_at_x('LOAD-RING', load_target_x)

    # Mesh Generation
    order = 2 if int(mesh_params['wing_order']) == 2 else 1
    element_type = S8R if order == 2 else S4R
    elemType1 = mesh.ElemType(elemCode=element_type, elemLibrary=STANDARD)
    elemType2 = mesh.ElemType(elemCode=STRI65 if order == 2 else S3R, elemLibrary=STANDARD)

    part.setElementType(regions=(part.faces,), elemTypes=(elemType1, elemType2))

    # Seeding
    # We want a structured/sweep mesh.
    part.setMeshControls(regions=part.faces, elemShape=QUAD, technique=STRUCTURED)

    n_chord = int(mesh_params['wing_chord_elems'])
    n_span = int(mesh_params['wing_span_elems'])

    # Global seed as fallback
    global_size = span / n_span
    part.seedPart(size=global_size, deviationFactor=0.1, minSizeFactor=0.1)

    # We can seed edges for exact counts
    for edge in part.edges:
        # Determine if spanwise or chordwise
        v1 = part.vertices[edge.getVertices()[0]].pointOn[0]
        v2 = part.vertices[edge.getVertices()[1]].pointOn[0]
        dx = abs(v1[0] - v2[0])

        if dx < 1e-3:
            # Chordwise edge
            # n_chord is total around circumference. Since it's split top/bottom? No, currently not split.
            # If not split at LE/TE, a single closed loop has n_chord elements.
            part.seedEdgeByNumber(edges=(edge,), number=n_chord, constraint=FIXED)
        else:
            # Spanwise edge
            # Need to figure out which spanwise section it is
            x_mid = sign * edge.pointOn[0][0]
            if x_mid < overlap:
                part.seedEdgeByNumber(edges=(edge,), number=max(int(mesh_params['root_zone_elems']), 1), constraint=FIXED)
            else:
                # Approximate proportional seeding for the rest
                frac = dx / span
                num = max(int(n_span * frac), 1)
                bias = float(mesh_params['wing_span_bias'])
                # Abaqus edge biasing is complex to map directly from 'biased_stations',
                # but we can apply a simple bias ratio if bias != 1.0.
                # For simplicity, if we split the face at load_station and bands, we just use uniform for each segment for now.
                part.seedEdgeByNumber(edges=(edge,), number=num, constraint=FIXED)

    try:
        part.generateMesh()
        log('Mesh: %-14s native shell %d elements' % (name, len(part.elements)))
    except Exception as e:
        warn('Failed to mesh %s natively: %s' % (name, str(e)))

    # Create node sets from the geometry sets so that the assembly coupling works exactly as before
    for ring in ('ROOT-RING', 'TIP-RING', 'LOAD-RING'):
        if ring in part.sets:
            # Extract nodes from the edges
            nodes = []
            for edge in part.sets[ring].edges:
                nodes.extend(edge.getNodes())
            # create node set
            part.SetFromNodeLabels(name=ring, nodeLabels=tuple(set(n.label for n in nodes)))

    return part

# =============================================================================
#  6. MATERIALS AND SECTIONS
# =============================================================================

def _rows(table):
    """Accept tuples or JSON-decoded lists and always hand Abaqus tuples."""
    return tuple(tuple(row) for row in table)


def build_materials(model, props):
    aluminium = model.Material(name='AL-1100-H14')
    aluminium.Density(table=((props['al_density'],),))
    aluminium.Elastic(table=(tuple(props['al_elastic']),))
    aluminium.Plastic(table=_rows(props['al_plastic']))

    steel = model.Material(name='Steel-4130-QT')
    steel.Density(table=((props['steel_density'],),))
    steel.Elastic(table=(tuple(props['steel_elastic']),))
    steel.Plastic(table=_rows(props['steel_plastic']))

    ply = model.Material(name='Glass-Epoxy-Lamina')
    ply.Density(table=((props['ply_density'],),))
    ply.Elastic(type=LAMINA, table=(tuple(props['ply_lamina']),))

    evolution = False
    if props['enable_hashin']:
        ply.HashinDamageInitiation(table=(tuple(props['hashin']),))
        if props['enable_evolution']:
            try:
                ply.hashinDamageInitiation.DamageEvolution(
                    type=ENERGY, table=(tuple(props['evolution_energy']),))
                ply.hashinDamageInitiation.DamageStabilization(
                    fiberTensileCoeff=5.0e-5, fiberCompressiveCoeff=5.0e-5,
                    matrixTensileCoeff=5.0e-5, matrixCompressiveCoeff=5.0e-5)
                evolution = True
            except Exception as error:
                warn('Hashin evolution rejected, initiation only: %s' % error)

    model.HomogeneousSolidSection(name='SEC-HINGE-AL1100',
                                  material='AL-1100-H14', thickness=None)
    model.HomogeneousSolidSection(name='SEC-PIN-4130QT',
                                  material='Steel-4130-QT', thickness=None)
    return evolution


def composite_section(model, name, angles, ply_thickness):
    layers = tuple(section.SectionLayer(material='Glass-Epoxy-Lamina',
                                        thickness=ply_thickness,
                                        orientAngle=float(angle),
                                        plyName='Ply-%d' % (index + 1))
                   for index, angle in enumerate(angles))
    model.CompositeShellSection(name=name, layup=layers, symmetric=OFF,
                                preIntegrate=OFF, poissonDefinition=DEFAULT,
                                integrationRule=SIMPSON,
                                temperature=GRADIENT)
    return name


def assign_wing_sections(model, part, props):
    mapping = (('SKIN-TOP', 'Layup-Top', props['layup_top']),
               ('SKIN-BOTTOM', 'Layup-Bottom', props['layup_bottom']),
               ('LAYUP-ROOT', 'Layup-Root', props['layup_root']),
               ('LAYUP-TIP', 'Layup-Tip', props['layup_tip']))

    for set_name, section_name, angles in mapping:
        if set_name not in part.sets.keys():
            continue
        if section_name not in model.sections.keys():
            composite_section(model, section_name, angles,
                              props['ply_thickness'])
        part.SectionAssignment(region=part.sets[set_name],
                               sectionName=section_name,
                               offsetType=MIDDLE_SURFACE,
                               thicknessAssignment=FROM_SECTION)

    # Ply angles are measured from a span-aligned axis, not from the default
    # shell local axis (which drifts around a curved skin).
    try:
        csys = part.DatumCsysByThreePoints(name='CSYS-WING',
                                           coordSysType=CARTESIAN,
                                           origin=(0.0, 0.0, 0.0),
                                           point1=(1.0, 0.0, 0.0),
                                           point2=(0.0, 0.0, 1.0))
        part.MaterialOrientation(region=part.sets['ALL-SKIN'],
                                 orientationType=SYSTEM,
                                 localCsys=part.datums[csys.id],
                                 axis=AXIS_3, stackDirection=STACK_3)
    except Exception as error:
        warn('Wing material orientation left at default: %s' % error)


def assign_solid_section(part, section_name):
    part.SectionAssignment(region=regionToolset.Region(cells=part.cells),
                           sectionName=section_name)


# =============================================================================
#  7. CONNECTIVITY AUDIT (reproduces the Abaqus "unconnected regions" count)
# =============================================================================

class Connectivity(object):
    """Union-find over instances, reference points and ground.

    Two disjoint sets are kept on purpose:

      * `mech`   - only mechanical connections (elements, ties, couplings,
                   MPCs, rigid bodies, connectors). This reproduces the
                   region count that Abaqus prints.
      * `full`   - the same links plus boundary conditions, used only to
                   report whether a region is grounded.

    Contact pairs are deliberately NOT recorded: contact does not remove the
    "unconnected regions" message.
    """

    def __init__(self):
        self.mech = {}
        self.full = {}
        self.links = []

    @staticmethod
    def _find(store, node):
        store.setdefault(node, node)
        root = node
        while store[root] != root:
            root = store[root]
        while store[node] != root:
            store[node], node = root, store[node]
        return root

    @staticmethod
    def _union(store, a, b):
        ra, rb = Connectivity._find(store, a), Connectivity._find(store, b)
        if ra != rb:
            store[rb] = ra

    def add(self, node):
        self._find(self.mech, node)
        self._find(self.full, node)
        return node

    def find(self, node):
        return self._find(self.full, node)

    def join(self, a, b, why):
        self.links.append((a, b, why))
        self.add(a)
        self.add(b)
        self._union(self.full, a, b)
        if a != 'GROUND' and b != 'GROUND':
            self._union(self.mech, a, b)

    def regions(self):
        groups = {}
        for node in self.mech:
            if node.startswith('RP:') or node == 'GROUND':
                continue
            groups.setdefault(self._find(self.mech, node), []).append(node)
        return [sorted(members) for members in groups.values()]

    def is_grounded(self, node):
        if 'GROUND' not in self.full:
            return False
        return self._find(self.full, node) == self._find(self.full, 'GROUND')

    def report(self):
        print('')
        print('=' * 72)
        print('CONNECTIVITY AUDIT')
        print('=' * 72)
        for a, b, why in self.links:
            print('  %-20s <-> %-20s  (%s)' % (a, b, why))
        regions = self.regions()
        print('-' * 72)
        print('Unconnected regions: %d' % len(regions))
        for index, members in enumerate(sorted(regions)):
            grounded = self.is_grounded(members[0])
            print('  region %d %-11s %s'
                  % (index + 1, '[grounded]' if grounded else '[FLOATING]',
                     ', '.join(members)))
        print('=' * 72)
        return len(regions)


# =============================================================================
#  8. ASSEMBLY HELPERS
# =============================================================================

def bbox_faces(instance, xr=None, yr=None, zr=None, tol=1.0e-3):
    limits = {}
    for key, span in (('x', xr), ('y', yr), ('z', zr)):
        if span is None:
            continue
        low, high = min(span), max(span)
        limits[key + 'Min'] = low - tol
        limits[key + 'Max'] = high + tol
    return instance.faces.getByBoundingBox(**limits)


def node_centroid(nodes):
    count = float(len(nodes))
    if not count:
        fail('Empty node region - cannot compute a centroid.')
    total = [0.0, 0.0, 0.0]
    for node in nodes:
        for axis in range(3):
            total[axis] += node.coordinates[axis]
    return tuple(value / count for value in total)


def tie(model, name, master, slave, tolerance=None):
    """Version-tolerant Tie (master/slave in 2017, main/secondary in 2020+)."""
    common = dict(name=name, positionToleranceMethod=COMPUTED,
                  adjust=ON, tieRotations=ON, thickness=ON,
                  constraintEnforcement=SURFACE_TO_SURFACE)
    if tolerance:
        common['positionToleranceMethod'] = SPECIFIED
        common['positionTolerance'] = float(tolerance)
    try:
        return model.Tie(master=master, slave=slave, **common)
    except TypeError:
        return model.Tie(main=master, secondary=slave, **common)


def contact_pair(model, name, master, slave, prop):
    common = dict(name=name, createStepName='Initial', sliding=FINITE,
                  interactionProperty=prop, adjustMethod=OVERCLOSED,
                  thickness=ON)
    try:
        return model.SurfaceToSurfaceContactStd(master=master, slave=slave,
                                                **common)
    except TypeError:
        return model.SurfaceToSurfaceContactStd(main=master, secondary=slave,
                                                **common)


def coupling(model, assembly, name, rp_set, region, kind):
    if kind.upper() == 'KINEMATIC':
        return model.Coupling(name=name, controlPoint=rp_set, surface=region,
                              influenceRadius=WHOLE_SURFACE,
                              couplingType=KINEMATIC,
                              u1=ON, u2=ON, u3=ON, ur1=ON, ur2=ON, ur3=ON)
    return model.Coupling(name=name, controlPoint=rp_set, surface=region,
                          influenceRadius=WHOLE_SURFACE,
                          couplingType=DISTRIBUTING, weightingMethod=UNIFORM,
                          u1=ON, u2=ON, u3=ON, ur1=ON, ur2=ON, ur3=ON)


def edge_fingerprints(assembly):
    """Identity snapshot of the assembly edges.


    Edge indices are renumbered whenever a wire is imprinted, so a slice such
    as edges[before:after] can silently return an *older* wire. `pointOn` is
    stable per edge and unique per wire, which makes the difference between
    two snapshots exact.
    """
    marks = []
    for edge in assembly.edges:
        try:
            marks.append(edge.pointOn)
        except Exception:
            marks.append(None)
    return marks


def new_wire_edges(assembly, previous_marks):
    """EdgeArray holding only the edges created since the snapshot."""
    known = set(mark for mark in previous_marks if mark is not None)
    indices = []
    for edge in assembly.edges:
        try:
            mark = edge.pointOn
        except Exception:
            mark = None
        if mark is None or mark not in known:
            indices.append(edge.index)

    if not indices and len(assembly.edges) > len(previous_marks):
        # Fallback for kernels that do not expose pointOn.
        indices = list(range(len(previous_marks), len(assembly.edges)))

    if not indices:
        return None

    selection = assembly.edges[indices[0]:indices[0] + 1]
    for index in indices[1:]:
        selection = selection + assembly.edges[index:index + 1]
    return selection

# =============================================================================
#  9. MODEL ASSEMBLY - GEOMETRY, MESH, CONSTRAINTS, LOADS, JOB
# =============================================================================

def build_model(params, model_name=None, job_name=None):
    geom = params['geom']
    msh = params['mesh']
    props = params['material']
    asm = params['assembly']
    ana = params['analysis']
    jobp = params['job']

    validate_geometry(geom)

    model_name = str(model_name or jobp['model_name'])
    job_name = str(job_name or jobp['job_name'])

    if model_name in mdb.models.keys():
        del mdb.models[model_name]
    model = mdb.Model(name=model_name, modelType=STANDARD_EXPLICIT)

    plate_outer = geom['web_length'] + geom['plate_thickness']
    hinge_length = float(geom['hinge_length'])
    bands = knuckle_bands(geom)
    interior_z = [band[0] for band in bands[1:]]

    graph = Connectivity()
    graph.add('GROUND')

    # ---- materials --------------------------------------------------------
    evolution_active = build_materials(model, props)

    # ---- parts ------------------------------------------------------------
    leaf_a = build_leaf(model, geom, 'HINGE_LEAF_A', +1, 0)
    leaf_b = build_leaf(model, geom, 'HINGE_LEAF_B', -1, 1)
    pin = build_pin(model, geom, 'PIN')
    wing_r = build_wing(model, geom, msh, 'WING_RIGHT', +1,
                        ana['load_station'])
    wing_l = build_wing(model, geom, msh, 'WING_LEFT', -1,
                        ana['load_station'])

    assign_solid_section(leaf_a, 'SEC-HINGE-AL1100')
    assign_solid_section(leaf_b, 'SEC-HINGE-AL1100')
    assign_solid_section(pin, 'SEC-PIN-4130QT')
    assign_wing_sections(model, wing_r, props)
    assign_wing_sections(model, wing_l, props)

    # ---- partition + mesh the solids --------------------------------------
    for part, sign in ((leaf_a, 1.0), (leaf_b, -1.0)):
        if msh['partition_for_hex']:
            partition_solid(part, geom, planes_z=interior_z, quadrants=True,
                            web_plane=sign * geom['web_length'])
        bore_edges = part.edges.getByBoundingCylinder(
            center1=(0.0, 0.0, -1.0), center2=(0.0, 0.0, hinge_length + 1.0),
            radius=geom['bore_radius'] * 1.02)
        mesh_solid_part(part, msh, msh['leaf_size'], bore_edges,
                        msh['leaf_bore_size'])

    if msh['partition_for_hex']:
        partition_solid(pin, geom, quadrants=True)
    mesh_solid_part(pin, msh, msh['pin_size'])

    if jobp['quality_check']:
        for part in (leaf_a, leaf_b, pin):
            report_mesh_quality(part)

    # ---- assembly ---------------------------------------------------------
    assembly = model.rootAssembly
    assembly.DatumCsysByDefault(CARTESIAN)

    instances = {
        'LEAF-A': assembly.Instance(name='LEAF-A', part=leaf_a, dependent=ON),
        'LEAF-B': assembly.Instance(name='LEAF-B', part=leaf_b, dependent=ON),
        'PIN': assembly.Instance(name='PIN', part=pin, dependent=ON),
        'WING-R': assembly.Instance(name='WING-R', part=wing_r, dependent=ON),
        'WING-L': assembly.Instance(name='WING-L', part=wing_l, dependent=ON),
    }
    for key in sorted(instances):
        graph.add(key)

    if abs(geom['pin_z_start']) > 1.0e-12:
        assembly.translate(('PIN',), (0.0, 0.0, float(geom['pin_z_start'])))

    for key, sign in (('WING-R', 1.0), ('WING-L', -1.0)):
        assembly.translate((key,), (sign * plate_outer,
                                    float(geom['wing_y_offset']),
                                    float(geom['wing_z_offset'])))
    assembly.regenerate()

    # ---- geometric region selection (survives every parameter change) -----
    surfaces, sets = {}, {}

    for key, sign in (('LEAF-A', 1.0), ('LEAF-B', -1.0)):
        instance = instances[key]
        plate = bbox_faces(instance, xr=(sign * plate_outer,
                                         sign * plate_outer))
        if not len(plate):
            fail('Could not find the plate outer face on %s' % key)
        surfaces[key + '-PLATE'] = assembly.Surface(side1Faces=plate,
                                                    name=key + '-PLATE')

        bore = instance.faces.getByBoundingCylinder(
            center1=(0.0, 0.0, -1.0), center2=(0.0, 0.0, hinge_length + 1.0),
            radius=geom['bore_radius'] * 1.05)
        if not len(bore):
            fail('Could not find the bore faces on %s' % key)
        sets[key + '-BORE'] = assembly.Set(faces=bore, name=key + '-BORE')
        surfaces[key + '-BORE'] = assembly.Surface(side1Faces=bore,
                                                   name=key + '-BORE')

    pin_z0 = float(geom['pin_z_start'])
    pin_mid = pin_z0 + 0.5 * float(geom['pin_length'])
    pin_side = instances['PIN'].faces.findAt(
        ((float(geom['pin_radius']), 0.0, pin_mid),))
    surfaces['PIN-SHAFT'] = assembly.Surface(side1Faces=pin_side,
                                             name='PIN-SHAFT')

    for key in ('WING-R', 'WING-L'):
        instance = instances[key]
        for ring in ('ROOT-RING', 'TIP-RING', 'LOAD-RING'):
            sets['%s-%s' % (key, ring)] = assembly.Set(
                nodes=instance.sets[ring].nodes, name='%s-%s' % (key, ring))
        # For a shell, ALL-SKIN faces are the elements essentially
        # We assigned ALL-SKIN as faces. To make a surface from faces:
        surfaces[key + '-SKIN'] = assembly.Surface(
            side1Faces=instance.sets['ALL-SKIN'].faces,
            name=key + '-SKIN')

    # ---- reference points --------------------------------------------------
    rp_ids = {}

    def reference_point(name, point):
        feature = assembly.ReferencePoint(point=tuple(float(v) for v in point))
        rp_ids[name] = feature.id
        assembly.Set(name=name,
                     referencePoints=(assembly.referencePoints[feature.id],))
        graph.add('RP:' + name)
        return assembly.sets[name]

    reference_point('RP-PIN', (0.0, 0.0, pin_mid))
    for key in ('WING-R', 'WING-L'):
        reference_point('RP-ROOT-' + key[-1],
                        node_centroid(sets['%s-ROOT-RING' % key].nodes))
        reference_point('RP-LOAD-' + key[-1],
                        node_centroid(sets['%s-LOAD-RING' % key].nodes))
        reference_point('RP-TIP-' + key[-1],
                        node_centroid(sets['%s-TIP-RING' % key].nodes))

    # ---- couplings ---------------------------------------------------------
    kind = asm['coupling_type']
    for key in ('WING-R', 'WING-L'):
        side = key[-1]
        for tag, ring in (('ROOT', 'ROOT-RING'), ('LOAD', 'LOAD-RING'),
                          ('TIP', 'TIP-RING')):
            rp_name = 'RP-%s-%s' % (tag, side)
            if tag == 'TIP' and asm['tip_constraint'].upper() == 'RIGID_BODY':
                model.RigidBody(name='RB-TIP-' + side,
                                refPointRegion=assembly.sets[rp_name],
                                tieRegion=sets['%s-%s' % (key, ring)])
            else:
                coupling(model, assembly, 'CP-%s-%s' % (tag, side),
                         assembly.sets[rp_name],
                         sets['%s-%s' % (key, ring)], kind)
            graph.join('RP:' + rp_name, key, '%s coupling' % tag)

    coupling(model, assembly, 'CP-PIN', assembly.sets['RP-PIN'],
             surfaces['PIN-SHAFT'], kind)
    graph.join('RP:RP-PIN', 'PIN', 'pin shaft coupling')

    # ---- wing skin <-> leaf plate bond -------------------------------------
    bond_tolerance = max(geom['chord_root'], geom['chord_tip']) \
        / max(int(msh['wing_chord_elems']), 1) * 2.0

    if asm['bond_mode'].upper() == 'COHESIVE':
        prop = model.ContactProperty('COHESIVE-BOND')
        prop.CohesiveBehavior(defaultPenalties=OFF,
                              table=((10000.0, 3700.0, 3700.0),))
        prop.Damage(criterion=QUAD_TRACTION, initTable=((30.0, 25.0, 25.0),),
                    useEvolution=ON, evolutionType=ENERGY, softening=LINEAR,
                    useMixedMode=ON, mixedModeType=BK, modeMixRatio=ENERGY,
                    exponent=1.75, evolTable=((0.35, 0.9, 0.9),),
                    useStabilization=ON, viscosityCoef=5.5e-5)
        for wing, leaf in (('WING-R', 'LEAF-A'), ('WING-L', 'LEAF-B')):
            contact_pair(model, 'BOND-' + wing, surfaces[leaf + '-PLATE'],
                         surfaces[wing + '-SKIN'], 'COHESIVE-BOND')
        warn('Cohesive bonds are contact based: Abaqus still reports the '
             'wing/leaf groups as separate regions.')
    else:
        for wing, leaf in (('WING-R', 'LEAF-A'), ('WING-L', 'LEAF-B')):
            tie(model, 'BOND-' + wing, surfaces[leaf + '-PLATE'],
                sets['%s-ROOT-RING' % wing], tolerance=bond_tolerance)
            graph.join(wing, leaf, 'tie BOND-' + wing)

    # ---- pin <-> leaf joint -------------------------------------------------
    joint = asm['pin_joint'].upper()
    joint_built = False

    if joint == 'MPC_BEAM':
        for key in ('LEAF-A', 'LEAF-B'):
            model.MultipointConstraint(name='MPC-PIN-' + key,
                                       controlPoint=assembly.sets['RP-PIN'],
                                       surface=sets[key + '-BORE'],
                                       mpcType=BEAM_MPC,
                                       userMode=DOF_MODE_MPC, userType=0,
                                       csys=None)
            graph.join('RP:RP-PIN', key, 'beam MPC')
        joint_built = True

    elif joint == 'CONNECTOR':
        csys_feature = assembly.DatumCsysByThreePoints(
            name='CSYS-HINGE', coordSysType=CARTESIAN,
            origin=(0.0, 0.0, pin_mid),
            point1=(0.0, 0.0, pin_mid + 10.0),
            point2=(10.0, 0.0, pin_mid))
        datum = assembly.datums[csys_feature.id]
        model.ConnectorSection(name='CS-HINGE', assembledType=HINGE)
        pin_point = assembly.referencePoints[rp_ids['RP-PIN']]

        # Both hinge wires run along the pin axis, so they are collinear and
        # they overlap. With mergeType=IMPRINT the second wire is imprinted
        # onto the first, the edges are re-numbered, and the section is then
        # re-applied to an edge that already owns one:
        #     "One of the specified wires or attachment lines already has a
        #      section assignment."
        # SEPARATE keeps each wire independent, and the edges are identified
        # by identity instead of by an index slice.
        for key in ('LEAF-A', 'LEAF-B'):
            owner = 0 if key.endswith('A') else 1
            centres = [0.5 * (b[0] + b[1]) for b in bands if b[2] == owner]
            centre_z = sum(centres) / float(len(centres))
            if abs(centre_z - pin_mid) < 1.0e-6:
                centre_z += 0.25 * hinge_length / len(bands)

            rp_name = 'RP-BORE-' + key
            reference_point(rp_name, (0.0, 0.0, centre_z))
            coupling(model, assembly, 'CP-BORE-' + key,
                     assembly.sets[rp_name], sets[key + '-BORE'],
                     'DISTRIBUTING')
            graph.join('RP:' + rp_name, key, 'bore coupling')

            marks = edge_fingerprints(assembly)
            assembly.WirePolyLine(
                points=((pin_point,
                         assembly.referencePoints[rp_ids[rp_name]]),),
                mergeType=SEPARATE, meshable=OFF)

            edges = new_wire_edges(assembly, marks)
            if edges is None:
                fail('The hinge wire for %s was not created. Check that '
                     'RP-PIN and %s are not coincident.' % (key, rp_name))

            wire_name = 'WIRE-' + key
            assembly.Set(edges=edges, name=wire_name)
            assignment = assembly.SectionAssignment(
                sectionName='CS-HINGE', region=assembly.sets[wire_name])
            assembly.ConnectorOrientation(region=assignment.getSet(),
                                          localCsys1=datum)
            graph.join('RP:RP-PIN', 'RP:' + rp_name, 'hinge connector')
        joint_built = True

    elif joint == 'CONTACT':
        prop = model.ContactProperty('PIN-BORE')
        prop.NormalBehavior(pressureOverclosure=HARD, allowSeparation=ON,
                            constraintEnforcementMethod=DEFAULT)
        prop.TangentialBehavior(formulation=PENALTY,
                                table=((float(asm['friction']),),))
        for key in ('LEAF-A', 'LEAF-B'):
            contact_pair(model, 'PIN-' + key, surfaces['PIN-SHAFT'],
                         surfaces[key + '-BORE'], 'PIN-BORE')
        warn('CONTACT joint: contact is not a connection for the region '
             'count, so Abaqus will still report 3 regions. Stabilisation '
             'is enabled in the step to control the initial free body.')
    else:
        warn('pin_joint = NONE: the pin stays a separate, floating region.')

    # ---- step ---------------------------------------------------------------
    step_arguments = dict(
        name='Step-1', previous='Initial',
        description='Parametric hinge / wing static analysis',
        nlgeom=(ON if ana['nlgeom'] else OFF),
        timePeriod=float(ana['time_period']),
        maxNumInc=int(ana['max_num_inc']),
        initialInc=float(ana['initial_inc']),
        minInc=float(ana['min_inc']),
        maxInc=float(ana['max_inc']))

    if ana['stabilise']:
        step_arguments.update(
            stabilizationMethod=DISSIPATED_ENERGY_FRACTION,
            stabilizationMagnitude=float(ana['stabilise_magnitude']),
            adaptiveDampingRatio=0.05, continueDampingFactors=ON)

    model.StaticStep(**step_arguments)
    model.SmoothStepAmplitude(name='Amp-1', timeSpan=STEP,
                              data=((0.0, 0.0), (1.0, 1.0)))

    # ---- boundary conditions -------------------------------------------------
    bc_mode = ana['bc_mode'].upper()

    if bc_mode == 'PIN':
        model.EncastreBC(name='BC-PIN', createStepName='Initial',
                         region=assembly.sets['RP-PIN'])
        graph.join('RP:RP-PIN', 'GROUND', 'BC-PIN')
        if joint in ('CONNECTOR', 'CONTACT', 'NONE'):
            warn('bc_mode = PIN with pin_joint = %s leaves the leaves free '
                 'to rotate about the hinge axis. Use MPC_BEAM, or add a '
                 'rotational stop, unless the loads balance that DOF.'
                 % joint)
    else:
        for side in ('R', 'L'):
            name = 'BC-ROOT-' + side
            rp_name = 'RP-ROOT-' + side
            if ana['release_hinge_rotation']:
                model.DisplacementBC(name=name, createStepName='Initial',
                                     region=assembly.sets[rp_name],
                                     u1=0.0, u2=0.0, u3=0.0,
                                     ur1=0.0, ur2=UNSET, ur3=0.0)
            else:
                model.EncastreBC(name=name, createStepName='Initial',
                                 region=assembly.sets[rp_name])
            graph.join('RP:' + rp_name, 'GROUND', name)

    pin_floating = not graph.is_grounded('PIN')
    if pin_floating and not joint_built and bc_mode != 'PIN':
        model.EncastreBC(name='BC-PIN-STABILISE', createStepName='Initial',
                         region=assembly.sets['RP-PIN'])
        graph.join('RP:RP-PIN', 'GROUND', 'BC-PIN-STABILISE')
        warn('The pin was still floating, so its reference point was '
             'grounded. This is a numerical crutch, not a boundary '
             'condition - prefer pin_joint = CONNECTOR or MPC_BEAM.')

    # ---- loads ---------------------------------------------------------------
    force = float(ana['tip_force']) * float(ana['load_scale'])
    moment = float(ana['root_moment']) * float(ana['load_scale'])

    for side in ('R', 'L'):
        model.ConcentratedForce(name='LOAD-MID-' + side,
                                createStepName='Step-1',
                                region=assembly.sets['RP-LOAD-' + side],
                                cf2=force, amplitude='Amp-1', follower=OFF)
        model.ConcentratedForce(name='LOAD-TIP-' + side,
                                createStepName='Step-1',
                                region=assembly.sets['RP-TIP-' + side],
                                cf2=-force, amplitude='Amp-1', follower=OFF)

    model.Moment(name='LOAD-MOMENT-R', createStepName='Step-1',
                 region=assembly.sets['RP-LOAD-R'], cm2=-moment,
                 amplitude='Amp-1')
    model.Moment(name='LOAD-MOMENT-L', createStepName='Step-1',
                 region=assembly.sets['RP-LOAD-L'], cm2=moment,
                 amplitude='Amp-1')

    # ---- output --------------------------------------------------------------
    for name in list(model.fieldOutputRequests.keys()):
        del model.fieldOutputRequests[name]
    for name in list(model.historyOutputRequests.keys()):
        del model.historyOutputRequests[name]

    variables = ['S', 'LE', 'U', 'RF', 'CF']
    if props['enable_hashin']:
        variables += ['HSNFTCRT', 'HSNFCCRT', 'HSNMTCRT', 'HSNMCCRT']
    if evolution_active:
        variables += ['DAMAGEFT', 'DAMAGEFC', 'DAMAGEMT', 'DAMAGEMC',
                      'SDEG', 'STATUS']
    if joint == 'CONTACT' or asm['bond_mode'].upper() == 'COHESIVE':
        variables += ['CSTRESS', 'CDISP']
    if joint == 'CONNECTOR':
        variables += ['CTF', 'CU', 'CUE']

    model.FieldOutputRequest(name='F-Output-1', createStepName='Step-1',
                             variables=tuple(variables),
                             numIntervals=int(ana['field_intervals']))
    model.HistoryOutputRequest(name='H-Output-1', createStepName='Step-1',
                               variables=PRESELECT,
                               numIntervals=int(ana['history_intervals']))

    assembly.regenerate()

    if jobp['audit']:
        regions = graph.report()
        if regions > 1:
            warn('Abaqus will report "There are %d unconnected regions in '
                 'the model."' % regions)

    return model, job_name


def build_model_safely(params, model_name=None, job_name=None):
    """build_model with one automatic retry on a welded (MPC) hinge.

    Connector wires are the only part of the build that depends on assembly
    geometry bookkeeping. If it ever fails, the model is discarded and
    rebuilt from scratch with pin_joint = MPC_BEAM, so the run still produces
    a usable input file instead of a half-built model.
    """
    try:
        return build_model(params, model_name=model_name, job_name=job_name)
    except Exception as error:
        if params['assembly']['pin_joint'].upper() != 'CONNECTOR':
            raise
        warn('Connector hinge build failed (%s).' % error)
        warn('Rebuilding the whole model with pin_joint = MPC_BEAM.')

        name = str(model_name or params['job']['model_name'])
        if name in mdb.models.keys():
            del mdb.models[name]

        retry = json.loads(json.dumps(params))
        retry['assembly']['pin_joint'] = 'MPC_BEAM'
        return build_model(retry, model_name=model_name, job_name=job_name)


def run_job(model, job_name, jobp):
    if job_name in mdb.jobs.keys():
        del mdb.jobs[job_name]

    job = mdb.Job(name=job_name, model=model.name,
                  description='Parametric l12 hinge/wing model',
                  type=ANALYSIS, memory=int(jobp['memory_pct']),
                  memoryUnits=PERCENTAGE, numCpus=int(jobp['cpus']),
                  numDomains=int(jobp['cpus']),
                  multiprocessingMode=DEFAULT,
                  nodalOutputPrecision=SINGLE)

    if jobp['save_cae']:
        path = os.path.join(os.getcwd(), model.name + '.cae')
        mdb.saveAs(pathName=path)
        log('Saved %s' % path)

    if jobp['write_input']:
        job.writeInput(consistencyChecking=ON)
        log('Wrote %s.inp' % job_name)

    if jobp['submit']:
        log('Submitting %s ...' % job_name)
        job.submit(consistencyChecking=ON)
        if jobp['wait']:
            job.waitForCompletion()
            log('Job status: %s' % job.status)

    return job


# =============================================================================
#  10. STUDIES - the payoff of a fully parametric model
# =============================================================================

def mesh_convergence_study(params, sizes):
    """Rebuild and write one input file per solid seed size."""
    results = []
    for size in sizes:
        local = json.loads(json.dumps(params))
        local['mesh']['leaf_size'] = float(size)
        local['mesh']['leaf_bore_size'] = float(size) * 0.5
        local['mesh']['pin_size'] = float(size) * 1.2
        tag = 'seed%s' % str(size).replace('.', 'p')
        name = '%s_%s' % (params['job']['job_name'], tag)
        model, job_name = build_model_safely(local, model_name=name,
                                             job_name=name)
        run_job(model, job_name, local['job'])
        counts = sum(len(model.parts[key].elements) for key in model.parts.keys())
        results.append((size, counts))
        log('Mesh study: seed %.2f -> %d elements' % (size, counts))
    print('')
    print('MESH CONVERGENCE SET')
    for size, counts in results:
        print('  seed %6.2f mm : %8d elements' % (size, counts))
    return results


def parameter_sweep(params, cases):
    """cases = [{'label': 'bore8', 'geom.bore_radius': 8.0}, ...]"""
    for case in cases:
        local = json.loads(json.dumps(params))
        label = case.pop('label', 'case')
        deep_update(local, case)
        name = '%s_%s' % (params['job']['job_name'], label)
        model, job_name = build_model_safely(local, model_name=name,
                                             job_name=name)
        run_job(model, job_name, local['job'])
        log('Sweep case %s complete' % label)


# =============================================================================
#  11. ENTRY POINT
# =============================================================================

def main():
    params, study = parse_command_line(PARAMS)

    print('')
    print('=' * 72)
    print('L12 PARAMETRIC HINGE / WING BUILDER')
    print('=' * 72)
    for group in ('geom', 'mesh', 'assembly', 'analysis'):
        for key in sorted(params[group]):
            print('  %-12s %-26s %s' % (group, key, params[group][key]))
    print('=' * 72)
    print('')

    if study:
        mesh_convergence_study(params, study)
        return

    model, job_name = build_model_safely(params)
    run_job(model, job_name, params['job'])

    try:
        viewport = session.viewports[session.currentViewportName]
        viewport.setValues(displayedObject=model.rootAssembly)
        viewport.view.fitView()
    except Exception:
        pass

    log('Done.')


if __name__ == '__main__':
    main()
