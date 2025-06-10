export const defaultHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <title>R3Code AI - Create Best UI/UX in Single HTML File</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="utf-8">
    <style>
        :root {
            --bg-color: #0A0A0A;
            --border-color: rgba(255, 255, 255, 0.1);
            --card-color: #141414;
            --text-color: #EAEAEA;
            --subtle-text-color: #888888;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            min-height: 100vh;
            overflow-x: hidden;
            position: relative;
        }

        /* The spotlight effect that follows the cursor */
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            z-index: 10;
            pointer-events: none;
            background: radial-gradient(
                circle 400px at var(--x, 50%) var(--y, 50%),
                rgba(255, 255, 255, 0.06),
                transparent 80%
            );
            transition: background 0.1s ease-out;
        }

        .container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 4rem 2rem;
            max-width: 900px;
            margin: 0 auto;
        }

        .main-content {
            text-align: center;
            width: 100%;
            animation: fadeIn 1.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .title {
            font-size: 3rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 1.5rem;
            letter-spacing: -1.5px;
        }

        .description {
            font-size: 1.1rem;
            color: var(--subtle-text-color);
            margin-bottom: 4rem;
            font-weight: 400;
            line-height: 1.7;
            max-width: 650px;
            margin-left: auto;
            margin-right: auto;
        }

        /* Adjusted Bento Grid for 5 items */
        .features {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-bottom: 4rem;
        }

        .feature {
            background: var(--card-color);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: left;
            transition: background 0.3s ease;
        }
        
        /* This large card now spans 2 columns on the first row */
        .feature.large {
            grid-column: span 2;
        }

        .feature:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.2);
        }

        .feature-title {
            font-size: 1.2rem;
            color: var(--text-color);
            margin-bottom: 0.75rem;
            font-weight: 700;
        }
        
        .large .feature-title {
            font-size: 1.5rem;
        }

        .feature-desc {
            font-size: 0.9rem;
            color: var(--subtle-text-color);
            font-weight: 400;
            line-height: 1.6;
        }
        
        .footer {
            margin-top: auto;
            padding-top: 2rem;
            border-top: 1px solid var(--border-color);
        }

        .footer-text {
            font-size: 0.9rem;
            color: #666666;
            font-weight: 400;
        }

        @media (max-width: 768px) {
            .container {
                padding: 2rem 1rem;
            }
            .title {
                font-size: 2.2rem;
                letter-spacing: -1px;
            }
            .description {
                font-size: 1rem;
                margin-bottom: 3rem;
            }
            /* Stack all grid items on mobile */
            .features {
                grid-template-columns: 1fr;
            }
            .feature.large {
                grid-column: span 1;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="main-content">
            <h2 class="title">Create. Design. Deploy.</h2>
            <p class="description">
                Create the best possible UI/UX in a single HTML file. Generate clean, elegant websites with AI assistance.
                Complete HTML, CSS, and JavaScript in one file ready for instant deployment.
            </p>

            <div class="features">
                <div class="feature large">
                    <div class="feature-content">
                        <div class="feature-title">Clean Code</div>
                        <div class="feature-desc">We prioritize semantic HTML and modern, efficient CSS. Your project will be readable, maintainable, and built on a solid foundation that's easy to extend.</div>
                    </div>
                </div>

                <div class="feature">
                    <div class="feature-content">
                        <div class="feature-title">Responsive</div>
                        <div class="feature-desc">Mobile-first design ensures perfect rendering on any device.</div>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-content">
                        <div class="feature-title">Fast</div>
                        <div class="feature-desc">Optimized for blazing-fast performance and stellar Lighthouse scores.</div>
                    </div>
                </div>

                <div class="feature">
                    <div class="feature-content">
                        <div class="feature-title">Deploy Ready</div>
                        <div class="feature-desc">Get a single, static file. Put it on any host and go live in seconds.</div>
                    </div>
                </div>

                <div class="feature">
                    <div class="feature-content">
                        <div class="feature-title">AI-Powered</div>
                        <div class="feature-desc">Leverage AI to generate layouts, write content, and optimize your design.</div>
                    </div>
                </div>
            </div>

            <div class="footer">
                <p class="footer-text">Start typing your idea in the AI prompt box to begin</p>
            </div>
        </div>
    </div>

    <script>
        // This script updates the CSS custom properties (--x and --y)
        // based on the mouse position, which moves the spotlight.
        document.addEventListener('mousemove', e => {
            document.body.style.setProperty('--x', e.clientX + 'px');
            document.body.style.setProperty('--y', e.clientY + 'px');
        });
    </script>
</body>
</html>
`;
