

---

```markdown
# 🎥 StreamMall — Live Shopping & Streaming Platform

StreamMall is a **next-generation live commerce platform** that combines **real-time streaming, social interaction, and e-commerce** into one powerful ecosystem.  
Creators can go live, showcase their products, and allow users to purchase directly — all while chatting and engaging with their audience.

---

## 🚀 Features

### 🧑‍💻 For Admin
- Secure **admin dashboard** with authentication
- Manage users, live streams, and transactions
- Real-time analytics and performance stats
- Withdraw and payout management

### 👥 For Users
- Seamless **login/signup** (email & Google)
- Join or host **live shopping streams**
- Interactive **chat and messaging**
- Add friends, follow creators, and get notifications
- Purchase products directly during the stream

### 💬 Communication
- Real-time chat powered by **WebSockets / Firebase**
- Notifications for new streams, messages, and events

### 💾 Tech Stack
- **Frontend:** React (Vite) + Tailwind CSS  
- **Mobile:** React Native (Expo)  
- **Backend:** Node.js + Express.js  
- **Database:** MongoDB (Mongoose)  
- **Authentication:** JWT + Google OAuth  
- **Hosting:** Render / SiteGround / Firebase  
- **Media Handling:** LiveKit / HLS Streaming  

---

## 📁 Folder Structure

```

StreamMall/
│
├── client/              # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/             # Express backend API
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
│
└── README.md

````

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/yourusername/streammall.git
cd streammall
````

### 2️⃣ Setup Backend

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongo_connection
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
```

### 3️⃣ Setup Frontend

```bash
cd ../client
npm install
npm run dev
```

### 4️⃣ Visit the app

```
http://localhost:5173
```

---

## 🔒 Environment Variables

| Variable           | Description                          |
| ------------------ | ------------------------------------ |
| `MONGO_URI`        | MongoDB connection string            |
| `JWT_SECRET`       | Secret key for JWT authentication    |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID               |
| `PORT`             | Backend server port                  |
| `NODE_ENV`         | Environment (development/production) |

---

## 📦 API Endpoints (Sample)

| Method | Endpoint              | Description          |
| ------ | --------------------- | -------------------- |
| `POST` | `/api/auth/login`     | Login user           |
| `POST` | `/api/auth/signup`    | Register user        |
| `POST` | `/api/auth/google`    | Login with Google    |
| `GET`  | `/api/streams`        | Get all live streams |
| `POST` | `/api/streams/create` | Create a live stream |

---

## 🎨 UI Highlights

* **Dark + Futuristic theme**
* Neon gradient buttons & hover effects
* Responsive for all devices
* Clean, modern typography (Poppins font)

---

## 🧠 Future Roadmap

* [ ] AI-based product recommendations
* [ ] Multi-host live streams
* [ ] Virtual gift system for creators
* [ ] Wallet system & payment gateway integration
* [ ] Mobile app release on Play Store

---

## 🤝 Contributing

Contributions are welcome!
Please open an issue or submit a pull request if you’d like to collaborate.

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Developed by

**Saqib Waheed**
React Native & Full Stack Developer
📍 Rawalpindi, Pakistan
📧 [xaqibwaheed333@gmail.com](mailto:xaqibwaheed333@gmail.com)
🌐 [Portfolio](https://saqibwaheedportfolio.netlify.app/)

---

⭐ *If you like this project, consider giving it a star on GitHub!*

```

---

```
