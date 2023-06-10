import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { PollutionService } from './pollution.service';
import * as moment from 'moment';
import { Forecast } from './common';

describe('PollutionService', () => {
  let service: PollutionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PollutionService]
    });
    service = TestBed.inject(PollutionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve air quality index for given latitude and longitude', () => {
    const latitude = 40.712776;
    const longitude = -74.005974;
    const mockResponse = {
      hourly: {
        time: [
          `${moment().format('YYYY-MM-DDTHH')}:00`,
        ]
      }
    }

    service.getAirQualityIndex(latitude, longitude).subscribe((response: any) => {
      expect(response.hourly.time).toContain(`${moment().format('YYYY-MM-DDTHH')}:00`);
    });

    const req = httpMock.expectOne(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=us_aqi&timezone=auto`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should add air quality data to the forecast', () => {
    const currentHour = `${moment().format('YYYY-MM-DDTHH')}:00`;
    
    const data = { 
      hourly: {
        time: [
          currentHour,
        ],
        us_aqi: [
          67,
        ]
      }
    };

    const expectedForecast = { 
      current: {
        aqi: 67,
        aqi_description: 'Moderate',
        aqi_color: 'moderate'
      },
      hourly: {
        [currentHour]: {
          aqi: 67,
          aqi_description: 'Moderate',
          aqi_color: 'moderate',
        }
      },
    };

    const pollution = service.addAirQualityData(data);

    expect(pollution.current.aqi).toEqual(expectedForecast.current.aqi);
    expect(pollution.current.aqi_description).toEqual(expectedForecast.current.aqi_description);
    expect(pollution.current.aqi_color).toEqual(expectedForecast.current.aqi_color);
    expect(pollution.hourly[currentHour].aqi).toEqual(expectedForecast.hourly[currentHour].aqi);
    expect(pollution.hourly[currentHour].aqi_description).toEqual(expectedForecast.hourly[currentHour].aqi_description);
    expect(pollution.hourly[currentHour].aqi_color).toEqual(expectedForecast.hourly[currentHour].aqi_color);
  });

  it('should return the AQI description based on the index', () => {
    expect(service.getAqiDescription(25)).toBe('Good');
    expect(service.getAqiDescription(75)).toBe('Moderate');
    expect(service.getAqiDescription(125)).toBe('Unhealthy for Sensitive Groups');
    expect(service.getAqiDescription(175)).toBe('Unhealthy');
    expect(service.getAqiDescription(250)).toBe('Very Unhealthy');
    expect(service.getAqiDescription(350)).toBe('Hazardous');
  });

  it('should return the correct AQI color class based on the index', () => {
    expect(service.getAqiColorClass(25)).toBe('good');
    expect(service.getAqiColorClass(75)).toBe('moderate');
    expect(service.getAqiColorClass(125)).toBe('sensitive');
    expect(service.getAqiColorClass(175)).toBe('unhealthy');
    expect(service.getAqiColorClass(250)).toBe('very-unhealthy');
    expect(service.getAqiColorClass(350)).toBe('hazardous');
  });
});
