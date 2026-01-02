import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { productsAPI } from '../../../../services/api';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const ProductPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useApp();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await productsAPI.getById(id);
      setProduct(res.data.product);
      setVariants(res.data.variants || []);
      if (res.data.variants?.length > 0) {
        setSelectedVariant(res.data.variants[0]);
      }
    } catch (err) {
      toast.error('Məhsul tapılmadı');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Yüklənir...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discount = product.discount_price
    ? Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)
    : 0;

  const displayPrice = selectedVariant ? selectedVariant.price : (product.discount_price || product.base_price);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button
          data-testid="back-button"
          variant="outline"
          onClick={() => router.push('/')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri
        </Button>

        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-xl p-8 shadow-sm border border-border">
          {/* Image */}
          <div className="aspect-square bg-secondary rounded-xl overflow-hidden">
            <img
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'}
              alt={product.title}
              className="w-full h-full object-cover"
              data-testid="product-image"
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2" data-testid="product-category">{product.category}</Badge>
              <h1
                className="text-3xl md:text-4xl font-bold mb-2 tracking-tight"
                style={{ fontFamily: 'Manrope, sans-serif' }}
                data-testid="product-title"
              >
                {product.title}
              </h1>
              <p className="text-muted" data-testid="seller-name">Satıcı: {product.seller_name}</p>
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Variantlar</Label>
                <RadioGroup
                  data-testid="variants-group"
                  value={selectedVariant?.id}
                  onValueChange={(value) => {
                    const variant = variants.find(v => v.id === value);
                    setSelectedVariant(variant);
                  }}
                  className="space-y-2"
                >
                  {variants.map((variant) => (
                    <div key={variant.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={variant.id} id={variant.id} data-testid={`variant-${variant.id}`} />
                      <Label htmlFor={variant.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <span>{variant.options.map(o => o.value).join(', ')}</span>
                          <span className="font-semibold">{variant.price.toFixed(2)} ₼</span>
                        </div>
                        <span className="text-xs text-muted">
                          {variant.stock > 0 ? `Stok: ${variant.stock}` : 'Stokda yoxdur'}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span
                className="text-4xl font-bold text-accent"
                data-testid="display-price"
              >
                {displayPrice.toFixed(2)} ₼
              </span>
              {product.discount_price && !selectedVariant && (
                <>
                  <span className="text-xl text-muted line-through" data-testid="original-price">
                    {product.base_price.toFixed(2)} ₼
                  </span>
                  <Badge className="bg-red-500 text-lg px-3 py-1" data-testid="discount-badge">
                    -{discount}%
                  </Badge>
                </>
              )}
            </div>

            {/* Add to Cart Button */}
            <Button
              data-testid="add-to-cart-button"
              onClick={() => {
                addToCart(product, selectedVariant);
                router.push('/cart');
              }}
              size="lg"
              className="w-full bg-accent hover:bg-accent/90 text-lg py-6 transition-all"
              disabled={selectedVariant && selectedVariant.stock === 0}
            >
              {selectedVariant && selectedVariant.stock === 0 ? 'Stokda yoxdur' : 'Səbətə əlavə et'}
            </Button>

            {/* Description */}
            {product.description && (
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold mb-2">Məhsul haqqında</h3>
                <p className="text-muted" data-testid="product-description">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
