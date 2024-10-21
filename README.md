# completer
simple js autocompletion

## configuration
get a fresh configuration object
```js
const conf = new AutocompleteConfiguration()
```

### debugging
Sometimes you want to know more information about what happens in the engine.<br />
default value: disabled<br /><br />
To enable use
```js
conf.enableDebug()
```
To disable use
```js
conf.disableDebug()
```

### Specify element
You can pass the reference to the configuration.

```js
conf.setElement(document.getElementById('elementOne'))
```

### Specify element ID
You can pass the id of the element to the configuration.

```js
conf.setElementId('elementOne')
```

### Initial data
If the user visits the page, some data may be selected already. <br />
You can set the initial selected data with:
```js
conf.setInitialData([
    {value: 'bar'}
])
```

### Selection limits
You can specify the maximum amount of selected items.<br /> 
1 = just one<br> 
\> 1 = n elements<br>
< 1 = unlimited

```js
conf.setMaxItemsSelected(2)
```

### Fixed data set

## Example configuration with provided data


```js
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
```
```html
<script src="/js/autocompletion.js"></script>
```

```js
console.log("test");
document.addEventListener('DOMContentLoaded', function () {
    const conf = new AutocompleteConfiguration()
        .enableDebug()
        .setMaxItemsSelected(1)
        .setDisplaySelectKeyOfData('display')
        .setDisplaySearchKeyOfData('search')
        .setCacheResultsSeconds(10)
        .setSearchGetKey('query')
    ;
    new Autocomplete(
        conf
            .clone()
            .setRelativeSearchUrl('/search/foo')
            .setElement(document.getElementById('elementOne'))
    );
    new Autocomplete(
        conf
            .clone()
            .setRelativeSearchUrl('/search/foo')
            .setElement(document.getElementById('elementTwo'))
    );
});
```
