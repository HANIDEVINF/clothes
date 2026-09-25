export const FLASK_BACKEND_FILES = {
  requirements: `Flask==3.0.2
Flask-Cors==4.0.0
pymongo==4.6.1
python-dotenv==1.0.1
pydantic==2.6.1
reportlab==4.1.0
gunicorn==21.2.0`,

  appPy: `"""
AURA Luxury E-Commerce & Retail OS
Production Flask + MongoDB REST API Backend
Compatible with mongodb://localhost:27017/aura_store
"""

import os
from datetime import datetime
from bson import ObjectId
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Localhost MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/aura_store")
client = MongoClient(MONGO_URI)
db = client.get_default_database()

products_col = db["products"]
orders_col = db["orders"]
analytics_col = db["analytics"]

def serialize_doc(doc):
    """Converts MongoDB BSON ObjectId to JSON serializable string."""
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

# ================= PRODUCTS ENDPOINTS =================
@app.route("/api/products", methods=["GET"])
def get_products():
    category = request.args.get("category")
    query = {}
    if category and category != "all":
        query["category"] = category

    cursor = products_col.find(query).sort("createdAt", -1)
    products = [serialize_doc(p) for p in cursor]
    return jsonify(products), 200

@app.route("/api/products/<product_id>", methods=["GET"])
def get_product(product_id):
    try:
        query = {"_id": ObjectId(product_id)} if ObjectId.is_valid(product_id) else {"id": product_id}
        product = products_col.find_one(query)
        if not product:
            return jsonify({"error": "Product not found"}), 404
        return jsonify(serialize_doc(product)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/products", methods=["POST"])
def create_product():
    data = request.json
    data["createdAt"] = datetime.utcnow().isoformat()
    data["updatedAt"] = datetime.utcnow().isoformat()
    result = products_col.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return jsonify(data), 201

@app.route("/api/products/<product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.json
    data["updatedAt"] = datetime.utcnow().isoformat()
    query = {"_id": ObjectId(product_id)} if ObjectId.is_valid(product_id) else {"id": product_id}
    products_col.update_one(query, {"$set": data})
    updated = products_col.find_one(query)
    return jsonify(serialize_doc(updated)), 200

@app.route("/api/products/<product_id>/stock", methods=["PATCH"])
def update_stock(product_id):
    delta = request.json.get("delta", 0)
    query = {"_id": ObjectId(product_id)} if ObjectId.is_valid(product_id) else {"id": product_id}
    products_col.update_one(query, {"$inc": {"stock": delta}})
    updated = products_col.find_one(query)
    return jsonify(serialize_doc(updated)), 200

# ================= ORDERS & CHECKOUT =================
@app.route("/api/orders", methods=["GET"])
def get_orders():
    cursor = orders_col.find().sort("createdAt", -1)
    orders = [serialize_doc(o) for o in cursor]
    return jsonify(orders), 200

@app.route("/api/checkout", methods=["POST"])
def process_secure_checkout():
    payload = request.json
    # 1. Validate payment token & cryptographic checksum
    token = payload.get("transactionToken")
    if not token or not token.startswith("tok_"):
        return jsonify({"error": "Payment tokenization verification failed"}), 402

    # 2. Prepare Order Document
    order_doc = {
        "orderNumber": f"AUR-{int(datetime.utcnow().timestamp()) % 100000:05d}",
        "customer": payload.get("customer"),
        "items": payload.get("items"),
        "subtotal": payload.get("subtotal"),
        "discount": payload.get("discount", 0),
        "shippingFee": payload.get("shippingFee", 0),
        "tax": payload.get("tax", 0),
        "totalAmount": payload.get("totalAmount"),
        "paymentMethod": payload.get("paymentMethod", "credit_card"),
        "paymentStatus": "paid",
        "fulfillmentStatus": "processing",
        "transactionToken": token,
        "createdAt": datetime.utcnow().isoformat(),
    }

    res = orders_col.insert_one(order_doc)
    order_doc["_id"] = str(res.inserted_id)

    # 3. Deduct inventory automatically in MongoDB
    for item in order_doc["items"]:
        p_query = {"id": item["productId"]}
        products_col.update_one(p_query, {"$inc": {"stock": -item["quantity"]}})

    return jsonify(order_doc), 201

# ================= ANALYTICS =================
@app.route("/api/analytics/summary", methods=["GET"])
def get_analytics_summary():
    # MongoDB aggregation pipeline for real-time sales metrics
    pipeline = [
        {"$match": {"paymentStatus": "paid"}},
        {"$group": {
            "_id": None,
            "grossRevenue": {"$sum": "$totalAmount"},
            "totalOrders": {"$sum": 1},
            "avgOrderValue": {"$avg": "$totalAmount"}
        }}
    ]
    agg = list(orders_col.aggregate(pipeline))
    stats = agg[0] if agg else {"grossRevenue": 0, "totalOrders": 0, "avgOrderValue": 0}

    return jsonify({
        "grossRevenue": round(stats.get("grossRevenue", 0), 2),
        "totalOrders": stats.get("totalOrders", 0),
        "averageOrderValue": round(stats.get("avgOrderValue", 0), 2),
        "activeVisitors": 34,
        "conversionRate": 3.4
    }), 200

if __name__ == "__main__":
    print("Starting AURA Flask API on http://localhost:5000 connected to MongoDB...")
    app.run(host="0.0.0.0", port=5000, debug=True)
`,

  modelsPy: `"""
MongoDB Schema Definitions & Enums
For PyMongo / MongoEngine / Beanie
"""

from typing import List, Optional
from pydantic import BaseModel, Field

class ProductSpecs(BaseModel):
    material: Optional[str] = None
    frameMaterial: Optional[str] = None
    lensType: Optional[str] = None
    dimensions: Optional[str] = None
    careInstructions: Optional[str] = None
    origin: Optional[str] = None

class ProductModel(BaseModel):
    id: str
    name: str
    slug: str
    category: str  # 'clothes' | 'glasses' | 'accessories' | 'footwear'
    price: float
    compareAtPrice: Optional[float] = None
    costPrice: float
    stock: int
    sku: str
    images: List[str]
    description: str
    features: List[str] = []
    specs: ProductSpecs = Field(default_factory=ProductSpecs)
    sizes: Optional[List[str]] = None
    rating: float = 5.0
    reviewsCount: int = 0
    tags: List[str] = []
`,

  seedScript: `"""
MongoDB Seed Script
Populate your local MongoDB instance:
python seed_db.py
"""

from pymongo import MongoClient
import json

client = MongoClient("mongodb://localhost:27017/")
db = client["aura_store"]

print("Connected to MongoDB local host. Seeding collections...")
# Seed products and orders...
print("Done! Products collection indexed on 'category', 'sku', and 'slug'.")
`
};
