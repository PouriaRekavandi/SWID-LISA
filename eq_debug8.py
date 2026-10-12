import math

# If E_eff from Eq 32 is exactly what the prompt claims to be 6.99 MPa.
# Let's write the module exactly as specified by the user's prompt text, including the "expanded" formula Eq 32.
# It's likely that the paper itself has a typo in its expanded formula Eq 32, or a typo in how it defines E_FB/E_CB in text versus what it calculates.
# Wait! Let's check Phi from prompt definition again!

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

B = l_eff**2 / (12.0 * E * I) + 1.0 / (k * a**2 * G)
print(f"B: {B}")

# Prompt Phi definition:
Phi = 0.667 * (a**2 * E * B + l_eff) * l_eff * (1 + 2 * a**2 * E * B) / (6 * a * E * B * l_eff)
print(f"Phi_32: {Phi}")

# Let's try to calculate E_eff_32 using 10x10x10. No, Yang's eq is already integrated.
# Wait, look at the prompt again: "Equation 32: Analytical E_eff = 6.99 MPa"
