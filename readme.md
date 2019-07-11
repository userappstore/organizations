# Organizations for Dashboard

[Dashboard](https://github.com/userdashboard/dashboard) is a NodeJS project that provides a reusable account management system for web applications.  This module adds a complete user and administrator `Private API` and `Web UI` for user organizations.

## Import this module

Edit your `package.json` to activate the module:

    "dashboard": {
      "modules": [
        "@userdashboard/organizations
      ]
    }

Install the module with NPM:

    $ npm install @userdashboard/organizations

## Startup configuration variables

Check `start-dev.sh` to see the rest of the `env` variables that configure Dashboard:

    $ node main.js

# Dashboard

Dashboard proxies your application server to create a single website where pages like signing in or changing your password are provided by Dashboard.  Your application server can be anything you want, and use Dashboard's API to access data as required.  Using modules you can expand Dashboard to include organizations, subscriptions powered by Stripe, or a Stripe Connect platform.

- [Dashboard Wiki](https://github.com/userdashboard/dashboard/wiki)
- [Configuring Dashboard](https://github.com/userdashboard/dashboard/wiki/Configuring-Dashboard)
- [Dashboard code structure](https://github.com/userdashboard/dashboard/wiki/Dashboard-code-structure)
- [Server request lifecycle](https://github.com/userdashboard/dashboard/wiki/Server-Request-Lifecycle)
- [API access from application server](https://github.com/userdashboard/dashboard/wiki/API-access-from-application-server)
- [API access from module](https://github.com/userdashboard/dashboard/wiki/API-access-from-module)
- [API access from web browser](https://github.com/userdashboard/dashboard/wiki/API-access-from-web-browser)
- [Creating web applications with Dashboard](https://github.com/userdashboard/dashboard/wiki/Creating-web-applications-with-Dashboard)
- [Integrating Dashboard with existing web applications](https://github.com/userdashboard/dashboard/wiki/Integrating-Dashboard-with-existing-web-applications)
- [Creating modules for Dashboard](https://github.com/userdashboard/dashboard/wiki/Creating-modules-for-Dashboard)

### Case studies 

`Hastebin` is an open source pastebin web application.  It started as a service for anonymous guests only, and was transformed with Dashboard and modules into a web application for registered users, with support for sharing posts with organizations and paid subscriptions.

- [Hastebin - free web application](https://github.com/userdashboard/integration-examples/blob/master/hastebin/hastebin-saas-free.md)
- [Hastebin - subscription web application](https://github.com/userdashboard/integration-examples/blob/master/hastebin/hastebin-saas-subscription.md)

## Screenshots of Dashboard with Organizations

| ![Guest landing page](./src/www/public/1-organizations-landing-page.png?raw=true) | 
|:---------------------------------------------------------------------------------------------------------------:|
| Guest landing page that you replace with your own `/` route on your application server |

| ![Signed in home page](./src/www/public/2-organizations-signed-in.png?raw=true) |
|:---------------------------------------------------------------------------------------------------------------:|
| Signed in home page that you replace with your own `/home` route on your application server |

| ![Organization administration ](./src/www/public/3-organizations-administration.png?raw=true) |
|:---------------------------------------------------------------------------------------------------------------:|
| Organization administration |

## Dashboard modules

Additional APIs, content and functionality can be added by `npm install` and nominating Dashboard modules in your `package.json`.  You can read more about this on the [Dashboard configuration wiki page](https://github.com/userdashboard/dashboard/wiki/Configuring-Dashboard)

    "dashboard": {
      "modules": [ "package", "package2" ]
    }

Modules can supplement the global.sitemap with additional routes which automatically maps them into the `Private API` shared as global.api.

| Name | Description | Package   | Repository |
|------|-------------|-----------|------------|
| MaxMind GeoIP | IP address-based geolocation | [@userdashboard/maxmind-geoip](https://npmjs.com/package/userdashboard/maxmind-geoip)| [github](https://github.com/userdashboard/maxmind-geoip) |
| Organizations | User created groups | [@userdashboard/organizations](https://npmjs.com/package/userdashboard/organizations) | [github](https://github.com/userdashboard/organizations) |
| Stripe Subscriptions | SaaS functionality | [@userdashboard/stripe-subscriptions](https://npmjs.com/package/userdashboard/stripe-subscriptions) | [github](https://github.com/userdashboard/stripe-subscriptions) |
| Stripe Connect | Marketplace functionality | [@userdashboard/stripe-connect](https://npmjs.com/package/userdashboard/stripe-connect) | [github](https://github.com/userdashboard/stripe-connect)

#### Development

Development takes place on [Github](https://github.com/userdashboard/organizations) with releases on [NPM](https://www.npmjs.com/package/@userdashboard/organizations).

#### License

This is free and unencumbered software released into the public domain.  The MIT License is provided for countries that have not established a public domain.