
import React from 'react';
import { Route } from 'react-router-dom';
import Home from '../modules/home/pages/Home';
import About from '../modules/about/pages/About';
import Products from '../modules/products/pages/Products';
import Services from '../modules/services/pages/Services';
import Contact from '../modules/contact/pages/Contact';
import Cart from '../modules/cart/pages/Cart';
import Checkout from '../modules/cart/checkout/Checkout';
import Login from '../modules/auth/pages/Login';
import NotFound from '../pages/NotFound';

export const PublicRoutes: React.FC = () => {
  return (
    <>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="products" element={<Products />} />
      <Route path="services" element={<Services />} />
      <Route path="contact" element={<Contact />} />
      <Route path="cart" element={<Cart />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </>
  );
};
