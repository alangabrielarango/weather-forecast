export interface Weather {
    day_name: string;
    temperature: number;
    temperature_max: number;
    temperature_min: number;
    weathercode: number;
    weathercode_description: string;
    imageUrl: string;
    aqi: number;
    aqi_description: string;
    aqi_color: string;
}

export interface Coordinate {
    latitude: number;
    longitude: number;
}

export interface AriQualityApiResponse {
    hourly: {
        time: Array<string>;
        us_aqi: Array<number>;
    }
}

export interface WeatherApiResponse {
    current_weather: {
        temperature: number;
        weathercode: number;
    }
    daily: {
        time: Array<string>;
        weathercode: Array<number>;
        temperature_2m_max: Array<number>;
        temperature_2m_min: Array<number>;
    },
    hourly: {
        time: Array<string>;
        weathercode: Array<number>;
        temperature_2m: Array<number>;
    }
}

export interface Forecast extends Coordinate {
    city_name: string;
    current: Weather;
    daily: Record<string, Weather>;
    hourly: Record<string, Weather>;
}
