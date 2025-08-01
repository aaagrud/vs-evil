const funnyTodos = [
    "Refactor this later. Or maybe never.",
    "I'm not sure why this works, but it does. Don't touch it.",
    "This is a temporary solution, unless it works.",
    "Add more comments here. Or better variable names. Or both.",
    "Magic number detected. Do not question the magic.",
    "This code is a bit of a mess. Blame the previous developer. (It was me).",
    "Needs more cowbell.",
    "Sometimes I just want to give up and become a goat farmer.",
    "Is this code self-aware yet?",
    "If you're reading this, you're too close.",
    "I've sacrificed a rubber duck to the coding gods for this to work.",
    "This function is holding the entire project together with duct tape and hope.",
    "Why did I write this? What does it do? Who am I?",
    "Remove this before the code review.",
    "Future me, please forgive past me for this.",
    "I was told to add comments. This is a comment."
];

/**
 * Gets a random funny TODO message.
 * @returns {string} A funny TODO string.
 */
function getRandomTodo() {
    const randomIndex = Math.floor(Math.random() * funnyTodos.length);
    return funnyTodos[randomIndex];
}

module.exports = { getRandomTodo };