'use strict';
// IISER Aptitude Test 2021 - Question Bank

const questionBank = {
    Biology: [
        {
            id: 1,
            text: "Which one of the following epithelial cell types is commonly found in the inner surface of the fallopian tubes?",
            options: [
                "Ciliated",
                "Columnar",
                "Squamous",
                "Cuboidal"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 2,
            text: "Which of the following is not an asexual reproductive structure?",
            options: [
                "Isogametes of Cladophora",
                "Conidia of Penicillium",
                "Zoospores of Chlamydomonas",
                "Gemmules in a sponge"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 3,
            text: "Which one of the following is an example of palindromic DNA sequence?",
            options: [
                "5' GAATTC 3' | 3' CTTAAG 5'",
                "5' GACTTC 3' | 3' CTGAAG 5'",
                "5' GAAGTC 3' | 3' CTTCAG 5'",
                "5' GACCAG 3' | 3' CTGGTC 5'"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 4,
            text: "Some individuals start sneezing when the pollen content is high in the air. Primarily which Ig isotype will these individuals produce as an immune response?",
            options: [
                "IgE",
                "IgA",
                "IgM",
                "IgG1"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 5,
            text: "Which of these factors is least likely to cause deviation from the Hardy-Weinberg equilibrium?",
            options: [
                "Genetic drift",
                "Mutation",
                "Gene flow",
                "Reduction in population size"
            ],
            correct: 1, // B
            marks: 4
        },
        {
            id: 6,
            text: "A scientist performed Griffith's experiment with S-strain and R-strain of <i>Streptococcus pneumoniae</i>. Based on the treatments (T1-T6) listed in the table below, identify the outcomes on mouse viability.<br><br>[Image: Experiment Table defining treatments T1 to T6]",
            options: [
                "T1: live, T2: die, T3: die, T4: live, T5: die, T6: live",
                "T1: live, T2: live, T3: die, T4: live, T5: live, T6: live",
                "T1: live, T2: die, T3: die, T4: die, T5: live, T6: die",
                "T1: live, T2: die, T3: live, T4: die, T5: die, T6: live"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 7,
            text: "Which of the following is/are produced by a plant during photosynthesis with far-red light?",
            options: [
                "Only ATP",
                "ATP, NADPH and H⁺",
                "NADPH and H⁺",
                "Only NADPH"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 8,
            text: "A 4000 bp plasmid is digested with PstI (800) and HindIII (1920), then with EcoRI (1700) and SalI (2460). What are the final band sizes?<br><br>[Image: Plasmid Map showing cut sites at 800, 1700, 1920, 2460]",
            options: [
                "220, 540, 1200 and 2040",
                "220, 540, 900 and 2340",
                "540, 760, 1200 and 1500",
                "320, 540, 800 and 2340"
            ],
            correct: 1, // B
            marks: 4
        },
        {
            id: 9,
            text: "The plot represents the change in rate of photosynthesis with leaf temperature for plants P1 and P2. Which statement correctly describes them?<br><br>[Image: Graph showing P1 peaking at ~25°C and P2 peaking at ~35°C]",
            options: [
                "P1 is C₃ (temperate), P2 is C₄ (tropical)",
                "P1 is C₄ (temperate), P2 is C₃ (tropical)",
                "P1 is C₄ (tropical), P2 is C₃ (temperate)",
                "P1 is C₃ (tropical), P2 is C₄ (temperate)"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 10,
            text: "Figure (i) shows Regulators (X) vs Conformers (Y). Figure (ii) shows Type a vs Type b surface area/volume ratio. Which combination represents: Humming bird; Crocodile; Frog; Polar bear?<br><br>[Image: Physiological Response Graphs (i) and (ii)]",
            options: [
                "Xa; Yb; Ya; Xb",
                "Xb; Ya; Yb; Xa",
                "Ya; Yb; Xa; Xb",
                "Yb; Xb; Xa; Ya"
            ],
            correct: 1, // B
            marks: 4
        },
        {
            id: 11,
            text: "In plants, which enzyme uses ammonium ions to convert an alpha-keto acid into an amino acid?",
            options: [
                "Glutamate dehydrogenase",
                "Nitrogenase",
                "Transacetylase",
                "Lactate dehydrogenase"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 12,
            text: "Which one of the following physiological functions is common between the small intestine and the renal tubules?",
            options: [
                "Absorption of glucose",
                "Excretion of waste materials",
                "Excretion of water",
                "Absorption of proteins"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 13,
            text: `Match the following pairs of interacting species to the corresponding names of the interactions.<br><br>
            <table border="1" style="width:100%; border-collapse: collapse; text-align: left;">
              <tr>
                <th style="padding: 8px;">Interacting Species</th>
                <th style="padding: 8px;">Interaction Name</th>
              </tr>
              <tr>
                <td style="padding: 8px;">i. Herbivores and Plants</td>
                <td style="padding: 8px;">a. Mutualism</td>
              </tr>
              <tr>
                <td style="padding: 8px;">ii. Cuckoo and Crow</td>
                <td style="padding: 8px;">b. Predation</td>
              </tr>
              <tr>
                <td style="padding: 8px;">iii. Sea anemone and Clown fish</td>
                <td style="padding: 8px;">c. Parasitism</td>
              </tr>
              <tr>
                <td style="padding: 8px;">iv. Fungus and Cyanobacteria</td>
                <td style="padding: 8px;">d. Commensalism</td>
              </tr>
            </table>`,
            options: [
                "i-b; ii-c; iii-d; iv-a",
                "i-c; ii-b; iii-d; iv-a",
                "i-b; ii-d; iii-c; iv-a",
                "i-b; ii-a; iii-c; iv-d"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 14,
            text: "Which is the correct sequence of meiotic events: (i) recombinant nodules, (ii) spindle formation, (iii) chiasmata, (iv) synaptonemal complex?",
            options: [
                "iv → i → iii → ii",
                "ii → iv → iii → i",
                "iv → iii → i → ii",
                "i → iii → iv → ii"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 15,
            text: "Which floral formula represents a zygomorphic flower with diadelphous androecium and superior ovary?",
            options: [
                "% K₍₅₎ C₁₊₂₊₍₂₎ A₍₉₎₊₁ G₁",
                "(+) K₍₅₎ C₍₅₊₅₎ A₍∞₎ G₁",
                "% K₍₅₎ C₍₅₊₅₎ A₍∞₎ G_perp",
                "% K₍₅₎ C₍₅₎ A₂ G₁"
            ],
            correct: 2, // C
            marks: 4
        }
    ],

    Chemistry: [
        {
            id: 16,
            text: "The F-P-Cl bond angles in the most stable structure of PF₃Cl₂ are close to:",
            options: [
                "90° and 120°",
                "90°, 120° and 180°",
                "90° only",
                "90° and 180°"
            ],
            correct: 1, // B
            marks: 4
        },
        {
            id: 17,
            text: "Correct statement about bond angles and lengths in Al₂Cl₆ (t=terminal, b=bridging):",
            options: [
                "∠Clₜ-Al-Clₜ > ∠Clᵦ-Al-Clᵦ and Al-Clᵦ > Al-Clₜ",
                "∠Clₜ-Al-Clₜ > ∠Clᵦ-Al-Clᵦ and Al-Clₜ > Al-Clᵦ",
                "∠Clₜ-Al-Clₜ = ∠Clᵦ-Al-Clᵦ and Al-Clₜ > Al-Clᵦ",
                "∠Clᵦ-Al-Clᵦ > ∠Clₜ-Al-Clₜ and Al-Clᵦ > Al-Clₜ"
            ],
            correct: 1, // B
            marks: 4
        },
        {
            id: 18,
            text: "Which silanes are used to synthesize straight chain and branched chain silicone polymers, respectively?",
            options: [
                "(CH₃)₂SiCl₂ and (CH₃)SiCl₃",
                "(CH₃)SiCl₃ and (CH₃)₂SiCl₂",
                "(CH₃)₂SiCl₂ and (CH₃)₃SiCl",
                "(CH₃)₃SiCl and (CH₃)₂SiCl₂"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 19,
            text: "Which statement is INCORRECT about a complex of a divalent ion with atomic number 25 (Mn)?",
            options: [
                "Complex with weak field ligands in tetrahedral geometry has a magnetic moment of 1.73 BM.",
                "Complex with weak field ligands in tetrahedral geometry has a magnetic moment of 5.92 BM.",
                "Complex with strong field ligands in octahedral geometry has a magnetic moment of 1.73 BM.",
                "Complex with weak field ligands in octahedral geometry has a magnetic moment of 5.92 BM."
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 20,
            text: "Ni(CO)₄ is diamagnetic because:",
            options: [
                "Ni has completely filled 3d orbitals.",
                "It is a square planar complex.",
                "CO is a strong field ligand.",
                "It has synergic bonding."
            ],
            correct: 2, // C
            marks: 4
        },
        {
            id: 21,
            text: "The correct order for the relative energies of the sawhorse conformations is:<br><br>[Image: 4 Sawhorse Projections labeled I (Eclipsed), II (Skew), III (Skew), IV (Staggered)]",
            options: [
                "IV > III = II > I",
                "IV > III > II > I",
                "II ≈ III > IV > I",
                "I > II = III > IV"
            ],
            correct: 1, // B
            marks: 4
        },
        {
            id: 22,
            text: "Among the haloarenes shown, the correct order of reactivity for substitution with NaOH is:<br><br>[Image: Four Chlorobenzenes: I(p-NO₂), II(2,4,6-trinitro), III(2,4-dinitro), IV(p-OMe)]",
            options: [
                "II > III ≈ I > IV",
                "I > IV > III > II",
                "II > III > IV > I",
                "IV > I ≈ III > II"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 23,
            text: "Consider the reaction sequence:<br>Acetyl Chloride --(i)--> P --(ii)--> Q --(iii)--> R --(iv)--> S<br><br>[Image: Reaction Scheme specifying reagents: (i) Pd-BaSO₄/H₂, (ii) MeMgBr, (iii) CrO₃, (iv) Zn-Hg/HCl]",
            options: [
                "(i) and (iv)",
                "(iii) and (iv)",
                "(i) and (ii)",
                "(ii) and (iii)"
            ],
            correct: 2, // C
            marks: 4
        },
        {
            id: 24,
            text: "The major product of the reaction of salicylaldehyde with one equivalent of MeMgBr, followed by acid neutralization is:<br><br>[Image: Structures I (Alcohol), II (Aldehyde), III (Ether), IV (Methylated)]",
            options: [
                "Structure II",
                "Structure I",
                "Structure IV",
                "Structure III"
            ],
            correct: 3, // D
            marks: 4
        },
        {
            id: 25,
            text: "The total number of stereoisomers possible for CH₃CH(OH)CH(OH)HC=CHCH₃ is:",
            options: [
                "8",
                "4",
                "2",
                "6"
            ],
            correct: 1, // B
            marks: 4
        },
        {
            id: 26,
            text: "For a homogeneous reaction involving ideal gases at 27°C, Kₚ=9.98×10²⁷ and K_c=4.0×10²⁴. If ΔH = 18.4 kJmol⁻¹, the internal energy change (ΔU) is:",
            options: [
                "-20.89 kJmol⁻¹",
                "-15.91 kJmol⁻¹",
                "-13.41 kJmol⁻¹",
                "-23.39 kJmol⁻¹"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 27,
            text: "The probability density of an electron in 1s orbital for an H atom is maximum:",
            options: [
                "at the nucleus.",
                "at the Bohr radius.",
                "at twice the Bohr radius.",
                "at infinite distance."
            ],
            correct: 1, // B
            marks: 4
        },
        {
            id: 28,
            text: "Which of the following statements is INCORRECT?",
            options: [
                "Half-life of a zero order reaction is proportional to the rate constant.",
                "Half-life of a zero order reaction is proportional to the initial concentration.",
                "Half-life of a first order reaction is independent of initial concentration.",
                "Half-life of a first order reaction is inversely proportional to the rate constant."
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 29,
            text: "Time required for reducing 1 mole of MnO₄⁻ to Mn²⁺ with 2.5 A current is:",
            options: [
                "53.6 hours",
                "12.9 microseconds",
                "10.7 hours",
                "64.8 microseconds"
            ],
            correct: 2, // C
            marks: 4
        },
        {
            id: 30,
            text: "Which energy diagram corresponds to the reaction X ⇌ Y ⇌ Z (where k ≈ k')?<br><br>[Image: 4 Energy Profile Diagrams; Diagram B shows X > Y > Z]",
            options: [
                "Diagram A",
                "Diagram B",
                "Diagram C",
                "Diagram D"
            ],
            correct: 1, // B
            marks: 4
        }
    ],

    Mathematics: [
        {
            id: 31,
            text: "What is the maximum value of cos⁴(x) + sin²(x) + cos(x), when x ≥ 0?",
            options: [
                "2",
                "1",
                "√2",
                "2√2"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 32,
            text: "Boy draws card m (1-10), puts back. Girl draws n. Probability m > n given m is even?",
            options: [
                "1/2",
                "1/3",
                "1/4",
                "1/5"
            ],
            correct: 1, // B
            marks: 4
        },
        {
            id: 33,
            text: "Points (a,b), (a²,b²), (a³,b³) are distinct, collinear, not parallel to y-axis. Slope can take:",
            options: [
                "exactly two values",
                "infinitely many values",
                "exactly three values",
                "exactly one value"
            ],
            correct: 3, // D
            marks: 4
        },
        {
            id: 34,
            text: "f(x) defined on [2,22] using max{n(1-|x-(2n+1)|)}. Area of region under f(x)?",
            options: [
                "55",
                "60",
                "5",
                "10"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 35,
            text: "Value of limit x→0⁺ (sin x)^√x * (e^x + x)^(1/x)?",
            options: [
                "e²",
                "1",
                "e",
                "0"
            ],
            correct: 2, // C
            marks: 4
        },
        {
            id: 36,
            text: "f(x) = e^(x²/2) + ∫₀ˣ t f(t) dt. Which is correct for f(√2)?",
            options: [
                "5 < f(√2) < 6",
                "2 < f(√2) < 3",
                "3 < f(√2) < 4",
                "4 < f(√2) < 5"
            ],
            correct: 2, // C
            marks: 4
        },
        {
            id: 37,
            text: "Polynomial p_a(z) = z² + 2e^(a-e^a)z + e^(a-e^a). Which statement is true?",
            options: [
                "p_a has only non-real complex roots for all a",
                "p_a has a real root for all a",
                "p_a has a real root if and only if a ≥ 1",
                "p_a has a real root if and only if a ≤ -1"
            ],
            correct: 1, // B
            marks: 4
        },
        {
            id: 38,
            text: "Number of functions f:{1..5}→{1..5} such that f(f(n)) = n?",
            options: [
                "41",
                "25",
                "31",
                "120"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 39,
            text: "Plane P passes through (1,2,1) normal to intersection of x+y+z=1 and 2x+y+z=3.",
            options: [
                "y - z = 1",
                "x + z = 2",
                "x + 2y + z = 6",
                "x + y + 2z = 5"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 40,
            text: "Integral ∫₀^(π/2) of f(∛(cos x)) / [f(∛(sin x)) + f(∛(cos x))] dx, where f(x)=ln(1+x).",
            options: [
                "π/4",
                "π/6",
                "π/2",
                "π/3"
            ],
            correct: 1, // B
            marks: 4
        },
        {
            id: 41,
            text: "Area enclosed by y = 1+|sin x| and y = -|sin x| from 0 to 2π.",
            options: [
                "8 + 2π",
                "8 + 4π",
                "8 + 6π",
                "8 + 8π"
            ],
            correct: 2, // C
            marks: 4
        },
        {
            id: 42,
            text: "f(x) = x²|x|. Which statement is correct regarding differentiability?",
            options: [
                "f' is differentiable, f'' is not",
                "f is continuous but not differentiable",
                "f is differentiable, f' is not",
                "f'' is differentiable"
            ],
            correct: 2, // C
            marks: 4
        },
        {
            id: 43,
            text: "Matrix A² + A + [0 1; 1 0] = 0. Invertibility of A and A+I?",
            options: [
                "Both A and A+I are invertible",
                "A is invertible, A+I may not be",
                "A+I is invertible, A may not be",
                "Neither may be invertible"
            ],
            correct: 2, // C
            marks: 4
        },
        {
            id: 44,
            text: "Determinant of matrix with entries in rows: [x²+3, x²+4, x²+5], [x²+4, x²+5, x²+6], [x²+a, x²+b, x²+c] where a,b,c are in AP.",
            options: [
                "0",
                "2a",
                "a + c - b",
                "x² + 2b"
            ],
            correct: 2, // C
            marks: 4
        },
        {
            id: 45,
            text: "Data sets S₁ and S₂. Relation between means (m) and variances (v)?",
            options: [
                "m₂ = m₁ + 50, v₂ = v₁",
                "m₂ = m₁ + 50, v₂ = v₁ + 50",
                "m₂ = m₁, v₂ = v₁",
                "m₂ = m₁ + 50, v₂ < v₁"
            ],
            correct: 0, // A
            marks: 4
        }
    ],

    Physics: [
        {
            id: 46,
            text: "Door mass M, bullet m embeds at distance x. Angular speed ω?",
            options: [
                "Linear with x",
                "Linear with x (Formula B)",
                "Cubic with x",
                "Constant"
            ],
            correct: 1, // B
            marks: 4
        },
        {
            id: 47,
            text: "SHM mass m, period T, Energy E. Max acceleration?",
            options: [
                "Formula A",
                "Formula B (2π/T * √(2E/m))",
                "Formula C",
                "Formula D"
            ],
            correct: 1, // B
            marks: 4
        },
        {
            id: 48,
            text: "Athlete runs, accels 2s to 9m/s, constant, then decels (half magnitude). Total 12s. Distance?",
            options: [
                "81 m",
                "108 m",
                "90 m",
                "72 m"
            ],
            correct: 1, // B
            marks: 4
        },
        {
            id: 49,
            text: "Capacitor C, linear expansion α. Change in C with temp ΔT?",
            options: [
                "2α ΔT C",
                "α ΔT C",
                "-α ΔT C",
                "-2α ΔT C"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 50,
            text: "Charges on 2µF and 4µF capacitors in the circuit?<br><br>[Image: RC Circuit with 12V battery, resistors 2k/4k, capacitors 2µF/4µF]",
            options: [
                "8 µC and 8 µC",
                "18 µC and 18 µC",
                "16/3 µC and 8/3 µC",
                "8/3 µC and 16/3 µC"
            ],
            correct: 3, // D
            marks: 4
        },
        {
            id: 51,
            text: "Point charge +q moving v=v k̂ in E and B fields. Relation?",
            options: [
                "Eₓ = vB_y, E_y = -vBₓ",
                "Eₓ = -vBₓ, E_y = -vB_y",
                "Eₓ = -vB_y, E_y = vBₓ",
                "Eₓ = vBₓ, E_y = vB_y"
            ],
            correct: 2, // C
            marks: 4
        },
        {
            id: 52,
            text: "Charges q, -2q, 3q, 4q on tetrahedron vertices, 5q at center. Total electrostatic energy?",
            options: [
                "-15 q² / (4π ε₀ L)",
                "15 q² / (4π ε₀ L)",
                "-30 q² / (4π ε₀ L)",
                "30 q² / (4π ε₀ L)"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 53,
            text: "Half life 2000 hours. Time to decay 2/3 of nuclei?",
            options: [
                "3170 hours",
                "3000 hours",
                "1170 hours",
                "2830 hours"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 54,
            text: "Logic gate circuit: XOR(1,P), AND(1,Q), into NAND. Output 0. Inputs?<br><br>[Image: Logic Gate Diagram: XOR inputs 1,P; AND inputs 1,Q; both feeding NAND]",
            options: [
                "P=0, Q=1",
                "P=0, Q=0",
                "P=1, Q=0",
                "P=1, Q=1"
            ],
            correct: 1, // B
            marks: 4
        },
        {
            id: 55,
            text: "Photoelectric effect. Energy 5x Work Function. Work Function in terms of de Broglie λ_B?",
            options: [
                "h² / (8 m_e λ_B²)",
                "h² / (10 m_e λ_B²)",
                "h² / (12 m_e λ_B²)",
                "h² / (4 m_e λ_B²)"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 56,
            text: "Ambulance 20m/s emits 540Hz. Car approaches 20m/s. Change in frequency?",
            options: [
                "127.5 Hz",
                "128.8 Hz",
                "135.5 Hz",
                "72.0 Hz"
            ],
            correct: 1, // B
            marks: 4
        },
        {
            id: 57,
            text: "YDSE λ=600nm. I₀ at path diff 600nm. Intensity at path diff 100nm?",
            options: [
                "3/4 I₀",
                "1/4 I₀",
                "1/2 I₀",
                "√3/2 I₀"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 58,
            text: "Mixture of O₂ and N₂ at 27°C. Relation?",
            options: [
                "RMS O₂ < RMS N₂",
                "Avg KE O₂ < Avg KE N₂",
                "Avg KE O₂ > Avg KE N₂",
                "RMS O₂ > RMS N₂"
            ],
            correct: 0, // A
            marks: 4
        },
        {
            id: 59,
            text: "Objects A and B (T_A > T_B). Specific heat increases with Temp. Final T?",
            options: [
                "T > (T_A+T_B)/2",
                "T > T_A",
                "T = (T_A+T_B)/2",
                "T < (T_A+T_B)/2"
            ],
            correct: 3, // D
            marks: 4
        },
        {
            id: 60,
            text: "Which expression has dimension of electrical resistance?",
            options: [
                "h / e²",
                "e² / h",
                "h e",
                "h / e"
            ],
            correct: 0, // A
            marks: 4
        }
    ]
};

// [REST OF THE JAVASCRIPT CODE - EXAM ENGINE REMAINS THE SAME]
let currentSection = 'Biology';
let currentQuestionIndex = 0;
let answers = {};
let markedForReview = {};
let visited = {};
let timeLeft = 10800;
let timerInterval = null;
let userName = 'Student';
let violations = 0;

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    const beginBtn = document.getElementById('beginTestBtn');
    if (beginBtn) beginBtn.addEventListener('click', startExam);

    document.querySelectorAll('.section-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });

    const markBtn = document.getElementById('markReviewBtn');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveNextBtn');
    const submitBtn = document.getElementById('submitExamBtn');

    if (markBtn) markBtn.addEventListener('click', toggleMarkForReview);
    if (clearBtn) clearBtn.addEventListener('click', clearResponse);
    if (saveBtn) saveBtn.addEventListener('click', saveAndNext);
    if (submitBtn) submitBtn.addEventListener('click', submitExam);

    const agreeTerms = document.getElementById('agreeTerms');
    const beginTestBtn = document.getElementById('beginTestBtn');
    
    if (agreeTerms && beginTestBtn) {
        beginTestBtn.disabled = !agreeTerms.checked;
        agreeTerms.addEventListener('change', function() {
            beginTestBtn.disabled = !this.checked;
        });
    }

    const nameInput = document.getElementById('candidateName');
    if (nameInput) {
        nameInput.addEventListener('change', function() {
            userName = this.value || 'Student';
        });
    }
}

function startExam() {
    const instructionPage = document.getElementById('instructionPage');
    const examInterface = document.getElementById('examInterface');
    
    if (instructionPage) instructionPage.style.display = 'none';
    if (examInterface) examInterface.style.display = 'block';

    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = userName;

    loadQuestion();
    updatePalette();
    startTimer();
    updateSectionCounts();
}

function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) autoSubmitExam();
    }, 1000);
}

function updateTimerDisplay() {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    
    const display = `Time Left : ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const timerEl = document.getElementById('timerDisplay');
    if (timerEl) timerEl.textContent = display;
}

function loadQuestion() {
    const questions = questionBank[currentSection];
    const question = questions[currentQuestionIndex];
    const questionKey = `${currentSection}-${currentQuestionIndex}`;

    visited[questionKey] = true;

    const qNumEl = document.getElementById('questionNumberDisplay');
    if (qNumEl) qNumEl.textContent = `Question No. ${currentQuestionIndex + 1}`;

    const qTextEl = document.getElementById('questionContent');
    if (qTextEl) qTextEl.innerHTML = `<p class="question-text">${question.text}</p>`;

    const optionsContainer = document.getElementById('optionsContainer');
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-item';
            if (answers[questionKey] === index) optionDiv.classList.add('selected');
            
            optionDiv.innerHTML = `
                <input type="radio" name="question" value="${index}" ${answers[questionKey] === index ? 'checked' : ''}>
                <span class="option-text"><strong>(${String.fromCharCode(97 + index)})</strong> ${option}</span>
            `;
            
            optionDiv.addEventListener('click', function() { selectAnswer(index); });
            optionsContainer.appendChild(optionDiv);
        });
    }

    const sectionTitleEl = document.getElementById('sectionTitle');
    if (sectionTitleEl) sectionTitleEl.textContent = currentSection;

    updatePalette();
}

function selectAnswer(optionIndex) {
    const questionKey = `${currentSection}-${currentQuestionIndex}`;
    answers[questionKey] = optionIndex;
    
    document.querySelectorAll('.option-item').forEach((item, index) => {
        if (index === optionIndex) {
            item.classList.add('selected');
            item.querySelector('input').checked = true;
        } else {
            item.classList.remove('selected');
            item.querySelector('input').checked = false;
        }
    });
    
    updatePalette();
    updateSectionCounts();
}

function switchSection(section) {
    currentSection = section;
    currentQuestionIndex = 0;
    
    document.querySelectorAll('.section-tab').forEach(tab => {
        if (tab.getAttribute('data-section') === section) tab.classList.add('active');
        else tab.classList.remove('active');
    });
    
    loadQuestion();
}

function toggleMarkForReview() {
    const questionKey = `${currentSection}-${currentQuestionIndex}`;
    markedForReview[questionKey] = !markedForReview[questionKey];
    updatePalette();
    saveAndNext();
}

function clearResponse() {
    const questionKey = `${currentSection}-${currentQuestionIndex}`;
    delete answers[questionKey];
    loadQuestion();
    updateSectionCounts();
}

function saveAndNext() {
    const questions = questionBank[currentSection];
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
}

function updatePalette() {
    const paletteEl = document.getElementById('questionPalette');
    if (!paletteEl) return;
    
    paletteEl.innerHTML = '';
    const questions = questionBank[currentSection];
    
    questions.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.className = 'palette-btn';
        btn.textContent = index + 1;
        
        const questionKey = `${currentSection}-${index}`;
        
        if (index === currentQuestionIndex) btn.classList.add('current');
        
        if (markedForReview[questionKey]) btn.classList.add('marked');
        else if (answers[questionKey] !== undefined) btn.classList.add('answered');
        else if (visited[questionKey]) btn.classList.add('not-answered');
        else btn.classList.add('not-visited');
        
        btn.addEventListener('click', () => {
            currentQuestionIndex = index;
            loadQuestion();
        });
        
        paletteEl.appendChild(btn);
    });
}

function updateSectionCounts() {
    const sections = ['Biology', 'Chemistry', 'Mathematics', 'Physics'];
    
    sections.forEach(section => {
        let answered = 0;
        const questions = questionBank[section];
        
        questions.forEach((_, index) => {
            const key = `${section}-${index}`;
            if (answers[key] !== undefined) answered++;
        });
        
        const countEl = document.getElementById(`${section.toLowerCase()}Count`);
        if (countEl) countEl.textContent = answered;
    });
}

function submitExam() {
    if (confirm('Are you sure you want to submit the exam?')) autoSubmitExam();
}

function autoSubmitExam() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    const results = calculateScore();
    showResults(results);
}

function calculateScore() {
    let totalScore = 0;
    let maxScore = 0;
    let totalAttempted = 0;
    let totalCorrect = 0;
    let totalQuestions = 0;
    let sectionBreakdown = {};

    Object.keys(questionBank).forEach(section => {
        const qArr = questionBank[section];
        const marksPerQuestion = 4;
        
        sectionBreakdown[section] = {
            obtained: 0,
            max: qArr.length * marksPerQuestion,
            attempted: 0,
            correctCount: 0,
            totalQuestions: qArr.length
        };

        qArr.forEach((q, idx) => {
            totalQuestions++;
            maxScore += marksPerQuestion;
            const key = `${section}-${idx}`;
            const ans = answers[key];
            
            if (ans !== undefined && ans !== null) {
                totalAttempted++;
                sectionBreakdown[section].attempted++;
                
                if (ans === q.correct) {
                    totalCorrect++;
                    totalScore += marksPerQuestion;
                    sectionBreakdown[section].obtained += marksPerQuestion;
                    sectionBreakdown[section].correctCount++;
                } else {
                    totalScore -= 1;
                    sectionBreakdown[section].obtained -= 1;
                }
            }
        });
    });

    return {
        totalScore,
        maxScore,
        totalAttempted,
        totalCorrect,
        totalQuestions,
        sectionBreakdown
    };
}

function showResults(results) {
    const examInterface = document.getElementById('examInterface');
    if (!examInterface) {
        alert(`Exam Submitted!\n\nTotal Score: ${results.totalScore}/${results.maxScore}\nAttempted: ${results.totalAttempted}/${results.totalQuestions}\nCorrect: ${results.totalCorrect}`);
        return;
    }

    examInterface.innerHTML = `
        <div style="max-width: 900px; margin: 50px auto; padding: 30px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #2563eb; text-align: center; margin-bottom: 30px;">Exam Results</h1>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #334155;">Overall Performance</h2>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div style="background: white; padding: 15px; border-radius: 6px;">
                        <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Total Score</div>
                        <div style="font-size: 28px; font-weight: bold; color: ${results.totalScore >= 0 ? '#10b981' : '#ef4444'};">${results.totalScore} / ${results.maxScore}</div>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px;">
                        <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Attempted</div>
                        <div style="font-size: 28px; font-weight: bold; color: #2563eb;">${results.totalAttempted} / ${results.totalQuestions}</div>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px;">
                        <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Correct Answers</div>
                        <div style="font-size: 28px; font-weight: bold; color: #10b981;">${results.totalCorrect}</div>
                    </div>
                </div>
            </div>

            <h2 style="color: #334155; margin-bottom: 20px;">Section-wise Breakdown</h2>
            <table style="width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <thead>
                    <tr style="background: #f1f5f9;">
                        <th style="text-align: left; padding: 15px; border-bottom: 2px solid #e2e8f0; color: #475569;">Section</th>
                        <th style="text-align: right; padding: 15px; border-bottom: 2px solid #e2e8f0; color: #475569;">Score</th>
                        <th style="text-align: right; padding: 15px; border-bottom: 2px solid #e2e8f0; color: #475569;">Max Score</th>
                        <th style="text-align: right; padding: 15px; border-bottom: 2px solid #e2e8f0; color: #475569;">Attempted</th>
                        <th style="text-align: right; padding: 15px; border-bottom: 2px solid #e2e8f0; color: #475569;">Correct</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.keys(results.sectionBreakdown).map(section => {
                        const s = results.sectionBreakdown[section];
                        return `
                            <tr>
                                <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${section}</td>
                                <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e2e8f0; color: ${s.obtained >= 0 ? '#10b981' : '#ef4444'}; font-weight: 500;">${s.obtained}</td>
                                <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e2e8f0;">${s.max}</td>
                                <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e2e8f0;">${s.attempted} / ${s.totalQuestions}</td>
                                <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e2e8f0;">${s.correctCount}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>

            <div style="text-align: center; margin-top: 40px;">
                <button onclick="location.reload()" style="background: #2563eb; color: white; padding: 12px 30px; border: none; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">
                    Start New Exam
                </button>
            </div>
        </div>
    `;
}

console.log('Exam 2021 initialized successfully!');