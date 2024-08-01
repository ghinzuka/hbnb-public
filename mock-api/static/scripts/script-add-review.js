document.addEventListener('DOMContentLoaded', () => {
    const token = checkAuthentication();

    document.getElementById('logout-button').addEventListener('click', () => {
        logout();
    });

    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const placeId = document.getElementById('place').value;
            const reviewText = document.getElementById('review').value;
            const rating = document.getElementById('rating').value;
            await submitReview(token, placeId, reviewText, rating);
        });
    }

    fetchPlaces();
});

function logout() {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    checkAuthentication();
}

function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');
    const logoutButton = document.getElementById('logout-button');

    if (!token) {
        loginLink.style.display = 'inline-block';
        logoutButton.style.display = 'none';
        alert('You should be logged in before accessing the page.');
        window.location.href = 'login.html';
        return null;
    } else {
        loginLink.style.display = 'none';
        logoutButton.style.display = 'inline-block';
        return token;
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function fetchPlaces() {
    try {
        const response = await fetch('http://127.0.0.1:5000/places');
        const places = await response.json();
        populatePlaceDropdown(places);
    } catch (error) {
        console.error('Error fetching places:', error);
    }
}

function populatePlaceDropdown(places) {
    const placeSelect = document.getElementById('place');
    places.forEach(place => {
        const option = document.createElement('option');
        option.value = place.id;
        option.textContent = `${place.id}, ${place.city_name}, ${place.country_name} - ${place.host_name}`;
        placeSelect.appendChild(option);
    });
}

async function submitReview(token, placeId, reviewText, rating) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/places/${placeId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                review: reviewText,
                rating: rating
            })
        });
        handleResponse(response);
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please try again.');
    }
}

function handleResponse(response) {
    if (response.ok) {
        alert('Review submitted successfully!');
        document.getElementById('review-form').reset();
    } else {
        alert('Failed to submit review');
    }
}
