import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WeatherService } from './weather.service';
import * as moment from 'moment';
import { WEATHER_DESCRIPTIONS, WEATHER_ICONS, getDayName } from './common';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WeatherService]
    });
    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve weather data for given latitude and longitude', () => {
    const latitude = 40.712776;
    const longitude = -74.005974;
    const currentHour = `${moment().format('YYYY-MM-DDTHH')}:00`;
    const currentDay = moment().format('YYYY-MM-DD');
    const mockResponse = {
      current_weather: {
        temperature: 27.0,
        weathercode: 0,
      },
      hourly: {
        time: [currentHour],
        temperature_2m: [27.0],
        weathercode: [0],
      },
      daily: {
        time: [currentDay],
        weathercode: [0],
      },
    };

    service.getWeather(latitude, longitude).subscribe((response: any) => {
      const temperature = response.current_weather.temperature;
      const weathercode = response.current_weather.weathercode;

      expect(response.hourly.time).toContain(currentHour);
      expect(response.hourly.temperature_2m).toContain(temperature);
      expect(response.hourly.weathercode).toContain(weathercode);
      expect(response.daily.time).toContain(currentDay);
      expect(response.daily.weathercode).toContain(weathercode);
    });

    const req = httpMock.expectOne(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should add weather data to the forecast', () => {
    const currentHour = `${moment().format('YYYY-MM-DDTHH')}:00`;
    const currentDay = moment().format('YYYY-MM-DD');

    const data = {
      current_weather: {
        temperature: 27.0,
        weathercode: 0,
      },
      hourly: {
        time: [currentHour],
        temperature_2m: [27.0],
        weathercode: [0],
      },
      daily: {
        time: [currentDay],
        weathercode: [0],
        temperature_2m_max: [30],
        temperature_2m_min: [10],
      },
    };
    const forecast = {
      latitude: 0,
      longitude: 0,
      city_name: '',
      current: {
        day_name: 'Today',
        temperature: 0,
        temperature_max: 0,
        temperature_min: 0,
        weathercode: 0,
        weathercode_description: '',
        imageUrl: '',
        aqi: 67,
        aqi_description: 'Moderate',
        aqi_color: 'moderate'
      },
      hourly: {
        [currentHour]: {
          day_name: 'Today',
          temperature: 0,
          temperature_max: 0,
          temperature_min: 0,
          weathercode: 0,
          weathercode_description: '',
          imageUrl: '',
          aqi: 67,
          aqi_description: 'Moderate',
          aqi_color: 'moderate',
        }
      },
      daily: {
        [currentDay]: {
          day_name: 'Today',
          temperature: 0,
          temperature_max: 0,
          temperature_min: 0,
          weathercode: 0,
          weathercode_description: '',
          imageUrl: '',
          aqi: 67,
          aqi_description: 'Moderate',
          aqi_color: 'moderate',
        }
      }
    };
    const expectedForecast = {
      current: {
        day_name: getDayName(currentDay),
        temperature: data.current_weather.temperature,
        temperature_max: data.current_weather.temperature,
        temperature_min: data.current_weather.temperature,
        weathercode: 0,
        weathercode_description: WEATHER_DESCRIPTIONS[data.current_weather.weathercode],
        imageUrl: `/assets/images/${WEATHER_ICONS[data.current_weather.weathercode]}`,
        aqi: 67,
        aqi_description: 'Moderate',
        aqi_color: 'moderate'
      },
      daily: {
        [currentDay]: {
          temperature_max: data.daily.temperature_2m_max[0],
          temperature_min: data.daily.temperature_2m_min[0],
        }
      },
    };

    const result = service.addWeatherData(data, forecast);

    expect(result.current.temperature).toEqual(expectedForecast.current.temperature);
    expect(result.current.weathercode).toEqual(expectedForecast.current.weathercode);
    expect(result.current.weathercode_description).toEqual(expectedForecast.current.weathercode_description);
    expect(result.current.imageUrl).toEqual(expectedForecast.current.imageUrl);
    expect(result.daily[currentDay].temperature_max).toEqual(expectedForecast.daily[currentDay].temperature_max);
    expect(result.daily[currentDay].temperature_min).toEqual(expectedForecast.daily[currentDay].temperature_min);
  });
});
