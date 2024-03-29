'use strict';

// ////////////////////////////////////
// // APPLICATION

const form = document.querySelector('.form');
const sidebar = document.querySelector('.sidebar');
const inputCountry = document.querySelector('.form__input--country');
const errorEl = document.querySelector('.error');
const errorBtn = document.querySelector('.error-btn');
const errorMsg = document.querySelector('.error-message');

class App {
  map;
  country;
  mapZoomLevel = 11;

  constructor() {
    // Get users postion
    this._getposition();

    // Attach event handlers
    form.addEventListener('submit', this._formSubmit.bind(this));
    errorBtn.addEventListener(
      'click',
      this._displayError.bind('_', '_', false)
    );
    // errorBtn.addEventListener('click', function () {
    //   app._displayError('', false);
    // });
  }
  _displayError(err, show) {
    errorMsg.textContent = `${err}`;
    errorEl.style.display = `${show ? 'flex' : 'none'}`;
  }

  _getposition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          this._displayError(new Error(`Couldn't get position`), true);
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(
    //   `https://www.google.com/maps/@${latitude},${longitude},7z?entry=ttu`
    // );

    this.map = L.map('map').setView([latitude, longitude], this.mapZoomLevel);
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // Handling clicks on map
    this.map.on('mousedown', this._displayError.bind('_', '_', false));
  }

  _formSubmit(e) {
    e.preventDefault();
    this.country = inputCountry.value;

    this._getCountryData();
    this._displayError('_', false);
  }

  _renderSideBar(data) {
    const html = `
    <div class="country">
     
        <img src="${data.flags.svg}" class="country-flag" alt="${
      data.flags.alt
    }" />
          <div class="country-box">
              <h4 class="country-info country-name">${data.name.common}</h4>
                <div class="country-stats">
                  <span class="country-info country-population">Population: ${(
                    data.population / 1000000
                  ).toFixed(1)}M people</span>
                  <span class="country-info country-capital">Capital: ${[
                    data.capital,
                  ]}</span>
                  <span class="country-info country-language">Language: ${
                    Object.entries(data.languages)[0][1]
                  }</span>
                </div>
          </div>
      </div>
    
  `;
    sidebar.innerHTML = html;
  }

  _getCountryData() {
    // const request = new XMLHttpRequest();
    // request.open('GET', `https://restcountries.com/v3.1/name/${this.country}`);
    // request.send();

    fetch(`https://restcountries.com/v3.1/name/${this.country}`)
      .then(response => {
        if (!response.ok) throw new Error(`Country not found`);
        return response.json();
      })
      .then(
        function ([data]) {
          let coords = Object.entries(data.capitalInfo)[0][1];
          this.description = `${[data.capital]} is the capital of ${
            data.name.common
          }`;

          this.map.setView(coords, this.mapZoomLevel, {
            animate: true,
            pan: {
              duration: 1,
            },
          });
          this._renderWorkoutMarker(coords);
          this._renderSideBar(data);
        }.bind(this)
      )
      .catch(err => this._displayError(`${err} "${this.country}"`, true));
  }
  _renderWorkoutMarker(coords) {
    L.marker(coords)
      .addTo(this.map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent(`${this.description}`)
      .openPopup();
  }
}

const app = new App();

// request.addEventListener('load', function () {
//   const [data] = JSON.parse(this.responseText);
//   let coords = Object.entries(data.capitalInfo)[0][1];
//   app.description = `${[data.capital]} is the capital of ${
//     data.name.common
//   }`;
//   app.map.setView(coords, 13, {
//     animate: true,
//     pan: {
//       duration: 1,
//     },
//   });
//   app.renderWorkoutMarker(coords);
// });
