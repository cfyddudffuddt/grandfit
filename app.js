// 1. configuration
const API_KEY = "AIzaSyCJKB7q4tYyeud_2p-FnJLz3WWwkHHhJMo"; // ⚠️ Replace this with your actual key!

// 2. Real-time Preview Updates
document.getElementById('fullName').addEventListener('input', (e) => {
    document.getElementById('prev-name').innerText = e.target.value || "Your Name";
});
document.getElementById('role').addEventListener('input', (e) => {
    document.getElementById('prev-role').innerText = e.target.value || "Target Role";
});
document.getElementById('summary').addEventListener('input', (e) => {
    document.getElementById('prev-summary').innerText = e.target.value || "Your professional summary will appear here.";
});
document.getElementById('experience').addEventListener('input', (e) => {
    document.getElementById('prev-experience').innerText = e.target.value || "Your experience...";
});

// 3. The Real AI Function
async function simulateAI() {
    const summaryInput = document.getElementById('summary');
    const originalText = summaryInput.value;
    const btn = document.querySelector('.ai-btn');

    // Basic Validation
    if (originalText.length < 10) {
        alert("Please write a little more text first!");
        return;
    }

    // UI Loading State
    btn.innerText = "✨ Optimizing... (Please Wait)";
    btn.disabled = true;

    // The Prompt for Gemini
    const prompt = `You are an expert Resume Writer. Rewrite the following professional summary to be ATS-friendly, punchy, and professional. Use action verbs. Keep it under 50 words. \n\nOriginal Text: "${originalText}"`;

    try {
        // Call Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();
        
        // Extract the AI's answer
        const newText = data.candidates[0].content.parts[0].text;

        // Update the UI
        summaryInput.value = newText.trim();
        document.getElementById('prev-summary').innerText = newText.trim();
        alert("✅ Optimization Complete!");

    } catch (error) {
        console.error("Error:", error);
        alert("AI Error: Check console for details (or check your API Key quota).");
    } finally {
        // Reset Button
        btn.innerText = "✨ AI Optimize";
        btn.disabled = false;
    }
}

// 4. PDF Download Function
function downloadPDF() {
    const element = document.getElementById('print-area');
    const opt = {
        margin:       0.5,
        filename:     'GradFit_Resume.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

function scrollToBuilder() {
    document.getElementById('builder').scrollIntoView({behavior: 'smooth'});
}