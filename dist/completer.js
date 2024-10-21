class Autocomplete {
    /**
     *
     * @param {AutocompleteConfiguration} configuration
     */
    constructor(configuration) {
        this.configuration = configuration;
        this.instance = self.crypto.randomUUID();
        configuration.validate();
        this.input = configuration.element ?? document.getElementById(configuration.elementId);
        if (null === this.input) {
            throw new AutocompleteConfigurationValidationError('element not found');
        }

        this.input.style.display = 'none'
        this.userInput = document.createElement('input')
        this.userInput.id = 'userInputFor' + this.instance;
        this.userInput.style.width = '100%';

        this.resultsContainer = document.createElement('div');

        configuration.resultContainerClasses.forEach((containerClass) => {
            this.resultsContainer.classList.add(containerClass)
        })
        this.resultsContainer.setAttribute('id', configuration.resultContainerId ?? 'resultContainerFor' + this.input.id)
        this.selectionContainer = document.createElement('div');
        this.selectionContainer.setAttribute('id', 'selectionContainerFor' + this.input.id)

        this.input.parentNode.insertBefore(this.resultsContainer, this.input.nextSibling)
        this.input.parentNode.insertBefore(this.selectionContainer, this.input.nextSibling)
        this.input.parentNode.insertBefore(this.userInput, this.input.nextSibling)

        this.displayValue = null;
        this.value = null;
        this.values = [];
        this.results = [];
        this.resultsCache = {};
        this.isLoading = false;
        this.isActive = false;
        this.display();

        this.searchOffset = null;

        document.addEventListener('click', (event) => {

            if (event.target === this.userInput) {
                return
            }
            if (event.target.classList.contains('autocomplete-item')) {
                return
            }
            if (event.target.classList.contains('autocomplete-item')) {
                return
            }
            if (event.target.classList.contains('autoCompleteSelectionCloser')) {
                return
            }
            this.debug(event.target)
            this.debug(event.target.classList)

            this.isActive = false;
            this.display()
        });

        this.userInput.addEventListener('input', () => {
            this.indicateLoading(true);
            window.setTimeout(() => {
                this.search(this.userInput.value);
                this.display();
            }, 300)
        });

        this.userInput.addEventListener('focus', () => {
            this.isActive = true;
            window.setTimeout(() => {
                this.search(this.userInput.value);
                this.display();
            }, 300)
        });


        this.userInput.addEventListener('blur', () => {
            setTimeout(() => {
                return
                this.isActive = false;
                this.display()
            }, 100)

        });
    }

    /**
     *
     * @param {*} what
     * @returns {Autocomplete}
     */
    debug(what) {
        if (true === this.configuration.debugEnabled) {
            let error = new AutocompleteConfigurationValidationError();
            console.log(error.stack.split("\n")[2] + ': ');
            console.log(what);
        }

        return this;
    }

    /**
     *
     * @param {boolean} isLoading
     * @returns {Autocomplete}
     */
    indicateLoading(isLoading) {
        this.isLoading = true === isLoading;

        return this;
    }

    search(query) {
        query = String(query).toString();
        query = query.toLowerCase();
        query = query.trim();
        if (query in this.resultsCache && false !== this.resultsCache[query]) {

            this.results = this.resultsCache[query];
            this
                .indicateLoading(false)
                .display()

            return;
        }

        if (null !== this.configuration.data) {
            this.results = []
            this.configuration.data.forEach((item) => {
                const value = String(item[this.configuration.valueKeyOfData]).toString();
                if (value.toLowerCase().includes(query)) {
                    this.results.push(item);

                    return;
                }
                const displaySearch = String(item[this.configuration.getDisplaySearchKeyOfData()]).toString();
                if (displaySearch.toLowerCase().includes(query)) {
                    this.results.push(item);

                    return;
                }
                const selectSearch = String(item[this.configuration.getDisplaySelectKeyOfData()]).toString();
                if (selectSearch.toLowerCase().includes(query)) {
                    this.results.push(item);

                    return;
                }
            });

            this
                .indicateLoading(false)
                .display()
            ;

            return;
        }

        const myHeaders = new Headers();
        for (const [key, value] of Object.entries(this.configuration.additionalHeaders)) {
            myHeaders.append(key, value);
        }


        let route = '';
        if (null !== this.configuration.searchPostKey) {

        }

        if (null !== this.configuration.searchGetKey) {
            let url = null;
            if (null !== this.configuration.absoluteSearchUrl) {
                url = new URL(this.configuration.absoluteSearchUrl);
            }
            if (null !== this.configuration.relativeSearchUrl) {
                url = new URL(this.configuration.relativeSearchUrl, new URL(document.location).origin);
            }

            url.searchParams.append(this.configuration.searchGetKey, encodeURIComponent(query));

            route = url.toString()
        }
        fetch(
            route, {
                headers: myHeaders
            }
        )
            .then(response => response.json())
            .then(data => {
                this.isLoading = false;
                this.results = data
                this.cacheResult(query, data)
                this.display();
            })
            .catch(error => {
                this.isLoading = false;
                this.resultsContainer.innerHTML = 'an error occurred';
                console.error('Error fetching autocomplete data:', error);
            });
    }

    cacheResult(query, data) {
        if (0 === this.configuration.cacheResultsSeconds) {
            return this;
        }
        let that = this;
        let queryCopy = query;
        this.resultsCache[queryCopy] = data;
        window.setTimeout(function () {
            that.resultsCache[queryCopy] = false;
        }, this.configuration.cacheResultsSeconds * 1000);

        return this;
    }

    clearValue() {
        this.value = null;
        this.values = [];

        return this;
    }

    removeValue(value) {
        if (1 === this.configuration.maxItemsSelected) {
            this.value = null;

            return this;
        }

        this.values = this.values.filter((thisValue) => {
            return value != thisValue
        })

        return this;
    }

    addValue(item) {
        let value = item[this.configuration.valueKeyOfData];
        this.input.value = value;
        if (1 === this.configuration.maxItemsSelected) {
            if (this.value !== value) {
                this.value = value;
                return this;
            }
            this.value = null;

            return this;
        }
        if (-1 !== this.values.indexOf(value)) {
            this.removeValue(value);
            return this;
        }

        this.values.push(value);
        const getUniqueValues = (array) => (
            [...new Set(array)]
        )
        this.values = getUniqueValues(this.values)

        return this;
    }

    getSelectionElement(value, displayValue) {
        let element = document.createElement('span');
        element.innerHTML = displayValue;
        element.style.background = '#fff'
        element.style.border = 'solid 1px #000'
        element.style.color = '#000'
        element.style['min-width'] = '150px'
        element.style.display = 'inline-block'

        let closer = document.createElement('span')
        closer.innerHTML = 'X'
        closer.classList.add('autoCompleteSelectionCloser')
        closer.style.display = 'inline-block'
        closer.style.position = 'relative'
        closer.style.right = '0px'
        closer.style['margin-left'] = '20px'

        closer.addEventListener('click', () => {
            element.remove()
            this.removeValue(value)
            this.userInput.focus()
        })
        element.append(closer)

        return element;
    }

    showSelection() {
        this.selectionContainer.innerHTML = '';
        if (null !== this.displayValue) {
            this.selectionContainer.append(this.getSelectionElement(this.value, this.displayValue))
        }
        if (0 !== this.values.length) {
            for (const [value, displayValue] of Object.entries(this.values)) {
                this.selectionContainer.append(this.getSelectionElement(value, displayValue))
            }
        }

        return this;
    }

    display() {
        let uuid = self.crypto.randomUUID();

        this.resultsContainer.style.display = 'block'
        this.selectionContainer.style.display = 'block';
        if (null === this.results || false === this.isActive) {
            this.resultsContainer.style.display = 'none'
            return;
        }

        this.showSelection();

        this.selectionContainer.style.border = 'solid 1px #000';
        this.selectionContainer.style.background = '#000';

        const rect = this.userInput.getClientRects();
        this.resultsContainer.style.top = rect.bottom + 'px'
        this.resultsContainer.style.left = rect.left + 'px'
        this.resultsContainer.style.position = 'absolute'
        this.resultsContainer.style.background = '#fff'
        this.resultsContainer.style.border = 'solid 1px #000'
        this.resultsContainer.style['max-height'] = '500px'
        this.resultsContainer.style.width = this.userInput.offsetWidth + 'px'
        this.resultsContainer.style['overflow-y'] = 'scroll'
        this.resultsContainer.style['overflow-x'] = 'hidden'
        this.resultsContainer.style['z-index'] = 200
        this.selectionContainer.style['z-index'] = 100

        this.resultsContainer.innerHTML = '';

        this.results.forEach(item => {
            const div = document.createElement('div');
            div.innerHTML = item[this.configuration.getDisplaySearchKeyOfData()];
            div.classList.add('autocomplete-item');
            div.addEventListener('click', (event) => {
                event.stopPropagation()
                event.preventDefault()
                this.userInput.focus()
                this.addValue(item);

                if (null !== this.configuration.selectCallback) {
                    this.configuration.selectCallback(item)
                }
                this.showSelection();
                return false
            });
            this.resultsContainer.appendChild(div);

            return this;
        })
    }
}

if (typeof module != 'undefined') {
    module.exports = Autocomplete
}
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

        this.translationNoResults = 'no results'; // the translation for not finding any result
        this.translationPickResult = 'pick result'; // the translation for pick a result
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
}

if (typeof module != 'undefined') {
    module.exports = AutocompleteConfiguration
}

class AutocompleteConfigurationValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "AutocompleteConfigurationValidationError";
    }
}

if (typeof module != 'undefined') {
    module.exports = AutocompleteConfigurationValidationError
}