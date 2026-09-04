import { Link } from 'react-router-dom';
import { Dumbbell, Mail, Phone, MapPin, ChevronRight, Heart } from 'lucide-react';
import './Footer.scss';

const Footer = () => {
  // THE FIX: This function forces the browser back to the very top of the page instantly!
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Brand Column */}
        <div className="footer-col brand-col">
          <div className="footer-brand-info">
            <Dumbbell size={28} className="brand-icon" />
            <span>GK'S <strong>FITNESS SHOP</strong></span>
          </div>
          <p>
            Everything You Need, All In One Place. Discover Our Curated Collection Of Premium Gym Gear And Supplements. Shop The Best Quality To Fuel Your Performance.
          </p>
        </div>

        {/* Quick Links Column */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul>
            {/* THE FIX: Added onClick={scrollToTop} to every link */}
            <li><Link to="/" onClick={scrollToTop}><ChevronRight size={14} /> Home</Link></li>
            <li><Link to="/catalog" onClick={scrollToTop}><ChevronRight size={14} /> Products</Link></li>
            <li><Link to="/wishlist" onClick={scrollToTop}><ChevronRight size={14} /> Wishlist</Link></li>
            <li><Link to="/cart" onClick={scrollToTop}><ChevronRight size={14} /> Cart</Link></li>
            <li><Link to="/orders" onClick={scrollToTop}><ChevronRight size={14} /> Orders</Link></li>
            <li><Link to="/profile" onClick={scrollToTop}><ChevronRight size={14} /> Profile</Link></li>
          </ul>
        </div>

        {/* Categories Column */}
        <div className="footer-col">
          <h3>Categories</h3>
          <ul>
            {/* THE FIX: Added onClick={scrollToTop} to every category link */}
            <li><Link to="/catalog?category=Gym Equipments" onClick={scrollToTop}><ChevronRight size={14} /> Gym Equipments</Link></li>
            <li><Link to="/catalog?category=Whey Proteins" onClick={scrollToTop}><ChevronRight size={14} /> Whey Proteins</Link></li>
            <li><Link to="/catalog?category=Creatine" onClick={scrollToTop}><ChevronRight size={14} /> Creatine</Link></li>
            <li><Link to="/catalog?category=Protein Bars" onClick={scrollToTop}><ChevronRight size={14} /> Protein Bars</Link></li>
            <li><Link to="/catalog?category=Pre-workouts" onClick={scrollToTop}><ChevronRight size={14} /> Pre Workouts</Link></li>
            <li><Link to="/catalog?category=Essential Supplements" onClick={scrollToTop}><ChevronRight size={14} /> Essential Supplements</Link></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="footer-col contact-col">
          <h3>Contact</h3>
          <div className="contact-line">
            <MapPin size={18} className="contact-icon" />
            <span>123 Fitness Street, Gym City, Chennai, Tamil Nadu</span>
          </div>
          <div className="contact-line">
            <Phone size={18} className="contact-icon" />
            <span>+91 98765 43210</span>
          </div>
          <div className="contact-line">
            <Mail size={18} className="contact-icon" />
            <span>support@gksfitness.com</span>
          </div>
        </div>
      </div>

      {/* Footer Bottom / Developer Credit */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} GK's Fitness Shop. All Rights Reserved.</p>
          <p className="developer-tag">
            Developed with <Heart size={14} className="heart-icon" /> by <strong>Gokul Krishna</strong>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;