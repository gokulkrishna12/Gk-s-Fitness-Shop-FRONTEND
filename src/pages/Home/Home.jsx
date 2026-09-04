import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Home.scss';

// Import local images from the assets folder
import gymEquipmentImg from '../../assets/Gym-Equipments.jpg';
import wheyImg from '../../assets/Whey-Protien.jpg';
import creatineImg from '../../assets/Creatine.jpg';
import proteinBarsImg from '../../assets/Protien-bars.jpg';
import preworkoutImg from '../../assets/Preworkout.jpg';
import essentialSuppsImg from '../../assets/Essantial-Supplements.jpg';

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

  // 🔥 THE FIX 1: Ghost Garbage Collector!
  // If the user logs out or visits as a guest, we forcefully wipe any leftover cart/wishlist memory
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
      localStorage.removeItem('cartItems');
    }
  }, [isAuthenticated]);

  // 🔥 THE FIX 2: Smooth Scroll to Top
  const handleNavigationClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="home">
      <section className="home-hero">
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
                <img src={cat.image} alt={cat.name} />
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