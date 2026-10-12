with open('bcc_lattice_analytical.py', 'r') as f:
    text = f.read()

import re
# Replace f-strings with .format()
# Doing this safely for the specific lines in report:
def replace_fstring(match):
    content = match.group(1)
    # this regex is too complex to do safely in a simple script.
    pass

text = text.replace('print(f"Inputs:")', 'print("Inputs:")')
text = text.replace('print(f"  a = {self.a} mm, b = {self.b} mm, h = {self.h} mm, d = {self.d} mm")', 'print("  a = {} mm, b = {} mm, h = {} mm, d = {} mm".format(self.a, self.b, self.h, self.d))')
text = text.replace('print(f"  E = {self.E} MPa, nu = {self.nu}")', 'print("  E = {} MPa, nu = {}".format(self.E, self.nu))')
text = text.replace('print(f"  sigma_0 = {self.sigma_0} MPa, gamma = {self.gamma}")', 'print("  sigma_0 = {} MPa, gamma = {}".format(self.sigma_0, self.gamma))')

text = text.replace('print(f"1. Geometry:")', 'print("1. Geometry:")')
text = text.replace('print(f"  Half-diagonal (L/2) = {self.L_half:.3f} mm")', 'print("  Half-diagonal (L/2) = {:.3f} mm".format(self.L_half))')
text = text.replace('print(f"  Effective length (l_eff) = {self.l_eff:.3f} mm")', 'print("  Effective length (l_eff) = {:.3f} mm".format(self.l_eff))')
text = text.replace('print(f"  Inclination angle (theta) = {self.theta_deg:.2f} deg")', 'print("  Inclination angle (theta) = {:.2f} deg".format(self.theta_deg))')
text = text.replace('print(f"  Relative density (R) = {self.R:.4f}")', 'print("  Relative density (R) = {:.4f}".format(self.R))')

text = text.replace('print(f"2. Section Properties:")', 'print("2. Section Properties:")')
text = text.replace('print(f"  Area (A) = {self.A:.4f} mm^2")', 'print("  Area (A) = {:.4f} mm^2".format(self.A))')
text = text.replace('print(f"  Moment of Inertia (I) = {self.I:.5f} mm^4")', 'print("  Moment of Inertia (I) = {:.5f} mm^4".format(self.I))')
text = text.replace('print(f"  Shear Modulus (G) = {self.G:.2f} MPa")', 'print("  Shear Modulus (G) = {:.2f} MPa".format(self.G))')
text = text.replace('print(f"  Timoshenko factor (k) = {self.k:.4f}")', 'print("  Timoshenko factor (k) = {:.4f}".format(self.k))')

text = text.replace('print(f"3. Elastic Moduli:")', 'print("3. Elastic Moduli:")')
text = text.replace('print(f"  Free-Boundary Modulus (E_FB) = {self.E_FB:.2f} MPa")', 'print("  Free-Boundary Modulus (E_FB) = {:.2f} MPa".format(self.E_FB))')
text = text.replace('print(f"  Constrained-Boundary Modulus (E_CB) = {self.E_CB:.2f} MPa")', 'print("  Constrained-Boundary Modulus (E_CB) = {:.2f} MPa".format(self.E_CB))')
text = text.replace('print(f"  Modulus Ratio (Phi = E_CB/E_FB) = {self.Phi:.4f}")', 'print("  Modulus Ratio (Phi = E_CB/E_FB) = {:.4f}".format(self.Phi))')
text = text.replace('print(f"  Macro Effective Modulus (E_eff) = {self.E_eff:.2f} MPa")', 'print("  Macro Effective Modulus (E_eff) = {:.2f} MPa".format(self.E_eff))')

text = text.replace('print(f"  Note: Direct evaluation of the paper\'s formulas gives ~1.73 MPa.")', 'print("  Note: Direct evaluation of the paper\'s formulas gives ~1.73 MPa.")')
text = text.replace('print(f"  To match the paper\'s 6.99 MPa exactly, a scaling factor (e.g. 4x for cell struts) may be implied.")', 'print("  To match the paper\'s 6.99 MPa exactly, a scaling factor (e.g. 4x for cell struts) may be implied.")')

text = text.replace('print(f"4. Plastic Collapse:")', 'print("4. Plastic Collapse:")')
text = text.replace('print(f"  Collapse Strength (sigma*) = {self.sigma_star:.4f} MPa")', 'print("  Collapse Strength (sigma*) = {:.4f} MPa".format(self.sigma_star))')

with open('bcc_lattice_analytical.py', 'w') as f:
    f.write(text)
