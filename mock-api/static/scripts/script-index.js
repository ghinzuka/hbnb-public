document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    loadCountries();

    document.getElementById('country-filter').addEventListener('change', (event) => {
        filterPlaces(event.target.value);
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

    if (!token) {
        loginLink.style.display = 'inline-block';
    } else {
        loginLink.style.display = 'none';
        fetchPlaces(token);
    }
}

// Function to get a cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

let allPlaces = [];

// Function to fetch places data from the server
async function fetchPlaces(token) {
    try {
        const response = await fetch('http://127.0.0.1:5000/places', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Include the JWT token in the request
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const places = await response.json();
            allPlaces = places; // Parse JSON response
            displayPlaces(places); // Populate places list
        } else {
            console.error('Error fetching places:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching places:', error);
    }
}

// Function to display the list of places
function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    placesList.innerHTML = ''; // Clear existing content

    places.forEach(place => {
        const imageUrl = place.image_url ? place.image_url : '/static/images/default.jpg';
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
        placesList.appendChild(placeDiv); // Append place element
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
