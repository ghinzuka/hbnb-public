document.addEventListener('DOMContentLoaded', () => {
    const token = checkAuthentication();
    const placeId = getPlaceIdFromURL();

    // Set placeId in the form (if needed)
    const placeInput = document.getElementById('place');
    if (placeInput) {
        placeInput.value = placeId;
    }

    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const reviewText = document.getElementById('review').value;
            const rating = document.getElementById('rating').value;
            await submitReview(token, placeId, reviewText, rating);
        });
    }
});

function checkAuthentication() {
    const token = getCookie('token');
	const loginLink = document.getElementById('login-link');
    const logoutButton = document.getElementById('logout-button');

    if (!token) {
        loginLink.style.display = 'inline-block'; // Show login link if not authenticated
        logoutButton.style.display = 'none'; // Hide logout button
		window.location.href = 'index.html';
    } else {
        loginLink.style.display = 'none'; // Hide login link if authenticated
        logoutButton.style.display = 'inline-block'; // Show logout button
		return token;
	}
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function submitReview(token, placeId, reviewText, rating) {
    try {
        const response = await fetch('http://127.0.0.1:5000/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                place_id: placeId,
                text: reviewText,
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
