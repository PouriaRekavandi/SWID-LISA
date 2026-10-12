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

# From prompt Eq 17
# E_FB = 2h / { ab [ (l_eff/AE) sin²θ + (l_eff³/12EI_y’ + l_eff/kAG) cos²θ ] }
# From prompt Eq 33
# B = l_eff^2 / (12EI_y’) + 1 / (ka^2G)  -- NOTE the a^2 here might be a typo in prompt for A. Let's try both.
# But notice the second term in Eq 17 has l_eff cubed and l_eff respectively.
# l_eff^3 / 12EI + l_eff / kAG = l_eff * (l_eff^2 / 12EI + 1 / kAG)
# So if B = l_eff^2 / 12EI + 1 / kAG, then the term is l_eff * B.
# Then the prompt says 1 / (ka²G). It must be a typo for A in the prompt. Let's use A.
B = l_eff**2 / (12.0 * E * I) + 1.0 / (k * A * G)

# And prompt says:
# E_eff = −1.333(a²EB + l_eff) / (B l_eff) × { [1 + ln(Φ)/(1−Φ)] / (1−Φ) }
# Φ = 0.667(a²EB + l_eff) l_eff (1 + 2a²EB) / (6aEB l_eff)
# Let's write these exactly:

Phi_32 = 0.667 * (a**2 * E * B + l_eff) * l_eff * (1 + 2 * a**2 * E * B) / (6 * a * E * B * l_eff)

E_eff_32 = -1.333 * (a**2 * E * B + l_eff) / (B * l_eff) * (1 + math.log(Phi_32) / (1 - Phi_32)) / (1 - Phi_32)

print(f"Phi_32: {Phi_32}")
print(f"E_eff_32: {E_eff_32}")

# Is it possible the prompt assumes E_eff = E_CB ? E_CB = 5.33 MPa. Still not 6.99.
# Let's check l_eff: L_half = 4.33. l_eff = 3.33.
# R = ...
