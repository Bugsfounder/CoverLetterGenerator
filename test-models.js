const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        console.error("No API Key found.");
        return;
    }

    // Create client
    const genAI = new GoogleGenerativeAI(API_KEY);

    try {
        // Did not see a direct listModels on the main class in some versions, 
        // usually it's accessed via the API or model. 
        // But the SDK often exposes it via the GenAI instance or manually fetching.
        // Let's try the standard way if available, or just try a standard model prompt.

        console.log("Checking commonly available models...");

        const modelsToCheck = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.0-pro"];

        for (const modelName of modelsToCheck) {
            process.stdout.write(`Testing ${modelName}... `);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello, are you there?");
                const response = await result.response;
                console.log(`OK! (Response: ${response.text().trim()})`);
            } catch (error) {
                console.log(`FAILED (${error.status || error.message})`);
            }
        }

    } catch (err) {
        console.error("Error during test:", err);
    }
}

listModels();
