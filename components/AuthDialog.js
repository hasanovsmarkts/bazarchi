import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

const AuthDialog = ({ onClose }) => {
  const { login, register } = useApp();
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'buyer',
    store_name: '',
  });

const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("LOGIN CLICKED"); // 🔥 BURA

  let success = false;
  if (mode === 'login') {
    console.log("LOGIN MODE", formData.email, formData.password); // əlavə debug
    success = await login(formData.email, formData.password);
  } else {
    console.log("REGISTER MODE", formData);
    success = await register(formData);
  }

  console.log("SUCCESS:", success);

  if (success) {
    onClose();
  }
};


  return (
    <>
      <DialogHeader>
        <DialogTitle data-testid="auth-dialog-title">
          {mode === 'login' ? 'Daxil ol' : 'Qeydiyyat'}
        </DialogTitle>
        <DialogDescription>
          {mode === 'login' ? 'Hesabınıza daxil olun' : 'Yeni hesab yaradın'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            data-testid="email-input"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="password">Şifrə</Label>
          <Input
            id="password"
            data-testid="password-input"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        {mode === 'register' && (
          <>
            <div>
              <Label>Rol seçin</Label>
              <RadioGroup
                data-testid="role-group"
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="buyer" id="buyer" data-testid="role-buyer" />
                  <Label htmlFor="buyer">Alıcı</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vendor" id="vendor" data-testid="role-vendor" />
                  <Label htmlFor="vendor">Satıcı</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.role === 'vendor' && (
              <div>
                <Label htmlFor="store_name">Mağaza adı</Label>
                <Input
                  id="store_name"
                  data-testid="store-name-input"
                  required
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  placeholder="Məs: Tech Store"
                />
              </div>
            )}
          </>
        )}

        <Button
          data-testid="submit-button"
          type="submit"
          className="w-full bg-accent hover:bg-accent/90"
        >
          {mode === 'login' ? 'Daxil ol' : 'Qeydiyyatdan keç'}
        </Button>

        <p className="text-sm text-center">
          {mode === 'login' ? (
            <>
              Hesabınız yoxdur?{' '}
              <button
                data-testid="switch-to-register"
                type="button"
                onClick={() => setMode('register')}
                className="text-accent hover:underline"
              >
                Qeydiyyatdan keçin
              </button>
            </>
          ) : (
            <>
              Artıq hesabınız var?{' '}
              <button
                data-testid="switch-to-login"
                type="button"
                onClick={() => setMode('login')}
                className="text-accent hover:underline"
              >
                Daxil olun
              </button>
            </>
          )}
        </p>
      </form>
    </>
  );
};

export default AuthDialog;
