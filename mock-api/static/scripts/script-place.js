document.addEventListener('DOMContentLoaded', () => {
    const token = getCookie('token');
    const params = new URLSearchParams(window.location.search);
    const placeId = params.get('id');

    if (placeId) {
        fetchPlaceDetails(placeId, token);
    }

    checkAuthentication(token);

    document.getElementById('review-form').addEventListener('submit', function(event) {
        event.preventDefault();
        submitReview(placeId, token);
    });
});

function submitReview(placeId, token) {
    const reviewText = document.getElementById('review-text').value;
    const rating = document.getElementById('rating').value;

    fetch(`http://127.0.0.1:5000/places/${placeId}/reviews`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            review: reviewText,
            rating: rating
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.msg === 'Review added') {
            alert('Review submitted successfully!');
            location.reload();
        } else {
            alert('Error submitting review.');
        }
    })
    .catch(error => console.error('Error:', error));
}

function checkAuthentication(token) {
    const loginLink = document.getElementById('login-link');
    const addReviewSection = document.getElementById('add-review');
    const logoutButton = document.getElementById('logout-button');

    if (!token) {
        loginLink.style.display = 'inline-block';
        logoutButton.style.display = 'none';
        addReviewSection.style.display = 'none';

        const messageSection = document.createElement('p');
        messageSection.textContent = 'Please log in to add a review.';
        messageSection.style.color = 'red';
        addReviewSection.parentNode.insertBefore(messageSection, addReviewSection);
    } else {
        loginLink.style.display = 'none';
        logoutButton.style.display = 'inline-block';
        addReviewSection.style.display = 'block';
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function fetchPlaceDetails(placeId, token) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/places/${placeId}`, {
            method: 'GET',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const place = await response.json();
            displayPlaceDetails(place);
        } else {
            console.error('Error fetching place details:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching place details:', error);
    }
}

function displayPlaceDetails(place) {
    const placeDetailsSection = document.getElementById('place-details');
    
    const amenitiesIcons = {
        "WiFi": "wifi.png",
        "Pool": "pool.png",
        "Air Conditioning": "ac.png",
        "Fireplace": "fireplace.png",
        "Gym": "gym.png"
    };

    const amenitiesHtml = place.amenities.map(amenity => {
        const icon = amenitiesIcons[amenity];
        return icon ? `<img src="/static/images/${icon}" alt="${amenity}" class="amenity-icon" title="${amenity}">` : amenity;
    }).join(' ');

    placeDetailsSection.innerHTML = `
        <h1>${place.id}</h1>
        <div class="place-details-card">
            <img src="${place.image_url ? place.image_url : '/static/images/default.png'}" alt="${place.name}" class="place-image">
            <p><strong>Host:</strong> ${place.host_name}</p>
            <p><strong>Price per night:</strong> $${place.price_per_night}</p>
            <p><strong>Location:</strong> ${place.city_name}, ${place.country_name}</p>
            <p><strong>Description:</strong> ${place.description}</p>
            <p><strong></strong> ${amenitiesHtml}</p>
            <button id="display-more-button">Display More</button>
            <div id="additional-details" style="display: none;">
                <p><strong>Number of Rooms:</strong> ${place.number_of_rooms}</p>
                <p><strong>Number of Bathrooms:</strong> ${place.number_of_bathrooms}</p>
                <p><strong>Max Guests:</strong> ${place.max_guests}</p>
                <p><strong>Latitude:</strong> ${place.latitude}</p>
                <p><strong>Longitude:</strong> ${place.longitude}</p>
            </div>
        </div>
    `;

    document.getElementById('display-more-button').addEventListener('click', function() {
        const additionalDetails = document.getElementById('additional-details');
        if (additionalDetails.style.display === 'none') {
            additionalDetails.style.display = 'block';
            this.textContent = 'Display Less';
        } else {
            additionalDetails.style.display = 'none';
            this.textContent = 'Display More';
        }
    });

    const reviewsSection = document.getElementById('reviews');
    reviewsSection.innerHTML = '<h2>Reviews</h2>';
    if (place.reviews && place.reviews.length > 0) {
        place.reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';
            reviewCard.innerHTML = `
                <p><strong>${review.reviewer_name}:</strong></p>
                <p>${review.comment}</p>
                <p><strong>Rating:</strong> ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</p>
            `;
            reviewsSection.appendChild(reviewCard);
        });
    } else {
        reviewsSection.innerHTML += '<p>No reviews yet.</p>';
    }
}
