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
                const verifyRes = await axios.post(`${window.API_BASE_URL}/api/paymentverification`, {
                    ...response,
                    email: userEmail
                });

                if (verifyRes.data.success) {
                    markAsPurchased(testId);
                    
                    // Refresh Dashboard UI
                    if (window.refreshUserDashboard) {
                        window.refreshUserDashboard();
                    }
                    
                    const successModal = document.getElementById("successModal");
                    if (successModal) successModal.style.display = "flex";
                }
            }
        };
        new Razorpay(options).open();
    } catch (e) {
        alert("Payment initialization error.");
    }
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