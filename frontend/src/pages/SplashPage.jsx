import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styles from '../splash.module.css';
import profileImg from '../assets/imgs/profile.jpg';

function SplashPage() {
  const [isFading, setIsFading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Trigger fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2500);

    // 2. Redirect to /home after the 0.5s fade finishes
    const redirectTimer = setTimeout(() => {
      navigate('/home');
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <>
      <Helmet>
        <title>Loading... | Jayvee Reyes</title>
      </Helmet>

      <div className={`${styles.splashBody} ${isFading ? styles.fadeOut : ''}`}>
        {/* Subtle background glow effect */}
        <div className={styles.backgroundGlow}></div>

        <div className={styles.loaderContainer}>
          <div className={styles.imageWrapper}>
            {/* Spinning ring around the image */}
            <div className={styles.spinnerRing}></div>
            <img src={profileImg} className={styles.logoImg} alt="Jayvee Reyes" />
          </div>

          <h1 className={styles.title}>
            Personal Coding Journey<span className={styles.cursor}>_</span>
          </h1>

          {/* Animated progress bar */}
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SplashPage;