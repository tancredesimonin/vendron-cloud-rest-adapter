'use strict';
// const fs = require('fs');
// const path = require('path');
/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

module.exports = () => {
    // let swaggerDefault = {
    //     info: {
    //         version: "1.0.0",
    //         title: "DOCUMENTATION",
    //         description: "",
    //         termsOfService: "YOUR_TERMS_OF_SERVICE_URL",
    //         contact: {
    //           name: "TEAM",
    //           email: "contact-email@something.io",
    //           url: "mywebsite.io"
    //         },
    //         license: {
    //           name: "Apache 2.0",
    //           url: "https://www.apache.org/licenses/LICENSE-2.0.html"
    //         }
    //       }
    // }
    // let servers = [];
    // if (process.env.LOCAL_API_URL) {
    //     servers.push({
    //         url: process.env.LOCAL_API_URL,
    //         description: "Local server"
    //       })
    // } else {
    //     servers.push({
    //         url: 'http://localhost:1337',
    //         description: "Local server"
    //       })
    // }
    // if (process.env.DEVELOPMENT_API_URL) {
    //     servers.push({
    //         url: process.env.DEVELOPMENT_API_URL,
    //         description: "Development server"
    //       })
    // }
    // if (process.env.PRODUCTION_API_URL) {
    //     servers.push({
    //         url: process.env.PRODUCTION_API_URL,
    //         description: "Production server"
    //       })
    // }

    // const doc = JSON.stringify({...swaggerDefault, servers: servers });

    // fs.writeFile(path.resolve(__dirname, '../../extensions/documentation/config/settings.json'), doc, 'utf8', (err) => {

    //     if (err) {
    //         console.log(`Error writing file: ${err}`);
    //     } else {
    //         console.log(`Doc settings written successfully!`);
    //     }
    
    // });
};
