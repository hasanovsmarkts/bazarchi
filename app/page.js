"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Search,
  ShoppingCart,
  User,
  Package,
  Plus,
  Trash2,
  Home as HomeIcon,
} from "lucide-react";

// Context for global state
const AppContext = createContext();

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within AppProvider");
  return context;
};

// Fake initial products
// const FAKE_PRODUCTS = [
//   {
//     id: '1',
//     title: 'Samsung Galaxy S24 Ultra',
//     price: 2599,
//     discountPrice: 2299,
//     category: 'Elektronika',
//     image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80',
//     sellerName: 'TechStore AZ',
//     isFake: true
//   },
//   {
//     id: '2',
//     title: 'Apple MacBook Air M3',
//     price: 3999,
//     discountPrice: 3699,
//     category: 'Elektronika',
//     image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80',
//     sellerName: 'Apple Premium',
//     isFake: true
//   },
//   {
//     id: '3',
//     title: 'Nike Air Max 2024',
//     price: 299,
//     discountPrice: 249,
//     category: 'Geyim və Ayaqqabı',
//     image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
//     sellerName: 'Sport World',
//     isFake: true
//   },
//   {
//     id: '4',
//     title: 'Adidas Ultraboost',
//     price: 349,
//     discountPrice: 299,
//     category: 'Geyim və Ayaqqabı',
//     image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80',
//     sellerName: 'Sport World',
//     isFake: true
//   },
//   {
//     id: '5',
//     title: 'Sony PlayStation 5',
//     price: 1599,
//     discountPrice: 1499,
//     category: 'Elektronika',
//     image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&q=80',
//     sellerName: 'GameZone',
//     isFake: true
//   },
//   {
//     id: '6',
//     title: 'Dyson V15 Detect',
//     price: 1299,
//     discountPrice: 1099,
//     category: 'Ev və Bağ',
//     image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&q=80',
//     sellerName: 'Home Tech',
//     isFake: true
//   },
//   {
//     id: '7',
//     title: 'Canon EOS R6',
//     price: 4299,
//     discountPrice: 3999,
//     category: 'Elektronika',
//     image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80',
//     sellerName: 'Photo Pro',
//     isFake: true
//   },
//   {
//     id: '8',
//     title: 'Zara Palto',
//     price: 199,
//     discountPrice: 149,
//     category: 'Geyim və Ayaqqabı',
//     image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&q=80',
//     sellerName: 'Fashion Store',
//     isFake: true
//   },
//   {
//     id: '9',
//     title: 'Apple AirPods Pro 2',
//     price: 699,
//     discountPrice: 599,
//     category: 'Elektronika',
//     image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500&q=80',
//     sellerName: 'Apple Premium',
//     isFake: true
//   },
//   {
//     id: '10',
//     title: 'Tefal Multicooker',
//     price: 399,
//     discountPrice: 349,
//     category: 'Ev və Bağ',
//     image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&q=80',
//     sellerName: 'Home Tech',
//     isFake: true
//   },
//   {
//     id: '11',
//     title: 'Gucci Çanta',
//     price: 2999,
//     discountPrice: 2699,
//     category: 'Geyim və Ayaqqabı',
//     image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80',
//     sellerName: 'Luxury Boutique',
//     isFake: true
//   },
//   {
//     id: '12',
//     title: 'LG OLED TV 55"',
//     price: 3299,
//     discountPrice: 2999,
//     category: 'Elektronika',
//     image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80',
//     sellerName: 'TechStore AZ',
//     isFake: true
//   }
// ]

const CATEGORIES = ["Hamısı", "Elektronika", "Geyim və Ayaqqabı", "Ev və Bağ"];
// AppProvider Component
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);

  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Hamısı");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch((err) => {
        console.error("Products fetch error:", err);
        toast.error("Məhsulları yükləmək alınmadı");
      });
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) {
        toast.error("Email və ya şifrə yanlışdır");
        return false;
      }

      const data = await res.json();

      // ✅ ƏN VACİB YER
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

      toast.success("Uğurla daxil oldunuz!");
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Server xətası");
      return false;
    }
  };

  const register = async (email, password, role, storeName = "") => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            role,
            store_name: role === "vendor" ? storeName : null,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        console.error(err);
        toast.error("Qeydiyyat alınmadı");
        return false;
      }

      const data = await res.json();

      // ✅ TOKEN & USER
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      toast.success("Qeydiyyat uğurla tamamlandı!");
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Server xətası");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setCurrentPage("home");
    toast.success("Hesabdan çıxış edildi");
  };

  const addProduct = async (product) => {
    const token = localStorage.getItem("token");
    console.log("TOKEN:", token);
    console.log("CATEGORY:", product.category);

    if (!token) {
      toast.error("Yenidən login ol");
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: product.title,
        description: product.description || "",

        category: product.category,
        base_price: Number(product.price || product.base_price),
        discount_price: product.discountPrice
          ? Number(product.discountPrice)
          : null,
        images: (product.images || []).filter(img => img.trim() !== ''),

        variants: [],
      }),
    });

    if (!res.ok) {
      console.error(await res.text());
      toast.error("Məhsul əlavə olunmadı");
      return;
    }

    toast.success("Məhsul əlavə edildi");

    const refreshed = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products`
    );
    const data = await refreshed.json();
    setProducts(data.products);
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    let updatedCart;

    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success("Səbətə əlavə edildi!");
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success("Səbətdən silindi");
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updatedCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const deleteProduct = async (id) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
      method: "DELETE",
    });

    toast.success("Məhsul silindi");

    const refreshed = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products`
    );
    setProducts(await refreshed.json());
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "Hamısı" || product.category === selectedCategory;
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const myProducts = products.filter(
    (p) => p.sellerName === user?.storeName && !p.isFake
  );

  return (
    <AppContext.Provider
      value={{
        user,
        products,
        cart,
        currentPage,
        selectedProduct,
        selectedCategory,
        searchQuery,
        filteredProducts,
        myProducts,
        setCurrentPage,
        setSelectedProduct,
        setSelectedCategory,
        setSearchQuery,
        login,
        register,
        logout,
        addProduct,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        deleteProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
// Header Component
function Header() {
  const { user, cart, setCurrentPage, logout, setSearchQuery } =
    useAppContext();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentPage("home")}
            className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Bazarchi
          </button>

          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Məhsul axtar..."
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.role === "vendor" && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage("vendor")}
                    className="gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Satıcı Paneli
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage("home")}
                  className="gap-2"
                >
                  <HomeIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={logout} className="gap-2">
                  <User className="h-4 w-4" />
                  Çıxış
                </Button>
              </>
            ) : (
              <Dialog open={authOpen} onOpenChange={setAuthOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    Daxil ol / Qeydiyyat
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <AuthDialog
                    mode={authMode}
                    setMode={setAuthMode}
                    onClose={() => setAuthOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}

            <Button
              variant="outline"
              onClick={() => setCurrentPage("cart")}
              className="gap-2 relative"
            >
              <ShoppingCart className="h-4 w-4" />
              Səbət
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-orange-500">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Auth Dialog Component
function AuthDialog({ mode, setMode, onClose }) {
  const { login, register } = useAppContext();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "buyer",
    storeName: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === "login") {
      if (login(formData.email, formData.password)) {
        onClose();
      }
    } else {
      if (formData.role === "vendor" && !formData.storeName) {
        toast.error("Mağaza adını daxil edin");
        return;
      }
      if (
        register(
          formData.email,
          formData.password,
          formData.role,
          formData.storeName
        )
      ) {
        onClose();
      }
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === "login" ? "Daxil ol" : "Qeydiyyat"}</DialogTitle>
        <DialogDescription>
          {mode === "login" ? "Hesabınıza daxil olun" : "Yeni hesab yaradın"}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div>
          <Label>Şifrə</Label>
          <Input
            type="password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>

        {mode === "register" && (
          <>
            <div>
              <Label>Rol seçin</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="buyer" id="buyer" />
                  <Label htmlFor="buyer">Alıcı</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vendor" id="vendor" />
                  <Label htmlFor="vendor">Satıcı</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.role === "vendor" && (
              <div>
                <Label>Mağaza adı</Label>
                <Input
                  required
                  value={formData.storeName}
                  onChange={(e) =>
                    setFormData({ ...formData, storeName: e.target.value })
                  }
                  placeholder="Məs: Tech Store"
                />
              </div>
            )}
          </>
        )}

        <Button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          {mode === "login" ? "Daxil ol" : "Qeydiyyatdan keç"}
        </Button>

        <p className="text-sm text-center">
          {mode === "login" ? (
            <>
              Hesabınız yoxdur?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-orange-500 hover:underline"
              >
                Qeydiyyatdan keçin
              </button>
            </>
          ) : (
            <>
              Artıq hesabınız var?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-orange-500 hover:underline"
              >
                Daxil olun
              </button>
            </>
          )}
        </p>
      </form>
    </>
  );
}
// Product Card Component
function ProductCard({ product, onViewDetails }) {
  const { addToCart } = useAppContext();
  const discount = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      )
    : 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div
        className="aspect-square overflow-hidden bg-gray-100"
        onClick={() => onViewDetails(product)}
      >
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.sellerName}</p>
        <h3
          className="font-medium text-sm mb-2 line-clamp-2"
          onClick={() => onViewDetails(product)}
        >
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2">
          {product.discountPrice ? (
            <>
              <span className="text-lg font-bold text-orange-500">
                {product.discountPrice} ₼
              </span>
              <span className="text-sm text-gray-400 line-through">
                {product.price} ₼
              </span>
              <Badge className="bg-red-500 text-xs">-{discount}%</Badge>
            </>
          ) : (
            <span className="text-lg font-bold">{product.price} ₼</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => addToCart(product)}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          Səbətə at
        </Button>
      </CardFooter>
    </Card>
  );
}

// Home Page
function HomePage() {
  const {
    filteredProducts,
    setSelectedProduct,
    setCurrentPage,
    selectedCategory,
    setSelectedCategory,
  } = useAppContext();

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setCurrentPage("product");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Bazarchi</h1>
          <p className="text-xl">Alış-verişin yeni dili.</p>
        </div>
      </div>

      <div className="bg-white border-b sticky top-[73px] z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className={
                  selectedCategory === cat
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Məhsullar</h2>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>Məhsul tapılmadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// Product Detail Page
function ProductDetailPage() {
  const { selectedProduct, setCurrentPage, addToCart } = useAppContext();

  if (!selectedProduct) return null;

  const discount = selectedProduct.discountPrice
    ? Math.round(
        ((selectedProduct.price - selectedProduct.discountPrice) /
          selectedProduct.price) *
          100
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => setCurrentPage("home")}
          className="mb-6"
        >
          ← Geri
        </Button>

        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-lg p-8">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{selectedProduct.category}</Badge>
              <h1 className="text-3xl font-bold mb-2">
                {selectedProduct.title}
              </h1>
              <p className="text-gray-600">
                Satıcı: {selectedProduct.sellerName}
              </p>
            </div>

            <div className="flex items-baseline gap-3">
              {selectedProduct.discountPrice ? (
                <>
                  <span className="text-4xl font-bold text-orange-500">
                    {selectedProduct.discountPrice} ₼
                  </span>
                  <span className="text-xl text-gray-400 line-through">
                    {selectedProduct.price} ₼
                  </span>
                  <Badge className="bg-red-500 text-lg px-3 py-1">
                    -{discount}%
                  </Badge>
                </>
              ) : (
                <span className="text-4xl font-bold">
                  {selectedProduct.price} ₼
                </span>
              )}
            </div>

            <Button
              onClick={() => {
                addToCart(selectedProduct);
                setCurrentPage("cart");
              }}
              size="lg"
              className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-6"
            >
              Səbətə at
            </Button>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">Məhsul haqqında</h3>
              <p className="text-gray-600">
                Bu məhsul {selectedProduct.sellerName} tərəfindən təqdim olunur.
                Keyfiyyətli və orijinal məhsuldur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// Cart Page
function CartPage() {
  const {
    cart,
    setCurrentPage,
    updateCartQuantity,
    removeFromCart,
    clearCart,
  } = useAppContext();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const total = cart.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const handleCheckout = () => {
    toast.success("Sifariş qəbul edildi! (Demo)");
    clearCart();
    setCheckoutOpen(false);
    setCurrentPage("home");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Səbət</h1>
          <Button variant="outline" onClick={() => setCurrentPage("home")}>
            Alış-verişə davam et
          </Button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">Səbət boşdur</p>
            <Button
              onClick={() => setCurrentPage("home")}
              className="mt-4 bg-orange-500 hover:bg-orange-600"
            >
              Məhsullara bax
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {item.sellerName}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateCartQuantity(item.id, item.quantity - 1)
                              }
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateCartQuantity(item.id, item.quantity + 1)
                              }
                            >
                              +
                            </Button>
                          </div>
                          <span className="font-bold text-orange-500">
                            {(item.discountPrice || item.price) * item.quantity}{" "}
                            ₼
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <h3 className="text-xl font-bold">Sifariş xülasəsi</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Məhsullar ({cart.length})</span>
                    <span>{total} ₼</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Çatdırılma</span>
                    <span className="text-green-500">Pulsuz</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-xl font-bold">
                    <span>Yekun</span>
                    <span className="text-orange-500">{total} ₼</span>
                  </div>
                  <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        size="lg"
                      >
                        Sifarişi təsdiqlə
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Sifariş təsdiq (Demo)</DialogTitle>
                        <DialogDescription>
                          Bu fake checkout-dur. Sifarişiniz qeydə alınacaq.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Ad Soyad</Label>
                          <Input placeholder="Ad Soyadınız" />
                        </div>
                        <div>
                          <Label>Telefon</Label>
                          <Input placeholder="+994" />
                        </div>
                        <div>
                          <Label>Ünvan</Label>
                          <Input placeholder="Çatdırılma ünvanı" />
                        </div>
                        <Button
                          onClick={handleCheckout}
                          className="w-full bg-orange-500 hover:bg-orange-600"
                        >
                          Sifarişi tamamla
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// Vendor Dashboard
function VendorDashboard() {
  const { user, myProducts, addProduct, deleteProduct, setCurrentPage } =
    useAppContext();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    discountPrice: "",
    category: "Elektronika",
    images: [],
  });

  const handleAddProduct = (e) => {
    e.preventDefault();

    if (!newProduct.title || !newProduct.price) {
      toast.error("Məhsul adı və qiyməti daxil edin");
      return;
    }

 addProduct({
  title: newProduct.title,
  price: parseFloat(newProduct.price),
  discountPrice: newProduct.discountPrice
    ? parseFloat(newProduct.discountPrice)
    : null,
  category: newProduct.category,
  images:
    newProduct.images.length > 0
      ? newProduct.images
      : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80']
})


    setNewProduct({
      title: "",
      price: "",
      discountPrice: "",
      category: "Elektronika",
      image: "",
    });
    setIsAddingProduct(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Satıcı Paneli</h1>
            <p className="text-gray-600">Mağaza: {user?.storeName}</p>
          </div>
          <Button variant="outline" onClick={() => setCurrentPage("home")}>
            Ana səhifə
          </Button>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">
              Məhsullarım ({myProducts.length})
            </TabsTrigger>
            <TabsTrigger value="add">Məhsul əlavə et</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {myProducts.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">
                    Hələ məhsul əlavə etməmisiniz
                  </p>
                  <Button
                    onClick={() => setIsAddingProduct(true)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    İlk məhsulu əlavə et
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myProducts.map((product) => (
                  <Card key={product._id}>
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{product.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {product.category}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          {product.discountPrice ? (
                            <>
                              <span className="font-bold text-orange-500">
                                {product.discountPrice} ₼
                              </span>
                              <span className="text-sm text-gray-400 line-through ml-2">
                                {product.price} ₼
                              </span>
                            </>
                          ) : (
                            <span className="font-bold">{product.price} ₼</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteProduct(product._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">Yeni məhsul əlavə et</h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <Label>Məhsul adı *</Label>
                    <Input
                      required
                      value={newProduct.title}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, title: e.target.value })
                      }
                      placeholder="Məs: iPhone 15 Pro"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Qiymət (₼) *</Label>
                      <Input
                        type="number"
                        required
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            price: e.target.value,
                          })
                        }
                        placeholder="299.99"
                      />
                    </div>
                    <div>
                      <Label>Endirimli qiymət (₼)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newProduct.discountPrice}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            discountPrice: e.target.value,
                          })
                        }
                        placeholder="249.99"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Kateqoriya</Label>
                    <RadioGroup
                      value={newProduct.category}
                      onValueChange={(value) =>
                        setNewProduct({ ...newProduct, category: value })
                      }
                      className="flex flex-wrap gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Elektronika" id="cat1" />
                        <Label htmlFor="cat1">Elektronika</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Geyim və Ayaqqabı" id="cat2" />
                        <Label htmlFor="cat2">Geyim və Ayaqqabı</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Ev və Bağ" id="cat3" />
                        <Label htmlFor="cat3">Ev və Bağ</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Şəkil URL (optional)</Label>
                    <Input
                      type="url"
                      value={newProduct.images[0] || ""}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          images: e.target.value ? [e.target.value] : [],
                        })
                      }
                      placeholder="https://example.com/image.jpg"
                    />

                    <p className="text-xs text-gray-500 mt-1">
                      Boş buraxsanız default şəkil istifadə olunacaq
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    size="lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Məhsulu əlavə et
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
// Main App
function App() {
  const { currentPage, user } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {currentPage === "home" && <HomePage />}
      {currentPage === "product" && <ProductDetailPage />}
      {currentPage === "cart" && <CartPage />}
      {currentPage === "vendor" && user?.role === "vendor" && (
        <VendorDashboard />
      )}
    </div>
  );
}

// Root component
export default function Home() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
