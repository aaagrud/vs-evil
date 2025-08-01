const vscode = require('vscode');
const { getFunkyCode } = require('./funcs/variableName');

// This flag prevents an infinite loop where saving triggers another save.
let isSaving = false;

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    console.log('Congratulations, your extension "funky-renamer" is now active!');

    // First, let's get and store the API key securely.
    let apiKey = await context.secrets.get('geminiApiKey');
    if (!apiKey) {
        apiKey = await vscode.window.showInputBox({
            prompt: 'Please enter your Google Gemini API Key',
            placeHolder: 'Enter your key here',
            ignoreFocusOut: true, // Keep the box open even if you click outside
        });

        if (apiKey) {
            await context.secrets.store('geminiApiKey', apiKey);
            vscode.window.showInformationMessage('Gemini API Key saved successfully!');
        } else {
            vscode.window.showErrorMessage('Gemini API Key not provided. The extension will not work.');
            return;
        }
    }

    // This is the main event listener that triggers on every file save.
    const onSaveDisposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
        // 1. --- PRE-CHECKS ---
        // Prevent running on files that are not JavaScript
        if (document.languageId !== 'javascript') {
            return;
        }

        // Prevent infinite save loop
        if (isSaving) {
            return;
        }

        // 2. --- GET THE CODE ---
        const originalCode = document.getText();
        if (!originalCode.trim()) {
            return; // Don't run on empty files
        }

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Funkifying your variables... ✨",
            cancellable: false
        }, async (progress) => {
            // 3. --- CALL GEMINI API ---
            const funkyCode = await getFunkyCode(originalCode, apiKey);
            
            if (!funkyCode) {
                vscode.window.showErrorMessage('Could not get refactored code from Gemini.');
                return;
            }

            // 4. --- REPLACE THE CODE IN THE EDITOR ---
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(originalCode.length)
            );
            edit.replace(document.uri, fullRange, funkyCode);

            // Apply the edit to the workspace
            await vscode.workspace.applyEdit(edit);
            
            // 5. --- SAVE THE MODIFIED FILE ---
            // Set the flag to true to prevent the onDidSaveTextDocument event from firing again
            isSaving = true;
            await document.save();
            // IMPORTANT: Reset the flag after saving is complete
            isSaving = false; 
        });
    });

    context.subscriptions.push(onSaveDisposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};