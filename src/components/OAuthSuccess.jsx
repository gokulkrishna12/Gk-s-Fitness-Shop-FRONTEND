import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            // Securely store the JWT
            localStorage.setItem('token', token);

            // Redirect the authenticated user to the home page
            navigate('/');
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
            <h2>Authenticating via Google...</h2>
        </div>
    );
};

export default OAuthSuccess;