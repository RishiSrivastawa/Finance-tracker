# 💰 Finance Tracker (MERN Stack)
A full-stack **Finance Tracker** web application built using the **MERN stack** that helps users manage income and expenses, view dashboards, upload receipts, and securely authenticate.

🔗 **Live App:** https://finance-tracker-rishi.vercel.app  

---

## 🚀 Features

- 🔐 User Authentication (Register / Login / JWT + Cookies)
- 📊 Dashboard with income & expense summary
- ➕ Add / Delete Income & Expenses
- 📥 Download income & expense data as Excel files
- 🧾 Receipt scanning (OCR / AI powered)
- 📁 Image upload support
- 🌍 Fully deployed (Frontend + Backend)
- 🔒 Secure environment variable handling

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- React Router
- Axios
- CSS / UI components
- Deployed on **Vercel**

### Backend
- Node.js
- Express.js
- MongoDB (Atlas)
- JWT Authentication
- Multer (file uploads)
- Deployed on **Render**

---

## 📂 Project Structure

```

finance-tracker/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   └── expense-tracker/
│       ├── src/
│       ├── public/
│       ├── index.html
│       ├── vite.config.js
│       └── package.json
│
└── README.md

````

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
GEMINI_API_KEY=your_api_key
PORT=8000
````
---
## 🧪 Run Locally

### 1️⃣ Clone the repository

```bash
git clone https://github.com/RishiSrivastawa/Finance-tracker.git
cd finance-tracker
```

### 2️⃣ Start Backend

```bash
cd backend
npm install
npm start
```

Backend runs on:

```
http://localhost:8000
```

### 3️⃣ Start Frontend

```bash
cd frontend/expense-tracker
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repository and submit a pull request.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👤 Author

**Rishi Srivastawa**
---

⭐ If you like this project, don’t forget to give it a star!

```
