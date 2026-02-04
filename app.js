// --- 1. CONFIGURATION & STATE ---
let apiKey = "AIzaSyCJKB7q4tYyeud_2p-FnJLz3WWwkHHhJMo"; // Will be set by user input

// --- 2. EVENT LISTENERS (REAL-TIME UPDATES) ---
// When user types in inputs, update the Resume Preview immediately
const inputs = ['fullName', 'role', 'contact', 'summary', 'experience', 'skills'];
inputs.forEach(id => {
    document.getElementById(id).addEventListener('input', (e) => {
        document.getElementById(`prev-${id}`).innerText = e.target.value || `Your ${id} will appear here...`;
    });
});

document.getElementById('apiKeyInput').addEventListener('change', (e) => {
    apiKey = e.target.value;
    alert("API Key saved for this session!");
});

// --- 3. THE ATS SCORING ENGINE (LOGIC) ---
const atsCriteria = {
    criticalKeywords: [
        "Embedded Systems", "IoT", "Arduino", "Python", "C++", 
        "PCB Design", "Automation", "Robotics", "Microcontrollers", 
        "Data Analysis", "React", "JavaScript", "Engineering"
    ],
    sections: ["Education", "Experience", "Skills", "Summary"]
};

function calculateATSScore(text) {
    let score = 0;
    let feedback = [];

    // Rule A: Word Count (Optimal: 200-1000 words)
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 150 && wordCount < 1000) {
        score += 15;
    } else {
        feedback.push("⚠️ Resume length is too short. Aim for 200+ words.");
    }

    // Rule B: Email & Phone Check
    if (/@/.test(text)) score += 10;
    else feedback.push("❌ Missing Email Address.");
    
    if (/[0-9]{10,}/.test(text)) score += 10;
    else feedback.push("❌ Missing Phone Number.");

    // Rule C: Keyword Matching
    let keywordsFound = 0;
    atsCriteria.criticalKeywords.forEach(kw => {
        if (new RegExp(kw, "i").test(text)) keywordsFound++;
    });
    
    if (keywordsFound >= 5) score += 40;
    else {
        score += (keywordsFound * 8); // Partial points
        feedback.push(`⚠️ Low Keyword Density. Found only ${keywordsFound} tech keywords.`);
    }

    // Rule D: Impact Metrics (% or Numbers)
    const metrics = text.match(/(\d+%|\$\d+|\d+\+)/g);
    if (metrics && metrics.length >= 2) {
        score += 25;
    } else {
        score += 10;
        feedback.push("💡 Tip: Add numbers to your bullets (e.g., 'Improved by 20%').");
    }

    return { score, feedback };
}

function runATSCheck() {
    // 1. Gather all text
    const fullText = inputs.map(id => document.getElementById(id).value).join(" ");
    
    // 2. Run Algorithm
    const result = calculateATSScore(fullText);
    
    // 3. Update UI
    const resultCard = document.getElementById('ats-result');
    const scoreNum = document.getElementById('score-number');
    const feedList = document.getElementById('score-feedback');
    
    resultCard.style.display = 'block';
    scoreNum.innerText = result.score;
    
    // Color Coding
    if(result.score >= 80) scoreNum.style.color = "#28a745"; // Green
    else if(result.score >= 50) scoreNum.style.color = "#ffc107"; // Orange
    else scoreNum.style.color = "#dc3545"; // Red

    // Clear old feedback and add new
    feedList.innerHTML = "";
    if (result.feedback.length === 0) {
        feedList.innerHTML = "<li>✅ Excellent! Your resume is well optimized.</li>";
    } else {
        result.feedback.forEach(item => {
            const li = document.createElement('li');
            li.innerText = item;
            feedList.appendChild(li);
        });
    }
}

// --- 4. AI OPTIMIZATION (GEMINI API) ---
async function optimizeSection(sectionId) {
    if (!apiKey) {
        alert("⚠️ Please paste your Gemini API Key in the top right box first!");
        document.getElementById('apiKeyInput').focus();
        return;
    }

    const textArea = document.getElementById(sectionId);
    const originalText = textArea.value;
    
    if (originalText.length < 10) {
        alert("Please write something first so AI can improve it.");
        return;
    }

    const btn = document.querySelector(`button[onclick="optimizeSection('${sectionId}')"]`);
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Thinking...`;
    btn.disabled = true;

    // Prompt Engineering
    const prompt = `You are a Resume Expert. Rewrite the following text to be professional, action-oriented, and concise (max 50 words). Use strong verbs. Text: "${originalText}"`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const newText = data.candidates[0].content.parts[0].text.trim();

        // Typewriter effect for the new text
        textArea.value = newText;
        document.getElementById(`prev-${sectionId}`).innerText = newText;
        
        // Flash effect
        textArea.style.backgroundColor = "#e8f5e9";
        setTimeout(() => textArea.style.backgroundColor = "white", 1000);

    } catch (error) {
        console.error(error);
        alert("AI Error: Could not connect. Check your API Key.");
    } finally {
        btn.innerHTML = originalBtnText;
        btn.disabled = false;
    }
}

// --- 5. PDF DOWNLOAD ---
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
    document.getElementById('builder').scrollIntoView({ behavior: 'smooth' });
}