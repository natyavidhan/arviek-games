import Navbar from "../components/navbar";
import Link from 'next/link'; // Import Link
import GameClient from './GameClient'; // Import the new client component
import { Metadata } from 'next'; // Import Metadata type

import styles from '../styles/GamePage.module.css';

// Function to generate metadata dynamically
export async function generateMetadata({ params }) {
    const { slug } = await params;
    let gameName = "Game"; // Default title
    let gameDescription = "Play exciting games on Arvie K Games."; // Default description
    let gameImage = "/default-game-image.png"; // Default image (replace with your actual default image path)
    let gameCategories = []; // Default categories

    try {
        // Fetch only the specific game needed for metadata
        const res = await fetch(`https://arviek-games-editor.vercel.app/games/${slug}`, { cache: 'no-store' });
        if (res.ok) {
            const gameData = await res.json();
            if (gameData && (gameData.show === undefined || gameData.show === true)) {
                gameName = gameData.name || "Game Not Found";
                // Use game description if available, otherwise create a default one
                gameDescription = gameData.description || `Play ${gameName} online for free on Arvie K Games. Enjoy this fun game in the ${gameData.category?.join(', ') || 'various'} categories.`;
                gameImage = gameData.image || gameImage; // Use game image if available
                gameCategories = gameData.category || [];
            } else {
                 // Attempt to fetch all games if specific fetch fails or returns no data (optional fallback)
                 const allRes = await fetch('https://arviek-games-editor.vercel.app/games', { cache: 'no-store' });
                 if (allRes.ok) {
                     const gamesArray = await allRes.json();
                     const foundGame = gamesArray.find(game => game._id === slug && (game.show === undefined || game.show === true));
                     if (foundGame) {
                         gameName = foundGame.name || "Game Not Found";
                         gameDescription = foundGame.description || `Play ${gameName} online for free on Arvie K Games. Enjoy this fun game in the ${foundGame.category?.join(', ') || 'various'} categories.`;
                         gameImage = foundGame.image || gameImage;
                         gameCategories = foundGame.category || [];
                     } else {
                         gameName = "Game Not Found";
                         gameDescription = `Could not find the requested game (${slug}) on Arvie K Games.`;
                     }
                 } else {
                    gameName = "Game Not Found";
                    gameDescription = `Error loading game data for ${slug} on Arvie K Games.`;
                 }
            }
        } else {
             // Attempt to fetch all games if specific fetch fails (optional fallback)
             const allRes = await fetch('https://arviek-games-editor.vercel.app/games', { cache: 'no-store' });
             if (allRes.ok) {
                 const gamesArray = await allRes.json();
                 const foundGame = gamesArray.find(game => game._id === slug && (game.show === undefined || game.show === true));
                 if (foundGame) {
                     gameName = foundGame.name || "Game Not Found";
                     gameDescription = foundGame.description || `Play ${gameName} online for free on Arvie K Games. Enjoy this fun game in the ${foundGame.category?.join(', ') || 'various'} categories.`;
                     gameImage = foundGame.image || gameImage;
                     gameCategories = foundGame.category || [];
                 } else {
                     gameName = "Game Not Found";
                     gameDescription = `Could not find the requested game (${slug}) on Arvie K Games.`;
                 }
             } else {
                 console.error("Failed to fetch game for metadata:", res.status);
                 gameName = "Error Loading Game";
                 gameDescription = "There was an error loading game details. Please try again later.";
             }
        }
    } catch (error) {
        console.error("Error fetching game for metadata:", error);
        gameName = "Error Loading Game";
        gameDescription = "There was an error loading game details. Please try again later.";
    }

    const keywords = ['game', 'online game', 'free game', gameName, ...gameCategories, 'Arvie K Games'];

    return {
        title: `${gameName} - Play Free Online Games on Arvie K Games`,
        description: gameDescription,
        keywords: keywords.join(', '),
        openGraph: {
            title: `${gameName} - Arvie K Games`,
            description: gameDescription,
            url: `https://www.arviek.games/${slug}`, // Replace with your actual domain
            siteName: 'Arvie K Games',
            images: [
                {
                    url: gameImage, // Must be an absolute URL
                    width: 800, // Optional
                    height: 600, // Optional
                    alt: `${gameName} Game Image`, // Optional
                },
            ],
            locale: 'en_US',
            type: 'website', // or 'article' if it fits better
        },
        twitter: {
            card: 'summary_large_image',
            title: `${gameName} - Arvie K Games`,
            description: gameDescription,
            // siteId: 'YourTwitterSiteID', // Optional Twitter Site ID
            // creator: '@YourTwitterHandle', // Optional Twitter Creator Handle
            // creatorId: 'YourTwitterCreatorID', // Optional Twitter Creator ID
            images: [gameImage], // Must be an absolute URL
        },
        // You can add more metadata tags here as needed
        // robots: { // Example for robots meta tag
        //   index: true,
        //   follow: true,
        //   nocache: true,
        //   googleBot: {
        //     index: true,
        //     follow: false,
        //     noimageindex: true,
        //     'max-video-preview': -1,
        //     'max-image-preview': 'large',
        //     'max-snippet': -1,
        //   },
        // },
        // icons: { // Example for icons
        //   icon: '/icon.png',
        //   shortcut: '/shortcut-icon.png',
        //   apple: '/apple-icon.png',
        //   other: {
        //     rel: 'apple-touch-icon-precomposed',
        //     url: '/apple-touch-icon-precomposed.png',
        //   },
        // },
    };
}

export default async function Page({ params }) {
    const { slug } = await params;

    // Fetch all games data
    let gameData = null; // Store the raw game object found
    let allGames = null; // Store the transformed object for "More Games"
    let banners = []; // Store announcement banners

    // Fetch banners
    try {
        const bannersRes = await fetch('https://arviek-games-editor.vercel.app/banners', { cache: 'no-store' });
        if (bannersRes.ok) {
            banners = await bannersRes.json();
        }
    } catch (error) {
        console.error("Error fetching banners:", error);
    }

    try {
        const res = await fetch('https://arviek-games-editor.vercel.app/games', { cache: 'no-store' });
        if (res.ok) {
            const gamesArray = await res.json();

            // Find the specific game object from the array
            gameData = gamesArray.find(game => game._id === slug && (game.show === undefined || game.show === true));

            // Transform the array into an object keyed by _id for the "More Games" section
            allGames = gamesArray.reduce((acc, game) => {
                const isVisible = game.show === undefined || game.show === true;
                if (game._id && isVisible) {
                     acc[game._id] = { // Key is slug (_id)
                        // Value is the meta object expected by Game component
                        title: game.name,
                        image: game.image,
                        // Include other fields if needed by the Game component in "More Games"
                        categories: game.category
                    };
                }
                return acc;
            }, {});

        } else {
            console.error("Failed to fetch games:", res.status);
        }
    } catch (error) {
        console.error("Error fetching games:", error);
    }

    // Handle game not found
    if (!gameData) { // Check if gameData was found
        return (
            <div>
                <Navbar />
                <div className={styles.layout}>
                    <div className={styles.gameframe} style={{ textAlign: 'center', padding: '50px' }}>
                        <h1>Game not found</h1>
                        <p>Sorry, we couldn't find the game "{slug}".</p>
                        <Link href="/">Return to home</Link>
                    </div>
                </div>
            </div>
        );
    }

    // Render the client component with fetched data
    return (
        <div>
            <Navbar />
            {/* Pass the raw gameData object, transformed allGames object, and banners */}
            <GameClient game={gameData} slug={slug} allGames={allGames} banners={banners} />
        </div>
    );
}