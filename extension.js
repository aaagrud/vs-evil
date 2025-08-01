const vscode = require('vscode');
const { getFunkyCode } = require('./funcs/variableName');
const { getBoredCode } = require('./funcs/bored');
const { registerPastePunisher } = require('./funcs/punishment');
const { registerCodeShortener } = require('./funcs/codeShortener'); // Import the new function
const sharedState = require('./funcs/state');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    console.log('VS Evil is Ready to Go!');

    let apiKey = await context.secrets.get('geminiApiKey');
    if (!apiKey) {
        apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Google Gemini API Key to power EVIL',
            placeHolder: 'Enter key here',
            ignoreFocusOut: true,
        });
        if (apiKey) {
            await context.secrets.store('geminiApiKey', apiKey);
            vscode.window.showInformationMessage('Gemini API Key saved! EVIL powered up.');
        } else {
            vscode.window.showErrorMessage('Gemini API Key not provided. EVIL is sad.');
        }
    }

    // --- FEATURE 1: Funkify Variables on Save ---
    const onSaveDisposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (!apiKey || sharedState.isModifyingProgrammatically) {
            return;
        }
        // ... (rest of the function is unchanged)
        const originalCode = document.getText();
        if (!originalCode.trim()) {
            return;
        }
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Ohh man, boring variable names? I can help with that",
            cancellable: false
        }, async (progress) => {
            const funkyCode = await getFunkyCode(originalCode, apiKey);
            if (!funkyCode) {
                vscode.window.showErrorMessage('Evil is napping, come back later!');
                return;
            }
            sharedState.isModifyingProgrammatically = true;
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(originalCode.length)
            );
            edit.replace(document.uri, fullRange, funkyCode);
            await vscode.workspace.applyEdit(edit);
            await document.save();
            sharedState.isModifyingProgrammatically = false; 
        });
    });
    context.subscriptions.push(onSaveDisposable);

    // --- FEATURE 2: Punish User on Paste ---
    const onPasteDisposable = registerPastePunisher();
    context.subscriptions.push(onPasteDisposable);

    // --- FEATURE 3: Boredom Detection & Code Mayhem ---
    let inactivityTimeout;
    const INACTIVITY_LIMIT = 12 * 1000; // 12 seconds

    async function onBored() {
        // ... (rest of the function is unchanged)
        const editor = vscode.window.activeTextEditor;
        if (!editor || sharedState.isModifyingProgrammatically) return; // Added check for safety
        const document = editor.document;
        const originalCode = document.getText();
        if (!originalCode.trim()) return;

        vscode.window.showInformationMessage("Oh, you're bored cause your code is boring? Let's spice it up!");
        sharedState.isModifyingProgrammatically = true;
        const boredCode = await getBoredCode(originalCode, apiKey);
        if (!boredCode) {
            vscode.window.showErrorMessage('Evil is napping, come back later!');
            sharedState.isModifyingProgrammatically = false;
            return;
        }
        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(originalCode.length)
        );
        edit.replace(document.uri, fullRange, boredCode);
        await vscode.workspace.applyEdit(edit);
        await document.save();
        sharedState.isModifyingProgrammatically = false;
    }

    function resetInactivityTimer() {
        if (inactivityTimeout) clearTimeout(inactivityTimeout);
        inactivityTimeout = setTimeout(onBored, INACTIVITY_LIMIT);
    }

    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(resetInactivityTimer),
        vscode.window.onDidChangeActiveTextEditor(resetInactivityTimer),
        vscode.workspace.onDidChangeTextDocument(resetInactivityTimer)
    );
    resetInactivityTimer();

    // --- FEATURE 4: Aggressively Shorten Long Files (NEW) ---
    const onLongFileDisposable = registerCodeShortener();
    context.subscriptions.push(onLongFileDisposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};