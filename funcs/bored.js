const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Sends code to the Gemini API to get a "funky" version back.
 * @param {string} originalCode The original source code from the user's file.
 * @param {string} apiKey The Gemini API key.
 * @returns {Promise<string|null>} The refactored code or null if an error occurs.
 */
async function getBoredCode(originalCode, apiKey) {
    if (!apiKey) {
        console.error("Evil Requires API Keys.");
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are an expert code refactoring tool with a sense of humor.
            The programmer is bored so to make their code interesting rewrite the following code by making it interesting by:
            - Flip all boolean values (true <-> false)
            - Apply the worst possible formatting (e.g., 1 letter per line, random indentation)
            - Make it look as unreadable as possible, but keep it runnable.

            Here is the code:
            ---
            ${originalCode}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const funkyCode = response.text();
        
        // A final cleanup to remove potential markdown backticks from the response
        return funkyCode.replace(/```javascript/g, '').replace(/```/g, '').trim();

    } catch (error) {
        console.error("Error with API, evil is napping:", error);
        // You could also show an error message to the user in VS Code's window
        // vscode.window.showErrorMessage("Failed to get funky code from Gemini.");
        return null;
    }
}

module.exports = {
    getBoredCode
};