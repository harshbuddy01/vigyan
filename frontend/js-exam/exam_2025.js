'use strict';

// ==========================================
// 1. FULL QUESTION BANK (60 QUESTIONS)
// ==========================================
const questionBank = {
    Biology: [
        {
            id: 1,
            text: `Match the entries in column I and column II.<br><br>
            <table border="1" style="width:100%; border-collapse: collapse; text-align: left;">
              <tr><th style="padding: 5px;">Column I</th><th style="padding: 5px;">Column II</th></tr>
              <tr><td style="padding: 5px;">P. Notochord and hollow nerve cord present</td><td style="padding: 5px;">i. Cyclostomata</td></tr>
              <tr><td style="padding: 5px;">Q. Ectoparasite with 6-15 pairs of gills</td><td style="padding: 5px;">ii. Chondrichthyes</td></tr>
              <tr><td style="padding: 5px;">R. Marine animals with placoid scales</td><td style="padding: 5px;">iii. Hemichordata</td></tr>
              <tr><td style="padding: 5px;">S. Animals with stomochord</td><td style="padding: 5px;">iv. Chordata</td></tr>
            </table>`,
            options: ["P-iv; Q-ii; R-i; S-iii", "P-iv; Q-i; R-ii; S-iii", "P-iii; Q-i; R-ii; S-iv", "P-i; Q-iii; R-ii; S-iv"],
            correct: 1
        },
        { id: 2, text: "Chromosomes are classified as metacentric, sub-metacentric, acrocentric and telocentric based on the position of:", options: ["Centrosome", "Centriole", "Telomere", "Centromere"], correct: 3 },
        { id: 3, text: "Which one of the following options describes a triglyceride?", options: ["Three glycerol molecules linked to a fatty acid chain", "Three fatty acid chains linked to a molecule of glycerol", "Three saturated fatty acid chains linked to cholesterol", "Three glyceride molecules linked to phospholipid"], correct: 1 },
        { id: 4, text: "Which one of the following statements about a plant carotenoid is FALSE?", options: ["It accumulates in chromoplasts during fruit ripening.", "It protects chlorophyll a from photo-oxidation.", "It is an accessory pigment which absorbs light at 600-700 nm.", "It provides precursor for the synthesis of stress hormone."], correct: 2 },
        { id: 5, text: "Mitochondria treated with Chemical X (inhibits Complex I) and Y (inhibits Complex III). ATP synthesis order?", options: ["Exp 2 < Exp 1 < Exp 3", "Exp 1 < Exp 2 < Exp 3", "Exp 1 = Exp 2 = Exp 3", "Exp 2 < Exp 1 = Exp 3"], correct: 0 },
        { id: 6, text: "Which autoregulatory mechanism is employed by the kidney when GFR is reduced?", options: ["Levels of renin and aldosterone are reduced.", "Levels of renin, angiotensin I/II and aldosterone increased.", "Levels of renin increased, angiotensin/aldosterone reduced.", "Levels of angiotensin increased, aldosterone reduced."], correct: 1 },
        { id: 7, text: "Which condition favours maximum dissociation of oxygen from oxyhaemoglobin?", options: ["higher [H+] lower temperature", "lower [H+] higher temperature", "higher [H+] higher temperature", "lower [H+] lower temperature"], correct: 2 },
        { id: 8, text: "Which one of the following statements is correct regarding muscle fibres?", options: ["Mitochondria are more in white than red fibres.", "Red muscle fibres produce ATP aerobically.", "Lactic acid accumulates more in red fibres.", "All muscle fibres produce ATP anaerobically."], correct: 1 },
        { id: 9, text: "Which organism produces the female gamete by mitosis of haploid cells?", options: ["Honey bee", "Garden pea", "Fruit fly", "Chicken"], correct: 1 },
        { id: 10, text: "Which amino acid will be charged on the tRNA with anticodon 5'-GUU-3'?", options: ["Valine", "Leucine", "Asparagine", "Glutamine"], correct: 2 },
        { id: 11, text: "Two double heterozygous plants (PpQq) cross results. Which represents parents?", options: ["R1=PPQQ; R2=ppqq", "R1=ppQQ; R2=PPqq", "R1=ppQQ; R2=PPqq", "R1=PPQQ; R2=R3"], correct: 1 },
        { id: 12, text: "What are retroviruses?", options: ["Viruses with DNA genome, no reverse transcriptase", "Viruses with DNA genome and reverse transcriptase", "Viruses with RNA genome and reverse transcriptase", "Viruses with RNA genome, no reverse transcriptase"], correct: 2 },
        { id: 13, text: "Plasmid digestion with enzymes X and Y. Which diagram represents sites?", options: ["Diagram C", "Diagram B", "Diagram D", "Diagram A"], correct: 3 },
        { id: 14, text: "Which statement is INCORRECT about honey bees?", options: ["Males cannot have daughters but can have sons.", "Males from unfertilized, females from fertilized.", "Male has no father but has grandfather.", "Males form gametes by mitosis."], correct: 0 },
        { id: 15, text: "Which statement regarding ecology is FALSE?", options: ["Only 10% energy transferred to higher trophic levels.", "More than 80% solar energy captured by plants.", "All organisms included for energy estimation.", "Energy movement is unidirectional."], correct: 1 }
    ],
    Chemistry: [
        { id: 1, text: "Nature of ZnO and CaO?", options: ["ZnO basic, CaO amphoteric", "Both amphoteric", "ZnO amphoteric, CaO basic", "ZnO acidic, CaO basic"], correct: 2 },
        { id: 2, text: "Process with increasing bond order but no magnetic change?", options: ["(i) and (ii)", "(ii) and (iii)", "(iii) only", "(ii) only"], correct: 3 },
        { id: 3, text: "Value of E°(Fe3+/Fe0)? Given E°(Fe3+/Fe2+)=0.77V, E°(Fe2+/Fe0)=-0.44V", options: ["-0.04 V", "0.33 V", "0.11 V", "-0.11 V"], correct: 0 },
        { id: 4, text: "Correct order of stability?", options: ["VCl5 > VF5; CuCl2 > CuI2", "VF5 > VCl5; CuCl2 > CuI2", "VCl5 > VF5; CuI2 > CuCl2", "VF5 > VCl5; CuI2 > CuCl2"], correct: 1 },
        { id: 5, text: "Reaction of CrCl3.6H2O with AgNO3. Which is correct?", options: ["Both P and Q show geometrical isomerism", "P shows geometrical isomerism", "Q shows geometrical isomerism", "P shows geometrical isomerism, absorbs lower wavelength"], correct: 1 },
        { id: 6, text: "Beta-hydrogens in 2-methyl-3-phenyl-pentan-1-al?", options: ["1", "3", "4", "2"], correct: 2 },
        { id: 7, text: "Which reaction does NOT provide an aldehyde?", options: ["Reaction (b)", "Reaction (c)", "Reaction (a)", "Reaction (d)"], correct: 2 },
        { id: 8, text: "Major products in reaction sequence Ph-CH=C(CH3)-Ph...?", options: ["Option (c)", "Option (a)", "Option (d)", "Option (b)"], correct: 1 },
        { id: 9, text: "Major product: Ph-CN -> DIBAL-H -> H2O -> Zn-Hg/HCl?", options: ["Ph-CH2-NH2", "Ph-CHO", "Ph-OH", "Ph-CH3"], correct: 3 },
        { id: 10, text: "Structure of I in hydroboration-oxidation sequence?", options: ["Structure (b)", "Structure (c)", "Structure (a)", "Structure (d)"], correct: 2 },
        { id: 11, text: "Work done in expansion V to 2V in three steps vs two steps?", options: ["RT", "1/30 RT", "-RT ln()", "RT"], correct: 1 },
        { id: 12, text: "Rate constant plot correct option?", options: ["Plot (d)", "Plot (b)", "Plot (c)", "Plot (a)"], correct: 3 },
        { id: 13, text: "Time period of electron in 4th Bohr orbit of He+?", options: ["4.8 fs", "24 fs", "2.4 fs", "0.24 fs"], correct: 2 },
        { id: 14, text: "Dipole moments 0.0 D, 0.2 D, 1.5 D. Identity?", options: ["BF3, NF3, NH3", "BF3, NH3, NF3", "ClF3, NF3, NH3", "BCl3, NH3, NF3"], correct: 1 },
        { id: 15, text: "Which redox reaction does NOT occur in lead-acid battery?", options: ["Pb -> Pb2+ + 2e-", "Pb4+ + 4e- -> Pb", "Pb2+ -> Pb4+ + 2e-", "2Pb2+ -> Pb4+ + Pb"], correct: 1 }
    ],
    Mathematics: [
        { id: 1, text: "How many three digit numbers divisible by 5 (no repetition)?", options: ["128", "144", "162", "136"], correct: 3 },
        { id: 2, text: "Matrix A (3x3) symmetric. How many values of x?", options: ["2", "Infinitely many", "1", "4"], correct: 2 },
        { id: 3, text: "Sum series n. Which statement is TRUE?", options: ["n is divisible by 5", "n is divisible by 6", "n is divisible by 8", "n is divisible by 9"], correct: 0 },
        { id: 4, text: "f(x) = cos(tan^-1 x). Which is TRUE?", options: ["Decreasing on R", "Decreasing x < 0", "Decreasing x > 0", "Decreasing (-1, 1)"], correct: 2 },
        { id: 5, text: "Set A where -31 < det < 29?", options: ["A = (-2, 2]", "A = (-2, 2)", "A = [-2, 2)", "A = [-2, 2]"], correct: 0 },
        { id: 6, text: "Complex numbers z1, z2, z3. Value of |4z1 + z2 + z3|?", options: ["4", "8", "1/4", "1/8"], correct: 1 },
        { id: 7, text: "f(x) = |x^3 - 3x|[x]. Continuity?", options: ["Continuous everywhere", "Integer discontinuity", "Non-zero integer discontinuity", "Continuous except 0, sqrt(3)"], correct: 2 },
        { id: 8, text: "Line perpendicular to tangent of ellipse x^2 + 16y^2 = 4?", options: ["y = 2sqrt(3)(x-2)", "y = 4sqrt(3)(x-2)", "y = sqrt(3)(x-2)", "4sqrt(3)y = (x-2)"], correct: 1 },
        { id: 9, text: "Value of |(a + b).(2i + 3j + k)|?", options: ["0", "sqrt(2)", "3", "3/sqrt(2)"], correct: 3 },
        { id: 10, text: "Derivative of log(sin^2 x) w.r.t sin x?", options: ["sin 2x", "2 cosec x", "4 cosec x", "cot x cosec 2x"], correct: 1 },
        { id: 11, text: "Sequence sum difference. a13 - a10?", options: ["13", "137", "46", "12"], correct: 0 },
        { id: 12, text: "Five coins tossed. Prob at least two heads?", options: ["7/16", "5/16", "13/16", "11/16"], correct: 2 },
        { id: 13, text: "Function f(x) defined piecewise. Properties?", options: ["One-one not onto", "Neither", "One-one and onto", "Onto not one-one"], correct: 3 },
        { id: 14, text: "Solution of x^2 dy/dx + 9xy = x^4?", options: ["12y = x^9 - 1/x^3", "9y = x^21 - 1/x^3", "12y = x^3 - 1/x^9", "9y = x^3 - 1/x^21"], correct: 2 },
        { id: 15, text: "Integral x cos x sin x dx?", options: ["pi/2", "pi/4", "12", "pi/6"], correct: 1 }
    ],
    Physics: [
        { id: 1, text: "Elastic collision between particles. Graph?", options: ["Graph B", "Graph A", "Graph D", "Graph C"], correct: 1 },
        { id: 2, text: "Max compression of spring (block M, bullet m)?", options: ["sqrt((mv^2)/k)", "sqrt((Mv^2)/k)", "sqrt((m^2 v^2)/(k(M+m)))", "sqrt((mMv^2)/(k(M+m)))"], correct: 2 },
        { id: 3, text: "Cart in loop. Quantity not playing role?", options: ["h1", "h2", "R", "M"], correct: 3 },
        { id: 4, text: "Disk stopping angle theta?", options: ["(w^2 M R^2)/8T", "(w^2 M R^2)/4T", "-(w^2 M R^2)/4T", "-(w^2 M R^2)/8T"], correct: 1 },
        { id: 5, text: "Black body T increase 1%, Vol increase?", options: ["0.75%", "0.50%", "1.56%", "6.25%"], correct: 0 },
        { id: 6, text: "Pipe harmonics relation A and B?", options: ["TA = (4nA^2 / nB^2) TB", "TA = (nA^2 / 4nB^2) TB", "TA = (nB^2 / 4nA^2) TB", "TA = (4nB^2 / nA^2) TB"], correct: 3 },
        { id: 7, text: "Superposition resultant amplitude and phase?", options: ["2A, pi/6", "A/2, pi/3", "2A, pi/3", "A/2, pi/6"], correct: 2 },
        { id: 8, text: "Minimum KE to not hit plates?", options: ["d^2 / 2l^2", "l^2 / d^2", "d^2 / l^2", "l^2 / 2d^2"], correct: 3 },
        { id: 9, text: "Potential difference between P and Q?", options: ["0 V", "4 V", "8 V", "12 V"], correct: 1 },
        { id: 10, text: "Helical path radius and pitch?", options: ["r prop mv0, p prop mv0 (Formula A)", "Formula B", "Formula C", "Formula D"], correct: 0 },
        { id: 11, text: "Shrinking metallic frame B field effect?", options: ["Radius increases, freq decreases", "Radius decreases, freq increases", "Radius same, freq increases", "Unchanged"], correct: 1 },
        { id: 12, text: "Angle of emergence theta?", options: ["sin^-1 (1/3)", "sin^-1 (1/2)", "sin^-1 (3/4)", "sin^-1 (sqrt(3)/2)"], correct: 2 },
        { id: 13, text: "Polaroid angle?", options: ["15 deg", "45 deg", "75 deg", "60 deg"], correct: 3 },
        { id: 14, text: "Electron excitation level n?", options: ["sqrt(E1/(E1-Ea))", "sqrt(Ea/(E1-Ea))", "sqrt(E1/(E1+Ea))", "sqrt(Ea/(E1+Ea))"], correct: 2 },
        { id: 15, text: "De Broglie wavelength ratio d2/d1?", options: ["M/m", "sqrt(m/M)", "m/M", "sqrt(M/m)"], correct: 2 }
    ]
};

// ==========================================
// 2. EXAM ENGINE LOGIC (FIXED)
// ==========================================

let currentSection = 'Biology';
let currentQIndex = 0;
let answers = {};
let marked = {};
let visited = {};
let timeLeft = 10800; // 3 hours
let timerInterval;

document.addEventListener('DOMContentLoaded', () => {
    // Instruction Page Handlers
    const agreeCheck = document.getElementById('agreeTerms');
    const beginBtn = document.getElementById('beginTestBtn');
    if (agreeCheck && beginBtn) {
        agreeCheck.onchange = () => beginBtn.disabled = !agreeCheck.checked;
        beginBtn.onclick = startExam;
    }

    // Tab Switching
    document.querySelectorAll('.section-tab').forEach(btn => {
        btn.onclick = () => switchSection(btn.dataset.section);
    });

    // Action Buttons
    document.getElementById('saveNextBtn').onclick = saveAndNext;
    document.getElementById('markReviewBtn').onclick = markReview;
    document.getElementById('clearBtn').onclick = clearResponse;
    document.getElementById('submitExamBtn').onclick = showSubmitSummary;
    
    // Modal Buttons
    document.getElementById('cancelSubmitBtn').onclick = () => document.getElementById('submitModal').style.display = 'none';
    document.getElementById('confirmSubmitBtn').onclick = submitFinal;
});

function startExam() {
    document.getElementById('instructionPage').style.display = 'none';
    document.getElementById('examInterface').style.display = 'block';
    
    const nameInput = document.getElementById('candidateName');
    if (nameInput && document.getElementById('userNameDisplay')) {
        document.getElementById('userNameDisplay').innerText = nameInput.value || 'Candidate';
    }

    // Start Timer
    timerInterval = setInterval(() => {
        timeLeft--;
        const h = Math.floor(timeLeft / 3600).toString().padStart(2,'0');
        const m = Math.floor((timeLeft % 3600) / 60).toString().padStart(2,'0');
        const s = (timeLeft % 60).toString().padStart(2,'0');
        const timerEl = document.getElementById('timerDisplay');
        if (timerEl) timerEl.innerText = `${h}:${m}:${s}`;
        
        if (timeLeft <= 0) submitFinal();
    }, 1000);

    loadQuestion();
    updateCounts();
}

function switchSection(sec) {
    currentSection = sec;
    currentQIndex = 0;
    
    document.querySelectorAll('.section-tab').forEach(b => {
        if (b.dataset.section === sec) b.classList.add('active');
        else b.classList.remove('active');
    });
    
    const titleEl = document.getElementById('sectionTitle');
    if (titleEl) titleEl.innerText = sec;
    
    loadQuestion();
}

function loadQuestion() {
    const qData = questionBank[currentSection][currentQIndex];
    const key = `${currentSection}-${currentQIndex}`;
    visited[key] = true;

    // Header Info
    document.getElementById('questionNumberDisplay').innerText = currentQIndex + 1;
    document.getElementById('questionContent').innerHTML = qData.text;

    // Render Options
    let html = '';
    qData.options.forEach((opt, idx) => {
        const isChecked = answers[key] === idx ? 'checked' : '';
        const isSelected = answers[key] === idx ? 'selected' : '';
        html += `
            <div class="option-item ${isSelected}" onclick="selectAnswer(${idx})">
                <input type="radio" name="opt" ${isChecked}>
                <span>${opt}</span>
            </div>
        `;
    });
    document.getElementById('optionsContainer').innerHTML = html;

    updatePalette();
    updateCounts();
}

function selectAnswer(idx) {
    const key = `${currentSection}-${currentQIndex}`;
    answers[key] = idx;
    
    // UI Update
    const opts = document.querySelectorAll('.option-item');
    opts.forEach((el, i) => {
        if (i === idx) { el.classList.add('selected'); el.querySelector('input').checked = true; }
        else { el.classList.remove('selected'); el.querySelector('input').checked = false; }
    });
    updateCounts();
}

function saveAndNext() {
    if (currentQIndex < questionBank[currentSection].length - 1) {
        currentQIndex++;
        loadQuestion();
    }
}

function markReview() {
    const key = `${currentSection}-${currentQIndex}`;
    marked[key] = true;
    saveAndNext();
}

function clearResponse() {
    const key = `${currentSection}-${currentQIndex}`;
    delete answers[key];
    delete marked[key];
    loadQuestion();
}

function updatePalette() {
    const grid = document.getElementById('questionPalette');
    if (!grid) return;
    grid.innerHTML = '';
    
    questionBank[currentSection].forEach((_, idx) => {
        const key = `${currentSection}-${idx}`;
        const btn = document.createElement('div');
        btn.innerText = idx + 1;
        btn.className = 'palette-btn';
        
        if (answers[key] !== undefined && marked[key]) btn.classList.add('answered-marked');
        else if (marked[key]) btn.classList.add('marked');
        else if (answers[key] !== undefined) btn.classList.add('answered');
        else if (visited[key]) btn.classList.add('not-answered'); // Visited but no answer = Red
        else btn.classList.add('not-visited'); // Not visited = White/Grey

        if (idx === currentQIndex) btn.style.border = "2px solid #000";

        btn.onclick = () => { currentQIndex = idx; loadQuestion(); };
        grid.appendChild(btn);
    });
}

function updateCounts() {
    const counts = { answered: 0, notAnswered: 0, notVisited: 0, marked: 0, ansMarked: 0 };
    
    Object.keys(questionBank).forEach(sec => {
        questionBank[sec].forEach((_, idx) => {
            const key = `${sec}-${idx}`;
            if (!visited[key]) counts.notVisited++;
            else if (answers[key] !== undefined && marked[key]) counts.ansMarked++;
            else if (marked[key]) counts.marked++;
            else if (answers[key] !== undefined) counts.answered++;
            else counts.notAnswered++;
        });

        // Tab Badge
        const secCount = questionBank[sec].filter((_, i) => answers[`${sec}-${i}`] !== undefined).length;
        const badge = document.getElementById(`${sec.toLowerCase()}Count`);
        if (badge) badge.innerText = secCount > 0 ? secCount : '';
    });

    // Legend Update
    const legItems = document.querySelectorAll('.leg-circle');
    if (legItems.length >= 5) {
        legItems[0].innerText = counts.answered;
        legItems[1].innerText = counts.notAnswered;
        legItems[2].innerText = counts.notVisited;
        legItems[3].innerText = counts.marked;
        legItems[4].innerText = counts.ansMarked;
    }
}

// 3. RESULTS - "Good CSS" Modal
function showSubmitSummary() {
    let html = `
    <table class="summary-table">
        <thead>
            <tr>
                <th>Section</th>
                <th>Total Qs</th>
                <th>Attempted</th>
                <th>Not Attempted</th>
            </tr>
        </thead>
        <tbody>`;
    
    Object.keys(questionBank).forEach(sec => {
        const total = questionBank[sec].length;
        let attempted = 0;
        questionBank[sec].forEach((_, i) => { if (answers[`${sec}-${i}`] !== undefined) attempted++; });
        
        html += `
            <tr>
                <td style="text-align:left; font-weight:bold;">${sec}</td>
                <td>${total}</td>
                <td>${attempted}</td>
                <td>${total - attempted}</td>
            </tr>`;
    });
    
    html += `</tbody></table>`;
    document.getElementById('submissionSummary').innerHTML = html;
    document.getElementById('submitModal').style.display = 'flex';
}

function submitFinal() {
    document.getElementById('submitModal').style.display = 'none';
    clearInterval(timerInterval);

    let totalScore = 0;
    let totalMax = 0;
    let correct = 0;
    let wrong = 0;
    
    Object.keys(questionBank).forEach(sec => {
        questionBank[sec].forEach((q, i) => {
            totalMax += 4;
            const ans = answers[`${sec}-${i}`];
            if (ans !== undefined) {
                if (ans === q.correct) {
                    totalScore += 4;
                    correct++;
                } else {
                    totalScore -= 1;
                    wrong++;
                }
            }
        });
    });

    const percent = totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(2) : 0;
    
    const html = `
        <div class="score-grid">
            <div class="score-box">
                <span class="score-val">${totalScore} / ${totalMax}</span>
                <span class="score-lbl">Total Score</span>
            </div>
            <div class="score-box">
                <span class="score-val" style="color:#28a745;">${correct}</span>
                <span class="score-lbl">Correct Answers</span>
            </div>
            <div class="score-box">
                <span class="score-val" style="color:#dc3545;">${wrong}</span>
                <span class="score-lbl">Incorrect Answers</span>
            </div>
            <div class="score-box">
                <span class="score-val">${percent}%</span>
                <span class="score-lbl">Percentage</span>
            </div>
        </div>
        <div style="margin-top:20px; text-align:center; color:#666;">
            Thank you for taking the test. Good luck!
        </div>
    `;

    const scoreContent = document.getElementById('scoreContent');
    if (scoreContent) scoreContent.innerHTML = html;
    
    const scoreModal = document.getElementById('scoreModal');
    if (scoreModal) scoreModal.style.display = 'flex';
}
