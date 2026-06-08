# 🚀 EvalTrust - Premium Hackathon Evaluation Platform

**EvalTrust** is a state-of-the-art, premium hackathon evaluation and management platform built using **React**, **Vite**, and **Supabase**. The platform focuses on maintaining absolute transparency, trust, and smooth UI/UX during the entire evaluation process of a hackathon.

🔗 **Live Demo**: [https://hacktrust.netlify.app/](https://hacktrust.netlify.app/)

With beautiful 3D backgrounds (Spline/Three.js), dynamic micro-animations, and responsive dashboard views, EvalTrust provides a seamless experience for **Organizers**, **Judges**, and **Participants**.

---

## ✨ Key Features

- **🛡️ Transparency & Trust**: A public gallery and real-time results reveal section to keep the evaluation transparent and trustable.
- **👥 Multi-Role Dashboards**:
  - **Organizers**: Create and manage hackathons, assign judges, control phases, and manage teams.
  - **Judges**: Simple interface to evaluate teams, score projects based on parameters, and review submissions.
  - **Participants**: Register, submit projects (PPTs, Github links), generate team QR codes, and view results.
- **📊 PPT Presentation Phase**: An interactive deck upload and viewer phase where judges can view, score, and shortlist ideas.
- **📲 QR Code Scanning & Verification**: Unique team QR codes for onsite verification and easy evaluation by scanning the team's QR.
- **🎨 Premium UI/UX**: Dynamic theme toggling (Dark/Light mode), high-fidelity animations powered by Framer Motion, and immersive 3D graphics.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React (Vite)](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations & 3D**: [Framer Motion](https://www.framer.com/motion/), [Three.js](https://threejs.org/) & [Spline](https://spline.design/)
- **Backend & Database**: [Supabase](https://supabase.com/) (Database, Authentication, Storage)
- **Utilities**: Lucide React (Icons), Canvas Confetti (Celebrations), Swiper (Sliders)

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to see the app.

---

## 📦 Production Build

To build the project for production deployment:
```bash
npm run build
```
The optimized build output will be generated in the `dist/` folder.

---

## 🌐 Deployment on Netlify

This project is fully ready for deployment on **Netlify**:

1. Link your GitHub repository to Netlify.
2. Configure the build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. Add your environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in the Netlify site settings dashboard under **Environment Variables**.
4. Deploy!
