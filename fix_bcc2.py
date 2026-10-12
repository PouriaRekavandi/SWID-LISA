with open('bcc_lattice_analytical.py', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "d_L = self.d / self.a" in line:
        new_lines.append("        # Here L refers to the full diagonal of the cubic cell based on our earlier calculation\n")
        new_lines.append("        d_L = self.d / (self.L_half * 2.0)\n")
    else:
        new_lines.append(line)

with open('bcc_lattice_analytical.py', 'w') as f:
    f.writelines(new_lines)
