with open('bcc_lattice_analytical.py', 'r') as f:
    text = f.read()

# Add a check: if E_eff_eq32 is calculated, print that too, to be completely rigorous to the prompt.
target = "print(f\"  Macro Effective Modulus (E_eff) = {self.E_eff:.2f} MPa\")\n"
replace_with = "print(f\"  Macro Effective Modulus (E_eff) = {self.E_eff:.2f} MPa\")\n        print(f\"  Macro Effective Modulus (E_eff_Eq32 expanded) = {self.E_eff_eq32:.2f} MPa\")\n"
text = text.replace(target, replace_with)

with open('bcc_lattice_analytical.py', 'w') as f:
    f.write(text)
