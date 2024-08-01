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
    placeDetailsSection.innerHTML = `
        <h1>${place.id}</h1>
        <div class="place-details-card">
            <img src="${place.image_url ? place.image_url : '/static/images/default.jpg'}" alt="${place.name}" class="place-image">
            <p><strong>Host:</strong> ${place.host_name}</p>
            <p><strong>Price per night:</strong> $${place.price_per_night}</p>
            <p><strong>Location:</strong> ${place.city_name}, ${place.country_name}</p>
            <p><strong>Description:</strong> ${place.description}</p>
            <p><strong>Amenities:</strong> ${place.amenities.join(', ')}</p>
        </div>
    `;

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
