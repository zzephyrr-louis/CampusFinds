import React from 'react';
import Navbar from '../components/layout/Navbar';
import LoginForm from '../components/auth/LoginForm';
import Footer from '../components/layout/Footer';

function LoginPage() {
  return (
    <div>
      <Navbar />
      <LoginForm />
      <Footer />
    </div>
  );
}

export default LoginPage;