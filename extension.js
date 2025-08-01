const vscode = require('vscode');
const { getFunkyCode } = require('./funcs/variableName');

// This flag prevents an infinite loop where saving triggers another save.
let isSaving = false;

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    console.log('VS Evil is Ready to Go!');

    // First, let's get and store the API key securely.
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
            return;
        }
    }

    // This is the main event listener that triggers on every file save.
    const onSaveDisposable = vscode.workspace.onDidSaveTextDocument(async (document) => {

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
            title: "Ohh man, boring variable names? I can help with that",
            cancellable: false
        }, async (progress) => {
            // 3. --- CALL GEMINI API ---
            const funkyCode = await getFunkyCode(originalCode, apiKey);
            
            if (!funkyCode) {
                vscode.window.showErrorMessage('Evil is napping, come back later!');
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