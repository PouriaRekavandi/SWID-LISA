with open('bcc_lattice_analytical.py', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "self.E_eff = -2.0 * self.E_CB * (1.0 + math.log(self.Phi) / (1.0 - self.Phi)) / (1.0 - self.Phi)" in line:
        new_lines.append("            self.E_eff = -2.0 * self.E_CB * (1.0 + math.log(self.Phi) / (1.0 - self.Phi)) / (1.0 - self.Phi)\n")
    else:
        new_lines.append(line)

with open('bcc_lattice_analytical.py', 'w') as f:
    f.writelines(new_lines)
