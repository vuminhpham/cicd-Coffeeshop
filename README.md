# ☕ Coffeeshop

Coffeeshop is a full-stack web application for coffee shop management, including an online ordering system, table reservations, and an admin dashboard.  
The project consists of **Frontend (React)** and **Backend (Spring Boot + MySQL)**.

---

## 🌐 Demo

- 👉 [Frontend Website](https://coffeeshop-eight-beige.vercel.app)  
- ⚙️ [Backend API](http://98.90.47.124:8099)

---

## ✨ Features

- 👤 User registration & authentication (JWT based)  
- 🛒 Shopping cart and online ordering  
- 📅 Table reservation management  
- 🛠️ Admin dashboard for managing products, menus, orders, and users  
- 💳 Integrated PayPal payments (Sandbox mode)  
- ☁️ Cloudinary image storage  

---

## 🛠️ Tech Stack

### Frontend
- [React](https://react.dev/) + [Redux Toolkit](https://redux-toolkit.js.org/)  
- [React Router](https://reactrouter.com/)  
- [React Toastify](https://fkhadra.github.io/react-toastify/)  

### Backend
- [Spring Boot](https://spring.io/projects/spring-boot) + Spring Security + JWT  
- [MySQL 8](https://www.mysql.com/)  
- [Cloudinary](https://cloudinary.com/) (image storage)  
- [PayPal SDK](https://developer.paypal.com/) (sandbox payments)  

### Deployment
- Frontend: [Vercel](https://vercel.com/)  
- Backend: VPS (Docker + MySQL)  

---

## 🚀 Getting Started
# clone project
- git clone https://github.com/LongIT2007/coffeeshop.git
- cd coffeeshop/backend

# build & run
### 1. Backend
- ./mvnw spring-boot:run  
Backend will run at:
👉 http://localhost:8099

### 2. Frontend
- cd coffeeshop/frontend
- yarn install
- yarn dev   
Frontend will run at:
👉 http://localhost:3000

### 3. Environment Variables
Backend .env (or Docker Compose environment)

- MYSQL_ROOT_PASSWORD=your-root-password
- MYSQL_DATABASE=coffeeshop
- MYSQL_USER=your-user
- MYSQL_PASSWORD=your-password

- JWT_SECRET=your-secret
- JWT_EXPIRATION=86400000
- JWT_REFRESH_EXPIRATION=3600000

- CLOUDINARY_CLOUD_NAME=xxx
- CLOUDINARY_API_KEY=xxx
- CLOUDINARY_API_SECRET=xxx

- PAYPAL_CLIENT_ID=xxx
- PAYPAL_CLIENT_SECRET=xxx
- PAYPAL_MODE=sandbox

- ALLOWED_ORIGINS=https://coffeeshop-eight-beige.vercel.app

