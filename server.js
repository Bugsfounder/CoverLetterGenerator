const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), debug: true });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Multer Setup (Memory Storage for processing immediately)
const upload = multer({ storage: multer.memoryStorage() });

// Google Gemini Setup
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY is not set in .env file!");
} else if (API_KEY === 'your_gemini_api_key_here') {
    console.error("CRITICAL ERROR: You are using the PLACEHOLDER API key. Please open .env and paste your real key.");
} else {
    console.log(`API Key loaded. Starts with: ${API_KEY.substring(0, 4)}... (Length: ${API_KEY.length})`);
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Debug PDF Library
console.log("PDF Library loaded. Type:", typeof pdf);

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/generate', upload.single('resume'), async (req, res) => {
    try {
        const { name, jobRole, company, skills } = req.body;
        let resumeText = '';

        // 1. Parse PDF if uploaded
        if (req.file) {
            console.log(`Processing file: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);

            if (req.file.mimetype !== 'application/pdf') {
                return res.status(400).json({ error: "Invalid file type. Please upload a PDF." });
            }

            try {
                const data = await pdf(req.file.buffer);
                resumeText = data.text;

                if (!resumeText || resumeText.trim().length === 0) {
                    console.warn("Warning: Parsed PDF text is empty.");
                } else {
                    console.log("PDF parsed successfully. Text length:", resumeText.length);
                }

                // Basic cleanup: remove extra newlines
                resumeText = resumeText.replace(/\n+/g, ' ').trim().substring(0, 3000);
            } catch (err) {
                console.error("PDF Parse Error Detail:", err);
                // Return exact error to help debug
                return res.status(500).json({ error: `Failed to parse resume PDF: ${err.message}` });
            }
        }

        // 2. Construct Prompt
        let prompt = `Write a professional cover letter for ${name} applying to the position of ${jobRole} at ${company}.`;

        if (skills) {
            prompt += `\nThey have the following key skills: ${skills}.`;
        }

        if (resumeText) {
            prompt += `\n\nHere is their resume text for reference to make it more personalized:\n"${resumeText}"`;
        }

        prompt += `\n\nRequirements:\n1. Keep it professional, engaging, and concise (under 400 words).\n2. Highlight how the skills match the role.\n3. Format with proper paragraph breaks.\n4. Do NOT include placeholders like [Date] or [Address] unless necessary, try to keep it ready-to-send.`;

        // 3. Generate Content using Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Send Response
        res.json({ coverLetter: text });

    } catch (error) {
        console.error("Generation Error:", error);
        res.status(500).json({ error: "Failed to generate cover letter. Ensure API Key is set and valid." });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

