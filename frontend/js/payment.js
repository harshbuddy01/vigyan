// js/payment.js - Full Integration for Elite Exam Protocols

// Execute purchase (Main entry point)
async function executePurchase(testId, amount) {
    console.log("🔹 Purchase initiated for:", testId);
    
    // Store test info for modal context
    localStorage.setItem("tempTestId", testId);
    localStorage.setItem("tempAmount", amount);
    
    const userEmail = localStorage.getItem("userEmail");

    // Show modal to verify status even if email exists
    const emailModal = document.getElementById("emailModal");
    if (emailModal) {
        if (userEmail) {
            document.getElementById("modalUserEmail").value = userEmail;
        }
        emailModal.style.display = "flex";
    } else {
        alert("Please refresh the page.");
    }
}

// Handle email modal submission (INTEGRATED VERIFICATION)
async function handleModalSubmit() {
    const emailInput = document.getElementById("modalUserEmail");
    const rollInput = document.getElementById("modalRollNumber"); 
    
    const cleanEmail = emailInput.value.trim().toLowerCase();
    const rollNo = rollInput ? rollInput.value.trim() : null;

    if (!cleanEmail || !cleanEmail.includes("@")) {
        alert("Please enter a valid email address.");
        return;
    }

    try {
        // STEP 1: Deep Verification (Scenario 1, 2, and 3)
        const verifyRes = await axios.post(`${window.API_BASE_URL}/api/verify-user-full`, { 
            email: cleanEmail,
            rollNumber: rollNo 
        });

        const status = verifyRes.data.status;

        // Scenario 3: Email exists, but Roll Number is missing
        if (status === "EXISTING_USER_NEED_ROLL") {
            const rollGroup = document.getElementById("rollFieldGroup");
            if (rollGroup) {
                rollGroup.classList.remove("hidden");
                emailInput.disabled = true; 
                document.getElementById("modalActionBtn").innerText = "Verify & Pay";
                alert("Existing account found! Please enter your Roll Number to link this purchase.");
            }
            return;
        }

        // Scenario 3 Safety: Wrong Roll Number
        if (status === "WRONG_ROLL") {
            alert("Incorrect Roll Number! Please use the roll number sent to your email.");
            return;
        }

        // Scenario 1 & 2: New User or Verified Returning User
        if (status === "NEW_USER" || status === "VERIFIED") {
            localStorage.setItem("userEmail", cleanEmail);
            document.getElementById("emailModal").style.display = "none";

            const testId = localStorage.getItem("tempTestId");
            const amount = localStorage.getItem("tempAmount");

            startPayment(cleanEmail, testId, amount);
        }

    } catch (err) {
        alert("Verification failed. Please check your connection.");
        startPayment(cleanEmail, localStorage.getItem("tempTestId"), localStorage.getItem("tempAmount"));
    }
}

// Start Razorpay payment
async function startPayment(userEmail, testId, amount) {
    try {
        const { data: { key } } = await axios.get(`${window.API_BASE_URL}/api/getkey`);
        const { data: { order } } = await axios.post(`${window.API_BASE_URL}/api/checkout`, { amount, testId });
        
        const options = {
            key,
            amount: order.amount,
            currency: "INR",
            name: "IIN Education",
            description: `Unlock ${testId.toUpperCase()} Series`,
            order_id: order.id,
            prefill: { email: userEmail },
            theme: { color: "#3b82f6" },
            handler: async function (response) {
                // FIXED: Pass testId and amount to backend
                const verifyRes = await axios.post(`${window.API_BASE_URL}/api/paymentverification`, {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    email: userEmail,
                    testId: testId,  // FIXED: Added testId
                    amount: amount   // FIXED: Added amount
                });

                if (verifyRes.data.success) {
                    const rollNumber = verifyRes.data.rollNumber;
                    const isNewStudent = verifyRes.data.isNewStudent;
                    
                    // Save roll number to localStorage
                    localStorage.setItem("userRollNumber", rollNumber);
                    
                    markAsPurchased(testId);
                    
                    // Refresh Dashboard UI
                    if (window.refreshUserDashboard) {
                        window.refreshUserDashboard();
                    }
                    
                    // FIXED: Display Roll Number in success modal
                    displaySuccessModal(rollNumber, testId, isNewStudent);
                }
            }
        };
        new Razorpay(options).open();
    } catch (e) {
        console.error("Payment error:", e);
        alert("Payment initialization error.");
    }
}

// FIXED: New function to display Roll Number on screen
function displaySuccessModal(rollNumber, testId, isNewStudent) {
    // Create or update success modal with Roll Number
    let successModal = document.getElementById("successModal");
    
    if (!successModal) {
        // Create modal if it doesn't exist
        successModal = document.createElement("div");
        successModal.id = "successModal";
        successModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        document.body.appendChild(successModal);
    }
    
    successModal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 15px; max-width: 500px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            <div style="font-size: 60px; margin-bottom: 20px;">✅</div>
            <h2 style="color: #10b981; margin-bottom: 10px;">Payment Successful!</h2>
            <p style="color: #666; margin-bottom: 30px;">${isNewStudent ? 'Your Roll Number has been generated' : 'Payment confirmed'}</p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; margin-bottom: 20px;">
                <p style="color: white; font-size: 14px; margin-bottom: 10px; opacity: 0.9;">Your Roll Number</p>
                <h1 style="color: white; font-size: 42px; letter-spacing: 3px; margin: 0; font-family: 'Courier New', monospace;">${rollNumber}</h1>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #92400e; text-align: left;">
                    <strong>⚠️ Important:</strong> Save this Roll Number! It has been sent to <strong>${localStorage.getItem('userEmail')}</strong>
                </p>
            </div>
            
            <div style="background: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 14px; color: #065f46; text-align: left;">
                    <strong>✅ Test Purchased:</strong> ${testId.toUpperCase()} Test Series
                </p>
            </div>
            
            <button onclick="closeSuccessModal()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 15px 40px; border-radius: 25px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                Access Your Tests 🚀
            </button>
        </div>
    `;
    
    successModal.style.display = "flex";
}

// Close success modal
function closeSuccessModal() {
    const successModal = document.getElementById("successModal");
    if (successModal) {
        successModal.style.display = "none";
    }
    // Optionally redirect to test page
    // window.location.href = "signinpage.html";
}

// Mark test as purchased (update UI)
function markAsPurchased(testId) {
    const btn = document.getElementById(`btn-${testId}`);
    if (btn) {
        btn.innerHTML = "★ ACCESS GRANTED";
        btn.style.background = "#10b981";
        btn.onclick = () => window.location.href = `signinpage.html`;
    }

    const purchased = JSON.parse(localStorage.getItem("purchasedTests") || "[]");
    if (!purchased.includes(testId)) {
        purchased.push(testId);
        localStorage.setItem("purchasedTests", JSON.stringify(purchased));
    }
}

// Export for global access
window.PAYMENT = { executePurchase, startPayment, handleModalSubmit, markAsPurchased };
window.closeSuccessModal = closeSuccessModal;