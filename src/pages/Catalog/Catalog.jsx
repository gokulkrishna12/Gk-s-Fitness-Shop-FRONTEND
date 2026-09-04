import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import axiosClient from '../../api/axiosClient';
import { toast } from 'sonner';
import './Catalog.scss';

const categories = ['All', 'Gym Equipments', 'Whey Proteins', 'Creatine', 'Protein Bars', 'Pre-workouts', 'Essential Supplements'];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');

  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosClient.get('/products');
        setDbProducts(response.data.products || response.data || []);
      } catch (error) {
        toast.error('Failed to load products from database');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && categories.includes(cat)) {
      setActiveCategory(cat);
    }
  }, [searchParams]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSearchParams(cat === 'All' ? {} : { category: cat });
  };

  const filteredProducts = useMemo(() => {
    return dbProducts.filter((product) => {
      const matchCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [dbProducts, activeCategory, searchTerm]);

  if (loading) {
    return <div className="catalog-page"><div className="loader container">Loading Equipment...</div></div>;
  }

  return (
    // THE FIX: Separated catalog-page (background) from container (width limiter)
    <div className="catalog-page">
      <div className="container">

        <div className="catalog-header">
          {/* THE FIX: Removed the giant "Gear & Supplements" H1 so it looks much cleaner like your screenshot! */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <div className="no-products">
              <h3>No products found</h3>
              <p>Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Catalog;