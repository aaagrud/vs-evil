// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// Import the commands from your new file. The './' is important.
const myCommands = require('./funcs/commands.js');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vs-evil" is now active!');

    // Register the command using the imported function from commands.js
    const disposable = vscode.commands.registerCommand('vs-evil.helloWorld', myCommands.showHelloWorld);

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
};