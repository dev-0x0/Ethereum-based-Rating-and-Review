

const routes = require('next-routes')();

routes
    .add('/products/:vendorAddress/:productID/pay', 'products/pay')
    // .add('/reviews/addTransaction', '/reviews/send_sms')
    .add('/reviews/send_sms', '/products/thankyou')
    .add('/reviews/thanks', '/reviews/thanks')
    .add('/reviews/:vendorAddress/:productID/:filter/:visualise/show', '/reviews/show')
    .add('/reviews/:vendorAddress/:customerID/:productID/write', '/reviews/write')
    .add('/reviews/:vendorAddress/:customerID/:productID/new', '/reviews/new');
    // .add('/reviews/:vendorAddress/:productID/chart', '/reviews/chart');

// Export helpers that help automatically navigate users around the app
module.exports = routes;

