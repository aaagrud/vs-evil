const vscode = require('vscode');
const sharedState = require('./state'); // Import the shared state

/**
 * Registers a listener that punishes the user for pasting text.
 * @returns {vscode.Disposable} The disposable object for the event listener.
 */
function registerPastePunisher() {
    return vscode.workspace.onDidChangeTextDocument(event => {
        // ADD THIS CHECK: Ignore changes if the flag is true.
        if (sharedState.isModifyingProgrammatically) {
            return;
        }

        const isPasteOperation = event.contentChanges.some(change => {
            return change.rangeLength === 0 && change.text.trim().length > 1;
        });

        if (isPasteOperation) {
            vscode.window.showInformationMessage('Pasting... 🤔');
            
            setTimeout(() => {
                vscode.window.showWarningMessage('Punishment Delivered! 😈');
                vscode.commands.executeCommand('undo');
                vscode.commands.executeCommand('undo');
            }, 3000);
        }
    });
}

module.exports = {
    registerPastePunisher
};