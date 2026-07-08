import React from 'react';
import Navbar from '../components/layout/Navbar';
import RegisterForm from '../components/auth/RegisterForm';
import Footer from '../components/layout/Footer';

function RegisterPage() {
  return (
    <div>
      <Navbar />
      <RegisterForm />
      <Footer />
    </div>
  );
}

export default RegisterPage;