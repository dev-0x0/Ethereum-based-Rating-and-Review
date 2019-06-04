// Runs from inside ethereum directory with: node compile.js

const path = require('path');
const solc = require('solc');   // the solidity compiler
const fs = require('fs-extra'); // improved community-made version of the fs module(has extra functionality)

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath); // remove the entire build folder (removeSync is a part of the extras in fs-extra)

// get path to Archive contract
const contractPath = path.resolve(__dirname, 'contracts', 'Vendor.sol');

// get source of the contract from the contracts folder
const source = fs.readFileSync(contractPath, 'utf8');

// compile the contracts with solc and pull off just the contracts property
// assign this contracts property to output
// const output = solc.compile(source, 1).contracts;
const fullOutput = solc.compile(source, 1);
const output = fullOutput.contracts;

// Create build directory
fs.ensureDirSync(buildPath);


console.log(output);

// loop over the contracts in Vendor.sol and write to json files in the build directory
for (let contract in output) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'), // path to file we want to save to
        output[contract]                                              // the contract to write to file
    );
}
