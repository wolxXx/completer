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
            }, this.configuration.searchDelay ?? 300)
        });

        this.userInput.addEventListener('focus', () => {
            this.isActive = true;
            window.setTimeout(() => {
                this.search(this.userInput.value);
                this.display();
            }, this.configuration.searchDelay ?? 300)
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
            if (null === this.value) {
                this.value = item;
                return this;
            }
            if (this.value[this.configuration.valueKeyOfData] !== value[this.configuration.valueKeyOfData]) {
                this.value = item;
                return this;
            }
            this.value = null;

            return this;
        }
        let hasValue = false;

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