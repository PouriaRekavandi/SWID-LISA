with open('PA6_CEL_SmokeTest.py', 'r') as f:
    text = f.read()

# Fix mesh to 0.025 so CEL doesn't invert elements on a 1-element AP
text = text.replace('MESH_E = 0.050', 'MESH_E = 0.025')

# Ensure the amplitude ramp in tool-exit doesn't shock the system
target = """    m.VelocityBC(
        name='V-Exit', createStepName='Tool-Exit', region=RP_asm,
        v1=0., v2=LIFT_V, v3=0., vr1=0., vr2=0., vr3=0.)"""

replace_with = """    m.TabularAmplitude(
        name='Ramp-Exit', timeSpan=STEP, smooth=SOLVER_DEFAULT,
        data=((0., 0.), (T_EXIT*0.2, 1.), (T_EXIT, 1.)))
    m.VelocityBC(
        name='V-Exit', createStepName='Tool-Exit', region=RP_asm,
        v1=0., v2=LIFT_V, v3=0., vr1=0., vr2=0., vr3=0., amplitude='Ramp-Exit')"""

text = text.replace(target, replace_with)

with open('PA6_CEL_SmokeTest.py', 'w') as f:
    f.write(text)
