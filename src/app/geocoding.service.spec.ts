import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { GeocodingService } from './geocoding.service';

describe('GeocodingService', () => {
  let service: GeocodingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GeocodingService]
    });
    service = TestBed.inject(GeocodingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve coordinates for a given city', () => {
    const city = 'New York';
    const mockResponse = {
      results: [
        {
          geometry: {
            location: {
              lat: 40.712776,
              lng: -74.005974
            }
          }
        }
      ]
    };

    service.getCoordinates(city).subscribe((response: any) => {
      expect(response.results[0].geometry.location.lat).toBe(40.712776);
      expect(response.results[0].geometry.location.lng).toBe(-74.005974);
    });

    const req = httpMock.expectOne(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${service['apiKey']}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
