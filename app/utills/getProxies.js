const ProxyLists = require("proxy-lists");

const options = {
    protocols: ["http"],
    countries: ["ca", "ru", "de"],
    anonymityLevels: ["elite"],
};

// `gettingProxies` is an event emitter object. 
const gettingProxies = ProxyLists.getProxies(options);

gettingProxies.on("data", function(proxies) {
    // Received some proxies. 
    console.log(proxies);
});

gettingProxies.on("error", function(error) {
    // Some error has occurred. 
    console.error(error);
});

gettingProxies.once("end", function() {
    // Done getting proxies. 
});