# -*- coding: utf-8 -*-
# Abaqus/CAE Python 2.7 script to generate the 3D CEL Cutting Simulation
# It implements a two-step explicit analysis: Cut (tool passes) and Relax (tool exits, recovery begins)

from abaqus import *
from abaqusConstants import *
from caeModules import *

def build_cutting_model():
    Mdb()
    model_name = 'CEL_Cutting_3D'
    mdb.models.changeKey(fromName='Model-1', toName=model_name)
    mod = mdb.models[model_name]

    # --------------------------------------------------------------------------
    # Material Definitions
    # --------------------------------------------------------------------------

    # 1. PA6 Material (Eulerian Workpiece)
    mat_pa6 = mod.Material(name='PA6_VUMAT')
    mat_pa6.Density(table=((1.26766e-9, ), ))
    mat_pa6.Depvar(n=10)
    mat_pa6.UserMaterial(
        mechanicalConstants=(
            2000.0, # E
            0.4,    # nu
            8e-5,   # alpha
            298.15, # T_ref
            40.0,   # sy0
            100.0,  # H_iso
            500.0,  # C_kin
            2.0,    # gamma_kin
            0.5     # softening
        )
    )
    mat_pa6.Conductivity(table=((0.27, ), ))
    mat_pa6.SpecificHeat(table=((2.0e9, ), ))
    mat_pa6.InelasticHeatFraction(fraction=0.75)

    # Eulerian EOS requires Us-Up EOS to pair with VUMAT in CEL
    mat_pa6.Eos(type=USUP, table=((2000.0, 1.5, 1.0), ))

    # 2. Tool Material (Thermally conductive, rigid mechanics)
    # Fixing unit inconsistency: E (MPa), Density (tonne/mm^3)
    mat_tool = mod.Material(name='Diamond_Tool')
    mat_tool.Density(table=((3.5e-9, ), ))
    mat_tool.Elastic(table=((1.05e6, 0.1), ))
    mat_tool.Conductivity(table=((2200.0, ), ))
    mat_tool.SpecificHeat(table=((5.0e8, ), ))

    # --------------------------------------------------------------------------
    # Part Definitions
    # --------------------------------------------------------------------------

    # 1. Eulerian Domain
    domain_part = mod.Part(name='Eulerian_Domain', dimensionality=THREE_D, type=EULERIAN)
    domain_sketch = mod.ConstrainedSketch(name='__profile__', sheetSize=10.0)
    # Dimensions covering workpiece + space for chip and burr
    # Width (X): 1.0 mm, Height (Y): 0.5 mm, Length (Z): 2.0 mm
    domain_sketch.rectangle(point1=(0.0, 0.0), point2=(1.0, 0.5))
    domain_part.BaseSolidExtrude(sketch=domain_sketch, depth=2.0)

    # 2. Cutting Tool (Deformable for heat transfer, constrained to rigid body motion)
    tool_part = mod.Part(name='Cutting_Tool', dimensionality=THREE_D, type=DEFORMABLE_BODY)
    tool_sketch = mod.ConstrainedSketch(name='__profile__', sheetSize=10.0)
    # Wedge tool: 50 deg total angle, 25 deg half angle.
    tool_sketch.Line(point1=(0.0, 0.0), point2=(-0.25, 0.5))
    tool_sketch.Line(point2=(-0.25, 0.5), point1=(0.25, 0.5))
    tool_sketch.Line(point2=(0.25, 0.5), point1=(0.0, 0.0))
    tool_part.BaseSolidExtrude(sketch=tool_sketch, depth=0.1) # Tool width

    # --------------------------------------------------------------------------
    # Sections and Assignments
    # --------------------------------------------------------------------------

    mod.EulerianSection(name='Eulerian_Section', data={'PA6_VUMAT': 'PA6_VUMAT'})
    domain_part.SectionAssignment(
        region=regionToolset.Region(cells=domain_part.cells),
        sectionName='Eulerian_Section'
    )

    mod.HomogeneousSolidSection(name='Tool_Section', material='Diamond_Tool', thickness=None)
    tool_part.SectionAssignment(
        region=regionToolset.Region(cells=tool_part.cells),
        sectionName='Tool_Section'
    )

    # --------------------------------------------------------------------------
    # Assembly
    # --------------------------------------------------------------------------

    assm = mod.rootAssembly
    assm.DatumCsysByDefault(CARTESIAN)

    domain_inst = assm.Instance(name='Domain', part=domain_part, dependent=ON)

    # Position tool above the workpiece (ap = 0.05 mm cut depth)
    tool_inst = assm.Instance(name='Tool', part=tool_part, dependent=ON)
    assm.translate(instanceList=('Tool', ), vector=(0.5, 0.2, -0.2))

    # --------------------------------------------------------------------------
    # Eulerian Material Assignment (Initial Workpiece Geometry)
    # --------------------------------------------------------------------------

    # Create an analytical part to define the initial PA6 shape
    wp_part = mod.Part(name='Workpiece_Init', dimensionality=THREE_D, type=DEFORMABLE_BODY)
    wp_sketch = mod.ConstrainedSketch(name='__profile__', sheetSize=10.0)
    wp_sketch.rectangle(point1=(0.0, 0.0), point2=(1.0, 0.25)) # Workpiece height 0.25 mm
    wp_part.BaseSolidExtrude(sketch=wp_sketch, depth=2.0)

    wp_inst = assm.Instance(name='WP_Ref', part=wp_part, dependent=ON)

    # Material assignment tool (Volume Fraction Tool)
    mod.DiscreteField(name='EVF_Initial',
        defaultValues=(0.0, ),
        data=(('Domain', 'PA6_VUMAT', (('WP_Ref', 1.0), )), ),
        description='Initial Workpiece EVF')

    mod.MaterialAssignment(name='Initial_PA6',
        region=regionToolset.Region(cells=domain_inst.cells),
        materialName='PA6_VUMAT',
        discreteField='EVF_Initial')

    # Hide the reference part
    assm.features['WP_Ref'].suppress()

    # --------------------------------------------------------------------------
    # Steps
    # --------------------------------------------------------------------------

    # Step 1: Cutting (Tool moves through material)
    mod.ExplicitDynamicsStep(name='Cut', previous='Initial', timePeriod=0.0015,
        nlgeom=ON, improvedDtMethod=ON)

    # Step 2: Relaxation (Tool removed, cooling and spring-back)
    mod.ExplicitDynamicsStep(name='Relax', previous='Cut', timePeriod=0.005,
        nlgeom=ON, improvedDtMethod=ON)

    # Mass scaling
    mod.steps['Cut'].MassScaling(
        objective=SEMI_AUTOMATIC,
        dt=1e-8,
        type=BELOW_MIN,
        every=1
    )
    mod.steps['Relax'].MassScaling(
        objective=SEMI_AUTOMATIC,
        dt=5e-8, # Allow slightly larger mass scaling during relaxation
        type=BELOW_MIN,
        every=1
    )

    # --------------------------------------------------------------------------
    # Interaction & Contact
    # --------------------------------------------------------------------------

    mod.ContactProperty('Friction_Thermo')
    mod.interactionProperties['Friction_Thermo'].TangentialBehavior(
        formulation=PENALTY, directionality=ISOTROPIC, slipRateDependency=OFF,
        pressureDependency=OFF, temperatureDependency=ON, dependencies=0,
        table=((0.3, 0.0, 298.0), (0.45, 0.0, 373.0), (0.15, 0.0, 453.0))
    )
    mod.interactionProperties['Friction_Thermo'].NormalBehavior(
        allowSeparation=ON, constraintEnforcementMethod=DEFAULT,
        pressureOverclosure=HARD)
    mod.interactionProperties['Friction_Thermo'].ThermalConductance(
        clearanceDependency=OFF, pressureDependency=OFF,
        temperatureDependency=OFF, massFlowRateDependency=OFF,
        dependencies=0,
        definition=TABULAR,
        table=((1000.0, 0.0), (0.0, 0.001)))
    mod.interactionProperties['Friction_Thermo'].HeatGeneration(
        conversionFraction=1.0, slaveFraction=0.5)

    mod.ContactExp(name='General_Contact', createStepName='Initial')
    mod.interactions['General_Contact'].includedPairs.setValuesInStep(
        stepName='Initial', useAllstar=ON)
    mod.interactions['General_Contact'].contactPropertyAssignments.appendInStep(
        stepName='Initial', assignments=((GLOBAL, SELF, 'Friction_Thermo'), ))

    # --------------------------------------------------------------------------
    # Loads and BCs
    # --------------------------------------------------------------------------

    # Initial Temperature
    mod.Temperature(name='Initial_Temp', createStepName='Initial',
        region=regionToolset.Region(cells=domain_inst.cells + tool_inst.cells),
        distributionType=UNIFORM, crossSectionDistribution=CONSTANT_THROUGH_THICKNESS,
        magnitudes=(298.15, ))

    # Tool RP and Rigid Body Constraint
    rp_pt = assm.ReferencePoint(point=(0.5, 0.5, -0.2))
    rp_key = assm.referencePoints.keys()[-1]
    rp_region = regionToolset.Region(referencePoints=(assm.referencePoints[rp_key], ))

    mod.RigidBody(name='Tool_Rigid', refPointRegion=rp_region,
        bodyRegion=regionToolset.Region(cells=tool_inst.cells))

    # Tool cutting motion (Z direction)
    mod.TabularAmplitude(name='Amp_Cut', timeSpan=STEP, data=((0.0, 0.0), (0.0015, 1.0)))
    mod.VelocityBC(name='Tool_Motion', createStepName='Cut',
        region=rp_region, v3=1666.0, amplitude='Amp_Cut') # 1666 mm/s = 100 m/min

    # Tool removed in Relax step
    mod.boundaryConditions['Tool_Motion'].setValuesInStep(
        stepName='Relax', v2=500.0, v3=0.0) # Move tool up away from surface

    # Fix Eulerian Domain boundaries (Bottom and sides)
    bottom_faces = domain_inst.faces.findAt(((0.5, 0.0, 1.0),))
    mod.VelocityBC(name='Fix_Bottom', createStepName='Initial',
        region=regionToolset.Region(faces=bottom_faces), v1=0.0, v2=0.0, v3=0.0)

    # --------------------------------------------------------------------------
    # Output Requests
    # --------------------------------------------------------------------------
    mod.fieldOutputRequests['F-Output-1'].setValues(
        variables=('S', 'PE', 'PEEQ', 'TEMP', 'NT', 'SDV', 'STATUS', 'EVF', 'HFL', 'U', 'V'),
        numIntervals=40)
    mod.HistoryOutputRequest(name='H-Output-Energy', createStepName='Initial',
        variables=('ALLAE', 'ALLIE', 'ALLKE', 'ETOTAL'), numIntervals=100)

    # --------------------------------------------------------------------------
    # Job
    # --------------------------------------------------------------------------
    mdb.Job(name='Job-CEL-Cutting', model='CEL_Cutting_3D',
        userSubroutine='../vumat/vumat_pa6_recovery.f',
        type=ANALYSIS, explicitPrecision=SINGLE, nodalOutputPrecision=SINGLE,
        numCpus=4, numDomains=4)

if __name__ == '__main__':
    build_cutting_model()
    print("CEL Model Generation Script Complete.")
