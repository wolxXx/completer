class AutocompleteConfigurationValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "AutocompleteConfigurationValidationError";
    }
}

if (typeof module != 'undefined') { // cut me
    module.exports = AutocompleteConfigurationValidationError // cut me
} // cut me