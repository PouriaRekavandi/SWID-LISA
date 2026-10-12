with open('bcc_lattice_analytical.py', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "E_eff_Eq31" in line or "E_eff_Eq32" in line:
        pass
    elif "print(f\"  Macro Effective Modulus (E_eff_Eq" in line:
        pass
    else:
        new_lines.append(line)

final_lines = []
for i in range(len(new_lines)):
    if "self.E_eff_eq31 = self.E_FB" in new_lines[i]:
        final_lines.append("            self.E_eff = self.E_FB\n")
    elif "self.E_eff_eq31 = -2.0 * self.E_CB" in new_lines[i]:
        final_lines.append("            self.E_eff = -2.0 * self.E_CB * (1.0 + math.log(self.Phi) / (1.0 - self.Phi)) / (1.0 - self.Phi)\n")
    elif "# Macro Effective Modulus (Eq. 32)" in new_lines[i]:
        break
    else:
        final_lines.append(new_lines[i])

tail = []
in_plastic = False
for line in new_lines:
    if "def _compute_plastic_collapse" in line:
        in_plastic = True
    if in_plastic:
        tail.append(line)

final_lines.extend(tail)

with open('bcc_lattice_analytical.py', 'w') as f:
    f.writelines(final_lines)
