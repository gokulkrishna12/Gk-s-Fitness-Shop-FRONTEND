# 🏋️‍♂️ GK's Fitness Shop — Frontend Client

A high-performance, responsive e-commerce web application engineered for fitness enthusiasts and athletes. Built with React and SCSS, and containerized for production deployment on AWS CloudFront.

🔗 **Live Demo:** [Insert Your CloudFront Link Here]

## 🚀 Key Features
- **Responsive Athlete UI:** Mobile-first architecture with a custom SCSS design system.
- **Enhanced Auth Experience:** Email OTP validation, real-time regex security checklists, and password visibility toggles across Login, Register, Forgot Password, and Profile pages.
- **Seamless Payments:** Integrated Razorpay checkout with client-side cryptographic handling.
- **Dynamic Catalog & Reviews:** Multimedia community review upload, live star rating math, and instant stock badge synchronization.
- **Automated CI/CD:** Continuous delivery pipeline configured via GitHub Actions, deploying to AWS S3 and invalidating the AWS CloudFront cache on push.

## 🛠️ Tech Stack
- **Library/Framework:** React.js, React Router
- **Styling:** Modular SCSS (CSS Grid & Flexbox)
- **Icons & UI:** Lucide React, Sonner (Toasts), Recharts
- **Build Tool:** Vite
- **Deployment:** AWS S3, AWS CloudFront, GitHub Actions

## 📋 Prerequisites
Make sure you have the following installed on your local machine:
- Node.js (v18 or higher)
- npm or yarn

## ⚙️ Environment Variables
Create a `.env` file in the root directory and add the following variables:

```env

💻 Local Development Setup
Clone the repository:

Bash
git clone [https://github.com/gokulkrishna12/Gk-s-Fitness-Shop-FRONTEND.git](https://github.com/gokulkrishna12/Gk-s-Fitness-Shop-FRONTEND.git)
cd Gk-s-Fitness-Shop-FRONTEND
Install dependencies:

Bash
npm install
Start the development server:

Bash
npm run dev
The application will be running at http://localhost:5173.

Build for production:

Bash
npm run build
# .env
VITE_API_URL=http://localhost:5000/api  # Change to your EC2 backend URL for production
VITE_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_here
