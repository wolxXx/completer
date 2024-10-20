
class AutocompleteConfigurationValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "AutocompleteConfigurationValidationError";
    }
}

if (typeof module != 'undefined') {
    module.exports = AutocompleteConfigurationValidationError
}