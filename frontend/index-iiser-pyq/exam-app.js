// Professional Exam Application - JEE/IISER Style
'use strict';

// Global State
window.ExamApp = {
    currentSection: 'Biology',
    currentQuestionIndex: 0,
    answers: {},
    markedForReview: {},
    visited: {},
    timeLeft: 10800, // 3 hours in seconds
    timerInterval: null,
    userName: 'Candidate',
    examYear: '2025',
    questionBank: null
};

// Load exam data dynamically based on year
function loadExamData(year) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `../js-exam/exam_${year}.js`;
        
        script.onload = function() {
            // After loading, questionBank should be available
            if (typeof questionBank !== 'undefined') {
                window.ExamApp.questionBank = questionBank;
                resolve(questionBank);
            } else {
                reject(new Error('Question bank not found in exam script'));
            }
        };
        
        script.onerror = function() {
            reject(new Error(`Failed to load exam data for year ${year}`));
        };
        
        document.body.appendChild(script);
    });
}

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    setupInstructionPage();
});

// Setup Instruction Page
function setupInstructionPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const yearFromURL = urlParams.get('year');
    
    const yearSelect = document.getElementById('examYear');
    const beginBtn = document.getElementById('beginTestBtn');
    const agreeTerms = document.getElementById('agreeTerms');
    const candidateInput = document.getElementById('candidateName');
    
    // Auto-select year from URL
    if (yearFromURL && yearSelect) {
        window.ExamApp.examYear = yearFromURL;
        yearSelect.value = yearFromURL;
        updateExamTitles(yearFromURL);
    }
    
    // Update begin button state
    function updateBeginButton() {
        if (!candidateInput || !yearSelect || !agreeTerms || !beginBtn) return;
        
        const hasName = candidateInput.value.trim() !== '';
        const hasYear = yearSelect.value !== '';
        const agreedTerms = agreeTerms.checked;
        beginBtn.disabled = !(hasName && hasYear && agreedTerms);
    }
    
    if (yearSelect) {
        yearSelect.addEventListener('change', function() {
            window.ExamApp.examYear = this.value;
            updateBeginButton();
            updateExamTitles(this.value);
        });
    }
    
    if (candidateInput) {
        candidateInput.addEventListener('input', function() {
            window.ExamApp.userName = this.value.trim() || 'Candidate';
            updateBeginButton();
        });
    }
    
    if (agreeTerms) {
        agreeTerms.addEventListener('change', updateBeginButton);
    }
    
    if (beginBtn) {
        beginBtn.addEventListener('click', startExamProcess);
    }
    
    updateBeginButton();
}

// Update exam titles
function updateExamTitles(year) {
    const titles = [
        'examTitleHeader',
        'testNameDisplay',
        'statusDropdownTitle'
    ];
    
    titles.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = `IIN Aptitude Test Series ${year}`;
        }
    });
}

// Start Exam Process
async function startExamProcess() {
    const candidateInput = document.getElementById('candidateName');
    const yearSelect = document.getElementById('examYear');
    
    if (!candidateInput || !yearSelect) return;
    
    const candidateName = candidateInput.value.trim();
    const examYear = yearSelect.value;
    
    if (!candidateName) {
        alert('Please enter your name!');
        return;
    }
    
    if (!examYear) {
        alert('Please select an exam year!');
        return;
    }
    
    window.ExamApp.userName = candidateName;
    window.ExamApp.examYear = examYear;
    
    // Show loading
    const beginBtn = document.getElementById('beginTestBtn');
    if (beginBtn) {
        beginBtn.textContent = 'Loading exam...';
        beginBtn.disabled = true;
    }
    
    try {
        // Load exam data
        await loadExamData(examYear);
        
        // Hide instruction page
        const instructionPage = document.getElementById('instructionPage');
        if (instructionPage) {
            instructionPage.style.display = 'none';
        }
        
        // Show exam interface
        const examInterface = document.getElementById('examInterface');
        if (examInterface) {
            examInterface.style.display = 'block';
        }
        
        // Update user name display
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = candidateName;
        }
        
        // Initialize exam
        initializeExam();
        
    } catch (error) {
        console.error('Failed to start exam:', error);
        alert(`Error: ${error.message}. Please try another year or refresh the page.`);
        
        if (beginBtn) {
            beginBtn.textContent = 'I am ready to begin the test';
            beginBtn.disabled = false;
        }
    }
}

// Initialize Exam
function initializeExam() {
    setupExamEventListeners();
    loadQuestion();
    updateQuestionPalette();
    updateSectionCounts();
    startTimer();
    setupCalculator();
    
    // Mark first question as visited
    const questionKey = `${window.ExamApp.currentSection}-${window.ExamApp.currentQuestionIndex}`;
    window.ExamApp.visited[questionKey] = true;
}

// Setup Event Listeners
function setupExamEventListeners() {
    // Section tabs
    document.querySelectorAll('.section-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });
    
    // Action buttons
    const markReviewBtn = document.getElementById('markReviewBtn');
    const clearBtn = document.getElementById('clearBtn');
    const saveNextBtn = document.getElementById('saveNextBtn');
    const submitExamBtn = document.getElementById('submitExamBtn');
    
    if (markReviewBtn) {
        markReviewBtn.addEventListener('click', markForReviewAndNext);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearResponse);
    }
    
    if (saveNextBtn) {
        saveNextBtn.addEventListener('click', saveAndNext);
    }
    
    if (submitExamBtn) {
        submitExamBtn.addEventListener('click', showSubmitConfirmation);
    }
    
    // Calculator button
    const calcBtn = document.querySelector('.calculator-tab');
    if (calcBtn) {
        calcBtn.addEventListener('click', openCalculator);
    }
}

// Timer Functions
function startTimer() {
    updateTimerDisplay();
    
    window.ExamApp.timerInterval = setInterval(() => {
        window.ExamApp.timeLeft--;
        updateTimerDisplay();
        
        // Change color when time is running out
        const timerEl = document.getElementById('timerDisplay');
        if (window.ExamApp.timeLeft <= 300 && timerEl) { // Last 5 minutes
            timerEl.style.background = '#ef4444';
        }
        
        if (window.ExamApp.timeLeft <= 0) {
            autoSubmitExam();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const hours = Math.floor(window.ExamApp.timeLeft / 3600);
    const minutes = Math.floor((window.ExamApp.timeLeft % 3600) / 60);
    const seconds = window.ExamApp.timeLeft % 60;
    
    const display = `Time Left : ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const timerEl = document.getElementById('timerDisplay');
    if (timerEl) {
        timerEl.textContent = display;
    }
}

// Load Question
function loadQuestion() {
    if (!window.ExamApp.questionBank) {
        console.error('Question bank not loaded');
        return;
    }
    
    const questions = window.ExamApp.questionBank[window.ExamApp.currentSection];
    if (!questions || questions.length === 0) {
        console.error('No questions found for section:', window.ExamApp.currentSection);
        return;
    }
    
    const question = questions[window.ExamApp.currentQuestionIndex];
    const questionKey = `${window.ExamApp.currentSection}-${window.ExamApp.currentQuestionIndex}`;
    
    // Mark as visited
    window.ExamApp.visited[questionKey] = true;
    
    // Update question number
    const qNumEl = document.getElementById('questionNumberDisplay');
    if (qNumEl) {
        qNumEl.textContent = `Question No. ${window.ExamApp.currentQuestionIndex + 1}`;
    }
    
    // Update question text
    const qContentEl = document.getElementById('questionContent');
    if (qContentEl) {
        qContentEl.innerHTML = `<p class="question-text">${question.text}</p>`;
    }
    
    // Load options
    const optionsContainer = document.getElementById('optionsContainer');
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'option-btn';
            
            if (window.ExamApp.answers[questionKey] === index) {
                optionBtn.classList.add('selected');
            }
            
            optionBtn.innerHTML = `<strong>${String.fromCharCode(65 + index)}.</strong> ${option}`;
            
            optionBtn.addEventListener('click', function() {
                selectAnswer(index);
            });
            
            optionsContainer.appendChild(optionBtn);
        });
    }
    
    // Update section title in sidebar
    const sectionTitleEl = document.getElementById('sectionTitle');
    if (sectionTitleEl) {
        sectionTitleEl.textContent = window.ExamApp.currentSection;
    }
    
    // Update palette
    updateQuestionPalette();
    updateLegendCounts();
}

// Select Answer
function selectAnswer(optionIndex) {
    const questionKey = `${window.ExamApp.currentSection}-${window.ExamApp.currentQuestionIndex}`;
    window.ExamApp.answers[questionKey] = optionIndex;
    
    // Update option buttons UI
    document.querySelectorAll('.option-btn').forEach((btn, index) => {
        if (index === optionIndex) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
    
    updateQuestionPalette();
    updateSectionCounts();
    updateLegendCounts();
}

// Switch Section
function switchSection(section) {
    window.ExamApp.currentSection = section;
    window.ExamApp.currentQuestionIndex = 0;
    
    // Update active tab
    document.querySelectorAll('.section-tab').forEach(tab => {
        if (tab.getAttribute('data-section') === section) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    loadQuestion();
}

// Mark for Review and Next
function markForReviewAndNext() {
    const questionKey = `${window.ExamApp.currentSection}-${window.ExamApp.currentQuestionIndex}`;
    window.ExamApp.markedForReview[questionKey] = true;
    
    updateQuestionPalette();
    updateLegendCounts();
    saveAndNext();
}

// Clear Response
function clearResponse() {
    const questionKey = `${window.ExamApp.currentSection}-${window.ExamApp.currentQuestionIndex}`;
    delete window.ExamApp.answers[questionKey];
    delete window.ExamApp.markedForReview[questionKey];
    
    // Clear selected options
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    updateQuestionPalette();
    updateSectionCounts();
    updateLegendCounts();
}

// Save and Next
function saveAndNext() {
    const questions = window.ExamApp.questionBank[window.ExamApp.currentSection];
    
    if (window.ExamApp.currentQuestionIndex < questions.length - 1) {
        window.ExamApp.currentQuestionIndex++;
    } else {
        // Move to next section if available
        const sections = ['Biology', 'Chemistry', 'Mathematics', 'Physics'];
        const currentIndex = sections.indexOf(window.ExamApp.currentSection);
        
        if (currentIndex < sections.length - 1) {
            switchSection(sections[currentIndex + 1]);
            return;
        }
    }
    
    loadQuestion();
}

// Update Question Palette
function updateQuestionPalette() {
    const paletteEl = document.getElementById('questionPalette');
    if (!paletteEl || !window.ExamApp.questionBank) return;
    
    paletteEl.innerHTML = '';
    const questions = window.ExamApp.questionBank[window.ExamApp.currentSection];
    
    questions.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.className = 'palette-btn';
        btn.textContent = index + 1;
        
        const questionKey = `${window.ExamApp.currentSection}-${index}`;
        
        // Determine status classes
        if (index === window.ExamApp.currentQuestionIndex) {
            btn.classList.add('current');
        }
        
        const isAnswered = window.ExamApp.answers[questionKey] !== undefined;
        const isMarked = window.ExamApp.markedForReview[questionKey];
        const isVisited = window.ExamApp.visited[questionKey];
        
        if (isAnswered && isMarked) {
            btn.classList.add('answered-marked');
        } else if (isMarked) {
            btn.classList.add('marked');
        } else if (isAnswered) {
            btn.classList.add('answered');
        } else if (isVisited) {
            btn.classList.add('not-answered');
        } else {
            btn.classList.add('not-visited');
        }
        
        btn.addEventListener('click', () => {
            window.ExamApp.currentQuestionIndex = index;
            loadQuestion();
        });
        
        paletteEl.appendChild(btn);
    });
}

// Update Section Counts
function updateSectionCounts() {
    if (!window.ExamApp.questionBank) return;
    
    const sections = ['Biology', 'Chemistry', 'Mathematics', 'Physics'];
    
    sections.forEach(section => {
        let answered = 0;
        const questions = window.ExamApp.questionBank[section];
        
        questions.forEach((_, index) => {
            const key = `${section}-${index}`;
            if (window.ExamApp.answers[key] !== undefined) {
                answered++;
            }
        });
        
        const countEl = document.getElementById(`${section.toLowerCase()}Count`);
        if (countEl) {
            countEl.textContent = `(${answered})`;
        }
    });
}

// Update Legend Counts
function updateLegendCounts() {
    if (!window.ExamApp.questionBank) return;
    
    let answered = 0;
    let notAnswered = 0;
    let notVisited = 0;
    let marked = 0;
    let answeredMarked = 0;
    
    const sections = ['Biology', 'Chemistry', 'Mathematics', 'Physics'];
    
    sections.forEach(section => {
        const questions = window.ExamApp.questionBank[section];
        
        questions.forEach((_, index) => {
            const key = `${section}-${index}`;
            const isAnswered = window.ExamApp.answers[key] !== undefined;
            const isMarked = window.ExamApp.markedForReview[key];
            const isVisited = window.ExamApp.visited[key];
            
            if (isAnswered && isMarked) {
                answeredMarked++;
            } else if (isMarked) {
                marked++;
            } else if (isAnswered) {
                answered++;
            } else if (isVisited) {
                notAnswered++;
            } else {
                notVisited++;
            }
        });
    });
    
    // Update legend circles
    const legendItems = document.querySelectorAll('.legend-item');
    if (legendItems.length >= 5) {
        legendItems[0].querySelector('.legend-circle').textContent = answered;
        legendItems[1].querySelector('.legend-circle').textContent = notAnswered;
        legendItems[2].querySelector('.legend-circle').textContent = notVisited;
        legendItems[3].querySelector('.legend-circle').textContent = marked;
        legendItems[4].querySelector('.legend-circle').textContent = answeredMarked;
    }
}

// Calculator Functions
function setupCalculator() {
    const closeBtn = document.getElementById('closeCalcBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCalculator);
    }
}

function openCalculator() {
    const modal = document.getElementById('calculatorModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeCalculator() {
    const modal = document.getElementById('calculatorModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// Submit Functions
function showSubmitConfirmation() {
    const modal = document.getElementById('submitModal');
    if (!modal) return;
    
    // Calculate summary
    const summary = calculateSubmissionSummary();
    
    const summaryEl = document.getElementById('submissionSummary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <p><strong>Total Questions:</strong> ${summary.total}</p>
            <p><strong>Answered:</strong> ${summary.answered}</p>
            <p><strong>Not Answered:</strong> ${summary.notAnswered}</p>
            <p><strong>Marked for Review:</strong> ${summary.marked}</p>
            <p><strong>Not Visited:</strong> ${summary.notVisited}</p>
        `;
    }
    
    modal.classList.add('show');
    modal.style.display = 'flex';
    
    // Setup modal buttons
    const cancelBtn = document.getElementById('cancelSubmitBtn');
    const confirmBtn = document.getElementById('confirmSubmitBtn');
    
    if (cancelBtn) {
        cancelBtn.onclick = function() {
            modal.classList.remove('show');
            modal.style.display = 'none';
        };
    }
    
    if (confirmBtn) {
        confirmBtn.onclick = function() {
            modal.classList.remove('show');
            modal.style.display = 'none';
            finalSubmitExam();
        };
    }
}

function calculateSubmissionSummary() {
    let total = 0;
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let notVisited = 0;
    
    const sections = ['Biology', 'Chemistry', 'Mathematics', 'Physics'];
    
    sections.forEach(section => {
        const questions = window.ExamApp.questionBank[section];
        
        questions.forEach((_, index) => {
            total++;
            const key = `${section}-${index}`;
            const isAnswered = window.ExamApp.answers[key] !== undefined;
            const isMarked = window.ExamApp.markedForReview[key];
            const isVisited = window.ExamApp.visited[key];
            
            if (isAnswered) answered++;
            if (isMarked) marked++;
            if (isVisited && !isAnswered) notAnswered++;
            if (!isVisited) notVisited++;
        });
    });
    
    return { total, answered, notAnswered, marked, notVisited };
}

function finalSubmitExam() {
    // Stop timer
    if (window.ExamApp.timerInterval) {
        clearInterval(window.ExamApp.timerInterval);
    }
    
    // Calculate results
    const results = calculateResults();
    
    // Show results page
    showResultsPage(results);
}

function autoSubmitExam() {
    alert('Time is up! Your exam will be submitted automatically.');
    finalSubmitExam();
}

function calculateResults() {
    let totalScore = 0;
    let maxScore = 0;
    let totalAttempted = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalQuestions = 0;
    
    const sectionBreakdown = {};
    const sections = ['Biology', 'Chemistry', 'Mathematics', 'Physics'];
    
    sections.forEach(section => {
        const questions = window.ExamApp.questionBank[section];
        const marksPerQuestion = 4;
        const negativeMarks = -1;
        
        sectionBreakdown[section] = {
            obtained: 0,
            max: questions.length * marksPerQuestion,
            attempted: 0,
            correct: 0,
            incorrect: 0,
            totalQuestions: questions.length
        };
        
        questions.forEach((q, index) => {
            totalQuestions++;
            maxScore += marksPerQuestion;
            
            const key = `${section}-${index}`;
            const answer = window.ExamApp.answers[key];
            
            if (answer !== undefined) {
                totalAttempted++;
                sectionBreakdown[section].attempted++;
                
                if (answer === q.correct) {
                    totalCorrect++;
                    totalScore += marksPerQuestion;
                    sectionBreakdown[section].obtained += marksPerQuestion;
                    sectionBreakdown[section].correct++;
                } else {
                    totalIncorrect++;
                    totalScore += negativeMarks;
                    sectionBreakdown[section].obtained += negativeMarks;
                    sectionBreakdown[section].incorrect++;
                }
            }
        });
    });
    
    return {
        totalScore,
        maxScore,
        totalAttempted,
        totalCorrect,
        totalIncorrect,
        totalQuestions,
        sectionBreakdown,
        userName: window.ExamApp.userName,
        examYear: window.ExamApp.examYear,
        timeSpent: 10800 - window.ExamApp.timeLeft
    };
}

function showResultsPage(results) {
    const examInterface = document.getElementById('examInterface');
    if (!examInterface) return;
    
    const percentage = ((results.totalScore / results.maxScore) * 100).toFixed(2);
    const timeSpentMin = Math.floor(results.timeSpent / 60);
    const timeSpentSec = results.timeSpent % 60;
    
    examInterface.innerHTML = `
        <div style="max-width: 1000px; margin: 50px auto; padding: 40px; background: white; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 3px solid #e2e8f0;">
                <h1 style="color: #1e40af; font-size: 2.5rem; margin-bottom: 10px;">🎓 Exam Completed!</h1>
                <p style="color: #64748b; font-size: 1.1rem;">IIN Aptitude Test Series ${results.examYear}</p>
                <p style="color: #475569; font-size: 1rem; margin-top: 10px;">Candidate: <strong>${results.userName}</strong></p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; text-align: center; color: white; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                    <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 5px;">${results.totalScore}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Total Score</div>
                    <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 5px;">out of ${results.maxScore}</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 12px; text-align: center; color: white; box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);">
                    <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 5px;">${percentage}%</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Percentage</div>
                    <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 5px;">Score Percentage</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 25px; border-radius: 12px; text-align: center; color: white; box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);">
                    <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 5px;">${results.totalCorrect}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Correct</div>
                    <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 5px;">out of ${results.totalAttempted} attempted</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 25px; border-radius: 12px; text-align: center; color: white; box-shadow: 0 4px 15px rgba(250, 112, 154, 0.3);">
                    <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 5px;">${timeSpentMin}:${timeSpentSec.toString().padStart(2, '0')}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Time Spent</div>
                    <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 5px;">minutes</div>
                </div>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
                <h2 style="color: #334155; margin-bottom: 25px; font-size: 1.5rem;">📊 Performance Breakdown</h2>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; text-align: center;">
                    <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <div style="font-size: 2rem; font-weight: bold; color: #10b981; margin-bottom: 5px;">${results.totalCorrect}</div>
                        <div style="font-size: 0.85rem; color: #64748b;">Correct</div>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <div style="font-size: 2rem; font-weight: bold; color: #ef4444; margin-bottom: 5px;">${results.totalIncorrect}</div>
                        <div style="font-size: 0.85rem; color: #64748b;">Incorrect</div>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <div style="font-size: 2rem; font-weight: bold; color: #2563eb; margin-bottom: 5px;">${results.totalAttempted}</div>
                        <div style="font-size: 0.85rem; color: #64748b;">Attempted</div>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <div style="font-size: 2rem; font-weight: bold; color: #9e9e9e; margin-bottom: 5px;">${results.totalQuestions - results.totalAttempted}</div>
                        <div style="font-size: 0.85rem; color: #64748b;">Unattempted</div>
                    </div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); margin-bottom: 30px;">
                <div style="background: #1e40af; color: white; padding: 20px;">
                    <h2 style="margin: 0; font-size: 1.3rem;">📚 Subject-wise Performance</h2>
                </div>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f1f5f9;">
                            <th style="text-align: left; padding: 18px 20px; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0;">Subject</th>
                            <th style="text-align: center; padding: 18px 20px; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0;">Score</th>
                            <th style="text-align: center; padding: 18px 20px; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0;">Max</th>
                            <th style="text-align: center; padding: 18px 20px; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0;">Attempted</th>
                            <th style="text-align: center; padding: 18px 20px; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0;">Correct</th>
                            <th style="text-align: center; padding: 18px 20px; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0;">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.keys(results.sectionBreakdown).map((section, idx) => {
                            const s = results.sectionBreakdown[section];
                            const sectionPercent = ((s.obtained / s.max) * 100).toFixed(1);
                            const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                            
                            return `
                                <tr style="background: ${bgColor};">
                                    <td style="padding: 18px 20px; border-bottom: 1px solid #e2e8f0; font-weight: 500; color: #1e293b;">
                                        ${section}
                                    </td>
                                    <td style="padding: 18px 20px; text-align: center; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: ${s.obtained >= 0 ? '#10b981' : '#ef4444'}; font-size: 1.1rem;">
                                        ${s.obtained}
                                    </td>
                                    <td style="padding: 18px 20px; text-align: center; border-bottom: 1px solid #e2e8f0; color: #64748b;">
                                        ${s.max}
                                    </td>
                                    <td style="padding: 18px 20px; text-align: center; border-bottom: 1px solid #e2e8f0; color: #64748b;">
                                        ${s.attempted} / ${s.totalQuestions}
                                    </td>
                                    <td style="padding: 18px 20px; text-align: center; border-bottom: 1px solid #e2e8f0; color: #10b981; font-weight: 500;">
                                        ${s.correct}
                                    </td>
                                    <td style="padding: 18px 20px; text-align: center; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: ${sectionPercent >= 50 ? '#10b981' : '#ef4444'};">
                                        ${sectionPercent}%
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="text-align: center; margin-top: 40px;">
                <button onclick="location.reload()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s;">
                    🔄 Take Another Exam
                </button>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 0.9rem;">
                Thank you for taking the IIN Aptitude Test Series ${results.examYear}
            </div>
        </div>
    `;
}