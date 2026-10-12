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

print(f"L_half: {L_half}")
print(f"l_eff: {l_eff}")
print(f"theta_deg: {math.degrees(theta)}")
print(f"A: {A}")
print(f"I: {I}")
print(f"G: {G}")
print(f"k: {k}")

# Check Eq 33 exactly as written in prompt:
# B = l_eff^2 / (12EI) + 1 / (ka^2G)
# Note a^2 instead of A in the denominator? The prompt says:
# B = l_eff^2 / (12EI_y') + 1 / (ka^2G) -> wait, it says ka^2G or kAG ?
# Let's check prompt: "1 / (ka²G)"
B_prompt = l_eff**2 / (12.0 * E * I) + 1.0 / (k * a**2 * G)

Phi_prompt = 0.667 * (a**2 * E * B_prompt + l_eff) * l_eff * (1 + 2 * a**2 * E * B_prompt) / (6 * a * E * B_prompt * l_eff)

E_eff_prompt = -1.333 * (a**2 * E * B_prompt + l_eff) / (B_prompt * l_eff) * (1 + math.log(Phi_prompt) / (1 - Phi_prompt)) / (1 - Phi_prompt)

print(f"B_prompt (with a^2): {B_prompt}")
print(f"Phi_prompt: {Phi_prompt}")
print(f"E_eff_prompt (with a^2): {E_eff_prompt}")

# Let's recalculate E_eff with Yang's eq.
sin_theta = math.sin(theta)
cos_theta = math.cos(theta)
term1 = (l_eff / (A * E)) * sin_theta**2
term2 = (l_eff**3 / (12.0 * E * I) + l_eff / (k * A * G)) * cos_theta**2
E_FB = (2.0 * h) / (a * b * (term1 + term2))
numerator_C = (math.sqrt(a**2 + b**2) / h) * (l_eff / (A * E))
denominator_C = (l_eff**3 / (12.0 * E * I)) + (l_eff / (k * A * G))
C = numerator_C / denominator_C
num_CB = 4.0 * h * (sin_theta + cos_theta * C)
den_CB = 2.0 * a * b * ((l_eff * sin_theta / (A * E)) + cos_theta * C * ((l_eff**3 / (12.0 * E * I)) + (l_eff / (k * A * G))))
E_CB = num_CB / den_CB
Phi = E_CB / E_FB
E_eff_1 = -2.0 * E_CB * (1.0 + math.log(Phi) / (1.0 - Phi)) / (1.0 - Phi)
print(f"E_FB: {E_FB}, E_CB: {E_CB}, Phi: {Phi}, E_eff_1: {E_eff_1}")

# Is it possible the prompt Eq 31 is actually evaluated with different logic or constants for 6.99?
# Wait! In the prompt, the values are:
# E_eff = 6.99 MPa.
# What if it's evaluated with a=b=h=L? No, a=5.
