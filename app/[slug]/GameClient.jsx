'use client'

import { useState, useEffect } from "react";
import Game from "../components/game";
import styles from '../styles/GamePage.module.css';
import { useRouter } from 'next/navigation';

export default function GameClient({ game, slug, allGames, banners = [] }) {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showNsfwModal, setShowNsfwModal] = useState(false);
    const [showMobileWarning, setShowMobileWarning] = useState(false);
    const [currentBanner, setCurrentBanner] = useState(null);
    const router = useRouter();

    // Select a random banner on mount
    useEffect(() => {
        if (banners && banners.length > 0) {
            const randomIndex = Math.floor(Math.random() * banners.length);
            setCurrentBanner(banners[randomIndex]);
        }
    }, [banners]);


    // Check if game is NSFW or if it's a non-mobile game on mobile device when component mounts
    useEffect(() => {
        if (game && game.nsfw === true) {
            setShowNsfwModal(true);
        }
        
        // Check if user is on mobile and game is not mobile-friendly
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isMobileGame = game.category && game.category.includes("Play On Mobile");
        
        if (isMobileDevice && !isMobileGame) {
            setShowMobileWarning(true);
        }
    }, [game]);

    // Handle user choosing to continue despite NSFW warning
    const handleContinue = () => {
        setShowNsfwModal(false);
    };

    // Handle user choosing to go back to home page
    const handleGoBack = () => {
        router.push('/');
    };

    // Handle mobile warning - proceed anyway
    const handleProceedAnyway = () => {
        setShowMobileWarning(false);
    };

    // Handle mobile warning - view mobile games
    const handleViewMobileGames = () => {
        router.push('/#mobile-games');
    };

    function fullScreen() {
        const elem = document.querySelector('#game');
        if (!elem) return;

        setIsFullScreen(true);

        // First enter fullscreen
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }

        // Then try to lock orientation to landscape on mobile devices
        try {
            // Check if orientation API is available (mobile devices)
            if (screen.orientation) {
                screen.orientation.lock('landscape').catch(error => {
                    // Silently handle errors - not all browsers support this
                    console.log("Orientation lock failed:", error);
                });
            }
        } catch (e) {
            console.log("Orientation API not supported");
        }

        document.addEventListener('fullscreenchange', handleFullscreenExit);
        document.addEventListener('webkitfullscreenchange', handleFullscreenExit);
        document.addEventListener('mozfullscreenchange', handleFullscreenExit);
        document.addEventListener('MSFullscreenChange', handleFullscreenExit);
    }

    function handleFullscreenExit() {
        if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
            setIsFullScreen(false);

            // Reset orientation when exiting fullscreen
            try {
                if (screen.orientation && screen.orientation.unlock) {
                    screen.orientation.unlock();
                }
            } catch (e) {
                console.log("Orientation unlock failed or not supported");
            }

            document.removeEventListener('fullscreenchange', handleFullscreenExit);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenExit);
            document.removeEventListener('mozfullscreenchange', handleFullscreenExit);
            document.removeEventListener('MSFullscreenChange', handleFullscreenExit);
        }
    }

    // NSFW Warning Modal Component
    const NsfwWarningModal = () => {
        if (!showNsfwModal) return null;

        return (
            <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                    <h2>Adult Content Warning</h2>
                    <p>This game contains content that is not suitable for users under 18 years old.</p>
                    <p>Please confirm that you are over 18 years of age to continue.</p>
                    <div className={styles.modalButtons}>
                        <button 
                            className={`${styles.modalButton} ${styles.continueButton}`} 
                            onClick={handleContinue}
                        >
                            I am 18+ Continue
                        </button>
                        <button 
                            className={`${styles.modalButton} ${styles.backButton}`} 
                            onClick={handleGoBack}
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Mobile Warning Modal Component
    const MobileWarningModal = () => {
        if (!showMobileWarning) return null;

        return (
            <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                    <h2>⚠️ Desktop Game Warning</h2>
                    <p>This game is meant to be played on desktop.</p>
                    <p>It may not work properly on your device.</p>
                    <div className={styles.modalButtons}>
                        <button 
                            className={`${styles.modalButton} ${styles.continueButton}`} 
                            onClick={handleProceedAnyway}
                        >
                            Proceed Anyway
                        </button>
                        <button 
                            className={`${styles.modalButton} ${styles.backButton}`} 
                            onClick={handleViewMobileGames}
                        >
                            View Mobile Games
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    function share() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            const notification = document.createElement('div');
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.backgroundColor = 'rgba(0, 118, 168, 0.9)';
            notification.style.color = 'white';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '4px';
            notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            notification.style.zIndex = '1000';
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            notification.textContent = 'Link copied to clipboard!';

            document.body.appendChild(notification);

            requestAnimationFrame(() => {
                notification.style.opacity = '1';
            });

            setTimeout(() => {
                notification.style.opacity = '0';
                notification.addEventListener('transitionend', () => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, { once: true });
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }

    function formatDate(dateString) {
        if (!dateString) return null;
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        try {
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString; // Return original string if formatting fails
        }
    }

    return (
        <div className={styles.layout}>
            {/* NSFW Warning Modal */}
            <NsfwWarningModal />
            
            {/* Mobile Warning Modal */}
            <MobileWarningModal />
            
            {/* Announcement Section - Desktop (left side) */}
            <div className={styles.announcement}>
                <h3 className={styles.text}>Announcement</h3>
                <div className={styles.bannerContainer}>
                    {currentBanner ? (
                        <a 
                            href={currentBanner.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.bannerLink}
                        >
                            <img 
                                src={currentBanner.image} 
                                alt={currentBanner.alt || 'Announcement'} 
                                className={styles.bannerImage}
                            />
                        </a>
                    ) : (
                        <div className={styles.bannerPlaceholder}>
                            <span>No announcements</span>
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.gameframe}>
                <div className={styles.box}>
                    <iframe
                        id="game"
                        className={styles.game}
                        srcDoc={`<form action='${game.url}' style="display: flex; justify-content: center; align-items: center; height: 90vh; margin: 0; background-color: #000;">
                            <input type="submit" value="" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: url('/icons/PlayButton.png') no-repeat center; background-size: contain; border: none; width: 100px; height: 100px; transition: transform 0.3s ease; filter: drop-shadow(0 0 10px rgba(0, 118, 168, 0.5));" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
                        </form>`}
                        frameBorder="0"
                        allowFullScreen
                    ></iframe>
                </div>
                <div className={styles.bar}>
                    <div className={styles.title}>
                        <h3 style={{ color: "#000000" }}>{game.name}</h3>
                        <h6 style={{ color: "#555555" }}>By Arvie K</h6>
                    </div>
                    <div className={styles.actions}>
                        <img className={styles.barIcon} src="/icons/share.png" alt="Share" onClick={share} title="Copy Link" />
                        <img className={styles.barIcon} src="/icons/full.png" alt="Fullscreen" onClick={fullScreen} title="Fullscreen" />
                    </div>
                </div>
                <div className={styles.bottomSection}>
                    {game.devlog && (
                        <div className={styles.devlog}>
                            <iframe
                                src={`https://www.youtube.com/embed/${game.devlog}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                    <div className={styles.description}>
                        {game.description && (
                            <div className={styles.descriptionSection}>
                                <h4 className={styles.descriptionTitle}>Description</h4>
                                <p className={styles.descriptionContent}>{game.description}</p>
                            </div>
                        )}
                        {game.controls && (
                            <div className={styles.descriptionSection}>
                                <h4 className={styles.descriptionTitle}>Controls</h4>
                                <p className={styles.descriptionContent}>{game.controls}</p>
                            </div>
                        )}
                        {(game.release_date || game.last_updated) && (
                            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}> {/* Container for dates */}
                                {game.release_date && (
                                    <div className={styles.descriptionSection}>
                                        <h4 className={styles.descriptionTitle} style={{ fontSize: '0.8em' }}>Released</h4>
                                        <p className={styles.descriptionContent} style={{ fontSize: '0.7em' }}>{formatDate(game.release_date)}</p>
                                    </div>
                                )}
                                {game.last_updated && (
                                    <div className={styles.descriptionSection}>
                                        <h4 className={styles.descriptionTitle} style={{ fontSize: '0.8em' }}>Last Updated</h4>
                                        <p className={styles.descriptionContent} style={{ fontSize: '0.7em' }}>{formatDate(game.last_updated)}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Credits Section */}
                {game.credits && game.credits.length > 0 && (
                    <div className={styles.creditsSection}>
                        <h4 className={styles.creditsTitle}>Credits</h4>
                        <ul className={styles.creditsList}>
                            {game.credits.map((credit, index) => {
                                // Check if the URL is valid using regex
                                const isValidUrl = credit.url && /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(credit.url);
                                
                                return (
                                    <li key={index} className={styles.creditItem}>
                                        {isValidUrl ? (
                                            <a 
                                                href={credit.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className={styles.creditLink}
                                            >
                                                {credit.title}
                                            </a>
                                        ) : (
                                            <span className={styles.creditText}>{credit.title}</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
            <div className={styles.games}>
                <h3 className={styles.text}>More Games</h3>
                <div className={styles.gamesGrid}> {/* Use a simplified grid class */}
                    {allGames && Object.keys(allGames)
                        .filter(key => key !== slug)
                        .sort(() => 0.5 - Math.random()) // Shuffle the games randomly
                        .slice(0, 4) // Limit to 4 games
                        .map((key) => (
                            <Game key={key} slug={key} meta={allGames[key]} />
                        ))
                    }
                </div>
            </div>
            
            {/* Announcement Section - Mobile (below More Games) */}
            <div className={styles.announcementMobile}>
                <h3 className={styles.text}>Announcement</h3>
                <div className={styles.bannerContainer}>
                    {currentBanner ? (
                        <a 
                            href={currentBanner.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.bannerLink}
                        >
                            <img 
                                src={currentBanner.image} 
                                alt={currentBanner.alt || 'Announcement'} 
                                className={styles.bannerImage}
                            />
                        </a>
                    ) : (
                        <div className={styles.bannerPlaceholder}>
                            <span>No announcements</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
