import axios from 'axios';
import Swal from 'sweetalert2';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// 1. Interceptor de SOLICITUD (El que ya tenías)
// Inyecta el token antes de salir hacia el backend
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Interceptor de RESPUESTA (NUEVO) 🚨
// Escucha si el backend nos rechaza (401)
api.interceptors.response.use(
    (response) => {
        // Si todo sale bien, deja pasar la respuesta
        return response;
    },
    (error) => {
        // Si el error es 401 (No autorizado / Token vencido)
        if (error.response && error.response.status === 401) {
            
            // Evitar bucles infinitos si ya estamos en login
            if (window.location.pathname !== '/login') {
                
                // 1. Limpiar basura local
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // 2. Avisar al usuario (Opcional, pero amable)
                Swal.fire({
                    icon: 'warning',
                    title: 'Sesión Expirada',
                    text: 'Por seguridad, tu sesión ha terminado. Ingresa nuevamente.',
                    confirmButtonText: 'Entendido',
                    allowOutsideClick: false,
                    allowEscapeKey: false
                }).then(() => {
                    // 3. Redirigir al Login forzadamente
                    window.location.href = '/login';
                });
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;