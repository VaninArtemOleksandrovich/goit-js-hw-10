import './css/styles.css';
import { fetchCountries } from './js/fetch-countries';
import debounce from 'lodash.debounce';
import { Notify } from 'notiflix';

const refs = {
  input: document.querySelector('input#search-box'),
  countryList: document.querySelector('.country-list'),
  countryInfo: document.querySelector('.country-info'),
};

const DEBOUNCE_DELAY = 300;
const searchParams = new URLSearchParams({
  fields: 'name,capital,population,flags,languages',
});

refs.input.addEventListener('input', debounce(onInputSearch, DEBOUNCE_DELAY));

function onInputSearch(e) {
  let searchName = e.target.value.trim();

  if (searchName === '') {
    clearHTML('countryList', 'countryInfo');
    return;
  }

  fetchCountries(
    `https://restcountries.com/v3.1/name/${searchName}?${searchParams}`
  )
    .then(data => {
      if (data.length > 10) {
        removeMarkup('countryList', 'countryInfo');
        Notify.warning(
          'Too many matches found. Please enter a more specific name'
        );
        return;
      }
      if (data.length >= 2 && data.length <= 10) {
        removeMarkup('countryInfo');
        refs.countryList.innerHTML = createListMarkup(data);
      }
      if (data.length === 1) {
        removeMarkup('countryList');
        refs.countryInfo.innerHTML = createCountryMarkup(data);
      }
    })
    .catch(error => {
      removeMarkup('countryList', 'countryInfo');
      Notify.failure('Oops, there is no country with that name');
      console.log(error);
    });
}

function createListMarkup(data) {
  return data
    .map(
      country =>
        `<li class="country-item">
      <img class="cards-img" src="${country.flags.svg}" alt="Flag of ${country.name.official}" width="20", height="20"/>
      <p clas="cards-text">${country.name.official}</p>
    </li>`
    )
    .join('');
}

function createCountryMarkup(data) {
  const { flags, capital, population, languages, name } = data[0];

  return `
  <h2 class="title"><img src="${flags.svg}" alt="Flag of ${name.official}" width="100", height="60"/>${name.official}</h2>
  <ul class="country-list">
    <li>
      <p><span>🌏Capital: </span>${capital}</p>
    </li>
    <li>
      <p><span>🚶Population: </span>${population}</p>
    </li>
    <li>
      <p><span>🗣Languages: </span>${Object.values(languages).join(', ')}</p>
    </li>
  </ul>`;
}

function removeMarkup(refKey1 = '', refKey2 = '') {
  refs[refKey1].innerHTML = '';
  if (refKey2 === '') return;
  refs[refKey2].innerHTML = '';
}
