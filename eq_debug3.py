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

# What if L_eff is used differently?
# Eq 16: delta_y = F_y [ (l_eff/AE) sin²θ + (l_eff³/12EI_y’ + l_eff/kAG) cos²θ ]
# E_y = 2F_y h / (ab δ_y) ->
# E_FB = 2h / (ab [ (l_eff/AE) sin²θ + (l_eff³/12EI_y’ + l_eff/kAG) cos²θ ])
# E_FB = 2*5 / (25 * ( (3.33 / (0.785*152.3))*0.333 + (3.33^3 / (12*152.3*0.049) + 3.33/(0.88*0.785*57.25)) * 0.667))

sin_th = math.sin(theta)
cos_th = math.cos(theta)
term_ax = (l_eff / (A * E)) * sin_th**2
term_bend = (l_eff**3 / (12.0 * E * I) + l_eff / (k * A * G)) * cos_th**2
print(f"Term axial: {term_ax}")
print(f"Term bending: {term_bend}")
print(f"E_FB = {2.0 * h / (a * b * (term_ax + term_bend))}")

# What if a = b = h = L ? No, a = b = h = 5.
# Maybe the formula for E_eff in the prompt has a different Phi?
# Let's print Phi from prompt Eq:
Phi_prompt = 0.667 * (a**2 * E * (l_eff**2 / (12 * E * I) + 1 / (k * A * G)) + l_eff) * l_eff * (1 + 2 * a**2 * E * (l_eff**2 / (12 * E * I) + 1 / (k * A * G))) / (6 * a * E * (l_eff**2 / (12 * E * I) + 1 / (k * A * G)) * l_eff)
print(f"Phi_prompt: {Phi_prompt}")
