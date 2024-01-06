apiKey = "aaaaf0757f794ee3bde4ae02d78758d9";
//weatherBit businessTrial Expires 2023-11-25.   ApiKey som tar 50 anrop per dag som är gratis: 6608ee5e4062456eae1111c14100a819
//Skulle det vara något problem med apianropet för google(ska gälla 90-dagar så bör inte vara något problem) kontakta mig gärna!

let TodayContent = document.getElementById('today-content');
let TomorrowContent = document.getElementById('forcast-content');
let weatherUpdate = document.getElementById('last-update');
let websiteImg = document.getElementById('website-pic');
let sunriseSunsetImg = document.getElementById('sunset-sunrise-img');
let currentDayIndex = 0;
let lng;
let lat;

  let autocomplete = new google.maps.places.Autocomplete(document.getElementById('search-city'), {
    types: ['(cities)'],
  });

google.maps.event.addListener(autocomplete, 'place_changed', function () {
  handlePlaceChanged();
});

async function handlePlaceChanged() {
  let place = autocomplete.getPlace();
  if (place.geometry) {
      let lat = place.geometry.location.lat();
      let lng = place.geometry.location.lng();

      getWeatherDataByGeoLocation(lng, lat);
  }
}

let locationButton = document.getElementById('weather-by-user-location-btn');
locationButton.addEventListener('click', getWeatherDataByUserLocation);

function weatherToday(currentWeatherData){
  let weatherTodayHTML = "";
  let weatherDescription = currentWeatherData.data[0].weather.description;
  let weatherIcon = currentWeatherData.data[0].weather.icon;
  let weatherTemp = currentWeatherData.data[0].temp;
  let weatherCityName = currentWeatherData.data[0].city_name;
  let partOfDay = currentWeatherData.data[0].pod;

  weatherTodayHTML += `
    <article>
      <h4>Vädret i ${weatherCityName} just nu:</h4>
      <p>${weatherTemp}&#176;</p>
      <p>${weatherDescription}</p>
      <img src="icons/${weatherIcon}.svg">
    </article>`;

  TodayContent.innerHTML = weatherTodayHTML;
}

function displayWeatherForecast(forcastData) {
  let forecastHTML = "";

  for (let i = 1; i < 6; i++) {
    let forecastDay = forcastData.data[i];
    let weatherDescription = forecastDay.weather.description;
    let weatherIcon = forecastDay.weather.icon;
    let weatherTemp = forecastDay.temp;
    let date = forecastDay.valid_date;
    let cityName = forcastData.city_name;

    forecastHTML += `
      <article>
        <h4>Väderprognosen för ${cityName} ${date}:</h4>
        <p>${weatherTemp}&#176;</p>
        <p>${weatherDescription}</p>
        <img src="icons/${weatherIcon}.svg">
      </article>`;
  }

  TomorrowContent.innerHTML = forecastHTML;
}


async function getWeatherDataByGeoLocation(longitude, latitude) {
  clearError();
  let currentWeatherUrl = `https://api.weatherbit.io/v2.0/current?key=${apiKey}&lang=sv&include=minutely&lat=${latitude}&lon=${longitude}`;
  let forcastWeatherUrl = `https://api.weatherbit.io/v2.0/forecast/daily?key=${apiKey}&lang=sv&lat=${latitude}&lon=${longitude}`;

  let currentWeather = await fetch(currentWeatherUrl);
  let forCast = await fetch(forcastWeatherUrl);

  if (!currentWeather.ok) {
    console.error('Error fetching current weather data:', currentWeather.status, currentWeather.statusText);
    throw new Error('Error fetching current weather data');
  }
  if (!forCast.ok) {
    console.error('Error fetching current weather data:', forCast.status, forCast.statusText);
    throw new Error('Error fetching forecast data');
  }

  let currentWeatherData = await currentWeather.json();
  let forCastData = await forCast.json();

  latestUpdate(currentWeatherData);
  weatherToday(currentWeatherData);
  displayWeatherForecast(forCastData);
  // forCastTomorrow(forCastData);
  websitePicChangePod(currentWeatherData.data[0].pod);
  fontColorChangePod(currentWeatherData.data[0].pod);
  backgroundChange(currentWeatherData.data[0].weather.description, currentWeatherData.data[0].pod);
  createButtons();
  clear();
}

async function getWeatherDataByUserLocation() {
  clearError();

  if ("geolocation" in navigator) {
    document.getElementById('errormsg-platsinfo').style.display = "none";
    navigator.geolocation.getCurrentPosition(

      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        await getWeatherDataByGeoLocation(lng, lat);
      },
      (error) => {

        console.error("Error getting user location:", error);
        let errormsgLocation = document.getElementById('errormsg-platsinfo');
        errormsgLocation.style.display = "block";
      }
    );

  } else {
    console.error("Geolocation is not supported by this browser.");
  }
}

// function createButtons() {
//   // Create next and previous buttons
//   let buttonsContainer = document.getElementById('buttons-container');
//   buttonsContainer.innerHTML = ''; // Clear previous buttons

//   let nextButton = document.createElement('button');
//   nextButton.textContent = 'Next';
//   nextButton.id = 'next-button';
//   nextButton.addEventListener('click', showNextDay);

//   let prevButton = document.createElement('button');
//   prevButton.textContent = 'Previous';
//   prevButton.id = 'prev-button';
//   prevButton.addEventListener('click', showPreviousDay);

//   // Append buttons to the container
//   buttonsContainer.appendChild(prevButton);
//   buttonsContainer.appendChild(nextButton);


function latestUpdate(currentWeatherData){
  let latest_Update = currentWeatherData.data[0].ob_time;
  weatherUpdate.innerHTML = "Senast Uppdaterat: "+ latest_Update ; 
}


function backgroundChange(weatherDescription, partOfDay) {
  if(partOfDay === "n"){
    document.body.style.backgroundImage = "url('night3.jpg')";
  }else if (weatherDescription === "Klar himmel") {
    document.body.style.backgroundImage = "url('klarhimmel.jpg')";
  } else if (weatherDescription === "Mulet") {
    document.body.style.backgroundImage = "url('mulet.jpg')";
  } else if (weatherDescription === "Duggregn" || weatherDescription === "Lätt regn" || weatherDescription === "Regn" || weatherDescription === "Kraftigt regn" ) {
    document.body.style.backgroundImage = "url('rain.jpg')";
  } else if(weatherDescription === "Åskväder"){
    document.body.style.backgroundImage = "url('åska.jpg')";
    document.body.style.color ="white";
  } else {
    document.body.style.backgroundImage = "url('bakgrund2.jpg')";
  }
}

function fontColorChangePod(partOfDay){

if(partOfDay === "n"){
  document.body.style.color ="white";
}else{
   document.body.style.color ="black";
  }
}


function websitePicChangePod(partOfDay){
  if(partOfDay === "n"){
    websiteImg.src = "moon.png";
    
  }else{
    websiteImg.src = "sol.png";
    
    }
  }

function clear() {
  document.getElementById('search-city').value = "";
  } 

function clearError(){
  document.getElementById('error-message').style.display = 'none';
  document.getElementById('errormsg-platsinfo').style.display = 'none';
}

  let inputValue = document.getElementById('search-city').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      inputValue = this.value.trim();
  
      if (inputValue === '') {

         document.getElementById('error-message').innerText = 'Tomt sökfält. Vänligen gör om din sökning och välj en plats från förslagen i listan.';
         document.getElementById('error-message').style.display = 'block';
      } else {
         document.getElementById('error-message').innerText = 'Ogiltig plats. Vänligen välj en plats från förslagen i listan.';
         document.getElementById('error-message').style.display = 'block';
      }
    }
  });

  // function forCastTomorrow(forCastData){
//   let weatherTomorrowHTML = "";
//   let ForCast_weatherDescription = forCastData.data[1].weather.description;
//   let ForCast_weatherIcon = forCastData.data[1].weather.icon;
//   let ForCast_weatherTemp = forCastData.data[1].temp;
//   let ForCast_date = forCastData.data[1].valid_date;
//   let ForCast_cityName = forCastData.city_name;

//   weatherTomorrowHTML += `
//     <article>
//       <h4>Väderprognosen för ${ForCast_cityName} ${ForCast_date}:</h4>
//       <p>${ForCast_weatherTemp}&#176;</p>
//       <p>${ForCast_weatherDescription}</p>
//       <img src="icons/${ForCast_weatherIcon}.svg">
//     </article>`;

//   TomorrowContent.innerHTML = weatherTomorrowHTML;

// }
