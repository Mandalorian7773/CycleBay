import React, { useState } from 'react';
import NavBar from '../../Components/NavBar';
import axios from 'axios';
import './postAd.css';

const PostAd = () => {
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    price: '',
    category: '',
    condition: 'new',
    stock: 1,
    image: null,
    description: {
      BrandName: '',
      DaysUsed: '',
      Condition: 'New',
      color: ''
    }
  });

  const categoryFields = {
    Electronics: [
      { label: 'Warranty', name: 'Warranty', type: 'select', options: ['Yes', 'No'] },
      { label: 'Material', name: 'material', type: 'text' },
      { label: 'Weight', name: 'weight', type: 'text' },
      { label: 'Dimensions', name: 'dimensions', type: 'text' },
      { label: 'Model', name: 'model', type: 'text' },
      { label: 'Power Usage', name: 'powerUsage', type: 'text' },
      { label: 'Battery Life', name: 'batteryLife', type: 'text' }
    ],
    "Mobile Phones": [
      { label: 'Warranty', name: 'Warranty', type: 'select', options: ['Yes', 'No'] },
      { label: 'Model', name: 'model', type: 'text' },
      { label: 'Storage', name: 'storage', type: 'text' },
      { label: 'RAM', name: 'RAM', type: 'text' },
      { label: 'Battery Health', name: 'batteryHealth', type: 'text' }
    ],
    Clothes: [
      { label: 'Material', name: 'material', type: 'text' },
      { label: 'Size', name: 'size', type: 'text' },
      { label: 'Gender', name: 'gender', type: 'select', options: ['Male', 'Female', 'Unisex'] }
    ],
    Footwear: [
      { label: 'Material', name: 'material', type: 'text' },
      { label: 'Size', name: 'size', type: 'text' },
      { label: 'Type', name: 'type', type: 'text' }
    ],
    Accessories: [
      { label: 'Material', name: 'material', type: 'text' },
      { label: 'Type', name: 'type', type: 'text' },
      { label: 'Dimensions', name: 'dimensions', type: 'text' }
    ],
    Books: [
      { label: 'Author', name: 'author', type: 'text' },
      { label: 'Genre', name: 'genre', type: 'text' },
      { label: 'Pages', name: 'pages', type: 'number' },
      { label: 'Publisher', name: 'publisher', type: 'text' }
    ],
    "Beauty Products": [
      { label: 'Expiry Date', name: 'expiryDate', type: 'text' },
      { label: 'Ingredients', name: 'ingredients', type: 'text' },
      { label: 'Skin Type', name: 'skinType', type: 'select', options: ['All', 'Oily', 'Dry', 'Combination', 'Sensitive'] }
    ],
    Sports: [
      { label: 'Type', name: 'type', type: 'text' },
      { label: 'Weight', name: 'weight', type: 'text' },
      { label: 'Dimensions', name: 'dimensions', type: 'text' },
      { label: 'Material', name: 'material', type: 'text' }
    ]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData) {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        description: {
          ...prev.description,
          [name]: value
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'description') {
          Object.entries(value).forEach(([descKey, descValue]) => {
            formDataToSend.append(`description.${descKey}`, descValue);
          });
        } else {
          formDataToSend.append(key, value);
        }
      });

      const response = await axios.post('http://localhost:3000/product', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-access-token': localStorage.getItem('token')
        }
      });
      console.log("Product added:", response.data);
      alert("Congratulation! Product was added successfully")

      // Reset form
      setFormData({
        name: '',
        desc: '',
        price: '',
        category: '',
        condition: 'new',
        stock: 1,
        image: null,
        description: {
          BrandName: '',
          DaysUsed: '',
          Condition: 'New',
          color: ''
        }
      });
      } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const renderCategoryFields = () => {
    const fields = categoryFields[formData.category] || [];
    return fields.map(({ label, name, type, options }) => (
      <div key={name}>
        <label>{label}:</label>
        {type === 'select' ? (
          <select name={name} value={formData.description[name] || ''} onChange={handleChange} required>
            <option value="">Select</option>
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={formData.description[name] || ''}
            onChange={handleChange}
            required
          />
        )}
      </div>
    ));
  };

  return (
    <div className="post-ad-page">
      <NavBar />
      <div className="post-ad-container">
        <h1>POST YOUR AD<img src="https://cdn-icons-png.flaticon.com/128/1154/1154448.png" alt="Post Ad" />
</h1>
        <form className="post-ad-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Short Description</label>
            <textarea name="desc" value={formData.desc} onChange={handleChange} required />
          </div>

          <div className="form-group price-input">
            <label>Price</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" />
          </div>

          <div className="form-group">
            <label>Image File</label>
            <input type="file"
              name="image"
              accept="image/*"
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files[0] }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              {Object.keys(categoryFields).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Brand Name</label>
            <input type="text" name="BrandName" value={formData.description.BrandName} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Days Used</label>
            <input type="number" name="DaysUsed" value={formData.description.DaysUsed} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Condition</label>
            <select name="Condition" value={formData.description.Condition} onChange={handleChange} required>
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>
          </div>

          <div className="form-group">
            <label>Color</label>
            <input type="text" name="color" value={formData.description.color} onChange={handleChange} required />
          </div>

          {formData.category && (
            <div className="form-group">
              <label>Additional Details</label>
              {renderCategoryFields()}
            </div>
          )}

          <button type="submit" className="submit-button">Create Product</button>
        </form>
      </div>
    </div>
  );
};

export default PostAd; 