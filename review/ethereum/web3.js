
import Web3 from 'web3';
const HDWalletProvider = require('truffle-hdwallet-provider');

const seedWords = "";  // I have scrubbed these for security reasons - Metamask account seed words
const apiKey = "";     // You can add you own - Infura API key URL acquired through sign up with infura.io
                       // i.e. https://rinkeby.infura.io/etc/etc

// args: mnemonic, url of network to connect to(Rinkeby Infura API key...)
const provider = new HDWalletProvider(seedWords, apiKey);


let web3;
const infuraAPIKey = ""; // replace with your own

if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
    // We are operating inside the clients browser
    // Here, we know what version of Web3 we are using(we imported it), BUT we are
    // 'hijacking' the provider from metamask. Using web3 from metamask would mean we have
    // no control over the version of web3. It's important because these technologies are updated
    // regularly, which can easily break the code(likewise, it might be an out-of-date version).
    web3 = new Web3(window.web3.currentProvider);
} else {
    // We are operating either on the server(server-side rendering is taking place with next.js)
    // Or metamask is not present in the clients browser
    // In this case, we will still use our own version of Web3 but ALSO use our own provider.
    // The provider will come from our Infura account which is accessed with the below.

    // Here we use the url of the Infura node to which we have access
    const provider = new Web3.providers.HttpProvider(infuraAPIKey);  //  Host

    web3 = new Web3(provider);  // our own provider via Infura
}


export default web3;
