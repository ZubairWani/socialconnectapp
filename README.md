# SocialConnect – Next.js Social Networking App

## 🚀 live URL : https://socialconnectnew.netlify.app/

SocialConnect is a modern **social networking platform** built using **Next.js 13+ App Router**, **React**, and **TailwindCSS**.  
It allows users to connect, share posts, comment, and engage in real-time with their community.

---

## 🚀 Features

- 🌐 **Next.js 13+ App Router** for server components and layouts  
- 🎨 **TailwindCSS** for responsive UI design  
- 🔔 **Sonner** for toast notifications  
- 📝 **SEO-ready Metadata** with Open Graph & Twitter card support  
- 🌙 **Dark/Light Mode** with dynamic theme colors  
- 📱 **PWA Support** (manifest, Apple web app, icons)  
- 🔑 **Authentication Ready** (extendable via JWT, NextAuth, etc.)  
- ⚡ Optimized fonts via `next/font` (Nunito)  

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 13+](https://nextjs.org/)  
- **Language**: [TypeScript](https://www.typescriptlang.org/)  
- **Frontend**: [React 18+](https://react.dev/)  
- **Styling**: [TailwindCSS](https://tailwindcss.com/)  
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)  
- **Fonts**: [next/font](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) (Nunito)  

---

## 📂 Project Structure

```
src/
 ├── app/
 │   ├── layout.tsx      # Root layout with global styles & metadata
 │   ├── globals.css     # Global CSS (Tailwind included)
 │   └── page.tsx        # Example landing page
 ├── components/         # UI components (Feed, PostForm, etc.)
 ├── hooks/              # Custom React hooks
 ├── lib/                # Utilities & helpers
 └── types/              # TypeScript types
```

---

## ⚡ Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/your-username/socialconnect.git
cd socialconnect
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
App will be available at [http://localhost:3000](http://localhost:3000).

---

## 🔧 Available Scripts

- `npm run dev` → Start dev server with Turbopack  
- `npm run build` → Generate production build  
- `npm start` → Run production server  
- `npm run lint` → Lint project files  

---

## 🌐 Deployment

You can deploy SocialConnect on:  
- [Vercel](https://vercel.com/) (recommended)  
- [Netlify](https://www.netlify.com/)  
- Any Node.js hosting provider  

---

## 📜 License

This project is licensed under the **MIT License**.  
Maintained by **Zubair**.  

---
