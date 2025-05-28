import React, {useEffect, useState} from 'react'
import NavBar from '../../Components/NavBar'
//import {jwtDecode} from 'jwt-decode'
import {useParams, useNavigate} from 'react-router-dom'
import {useAuthContext} from '../../context/AuthContext'
import './productDetail.css'

function ProductDetail() {
  const {id} = useParams()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/product/${id}`)
        if(!response.ok)throw new Error("Failed to fetch product details")
        const result = await response.json()

        if(result.success){
          setProduct(result.data)
        }
        else{
          throw new Error(result.message || "Failed to fetch product details")
        }
      }
      catch(err){
        setError(err.message)
        console.error("Error fetching product details:", err)
      }
      finally{
        setLoading(false)
      }
    }
    fetchProductDetails()
  }, [id])

  const handleMakeOffer = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("User not logged in.");
      return;
    }

    let buyerName = 'A user';
    try {
      const decoded = jwtDecode(token);
      buyerName = decoded.name || decoded.email || 'A user';
    } catch (err) {
      console.error("Error decoding token:", err);
    }

    const sellerEmail = product.createdBy?.email;
    const productName = product.name;

    if (!sellerEmail) {
      alert("Seller email not available.");
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/offer/send-offer', {
        method: 'POST',
        headers: { 
          'x-access-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sellerEmail, buyerName, productName })
      });

      const result = await response.json();
      if (result.success) {
        alert("Offer sent to the seller!");
      } else {
        alert("Failed to send offer.");
      }
    } catch (err) {
      console.error("Error sending offer:", err);
      alert("Something went wrong while sending the offer.");
    }
  };

  const handleChatWithSeller = () => {
    if (!user) {
      alert("Please login to chat with the seller");
      return;
    }

    if (product.createdBy._id === user._id) {
      alert("You cannot chat with yourself");
      return;
    }

    // Navigate to messages page with seller's ID
    navigate(`/messages?sellerId=${product.createdBy._id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  if(loading)return (
    <>
      <NavBar />
      <div className="product-container">
        <p>Loading product details...</p>
      </div>
    </>
  )

  if(error)return (
    <>
      <NavBar />
      <div className="product-container">
        <p>Error: {error}</p>
      </div>
    </>
  )

  if(!product)return (
    <>
      <NavBar /> 
      <div className="product-container">
        <p>Product not found</p>
      </div>
    </>
  )

  return (
    <>
      <NavBar />
      <div className="product-container">
        <div className="content-wrapper">
          <div className="image-wrapper">
            <img src={`http://localhost:3000/uploads/${product.image}`} alt={product.name} className="product-image" />
          </div>

          <div className="info-box">
            <h1 className="product-title">{product.name}</h1>
            <h2 className="product-price">{formatPrice(product.price)}</h2>

            <div className="product-description">
              <div className="overview-header">
                <h3>Overview</h3>
                <div className="price-action-section">
                  <h2 className="overview-price">{formatPrice(product.price)}</h2>
                  <button className="make-offer-btn" onClick={handleMakeOffer}>Make Offer</button>
                </div>
              </div> 
              <div className="description-details">
                <div className="description-text">
                  <p>{product.desc}</p>
                </div>
                <div className="overview-list">
                  {Object.entries(product.description || {}).map(([key, value]) => (
                    <div key={key} className="description-item">
                      <span className="description-label">{key}</span>
                      <span className="description-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="seller-info-section">
              <div className="seller-header">
                <h3>Seller Information</h3>
              </div>
              <div className="seller-details">
                <div className="seller-info">
                  <div className="info-item">
                    <span className="info-label">Posted by:</span>
                    <span className="info-value">{product.createdBy?.name || 'Anonymous'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Posted on:</span>
                    <span className="info-value">{new Date(product.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button className="chat-seller-btn" onClick={handleChatWithSeller}>
                  <img src="https://cdn-icons-png.flaticon.com/128/134/134914.png" alt="chat" />
                  Chat with Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductDetail
