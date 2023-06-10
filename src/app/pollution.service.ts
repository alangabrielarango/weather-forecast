import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { AriQualityApiResponse, DEFAULT_DATA, Forecast, Weather, getDayName } from './common';

@Injectable({
  providedIn: 'root'
})
export class PollutionService {

  constructor(private http: HttpClient) { }

  getAirQualityIndex(latitude: number, longitude: number): Observable<any> {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=us_aqi&timezone=auto`
    return this.http.get(url);
  }

  addAirQualityData(data: AriQualityApiResponse): Forecast {
    // this.forecast.current.aqi = this.forecast.hourly[`${moment().format('YYYY-MM-DDTHH')}:00`].aqi;
    //       this.forecast.current.aqi_description = this.forecast.hourly[`${moment().format('YYYY-MM-DDTHH')}:00`].aqi_description;
    const hourlyAiq = data.hourly.time.reduce((acc, t, index) => ({
      ...acc,
      [t]: {
        day_name: getDayName(t),
        temperature: 0,
        temperature_max: 0,
        temperature_min: 0,
        weathercode: 0,
        weathercode_description: '',
        imageUrl: '',
        aqi: data.hourly.us_aqi[index],
        aqi_description: this.getAqiDescription(data.hourly.us_aqi[index]),
        aqi_color: this.getAqiColorClass(data.hourly.us_aqi[index]),
      },
    }), {} as Forecast['hourly']);

    const currentHourIndex = data.hourly.time.indexOf(`${moment().format('YYYY-MM-DDTHH')}:00`);
    const currentAqi = data.hourly.us_aqi[currentHourIndex];

    return {
      ...DEFAULT_DATA,
      current: {
        ...DEFAULT_DATA.current,
        aqi: currentAqi,
        aqi_description: this.getAqiDescription(currentAqi),
        aqi_color: this.getAqiColorClass(currentAqi),
      },
      daily: {
        [moment().format('YYYY-MM-DD')]: {
          day_name: 'Today',
          temperature: 0,
          temperature_max: 0,
          temperature_min: 0,
          weathercode: 0,
          weathercode_description: '',
          imageUrl: '',
          aqi: currentAqi,
          aqi_description: this.getAqiDescription(currentAqi),
          aqi_color: this.getAqiColorClass(currentAqi),
        }
      },
      hourly: hourlyAiq,
    };
  }

  getAqiDescription(index: number): string {
    if (index <= 50) {
      return 'Good';
    }
    if (index > 50 && index <= 100) {
      return 'Moderate';
    }
    if (index > 100 && index <= 150) {
      return 'Unhealthy for Sensitive Groups';
    }
    if (index > 150 && index <= 200) {
      return 'Unhealthy';
    }
    if (index > 200 && index <= 300) {
      return 'Very Unhealthy';
    }
    if (index > 300) {
      return 'Hazardous';
    }
    return '';
  }

  getAqiColorClass(index: number): string {
    if (index <= 50) {
      return 'good';
    }
    if (index > 50 && index <= 100) {
      return 'moderate';
    }
    if (index > 100 && index <= 150) {
      return 'sensitive';
    }
    if (index > 150 && index <= 200) {
      return 'unhealthy';
    }
    if (index > 200 && index <= 300) {
      return 'very-unhealthy';
    }
    if (index > 300) {
      return 'hazardous';
    }
    return '';
  }
}


