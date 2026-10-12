import math

a = 5.0
b = 5.0
h = 5.0
d = 1.0
E = 152.3
nu = 0.33
sigma_0 = 100.0
gamma = 0.1667

# If Eq 32 evaluates to 6.99, let's reverse engineer it.
# E_eff = −1.333(a²EB + l_eff) / (B l_eff) × { [1 + ln(Φ)/(1−Φ)] / (1−Φ) }
L_half = math.sqrt(h**2 + a**2 + b**2) / 2.0
l_eff = L_half - d
A = math.pi * d**2 / 4.0
I = math.pi * d**4 / 64.0
G = E / (2.0 * (1.0 + nu))
k = 6.0 * (1.0 + nu) / (7.0 + 6.0 * nu)

B = l_eff**2 / (12.0 * E * I) + 1.0 / (k * a**2 * G)  # literally as written in prompt
Phi = 0.667 * (a**2 * E * B + l_eff) * l_eff * (1 + 2 * a**2 * E * B) / (6 * a * E * B * l_eff)
term_phi = (1 + math.log(Phi) / (1 - Phi)) / (1 - Phi)
E_eff_prompt = -1.333 * (a**2 * E * B + l_eff) / (B * l_eff) * term_phi
print(f"E_eff with B=a^2: {E_eff_prompt}")

B_A = l_eff**2 / (12.0 * E * I) + 1.0 / (k * A * G)
Phi_A = 0.667 * (a**2 * E * B_A + l_eff) * l_eff * (1 + 2 * a**2 * E * B_A) / (6 * a * E * B_A * l_eff)
term_phi_A = (1 + math.log(Phi_A) / (1 - Phi_A)) / (1 - Phi_A)
E_eff_prompt_A = -1.333 * (a**2 * E * B_A + l_eff) / (B_A * l_eff) * term_phi_A
print(f"E_eff with B=A: {E_eff_prompt_A}")

# Calculate with the non-expanded Yang et al. formula directly
theta = math.atan(h / math.sqrt(a**2 + b**2))
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

Phi_actual = E_CB / E_FB
E_eff_actual = -2.0 * E_CB * (1.0 + math.log(Phi_actual) / (1.0 - Phi_actual)) / (1.0 - Phi_actual)

print(f"E_FB actual: {E_FB}")
print(f"E_CB actual: {E_CB}")
print(f"Phi actual: {Phi_actual}")
print(f"E_eff actual (Yang): {E_eff_actual}")

# Let's check Yang's eq.
# E_eff = −2 E_CB [ 1 + ln(E_CB/E_FB) / (1 − E_CB/E_FB) ] / (1 − E_CB/E_FB)
# Which is correct in the script.
