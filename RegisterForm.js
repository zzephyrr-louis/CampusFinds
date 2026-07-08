import React from 'react';

function RegisterForm() {
  return (
    <div>
      <h2>Register</h2>
      <form>
        <div>
          <label>Full Name:</label>
          <input type="text" />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" />
        </div>
        <div>
          <label>Confirm Password:</label>
          <input type="password" />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterForm;