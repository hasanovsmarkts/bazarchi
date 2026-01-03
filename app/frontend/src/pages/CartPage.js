import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { ordersAPI, paymentsAPI } from '../../../../services/api';
import { toast } from 'sonner';

const CartPage = () => {
  const router = useRouter();
  const { user, cart, cartTotal, updateCartQuantity, removeFromCart, clearCart } = useApp();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    full_name: '',
    phone: '',
    shipping_address: '',
  });
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Sifariş vermək üçün daxil olmalısınız');
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderData = {
        items: cart.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        total: cartTotal,
        ...checkoutData,
      };

      const orderRes = await ordersAPI.create(orderData);
      const order = orderRes.data;

      // Create Stripe checkout session
      const origin_url = window.location.origin;
      const checkoutRes = await paymentsAPI.createCheckoutSession({
        order_id: order.id,
        origin_url,
      });

      // Redirect to Stripe
      if (checkoutRes.data.url) {
        window.location.href = checkoutRes.data.url;
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Sifariş uğursuz oldu');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif' }}
            data-testid="cart-heading"
          >
            Səbət
          </h1>
          <Button
            data-testid="continue-shopping-button"
            variant="outline"
            onClick={() => router.push('/')}
          >
            Alış-verişə davam et
          </Button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16" data-testid="empty-cart">
            <ShoppingCart className="h-24 w-24 mx-auto text-muted mb-4" />
            <p className="text-xl text-muted mb-4">Səbət boşdur</p>
            <Button
              data-testid="browse-products-button"
              onClick={() => router.push('/')}
              className="bg-accent hover:bg-accent/90"
            >
              Məhsullara bax
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4" data-testid="cart-items">
              {cart.map((item) => (
                <Card key={item.itemId} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded border border-border"
                        data-testid="cart-item-image"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1" data-testid="cart-item-title">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted mb-1" data-testid="cart-item-seller">
                          {item.seller_name}
                        </p>
                        {item.variant_label && (
                          <p className="text-sm text-muted mb-2" data-testid="cart-item-variant">
                            {item.variant_label}
                          </p>
                        )}
                        <div className="flex items-center gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              data-testid="decrease-quantity-button"
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(item.itemId, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center" data-testid="cart-item-quantity">
                              {item.quantity}
                            </span>
                            <Button
                              data-testid="increase-quantity-button"
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(item.itemId, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <span className="font-bold text-accent" data-testid="cart-item-total">
                            {(item.price * item.quantity).toFixed(2)} ₼
                          </span>
                        </div>
                      </div>
                      <Button
                        data-testid="remove-item-button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.itemId)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24 border-border">
                <CardHeader>
                  <h3
                    className="text-xl font-bold"
                    style={{ fontFamily: 'Manrope, sans-serif' }}
                    data-testid="order-summary-heading"
                  >
                    Sifariş xülasəsi
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Məhsullar ({cart.length})</span>
                    <span data-testid="cart-subtotal">{cartTotal.toFixed(2)} ₼</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Çatdırılma</span>
                    <span className="text-green-500" data-testid="shipping-cost">Pulsuz</span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between text-xl font-bold">
                    <span>Yekun</span>
                    <span className="text-accent" data-testid="cart-total">
                      {cartTotal.toFixed(2)} ₼
                    </span>
                  </div>
                  <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="submit"
                        data-testid="checkout-button"
                        className="w-full bg-accent hover:bg-accent/90"
                        size="lg"
                        disabled={!user}
                      >
                        {user ? 'Sifarişi təsdiqlə' : 'Daxil olun'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle data-testid="checkout-dialog-title">Çatdırılma məlumatları</DialogTitle>
                        <DialogDescription>
                          Sifariş məlumatlarınızı daxil edin
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCheckout} className="space-y-4">
                        <div>
                          <Label htmlFor="full_name">Ad Soyad *</Label>
                          <Input
                            id="full_name"
                            data-testid="full-name-input"
                            required
                            value={checkoutData.full_name}
                            onChange={(e) =>
                              setCheckoutData({ ...checkoutData, full_name: e.target.value })
                            }
                            placeholder="Ad Soyadınız"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Telefon *</Label>
                          <Input
                            id="phone"
                            data-testid="phone-input"
                            required
                            value={checkoutData.phone}
                            onChange={(e) =>
                              setCheckoutData({ ...checkoutData, phone: e.target.value })
                            }
                            placeholder="+994"
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Ünvan *</Label>
                          <Input
                            id="address"
                            data-testid="address-input"
                            required
                            value={checkoutData.shipping_address}
                            onChange={(e) =>
                              setCheckoutData({
                                ...checkoutData,
                                shipping_address: e.target.value,
                              })
                            }
                            placeholder="Çatdırılma ünvanı"
                          />
                        </div>
                        <Button
                        
                          data-testid="confirm-checkout-button"
                          type="submit"
                          className="w-full bg-accent hover:bg-accent/90"
                          disabled={loading}
                        >
                          {loading ? 'Yüklənir...' : 'Ödənişə keç'}
                        </Button>
                      </form>
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
};

export default CartPage;
