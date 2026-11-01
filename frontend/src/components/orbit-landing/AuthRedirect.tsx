import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Legacy /signin and /signup URLs open the Emergent-designed auth modal on
 * the landing page; the old auth page components are never rendered.
 */
export function AuthRedirect({ mode }: { mode: 'login' | 'signup' }) {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/', { replace: true, state: { authMode: mode } });
    }, [mode, navigate]);

    return null;
}
