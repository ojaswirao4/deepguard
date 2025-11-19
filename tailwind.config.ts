import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        cyber: {
          glow: "hsl(var(--cyber-glow))",
          shadow: "hsl(var(--cyber-shadow))",
        },
        neon: {
          purple: "hsl(var(--neon-purple))",
          cyan: "hsl(var(--neon-cyan))",
          pink: "hsl(var(--neon-pink))",
          green: "hsl(var(--neon-green))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 30px hsl(280 100% 65% / 0.6), 0 0 60px hsl(280 100% 65% / 0.4)",
          },
          "50%": {
            boxShadow: "0 0 50px hsl(280 100% 65% / 0.8), 0 0 80px hsl(280 100% 65% / 0.5)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "gradient-shift": {
          "0%, 100%": {
            backgroundPosition: "0% 50%"
          },
          "50%": {
            backgroundPosition: "100% 50%"
          }
        },
        "scan": {
          "0%": {
            transform: "translateY(-100%)",
          },
          "100%": {
            transform: "translateY(100%)",
          },
        },
        "glitch": {
          "0%, 100%": {
            transform: "translate(0)",
          },
          "20%": {
            transform: "translate(-2px, 2px)",
          },
          "40%": {
            transform: "translate(-2px, -2px)",
          },
          "60%": {
            transform: "translate(2px, 2px)",
          },
          "80%": {
            transform: "translate(2px, -2px)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "scan": "scan 2s linear infinite",
        "glitch": "glitch 0.5s ease-in-out infinite",
        "fade-in": "fade-in 0.6s ease-out",
        "gradient-shift": "gradient-shift 3s ease infinite",
      },
      backgroundSize: {
        "200": "200% 200%",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
