Vue.component('weather',{
    data() {
        return {
            loading: true,
            updateInterval: 10000,
            currentLocation: {
                city: '',
                state: '',
                zip: '',
                weather: {
                    summary: {
                        icon: 'sunny',
                        description: 'clear'
                    },
                    daily: {},
                    current: {}
                }
            }
        }
    },
    props: ['api','userLocation'],
    mounted() {
        if(this.userLocation.set) {
            this.getWeather();
            
            setInterval(() => {
                this.getWeather();
            }, this.updateInterval);

        } else {
            this.loading = false;
        }
    },
    methods: {
        setWeatherIcon(n) {
            
            const weatherConditions = [
                { icon: "wb_sunny", description: "Clear Sky", weather_code: 0 },
                { icon: "wb_cloudy", description: "Mainly Clear", weather_code: 1 },
                { icon: "partly_cloudy_day", description: "Partly Cloudy", weather_code: 2 },
                { icon: "cloud", description: "Overcast", weather_code: 3 },
                { icon: "foggy", description: "Fog", weather_code: 45 },
                { icon: "foggy", description: "Depositing Rime Fog", weather_code: 48 },
                { icon: "water_drop", description: "Light Drizzle", weather_code: 51 },
                { icon: "water_drop", description: "Moderate Drizzle", weather_code: 53 },
                { icon: "water_drop", description: "Dense Intensity Drizzle", weather_code: 55 },
                { icon: "ac_unit", description: "Light Freezing Drizzle", weather_code: 56 },
                { icon: "ac_unit", description: "Dense Freezing Drizzle", weather_code: 57 },
                { icon: "rainy", description: "Slight Rain", weather_code: 61 },
                { icon: "rainy", description: "Moderate Rain", weather_code: 63 },
                { icon: "rainy", description: "Heavy Rain", weather_code: 65 },
                { icon: "ac_unit", description: "Light Freezing Rain", weather_code: 66 },
                { icon: "ac_unit", description: "Heavy Freezing Rain", weather_code: 67 },
                { icon: "ac_unit", description: "Slight Snowfall", weather_code: 71 },
                { icon: "ac_unit", description: "Moderate Snowfall", weather_code: 73 },
                { icon: "ac_unit", description: "Heavy Snowfall", weather_code: 75 },
                { icon: "ac_unit", description: "Snow Grains", weather_code: 77 },
                { icon: "rainy", description: "Slight Rain Showers", weather_code: 80 },
                { icon: "rainy", description: "Moderate Rain Showers", weather_code: 81 },
                { icon: "rainy", description: "Violent Rain Showers", weather_code: 82 },
                { icon: "snowing", description: "Slight Snow Showers", weather_code: 85 },
                { icon: "snowing", description: "Heavy Snow Showers", weather_code: 86 },
                { icon: "thunderstorm", description: "Slight Thunderstorm", weather_code: 95 },
                { icon: "thunderstorm", description: "Thunderstorm with Slight Hail", weather_code: 96 },
                { icon: "thunderstorm", description: "Thunderstorm with Heavy Hail", weather_code: 99 }
            ];              

            const condition = weatherConditions.find(c => c.weather_code === n);

            return {
                icon: condition.icon || 'question_mark',
                description: condition.description || 'could not find current conditions.'
            }

        },
        getWeather() {

            if(!this.userLocation.set) {
                return;
            }

            this.api.endpoints.forecast.params.latitude = this.userLocation.coords.latitude;
            this.api.endpoints.forecast.params.longitude = this.userLocation.coords.longitude;
            this.api.endpoints.forecast.params.timezone = this.userLocation.timezone;
            var params = '';

            for (const [key, value] of Object.entries(this.api.endpoints.forecast.params)) {
                params += key+'='+value+'&';
            }

            params = params.slice(0, -1); 

            fetch(encodeURI(this.api.endpoints.forecast.url+'?'+params)).then(response => response.json()).then(data=>{
                
                this.currentLocation.weather.daily = data.daily;
                this.currentLocation.weather.current = data.current;
                this.currentLocation.weather.summary = this.setWeatherIcon(this.currentLocation.weather.current.weather_code);

                this.loading = false;
                
            });

        }
    },
    filters: {
        roundUp(n) {
            return Number(n).toFixed(0);
        },
        shortDate(d) {
            const date = new Date(d * 1000); // Convert Unix timestamp (in seconds) to milliseconds
            const month = date.getMonth() + 1; // Months are 0-indexed
            const day = date.getDate();
            return month+'/'+day;
        }
    },
    template: `<section class="min-vh-100 container-fluid">
        <div class="container align-items-center" v-if="!loading">
            <!-- interface displaying current weather conditions -->
            <div class="container align-items-center" style="padding-top:5%;">
                <!-- current weather display -->
                <div class="align-items-center mb-4">
                    <div class="text-center mx-auto p-3 rounded border shadow bg-white">
                        <a style="z-index:10;" @click="userLocation.set = false;" class="badge text-dark float-end m-2 bg-light">
                            <span class="material-symbols-outlined">edit</span>
                        </a>
                        <p class="text-start">Currently in {{ userLocation.city }}, {{ userLocation.state }}</p>
                        <span class="material-symbols-outlined current-weather-icon">{{ currentLocation.weather.summary.icon }}</span>
                        <p>{{ currentLocation.weather.summary.description }}, {{currentLocation.weather.current.temperature_2m | roundUp}}&deg; F</p>
                    </div>
                </div>
                <!-- forecast -->
                <p class="font-weight-bold badge bg-white text-dark">{{api.endpoints.forecast.params.forecast_days}} Day Forecast</p>
                <div class="mb-5 py-4 forecast">
                    <div class="daily" v-for="(w,index) in currentLocation.weather.daily.time">
                        <div class="p-2 h-100 border rounded shadow-sm m-1 bg-white">
                            <div>
                                <p>
                                    <span class="material-symbols-outlined float-end">{{ setWeatherIcon(currentLocation.weather.daily.weather_code[index]).icon }}</span>
                                    <span class="font-weight-bold">{{ w | shortDate}}</span>
                                </p>
                            </div>
                            <p>{{setWeatherIcon(currentLocation.weather.daily.weather_code[index]).description}}</p>
                            <div>
                                <span class="material-symbols-outlined text-sm">north</span>
                                <span> {{ currentLocation.weather.daily.temperature_2m_max[index] | roundUp }} </span>
                                <span class="material-symbols-outlined text-sm">south</span>
                                <span> {{ currentLocation.weather.daily.temperature_2m_min[index] | roundUp }} </span>
                            </div>
                        </div>                       
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="p-5 container text-center min-vh-100">
            <div class="spinner-border text-warning" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>    
        </div>
    </section>`
});