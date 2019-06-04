
import React from 'react';
import { Container } from 'semantic-ui-react';
import Header from './header';
import Footer from './footer';
import Head from 'next/head';

// This is the layout used on all pages

export default props => {
    return (
        <Container>

            <Head>
                <link
                    rel="stylesheet"
                    href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
                />
            </Head>

            <Header />
            {props.children}
            <Footer />
        </Container>
    );
};