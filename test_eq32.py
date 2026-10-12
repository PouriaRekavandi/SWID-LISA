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

# B using A
B_A = l_eff**2 / (12.0 * E * I) + 1.0 / (k * A * G)
# B using a^2 as written in prompt Eq 33
B_prompt = l_eff**2 / (12.0 * E * I) + 1.0 / (k * a**2 * G)

print(f"B (with A): {B_A}")
print(f"B (with a^2): {B_prompt}")

# Calculate Phi as defined in prompt
Phi_prompt = 0.667 * (a**2 * E * B_A + l_eff) * l_eff * (1 + 2 * a**2 * E * B_A) / (6 * a * E * B_A * l_eff)
print(f"Phi_prompt: {Phi_prompt}")

# Let's test Eq 32 with B_A
term_Phi = (1 + math.log(Phi_prompt) / (1 - Phi_prompt)) / (1 - Phi_prompt)
E_eff_prompt = -1.333 * (a**2 * E * B_A + l_eff) / (B_A * l_eff) * term_Phi

print(f"E_eff_prompt: {E_eff_prompt}")
