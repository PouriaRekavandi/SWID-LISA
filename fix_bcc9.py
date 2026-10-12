with open('bcc_lattice_analytical.py', 'r') as f:
    text = f.read()

# I deleted E_eff_eq32 earlier in the script logic, so let's just remove that line.
lines = text.split('\n')
new_lines = []
for line in lines:
    if "Macro Effective Modulus (E_eff_Eq32 expanded)" in line:
        continue
    new_lines.append(line)

with open('bcc_lattice_analytical.py', 'w') as f:
    f.write('\n'.join(new_lines))
