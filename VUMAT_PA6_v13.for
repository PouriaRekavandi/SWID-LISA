C=============================================================
C  VUMAT_PA6_v13.for
C  PA6 Thermo-Visco-Plastic VUMAT -- Abaqus/Explicit CEL
C  Voce isotropic hardening + Armstrong-Frederick kinematic
C  hardening WITH STATIC (TIME/TEMPERATURE-DEPENDENT) RECOVERY
C  Johnson-Cook-type strain-rate factor and thermal softening
C  Active isotropic thermal strain
C  Units : mm - tonne - s - N - MPa - K
C
C  FIX vs v12 -- STABILITY FLOOR ON THE COMBINED HARDENING MODULUS
C   Symptom: "The ratio of deformation speed to wave speed exceeds
C   1.0000" / Abaqus/Explicit exits with an error.
C   Cause: the backward-Euler consistency parameter divides by
C   (3G + C_kin - gamma_kin*|alpha|). For constants that make the
C   kinematic-recovery term gamma_kin*|alpha| large relative to the
C   rest (e.g. an exaggerated debug/smoke-test material, or an
C   uncalibrated combination during fitting), this denominator can
C   collapse toward zero or go negative, so the return-mapping solve
C   produces a plastic-strain increment far too large for a single
C   explicit increment -- the element "blows up" in one step, which
C   is exactly the ratio-exceeds-1 diagnostic. v13 floors this
C   modulus at 5% of the elastic term (new variable hmod_nl, used
C   consistently everywhere v12 recomputed the unfloored expression).
C   This is a numerical-robustness fix only: for any input constants
C   where the raw modulus was already comfortably positive (i.e. any
C   sane calibrated material), hmod_nl equals the old expression
C   exactly and nothing about the mechanical response changes.
C
C  WHY THIS VERSION EXISTS (see the freelancer brief, Sec.4.1 item 1):
C   The client's own audit of VUMAT_PA6_v8.f found "no back-stress, no
C   viscoelastic network and no time-dependent recovery term... after
C   unloading the material can only return elastically; inelastic
C   strain stays frozen."  v10/v11 fixed units, the shear-stress bug,
C   thermal-strain activation and the packager call, but the plastic
C   law is STILL pure isotropic (Voce) J2 -- there is still no
C   mechanism that lets a frozen plastic strain reverse after the tool
C   has left.  That omission is why the burrs in the current model
C   stand upright instead of bending inward.
C
C  WHAT IS NEW IN v12
C   A. Nonlinear kinematic (Armstrong-Frederick) back stress ALPHA,
C      carried in STATEV(4:9) (6 tensor components -- fits exactly in
C      the 9 state variables already declared; no *Depvar change).
C      Hardening term:   dALPHA = dlambda*(C_kin*n - gamma_kin*ALPHA)
C      "n" is the (frozen, trial) deviatoric flow direction.
C   B. STATIC / THERMAL RECOVERY of ALPHA, applied every increment
C      (elastic AND plastic), independent of plastic flow:
C         ALPHA <- ALPHA*(1 - r_stat*dt),
C         r_stat = r_stat0*exp[-Qact_R*(1/T - 1/Tref)]
C      This is the missing TIME-DEPENDENT term: even while the burr
C      sits elastically unloaded after the tool has passed, ALPHA
C      decays, the frozen deviatoric stress then exceeds the (lower)
C      yield surface built on the decayed ALPHA, and the return-
C      mapping produces further (reverse) plastic flow -- i.e. the
C      locked-in stress relaxes and the burr geometry keeps moving
C      after the tool has left.  This is exactly the "viscoplastic
C      recovery" mechanism named in Brief Sec.1 and Sec.5.
C   C. Yield/return mapping is now built on the RELATIVE stress
C      XI = s - ALPHA (standard combined iso/kinematic radial return),
C      using the SAME Voce + JC isotropic law and the SAME Newton
C      solve structure as v11, so v11's rate/temperature behaviour is
C      preserved unchanged when C_kin = 0 (i.e. this file reduces
C      exactly to v11 if the new constants are left at zero).
C
C  NEW MATERIAL CONSTANTS (previously-unused slots; all other 38
C  constants keep their v11 meaning -- see header of v11):
C   props(32) = C_kin      kinematic hardening modulus      [MPa]
C   props(33) = gamma_kin  dynamic recovery coefficient      [-]
C   props(34) = r_stat0    static recovery rate prefactor  [1/s]
C   props(35) = Qact_R     activation "temperature" Q/R for
C                          the Arrhenius static-recovery term  [K]
C   props(36) = eta_recov  fraction of back-stress relaxation
C                          energy released as heat (0-1, optional,
C                          added to enerInelas like plastic work)
C
C  *** CALIBRATION WARNING ***
C  The numeric values given for props(32:36) in the companion CAE
C  script are PLACEHOLDERS sized only to produce the right ORDER of
C  magnitude and sign of behaviour (back stress of the same order as
C  sig_A, recovery time constant of the order of the Recovery step).
C  Per the brief's own requirement (Sec.5: "tuning parameters only to
C  make the picture look right ... is not acceptable") these MUST be
C  calibrated against the client's loading-unloading-relaxation test
C  data at multiple temperatures (Sec.8) and checked with a single-
C  element test (Sec.6 acceptance item 6, Sec.7 deliverables) before
C  this is used for anything quantitative.  Until that calibration is
C  done, treat this file as the physically-justified STARTING POINT
C  the brief's Sec.5 scope of work asks for, not a finished answer.
C
C  Carried over unchanged from v11 (kept here for completeness):
C   - Packager/zero-increment call returns an elastic stress (no
C     *Elastic allowed next to *User Material).
C   - Tensor shear convention: 2G*dE12, stress power counts off-
C     diagonal terms twice.
C   - Isotropic thermal strain: 3*alpha*dT volumetric, no deviatoric
C     part.
C   - vaba_param.inc / named parameters for single+double precision.
C
C  props: 1 E0, 2 nu, 3 Tref, 4 dEdT, 7 sig_A, 9 C_rate, 10 b_voce,
C         11 m_th, 12 edot_ref, 16 T_melt, 18 beta (info only),
C         19 sig_sat, 20 edot0, 31 alpha(thermal),
C         32 C_kin, 33 gamma_kin, 34 r_stat0, 35 Qact_R, 36 eta_recov
C  statev: 1 PEEQ, 2 plastic strain rate, 3 relative (xi) equivalent
C          stress, 4-9 back-stress tensor ALPHA(11,22,33,12,13,23)
C=============================================================
      subroutine vumat(
     1 nblock, ndir, nshr, nstatev, nfieldv, nprops, lanneal,
     2 stepTime, totalTime, dt, cmname, coordMp, charLength,
     3 props, density, strainInc, relSpinInc,
     4 tempOld, stretchOld, defgradOld, fieldOld,
     5 stressOld, stateOld, enerInternOld, enerInelasOld,
     6 tempNew, stretchNew, defgradNew, fieldNew,
     7 stressNew, stateNew, enerInternNew, enerInelasNew)
C
      include 'vaba_param.inc'
C
      parameter (zero=0.d0, one=1.d0, two=2.d0, three=3.d0,
     1           half=0.5d0, third=one/three, onept5=1.5d0,
     2           tol12=1.d-12, tol30=1.d-30, tol6=1.d-6, tol2=1.d-2,
     3           NMAX=30)
C
      dimension props(nprops), density(nblock),
     1  strainInc(nblock,ndir+nshr), relSpinInc(nblock,nshr),
     2  tempOld(nblock),        stretchOld(nblock,ndir+nshr),
     3  defgradOld(nblock,ndir+nshr+nshr),
     4  fieldOld(nblock,nfieldv),
     5  stressOld(nblock,ndir+nshr), stateOld(nblock,nstatev),
     6  enerInternOld(nblock),  enerInelasOld(nblock),
     7  tempNew(nblock),        stretchNew(nblock,ndir+nshr),
     8  defgradNew(nblock,ndir+nshr+nshr),
     9  fieldNew(nblock,nfieldv),
     1  stressNew(nblock,ndir+nshr), stateNew(nblock,nstatev),
     2  enerInternNew(nblock),  enerInelasNew(nblock),
     3  coordMp(nblock,*),      charLength(nblock)
C
      character*80 cmname
C
C --- Material constants ---
      E0       = props(1)
      xnu      = props(2)
      Tref     = props(3)
      dEdT     = props(4)
      sig_A    = max(props(7),  tol6)
      C_rate   = props(9)
      b_voce   = max(props(10), tol12)
      xm_th    = props(11)
      edot_ref = max(props(12), tol30)
      T_melt   = max(props(16), Tref + one)
      sig_sat  = max(props(19), sig_A)
      edot0    = max(props(20), tol30)
      alpha_th = props(31)
      C_kin    = max(props(32), zero)
      gam_kin  = max(props(33), zero)
      r_stat0  = max(props(34), zero)
      Qact_R   = max(props(35), zero)
      eta_rec  = min(max(props(36), zero), one)
C
C --- Packager / zero-increment call ---
C     Abaqus/Explicit calls VUMAT once with fictitious strains and
C     totalTime = stepTime = 0 to derive the initial wave speed.
C     The stress MUST respond elastically there (returning stressOld
C     gives zero stiffness -> wrong stable time increment).
      if (totalTime .le. zero .or. dt .le. zero) then
        do k = 1, nblock
          E    = max(E0 + dEdT*(tempOld(k) - Tref), tol2*E0)
          twoG = E / (one + xnu)
          xlam = E*xnu / ((one + xnu)*(one - two*xnu))
          trde = strainInc(k,1) + strainInc(k,2) + strainInc(k,3)
          do j = 1, ndir
            stressNew(k,j) = stressOld(k,j) + xlam*trde
     1                     + twoG*strainInc(k,j)
          end do
          do j = ndir+1, ndir+nshr
            stressNew(k,j) = stressOld(k,j) + twoG*strainInc(k,j)
          end do
          do j = 1, nstatev
            stateNew(k,j) = stateOld(k,j)
          end do
          enerInternNew(k) = enerInternOld(k)
          enerInelasNew(k) = enerInelasOld(k)
        end do
        return
      end if
C
C =================================================================
      do 200 k = 1, nblock
C
        T_old = tempOld(k)
        T_new = tempNew(k)
        T_avg = half*(T_old + T_new)
C
C  --- Temperature-dependent elastic constants ---
        E    = max(E0 + dEdT*(T_avg - Tref), tol2*E0)
        xG   = E / (two*(one + xnu))
        twoG = two*xG
        xKb  = E / (three*(one - two*xnu))
C
C  --- JC-type thermal softening of the isotropic flow stress ---
        Tstar = (T_avg - Tref) / (T_melt - Tref)
        Tstar = max(zero, min(one - tol12, Tstar))
        eta_T = max(one - Tstar**xm_th, tol6)
C
        peeq_old = max(stateOld(k,1), zero)
C
C  --- Old back stress ALPHA (statev 4-9) ---
        a11o = stateOld(k,4)
        a22o = stateOld(k,5)
        a33o = stateOld(k,6)
        a12o = stateOld(k,7)
        a13o = stateOld(k,8)
        a23o = stateOld(k,9)
C
C  --- STATIC (time/temperature-dependent) RECOVERY of ALPHA ---
C      Applied EVERY increment, elastic or plastic: this is the term
C      that was entirely absent from v11 and is the main suspect
C      named in the brief for the missing spring-back.
        if (Qact_R .gt. zero) then
          r_stat = r_stat0*exp(-Qact_R*(one/max(T_avg,tol6)
     1                                  - one/max(Tref,tol6)))
        else
          r_stat = r_stat0
        end if
        rfac = max(zero, one - r_stat*dt)
        a11r = a11o*rfac
        a22r = a22o*rfac
        a33r = a33o*rfac
        a12r = a12o*rfac
        a13r = a13o*rfac
        a23r = a23o*rfac
C
C  --- Old stress (tension positive) ---
        s11o = stressOld(k,1)
        s22o = stressOld(k,2)
        s33o = stressOld(k,3)
        s12o = stressOld(k,4)
        s13o = stressOld(k,5)
        s23o = stressOld(k,6)
C
        po    = third*(s11o + s22o + s33o)
        sd11o = s11o - po
        sd22o = s22o - po
        sd33o = s33o - po
        sd12o = s12o
        sd13o = s13o
        sd23o = s23o
C
C  --- Strain increments (TENSOR shear components) ---
        de11 = strainInc(k,1)
        de22 = strainInc(k,2)
        de33 = strainInc(k,3)
        de12 = strainInc(k,4)
        de13 = strainInc(k,5)
        de23 = strainInc(k,6)
C
C  --- Mechanical volumetric / deviatoric parts (thermal removed) ---
        dT     = T_new - T_old
        dEvTot = de11 + de22 + de33
        devol  = dEvTot - three*alpha_th*dT
        de_m   = third*dEvTot
        dde11  = de11 - de_m
        dde22  = de22 - de_m
        dde33  = de33 - de_m
        dde12  = de12
        dde13  = de13
        dde23  = de23
C
C  --- Elastic predictor (total deviatoric stress) ---
        p_new = po + xKb*devol
        sdt11 = sd11o + twoG*dde11
        sdt22 = sd22o + twoG*dde22
        sdt33 = sd33o + twoG*dde33
        sdt12 = sd12o + twoG*dde12
        sdt13 = sd13o + twoG*dde13
        sdt23 = sd23o + twoG*dde23
C
C  --- Relative (trial) stress XI = s_trial - ALPHA_recovered ---
        xi11t = sdt11 - a11r
        xi22t = sdt22 - a22r
        xi33t = sdt33 - a33r
        xi12t = sdt12 - a12r
        xi13t = sdt13 - a13r
        xi23t = sdt23 - a23r
C
        xJ2tr  = half*(xi11t**2 + xi22t**2 + xi33t**2 +
     1           two*(xi12t**2 + xi13t**2 + xi23t**2))
        seq_tr = sqrt(max(three*xJ2tr, zero))
C
C  --- Flow direction (frozen at the trial state -- standard radial
C      return approximation, consistent with small sub-steps) ---
        if (seq_tr .gt. tol30) then
          xn11 = xi11t/seq_tr
          xn22 = xi22t/seq_tr
          xn33 = xi33t/seq_tr
          xn12 = xi12t/seq_tr
          xn13 = xi13t/seq_tr
          xn23 = xi23t/seq_tr
        else
          xn11 = zero
          xn22 = zero
          xn33 = zero
          xn12 = zero
          xn13 = zero
          xn23 = zero
        end if
C
C  --- Voce isotropic yield stress at old PEEQ (quasi-static) ---
        hw0      = (sig_sat - sig_A)*(one - exp(-b_voce*peeq_old))
        sig_y_el = max((sig_A + hw0)*eta_T, tol6*sig_A)
C
        if (seq_tr .le. sig_y_el) then
C
C    ELASTIC (relative to the recovered back stress)
          dlambda  = zero
          peeq_new = peeq_old
          seq_new  = seq_tr
C
        else
C
C    PLASTIC -- backward-Euler Newton iteration on dlambda
C    (identical structure to v11, but evaluated on the relative
C    stress "seq_tr" defined above instead of the raw deviatoric
C    stress; combined isotropic (Voce) + kinematic (AF) hardening
C    modulus enters the Jacobian as dhwn*eta_T + C_kin - gam_kin*
C    (xi.n) -- using the simplified/decoupled form below, which is
C    the standard engineering approximation for explicit sub-
C    stepping: AF dynamic-recovery term evaluated at the trial
C    back-stress magnitude).
          amag_r = sqrt(a11r**2 + a22r**2 + a33r**2 +
     1             two*(a12r**2 + a13r**2 + a23r**2))
C         --- Combined (isotropic-rate-independent-part) consistency
C         modulus, FLOORED. Without this floor, a kinematic-hardening
C         input (gamma_kin*amag_r) that is large relative to 3G+C_kin
C         drives this term toward zero or negative -- the backward-
C         Euler solve for dlambda then divides by a near-zero number
C         and can return a plastic-strain increment many orders of
C         magnitude too large for one explicit increment, which shows
C         up as "ratio of deformation speed to wave speed exceeds 1".
C         Flooring at 5% of the elastic term keeps the return mapping
C         well posed for ANY combination of input constants, including
C         an exaggerated debug/smoke-test set -- it does not change
C         results for a physically calibrated (non-extreme) material,
C         since the floor only activates when the raw value would
C         already be a numerically dangerous near-zero/negative number.
          xGfloor = 0.05d0*three*xG
          hmod_nl = max(three*xG + C_kin - gam_kin*amag_r, xGfloor)
          dhw0    = (sig_sat-sig_A)*b_voce*exp(-b_voce*peeq_old)
          hmod0   = hmod_nl + dhw0*eta_T
          dlambda = max((seq_tr - sig_y_el)/max(hmod0, tol6), zero)
C
          do 100 iter = 1, NMAX
C
            peeq_new = peeq_old + dlambda
            hwn   = (sig_sat-sig_A)*(one - exp(-b_voce*peeq_new))
            sig_v = max((sig_A + hwn)*eta_T, tol6*sig_A)
C
            edot_p = max(dlambda / dt, edot0)
            if (C_rate .gt. zero .and.
     1          edot_p .gt. edot_ref) then
              f_rate = max(one + C_rate*log(edot_p/edot_ref), one)
            else
              f_rate = one
            end if
C
            sig_flow = sig_v * f_rate
            seq_new  = max(seq_tr - hmod_nl*dlambda, zero)
            res      = seq_new - sig_flow
C
            dhwn = (sig_sat-sig_A)*b_voce*exp(-b_voce*peeq_new)
            dres = -hmod_nl - dhwn*eta_T*f_rate
            if (C_rate .gt. zero .and.
     1          edot_p .gt. edot_ref .and.
     2          dlambda .gt. zero) then
              dres = dres - sig_v*C_rate/dlambda
            end if
C
            if (abs(dres) .lt. tol30) goto 110
            ddl     = -res / dres
            dlambda = max(zero, dlambda + ddl)
            if (abs(ddl) .lt. tol12*max(one,peeq_new)) goto 110
C
  100     continue
  110     continue
C
          dlambda  = min(dlambda, seq_tr/max(three*xG, tol6))
          peeq_new = peeq_old + dlambda
          seq_new  = max(seq_tr - hmod_nl*dlambda, zero)
C
        end if
C
C  --- Radial return in relative-stress space ---
        if (seq_tr .gt. tol30) then
          scale = seq_new / seq_tr
        else
          scale = one
        end if
        xi11n = xi11t * scale
        xi22n = xi22t * scale
        xi33n = xi33t * scale
        xi12n = xi12t * scale
        xi13n = xi13t * scale
        xi23n = xi23t * scale
C
C  --- Back-stress (Armstrong-Frederick) update ---
C      dALPHA = dlambda*(C_kin*n - gamma_kin*ALPHA), n = trial flow
C      direction; applied on top of the static-recovery-decayed value.
        a11n = a11r + dlambda*(C_kin*xn11 - gam_kin*a11r)
        a22n = a22r + dlambda*(C_kin*xn22 - gam_kin*a22r)
        a33n = a33r + dlambda*(C_kin*xn33 - gam_kin*a33r)
        a12n = a12r + dlambda*(C_kin*xn12 - gam_kin*a12r)
        a13n = a13r + dlambda*(C_kin*xn13 - gam_kin*a13r)
        a23n = a23r + dlambda*(C_kin*xn23 - gam_kin*a23r)
C
C  --- Total deviatoric stress: s = XI + ALPHA ---
        sd11n = xi11n + a11n
        sd22n = xi22n + a22n
        sd33n = xi33n + a33n
        sd12n = xi12n + a12n
        sd13n = xi13n + a13n
        sd23n = xi23n + a23n
C
C  --- Stress update ---
        stressNew(k,1) = sd11n + p_new
        stressNew(k,2) = sd22n + p_new
        stressNew(k,3) = sd33n + p_new
        stressNew(k,4) = sd12n
        stressNew(k,5) = sd13n
        stressNew(k,6) = sd23n
C
C  --- State variables ---
        stateNew(k,1) = peeq_new
        stateNew(k,2) = dlambda / dt
        stateNew(k,3) = seq_new
        stateNew(k,4) = a11n
        stateNew(k,5) = a22n
        stateNew(k,6) = a33n
        stateNew(k,7) = a12n
        stateNew(k,8) = a13n
        stateNew(k,9) = a23n
C
C  --- Energies (specific, per unit mass) ---
        sig11a = half*(stressOld(k,1) + stressNew(k,1))
        sig22a = half*(stressOld(k,2) + stressNew(k,2))
        sig33a = half*(stressOld(k,3) + stressNew(k,3))
        sig12a = half*(stressOld(k,4) + stressNew(k,4))
        sig13a = half*(stressOld(k,5) + stressNew(k,5))
        sig23a = half*(stressOld(k,6) + stressNew(k,6))
C
C    tensor shear -> off-diagonal terms counted twice
        dW = sig11a*de11 + sig22a*de22 + sig33a*de33
     1     + two*(sig12a*de12 + sig13a*de13 + sig23a*de23)
C
        rho_k = max(density(k), tol30)
        enerInternNew(k) = enerInternOld(k) + dW/rho_k
        seq_avg          = half*(seq_tr + seq_new)
        amagr_dr         = amag_r
        if (dlambda .le. zero) amagr_dr = zero
C       Plastic dissipation (isotropic part) plus a fraction of the
C       static back-stress relaxation energy released as heat.
        de_back = half*((a11o-a11n)*xn11 + (a22o-a22n)*xn22
     1          + (a33o-a33n)*xn33 + two*((a12o-a12n)*xn12
     2          + (a13o-a13n)*xn13 + (a23o-a23n)*xn23))
        enerInelasNew(k) = enerInelasOld(k)
     1    + seq_avg*dlambda/rho_k
     2    + eta_rec*max(de_back,zero)/rho_k
C
  200 continue
C
      return
      end
