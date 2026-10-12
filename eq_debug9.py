# Section 4.2 says: "For a cubic cell (a = b = h = L)"
# Let's see what happens to sigma* if L = 5.0 (which I did: L_cell = 5.0) vs if L = full diagonal (which is what L meant in section 2.1)
import math

gamma = 0.1667
sigma_0 = 100.0
d = 1.0

# If L = 5.0
L1 = 5.0
d_L1 = d / L1
sigma_star_1 = 9.79 * gamma * sigma_0 / (0.86 - d_L1) * (d_L1**3)
print(f"sigma_star (L=5): {sigma_star_1}")

# If L = full diagonal = 8.66
L2 = 8.66025
d_L2 = d / L2
sigma_star_2 = 9.79 * gamma * sigma_0 / (0.86 - d_L2) * (d_L2**3)
print(f"sigma_star (L=8.66): {sigma_star_2}")

# What if L was just a placeholder variable in the text?
