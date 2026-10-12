with open('VUMAT_PA6_v13.for', 'r') as f:
    text = f.read()

old_block = """        a11n = a11r + dlambda*(C_kin*xn11 - gam_kin*a11r)
        a22n = a22r + dlambda*(C_kin*xn22 - gam_kin*a22r)
        a33n = a33r + dlambda*(C_kin*xn33 - gam_kin*a33r)
        a12n = a12r + dlambda*(C_kin*xn12 - gam_kin*a12r)
        a13n = a13r + dlambda*(C_kin*xn13 - gam_kin*a13r)
        a23n = a23r + dlambda*(C_kin*xn23 - gam_kin*a23r)"""

new_block = """        denom_AF = one + gam_kin*dlambda
        a11n = (a11r + dlambda*C_kin*xn11) / denom_AF
        a22n = (a22r + dlambda*C_kin*xn22) / denom_AF
        a33n = (a33r + dlambda*C_kin*xn33) / denom_AF
        a12n = (a12r + dlambda*C_kin*xn12) / denom_AF
        a13n = (a13r + dlambda*C_kin*xn13) / denom_AF
        a23n = (a23r + dlambda*C_kin*xn23) / denom_AF"""

text = text.replace(old_block, new_block)

with open('VUMAT_PA6_v13.for', 'w') as f:
    f.write(text)
