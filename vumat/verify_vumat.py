# -*- coding: utf-8 -*-
# Single-Element Verification script for VUMAT
# This script constructs a single 3D element and runs a load-unload-relax cycle
# Requires Abaqus/CAE 2017 Python 2.7 environment

from abaqus import *
from abaqusConstants import *
from caeModules import *

def create_verification_model():
    Mdb()
    mdb.models.changeKey(fromName='Model-1', toName='Verify_VUMAT')
    mod = mdb.models['Verify_VUMAT']

    # Create Part
    part = mod.Part(name='Cube', dimensionality=THREE_D, type=DEFORMABLE_BODY)
    part.BaseSolidExtrude(sketch=mod.ConstrainedSketch(name='__profile__', sheetSize=10.0), depth=1.0)

    sketch = mod.sketches['__profile__']
    sketch.rectangle(point1=(0.0, 0.0), point2=(1.0, 1.0))
    del mod.sketches['__profile__']

    part = mod.parts['Cube']
    part.BaseSolidExtrude(sketch=mod.ConstrainedSketch(name='__profile__', sheetSize=10.0), depth=1.0)

    # Material
    mat = mod.Material(name='PA6_VUMAT')
    mat.Density(table=((1.26766e-9, ), ))
    mat.Depvar(n=10)
    mat.UserMaterial(
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

    # Section
    mod.HomogeneousSolidSection(name='Section-1', material='PA6_VUMAT', thickness=None)
    region = regionToolset.Region(cells=part.cells)
    part.SectionAssignment(region=region, sectionName='Section-1', offset=0.0,
        offsetType=MIDDLE_SURFACE, offsetField='',
        thicknessAssignment=FROM_SECTION)

    # Assembly
    assm = mod.rootAssembly
    assm.Instance(name='Cube-1', part=part, dependent=ON)

    # Steps
    mod.ExplicitDynamicsStep(name='Load', previous='Initial', timePeriod=1.0)
    mod.ExplicitDynamicsStep(name='Unload', previous='Load', timePeriod=1.0)
    mod.ExplicitDynamicsStep(name='Relax', previous='Unload', timePeriod=1.0)

    # BCs (fixed at bottom, pulled at top)
    faces = assm.instances['Cube-1'].faces
    bottom_face = faces.findAt(((0.5, 0.5, 0.0),))
    top_face = faces.findAt(((0.5, 0.5, 1.0),))

    assm.Set(faces=bottom_face, name='Bottom')
    assm.Set(faces=top_face, name='Top')

    mod.DisplacementBC(name='FixBottom', createStepName='Initial',
        region=assm.sets['Bottom'], u1=SET, u2=SET, u3=SET, ur1=SET, ur2=SET, ur3=SET)

    # Amplitude for displacement
    mod.TabularAmplitude(name='Amp-Load', timeSpan=STEP, data=((0.0, 0.0), (1.0, 1.0)))
    mod.TabularAmplitude(name='Amp-Unload', timeSpan=STEP, data=((0.0, 1.0), (1.0, 0.0)))

    mod.DisplacementBC(name='PullTop', createStepName='Load',
        region=assm.sets['Top'], u3=0.1, amplitude='Amp-Load')
    mod.boundaryConditions['PullTop'].setValuesInStep(
        stepName='Unload', u3=0.0, amplitude='Amp-Unload')
    mod.boundaryConditions['PullTop'].deactivate('Relax')

    # Mesh
    part.seedPart(size=1.0, deviationFactor=0.1, minSizeFactor=0.1)
    elemType = mesh.ElemType(elemCode=C3D8R, elemLibrary=EXPLICIT,
        kinematicSplit=AVERAGE_STRAIN, hourglassControl=DEFAULT)
    part.setElementType(regions=(part.cells,), elemTypes=(elemType,))
    part.generateMesh()

    # Job
    mdb.Job(name='Verify_VUMAT_Job', model='Verify_VUMAT',
        userSubroutine='../vumat/vumat_pa6_recovery.f',
        type=ANALYSIS, explicitPrecision=SINGLE, nodalOutputPrecision=SINGLE)

if __name__ == '__main__':
    create_verification_model()
    print("Verification model generated.")
