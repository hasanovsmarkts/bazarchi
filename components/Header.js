import React, { useState } from 'react';

import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { ShoppingCart, User, Package, Home, Search } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import AuthDialog from "@/components/AuthDialog";


const Header = () => {
  const router = useRouter();
  const { user, logout, cart, cartCount, setSearchQuery } = useApp();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-sm" data-testid="header">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            data-testid="logo-button"
            onClick={() => router.push('/')}
            className="text-2xl font-bold bg-gradient-to-r from-accent via-amber-500 to-yellow-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Bazarchi
          </button>

          {/* Search */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted h-5 w-5" />
              <Input
                data-testid="search-input"
                placeholder="Məhsul axtar..."
                className="pl-10 bg-secondary/50 border-border focus:bg-white transition-colors"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'vendor' && (
                  <Button
                    data-testid="vendor-panel-button"
                    variant="outline"
                    onClick={() => router.push('/vendor')}
                    className="gap-2"
                  >
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">Satıcı Paneli</span>
                  </Button>
                )}
                <Button
                  data-testid="home-button"
                  variant="ghost"
                  onClick={() => router.push('/')}
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                </Button>
                <Button
                  data-testid="logout-button"
                  variant="ghost"
                  onClick={logout}
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Çıxış</span>
                </Button>
              </>
            ) : (
              <Dialog open={authOpen} onOpenChange={setAuthOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="auth-button" variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Daxil ol</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <AuthDialog onClose={() => setAuthOpen(false)} />
                </DialogContent>
              </Dialog>
            )}

            {/* Cart Button */}
            <Button
              data-testid="cart-button"
              variant="outline"
              onClick={() => router.push('/cart')}
              className="gap-2 relative"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Səbət</span>
              {cartCount > 0 && (
                <Badge
                  data-testid="cart-count"
                  className="absolute -top-2 -right-2 bg-accent px-2 py-0.5 text-xs"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
