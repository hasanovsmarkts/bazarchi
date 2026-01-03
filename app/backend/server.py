from fastapi import FastAPI, APIRouter, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from bson import ObjectId
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
import os
load_dotenv()
app = FastAPI()
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

if not MONGO_URL:
    raise RuntimeError("MONGO_URL .env-də tapılmadı")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# collections
products_collection = db["products"]
users_collection = db["users"]
orders_collection = db["orders"]
products_collection = db["products"]
variants_collection = db["variants"]



ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT secret
JWT_SECRET = os.environ.get("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days



# Create the main app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ========== MODELS ==========

class UserRole(str):
    BUYER = "buyer"
    VENDOR = "vendor"

# Auth Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: str  # "buyer" or "vendor"
    store_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    role: str
    store_name: Optional[str] = None

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

# Variant Models
class VariantOption(BaseModel):
    name: str  # e.g., "Rəng", "Ölçü", "Yaddaş"
    value: str  # e.g., "Qara", "42", "128GB"

class ProductVariant(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    options: List[VariantOption]  # e.g., [{"name": "Rəng", "value": "Qara"}, {"name": "Yaddaş", "value": "128GB"}]
    price: float
    stock: int
    sku: Optional[str] = None

# Product Models
class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    base_price: float
    discount_price: Optional[float] = None
    images: List[str] = []
    variants: Optional[List[Dict[str, Any]]] = []  # Variants with options, price, stock

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    seller_id: str
    seller_name: str
    title: str
    description: Optional[str] = None
    category: str
    base_price: float
    discount_price: Optional[float] = None
    images: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_fake: bool = False

class ProductWithVariants(BaseModel):
    product: Product
    variants: List[ProductVariant]

# Order Models
class OrderItem(BaseModel):
    product_id: str
    variant_id: Optional[str] = None
    title: str
    price: float
    quantity: int
    image: Optional[str] = None

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total: float
    shipping_address: str
    phone: str
    full_name: str

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[OrderItem]
    total: float
    status: str = "pending"  # pending, confirmed, shipped, delivered, cancelled
    shipping_address: str
    phone: str
    full_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    payment_status: str = "pending"  # pending, paid, failed




# Category definitions with variant fields
CATEGORY_VARIANTS = {
    "Elektronika": {
        "Telefon": ["yaddaş", "rəng", "sim_tipi", "zəmanət"],
        "Kompüter": ["ram", "disk", "prosessor", "əməliyyat_sistemi"],
        "Digər": ["rəng", "zəmanət"]
    },
    "Geyim və Ayaqqabı": {
        "Ayaqqabı": ["ölçü", "rəng", "material", "cins"],
        "Geyim": ["ölçü", "rəng", "material", "kəsim"],
    },
    "Ev və Bağ": {
        "Mebel": ["ölçü", "rəng", "material"],
        "Məişət texnikası": ["güc", "tutum", "rəng"],
        "Digər": ["ölçü", "rəng", "material"]
    }
}

# ========== HELPER FUNCTIONS ==========

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_jwt_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token müddəti bitib")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Etibarsız token")

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization:
        raise HTTPException(status_code=401, detail="Token tapılmadı")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = decode_jwt_token(token)
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

# ========== FAKE DATA ==========

# async def init_fake_data():
    """Initialize fake data if database is empty"""
    
    # Check if fake data already exists
    existing_products = await db.products.count_documents({"is_fake": True})
    if existing_products > 0:
        logger.info("Fake data already exists, skipping initialization")
        return
    
    logger.info("Initializing fake data...")
    
    # Fake sellers
    fake_sellers = [
        {"id": "seller1", "email": "techstore@fake.com", "store_name": "TechStore AZ", "role": "vendor"},
        {"id": "seller2", "email": "sportworld@fake.com", "store_name": "Sport World", "role": "vendor"},
        {"id": "seller3", "email": "hometech@fake.com", "store_name": "Home Tech", "role": "vendor"},
    ]
    
    # Fake products
    fake_products = [
        {
            "id": "prod1",
            "seller_id": "seller1",
            "seller_name": "TechStore AZ",
            "title": "Samsung Galaxy S24 Ultra",
            "description": "Ən son model Samsung smartfon",
            "category": "Elektronika",
            "base_price": 2599.0,
            "discount_price": 2299.0,
            "images": ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_fake": True
        },
        {
            "id": "prod2",
            "seller_id": "seller1",
            "seller_name": "TechStore AZ",
            "title": "Apple MacBook Air M3",
            "description": "Güclü və yüngül noutbuk",
            "category": "Elektronika",
            "base_price": 3999.0,
            "discount_price": 3699.0,
            "images": ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_fake": True
        },
        {
            "id": "prod3",
            "seller_id": "seller2",
            "seller_name": "Sport World",
            "title": "Nike Air Max 2024",
            "description": "Rahat və stil idman ayaqqabısı",
            "category": "Geyim və Ayaqqabı",
            "base_price": 299.0,
            "discount_price": 249.0,
            "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_fake": True
        },
        {
            "id": "prod4",
            "seller_id": "seller2",
            "seller_name": "Sport World",
            "title": "Adidas Ultraboost",
            "description": "Premium qaçış ayaqqabısı",
            "category": "Geyim və Ayaqqabı",
            "base_price": 349.0,
            "discount_price": 299.0,
            "images": ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_fake": True
        },
        {
            "id": "prod5",
            "seller_id": "seller1",
            "seller_name": "TechStore AZ",
            "title": "Sony PlayStation 5",
            "description": "Ən son oyun konsolu",
            "category": "Elektronika",
            "base_price": 1599.0,
            "discount_price": 1499.0,
            "images": ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&q=80"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_fake": True
        },
        {
            "id": "prod6",
            "seller_id": "seller3",
            "seller_name": "Home Tech",
            "title": "Dyson V15 Detect",
            "description": "Güclü şnursuz tozsorucu",
            "category": "Ev və Bağ",
            "base_price": 1299.0,
            "discount_price": 1099.0,
            "images": ["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&q=80"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_fake": True
        }
    ]
    
    # Insert fake products
    if fake_products:
        await db.products.insert_many(fake_products)
    
    # Add some variants for products
    fake_variants = [
        {
            "id": "var1",
            "product_id": "prod1",
            "options": [{"name": "Yaddaş", "value": "256GB"}, {"name": "Rəng", "value": "Qara"}],
            "price": 2299.0,
            "stock": 5,
            "sku": "S24-256-BLK"
        },
        {
            "id": "var2",
            "product_id": "prod1",
            "options": [{"name": "Yaddaş", "value": "512GB"}, {"name": "Rəng", "value": "Boz"}],
            "price": 2499.0,
            "stock": 3,
            "sku": "S24-512-GRY"
        },
        {
            "id": "var3",
            "product_id": "prod3",
            "options": [{"name": "Ölçü", "value": "42"}, {"name": "Rəng", "value": "Qara"}],
            "price": 249.0,
            "stock": 10,
            "sku": "NIKE-42-BLK"
        },
        {
            "id": "var4",
            "product_id": "prod3",
            "options": [{"name": "Ölçü", "value": "43"}, {"name": "Rəng", "value": "Ağ"}],
            "price": 249.0,
            "stock": 8,
            "sku": "NIKE-43-WHT"
        }
    ]
    
    if fake_variants:
        await db.variants.insert_many(fake_variants)
    
    logger.info("Fake data initialized successfully")

# ========== AUTH ENDPOINTS ==========

@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Bu email artıq qeydiyyatdan keçib")
    
    # Validate vendor store name
    if user_data.role == "vendor" and not user_data.store_name:
        raise HTTPException(status_code=400, detail="Satıcı üçün mağaza adı tələb olunur")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "role": user_data.role,
        "store_name": user_data.store_name if user_data.role == "vendor" else None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create JWT token
    token = create_jwt_token(user_id, user_data.email, user_data.role)
    
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        role=user_data.role,
        store_name=user_data.store_name
    )
    
    return AuthResponse(token=token, user=user_response)

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(login_data: UserLogin):
    # Find user
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Email və ya şifrə yanlışdır")
    
    # Verify password
    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email və ya şifrə yanlışdır")
    
    # Create JWT token
    token = create_jwt_token(user["id"], user["email"], user["role"])
    
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        role=user["role"],
        store_name=user.get("store_name")
    )
    
    return AuthResponse(token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(authorization: Optional[str] = Header(None)):
    current_user = await get_current_user(authorization)
    
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="İstifadəçi tapılmadı")
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        role=user["role"],
        store_name=user.get("store_name")
    )

# ========== CATEGORY ENDPOINTS ==========

@api_router.get("/categories")
async def get_categories():
    """Get all categories with variant definitions"""
    return {"categories": CATEGORY_VARIANTS}

# ========== PRODUCT ENDPOINTS ==========

@api_router.post("/products")
async def create_product(
    product_data: ProductCreate,
    authorization: Optional[str] = Header(None)
):
    """Create new product (vendor only)"""
    
    current_user = await get_current_user(authorization)

    if current_user["role"] != "vendor":
        raise HTTPException(
            status_code=403,
            detail="Yalnız satıcılar məhsul əlavə edə bilər"
        )

    product_id = str(uuid.uuid4())

    product_doc = {
        "id": product_id,
        "seller_id": current_user["user_id"],
        "seller_name": current_user.get("storeName") or current_user.get("store_name"),
        "title": product_data.title,
        "description": product_data.description,
        "category": product_data.category,
        "base_price": product_data.base_price,
        "discount_price": product_data.discount_price,
        "images": product_data.images,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_fake": False
    }

    await db.products.insert_one(product_doc)

    # Variants varsa
    if product_data.variants:
        for var in product_data.variants:
            await db.variants.insert_one({
                "id": str(uuid.uuid4()),
                "product_id": product_id,
                **var
            })

        return product_doc


@api_router.get("/products")
async def get_products(category: Optional[str] = None, search: Optional[str] = None):
    """Get all products with optional filtering"""
    query = {}
    
    if category and category != "Hamısı":
        query["category"] = category
    
    if search:
        query["title"] = {"$regex": search, "$options": "i"}
    
    products = await db.products.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    return {"products": products}

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Get product with its variants"""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Məhsul tapılmadı")
    
    variants = await db.variants.find({"product_id": product_id}, {"_id": 0}).to_list(50)
    
    return {"product": product, "variants": variants}

@api_router.get("/vendor/products")
async def get_vendor_products(authorization: Optional[str] = Header(None)):
    """Get current vendor's products"""
    current_user = await get_current_user(authorization)
    
    if current_user["role"] != "vendor":
        raise HTTPException(status_code=403, detail="Yalnız satıcılar bu əməliyyatı edə bilər")
    
    products = await db.products.find({"seller_id": current_user["user_id"], "is_fake": False}, {"_id": 0}).to_list(100)
    
    return {"products": products}
@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate, authorization: Optional[str] = Header(None)):
    """Update product"""
    current_user = await get_current_user(authorization)
    
    if current_user["role"] != "vendor":
        raise HTTPException(status_code=403, detail="Yalnız satıcılar bu əməliyyatı edə bilər")
    
    # Check if product exists and belongs to user
    existing_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Məhsul tapılmadı")
    
    if existing_product["seller_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Bu məhsulu yeniləməyə icazəniz yoxdur")
    
    # Update product
    update_data = product_data.model_dump()
    update_data["id"] = product_id
    update_data["seller_id"] = current_user["user_id"]
    update_data["seller_name"] = existing_product["seller_name"]
    update_data["created_at"] = existing_product.get("created_at", datetime.now(timezone.utc).isoformat())
    update_data["is_fake"] = False
    
    await db.products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    
    product = Product(**update_data)
    
    # Handle variants if provided
    if product_data.variants:
        # Delete old variants
        await db.variants.delete_many({"product_id": product_id})
        
        # Insert new variants
        for var_data in product_data.variants:
            variant_doc = {
                "id": str(uuid.uuid4()),
                "product_id": product_id,
                **var_data
            }
            await db.variants.insert_one(variant_doc)
    
    return product
@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, authorization: Optional[str] = Header(None)):
    """Delete product"""
    current_user = await get_current_user(authorization)
    
    # Check if product belongs to user
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Məhsul tapılmadı")
    
    if product["seller_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Bu məhsulu silməyə icazəniz yoxdur")
    
    # Delete product and its variants
    await db.products.delete_one({"id": product_id})
    await db.variants.delete_many({"product_id": product_id})
    
    return {"message": "Məhsul silindi"}

# ========== ORDER ENDPOINTS ==========

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, authorization: Optional[str] = Header(None)):
    current_user = await get_current_user(authorization)
    
    order_id = str(uuid.uuid4())
    order_doc = {
        "id": order_id,
        "user_id": current_user["user_id"],
        "items": [item.model_dump() for item in order_data.items],
        "total": order_data.total,
        "status": "pending",
        "payment_status": "pending",
        "shipping_address": order_data.shipping_address,
        "phone": order_data.phone,
        "full_name": order_data.full_name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    return Order(**order_doc)

@api_router.get("/orders")
async def get_orders(authorization: Optional[str] = Header(None)):
    """Get current user's orders"""
    current_user = await get_current_user(authorization)
    
    orders = await db.orders.find({"user_id": current_user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    
    return {"orders": orders}

@api_router.get("/vendor/orders")
async def get_vendor_orders(authorization: Optional[str] = Header(None)):
    """Get orders for vendor's products"""
    current_user = await get_current_user(authorization)
    
    if current_user["role"] != "vendor":
        raise HTTPException(status_code=403, detail="Yalnız satıcılar bu əməliyyatı edə bilər")
    
    # Get all orders that contain vendor's products
    all_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    vendor_products = await db.products.find({"seller_id": current_user["user_id"]}, {"_id": 0}).to_list(100)
    vendor_product_ids = {p["id"] for p in vendor_products}
    
    # Filter orders that have vendor's products
    vendor_orders = []
    for order in all_orders:
        has_vendor_product = any(item["product_id"] in vendor_product_ids for item in order["items"])
        if has_vendor_product:
            vendor_orders.append(order)
    
    return {"orders": vendor_orders}

# ========== VENDOR STATISTICS ==========

@api_router.get("/vendor/stats")
async def get_vendor_stats(authorization: Optional[str] = Header(None)):
    """Get vendor statistics"""
    current_user = await get_current_user(authorization)
    
    if current_user["role"] != "vendor":
        raise HTTPException(status_code=403, detail="Yalnız satıcılar bu əməliyyatı edə bilər")
    
    # Get vendor products count
    product_count = await db.products.count_documents({"seller_id": current_user["user_id"], "is_fake": False})
    
    # Get vendor orders
    all_orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    vendor_products = await db.products.find({"seller_id": current_user["user_id"]}, {"_id": 0}).to_list(100)
    vendor_product_ids = {p["id"] for p in vendor_products}
    
    total_revenue = 0.0
    order_count = 0
    
    for order in all_orders:
        for item in order["items"]:
            if item["product_id"] in vendor_product_ids:
                total_revenue += item["price"] * item["quantity"]
                order_count += 1
                break
    
    # Fake stats for demo
    return {
        "total_products": product_count,
        "total_orders": order_count or 12,  # Show fake data if no real orders
        "total_revenue": total_revenue or 4850.50,  # Show fake data
        "pending_orders": order_count // 2 if order_count > 0 else 3,
        "this_month_revenue": total_revenue * 0.3 if total_revenue > 0 else 1250.00,
        "total_customers": order_count * 2 if order_count > 0 else 24
    }



@api_router.get("/")
async def root():
    return {"message": "Bazarchi API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():

    logger.info("Bazarchi API started successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
