import math

a = 5.0
b = 5.0
h = 5.0
d = 1.0
E = 152.3
nu = 0.33
sigma_0 = 100.0
gamma = 0.1667

L_half = math.sqrt(h**2 + a**2 + b**2) / 2.0
l_eff = L_half - d
theta = math.atan(h / math.sqrt(a**2 + b**2))

A = math.pi * d**2 / 4.0
I = math.pi * d**4 / 64.0
G = E / (2.0 * (1.0 + nu))
k = 6.0 * (1.0 + nu) / (7.0 + 6.0 * nu)

# What if Eq 17 formulation in prompt missed a factor of 4?
# "by symmetry, each unit cell contains four struts contributing to the vertical load... sigma_y = 4 F_y / (ab)"
# Yes!
# Let's check: E_y = 2 F_y h / (ab delta_y)  <-- Wait, if sigma_y = 4 F_y / ab and eps_y = delta_y / (h/2) = 2 delta_y / h
# E_y = sigma_y / eps_y = (4 F_y / ab) / (2 delta_y / h) = (4/2) * F_y h / (ab delta_y) = 2 F_y h / (ab delta_y)
# Oh, that's exactly Eq 10. So the factor of 4 is already absorbed.

# What if a = b = h = L = 50 for the BLOCK?
# The prompt explicitly gives a table:
# Cell side length a = b = h = 5 mm
# Analytical E_eff (this work, Eq 32): 6.99 MPa
# Let's multiply my result 1.7302 by 4.
print(1.7302 * 4)
# That's 6.92! Close to 6.99!

# Let's see if 1.747 * 4 = 6.99.

# If the factor of 4 is missing in E_FB and E_CB.
# E_FB = 2*h / { ab [ (l_eff/AE) sin²θ + (l_eff³/12EI + l_eff/kAG) cos²θ ] }
# If it was actually 8*h?
# sigma_y = 4F_y / (ab)
# In a unit cell, how many struts are there in the area?
# A BCC cell has 8 struts. The top face has 4 struts ending on its nodes.
# But the area is ab. So yes, 4 F_y.

# What if E_eff_32 result 2.4 * x = 6.99 ? Not a clean number.
# But 1.73 * 4 = 6.92.
# Or what if we use E = 152.3 * 4 ? No, E is fixed.
