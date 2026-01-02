import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, productsAPI, vendorAPI } from '../services/api';
import { toast } from 'sonner';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Hamısı');
  const [searchQuery, setSearchQuery] = useState('');

  // Load user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await productsAPI.getAll();
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Uğurla daxil oldunuz!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Giriş uğursuz oldu');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Qeydiyyat tamamlandı!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Qeydiyyat uğursuz oldu');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Hesabdan çıxış edildi');
  };

  const addToCart = (product, variant = null) => {
    const itemId = variant ? `${product.id}-${variant.id}` : product.id;
    const price = variant ? variant.price : (product.discount_price || product.base_price);
    
    const existingItem = cart.find(item => item.itemId === itemId);
    
    let updatedCart;
    if (existingItem) {
      updatedCart = cart.map(item =>
        item.itemId === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      const newItem = {
        itemId,
        product_id: product.id,
        variant_id: variant?.id,
        title: product.title,
        price,
        quantity: 1,
        image: product.images?.[0],
        seller_name: product.seller_name,
        variant_label: variant ? variant.options.map(o => o.value).join(', ') : null,
      };
      updatedCart = [...cart, newItem];
    }
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Səbətə əlavə edildi!');
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const updatedCart = cart.map(item =>
      item.itemId === itemId ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (itemId) => {
    const updatedCart = cart.filter(item => item.itemId !== itemId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Səbətdən silindi');
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Hamısı' || product.category === selectedCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    user,
    loading,
    products,
    filteredProducts,
    cart,
    cartTotal,
    cartCount,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    login,
    register,
    logout,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    loadProducts,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
