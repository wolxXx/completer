# completer
simple js autocompletion

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
