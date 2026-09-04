import { useState, useEffect } from 'react';
import { getProducts } from '../../api/productApi';
import ProductCard from '../../components/ProductCard/ProductCard';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import './Home.scss';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        fetchInventory();
    }, []); // Run once on mount

    const fetchInventory = async (searchKeyword = '') => {
        setLoading(true);
        try {
            const data = await getProducts(searchKeyword);
            setProducts(data);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchInventory(keyword);
    };

    return (
        <div className="home-page">
            {/* Hero Banner */}
            <section className="hero-section">
                <h1>Fuel Your <span>Performance</span></h1>
                <p>Premium gear and supplements for serious athletes.</p>

                <form className="search-bar" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search for whey, dumbbells..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <button type="submit"><Search size={20} /></button>
                </form>
            </section>

            {/* Product Grid */}
            <section className="products-section">
                <div className="section-header">
                    <h2>Latest Arrivals</h2>
                    <span>{products.length} Items Found</span>
                </div>

                {loading ? (
                    <div className="loader">Loading inventory...</div>
                ) : products.length === 0 ? (
                    <div className="no-products">No products found for "{keyword}"</div>
                ) : (
                    <div className="product-grid">
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;