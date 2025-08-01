// This object will be shared across different files.
const sharedState = {
    // A flag to know when the extension is changing code by itself.
    isModifyingProgrammatically: false
};

module.exports = sharedState;