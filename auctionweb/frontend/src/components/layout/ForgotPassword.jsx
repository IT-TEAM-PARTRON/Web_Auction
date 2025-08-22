import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { forgotPassword } from '../../services/api';
import logo from '../../assets/images/logo.png';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const savedLang = sessionStorage.getItem('lang');
    i18n.changeLanguage(savedLang);    
  }, [i18n]);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error(t('email_required', 'Please enter your email address'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('invalid_email', 'Please enter a valid email address'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await forgotPassword(email);
      
      if (response.status === 200) {
        toast.success(t('reset_link_sent', 'Password reset link has been sent to your email!'), {
          style: {
            border: '1px solid #4ade80',
            padding: '12px 16px',
            color: '#16a34a',
            fontWeight: '500',
            fontFamily: 'Inter, sans-serif',
            fontSize: '15px',
            borderRadius: '12px',
            background: '#f0fdf4',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
          iconTheme: {
            primary: '#16a34a',
            secondary: '#ecfdf5',
          },
        });
        navigate('/login');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.detail || t('reset_link_failed', 'Failed to send reset link. Please try again.');
      toast.error(errorMessage, {
        style: {
          border: '1px solid #fecaca',
          padding: '12px 16px',
          color: '#dc2626',
          fontWeight: '500',
          fontFamily: 'Inter, sans-serif',
          fontSize: '15px',
          borderRadius: '12px',
          background: '#fef2f2',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
        iconTheme: {
          primary: '#dc2626',
          secondary: '#fef2f2',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-bg">
      <img src={logo} alt="Logo" className="forgot-password-logo" />
      
      <div className={`forgot-password-form-container transition-all duration-700 ease-out ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>     
        {/* Header */}
        <h1 className="forgot-password-title">
          {t('forgot_password_title', 'Forgot Password')}
        </h1>
        <p className="forgot-password-description">
          {t('forgot_password_desc', 'Enter your email address and we\'ll send you a link to reset your password.')}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Email Input */}
          <div className="forgot-password-input-group">
            <span className="forgot-password-input-icon">
              <FontAwesomeIcon icon={faEnvelope} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('enter_email', 'Enter your email address')}
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          {/* Language Selector */}
          <div className="forgot-password-language-selector">
            <select
              value={i18n.language}
              onChange={(e) => {
                i18n.changeLanguage(e.target.value);
                sessionStorage.setItem('lang', e.target.value);
              }}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
              <option value="ko">한국어</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="forgot-password-btn"
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                  animation: 'spin 1s linear infinite',
                  borderRadius: '50%',
                  height: '20px',
                  width: '20px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  marginRight: '8px'
                }}></div>
                {t('sending', 'Sending...')}
              </div>
            ) : (
              t('send_reset_link', 'Send Reset Link')
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="forgot-password-footer">
          <p>
            {t('no_account', 'Remember your password?')}{' '}
            <Link to="/login">
              {t('sign_in', 'Sign in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword; 