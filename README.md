Google Maps Place Fetcher
=========================

* This application gets all the places (within API requirements) in a rectangle that you draw on map.
* Main approach is to divide rectangular into **n x n** partitions and search each of them with [Place Radar Search](https://developers.google.com/maps/documentation/javascript/examples/place-radar-search).

## Build & Start

### Requirements 
* [Node.js](http://nodejs.org/) 

### Installation

#### Local
```sh
npm install
npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

#### Heroku

Alternatively, you can deploy to Heroku using this button:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/onuryilmaz/google-maps-fetcher) 
