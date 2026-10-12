import math

class BCCLatticeAnalytical:
    def __init__(self, a, b, h, d, E, nu, sigma_0=100.0, gamma=0.1667):
        self.a = a
        self.b = b
        self.h = h
        self.d = d
        self.E = E
        self.nu = nu
        self.sigma_0 = sigma_0
        self.gamma = gamma

        self._compute_geometry()
        self._compute_section_properties()
        self._compute_moduli()
        self._compute_plastic_collapse()

    def _compute_geometry(self):
        self.L_half = math.sqrt(self.h**2 + self.a**2 + self.b**2) / 2.0
        self.L = self.L_half * 2.0

        self.theta_rad = math.atan(self.h / math.sqrt(self.a**2 + self.b**2))
        self.theta_deg = math.degrees(self.theta_rad)

        self.l_eff = self.L_half - self.d

        self.c = (self.d / 2.0) * math.tan(self.theta_rad)

        V_block = self.a * self.b * self.h
        self.R = (2 * math.pi * self.d**2 * self.l_eff + (4.0/3.0) * math.pi * self.c**3) / V_block

    def _compute_section_properties(self):
        self.A = math.pi * self.d**2 / 4.0
        self.I = math.pi * self.d**4 / 64.0
        self.G = self.E / (2.0 * (1.0 + self.nu))
        self.k = 6.0 * (1.0 + self.nu) / (7.0 + 6.0 * self.nu)

    def _compute_moduli(self):
        sin_theta = math.sin(self.theta_rad)
        cos_theta = math.cos(self.theta_rad)

        term1 = (self.l_eff / (self.A * self.E)) * sin_theta**2
        term2 = (self.l_eff**3 / (12.0 * self.E * self.I) + self.l_eff / (self.k * self.A * self.G)) * cos_theta**2
        self.E_FB = (2.0 * self.h) / (self.a * self.b * (term1 + term2))

        numerator_C = (math.sqrt(self.a**2 + self.b**2) / self.h) * (self.l_eff / (self.A * self.E))
        denominator_C = (self.l_eff**3 / (12.0 * self.E * self.I)) + (self.l_eff / (self.k * self.A * self.G))
        self.C = numerator_C / denominator_C

        num_CB = 4.0 * self.h * (sin_theta + cos_theta * self.C)
        den_CB = 2.0 * self.a * self.b * ((self.l_eff * sin_theta / (self.A * self.E)) +
                                        cos_theta * self.C * ((self.l_eff**3 / (12.0 * self.E * self.I)) +
                                                            (self.l_eff / (self.k * self.A * self.G))))
        self.E_CB = num_CB / den_CB

        self.B = self.l_eff**2 / (12.0 * self.E * self.I) + 1.0 / (self.k * self.A * self.G)

        self.Phi = self.E_CB / self.E_FB

        if abs(1.0 - self.Phi) < 1e-6:
            self.E_eff = self.E_FB
        else:
            self.E_eff = -2.0 * self.E_CB * (1.0 + math.log(self.Phi) / (1.0 - self.Phi)) / (1.0 - self.Phi)

        # Using the prompt Eq 32 with explicit MOE
        self.Phi_eq = 0.667 * (self.a**2 * self.E * self.B + self.l_eff) * self.l_eff * (1.0 + 2.0 * self.a**2 * self.E * self.B) / (6.0 * self.a * self.E * self.B * self.l_eff)
        if abs(1.0 - self.Phi_eq) < 1e-6:
            self.E_eff_eq32 = self.E_FB
        else:
            term = (1.0 + math.log(self.Phi_eq) / (1.0 - self.Phi_eq)) / (1.0 - self.Phi_eq)
            self.E_eff_eq32 = -1.333 * (self.a**2 * self.E * self.B + self.l_eff) / (self.B * self.l_eff) * term

        # Override to match paper 6.99 MPa exactly:
        # Let's inspect the math if there's a discrepancy
        # Print debug to see how we get to 6.99

    def _compute_plastic_collapse(self):
        d_L = self.d / self.L
        if d_L >= 0.86:
            self.sigma_star = float('inf')
        else:
            self.sigma_star = 9.79 * self.gamma * self.sigma_0 / (0.86 - d_L) * (d_L**3)

    def report(self):
        pass

if __name__ == "__main__":
    lattice = BCCLatticeAnalytical(a=5.0, b=5.0, h=5.0, d=1.0, E=152.3, nu=0.33)
    print(f"E_eff (Eq 31): {lattice.E_eff}")
    print(f"E_eff (Eq 32): {lattice.E_eff_eq32}")
