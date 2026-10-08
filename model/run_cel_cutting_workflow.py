# -*- coding: utf-8 -*-
from abaqus import *
from abaqusConstants import *
from caeModules import *
from odbAccess import *
import os
import shutil
import time

def build_cutting_model():
    print("Building CEL Cutting Model...")
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




    # Eulerian Material Assignment via Element Set
    domain_elements = domain_inst.elements.getByBoundingBox(xMin=-0.1, yMin=-0.1, zMin=-0.1, xMax=1.1, yMax=0.251, zMax=2.1)
    assm.Set(name='Workpiece_Elements', elements=domain_elements)

    import mesh
    # Mesh Eulerian domain
    domain_part.seedPart(size=0.05, deviationFactor=0.1, minSizeFactor=0.1)
    elemType_euler = mesh.ElemType(elemCode=EC3D8RT, elemLibrary=EXPLICIT)
    domain_part.setElementType(regions=(domain_part.cells,), elemTypes=(elemType_euler,))
    domain_part.generateMesh()

    # Mesh Tool
    tool_part.seedPart(size=0.05, deviationFactor=0.1, minSizeFactor=0.1)
    elemType_tool = mesh.ElemType(elemCode=C3D8RT, elemLibrary=EXPLICIT)
    tool_part.setElementType(regions=(tool_part.cells,), elemTypes=(elemType_tool,))
    tool_part.generateMesh()

    assm.regenerate()



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

    # Save CAE
    cae_path = os.path.join(os.getcwd(), 'CEL_Cutting_3D.cae')
    mdb.saveAs(pathName=cae_path)
    print("Model saved to: " + cae_path)

    return model_name


def write_and_submit_job(model_name):
    print("Writing input file and submitting job...")
    job_name = 'Job-CEL-Cutting'
    vumat_path = os.path.join(os.getcwd(), 'vumat_pa6_recovery.f')

    if not os.path.exists(vumat_path):
        print("WARNING: vumat_pa6_recovery.f not found in the current directory.")
        print("Creating a dummy VUMAT for demonstration purposes...")
        with open(vumat_path, 'w') as f:
            f.write("      SUBROUTINE VUMAT(JSTEP,ANY)\n      END\n")

    # Job definition
    mdb.Job(name=job_name, model=model_name, type=ANALYSIS, explicitPrecision=SINGLE, nodalOutputPrecision=SINGLE, numCpus=4, numDomains=4, userSubroutine=vumat_path)

    # Write INP
    mdb.jobs[job_name].writeInput(consistencyChecking=OFF)
    print("Input file written: " + job_name + ".inp")

    # Modify INP to add Eulerian Initial Conditions
    inp_path = job_name + '.inp'
    if os.path.exists(inp_path):
        with open(inp_path, 'r') as f:
            lines = f.readlines()

        with open(inp_path, 'w') as f:
            for line in lines:
                if line.upper().startswith('*STEP'):
                    # Insert Volume Fraction Initial Conditions before the first step
                    f.write('*INITIAL CONDITIONS, TYPE=VOLUME FRACTION\n')
                    f.write('Workpiece_Elements, PA6_VUMAT, 1.0\n')
                f.write(line)
        print("Modified INP file to include Eulerian Volume Fraction initialization.")

    print("===================================================")
    print("To run the job via command line:")
    print("abaqus job=" + job_name + " user=vumat_pa6_recovery.f cpus=4 int")
    print("===================================================")

    # Attempt to submit internally
    print("Attempting to submit job via internal system call...")
    try:
        import subprocess
        # using cmd.exe so we can call abaqus if it's in a standard env
        cmd = 'abaqus job=' + job_name + ' user=vumat_pa6_recovery.f cpus=4 int'
        print("Executing: " + cmd)
        subprocess.Popen(cmd, shell=True)
        print("Job submitted to the background. Check " + job_name + ".sta or " + job_name + ".msg for progress.")
    except Exception as e:
        print("Failed to auto-submit: " + str(e))
def extract_results(job_name):
    print("Extracting Post-Processing Results...")
    odb_path = job_name + '.odb'
    if not os.path.exists(odb_path):
        print("ODB file not found. Simulation might not have run or finished yet.")
        return

    odb = openOdb(path=odb_path)
    last_step = odb.steps.keys()[-1]
    last_frame = odb.steps[last_step].frames[-1]

    # Calculate geometric metrics (dummy extraction for completeness)
    evf = last_frame.fieldOutputs['EVF_PA6_VUMAT']

    burr_height = 0.0
    for value in evf.values:
        if value.data > 0.5:
            # Example logic to find max height, simplified
            node_label = value.nodeLabel
            # ... lookup node coordinates ...
            pass

    print("Post-processing complete. Closing ODB.")
    odb.close()

if __name__ == '__main__':
    model_name = build_cutting_model()
    write_and_submit_job(model_name)
    print("Workflow Script Finished.")
    # extract_results('Job-CEL-Cutting') # Uncomment to extract after run
