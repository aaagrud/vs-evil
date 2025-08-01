const vscode = require('vscode');
const sharedState = require('./state'); // Import the shared state

/**
 * Registers a listener that punishes the user for pasting text.
 * @returns {vscode.Disposable} The disposable object for the event listener.
 */
function registerPastePunisher(petSay) {
    return vscode.workspace.onDidChangeTextDocument(event => {
        if (sharedState.isModifyingProgrammatically) {
            return;
        }

        // Only punish if pasted text contains more than one line
        const pastedText = event.contentChanges
            .filter(change => change.rangeLength === 0 && change.text.trim().length > 0)
            .map(change => change.text)
            .join('');

        const lineCount = pastedText.split(/\r?\n/).length;

        if (lineCount > 1) {
            if (petSay) {
                petSay('Pasting... 🤔');
            } else {
                vscode.window.showInformationMessage('Pasting... 🤔');
            }
            setTimeout(() => {
                if (petSay) {
                    petSay('Write your own code bro! 😈');
                } else {
                    vscode.window.showWarningMessage('Write your own code bro! 😈');
                }
                vscode.commands.executeCommand('undo');
                vscode.commands.executeCommand('undo');
            }, 3000);
        }
    });
}

module.exports = {
    registerPastePunisher
};