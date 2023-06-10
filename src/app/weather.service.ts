import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Forecast, WEATHER_DESCRIPTIONS, WEATHER_ICONS, WeatherApiResponse, getDayName } from './common';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(private http: HttpClient) { }

  getWeather(latitude: number, longitude: number): Observable<any> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`
    return this.http.get(url);
  }

  addWeatherData(data: WeatherApiResponse, forecast: Forecast): Forecast {
    const hourlyWeather = data.hourly.time.reduce((acc, t, index) => ({
      ...acc,
      [t]: { 
        ...forecast.hourly[t],
        day_name: getDayName(t),
        temperature: data.hourly.temperature_2m[index],
        temperature_max: data.hourly.temperature_2m[index],
        temperature_min: data.hourly.temperature_2m[index],
        weathercode: data.hourly.weathercode[index],
        weathercode_description: WEATHER_DESCRIPTIONS[data.hourly.weathercode[index]],
        imageUrl: `/assets/images/${WEATHER_ICONS[data.hourly.weathercode[index]]}`,
      }
    }), {} as Forecast['hourly']);

    const dailyWeather = data.daily.time.reduce((acc, t, index) => ({
      ...acc,
      [t]: { 
        ...forecast.daily[t],
        day_name: getDayName(t),
        temperature: parseFloat(((data.daily.temperature_2m_max[index] + data.daily.temperature_2m_min[index]) / 2).toFixed(1)),
        temperature_max: data.daily.temperature_2m_max[index],
        temperature_min: data.daily.temperature_2m_min[index],
        weathercode: data.daily.weathercode[index],
        weathercode_description: WEATHER_DESCRIPTIONS[data.daily.weathercode[index]],
        imageUrl: `/assets/images/${WEATHER_ICONS[data.daily.weathercode[index]]}`,
      }
    }), {} as Forecast['daily']);

    const currentDayIndex = data.daily.time.indexOf(moment().format('YYYY-MM-DD'));

    return {
      ...forecast,
      current: {
        ...forecast.current,
        temperature: data.current_weather.temperature,
        temperature_max: data.daily.temperature_2m_max[currentDayIndex],
        temperature_min: data.daily.temperature_2m_min[currentDayIndex],
        weathercode: data.current_weather.weathercode,
        weathercode_description: WEATHER_DESCRIPTIONS[data.current_weather.weathercode],
        imageUrl: `/assets/images/${WEATHER_ICONS[data.current_weather.weathercode]}`,
      },
      hourly: hourlyWeather,
      daily: dailyWeather,
    }
  }
}
