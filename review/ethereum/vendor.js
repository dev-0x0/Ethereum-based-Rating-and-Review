
import web3 from './web3';
import Vendor from './build/Vendor.json';

// Export an instance of the CampaignFactory contract
// address is passed into the function, which is called from getInitialProps in show.js
// or wherever else it is needed
export default (address) => {
    return new web3.eth.Contract(
        JSON.parse(Vendor.interface),
        address
    );
};
