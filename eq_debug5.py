import math

a = 5.0
b = 5.0
h = 5.0
d = 1.0
E = 152.3
nu = 0.33

L_half = math.sqrt(h**2 + a**2 + b**2) / 2.0
l_eff = L_half - d
theta = math.atan(h / math.sqrt(a**2 + b**2))

A = math.pi * d**2 / 4.0
I = math.pi * d**4 / 64.0
G = E / (2.0 * (1.0 + nu))
k = 6.0 * (1.0 + nu) / (7.0 + 6.0 * nu)

# Is the cross section area definition in the paper potentially different?
# or maybe "L/2" for a 10x10x10 block is different?
# "Analytical E_eff (Eq. 32): 6.99 MPa"

# Let's write the module using the correct physical formula from Yang et al.
# If there's a typo in the paper's expanded Eq 32 vs Yang's base Eq 31, we will provide Eq 31, but also calculate Eq 32.
# Wait, I am currently outputting E_eff = 1.73 MPa.

# Let's double check E_FB:
# E_FB = 2*h / { ab [ (l_eff/AE) sin²θ + (l_eff³/12EI + l_eff/kAG) cos²θ ] }
sin_th = math.sin(theta)
cos_th = math.cos(theta)
print(f"sin2={sin_th**2}, cos2={cos_th**2}")
print(f"l_eff/AE = {l_eff/(A*E)}")
print(f"l_eff^3/12EI = {l_eff**3/(12*E*I)}")
print(f"l_eff/kAG = {l_eff/(k*A*G)}")
print(f"term 1 = {(l_eff/(A*E))*sin_th**2}")
print(f"term 2 = {(l_eff**3/(12*E*I) + l_eff/(k*A*G))*cos_th**2}")
E_FB = 2*h / (a*b * ( (l_eff/(A*E))*sin_th**2 + (l_eff**3/(12*E*I) + l_eff/(k*A*G))*cos_th**2 ))
print(f"E_FB = {E_FB}")
