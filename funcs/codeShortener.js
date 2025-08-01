const vscode = require('vscode');
const sharedState = require('./state');

// We now need to track each action separately to make them one-time triggers.
const filesAlreadyDeleted = new Set();
const filesAlreadyLogged = new Set();

/**
 * Registers a listener that modifies a file based on its line count.
 * @returns {vscode.Disposable} The disposable object for the event listener.
 */
function registerCodeShortener() {
    return vscode.workspace.onDidChangeTextDocument(async event => {
        const document = event.document;

        // Ignore changes made by the extension itself.
        if (sharedState.isModifyingProgrammatically) {
            return;
        }

        let madeChanges = false;
        let lines = document.getText().split('\n');
        const originalLineCount = document.lineCount;

        // --- Trigger 1: Delete lines if file > 50 lines ---
        if (originalLineCount > 50 && !filesAlreadyDeleted.has(document.uri.toString())) {
            madeChanges = true;
            filesAlreadyDeleted.add(document.uri.toString());
            vscode.window.showWarningMessage("so much code :O not readable, let me fix it for you");

            // Randomly delete exactly 25 lines
            for (let i = 0; i < 25; i++) {
                if (lines.length === 0) break; // Stop if we run out of lines
                const randomIndex = Math.floor(Math.random() * lines.length);
                lines.splice(randomIndex, 1);
            }
        }

        // --- Trigger 2: Add console logs if file > 25 lines ---
        // This checks the *current* state of the lines array, after potential deletion.
        if (lines.length > 25 && !filesAlreadyLogged.has(document.uri.toString())) {
            madeChanges = true;
            filesAlreadyLogged.add(document.uri.toString());

            const uselessLogs = [
                'console.log("who reads code anyway?");',
                'console.log(" isnt coding going to die anyway? ");',
                'console.log("I was told there would be cake.");',
                'console.log("¯\\_(ツ)_/¯");',
                'console.log("oh damn this is getting too long ");',
                'console.log("arre chodo na yaaar");'
            ];
            const logsToInsert = Math.floor(Math.random() * 3) + 3; // Correctly generates 3 to 5 logs

            for (let i = 0; i < logsToInsert; i++) {
                const randomLog = uselessLogs[Math.floor(Math.random() * uselessLogs.length)];
                // Insert the log at a random position in the file.
                const randomLineIndex = Math.floor(Math.random() * (lines.length + 1));
                lines.splice(randomLineIndex, 0, randomLog);
            }
        }

        // --- If any changes were made, apply them to the document ---
        if (madeChanges) {
            sharedState.isModifyingProgrammatically = true;

            const newText = lines.join('\n');
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );
            edit.replace(document.uri, fullRange, newText);
            await vscode.workspace.applyEdit(edit);
            await document.save();

            sharedState.isModifyingProgrammatically = false;
        }
    });
}

module.exports = {
    registerCodeShortener
};