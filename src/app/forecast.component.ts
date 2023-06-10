import { Component, Input } from '@angular/core';
import { Forecast } from './common';

@Component({
  selector: 'forecast-list',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss']
})
export class ForecastComponent {
  @Input() cities!: Forecast[];

  removeCity(city: Forecast) {
    const index = this.cities.indexOf(city);
    if (index !== -1) {
        this.cities.splice(index, 1);
    }
  }
}