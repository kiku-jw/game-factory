import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Trophy, RefreshCw } from 'lucide-react';

interface ArcadeCardProps {
    onChoice: (choiceId: string) => void;
    genre: string;
    difficulty: string;
    hp: number;
}

export function ArcadeCard({ onChoice, genre, difficulty, hp }: ArcadeCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
    const [score, setScore] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || gameState !== 'playing') return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Game Constants
        const gravity = 0.5;
        const playerSize = 20;
        const jumpForce = -10;
        const speed = 3;

        // Colors based on genre
        const themeColors = {
            fantasy: '#8b5cf6',
            'sci-fi': '#06b6d4',
            mystery: '#64748b',
            'horror-lite': '#b91c1c',
            cyberpunk: '#f43f5e',
            surreal: '#d946ef',
        }[genre] || '#3b82f6';

        // State
        const player = {
            x: 50,
            y: 200,
            vy: 0,
            onGround: false
        };

        const obstacles = [
            { x: 400, y: 300, w: 100, h: 20 },
            { x: 600, y: 250, w: 100, h: 20 },
            { x: 800, y: 350, w: 100, h: 20 },
            { x: 200, y: 350, w: 100, h: 20 },
        ];

        const coins = [
            { x: 450, y: 270, collected: false },
            { x: 650, y: 220, collected: false },
            { x: 850, y: 320, collected: false },
        ];

        let animationFrameId: number;
        const keys: Record<string, boolean> = {};

        const handleKeyDown = (e: KeyboardEvent) => keys[e.code] = true;
        const handleKeyUp = (e: KeyboardEvent) => keys[e.code] = false;
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const update = () => {
            // Movement
            if (keys['ArrowLeft']) player.x -= speed;
            if (keys['ArrowRight']) player.x += speed;
            if (keys['Space'] && player.onGround) {
                player.vy = jumpForce;
                player.onGround = false;
            }

            // Physics
            player.vy += gravity;
            player.y += player.vy;

            // Floor collision (simplified)
            if (player.y > canvas.height - playerSize) {
                player.y = canvas.height - playerSize;
                player.vy = 0;
                player.onGround = true;
            }

            // Obstacle collision
            player.onGround = false;
            obstacles.forEach(obs => {
                if (
                    player.x < obs.x + obs.w &&
                    player.x + playerSize > obs.x &&
                    player.y < obs.y + obs.h &&
                    player.y + playerSize > obs.y
                ) {
                    // Top collision
                    if (player.vy > 0 && player.y + playerSize - player.vy <= obs.y) {
                        player.y = obs.y - playerSize;
                        player.vy = 0;
                        player.onGround = true;
                    }
                }
            });

            // Coin collection
            coins.forEach(coin => {
                if (!coin.collected &&
                    Math.abs(player.x - coin.x) < 20 &&
                    Math.abs(player.y - coin.y) < 20) {
                    coin.collected = true;
                    setScore(s => {
                        const newScore = s + 1;
                        if (newScore === 3) {
                            setGameState('won');
                            setTimeout(() => onChoice('c1'), 1500); // Auto-advance to next scene
                        }
                        return newScore;
                    });
                }
            });

            // Fall off
            if (player.y > canvas.height) {
                setGameState('lost');
                setTimeout(() => onChoice('c1'), 1500);
            }

            // Draw
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw grid (factory feel)
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            for (let i = 0; i < canvas.width; i += 40) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
            }

            // Draw Player-bot
            ctx.fillStyle = themeColors;
            ctx.fillRect(player.x, player.y, playerSize, playerSize);
            ctx.strokeStyle = 'white';
            ctx.strokeRect(player.x, player.y, playerSize, playerSize);

            // Draw Platform
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            obstacles.forEach(obs => {
                ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
            });

            // Draw Coins (Data Bits)
            ctx.fillStyle = '#fbbf24';
            coins.forEach(coin => {
                if (!coin.collected) {
                    ctx.beginPath();
                    ctx.arc(coin.x, coin.y, 5, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            animationFrameId = requestAnimationFrame(update);
        };

        update();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(animationFrameId);
        };
    }, [gameState, genre]);

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-2">
                    <Gamepad2 className="text-primary w-5 h-5" />
                    <span className="font-mono text-sm uppercase tracking-wider">Arcade Mode: {genre}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-text-secondary">Difficulty: <span className="text-white">{difficulty}</span></div>
                    <div className="text-text-secondary">Data Bits: <span className="text-primary">{score}/3</span></div>
                </div>
            </div>

            <div className="relative aspect-video bg-black/60">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    className="w-full h-full cursor-none"
                />

                {gameState !== 'playing' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                        {gameState === 'won' ? (
                            <>
                                <Trophy className="w-16 h-16 text-yellow-500 mb-4 animate-bounce" />
                                <h3 className="text-2xl font-bold uppercase tracking-widest text-white">Challenge Complete</h3>
                                <p className="text-text-secondary mt-2">Uploading results to Factory...</p>
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-16 h-16 text-red-500 mb-4 animate-spin" />
                                <h3 className="text-2xl font-bold uppercase tracking-widest text-white">System Error</h3>
                                <p className="text-text-secondary mt-2">Recalibrating for next attempt...</p>
                            </>
                        )}
                    </div>
                )}

                <div className="absolute bottom-4 left-4 flex gap-4 opacity-50 text-[10px] uppercase font-bold tracking-tighter">
                    <span>[Space] Jump</span>
                    <span>[Arrows] Move</span>
                </div>
            </div>
        </div>
    );
}
