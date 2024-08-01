from flask import Flask, request, jsonify, render_template, url_for, send_from_directory
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import json
from uuid import uuid4

app = Flask(__name__)
app.config.from_object('config.Config')

jwt = JWTManager(app)

@app.route('/data/<path:filename>')
def send_data(filename):
    return send_from_directory('data', filename)

with open('data/users.json') as f:
    users = json.load(f)

with open('data/places.json') as f:
    places = json.load(f)

# In-memory storage for new reviews
new_reviews = []

@app.route('/add_review.html')
def review():
    return render_template('add_review.html')

@app.route('/index.html')
def index():
    return render_template('index.html')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login.html')
def login_page():
    return render_template('login.html')

@app.route('/place.html')
def place():
    return render_template('place.html')


@app.route('/login', methods=['POST'])
def login():
    email = request.json.get('email')
    password = request.json.get('password')

    user = next((u for u in users if u['email'] == email and u['password'] == password), None)
    
    if not user:
        print(f"User not found or invalid password for: {email}")
        return jsonify({"msg": "Invalid credentials"}), 401

    access_token = create_access_token(identity=user['id'])
    return jsonify(access_token=access_token)

@app.route('/places', methods=['GET'])
def get_places():
    response = [
        {
            "id": place['id'],
            "host_id": place['host_id'],
            "host_name": place['host_name'],
            "description": place['description'],
            "price_per_night": place['price_per_night'],
            "city_id": place['city_id'],
            "city_name": place['city_name'],
            "country_code": place['country_code'],
            "country_name": place['country_name'],
            "image_url": url_for('static', filename=place.get('image_url', 'images/default.png'))
        }
        for place in places
    ]
    print(response)
    return jsonify(response)

@app.route('/places/<place_id>', methods=['GET'])
def get_place(place_id):
    place = next((p for p in places if p['id'] == place_id), None)

    if not place:
        return jsonify({"msg": "Place not found"}), 404

    response = {
        "id": place['id'],
        "host_id": place['host_id'],
        "host_name": place['host_name'],
        "description": place['description'],
        "number_of_rooms": place['number_of_rooms'],
        "number_of_bathrooms": place['number_of_bathrooms'],
        "max_guests": place['max_guests'],
        "price_per_night": place['price_per_night'],
        "latitude": place['latitude'],
        "longitude": place['longitude'],
        "city_id": place['city_id'],
        "city_name": place['city_name'],
        "country_code": place['country_code'],
        "country_name": place['country_name'],
        "amenities": place['amenities'],
        "image_url": url_for('static', filename=place.get('image_url', 'images/default.png')),
        "reviews": place['reviews'] + [r for r in new_reviews if r['place_id'] == place_id]
    }
    return jsonify(response)

@app.route('/places/<place_id>/reviews', methods=['POST'])
@jwt_required()
def add_review(place_id):
    current_user_id = get_jwt_identity()
    user = next((u for u in users if u['id'] == current_user_id), None)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    review_text = request.json.get('review')
    rating = request.json.get('rating')

    new_review = {
        "reviewer_name": user['name'],
        "rating": rating,
        "comment": review_text,
        "place_id": place_id
    }

    # Append new review to the corresponding place
    for place in places:
        if place['id'] == place_id:
            if 'reviews' not in place:
                place['reviews'] = []
            place['reviews'].append(new_review)
            break
    else:
        return jsonify({"msg": "Place not found"}), 404

    # Save updated places data to JSON file
    with open('data/places.json', 'w') as f:
        json.dump(places, f, indent=4)

    return jsonify({"msg": "Review added"}), 201

if __name__ == '__main__':
    app.run(debug=True)