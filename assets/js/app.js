var app = new Vue({
    el: '#app',
    data: {
      api: {
        endpoints: {
          geoDB: {
            url: 'https://geolocation-db.com/json/',
            params: {}
          },
          geo: {
            // gets us the user location from a zip code...
            url: 'https://geocoding-api.open-meteo.com/v1/search/',
            params: {
              name: '',
              count: 10,
              language: 'en',
              format: 'json'
            }
          },
          forecast: {
            url: 'https://api.open-meteo.com/v1/forecast/',
            params: {
              latitude: 0,
              longitude: 0,
              daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weather_code',
              current: 'temperature_2m,is_day,precipitation,wind_speed_10m,cloud_cover,weather_code',
              temperature_unit: 'fahrenheit',
              wind_speed_unit: 'mph',
              precipitation_unit: 'inch',
              forecast_days: 7,
              timezone: '',
              timeformat: 'unixtime'
            }
          }
        }        
      },
      error: {
        visible: false,
        errorMessage: ''
      },
      userLocation: {
        search: {
          terms: '',
          results: []
        },
        granted: false,
        set: false,
        zip: null,
        city: null,
        state: null,
        timezone: 'America/New_York',
        coords: {
          latitude: 0,
          longitude: 0
        }
      },
      background: {
        options: ['./assets/img/lightning.jpg'],
        selected: 0
      },
      recents: [],
      loading: true
    },
    created() {
      if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');	
      }
      document.querySelector('body').style.backgroundImage = 'url('+this.background.options[this.background.selected]+')';
      this.loadLocation();
      if(localStorage.getItem('recentLocations') != null) {
        this.recents = JSON.parse(localStorage.getItem('recentLocations'));
      }
    },
    methods: {
      getUserLocation() {
        fetch(this.api.endpoints.geoDB.url).then(response => response.json()).then(data=>{
          this.userLocation.zip = data.postal;
          this.setLocationFromZip();
        });
      },
      searchLocations() {

        this.api.endpoints.geo.params.name = this.userLocation.search.terms;

        var params = '';

        for (const [key, value] of Object.entries(this.api.endpoints.geo.params)) {
            params += key+'='+value+'&';
        }

        fetch(this.api.endpoints.geo.url+'?'+params).then(response => response.json()).then(data=>{

          if(data.results.length < 1) {
            alert('no location found');return;
          } else {
            this.userLocation.search.results = data.results;
          }

        });


      },
      chooseLocation(zips) {

        this.userLocation.zip = zips[0];
        this.userLocation.search = {
          terms: '',
          results:[]
        };
        this.setLocationFromZip();

      },
      setLocationFromZip() {

        this.api.endpoints.geo.params.name = this.userLocation.zip;

        var params = '';

        for (const [key, value] of Object.entries(this.api.endpoints.geo.params)) {
            params += key+'='+value+'&';
        }

        params = params.slice(0, -1); 
        
        fetch(this.api.endpoints.geo.url+'?'+params).then(response => response.json()).then(data=>{

          if(data.results.length < 1) {
            alert('no location found');return;
          }
          this.userLocation.coords = {
            latitude: data.results[0].latitude,
            longitude: data.results[0].longitude
          }
          this.userLocation.city = data.results[0].name;
          this.userLocation.state = data.results[0].admin1;
          this.userLocation.timezone = data.results[0].timezone;
          this.userLocation.set = true;
          localStorage.setItem('userLocation', JSON.stringify(this.userLocation));

          if(localStorage.getItem('recentLocations') != null) {
            var r = JSON.parse(localStorage.getItem('recentLocations'));

            for(var i=0;i<r.length;i++) {
              if(r[i].zip == this.userLocation.zip) {
                return;
              }
            }

            r.push({
              city: this.userLocation.city,
              state: this.userLocation.state,
              zip: this.userLocation.zip
            });
                
          } else {
            var r = [{
              city: this.userLocation.city,
              state: this.userLocation.state,
              zip: this.userLocation.zip
            }];
          }

          localStorage.setItem('recentLocations',JSON.stringify(r));
          this.recents = r;

        });

      },
      loadLocation() {

        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
            this.userLocation = JSON.parse(savedLocation);
            this.loading = false;
            return;
        }

        this.userLocation.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.loading = false;

      }
    }
  });