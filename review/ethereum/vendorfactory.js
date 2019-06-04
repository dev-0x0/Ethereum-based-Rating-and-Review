
import web3 from './web3';
import VendorFactory from './build/VendorFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(VendorFactory.interface),                  // ABI of VendorFactory contract
    '0x4df7BAb5c3a3CDC05FC76Ce59561661d47AE94AF'  // Address of deployed VendorFactory contract
);

export default instance;
