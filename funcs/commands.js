// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

/**
 * A command that shows an information message.
 */
function showHelloWorld(petSay) {
    // The code you place here will be executed every time your command is executed
    if (petSay) {
        petSay('Hello World from a funcs function!');
    } else {
        vscode.window.showInformationMessage('Hello World from a funcs  function!');
    }
}

// Export the function so it can be used in other files
module.exports = {
    showHelloWorld
};