import React from 'react';

import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import VendorDashboard from '../../../components/VendorDashboard';
import OrderSuccessPage from './pages/OrderSuccessPage';
import { Toaster } from './components/ui/sonner';
import './App.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/vendor" element={<VendorDashboard />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
