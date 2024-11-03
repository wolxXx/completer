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

        if ('select' === this.input.tagName.toLowerCase()) {
            this.input.querySelectorAll('option').forEach((option) => {
                option.remove()
            })
        }

        this.input.style.display = 'none'
        this.userInput = document.createElement('input')
        this.userInput.id = 'userInputFor' + this.instance;
        this.userInput.style.width = '100%';
        this.userInput.setAttribute('placeholder', this.configuration.translationPlaceholder);

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

        this.configuration.initialData.forEach((item) => {
            this.addValue(item);
        })

        this.display();
        this.showSelection();

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
            if (event.target.classList.contains('resultContainer')) {
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
        if (this.configuration.requestStartCallback) {
            this.configuration.requestStartCallback(query);
        }
        if (query in this.resultsCache && false !== this.resultsCache[query]) {

            this.results = this.resultsCache[query];
            this
                .indicateLoading(false)
                .display()

            if (this.configuration.requestEndCallback) {
                this.configuration.requestEndCallback(query, this.results);
            }
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
            if (this.configuration.requestEndCallback) {
                this.configuration.requestEndCallback(query, this.results);
            }

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
                if (this.configuration.requestEndCallback) {
                    this.configuration.requestEndCallback(query, this.results);
                }
            })
            .catch(error => {
                this.results = null
                this.isLoading = false;
                this.resultsContainer.innerHTML = this.configuration.translationErrorMessage;
                console.error('Error fetching autocomplete data:', error);
                if (this.configuration.requestEndCallback) {
                    this.configuration.requestEndCallback(query, this.results);
                }
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
        this.input.value = null;
        if (1 === this.configuration.maxItemsSelected) {
            this.value = null;

            return this;
        }

        this.values = this.values.filter((thisValue) => {
            return value[this.configuration.valueKeyOfData] !== thisValue[this.configuration.valueKeyOfData]
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
        this.values.forEach((thisValue) => {
            if (thisValue[this.configuration.valueKeyOfData] === value) {
                hasValue = true;
            }
        })

        if (true === hasValue) {
            this.removeValue(item);
            return this;
        }

        if (this.configuration.maxItemsSelected > 1) {
            if (this.values.length >= this.configuration.maxItemsSelected) {
                return this;
            }
        }

        this.values.push(item);
        /*const getUniqueValues = (array) => (
            [...new Set(array)]
        )
        this.values = getUniqueValues(this.values)*/

        return this;
    }

    getSelectionElement(item) {
        let element = document.createElement('span');
        element.innerHTML = '<span style="display: inline-block;">' + item[this.configuration.getDisplaySelectKeyOfData()] + '</span>';
        element.style.background = '#fff'
        element.style.border = 'solid 1px #000'
        element.style['border-radius'] = '10px'
        element.style.color = '#000'
        element.style.padding = '3px'
        element.style['padding-right'] = '10px'
        if (1 === this.configuration.maxItemsSelected) {
            element.style['width'] = 'calc(100% - 15px)'

        }
        if (1 !== this.configuration.maxItemsSelected) {
            element.style['margin-right'] = '5px'
            const hiddenValueElement = document.createElement('input')
            hiddenValueElement.setAttribute('type', 'hidden')
            hiddenValueElement.setAttribute('name', this.input.getAttribute('name'))
            hiddenValueElement.setAttribute('value', item[this.configuration.valueKeyOfData])
            element.prepend(hiddenValueElement)
        }

        element.style.display = 'inline-block'

        let closer = document.createElement('span')
        closer.innerHTML = 'X'
        closer.classList.add('autoCompleteSelectionCloser')
        closer.style.display = 'inline-block'
        closer.style.position = 'relative'
        closer.style.padding = '5px'
        closer.style.background = '#444'
        closer.style.color = '#fff'
        closer.style.right = '0px'
        closer.style.border = 'solid 1px #000'
        closer.style['border-radius'] = '5px'
        closer.style['margin-right'] = '10px'
        closer.style['cursor'] = 'pointer'
        closer.setAttribute('title', this.configuration.translationRemoveResult)

        closer.addEventListener('click', () => {
            element.remove()
            this.removeValue(item)
            this.display()
            this.userInput.focus()
        })
        element.prepend(closer)

        return element;
    }

    showSelection() {
        this.selectionContainer.innerHTML = '';
        let hasSelection = false;
        if (null !== this.value) {
            this.selectionContainer.append(this.getSelectionElement(this.value))
            hasSelection = true;
        }
        if (0 !== this.values.length) {
            hasSelection = true;
            this.values.forEach((value) => {
                this.selectionContainer.append(this.getSelectionElement(value))
            })
        }
        this.selectionContainer.style.display = 'block'
        if (false === hasSelection) {
            this.selectionContainer.style.display = 'none'
        }

        return this;
    }

    display() {
        let uuid = self.crypto.randomUUID();

        this.resultsContainer.style.display = 'block'
        this.selectionContainer.style.display = 'block';
        this.selectionContainer.style.border = 'solid 1px #000';
        this.selectionContainer.style.background = '#fff';
        this.selectionContainer.style.padding = '5px';
        if (null === this.results || false === this.isActive) {
            this.resultsContainer.style.display = 'none'
            this.showSelection();
            return;
        }


        this.showSelection();


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

        if (0 === this.results.length) {
            this.resultsContainer.innerHTML = this.configuration.translationNoResults
        }

        this.results.forEach(item => {
            const div = document.createElement('div');
            let isSelected = false;
            if (1 === this.configuration.maxItemsSelected) {
                if (null !== this.value) {
                    isSelected = this.value[this.configuration.valueKeyOfData] === item[this.configuration.valueKeyOfData];
                }
            }
            if (1 !== this.configuration.maxItemsSelected) {
                this.values.forEach((value) => {
                    isSelected = isSelected || value[this.configuration.valueKeyOfData] === item[this.configuration.valueKeyOfData];
                })
            }
            let prefix = '<span style="color: #fff">✓ </span>';
            if (true === isSelected) {
                prefix = '✓ ';
            }
            div.innerHTML = prefix + item[this.configuration.getDisplaySearchKeyOfData()];
            div.classList.add('autocomplete-item');
            div.style.cursor = 'pointer'
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

if (typeof module != 'undefined') { //cut me
    module.exports = Autocomplete // cut me
} // cut me