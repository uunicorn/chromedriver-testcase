
const CDP = require('chrome-remote-interface');
const { argv } = require('process');
const args = argv.slice(2);


// Start google-chrome --remote-debugging-port=9222
// then run this script with node race.js <url>

const main = async url => {
    const tab = await CDP.New();
    const client = await CDP({tab});
    const {Page, Runtime, Inspector} = client;

    Page.loadEventFired(() => console.log('Page.loadEventFired'));
    Page.domContentEventFired(() => console.log('Page.domContentEventFired'));
    Page.frameStartedLoading(() => console.log('Page.frameStartedLoading'));
    Page.frameStoppedLoading(() => console.log('Page.frameStoppedLoading'));
    Inspector.targetCrashed(() => console.log('Inspector.targetCrashed'));

    await Page.enable();
    await Page.navigate({url});
    console.log('Page.navigate - done');

    // Busy loop, waiting for the document.readyState transitions:
    for(;;) {
        const {result: { value } } = await Runtime.evaluate({expression: 'document.readyState'});
        
        console.log(`document.readyState = ${value}`);

        if(value === 'complete')
            break;
    }
};

if(args.length === 0) {
    console.log('Usage: node race.js <url>');
} else {
    main(args[0]);
}
