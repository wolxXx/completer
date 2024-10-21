class AutocompleteConfiguration {
    constructor() {
        /**
         * @type {boolean}
         */
        this.debugEnabled = false;

        /**
         * the element itself that should be used for autocompletion
         * @type {null|Element}
         */
        this.element = null;

        /**
         * the id of the element that should be used for autocompletion
         * @type {null|string}
         */
        this.elementId = null;

        /**
         * initially selected data
         * @type {string[]}
         */
        this.initialData = [];

        this.maxItemsSelected = 1; // how many items should be maximally selected?

        this.data = null; // if provided, no ajax search is needed

        this.absoluteSearchUrl = null; // if you want ajax search, provide the absolute url where to search
        this.relativeSearchUrl = null; // if you want ajax search, provide the relative url where to search
        this.searchPostKey = 'term'; // the key in the post-request that contains the search parameter
        this.searchGetKey = 'term'; // the key in the get-request that contains the search parameter
        this.additionalHeaders = {}; // a list of additional headers, e.g., api key, cookie, etc.

        this.cacheResultsSeconds = 0; // how long results should be cached, 0 for no cache

        this.searchDelay = 100; // wait milliseconds until a search will be made, prevents enormous unused traffic

        /**
         * @type {string}
         */
        this.valueKeyOfData = 'value'; // the key of a dataset where the value is stored
        this.displaySearchKeyOfData = null; // will be displayed in the result list instead the valueKeyData
        this.displaySelectKeyOfData = null; // will be displayed as the selected value instead of the displaySearchKeyOfData

        this.resultContainerClasses = ['resultContainer']; // CSS class of result container
        this.resultContainerId = 'resultContainer'; // the id of the result container

        this.requestStartCallback = null; // a callback when the ajax search is started
        this.requestEndCallback = null; // a callback when the ajax search finished
        this.selectCallback = null; // a callback when a result item was selected

        this.translationPlaceholder = 'type to search'; // the translation for not finding any result
        this.translationNoResults = 'no results'; // the translation for not finding any result
        this.translationPickResult = 'pick result'; // the translation for pick a result
        this.translationRemoveResult = 'remove result'; // the translation for pick a result
        this.translationClearResults = 'clear results'; // the translation for clear all results
        this.translationMoreResults = 'more results'; // the translation for search for more results
        this.translationErrorMessage = 'an error occurred'; // the translation if an error occurred
    }

    /**
     *
     * @returns {AutocompleteConfiguration}
     */
    clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    }

    validate() {
        if (null === this.elementId && null === this.element) {
            throw new AutocompleteConfigurationValidationError('element or element id is needed')
        }

        if (null === this.data && null === this.relativeSearchUrl && null === this.absoluteSearchUrl) {
            throw new AutocompleteConfigurationValidationError('data or search url is needed')
        }

        if ((null !== this.relativeSearchUrl || null !== this.absoluteSearchUrl) && null === this.searchGetKey && null === this.searchPostKey) {
            throw new AutocompleteConfigurationValidationError('search get key or search post key is needed');
        }

        if (null === this.valueKeyOfData) {
            throw new AutocompleteConfigurationValidationError('value key of data is needed');
        }

        return this;
    }

    /**
     * @returns {AutocompleteConfiguration}
     */
    enableDebug() {
        this.debugEnabled = true;

        return this;
    }

    /**
     * @returns {AutocompleteConfiguration}
     */
    disableDebug() {
        this.debugEnabled = false;

        return this;
    }

    /**
     * @returns {string}
     */
    getDisplaySearchKeyOfData() {
        return this.displaySearchKeyOfData ?? this.valueKeyOfData;
    }


    /**
     * @returns {string}
     */
    getDisplaySelectKeyOfData() {
        return this.displaySelectKeyOfData ?? this.getDisplaySearchKeyOfData();
    }

    /**
     * @param {Element} value
     * @returns {AutocompleteConfiguration}
     */
    setElement(value) {
        this.element = value;

        return this;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    setElementId(value) {
        this.elementId = value;

        return this;
    }

    /**
     * @returns {AutocompleteConfiguration}
     */
    clearInitialData() {
        this.initialData = [];

        return this;
    }

    /**
     * @param {Object} value
     * @returns {AutocompleteConfiguration}
     */
    addInitialData(value) {
        this.initialData.push(value);

        return this;
    }

    /**
     * @param {Object[]} value
     * @returns {AutocompleteConfiguration}
     */
    addInitialDataItems(value) {
        value.forEach((initialData) => {
            this.addInitialData(initialData);
        })

        return this;
    }

    /**
     * @param {Object[]} value
     * @returns {AutocompleteConfiguration}
     */
    setInitialData(value) {
        return this
            .clearInitialData()
            .addInitialDataItems(value)
            ;
    }

    setData(value) {
        this.data = value;

        return this;
    }

    /**
     * @param {Number} value
     * @returns {AutocompleteConfiguration}
     */
    setMaxItemsSelected(value) {
        this.maxItemsSelected = value;

        return this;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    setRelativeSearchUrl(value) {
        this.relativeSearchUrl = value;

        return this;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    setAbsoluteSearchUrl(value) {
        this.absoluteSearchUrl = value;

        return this;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    setSearchPostKey(value) {
        this.searchPostKey = value;

        return this;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    setSearchGetKey(value) {
        this.searchGetKey = value;

        return this;
    }

    /**
     * @returns {AutocompleteConfiguration}
     */
    clearAdditionalHeaders() {
        this.additionalHeaders = {};

        return this;
    }

    /**
     * @param {string} key
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    addAdditionalHeader(key, value) {
        this.additionalHeaders[key] = value;

        return this;
    }

    /**
     * @param {Number} value
     * @returns {AutocompleteConfiguration}
     */
    setCacheResultsSeconds(value) {
        this.cacheResultsSeconds = value;

        return this;
    }

    /**
     * @param {Number} value
     * @returns {AutocompleteConfiguration}
     */
    setSearchDelay(value) {
        this.searchDelay = value;

        return this;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    setValueKeyOfData(value) {
        this.valueKeyOfData = value;

        return this;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    setDisplaySearchKeyOfData(value) {
        this.displaySearchKeyOfData = value;

        return this;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    setDisplaySelectKeyOfData(value) {
        this.displaySelectKeyOfData = value;

        return this;
    }

    /**
     * @returns {AutocompleteConfiguration}
     */
    clearResultContainerClasses() {
        this.resultContainerClasses = [];

        return this;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    addResultContainerClass(value) {
        this.resultContainerClasses.push(value);

        return this;
    }

    /**
     * @param {string[]} value
     * @returns {AutocompleteConfiguration}
     */
    addResultContainerClasses(value) {
        value.forEach((containerClass) => {
            this.addResultContainerClass(containerClass);
        });

        return this;
    }

    /**
     * @param {string[]} value
     * @returns {AutocompleteConfiguration}
     */
    setResultContainerClasses(value) {
        return this
            .clearResultContainerClasses()
            .addResultContainerClasses(value)
            ;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    setResultContainerId(value) {
        this.resultContainerId = value;

        return this;
    }

    /**
     * @param {function} value
     * @returns {AutocompleteConfiguration}
     */
    setRequestStartCallback(value) {
        this.requestStartCallback = value;

        return this;
    }

    /**
     * @param {function} value
     * @returns {AutocompleteConfiguration}
     */
    setRequestEndCallback(value) {
        this.requestEndCallback = value;

        return this;
    }

    /**
     * @param {function} value
     * @returns {AutocompleteConfiguration}
     */
    setSelectCallback(value) {
        this.selectCallback = value;

        return this;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    setTranslationPlaceholder(value) {
        this.translationPlaceholder = value;

        return this;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    setTranslationNoResults(value) {
        this.translationNoResults = value;

        return this;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    setTranslationPickResult(value) {
        this.translationPickResult = value;

        return this;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    setTranslationClearResults(value) {
        this.translationClearResults = value;

        return this;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    setTranslationMoreResults(value) {
        this.translationMoreResults = value;

        return this;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    setTranslationErrorMessage(value) {
        this.translationErrorMessage = value;

        return this;
    }

    /**
     * @param {string} value
     * @returns {AutocompleteConfiguration}
     */
    setTranslationRemoveResult(value) {
        this.translationRemoveResult = value;

        return this;
    }
}

if (typeof module != 'undefined') { // cut me
    module.exports = AutocompleteConfiguration // cut me
} // cut me