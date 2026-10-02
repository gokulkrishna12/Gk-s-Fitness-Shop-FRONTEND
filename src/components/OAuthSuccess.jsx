import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const userEncoded = searchParams.get('user');

        if (token) {
            // Save the JWT token
            localStorage.setItem('token', token);

            // 🔥 FIX: If the backend passed the fresh user object, save it immediately!
            if (userEncoded) {
                try {
                    const userData = JSON.parse(decodeURIComponent(userEncoded));
                    localStorage.setItem('user', JSON.stringify(userData));
                } catch (e) {
                    console.error("Failed to parse user data from oauth redirect", e);
                }
            }

            // Hard redirect forces React to reload and pick up the new admin role instantly
            window.location.href = '/';
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif', color: '#fff' }}>
            <h2>Authenticating via Google...</h2>
        </div>
    );
};

export default OAuthSuccess;