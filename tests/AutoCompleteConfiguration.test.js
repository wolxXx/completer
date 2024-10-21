const AutoCompleteConfiguration = require('../src/AutocompleteConfiguration.js');
const AutocompleteConfigurationValidationError = require('../src/AutocompleteConfigurationValidationError.js');


test('check debug switching', () => {
//    require('./autocompletion.js');
    const conf = new AutoCompleteConfiguration()
    expect(conf.debugEnabled).toBe(false)
    expect(conf.enableDebug().debugEnabled).toBe(true)
    expect(conf.disableDebug().debugEnabled).toBe(false)
});

test('check cloning works', () => {
//    require('./autocompletion.js');
    const conf = new AutoCompleteConfiguration()
    const clone = conf.clone()

    expect(conf.debugEnabled).toBe(false)
    expect(clone.debugEnabled).toBe(false)
    expect(conf.enableDebug().debugEnabled).toBe(true)
    expect(clone.debugEnabled).toBe(false)
});

test('check validation fails on fresh instance', () => {
    require('../src/AutocompleteConfigurationValidationError.js');
    const conf = new AutoCompleteConfiguration()
    expect(() => {
        conf.validate()
    }).toThrow('element or element id is needed');
});

test('check getDisplaySearchKeyOfData', () => {
    const conf = new AutoCompleteConfiguration()

    expect(conf.getDisplaySearchKeyOfData()).toBe('value')
    conf.setDisplaySearchKeyOfData('display')
    expect(conf.getDisplaySearchKeyOfData()).toBe('display')
});

test('check getDisplaySelectKeyOfData', () => {
    const conf = new AutoCompleteConfiguration()

    expect(conf.getDisplaySelectKeyOfData()).toBe('value')
    conf.setDisplaySearchKeyOfData('display')
    expect(conf.getDisplaySelectKeyOfData()).toBe('display')
    conf.setDisplaySelectKeyOfData('display2')
    expect(conf.getDisplaySelectKeyOfData()).toBe('display2')
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.debugEnabled).toBe(false)
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.element).toBe(null)
});

test('check set element', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.element).toBe(null)
    conf.setElement('fakeElement')
    expect(conf.element).toBe('fakeElement')
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.elementId).toBe(null)
});

test('check set element id', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.elementId).toBe(null)
    conf.setElementId('fakeElement')
    expect(conf.elementId).toBe('fakeElement')
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.initialData).toBeInstanceOf(Array)
    expect(conf.initialData).toHaveLength(0)
});

test('check initial data', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.initialData).toBeInstanceOf(Array)
    expect(conf.initialData).toHaveLength(0)
    conf.addInitialData({'value': 'foo'})
    conf.addInitialData({'value': 'bar'})
    expect(conf.initialData).toHaveLength(2)
    conf.clearInitialData()
    expect(conf.initialData).toHaveLength(0)
    conf.addInitialDataItems([{'value': 'foo'}, {'value': 'bar'}])
    expect(conf.initialData).toHaveLength(2)
    conf.setInitialData([{'value': 'foo'}, {'value': 'bar'}, {'value': 'barFoos'}])
    expect(conf.initialData).toHaveLength(3)

});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.maxItemsSelected).toBe(1)
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.data).toBe(null)
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.absoluteSearchUrl).toBe(null)
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.relativeSearchUrl).toBe(null)
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.searchPostKey).toBe('term')
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.searchGetKey).toBe('term')
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.additionalHeaders).toBeInstanceOf(Object)
    expect(JSON.stringify(conf.additionalHeaders)).toBe('{}')
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.cacheResultsSeconds).toBe(0)
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.searchDelay).toBe(100)
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.valueKeyOfData).toBe('value')
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.displaySearchKeyOfData).toBe(null)
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.displaySelectKeyOfData).toBe(null)
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(JSON.stringify(conf.resultContainerClasses)).toBe("[\"resultContainer\"]")
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.resultContainerId).toBe('resultContainer')
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.requestStartCallback).toBe(null)
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.requestEndCallback).toBe(null)
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.selectCallback).toBe(null)
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.translationNoResults).toBe('no results')
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.translationPickResult).toBe('pick result')
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.translationClearResults).toBe('clear results')
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.translationMoreResults).toBe('more results')
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.translationErrorMessage).toBe('an error occurred')
});

test('check set translation', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.translationErrorMessage).toBe('an error occurred')
    expect(conf.setTranslationErrorMessage("nix gut das").translationErrorMessage).toBe('nix gut das')
});

test('check defaults', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.translationRemoveResult).toBe('remove result')
});

test('check set translation', () => {
    const conf = new AutoCompleteConfiguration()
    expect(conf.translationRemoveResult).toBe('remove result')
    expect(conf.setTranslationRemoveResult('dingsibumsi löschilöschi').translationRemoveResult).toBe('dingsibumsi löschilöschi')
});

