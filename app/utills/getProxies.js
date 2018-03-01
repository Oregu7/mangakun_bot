const ProxyLists = require("proxy-lists");

const options = {
    countries: ["us", "ca"],
};

// `gettingProxies` is an event emitter object. 
const gettingProxies = ProxyLists.getProxies(options);

gettingProxies.on("data", function(proxies) {
    // Received some proxies. 
});

gettingProxies.on("error", function(error) {
    // Some error has occurred. 
    console.error(error);
});

gettingProxies.once("end", function() {
    // Done getting proxies. 
});