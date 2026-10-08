# -*- coding: utf-8 -*-
from abaqus import *
from abaqusConstants import *
from caeModules import *
import os

def build_cutting_model():
    Mdb()
    model_name = 'CEL_Cutting_3D'
    mdb.models.changeKey(fromName='Model-1', toName=model_name)
    mod = mdb.models[model_name]

    # 1. PA6 Material (Eulerian Workpiece)
    mat_pa6 = mod.Material(name='PA6_VUMAT')
    mat_pa6.Density(table=((1.26766e-9, ), ))
    mat_pa6.Depvar(n=10)
    mat_pa6.UserMaterial(
        mechanicalConstants=(
            2000.0, 0.4, 8e-5, 298.15, 40.0, 100.0, 500.0, 2.0, 0.5
        )
    )
    mat_pa6.Conductivity(table=((0.27, ), ))
    mat_pa6.SpecificHeat(table=((2.0e9, ), ))
    mat_pa6.InelasticHeatFraction(fraction=0.75)
    mat_pa6.Eos(type=USUP, table=((2000.0, 1.5, 1.0), ))

    # 2. Tool Material
    mat_tool = mod.Material(name='Diamond_Tool')
    mat_tool.Density(table=((3.5e-9, ), ))
    mat_tool.Elastic(table=((1.05e6, 0.1), ))
    mat_tool.Conductivity(table=((2200.0, ), ))
    mat_tool.SpecificHeat(table=((5.0e8, ), ))

    # Eulerian Domain
    domain_part = mod.Part(name='Eulerian_Domain', dimensionality=THREE_D, type=EULERIAN)
    domain_sketch = mod.ConstrainedSketch(name='__profile__', sheetSize=10.0)
    domain_sketch.rectangle(point1=(0.0, 0.0), point2=(1.0, 0.5))
    domain_part.BaseSolidExtrude(sketch=domain_sketch, depth=2.0)

    # Cutting Tool
    tool_part = mod.Part(name='Cutting_Tool', dimensionality=THREE_D, type=DEFORMABLE_BODY)
    tool_sketch = mod.ConstrainedSketch(name='__profile__', sheetSize=10.0)
    tool_sketch.Line(point1=(0.0, 0.0), point2=(-0.25, 0.5))
    tool_sketch.Line(point2=(-0.25, 0.5), point1=(0.25, 0.5))
    tool_sketch.Line(point2=(0.25, 0.5), point1=(0.0, 0.0))
    tool_part.BaseSolidExtrude(sketch=tool_sketch, depth=0.1)

    # Sections
    mod.EulerianSection(name='Eulerian_Section', data={'PA6_VUMAT': 'PA6_VUMAT'})
    domain_part.SectionAssignment(region=regionToolset.Region(cells=domain_part.cells), sectionName='Eulerian_Section')

    mod.HomogeneousSolidSection(name='Tool_Section', material='Diamond_Tool', thickness=None)
    tool_part.SectionAssignment(region=regionToolset.Region(cells=tool_part.cells), sectionName='Tool_Section')

    # Assembly
    assm = mod.rootAssembly
    assm.DatumCsysByDefault(CARTESIAN)
    domain_inst = assm.Instance(name='Domain', part=domain_part, dependent=ON)
    tool_inst = assm.Instance(name='Tool', part=tool_part, dependent=ON)
    assm.translate(instanceList=('Tool', ), vector=(0.5, 0.2, -0.2))

    # Eulerian Material Assignment
    wp_part = mod.Part(name='Workpiece_Init', dimensionality=THREE_D, type=DEFORMABLE_BODY)
    wp_sketch = mod.ConstrainedSketch(name='__profile__', sheetSize=10.0)
    wp_sketch.rectangle(point1=(0.0, 0.0), point2=(1.0, 0.25))
    wp_part.BaseSolidExtrude(sketch=wp_sketch, depth=2.0)
    wp_inst = assm.Instance(name='WP_Ref', part=wp_part, dependent=ON)

    mod.DiscreteField(name='EVF_Initial', defaultValues=(0.0, ), data=(('Domain', 'PA6_VUMAT', (('WP_Ref', 1.0), )), ), description='Initial Workpiece EVF')
    mod.MaterialAssignment(name='Initial_PA6', region=regionToolset.Region(cells=domain_inst.cells), materialName='PA6_VUMAT', discreteField='EVF_Initial')
    assm.features['WP_Ref'].suppress()

    # Steps
    mod.ExplicitDynamicsStep(name='Cut', previous='Initial', timePeriod=0.0015, nlgeom=ON, improvedDtMethod=ON)
    mod.ExplicitDynamicsStep(name='Relax', previous='Cut', timePeriod=0.005, nlgeom=ON, improvedDtMethod=ON)
    mod.steps['Cut'].MassScaling(objective=SEMI_AUTOMATIC, dt=1e-8, type=BELOW_MIN, every=1)
    mod.steps['Relax'].MassScaling(objective=SEMI_AUTOMATIC, dt=5e-8, type=BELOW_MIN, every=1)

    # Contact
    mod.ContactProperty('Friction_Thermo')
    mod.interactionProperties['Friction_Thermo'].TangentialBehavior(formulation=PENALTY, directionality=ISOTROPIC, slipRateDependency=OFF, pressureDependency=OFF, temperatureDependency=ON, dependencies=0, table=((0.3, 0.0, 298.0), (0.45, 0.0, 373.0), (0.15, 0.0, 453.0)))
    mod.interactionProperties['Friction_Thermo'].NormalBehavior(allowSeparation=ON, constraintEnforcementMethod=DEFAULT, pressureOverclosure=HARD)
    mod.interactionProperties['Friction_Thermo'].ThermalConductance(clearanceDependency=OFF, pressureDependency=OFF, temperatureDependency=OFF, massFlowRateDependency=OFF, dependencies=0, definition=TABULAR, table=((1000.0, 0.0), (0.0, 0.001)))
    mod.interactionProperties['Friction_Thermo'].HeatGeneration(conversionFraction=1.0, slaveFraction=0.5)
    mod.ContactExp(name='General_Contact', createStepName='Initial')
    mod.interactions['General_Contact'].includedPairs.setValuesInStep(stepName='Initial', useAllstar=ON)
    mod.interactions['General_Contact'].contactPropertyAssignments.appendInStep(stepName='Initial', assignments=((GLOBAL, SELF, 'Friction_Thermo'), ))

    # Loads/BCs
    mod.Temperature(name='Initial_Temp', createStepName='Initial', region=regionToolset.Region(cells=domain_inst.cells + tool_inst.cells), distributionType=UNIFORM, crossSectionDistribution=CONSTANT_THROUGH_THICKNESS, magnitudes=(298.15, ))

    rp_pt = assm.ReferencePoint(point=(0.5, 0.5, -0.2))
    rp_key = assm.referencePoints.keys()[-1]
    rp_region = regionToolset.Region(referencePoints=(assm.referencePoints[rp_key], ))
    mod.RigidBody(name='Tool_Rigid', refPointRegion=rp_region, bodyRegion=regionToolset.Region(cells=tool_inst.cells))

    mod.TabularAmplitude(name='Amp_Cut', timeSpan=STEP, data=((0.0, 0.0), (0.0015, 1.0)))
    mod.VelocityBC(name='Tool_Motion', createStepName='Cut', region=rp_region, v3=1666.0, amplitude='Amp_Cut')
    mod.boundaryConditions['Tool_Motion'].setValuesInStep(stepName='Relax', v2=500.0, v3=0.0)

    bottom_faces = domain_inst.faces.findAt(((0.5, 0.0, 1.0),))
    mod.VelocityBC(name='Fix_Bottom', createStepName='Initial', region=regionToolset.Region(faces=bottom_faces), v1=0.0, v2=0.0, v3=0.0)

    # Output
    mod.fieldOutputRequests['F-Output-1'].setValues(variables=('S', 'PE', 'PEEQ', 'TEMP', 'NT', 'SDV', 'STATUS', 'EVF', 'HFL', 'U', 'V'), numIntervals=40)
    mod.HistoryOutputRequest(name='H-Output-Energy', createStepName='Initial', variables=('ALLAE', 'ALLIE', 'ALLKE', 'ETOTAL'), numIntervals=100)

    # Job
    mdb.Job(name='Job-CEL-Cutting', model='CEL_Cutting_3D', type=ANALYSIS, explicitPrecision=SINGLE, nodalOutputPrecision=SINGLE, numCpus=4, numDomains=4)

    # Save the CAE file to the current working directory
    cae_path = os.path.join(os.getcwd(), 'CEL_Cutting_3D.cae')
    mdb.saveAs(pathName=cae_path)
    print("Model generated and saved successfully to: " + cae_path)

if __name__ == '__main__':
    build_cutting_model()
