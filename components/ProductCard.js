import React from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const ProductCard = ({ product, onClick }) => {
  const { addToCart } = useApp();
  const discount = product.discount_price
    ? Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)
    : 0;

  const price = product.discount_price || product.base_price;

  return (
    <Card
      className="product-card overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-border"
      data-testid={`product-card-${product.id}`}
    >
      <div
        className="aspect-square overflow-hidden bg-secondary"
        onClick={onClick}
        data-testid="product-image-container"
      >
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4">
        <p className="text-xs text-muted mb-1" data-testid="seller-name">{product.seller_name}</p>
        <h3
          className="font-medium text-sm mb-2 line-clamp-2 cursor-pointer hover:text-accent transition-colors"
          onClick={onClick}
          data-testid="product-title"
        >
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2 flex-wrap">
          {product.discount_price ? (
            <>
              <span className="text-lg font-bold text-accent" data-testid="discount-price">
                {product.discount_price.toFixed(2)} ₼
              </span>
              <span className="text-sm text-muted line-through" data-testid="base-price">
                {product.base_price.toFixed(2)} ₼
              </span>
              <Badge className="bg-red-500 text-xs" data-testid="discount-badge">
                -{discount}%
              </Badge>
            </>
          ) : (
            <span className="text-lg font-bold" data-testid="base-price">
              {product.base_price.toFixed(2)} ₼
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          data-testid="add-to-cart-button"
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          className="w-full bg-accent hover:bg-accent/90 transition-all"
        >
          Səbətə əlavə et
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
