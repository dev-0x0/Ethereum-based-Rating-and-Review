
const HDWalletProvider = require('truffle-hdwallet-provider-privkey');
const Web3 = require('web3');
const vendor = require('./build/Vendor.json');

const privateKey = "";  // I have scrubbed these for security reasons - Metamask account private key
const apiKey = "";      // You can add you own - Infura API key URL acquired through sign up with infura.io
                        // i.e. https://rinkeby.infura.io/etc/etc

// args: mnemonic, url of network to connect to(Rinkeby Infura API key...)
const provider = new HDWalletProvider(privateKey, apiKey);

// Address of deployed Vendor contract
const address = '';  // provide the address

// Completely enabled for the Rinkeby network. Using truffle hdwallet and Infura etc.
const web3 = new Web3(provider);

// Reference: https://stackoverflow.com/a/7228322/2208850
const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

generateDate = () => {
    const date = new Date(); // current date/time
    const randomMonth = getRandomNumber(1, 3);
    const randomHour = getRandomNumber(1, 24);
    const randomDay = getRandomNumber(1, 7);
    date.setMonth(date.getMonth() - randomMonth);
    date.setHours(date.getHours() - randomHour);
    date.setDate(date.getDate() - randomDay);
    return date.toString();
};

const generateReviews = async () => {

    try {

        const accounts = await web3.eth.getAccounts();

        const vendorInstance = await new web3.eth.Contract(
            JSON.parse(vendor.interface),
            address
        );

        for (let i = 0; i < 10; i++) {

            const t1 = new Date().getTime();

            await vendorInstance.methods.addReview(
                0,
                generateDate(),
                address,
                '12345',
                'This is an auto-generated review...',
                getRandomNumber(1, 5)
            ).send({
                from: accounts[0],
                gas: '3000000'
            });

            const total = new Date().getTime() - t1;

            console.log(`${i} Review created in ${total} ms`);
        }


    } catch(err) {
        console.log(err);
    }

};

generateReviews();
