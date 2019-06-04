pragma solidity ^0.4.17;

// A contract that deploys Vendors to the Blockchain
contract VendorFactory {
    address[] public deployedVendors;

    address public manager;

    // This contract would be under the control of TrueReview. This means
    // that they are the creator/deployer of the contract, and creation of new Vendors
    // is restricted to this entity
    function VendorFactory() public {
        manager = msg.sender;  // Creator of the VendorFactory contract.
    }

    // This will deploy a new Vendor to the blockchain
    // While actual deployment would be executed by an Authority, the cost would be covered
    // by the Vendor, who must pay a registration cost to the Authority.

    // Vendor pays the Authority in charge of registration. This negates the need for this
    // function to be payable as such.
    function createVendor(
        address newVendorAddress, string name, string description) public returns (address) {
        // require that the sender of the transaction is the manager
        require(msg.sender == manager);

        address newVendor = new Vendor(msg.sender, newVendorAddress, name, description);
        deployedVendors.push(newVendor); // add vendor to the array

        return newVendor;
    }

    // return an array of all deployed Vendors
    function getDeployedVendors() public view returns (address[]) {
        return deployedVendors;
    }
}

// A contract that stores data about a Vendor,
// its Customers, Transactions, and Reviews
contract Vendor {

    // Structs to represent the Vendor,
    // Products, Transactions and Reviews
    struct VendorData {
        address vendorAddress;
        string title;
        string description;
    }

    struct Product {
        string title;
        string description;
        uint productID;
        uint price;
    }

    struct Transaction {
        string customerID;
        uint productID;
        uint price;
        string date;
    }

    struct Review {
        address vendor;    // A review of this vendor's product
        string customerID; // A review by this customer
        uint productID;    // A review of this product
        string reviewText;
        uint rating;        // Numerical rating of the item
    }

    VendorData public vendorData;
    Product[] public products;
    Transaction[] public transactions;

    // CustomerID/address => Customer
    mapping(string => bool) customers;
    // ProductID => Product
    mapping(uint => Product) productsByID;
    // Mapping from (productID => Review[]) - (productID => Array of Reviews for that product)
    mapping(uint => Review[]) productReviews;

    // Mapping from (customerID => (Mapping from productID => boolean))
    // Boolean represents whether the customer has completed a Transaction for a product with productID
    mapping(string => mapping(uint => bool)) customerTransactions;

    // Assigned to newly added products
    // Gets incremented after addition of a new product
    uint public nextProductID = 0;

    address public manager;          // Creator of the contract (Authority).
    address public vendor;           // address of the vendor

    // function modifier
    modifier restricted() {
        require(msg.sender == vendor);
        _; // function code is inserted here
    }

    // Contract constructor/initialiser
    function Vendor(address creator, address vendorAddress, string title,
        string description) public {

        manager = creator;       // address of Authority that created the vendor
        vendor = vendorAddress;  // new vendors address

        vendorData = VendorData({
            vendorAddress: vendorAddress,
            title: title,
            description: description
            });
    }

    function addProduct(string name, string description, uint price)
    public restricted {
        // Only Vendor can add a Product
        Product memory newProduct = Product({
            title: name,
            description: description,
            productID: nextProductID,
            price: price
            });

        products.push(newProduct);
        productsByID[nextProductID] = newProduct;
        nextProductID++;         // Increment for the next product added
    }

    function getProductsCount() public view returns (uint) { return products.length; }

    function addCustomer(string id) public restricted {
        // Only the Vendor can add a Customer
        customers[id] = true;
    }

    function customerExists(string id) public view returns (bool) {
        return customers[id];
    }

    function addTransaction(string customerID, uint productID,
        uint price, string date) public restricted {              // remove restricted ********

        require(customers[customerID] == true); // Customer must be registered
        require(productsByID[productID].productID == productID); // Product must exist

        // only the Vendor can add a Transaction
        Transaction memory newTransaction = Transaction({
            customerID: customerID,
            productID: productID,
            price: price,
            date: date
        });

        transactions.push(newTransaction);

        // Record that the customer has completed a Transaction for this product
        customerTransactions[customerID][productID] = true;
    }

    function transactionExists(string customerID, uint productID) public view restricted returns (bool) {
        return customerTransactions[customerID][productID];
    }

    function addReview(uint productID, string date, address vendorAddress,
        string customerID, string reviewText, uint rating) public {

        // Require that customer has completed a Transaction for this productID
        require(customerTransactions[customerID][productID] == true);

        Review memory newReview = Review({
            vendor: vendorAddress,
            customerID: customerID,
            productID: productID,
            date: date,
            reviewText: reviewText,
            rating: rating
        });

        productReviews[productID].push(newReview);
    }

    function getReview(uint productID, uint index) public view returns
    (address, string, uint, string, string, uint) {

        Review review = productReviews[productID][index];
        return (review.vendor, review.customerID, review.productID,
        review.date, review.reviewText, review.rating);
    }

    function getReviewsCount(uint productID) public view returns (uint) {
        return productReviews[productID].length;
    }

}
