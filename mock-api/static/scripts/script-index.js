document.addEventListener('DOMContentLoaded', () => {
    loadCountries();
    checkAuthentication(); 
    fetchPlaces(); 


    document.getElementById('country-filter').addEventListener('change', (event) => {
        filterPlaces(event.target.value);
    });


    document.getElementById('logout-button').addEventListener('click', () => {
        logout();
    });
});

async function loadCountries() {
    try {
        const response = await fetch('/data/countries.json');
        const countries = await response.json();

        const countryFilter = document.getElementById('country-filter');
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.name;
            option.textContent = country.name;
            countryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading countries:', error);
    }
}

function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');
    const logoutButton = document.getElementById('logout-button');

    if (!token) {
        loginLink.style.display = 'inline-block'; 
        logoutButton.style.display = 'none';
    } else {
        loginLink.style.display = 'none';
        logoutButton.style.display = 'inline-block';
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

let allPlaces = [];

async function fetchPlaces() {
    const token = getCookie('token'); 
    const headers = {
        'Content-Type': 'application/json'
    };


    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/places', {
            method: 'GET',
            headers: headers 
        });

        if (response.ok) {
            const places = await response.json();
            allPlaces = places; 
            displayPlaces(places); 
        } else {
            console.error('Error fetching places:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching places:', error);
    }
}

function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    placesList.innerHTML = ''; 

    places.forEach(place => {
        const imageUrl = place.image_url ? place.image_url : '/static/images/default.png';
        const placeDiv = document.createElement('div');
        
        placeDiv.className = 'place-card';
        placeDiv.dataset.country = place.country_name;
        placeDiv.innerHTML = `
            <img src="${imageUrl}" alt="${place.host_name}'s place" class="place-image">
            <h2>${place.id}</h2>
            <h3>${place.host_name}</h3>
            <p>Price per night: $${place.price_per_night}</p>
            <p>Location: ${place.city_name}, ${place.country_name}</p>
            <button class="details-button" data-id="${place.id}">View Details</button>
        `;
        placesList.appendChild(placeDiv); 
    });


    document.querySelectorAll('.details-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const placeId = event.target.dataset.id;
            window.location.href = `place.html?id=${placeId}`;
        });
    });
}

function filterPlaces(selectedCountry) {
    const filteredPlaces = selectedCountry === 'all' ? allPlaces : allPlaces.filter(place => place.country_name === selectedCountry);
    displayPlaces(filteredPlaces); 
}


function logout() {

    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    checkAuthentication();
    fetchPlaces();
}
