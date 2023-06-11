import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Coordinate } from './common';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private apiKey = '';

  constructor(private http: HttpClient) {}

  getCoordinates(city: string): Observable<any> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${this.apiKey}`;
    return this.http.get(url);
  }

  getCurrentPosition(): Observable<Coordinate & { cityName: string }> {
    return new Observable((observer) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}`;
            this.http.get(url).subscribe(
              (response: any) => {
                if (response.results && response.results.length > 0) {
                  const cityName = this.extractCity(response);
                  observer.next({ latitude, longitude, cityName });
                  observer.complete();   
                }
              },
              error => {
                console.error('Error getting geolocation:', error);
                observer.error(error);
              }
            );
          },
          error => {
            console.error('Error getting geolocation:', error);
            observer.error(error);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
        observer.error('Geolocation is not supported by this browser.');
      }
    });
  }

  private extractCity(response: any) {
    const addressComponents = response.results[0].address_components;
    for (const component of addressComponents) {
      if (component.types.includes('locality')) {
        return component.long_name;
      }
    }
    return 'Your City';
  }
}
