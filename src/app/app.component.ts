import { Component, OnInit } from '@angular/core';
import { Forecast, USA_STATE_CAPITAL_NAMES, Coordinate } from './common';
import { WeatherService } from './weather.service';
import { GeocodingService } from './geocoding.service';
import { PollutionService } from './pollution.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'weather-forecast';
  newCity = '';
  currentCoordinate: Coordinate & { cityName: string } = { latitude: 0, longitude: 0, cityName: '' };
  cities: Forecast[] = [];
  
  constructor(
    private weatherService: WeatherService,
    private geocodingService: GeocodingService,
    private pollutionService: PollutionService,
  ) {
    this.cities = [];
  }

  ngOnInit(): void {
    this.geocodingService.getCurrentPosition()
      .subscribe((location: Coordinate & { cityName: string }) => {
        if (location.cityName) {
          this.currentCoordinate = location;
          this.getForecast(this.currentCoordinate.cityName, this.currentCoordinate.latitude, this.currentCoordinate.longitude);
        }
      });
  }

  addUsaStateCapitals() {
    USA_STATE_CAPITAL_NAMES.forEach(city => this.addCity(city));
  }

  addCity(city: string = this.newCity) {
    if (city && !this.isCityInList(city)) {

      //getting longitude and latitude based on name
      this.geocodingService.getCoordinates(city)
        .subscribe(data => {
          if (data.results.length > 0) {
            const location = data.results[0].geometry.location;
            
            this.getForecast(city, location.lat, location.lng);
            
          } else {
            this.newCity = '';
          }
        });
    }
  }

  private getForecast(city: string, latitude: number, longitude: number) {
    //getting air quality index based on latitude and longitude
    this.pollutionService.getAirQualityIndex(latitude, longitude)
    .subscribe(data => {
      const pollution = this.pollutionService.addAirQualityData(data);

      //getting weather forecast based on latitude and longitude
      this.weatherService.getWeather(latitude, longitude)
        .subscribe(data => {
          const forecast = this.weatherService.addWeatherData(data, pollution);

          const newForecast: Forecast = {
            ...forecast,
            city_name: city.toUpperCase(),
            latitude: parseFloat(latitude.toFixed(2)),
            longitude: parseFloat(longitude.toFixed(2)),
          };

          this.cities.push(newForecast);
          this.newCity = '';
        });
    });
  }

  isCityInList(cityName: string): boolean {
    return this.cities.some(city => city.city_name.toLowerCase() === cityName.toLowerCase());
  }
}
