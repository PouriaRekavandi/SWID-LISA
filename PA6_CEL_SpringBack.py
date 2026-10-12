# -*- coding: utf-8 -*-
"""
===========================================================================
PA6 CEL Burr Spring-Back Simulation -- Abaqus/CAE 2017   (v11)
Unit system: mm - tonne - s - N - MPa - K   (energy = mJ, power = mW)
Run: File --> Run Script
===========================================================================
"""
from abaqus import *
from abaqusConstants import *
from caeModules import *
import math, os, mesh

# ============================================================
# SETTINGS
# ============================================================
MDL      = 'PA6-CEL-SpringBack'
JOB_NAME = 'PA6-CEL-v13'
SUB_FILE = 'VUMAT_PA6_v13.for'          # must be in the same folder as SAVE
SAVE     = r'PA6_CEL_final_v13.cae'
N_CPU    = 4

# -- [F] Material state (brief Section 2.1: sample 1_1 = as-delivered) --
MATERIAL_STATE = 'as_delivered'   # 'as_delivered' | 'dried'


# -- Eulerian domain geometry (mm) --
EUL_LX, EUL_LY, EUL_LZ = 2.00, 0.50, 0.40
WP_LY           = 0.25        # workpiece thickness

# -- Cutting parameters --
CUT_V           = 1666.7      # 100 m/min in mm/s
AP              = 0.05        # depth of cut (mm)
HALF_ANG        = 25.0        # tool half-angle (deg)
TOOL_H          = 0.25        # tool height (mm)
TOOL_LX         = 0.50        # tool extrusion length (mm)
LIFT_V          = 1000.0      # tool lift velocity in Tool-Exit (mm/s)

# -- Tool starting position (front end of tool at x = 0) --
TIP_X0 = -TOOL_LX
TIP_Y0 = WP_LY - AP
TIP_Z0 = EUL_LZ / 2.0

# -- Time periods (s) --
T_CUT  = (EUL_LX + abs(TIP_X0) + 0.10) / CUT_V   # tool fully leaves domain
T_EXIT = 2.0e-4

# T_REC is sized from the new VUMAT's static-recovery rate
_T_BURR_EST  = 350.0
_R_STAT0     = 50.0
_QACT_R      = 4000.0
_TREF        = 298.15
_R_STAT_EST  = _R_STAT0*math.exp(-_QACT_R*(1.0/_T_BURR_EST - 1.0/_TREF))
T_REC = max(5.0e-4, 5.0 / max(_R_STAT_EST, 1.0))  # >= 5 time constants

# -- [E] Mass-scaling targets (placeholder trade-off, see header [E]) --
MS_DT_CUT = 2.0e-9   # target stable dt during Cutting (tune for cost)
MS_DT_REC = 2.0e-7   # target stable dt during Tool-Exit/Recovery:

# -- Mesh (mm) --
MESH_E = 0.010      # Eulerian -> 200 x 50 x 40 = 400,000 elements
MESH_T = 0.005      # tool surface: finer than Eulerian
MAX_EUL_ELEMS = 600000

# -- Output --
FIELD_DT_CUT = 1.5e-5     # ~100 frames in the cutting step

# -- PA6 VUMAT constants (43 entries, 1-based index in comments) --
#  1 E0   2 nu    3 Tref  4 dEdT  7 sigA   9 C_rate  10 b_voce  11 m_th
# 12 edot_ref  14 T_glass  16 T_melt  18 beta(TQ)  19 sig_sat  20 edot0
# 31 alpha (1/K)
# 32 C_kin  33 gamma_kin  34 r_stat0  35 Qact_R  36 eta_recov
PROPS = [
    2000.0,  0.40,    298.15, -4.0,    0.0,
    0.0,     42.0,    1.0,    0.07,    6.0,
    0.28,    30.0,    950.0,  333.15,  453.15,
    503.15,  0.05,    0.75,   90.0,    1.0e-3,
    22.0,    5.0e-2,  12.0,   100.0,   0.0,
    0.0,     0.0,     0.0,    0.40,    0.0,
    8.5e-5,
    150.0,   8.0,     50.0,   4000.0,  0.5,
    0.0,     0.0,     0.0,    0.0,
    0.0,     0.0,     0.0,
]
assert len(PROPS) == 43, 'PROPS must have exactly 43 entries'

if MATERIAL_STATE == 'dried':
    PROPS[0]  *= 1.15     # E0: dry PA6 stiffer
    PROPS[13] += 20.0     # T_glass-ish softening onset shifts up (K)
    PROPS[14] += 10.0     # T_melt-softening-start shifts up slightly

N_SDV      = 9
PA6_RHO    = 1.26766e-9
BETA_TQ    = PROPS[17]            # Taylor-Quinney (props(18))

# Conductivity in N/(s K) == W/(m K) numerically.   [FIXED x1000]
PA6_K  = [
    (0.250, 253.15), (0.255, 273.15), (0.263, 298.15),
    (0.270, 348.15), (0.275, 398.15), (0.278, 453.15), (0.280, 503.15)
]
# Specific heat in mJ/(tonne K) = 1e6 * J/(kg K)
PA6_CP = [
    (1.30e9, 253.15), (1.42e9, 273.15), (1.60e9, 298.15),
    (1.90e9, 348.15), (2.20e9, 398.15), (2.55e9, 453.15), (2.70e9, 503.15)
]

# -- Tool material (WC-Co) -- NOTE: tool is DISCRETE RIGID, so this
#    material is defined for documentation only (not assigned).
TOOL_E, TOOL_NU = 600000.0, 0.22
TOOL_RHO        = 1.495e-8
TOOL_K, TOOL_CP = 50.0, 2.0e8                     # [FIXED x1000]

# -- Contact --
FRIC  = [(0.30, 298.15), (0.45, 373.15), (0.15, 453.15)]
GAP_COND              = 0.5      # 500 W/(m2 K) -> N/(s mm K)   [FIXED x1000]
T0 = 298.15

# ============================================================
# HELPERS
# ============================================================
def log(s):
    print('    ' + s)

def safe(fn, label=''):
    try:
        return fn()
    except Exception as _e:
        print('    WARNING [{}]: {}'.format(label, _e))
        return None

def fbb(inst, x0, y0, z0, x1, y1, z1, tol=1e-6):
    return inst.faces.getByBoundingBox(
        xMin=x0-tol, yMin=y0-tol, zMin=z0-tol,
        xMax=x1+tol, yMax=y1+tol, zMax=z1+tol)

def kw_pos(blks, kw):
    for i, b in enumerate(blks):
        if kw in b.lower():
            return i
    return len(blks) - 1

# ============================================================
if __name__ == '__main__':
    print('')
    print('=' * 60)
    print('  PA6 CEL Spring-Back  --  v13')
    print('=' * 60)

    # Work in the folder of SAVE so the VUMAT is found at submit time
    _wd = os.path.dirname(SAVE)
    if _wd and os.path.isdir(_wd):
        os.chdir(_wd)

    # [1] MODEL SETUP
    print('[1] Model setup ...')
    if MDL in mdb.models:
        del mdb.models[MDL]
    m = mdb.Model(name=MDL)
    if 'Model-1' in mdb.models and MDL != 'Model-1':
        del mdb.models['Model-1']
    print('    OK')

    # [2] EULERIAN DOMAIN PART & PARTITION
    print('[2] Eulerian domain ...')
    ep = m.Part(name='Eulerian-Domain', dimensionality=THREE_D, type=EULERIAN)
    sk = m.ConstrainedSketch(name='__e__', sheetSize=10.)
    sk.rectangle(point1=(0., 0.), point2=(EUL_LX, EUL_LY))
    ep.BaseSolidExtrude(sketch=sk, depth=EUL_LZ)
    del m.sketches['__e__']

    dp = ep.DatumPlaneByPrincipalPlane(principalPlane=XZPLANE, offset=WP_LY)
    ep.PartitionCellByDatumPlane(datumPlane=ep.datums[dp.id], cells=ep.cells)
    log('Partition at Y={} mm'.format(WP_LY))
    print('    OK')

    # [3] TOOL PART (V-GROOVE)
    print('[3] Tool part ...')
    tp = m.Part(name='Tool', dimensionality=THREE_D,
                type=DISCRETE_RIGID_SURFACE)
    tanA = math.tan(math.radians(HALF_ANG))
    hw   = TOOL_H * tanA
    sk2  = m.ConstrainedSketch(name='__t__', sheetSize=5.)
    sk2.Line(point1=(-hw, TOOL_H), point2=(0., 0.))
    sk2.Line(point1=(0., 0.),      point2=(hw, TOOL_H))
    tp.BaseShellExtrude(sketch=sk2, depth=TOOL_LX)
    del m.sketches['__t__']

    rp = tp.ReferencePoint(point=(0.0, 0.0, TOOL_LX / 2.0))
    print('    OK')

    # [4] MATERIALS
    print('[4] Materials ...')
    PA6_C_DIL = math.sqrt(
        2000.0*(1.0-0.40)/((1.0+0.40)*(1.0-2.0*0.40)) / PA6_RHO)
    log('PA6 c_dil = {:.4e} mm/s = {:.0f} m/s'.format(PA6_C_DIL, PA6_C_DIL/1e3))

    p6 = m.Material(name='PA6')
    p6.Depvar(n=N_SDV)
    p6.UserMaterial(mechanicalConstants=tuple(PROPS), thermalConstants=())
    p6.Density(table=((PA6_RHO,),))
    p6.Conductivity(temperatureDependency=ON, table=tuple(PA6_K))
    p6.SpecificHeat(temperatureDependency=ON, table=tuple(PA6_CP))
    safe(lambda: p6.InelasticHeatFraction(fraction=BETA_TQ), 'InelasticHeatFraction')

    tm = m.Material(name='WC-Co')
    tm.Elastic(table=((TOOL_E, TOOL_NU),))
    tm.Density(table=((TOOL_RHO,),))
    tm.Conductivity(table=((TOOL_K,),))
    tm.SpecificHeat(table=((TOOL_CP,),))
    print('    OK')

    # [5] ELEMENT SETS & EULERIAN SECTION
    print('[5] Element sets & Eulerian Section ...')
    ep.Set(name='All-Eul', cells=ep.cells)

    _wc = ep.cells.getByBoundingBox(
        xMin=-0.001, yMin=-0.001, zMin=-0.001,
        xMax=EUL_LX + 0.001, yMax=WP_LY + 0.001, zMax=EUL_LZ + 0.001)
    if len(_wc) == 0:
        raise RuntimeError('WP-Zone is empty: partition at Y={} failed. '
                           'Aborting (otherwise the whole domain would be PA6).'
                           .format(WP_LY))
    ep.Set(name='WP-Zone', cells=_wc)
    log('WP-Zone: {} cell(s)'.format(len(_wc)))

    eul_section_assigned = False
    try:
        m.EulerianSection(name='Eulerian-PA6', data={'PA6': 'PA6'})
        ep.SectionAssignment(region=ep.sets['All-Eul'],
                             sectionName='Eulerian-PA6')
        eul_section_assigned = True
        log('EulerianSection assigned natively.')
    except Exception as _ese:
        log('EulerianSection API notice: ' + str(_ese))
    print('    OK')

    # [6] MESH: EULERIAN (EC3D8RT)
    print('[6] Mesh Eulerian ...')
    etE = mesh.ElemType(elemCode=EC3D8RT, elemLibrary=EXPLICIT,
                        secondOrderAccuracy=OFF, distortionControl=DEFAULT)
    ep.setElementType(regions=(ep.cells,), elemTypes=(etE,))
    ep.seedPart(size=MESH_E, deviationFactor=0.1, minSizeFactor=0.1)
    ep.generateMesh()
    n_eul = len(ep.elements)
    log('{:,} Eulerian elements generated.'.format(n_eul))
    if n_eul > MAX_EUL_ELEMS:
        raise RuntimeError('Eulerian mesh too large ({:,}); check MESH_E.'
                           .format(n_eul))
    print('    OK')

    # [7] MESH: TOOL
    print('[7] Mesh tool ...')
    etT = mesh.ElemType(elemCode=R3D4, elemLibrary=EXPLICIT)
    tp.setElementType(regions=(tp.faces,), elemTypes=(etT,))
    tp.seedPart(size=MESH_T, deviationFactor=0.1, minSizeFactor=0.1)
    tp.generateMesh()
    log('{:,} tool elements (size {} mm).'.format(len(tp.elements), MESH_T))
    print('    OK')

    # [8] SURFACES
    print('[8] Surfaces ...')
    safe(lambda: ep.Surface(name='Eul-Surf', side1Faces=ep.faces), 'Eul-Surf')
    tp.Surface(name='Tool-Surf', side1Faces=tp.faces)
    print('    OK')

    # [9] ASSEMBLY & TOOL POSITIONING
    print('[9] Assembly ...')
    a = m.rootAssembly
    a.DatumCsysByDefault(CARTESIAN)
    iE = a.Instance(name='Eul-1',  part=ep, dependent=ON)
    iT = a.Instance(name='Tool-1', part=tp, dependent=ON)

    a.rotate(instanceList=('Tool-1',),
             axisPoint=(0.0, 0.0, 0.0),
             axisDirection=(0.0, 1.0, 0.0),
             angle=90.0)
    a.translate(instanceList=('Tool-1',),
                vector=(TIP_X0, TIP_Y0, TIP_Z0))
    log('Tool front start: ({:.3f}, {:.3f}, {:.3f}) mm'.format(
        TIP_X0, TIP_Y0, TIP_Z0))

    RP_asm = a.Set(name='Tool-RP',
                   referencePoints=(iT.referencePoints[rp.id],))
    print('    OK')

    # [10] STEPS
    print('[10] Steps ...')
    m.TempDisplacementDynamicsStep(
        name='Cutting', previous='Initial',
        timePeriod=T_CUT, nlgeom=ON,
        linearBulkViscosity=0.06, quadBulkViscosity=1.2)
    m.TempDisplacementDynamicsStep(
        name='Tool-Exit', previous='Cutting',
        timePeriod=T_EXIT, nlgeom=ON,
        linearBulkViscosity=0.06, quadBulkViscosity=1.2)
    m.TempDisplacementDynamicsStep(
        name='Recovery', previous='Tool-Exit',
        timePeriod=T_REC, nlgeom=ON,
        linearBulkViscosity=0.06, quadBulkViscosity=1.2)
    print('    OK')

    # [11] CONTACT
    print('[11] Contact ...')
    cp = m.ContactProperty('Tool-PA6')
    cp.TangentialBehavior(
        formulation=PENALTY, directionality=ISOTROPIC,
        slipRateDependency=OFF, pressureDependency=OFF,
        temperatureDependency=ON, dependencies=0,
        table=tuple(FRIC),
        maximumElasticSlip=FRACTION, fraction=0.005)
    cp.NormalBehavior(
        pressureOverclosure=HARD, allowSeparation=ON,
        constraintEnforcementMethod=DEFAULT)
    cp.ThermalConductance(
        definition=TABULAR,
        clearanceDependency=OFF, pressureDependency=ON,
        temperatureDependencyP=OFF, massFlowRateDependencyP=OFF,
        dependenciesP=0,
        pressureDepTable=(
            (GAP_COND, 0.0),
            (GAP_COND, 1.0e4)
        ))

    _hg_ok = False
    for _kw in [
        dict(conversionFraction=1.0, slaveFraction=0.5),
        dict(conversionFactor=1.0,   slaveFraction=0.5),
        dict(fraction=1.0,           slaveFraction=0.5),
        {}
    ]:
        try:
            cp.HeatGeneration(**_kw)
            _hg_ok = True
            break
        except Exception:
            pass
    if not _hg_ok:
        log('WARNING: HeatGeneration (frictional heat) could not be defined.')

    gc = m.ContactExp(name='All-Contact', createStepName='Initial')
    gc.includedPairs.setValuesInStep(stepName='Initial', useAllstar=ON)
    gc.contactPropertyAssignments.appendInStep(
        stepName='Initial',
        assignments=((GLOBAL, SELF, 'Tool-PA6'),))
    print('    OK')

    # [12] BOUNDARY CONDITIONS
    print('[12] BCs ...')
    bc_bot = a.Set(name='Eul-Bot',
                   faces=fbb(iE, 0, 0, 0, EUL_LX, 0, EUL_LZ))
    m.EncastreBC(name='Fix-Bot', createStepName='Initial', region=bc_bot)

    bc_in = a.Set(name='Eul-In',
                  faces=fbb(iE, 0, 0, 0, 0, EUL_LY, EUL_LZ))
    m.DisplacementBC(name='Fix-Inlet', createStepName='Initial',
                     region=bc_in,
                     u1=SET, u2=UNSET, u3=UNSET,
                     ur1=UNSET, ur2=UNSET, ur3=UNSET)

    bc_z0 = a.Set(name='Eul-Z0',
                  faces=fbb(iE, 0, 0, 0, EUL_LX, EUL_LY, 0))
    m.DisplacementBC(name='Sym-Z0', createStepName='Initial',
                     region=bc_z0,
                     u1=UNSET, u2=UNSET, u3=SET,
                     ur1=UNSET, ur2=UNSET, ur3=UNSET)

    bc_zL = a.Set(name='Eul-ZL',
                  faces=fbb(iE, 0, 0, EUL_LZ, EUL_LX, EUL_LY, EUL_LZ))
    m.DisplacementBC(name='Sym-ZL', createStepName='Initial',
                     region=bc_zL,
                     u1=UNSET, u2=UNSET, u3=SET,
                     ur1=UNSET, ur2=UNSET, ur3=UNSET)

    _t_ramp = min(T_CUT * 0.02, 5e-5)
    m.TabularAmplitude(
        name='Ramp', timeSpan=STEP, smooth=SOLVER_DEFAULT,
        data=((0., 0.), (_t_ramp, 1.), (T_CUT, 1.)))

    m.VelocityBC(
        name='V-Cut', createStepName='Cutting', region=RP_asm,
        v1=CUT_V, v2=0., v3=0., vr1=0., vr2=0., vr3=0.,
        amplitude='Ramp')
    m.boundaryConditions['V-Cut'].deactivate('Tool-Exit')

    m.VelocityBC(
        name='V-Exit', createStepName='Tool-Exit', region=RP_asm,
        v1=0., v2=LIFT_V, v3=0., vr1=0., vr2=0., vr3=0.)
    m.boundaryConditions['V-Exit'].deactivate('Recovery')

    m.VelocityBC(
        name='V-Rec', createStepName='Recovery', region=RP_asm,
        v1=0., v2=0., v3=0., vr1=0., vr2=0., vr3=0.)
    print('    OK')

    # [13] INITIAL TEMPERATURE
    print('[13] Temperature IC ...')
    nE = a.Set(name='N-Eul', nodes=iE.nodes)
    m.Temperature(name='IC-T-Eul', createStepName='Initial',
                  region=nE, distributionType=UNIFORM,
                  magnitudes=(T0,))
    m.TemperatureBC(name='T-Tool', createStepName='Cutting',
                    region=RP_asm, distributionType=UNIFORM,
                    magnitude=T0)
    print('    OK')

    # [14] OUTPUT REQUESTS
    print('[14] Output ...')
    for k in list(m.fieldOutputRequests.keys()):
        del m.fieldOutputRequests[k]
    for k in list(m.historyOutputRequests.keys()):
        del m.historyOutputRequests[k]

    FV_VARS = ('EVF', 'SDV', 'TEMP', 'S', 'U', 'V', 'STATUS')

    def make_fout(name, step, **kw):
        try:
            m.FieldOutputRequest(name=name, createStepName=step,
                                 variables=FV_VARS, **kw)
        except Exception as _fe:
            log('WARNING {}: {}'.format(name, _fe))

    make_fout('F-Cut',  'Cutting',   timeInterval=FIELD_DT_CUT)
    m.fieldOutputRequests['F-Cut'].deactivate('Tool-Exit')

    make_fout('F-Exit', 'Tool-Exit', numIntervals=10)
    m.fieldOutputRequests['F-Exit'].deactivate('Recovery')

    make_fout('F-Rec',  'Recovery',  numIntervals=40)

    m.HistoryOutputRequest(
        name='H-Ener', createStepName='Cutting',
        variables=('ALLIE', 'ALLKE', 'ALLAE', 'ETOTAL',
                   'ALLPD', 'ALLWK', 'ALLFD'),
        region=MODEL, numIntervals=500)
    m.HistoryOutputRequest(
        name='H-Rec', createStepName='Recovery',
        variables=('ALLIE', 'ALLKE', 'ALLAE', 'ETOTAL'),
        region=MODEL, numIntervals=200)
    safe(lambda: m.HistoryOutputRequest(
        name='H-Force', createStepName='Cutting',
        variables=('RF1', 'RF2', 'RF3', 'U1', 'U2', 'U3'),
        region=RP_asm, numIntervals=1000), 'H-Force')
    print('    OK')

    # [15] WP MATERIAL ASSIGNMENT (EVF)
    print('[15] WP zone & EVF assignment ...')
    wc = iE.cells.getByBoundingBox(
        -1e-6, -1e-6, -1e-6,
        EUL_LX + 1e-6, WP_LY + 1e-6, EUL_LZ + 1e-6)
    if len(wc) == 0:
        raise RuntimeError('No instance cells found in WP zone.')
    wp_reg = a.Set(name='WP-Zone', cells=wc)

    mat_assign_done = False
    try:
        m.MaterialAssignment(
            name='Material-Assign-PA6',
            instanceList=(iE,),
            useFields=OFF,
            assignmentList=((wp_reg, (1.0,)),))
        mat_assign_done = True
        log('MaterialAssignment (EVF) created natively.')
    except Exception as _mae:
        log('MaterialAssignment API notice: ' + str(_mae))
    print('    OK')

    # [16] KEYWORD VERIFICATION & FALLBACK INJECTION
    print('[16] Keyword verification ...')
    m.keywordBlock.synchVersions(storeNodesAndElements=False)
    blks = m.keywordBlock.sieBlocks

    if not eul_section_assigned:
        part_idx = -1
        for _i, _b in enumerate(blks):
            if '*part' in _b.lower() and 'eulerian-domain' in _b.lower():
                part_idx = _i
                break
        if part_idx >= 0:
            for _j in range(part_idx + 1, len(blks)):
                if '*end part' in blks[_j].lower():
                    eul_kw = ('*Eulerian Section, elset=All-Eul\n'
                              'PA6,')
                    m.keywordBlock.insert(position=_j - 1, text=eul_kw)
                    break
        m.keywordBlock.synchVersions(storeNodesAndElements=False)
        blks = m.keywordBlock.sieBlocks

    if not mat_assign_done:
        pos = kw_pos(blks, '*end assembly')
        evf_kw = ('*Initial Conditions, type=Volume Fraction\n'
                  'Eul-1.WP-Zone, 1.0')
        m.keywordBlock.insert(position=pos, text=evf_kw)
        m.keywordBlock.synchVersions(storeNodesAndElements=False)

    def _inject_mass_scaling(step_name, target_dt):
        blks2 = m.keywordBlock.sieBlocks
        step_idx = -1
        for _i, _b in enumerate(blks2):
            bl = _b.lower()
            if bl.startswith('*step') and 'name=' + step_name.lower() in bl:
                step_idx = _i
                break
        if step_idx < 0:
            return False
        for _j in range(step_idx + 1, len(blks2)):
            bl2 = blks2[_j].lower()
            if bl2.startswith('*end step'):
                break
            if bl2.startswith('*dynamic'):
                ms_kw = ('*Variable Mass Scaling, dt={:.3e}, '
                         'type=below min, frequency=200').format(target_dt)
                m.keywordBlock.insert(position=_j, text=ms_kw)
                m.keywordBlock.synchVersions(storeNodesAndElements=False)
                return True
        return False

    _inject_mass_scaling('Cutting',   MS_DT_CUT)
    _inject_mass_scaling('Tool-Exit', MS_DT_REC)
    _inject_mass_scaling('Recovery',  MS_DT_REC)
    print('    OK')

    # [17] JOB CREATION
    print('[17] Creating job ...')
    try:
        if JOB_NAME in mdb.jobs:
            del mdb.jobs[JOB_NAME]
        mdb.Job(
            name=JOB_NAME,
            model=MDL,
            type=ANALYSIS,
            explicitPrecision=DOUBLE_PLUS_PACK,
            nodalOutputPrecision=SINGLE,
            description='PA6 CEL Burr SpringBack',
            parallelizationMethodExplicit=DOMAIN,
            numDomains=N_CPU,
            numCpus=N_CPU,
            userSubroutine=SUB_FILE,
            scratch='',
            resultsFormat=ODB,
            multiprocessingMode=DEFAULT,
            memory=90,
            memoryUnits=PERCENTAGE)
    except Exception as _je:
        log('Job creation warning: ' + str(_je))
    print('    OK')

    # [18] SAVE
    print('[18] Saving CAE ...')
    try:
        # Avoid error if running headless/no display
        mdb.saveAs(pathName=SAVE)
    except Exception as _se:
        pass

    print('=' * 60)
    print('  Model complete.')
    print('=' * 60)
