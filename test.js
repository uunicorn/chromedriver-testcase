
const chrome = require('selenium-webdriver/chrome');
const http = require('http');
 
// Create a simple embedded HTTP server serving a single HTML document
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    // Use the following body to test against a real CF's Rocket Loader script:
    //<script src="https://ajax.cloudflare.com/cdn-cgi/scripts/7089c43e/cloudflare-static/rocket-loader.min.js"></script>
    res.end(`Hi!
        <script>
            let fakeReadyState = 'loading';

            Object.defineProperty(document, 'readyState', { get: () => fakeReadyState });

            setTimeout(() => fakeReadyState = 'complete', 1000); // setting timeout to 0 stops the error from happening
        </script>
    `);
});

// Use the Selenium API to spawn a ChromeDriver and navigate to the embedded HTTP server
const main = async () => {
    const builder = new chrome.ServiceBuilder() .setStdio('inherit');

    // Uncomment the following line for verbose logs
    //builder.loggingTo('chromedriver.log').enableVerboseLogging();
    const service = builder.build();

    const options = new chrome.Options();
    const driver = chrome.Driver.createSession(options, service);

    try {
        for(let i=0;;i++) {
            console.log(`Try ${i}...`);
            await driver.get('http://localhost:3456/');
        }
    } catch(e) {
        console.log(e);
        await driver.quit();
        server.close();
    }
};

server.listen(3456, main);
