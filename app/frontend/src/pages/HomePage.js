import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import ProductCard from '../../../../components/ProductCard';
import { Button } from '../components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';

const CATEGORIES = ['Hamısı', 'Elektronika', 'Geyim və Ayaqqabı', 'Ev və Bağ'];

const HomePage = () => {
  const router = useRouter();
  const { filteredProducts, selectedCategory, setSelectedCategory, setSearchQuery } = useApp();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Bazarchi
          </h1>
          <p className="text-lg md:text-xl opacity-90" data-testid="hero-subtitle">
            Alış-verişin yeni dili
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                data-testid={`category-${cat}`}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? 'bg-accent hover:bg-accent/90' : ''}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ fontFamily: 'Manrope, sans-serif' }} data-testid="products-heading">
          Məhsullar
        </h2>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground" data-testid="no-products">
            <p className="text-lg">Məhsul tapılmadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" data-testid="products-grid">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => router.push(`/product/${product.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
