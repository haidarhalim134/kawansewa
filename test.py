import pytest
import requests

BASE_URL = "http://localhost:3000/api"

# -------------------- HELPERS --------------------

def api_url(entity, id=None):
    """Build API URL for given entity and optional id"""
    if id is not None:
        return f"{BASE_URL}/{entity}/{id}"
    return f"{BASE_URL}/{entity}"

def create_and_assert(entity, payload):
    """Create object and assert success"""
    res = requests.post(api_url(entity), json=payload)
    assert res.status_code == 200, f"POST {entity} failed: {res.text}"
    data = res.json()
    assert isinstance(data, dict)
    assert "id" in data, f"{entity} missing id field in response"
    return data

def get_and_assert(entity, id):
    res = requests.get(api_url(entity, id))
    assert res.status_code == 200, f"GET {entity}/{id} failed: {res.text}"
    return res.json()

def update_and_assert(entity, id, payload):
    res = requests.put(api_url(entity, id), json=payload)
    assert res.status_code == 200, f"PUT {entity}/{id} failed: {res.text}"
    return res.json()

def delete_and_assert(entity, id):
    res = requests.delete(api_url(entity, id))
    assert res.status_code == 200, f"DELETE {entity}/{id} failed: {res.text}"
    return res.json()

# -------------------- FIXTURES --------------------

@pytest.fixture(scope="module")
def sample_user():
    return {
        "email": "testuser@example.com",
        "location": "New York",
    }

@pytest.fixture(scope="module")
def sample_item():
    return {
        "name": "Camping Tent",
        "detail": "Spacious 2-person tent",
        "pricePerDay": "25.00",
        "ownerId": 1,  # adjust based on your seeded data
    }

@pytest.fixture(scope="module")
def sample_voucher():
    return {
        "code": "DISCOUNT10",
        "discountAmount": "10.00",
    }

# -------------------- TEST SUITE --------------------

def test_user_crud(sample_user):
    entity = "users"

    created = create_and_assert(entity, sample_user)
    uid = created["id"]

    fetched = get_and_assert(entity, uid)
    assert fetched[0]["email"] == sample_user["email"]

    updated = update_and_assert(entity, uid, {"location": "San Francisco"})
    assert updated["location"] == "San Francisco"

    deleted = delete_and_assert(entity, uid)
    assert deleted["success"] is True

def test_voucher_crud(sample_voucher):
    entity = "vouchers"

    created = create_and_assert(entity, sample_voucher)
    vid = created["id"]

    fetched = get_and_assert(entity, vid)
    assert fetched[0]["code"] == sample_voucher["code"]

    updated = update_and_assert(entity, vid, {"discountAmount": "15.00"})
    assert updated["discountAmount"] == "15.00"

    deleted = delete_and_assert(entity, vid)
    assert deleted["success"] is True

def test_item_crud(sample_item):
    entity = "items"

    created = create_and_assert(entity, sample_item)
    iid = created["id"]

    fetched = get_and_assert(entity, iid)
    assert fetched[0]["name"] == sample_item["name"]

    updated = update_and_assert(entity, iid, {"pricePerDay": "30.00"})
    assert updated["pricePerDay"] == "30.00"

    deleted = delete_and_assert(entity, iid)
    assert deleted["success"] is True

# -------------------- EXTRA OBJECTS --------------------

def test_rentals_workflow():
    """
    Demonstrates a more complex chain:
    create user -> create item -> create voucher -> create rental -> review -> delete all
    """
    # Create user
    user = create_and_assert("users", {"email": "renter@example.com", "location": "Chicago"})
    uid = user["id"]

    # Create item owned by same user
    item = create_and_assert("items", {"name": "Bike", "detail": "Mountain bike", "pricePerDay": "12.50", "ownerId": uid})
    iid = item["id"]

    # Create voucher
    voucher = create_and_assert("vouchers", {"code": "RENT5", "discountAmount": "5.00"})
    vid = voucher["id"]

    # Create rental
    rental = create_and_assert("rentals", {
        "itemId": iid,
        "renterId": uid,
        "voucherId": vid,
        "startDate": "2025-11-01",
        "endDate": "2025-11-03",
    })
    rid = rental["id"]

    # Create review for that rental
    review = create_and_assert("reviews", {"rentalId": rid, "star": 5})
    assert review["star"] == 5

    # Clean up
    delete_and_assert("reviews", review["id"])
    delete_and_assert("rentals", rid)
    delete_and_assert("vouchers", vid)
    delete_and_assert("items", iid)
    delete_and_assert("users", uid)
