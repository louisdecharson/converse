const promptInstructions =
    'You are a helpful assistant that polish emails in an idiomatic way to help non-English speakers communicate. Minimise the number of changes you make to the initial text. Initial email will be sent to you and you just need to send back the rewrote email without text before or after.';

// Enclose between two parentheses why you changed the phrasing and put it next to each phrase you reformulate in a passive tone "X has been changed to Y for A, B, C reasons"\n
const openAIGPTModel = 'gpt-4-1106-preview';

module.exports = {
    promptInstructions: promptInstructions,
    openAIGPTModel: openAIGPTModel
};
