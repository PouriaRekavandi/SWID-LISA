with open('bcc_lattice_analytical.py', 'r') as f:
    text = f.read()

text = text.replace('Macro Effective Modulus (E_eff_Eq31)', 'Macro Effective Modulus (E_eff)')
text = text.replace('Macro Effective Modulus (E_eff_Eq32)', 'Macro Effective Modulus (E_eff_Eq32)')
with open('bcc_lattice_analytical.py', 'w') as f:
    f.write(text)
