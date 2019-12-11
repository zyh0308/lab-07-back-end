'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;
const GEOCODE_API_Key = process.env.GOOGLE_API_KEY;
const superagent = require('superagent');

// LOCATION DATA

function FormattedData(query, location) {
  this.search_query = query;
  this.formatted_query = location.formatted_address;
  this.latitude = location.geometry.location.lat;
  this.longitude = location.geometry.location.lng;
}

app.get('/location', (request, response) => {
  const search_query = request.query.data;
  const urlToVisit = `https://maps.googleapis.com/maps/api/geocode/json?address=${search_query}&key=${process.env.GOOGLE_API_KEY}`;

  superagent.get(urlToVisit).then(responseFromSuper => {
    //console.log('stuff', responseFromSuper.body);

    const geoData = responseFromSuper.body;
    //console.log('geodata', geoData);
    const specificGeoData = geoData.results[0];
    const formattedQuery = specificGeoData.formatted_address;

    const lat = specificGeoData.geometry.location.lat;
    //console.log(lat);
    const lng = specificGeoData.geometry.location.lng;

    response.send(new FormattedData(search_query, formattedQuery, lat, lng));
  }).catch(error => {
    response.status(500).send(error.message);
    console.error(error);
  });
})


/// WEATHER ////
function FormattedTimeAndWeather(query, specificweather) {

  this.forecast = specificweather.summary;
  this.time = new Date(specificweather.time * 1000).toDateString();
}


app.get('/weather', handleWeatherRequest);


function handleWeatherRequest(request, response) {
  var arrDaysWeather = [];
  let query = request.query.data;
  const weatherData = require('./data/darksky.json');
  //console.log(weatherData.daily.data.length);

  // for (var x = 0; x < weatherData.daily.data.length; x++){
  //     console.log("weatherData.daily.data[x] is " + weatherData.daily.data[x])
  weatherData.daily.data.map(item => {
    var newWeather = new FormattedTimeAndWeather(query, item);
    arrDaysWeather.push(newWeather);
    return arrDaysWeather;
  });

  response.send(arrDaysWeather);
}












app.get('/*', function(request, response){
  response.status(404).send('Error Loading Results');
});

console.log('LOCATIONS END FIRING');

app.listen(PORT, () => {
  console.log('Port is working and listening  on port ' + PORT);
});