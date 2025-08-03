const vscode = require('vscode');

const { getFunkyCode } = require('./funcs/variableName');
const { getBoredCode } = require('./funcs/bored');
const { registerPastePunisher } = require('./funcs/punishment');
const { registerCodeShortener } = require('./funcs/codeShortener');
const { getRandomTodo } = require('./funcs/todo');
const sharedState = require('./funcs/state');


async function activate(context) {
    console.log('VS Evil is Ready to Go!');

   
    let petPanel = vscode.window.createWebviewPanel(
        'vsEvilPet',
        'VS Evil Pet',
        { viewColumn: vscode.ViewColumn.Two, preserveFocus: true },
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(context.extensionPath)]
        }
    );
    const petHtmlPath = vscode.Uri.file(require('path').join(context.extensionPath, 'petWebview.html'));
    const petHtml = require('fs').readFileSync(petHtmlPath.fsPath, 'utf8');
    petPanel.webview.html = petHtml;

    function petSay(text) {
        if (petPanel) {
            petPanel.webview.postMessage({ text });
        }
    }

    let apiKey = await context.secrets.get('geminiApiKey');
    if (!apiKey) {
        apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Google Gemini API Key to power EVIL',
            placeHolder: 'Enter key here',
            ignoreFocusOut: true,
        });
        if (apiKey) {
            await context.secrets.store('geminiApiKey', apiKey);
            petSay('Gemini API Key saved! EVIL powered up.');
        } else {
            petSay('Gemini API Key not provided. EVIL is sad.');
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
        petSay("Ohh man, boring variable names? I can help with that");
        const funkyCode = await getFunkyCode(originalCode, apiKey);
        if (!funkyCode) {
            petSay('Evil is napping, come back later!');
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
    context.subscriptions.push(onSaveDisposable);

    // --- FEATURE 2: Punish User on Paste ---
    // Patch: Make punishment pet-based if possible
    const onPasteDisposable = registerPastePunisher((msg) => petSay(msg));
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

        petSay("Oh, you're not coding? I'll do it for you!");
        sharedState.isModifyingProgrammatically = true;
        const boredCode = await getBoredCode(originalCode, apiKey);
        if (!boredCode) {
            petSay('Evil is napping, come back later!');
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

    // --- FEATURE 4: Aggressively Shorten Long Files ---
    // Patch: Make code shortener use petSay if it shows messages
    const onLongFileDisposable = registerCodeShortener((msg) => petSay(msg));
    context.subscriptions.push(onLongFileDisposable);
    // Ensure the timeout is cleared when the extension is deactivated
    context.subscriptions.push({
        dispose: () => {
            if (petPanel) petPanel.dispose();
        }
    });
}


function deactivate() {}

module.exports = {
    activate,
    deactivate
};