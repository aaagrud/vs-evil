const vscode = require('vscode');
const { getFunkyCode } = require('./funcs/variableName');
const { registerPastePunisher } = require('./funcs/punishment');
const sharedState = require('./funcs/state'); // Import the shared state

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

            // SET THE FLAG before making any changes
            sharedState.isModifyingProgrammatically = true;
            
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(originalCode.length)
            );
            edit.replace(document.uri, fullRange, funkyCode);
            await vscode.workspace.applyEdit(edit);
            await document.save();

            // UNSET THE FLAG after all work is done
            sharedState.isModifyingProgrammatically = false; 
        });
    });
    context.subscriptions.push(onSaveDisposable);

    // --- FEATURE 2: Punish User on Paste ---
    const onPasteDisposable = registerPastePunisher();
    context.subscriptions.push(onPasteDisposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};