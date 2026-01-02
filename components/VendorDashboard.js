"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign,
  Eye,
  Home
} from 'lucide-react';
import { productsAPI, ordersAPI, vendorAPI } from '@/services/api';
import { toast } from 'sonner';

const VendorDashboard = () => {
 const router = useRouter();
  const { user, loadProducts } = useApp();
  const [myProducts, setMyProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total_revenue: 0, total_orders: 0, total_products: 0 });
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    base_price: '',
    discount_price: '',
    category: 'Elektronika',
    images: [''],
    stock: '',
  });

  const CATEGORIES = ['Elektronika', 'Geyim və Ayaqqabı', 'Ev və Bağ', 'İdman', 'Kitab', 'Oyuncaq'];

  // Load vendor data
  useEffect(() => {
    if (!user || user.role !== 'vendor') {
     router.push('/');
     
    }
    loadVendorData();
  }, [user]);

  const loadVendorData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, statsRes] = await Promise.all([
        productsAPI.getVendorProducts(),
        ordersAPI.getVendorOrders(),
        vendorAPI.getStats(),
      ]);
      setMyProducts(productsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
      setStats(statsRes.data || { total_revenue: 0, total_orders: 0, total_products: 0 });
    } catch (err) {
      console.error('Failed to load vendor data', err);
      toast.error('Məlumatlar yüklənmədi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!newProduct.title || !newProduct.base_price) {
      toast.error('Məhsul adı və qiymət daxil edin');
      return;
    }

    try {
      const productData = {
        title: newProduct.title,
        description: newProduct.description || 'Məhsul təsviri',
        base_price: parseFloat(newProduct.base_price),
        discount_price: newProduct.discount_price ? parseFloat(newProduct.discount_price) : null,
        category: newProduct.category,
        images: newProduct.images.filter(img => img.trim() !== ''),
        stock: parseInt(newProduct.stock) || 100,
      };

      await productsAPI.create(productData);
      toast.success('Məhsul əlavə edildi!');
      setIsAddDialogOpen(false);
      setNewProduct({
        title: '',
        description: '',
        base_price: '',
        discount_price: '',
        category: 'Elektronika',
        images: [''],
        stock: '',
      });
      loadVendorData();
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Məhsul əlavə edilmədi');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    
    if (!editingProduct) return;

    try {
      const productData = {
        title: editingProduct.title,
        description: editingProduct.description,
        base_price: parseFloat(editingProduct.base_price),
        discount_price: editingProduct.discount_price ? parseFloat(editingProduct.discount_price) : null,
        category: editingProduct.category,
        images: editingProduct.images.filter(img => img.trim() !== ''),
        stock: parseInt(editingProduct.stock),
      };

      await productsAPI.update(editingProduct.id, productData);
      toast.success('Məhsul yeniləndi!');
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      loadVendorData();
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Məhsul yenilənmədi');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Məhsulu silmək istədiyinizə əminsiniz?')) return;

    try {
      await productsAPI.delete(productId);
      toast.success('Məhsul silindi');
      loadVendorData();
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Məhsul silinmədi');
    }
  };

  const openEditDialog = (product) => {
    setEditingProduct({ ...product });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
              style={{ fontFamily: 'Manrope, sans-serif' }}
              data-testid="vendor-dashboard-heading"
            >
              Satıcı Paneli
            </h1>
            <p className="text-muted" data-testid="store-name">
              Mağaza: {user?.store_name || user?.email}
            </p>
          </div>
          <Button
            data-testid="home-nav-button"
            variant="outline"
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Ana səhifə
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-border" data-testid="stats-revenue">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-muted">Ümumi Gəlir</h3>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-accent">
                {stats.total_revenue?.toFixed(2) || '0.00'} ₼
              </p>
            </CardContent>
          </Card>

          <Card className="border-border" data-testid="stats-orders">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-muted">Sifarişlər</h3>
              <ShoppingBag className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-500">
                {stats.total_orders || orders.length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border" data-testid="stats-products">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-muted">Məhsullar</h3>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-500">
                {myProducts.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="products" data-testid="tab-products">
              Məhsullar ({myProducts.length})
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              Sifarişlər ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="add" data-testid="tab-add">
              Əlavə et
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" data-testid="products-tab">
            {myProducts.length === 0 ? (
              <Card className="border-border">
                <CardContent className="py-16 text-center">
                  <Package className="h-16 w-16 mx-auto text-muted mb-4" />
                  <p className="text-muted mb-4">Hələ məhsul əlavə etməmisiniz</p>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-accent hover:bg-accent/90" data-testid="add-first-product-button">
                        <Plus className="h-4 w-4 mr-2" />
                        İlk məhsulu əlavə et
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <ProductForm
                        product={newProduct}
                        setProduct={setNewProduct}
                        onSubmit={handleAddProduct}
                        title="Yeni məhsul əlavə et"
                        categories={CATEGORIES}
                      />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myProducts.map((product) => (
                  <Card key={product._id} className="border-border" data-testid={`product-item-${product.id}`}>
                    <div className="aspect-square overflow-hidden bg-secondary">
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                      <p className="text-sm text-muted mb-2">{product.category}</p>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          {product.discount_price ? (
                            <>
                              <span className="font-bold text-accent">{product.discount_price.toFixed(2)} ₼</span>
                              <span className="text-sm text-muted line-through ml-2">
                                {product.base_price.toFixed(2)} ₼
                              </span>
                            </>
                          ) : (
                            <span className="font-bold">{product.base_price.toFixed(2)} ₼</span>
                          )}
                        </div>
                        <Badge variant="outline">Stok: {product.stock}</Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/product/${product.id}`)}
                        className="flex-1 gap-2"
                        data-testid={`view-product-${product.id}`}
                      >
                        <Eye className="h-4 w-4" />
                        Bax
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                        className="flex-1 gap-2"
                        data-testid={`edit-product-${product.id}`}
                      >
                        <Edit className="h-4 w-4" />
                        Düzəliş
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product._id)}
                        data-testid={`delete-product-${product.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" data-testid="orders-tab">
            {orders.length === 0 ? (
              <Card className="border-border">
                <CardContent className="py-16 text-center">
                  <ShoppingBag className="h-16 w-16 mx-auto text-muted mb-4" />
                  <p className="text-muted">Hələ sifariş yoxdur</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border-border" data-testid={`order-item-${order.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Sifariş #{order.id?.slice(0, 8)}</p>
                          <p className="text-sm text-muted">
                            {new Date(order.created_at).toLocaleDateString('az-AZ')}
                          </p>
                        </div>
                        <Badge
                          className={
                            order.status === 'completed'
                              ? 'bg-green-500'
                              : order.status === 'pending'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          }
                        >
                          {order.status === 'completed'
                            ? 'Tamamlandı'
                            : order.status === 'pending'
                            ? 'Gözləyir'
                            : 'İşlənir'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Müştəri:</span>
                          <span className="font-medium">{order.full_name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Telefon:</span>
                          <span className="font-medium">{order.phone}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Ünvan:</span>
                          <span className="font-medium">{order.shipping_address}</span>
                        </div>
                        <div className="border-t border-border pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Məbləğ:</span>
                            <span className="text-accent">{order.total?.toFixed(2)} ₼</span>
                          </div>
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="border-t border-border pt-2 mt-2">
                            <p className="text-sm text-muted mb-2">Məhsullar:</p>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm mb-1">
                                <span>{item.title} x{item.quantity}</span>
                                <span>{(item.price * item.quantity).toFixed(2)} ₼</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Add Product Tab */}
          <TabsContent value="add" data-testid="add-tab">
            <Card className="border-border">
              <CardHeader>
                <h2 className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Yeni məhsul əlavə et
                </h2>
              </CardHeader>
              <CardContent>
                <ProductForm
                  product={newProduct}
                  setProduct={setNewProduct}
                  onSubmit={handleAddProduct}
                  categories={CATEGORIES}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              setProduct={setEditingProduct}
              onSubmit={handleEditProduct}
              title="Məhsulu redaktə et"
              categories={CATEGORIES}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Product Form Component
const ProductForm = ({ product, setProduct, onSubmit, title, categories }) => {
  const handleImageChange = (index, value) => {
    const newImages = [...product.images];
    newImages[index] = value;
    setProduct({ ...product, images: newImages });
  };

  const addImageField = () => {
    setProduct({ ...product, images: [...product.images, ''] });
  };

  const removeImageField = (index) => {
    const newImages = product.images.filter((_, i) => i !== index);
    setProduct({ ...product, images: newImages });
  };

  return (
    <>
      {title && (
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Məhsul məlumatlarını daxil edin</DialogDescription>
        </DialogHeader>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Məhsul adı *</Label>
          <Input
            id="title"
            data-testid="product-title-input"
            required
            value={product.title}
            onChange={(e) => setProduct({ ...product, title: e.target.value })}
            placeholder="Məs: Samsung Galaxy S24"
          />
        </div>

        <div>
          <Label htmlFor="description">Təsvir</Label>
          <textarea
            id="description"
            data-testid="product-description-input"
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            placeholder="Məhsul haqqında məlumat"
            className="w-full min-h-[100px] px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="base_price">Qiymət (₼) *</Label>
            <Input
              id="base_price"
              data-testid="product-price-input"
              type="number"
              required
              step="0.01"
              min="0"
              value={product.base_price}
              onChange={(e) => setProduct({ ...product, base_price: e.target.value })}
              placeholder="299.99"
            />
          </div>
          <div>
            <Label htmlFor="discount_price">Endirimli qiymət (₼)</Label>
            <Input
              id="discount_price"
              data-testid="product-discount-input"
              type="number"
              step="0.01"
              min="0"
              value={product.discount_price}
              onChange={(e) => setProduct({ ...product, discount_price: e.target.value })}
              placeholder="249.99"
            />
          </div>
          <div>
            <Label htmlFor="stock">Stok *</Label>
            <Input
              id="stock"
              data-testid="product-stock-input"
              type="number"
              required
              min="0"
              value={product.stock}
              onChange={(e) => setProduct({ ...product, stock: e.target.value })}
              placeholder="100"
            />
          </div>
        </div>

        <div>
          <Label>Kateqoriya *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                data-testid={`category-${cat}`}
                onClick={() => setProduct({ ...product, category: cat })}
                className={`px-4 py-2 text-sm border rounded-md transition-colors ${
                  product.category === cat
                    ? 'bg-accent text-white border-accent'
                    : 'border-border hover:border-accent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Şəkil URL-ləri</Label>
          <div className="space-y-2 mt-2">
            {product.images.map((img, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  data-testid={`image-url-${index}`}
                  type="url"
                  value={img}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {product.images.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImageField(index)}
                    data-testid={`remove-image-${index}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addImageField}
              data-testid="add-image-button"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Şəkil əlavə et
            </Button>
          </div>
          <p className="text-xs text-muted mt-1">
            Boş qoysan default şəkil istifadə olunacaq
          </p>
        </div>

        <Button
          type="submit"
          data-testid="submit-product-button"
          className="w-full bg-accent hover:bg-accent/90"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          {title ? 'Yadda saxla' : 'Məhsulu əlavə et'}
        </Button>
      </form>
    </>
  );
};

export default VendorDashboard;
