document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const placeId = params.get('id');

    if (placeId) {
        fetchPlaceDetails(placeId);
    }
});

async function fetchPlaceDetails(placeId) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/places/${placeId}`);
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
    placeDetailsSection.innerHTML = `
        <h1>${place.name}</h1>
        <div class="place-details-card">
            <img src="${place.image_url ? place.image_url : '/static/images/default.jpg'}" alt="${place.name}" class="place-image">
            <p><strong>Host:</strong> ${place.host_name}</p>
            <p><strong>Price per night:</strong> $${place.price_per_night}</p>
            <p><strong>Location:</strong> ${place.city_name}, ${place.country_name}</p>
            <p><strong>Description:</strong> ${place.description}</p>
            <p><strong>Amenities:</strong> ${place.amenities.join(', ')}</p>
        </div>
    `;

    // Optionally, display reviews if they are part of the place details
    if (place.reviews && place.reviews.length > 0) {
        const reviewsSection = document.getElementById('reviews');
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
    }
}

