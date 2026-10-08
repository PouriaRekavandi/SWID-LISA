      SUBROUTINE VUMAT(
C Read only -
     1  nblock, ndir, nshr, nstatev, nfieldv, nprops, lanneal,
     2  stepTime, totalTime, dt, cmname, coordMp, charLength,
     3  props, density, strainInc, relSpinInc,
     4  tempOld, stretchOld, defgradOld, fieldOld,
     5  stressOld, stateOld, enerInternOld, enerInelasOld,
     6  tempNew, stretchNew, defgradNew, fieldNew,
C Write only -
     7  stressNew, stateNew, enerInternNew, enerInelasNew )
C
      INCLUDE 'vaba_param.inc'
C
      DIMENSION props(nprops), density(nblock), coordMp(nblock,*),
     1  charLength(nblock), strainInc(nblock,ndir+nshr),
     2  relSpinInc(nblock,nshr), tempOld(nblock),
     3  stretchOld(nblock,ndir+nshr),
     4  defgradOld(nblock,ndir+nshr+nshr),
     5  fieldOld(nblock,nfieldv), stressOld(nblock,ndir+nshr),
     6  stateOld(nblock,nstatev), enerInternOld(nblock),
     7  enerInelasOld(nblock), tempNew(nblock),
     8  stretchNew(nblock,ndir+nshr),
     9  defgradNew(nblock,ndir+nshr+nshr),
     1  fieldNew(nblock,nfieldv),
     2  stressNew(nblock,ndir+nshr), stateNew(nblock,nstatev),
     3  enerInternNew(nblock), enerInelasNew(nblock)
C
      CHARACTER*80 cmname
C
C Local variables
      INTEGER k, i
      REAL*8 E, nu, alpha, T_ref, T, dT
      REAL*8 K_bulk, G_shear, trace_eps, p_old, p_new
      REAL*8 s_old(6), s_new(6), e_inc(6), de_vol, de_dev(6)
      REAL*8 sy0, H_iso, H_kin, C_kin, gamma_kin
      REAL*8 alpha_back(6), alpha_back_new(6)
      REAL*8 seq, f_yield, dlambda
      REAL*8 tmp, root23

      root23 = SQRT(2.0D0/3.0D0)

C Material Properties
C props(1): Young's Modulus (MPa)
C props(2): Poisson's Ratio
C props(3): Thermal Expansion Coeff (1/K)
C props(4): Reference Temperature (K)
C props(5): Initial Yield Stress (MPa)
C props(6): Isotropic Hardening Modulus (MPa)
C props(7): Kinematic Hardening Modulus (MPa) (for recovery)
C props(8): Kinematic Recovery Parameter (gamma)
C props(9): Thermal Softening Parameter

      E = props(1)
      nu = props(2)
      alpha = props(3)
      T_ref = props(4)
      sy0 = props(5)
      H_iso = props(6)
      C_kin = props(7)
      gamma_kin = props(8)

      K_bulk = E / (3.0D0 * (1.0D0 - 2.0D0 * nu))
      G_shear = E / (2.0D0 * (1.0D0 + nu))

      DO k = 1, nblock
C        Temperature
         T = tempOld(k)
         dT = tempNew(k) - tempOld(k)

C        Thermal expansion strain (isotropic)
         de_vol = 0.0D0
         DO i = 1, ndir
            de_vol = de_vol + strainInc(k,i)
         END DO

         trace_eps = de_vol - 3.0D0 * alpha * dT

C        Old deviatoric stress and pressure
         p_old = - (stressOld(k,1)+stressOld(k,2)+stressOld(k,3))/3.0D0
         DO i = 1, ndir
            s_old(i) = stressOld(k,i) + p_old
            de_dev(i) = strainInc(k,i) - de_vol/3.0D0
         END DO
         DO i = ndir+1, ndir+nshr
            s_old(i) = stressOld(k,i)
            de_dev(i) = strainInc(k,i)
         END DO

C        Trial elastic stress
         p_new = p_old - K_bulk * trace_eps
         DO i = 1, ndir
            s_new(i) = s_old(i) + 2.0D0 * G_shear * de_dev(i)
         END DO
         DO i = ndir+1, ndir+nshr
            s_new(i) = s_old(i) + 2.0D0 * G_shear * de_dev(i)
         END DO

C        Back stress from state variables (kinematic hardening)
         DO i = 1, ndir+nshr
            alpha_back(i) = stateOld(k, i)
         END DO

C        Equivalent Plastic Strain
         seq = 0.0D0
         DO i = 1, ndir
            seq = seq + 1.5D0*(s_new(i)-alpha_back(i))**2
         END DO
         DO i = ndir+1, ndir+nshr
            seq = seq + 3.0D0*(s_new(i)-alpha_back(i))**2
         END DO
         seq = SQRT(MAX(seq, 0.0D0))

C        Yield surface
         f_yield = seq - (sy0 + H_iso * stateOld(k, ndir+nshr+1))

         IF (f_yield .GT. 0.0D0) THEN
C           Plastic step
            dlambda = f_yield / (3.0D0*G_shear + H_iso + C_kin)

C           Update deviatoric stress, back-stress, and internal energy
            DO i = 1, ndir
               tmp = 1.5D0*(s_new(i)-alpha_back(i))/seq
               s_new(i) = s_new(i) - 2.0D0*G_shear * dlambda * tmp
               alpha_back_new(i) = alpha_back(i) + C_kin*dlambda*tmp
     1                           - gamma_kin*alpha_back(i)*dlambda
            END DO
            DO i = ndir+1, ndir+nshr
               tmp = 3.0D0*(s_new(i)-alpha_back(i))/seq
               s_new(i) = s_new(i) - 2.0D0*G_shear * dlambda * tmp/2.0D0
               alpha_back_new(i) = alpha_back(i) + C_kin*dlambda*tmp
     1                           - gamma_kin*alpha_back(i)*dlambda
            END DO

C           Update plastic strain
            stateNew(k, ndir+nshr+1) = stateOld(k, ndir+nshr+1)+dlambda
         ELSE
            DO i = 1, ndir+nshr
               alpha_back_new(i) = alpha_back(i)
            END DO
            stateNew(k, ndir+nshr+1) = stateOld(k, ndir+nshr+1)
         END IF

C        Save back stress
         DO i = 1, ndir+nshr
            stateNew(k, i) = alpha_back_new(i)
         END DO

C        Update total stress
         DO i = 1, ndir
            stressNew(k,i) = s_new(i) - p_new
         END DO
         DO i = ndir+1, ndir+nshr
            stressNew(k,i) = s_new(i)
         END DO

C        Update Internal Energy (Simplified)
         enerInternNew(k) = enerInternOld(k) + 0.5D0*trace_eps*p_new
      END DO

      RETURN
      END
