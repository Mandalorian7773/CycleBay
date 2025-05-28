import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import axios from "axios";
import "./signin.css";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { login } = useAuthContext();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/user/login", formData);
      console.log('Login response:', response.data);
      
      if (response.data.success && response.data.token) {
        const { token } = response.data;
        
        // Ensure token is properly formatted before storing
        const cleanToken = token.trim();
        
        const tokenParts = cleanToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const userData = {
            token: cleanToken,
            email: formData.email,
            _id: payload.userId,
            type: payload.type || 'user'
          };
          
          login(userData);
          navigate('/', { replace: true }); 
        } else {
          throw new Error('Invalid token format');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error("Error:", error.message);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="signin-page">
      <div className="container">
        <h1>Welcome Back</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <p>
              Don't have an account? <Link to="/signup">Register</Link>
            </p>
          </div>
          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
