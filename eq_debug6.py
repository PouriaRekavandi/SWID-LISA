import math

# Let's try matching the 6.99 value with a slightly different interpretation of Eq 17 or E_eff
a = 5.0
b = 5.0
h = 5.0
d = 1.0
E = 152.3
nu = 0.33

L = math.sqrt(h**2 + a**2 + b**2)
L_half = L / 2.0
l_eff = L_half - d
theta = math.atan(h / math.sqrt(a**2 + b**2))

A = math.pi * d**2 / 4.0
I = math.pi * d**4 / 64.0
G = E / (2.0 * (1.0 + nu))
k = 6.0 * (1.0 + nu) / (7.0 + 6.0 * nu)

# Maybe Yang's formula is applied to E_FB of the BLOCK instead of UNIT CELL?
# E_eff = 6.99 MPa
# Let's just output the variables correctly and give the option to print Eq 32 as requested by user.

# The prompt says: "Analytical E_eff (Eq. 32): 6.99 MPa"
