
import React, { Component } from 'react';
import { Divider, Button, Card, Rating, Message } from 'semantic-ui-react';
import { Line } from 'react-chartjs';
import { Router } from '../../routes';
import Layout from '../../components/layout';
import Vendor from '../../ethereum/vendor';


class ProductReviews extends Component {

    static async getInitialProps(props) {
        const { vendorAddress, productID, visualise, filter } = props.query;

        const vendor = new Vendor(vendorAddress);
        const product = await vendor.methods.products(productID).call();
        let reviewsCount = await vendor.methods.getReviewsCount(productID).call();

        const currentDateTime = new Date();
        let dateFilter = currentDateTime;
        switch (filter) {
            case 'all':
                // Will show all reviews
                dateFilter.setFullYear(1970);
                break;
            case 'months':
                // Filter for reviews in the last 3 months
                dateFilter.setMonth(currentDateTime.getMonth() - 3);
                break;
            case 'days':
                // Filter for reviews in the last 7 days
                dateFilter.setDate(currentDateTime.getDate() - 7);
                break;
            case 'hrs':
                // Filter for reviews in the last 24 hrs
                dateFilter.setHours(currentDateTime.getHours() - 24);
                break;
        }

        // Retrieve all reviews
        const allReviews = await Promise.all(
            Array(parseInt(reviewsCount)).fill()
                .map((object, index) => {
                    return vendor.methods.getReview(productID, index).call();
                }));

        // Filter the reviews by date
        const reviews = allReviews.filter(
            review => new Date(review[3]) > dateFilter);

        // Get number of reviews returned by the filter
        reviewsCount = reviews.length;

        return { vendorAddress, productID, filter,
            visualise, product, reviewsCount, reviews };
    }

    getLabels(filter) {
        let labels = [];
        switch(filter) {
            case 'all':
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May',
                    'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                break;

            case 'months':
                const currentDate = new Date();
                for (let i = 90; i >= 0; i--) {
                    const labelDate = new Date();
                    labelDate.setDate(currentDate.getDate() - i);
                    const month = labelDate.toLocaleString('en-us', { month: 'short' });
                    const day = labelDate.getDate();
                    const labelDateStr = `${day} ${month}`;
                    labels.push(labelDateStr);
                }
                break;

            case 'days':
                break;

            case 'hrs':
                break;
        }

        return labels;
    }

    includeReview(review, filter) {
        const currentDateTime = new Date();
        const reviewDate = new Date(review[3]);
        const filterFromDate = new Date();
        switch(filter) {
            case 'all': // filter from last 12 months
                filterFromDate.setMonth(currentDateTime.getMonth() - 12);
                break;
            case 'months': // filter from 90 days ago
                filterFromDate.setMonth(currentDateTime.getDate() - 90);
                break;
            case 'days': // filter from last 7 days
                filterFromDate.setDate(currentDateTime.getDate() - 7);
                break;
            case 'hrs': // filter from last 24 hrs
                filterFromDate.setHours(currentDateTime.getHours() - 24);
                break;
        }

        return reviewDate > filterFromDate;
    }

    renderReviews() {
        const { filter, reviewsCount, reviews, visualise } = this.props;

        let items = [];

        // There may be no reviews for the item
        if (reviews.length === 0) {
            items = [{header: 'No reviews for this item yet.', fluid: true},];
            return <Card.Group items={items}/>;
        }

        if (visualise === '1') { // Visualise the review data
            const periods = {'all': 12, 'months': 90, 'days': 7, 'hrs': 24};
            // Create array of counts for each period of time, defaulting each to zero
            const reviewsPerTimePeriod = Array(periods[filter]).fill(0);
            let avgRatingsPerPeriod = Array(periods[filter]).fill(0);

            let labels; // chart labels
            let chartData;

            switch(filter) {
                case 'all':
                    const last12Months = reviews.filter(
                        review => this.includeReview(review, filter));

                    last12Months.map((review, index) => {
                        const month = new Date(review[3]).getMonth();
                        reviewsPerTimePeriod[month]++;
                    });

                    last12Months.map((review, index) => {
                        const month = new Date(review[3]).getMonth();
                        avgRatingsPerPeriod[month] += parseInt(review[5]);
                    });

                    avgRatingsPerPeriod = avgRatingsPerPeriod.map(
                        (totalRatings, index) => {
                            return totalRatings / reviewsPerTimePeriod[index];
                    });

                    labels = this.getLabels(filter);
                    // chartData = avgRatingsPerPeriod;
                    chartData = reviewsPerTimePeriod;
                    break;

                case 'months':
                    const last12Weeks = reviews.filter(
                        review => this.includeReview(review, filter));

                    labels = this.getLabels(filter);

                    last12Weeks.map((review, index) => {
                        const reviewDate = new Date(review[3]);
                        const month = reviewDate.toLocaleString(
                            'en-us', { month: 'short' });
                        const day = reviewDate.getDate();

                        const dateStr = `${day} ${month}`;

                        const dateIndex = labels.findIndex((dateLabel) => {
                            return dateLabel === dateStr;
                        });

                        reviewsPerTimePeriod[dateIndex]++;
                    });

                    chartData = reviewsPerTimePeriod;
                    break;

                case 'days':
                    break;

                case 'hrs':
                    break;
            }

            const data = {
                labels: labels,
                datasets: [{
                    label: '# of reviews',
                    data: chartData,
                    borderColor: '#3e95cd',
                    fill: false
                }]
            };

            const options = {
                title: {
                    display: true,
                    text: "Reviews"
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            };

            return <Line data={data} options={options} width="1100" height="400" />

        } else {
            // Render the list of reviews

            items = reviews.map((review, index) => {
                // let date = new Date(review[3] * 1000);
                const date = new Date(review[3]);  // re-capture the original review date/time
                return {
                    meta: `${date}`,
                    description: (
                        <div>
                            <Rating icon="star" defaultRating={review[5]} maxRating={5} disabled/>
                            <br/><br/>
                            {review[4]}
                        </div>
                    ),
                    fluid: true
                };
            });

            return <Card.Group items={items}/>;
        }
    }

    // filter the reviews for the period specified (24hrs, 7 days, 3 months, all-time)
    async filterReviews(filter) {
        const { vendorAddress, productID, visualise } = this.props;
        Router.replaceRoute(`/reviews/${vendorAddress}/${productID}/${filter}/${visualise}/show`);
    }

    renderStatsButtons() {

        return (
            <Button.Group>
                <Button
                    basic
                    content="all time"
                    onClick={event => this.filterReviews('all')}
                />
                <Button
                    basic
                    content='last 3 months'
                    onClick = {event => this.filterReviews('months')}
                />
                <Button
                    basic
                    content='last 7 days'
                    onClick = {event => this.filterReviews('days')}
                />
                <Button
                    basic
                    content='last 24hrs'
                    onClick = {event => this.filterReviews('hrs')}
                />
            </Button.Group>
        );
    }

    render() {

        const { vendorAddress, productID, filter, visualise } = this.props;
        const  btnContent  = (visualise === '1') ? 'Visualised' : 'Visualise';
        const btnAction = (visualise === '1') ? '0' : '1';

        return (
            <Layout>
                <div key={this.props.reviews.length}>
                    <h3>Reviews for -{this.props.product.title}-</h3>
                    <Message
                        info
                        compact
                        content="TrueReview compliant"
                    />
                    <br />
                    {this.renderStatsButtons()} {this.props.reviews.length} reviews found
                    <Button
                        primary
                        content={btnContent}
                        onClick = {event => {
                            Router.pushRoute(`/reviews/${vendorAddress}/${productID}/${filter}/${btnAction}/show`);
                        }}
                        style={{ marginLeft: '40px' }}
                    />
                    <Divider />
                    {this.renderReviews()}
                </div>
            </Layout>
        );
    }
}

export default ProductReviews;