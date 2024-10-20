const AutoCompleteConfiguration = require('./src/AutocompleteConfiguration.js');


test('check if debug is disabled by default', () => {
//    require('./autocompletion.js');
    const conf = new AutoCompleteConfiguration()
    expect(conf.debugEnabled).toBe(false)
});

test('check debug switching', () => {
//    require('./autocompletion.js');
    const conf = new AutoCompleteConfiguration()
    expect(conf.debugEnabled).toBe(false)
    expect(conf.enableDebug().debugEnabled).toBe(true)
    expect(conf.disableDebug().debugEnabled).toBe(false)
});



test('check defaults', () => {
//    require('./autocompletion.js');
    const conf = new AutoCompleteConfiguration()
    expect(conf.debugEnabled).toBe(false)
    expect(conf.element).toBe(null)
    expect(conf.elementId).toBe(null)
    expect(conf.initialData).toBe([])
    expect(conf.maxItemsSelected).toBe(1)
});

