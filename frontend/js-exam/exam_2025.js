'use strict';

// --- DATA: IISER 2025 QUESTIONS ---
const questionBank = {
    Biology: [
        { id: 1, text: "Match entries: P. Notochord... Q. Ectoparasite...", options: ["P-iv; Q-ii; R-i; S-iii", "P-iv; Q-i; R-ii; S-iii", "P-iii; Q-i; R-ii; S-iv", "P-i; Q-iii; R-ii; S-iv"], correct: 1 },
        { id: 2, text: "Chromosomes classification based on position of?", options: ["Centrosome", "Centriole", "Telomere", "Centromere"], correct: 3 },
        { id: 3, text: "Which describes a triglyceride?", options: ["3 glycerol + 1 fatty acid", "3 fatty acids + 1 glycerol", "3 saturated fatty acids + cholesterol", "3 glycerides + phospholipid"], correct: 1 },
        { id: 4, text: "Plant carotenoid statement FALSE?", options: ["Accumulates in chromoplasts", "Protects chlorophyll a", "Absorbs light 600-700 nm", "Precursor for stress hormone"], correct: 2 },
        { id: 5, text: "Mitochondria treated with Chemical X and Y. ATP order?", options: ["Exp 2 < Exp 1 < Exp 3", "Exp 1 < Exp 2 < Exp 3", "All equal", "Exp 2 < Exp 1 = Exp 3"], correct: 0 }
    ],
    Chemistry: [
        { id: 1, text: "Acidic/Basic nature of ZnO and CaO?", options: ["ZnO basic, CaO amphoteric", "Both amphoteric", "ZnO amphoteric, CaO basic", "ZnO acidic, CaO basic"], correct: 2 },
        { id: 2, text: "Bond order increase, no magnetic change?", options: ["i and ii", "ii and iii", "iii only", "ii only"], correct: 3 },
        { id: 3, text: "Value of E°(Fe3+/Fe0)?", options: ["-0.04 V", "0.33 V", "0.11 V", "-0.11 V"], correct: 0 },
        { id: 4, text: "Order of stability?", options: ["VCl5 > VF5", "VF5 > VCl5; CuCl2 > CuI2", "VCl5 > VF5; CuI2", "VF5 > VCl5; CuI2"], correct: 1 },
        { id: 5, text: "CrCl3 reaction isomerism?", options: ["Both P Q geom", "P geom, high wavelength", "Q geom, high wavelength", "P geom, low wavelength"], correct: 1 }
    ],
    Mathematics: [
        { id: 1, text: "3-digit numbers divisible by 5, no repeat?", options: ["128", "144", "162", "136"], correct: 3 },
        { id: 2, text: "Matrix A symmetric values of x?", options: ["2", "infinite", "1", "4"], correct: 2 },
        { id: 3, text: "Sum series n divisible by?", options: ["5", "6", "8", "9"], correct: 0 },
        { id: 4, text: "f(x)=cos(tan^-1 x) decreasing on?", options: ["R", "x<0", "x>0", "(-1,1)"], correct: 2 },
        { id: 5, text: "Set A for determinant inequality?", options: ["(-2, 2]", "(-2, 2)", "[-2, 2)", "[-2, 2]"], correct: 0 }
    ],
    Physics: [
        { id: 1, text: "Elastic collision graph?", options: ["Graph B", "Graph A", "Graph D", "Graph C"], correct: 1 },
        { id: 2, text: "Max compression spring bullet?", options: ["sqrt(mv/k)", "sqrt(Mv/k)", "sqrt(m^2v^2/k(M+m))", "sqrt(mMv/k)"], correct: 2 },
        { id: 3, text: "Cart loop quantity not role?", options: ["h1", "h2", "R", "M"], correct: 3 },
        { id: 4, text: "Disk torque angular displacement?", options: ["wMR/8T", "wMR/4T", "-wMR/4T", "-wMR/8T"], correct: 1 },
        { id: 5, text: "Black body T increase 1%, Vol increase?", options: ["0.75%", "0.50%", "1.56%", "6.25%"], correct: 0 }
    ]
};

// --- APP LOGIC ---
let currentSection = 'Biology';
let currentQIndex = 0;
let answers = {};
let marked = {};
let visited = {};
let timeLeft = 10800;
let timerInterval;

document.addEventListener('DOMContentLoaded', initExam);

function initExam() {
    // Buttons
    document.getElementById('beginTestBtn').onclick = startTest;
    
    // Tab Switching
    document.querySelectorAll('.section-tab').forEach(btn => {
        btn.onclick = () => switchSection(btn.dataset.section);
    });

    // Actions
    document.getElementById('saveNextBtn').onclick = saveAndNext;
    document.getElementById('markReviewBtn').onclick = markReview;
    document.getElementById('clearBtn').onclick = clearResponse;
    document.getElementById('submitExamBtn').onclick = showSubmitModal;
    
    // Modals
    document.getElementById('cancelSubmitBtn').onclick = () => document.getElementById('submitModal').style.display = 'none';
    document.getElementById('confirmSubmitBtn').onclick = submitFinal;

    // Helper Nav
    window.nextQuestion = () => { if(currentQIndex < questionBank[currentSection].length-1) { currentQIndex++; loadQuestion(); }};
    window.prevQuestion = () => { if(currentQIndex > 0) { currentQIndex--; loadQuestion(); }};
}

function startTest() {
    document.getElementById('instructionPage').style.display = 'none';
    document.getElementById('examInterface').style.display = 'block';
    
    document.getElementById('userNameDisplay').innerText = document.getElementById('candidateName').value;
    
    // Start Timer
    timerInterval = setInterval(() => {
        timeLeft--;
        const h = Math.floor(timeLeft/3600).toString().padStart(2,'0');
        const m = Math.floor((timeLeft%3600)/60).toString().padStart(2,'0');
        const s = (timeLeft%60).toString().padStart(2,'0');
        document.getElementById('timerDisplay').innerText = `Time Left : ${h}:${m}:${s}`;
        if(timeLeft <= 0) submitFinal();
    }, 1000);

    loadQuestion();
    updateCounts();
}

function switchSection(sec) {
    currentSection = sec;
    currentQIndex = 0;
    document.querySelectorAll('.section-tab').forEach(b => b.classList.toggle('active', b.dataset.section === sec));
    document.getElementById('sectionTitle').innerText = sec;
    loadQuestion();
}

function loadQuestion() {
    const qData = questionBank[currentSection][currentQIndex];
    const key = `${currentSection}-${currentQIndex}`;
    
    // Mark Visited
    visited[key] = true;

    // Render
    document.getElementById('questionNumberDisplay').innerText = currentQIndex + 1;
    document.getElementById('questionContent').innerHTML = `<div class="question-text">${qData.text}</div>`;
    
    let html = '';
    qData.options.forEach((opt, idx) => {
        const isChecked = answers[key] === idx ? 'checked' : '';
        const isSelected = answers[key] === idx ? 'selected' : '';
        html += `
            <div class="option-item ${isSelected}" onclick="selectOpt(${idx})">
                <input type="radio" name="opt" ${isChecked}>
                <span>${opt}</span>
            </div>`;
    });
    document.getElementById('optionsContainer').innerHTML = html;

    updatePalette();
    updateCounts(); // Updates Sidebar Numbers
}

function selectOpt(idx) {
    const key = `${currentSection}-${currentQIndex}`;
    answers[key] = idx;
    
    // Visual update
    const opts = document.querySelectorAll('.option-item');
    opts.forEach((el, i) => {
        if(i === idx) { el.classList.add('selected'); el.querySelector('input').checked = true; }
        else { el.classList.remove('selected'); el.querySelector('input').checked = false; }
    });
    updateCounts();
}

function saveAndNext() {
    // Logic: If answered, it stays answered. 
    // Just move next
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
    grid.innerHTML = '';
    
    questionBank[currentSection].forEach((_, idx) => {
        const key = `${currentSection}-${idx}`;
        const btn = document.createElement('button');
        btn.innerText = idx + 1;
        btn.className = 'palette-btn';
        
        // Colors
        if (answers[key] !== undefined && marked[key]) btn.classList.add('answered-marked'); // Ans & Marked
        else if (marked[key]) btn.classList.add('marked'); // Purple
        else if (answers[key] !== undefined) btn.classList.add('answered'); // Green
        else if (visited[key]) btn.classList.add('not-answered'); // Red
        else btn.classList.add('not-visited'); // Grey

        if (idx === currentQIndex) btn.style.border = "2px solid black"; // Current Highlight

        btn.onclick = () => { currentQIndex = idx; loadQuestion(); };
        grid.appendChild(btn);
    });
}

// *** THIS WAS MISSING IN YOUR PREVIOUS CODE ***
function updateCounts() {
    let ans = 0, notAns = 0, notVis = 0, mark = 0, ansMark = 0;
    let sectionAns = 0;

    // Calculate Global Counts
    Object.keys(questionBank).forEach(sec => {
        questionBank[sec].forEach((_, idx) => {
            const key = `${sec}-${idx}`;
            
            // Section specific count for header tabs
            if(sec === currentSection && answers[key] !== undefined) sectionAns++;

            if (!visited[key]) {
                notVis++;
            } else if (answers[key] !== undefined && marked[key]) {
                ansMark++;
            } else if (marked[key]) {
                mark++;
            } else if (answers[key] !== undefined) {
                ans++;
            } else {
                notAns++;
            }
        });
        // Update header tab counts (optional, but good)
        const tabCount = document.getElementById(`${sec.toLowerCase()}Count`);
        if(tabCount) {
             let secTotal = 0;
             questionBank[sec].forEach((_, i) => { if(answers[`${sec}-${i}`] !== undefined) secTotal++; });
             tabCount.innerText = secTotal;
        }
    });

    // Update Sidebar Legend
    document.getElementById('legendAnswered').innerText = ans;
    document.getElementById('legendNotAnswered').innerText = notAns;
    document.getElementById('legendNotVisited').innerText = notVis;
    document.getElementById('legendMarked').innerText = mark;
    document.getElementById('legendAnsMarked').innerText = ansMark;
}

function showSubmitModal() {
    let html = '<ul>';
    Object.keys(questionBank).forEach(sec => {
        let att = 0;
        questionBank[sec].forEach((_, i) => { if(answers[`${sec}-${i}`]!==undefined) att++; });
        html += `<li>${sec}: ${att} / ${questionBank[sec].length} attempted</li>`;
    });
    html += '</ul>';
    document.getElementById('submissionSummary').innerHTML = html;
    document.getElementById('submitModal').style.display = 'flex';
}

function submitFinal() {
    clearInterval(timerInterval);
    // Simple alert result for now (match logic to your preference)
    let score = 0;
    Object.keys(questionBank).forEach(sec => {
        questionBank[sec].forEach((q, i) => {
            if(answers[`${sec}-${i}`] === q.correct) score += 4;
            else if(answers[`${sec}-${i}`] !== undefined) score -= 1;
        });
    });
    alert(`Exam Submitted!\nYour Score: ${score}`);
    location.reload();
}
