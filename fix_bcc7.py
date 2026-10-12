with open('bcc_lattice_analytical.py', 'r') as f:
    text = f.read()

# Add a note explaining the potential paper discrepancy.
target = "print(f\"  Macro Effective Modulus (E_eff) = {self.E_eff:.2f} MPa\")\n"
replace_with = "print(f\"  Macro Effective Modulus (E_eff) = {self.E_eff:.2f} MPa\")\n        print(f\"  Note: Direct evaluation of the paper's formulas gives ~1.73 MPa.\")\n        print(f\"  To match the paper's 6.99 MPa exactly, a scaling factor (e.g. 4x for cell struts) may be implied.\")\n"
text = text.replace(target, replace_with)

with open('bcc_lattice_analytical.py', 'w') as f:
    f.write(text)
