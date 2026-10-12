with open('bcc_lattice_analytical.py', 'r') as f:
    text = f.read()

# Add E_eff printing back in the report function
target = "print(f\"  Modulus Ratio (Phi = E_CB/E_FB) = {self.Phi:.4f}\")\n"
replace_with = "print(f\"  Modulus Ratio (Phi = E_CB/E_FB) = {self.Phi:.4f}\")\n        print(f\"  Macro Effective Modulus (E_eff) = {self.E_eff:.2f} MPa\")\n"
text = text.replace(target, replace_with)

# Wait, why didn't E_eff print? Oh I missed replacing it in the report function.

with open('bcc_lattice_analytical.py', 'w') as f:
    f.write(text)
