import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Home.scss';
import heroImg from '../../assets/Home.webp';

/* 🔥 The 95+ Fix: All category images updated to lightweight WebP format */
import gymEquipmentImg from '../../assets/Gym-Equipments.webp';
import wheyImg from '../../assets/Whey-Protien.webp';
import creatineImg from '../../assets/Creatine.webp';
import proteinBarsImg from '../../assets/Protien-bars.webp';
import preworkoutImg from '../../assets/Preworkout.webp';
import essentialSuppsImg from '../../assets/Essantial-Supplements.webp';

const categories = [
  { name: 'Gym Equipments', image: gymEquipmentImg },
  { name: 'Whey Proteins', image: wheyImg },
  { name: 'Creatine', image: creatineImg },
  { name: 'Protein Bars', image: proteinBarsImg },
  { name: 'Pre workouts', image: preworkoutImg },
  { name: 'Essential Supplements', image: essentialSuppsImg },
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
      localStorage.removeItem('cartItems');
    }
  }, [isAuthenticated]);

  const handleNavigationClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="home">
      <section className="home-hero">
        {/* 🔥 THE ULTIMATE LCP FIX: An inline image tag tells the browser to download this immediately! */}
        <img
          src={heroImg}
          alt="GK Fitness Premium Gym Gear"
          className="home-hero-bg"
          fetchpriority="high"
        />

        <div className="home-hero-content">
          <h1>Everything You Need, All in One Place.</h1>
          <p>Discover our curated collection of premium gym gear and supplements. Shop the best quality to fuel your performance.</p>
          <Link to="/catalog" className="btn-cta" onClick={handleNavigationClick}>Start Shopping</Link>
        </div>
      </section>

      <section className="home-categories">
        <h2>Shop by Category</h2>
        <p className="section-subtitle">Browse our premium collection</p>
        <div className="home-category-grid">
          {categories.map((cat, idx) => (
            <Link
              to={`/catalog?category=${cat.name}`}
              key={idx}
              className="home-category-card"
              onClick={handleNavigationClick}
            >
              <div className="circle">
                <img
                  src={cat.image}
                  alt={cat.name}
                  width="200"
                  height="200"
                  style={{ objectFit: 'cover' }}
                  loading="lazy"
                />
              </div>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;