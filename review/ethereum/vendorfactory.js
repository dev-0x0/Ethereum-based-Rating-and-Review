
import web3 from './web3';
import VendorFactory from './build/VendorFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(VendorFactory.interface),                  // ABI of VendorFactory contract
    '0x0000000000000000000000000000000000000000'          // Address of deployed VendorFactory contract
);

export default instance;
