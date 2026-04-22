# 🕹️ PlushyPocket-Game

<p align="center">
  <img width="500" src="https://github.com/user-attachments/assets/17812111-b914-47e4-abb4-626a834a4536" />
</p>

> **An interactive phygital experience for MINISO** — where the physical store meets an immersive digital world through collaborative minigames, real-time sensors, and instant rewards.

---
 
## 📖 Overview
 
**PlushyPocket Game** is a phygital interactive videogame built for MINISO stores. It bridges the physical shopping experience with a digital world by letting customers use their smartphones as game controllers — no downloads, no setup, just scan and play.
 
The game addresses a real retail challenge: **low visibility of new collections in-store**. By turning product discovery into a fun, social, and memorable experience, PlushyPocket transforms browsing into play.
 
---
 
## 🎮 How It Works
 
```
Customer scans QR code  →  Phone becomes a controller  →  Game appears on store display
        ↓                            ↓                                ↓
  No app needed           Sensors + camera + mic           Two players compete live
                                                                      ↓
                                                         Rewards & digital bonuses unlocked
```
 
1. A QR code is displayed on the main screen (PC or in-store display)
2. The customer scans it — their phone instantly becomes a controller
3. A map of islands appears on the main screen
4. Each island contains a unique interactive minigame
5. Two players compete in real time
6. Winners receive digital rewards and brand benefits
---
 
## 👥 Target Users
 
| **User Profile** | **Description** |
|---|---|
| 🛍️ **MINISO Shoppers** | In-store customers looking for something fun to do while visiting |
| 🎯 **Casual Gamers** | Young audiences who enjoy quick, dynamic, low-commitment experiences |
| 👫 **Social Players** | People who prefer shared, multiplayer moments over solo interactions |
| ✨ **Brand Enthusiasts** | Fans interested in discovering MINISO characters and new collections |
 
---
 
## 🚀 Tech Stack
 
### Core Technologies
 
| **Component** | **Technology** |
|---|---|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js (Express) |
| Database | PostgreSQL (Supabase) |
| Real-time | Socket.io |
 
### Sensor & Interaction Technologies
 
#### 🤖 MediaPipe
Enables **facial detection** on the main screen's camera feed. Used for visual interactions like detecting when a player's face is hit (e.g., pie-in-the-face mechanics). Runs entirely in the browser via the `getUserMedia` API.
 
#### 📱 Mobile Sensors (Accelerometer & Gyroscope)
The phone acts as a physical controller. Using the **DeviceMotion** and **DeviceOrientation** Web APIs, the game reads tilt, shake, and rotation data to control in-game actions — no app installation needed.
 
#### 🎤 Web Audio API
Detects **sound input from the microphone** on the player's phone. Used for actions triggered by shouting, clapping, or other audio cues during specific minigames.
 
#### 📷 getUserMedia API
Accesses the **camera on the main display** (PC or store screen) to feed video into MediaPipe for real-time facial recognition and augmented reality-style interactions.
 
#### 🔌 Socket.io
Handles all **real-time synchronization** between the mobile controller and the main display. Sensor data from the phone is streamed to the server and broadcast to the main canvas with minimal latency.
 
---
 
## 📁 Project Structure
 
```
📁 Plushy-Pocket-Game
├── 📂 frontend       # React + TypeScript + Vite — UI, canvas, sensors, routing
└── 📂 server         # Node.js + Express — game logic, sockets, auth, Supabase
```
 
---
 
## ⚙️ Getting Started
 
### Prerequisites
 
- Node.js `v18+`
- npm or pnpm
- A Supabase project (for database and auth)
### Installation
 
```bash
# Clone the repository
git clone https://github.com/your-org/plushy-pocket-game.git
cd plushy-pocket-game
 
# Install frontend dependencies
cd frontend
npm install
 
# Install server dependencies
cd ../server
npm install
```
 
### Environment Variables
 
Create `.env` files in both `frontend/` and `server/` based on their respective `.env.example` files.
 
```env
# server/.env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
 
# frontend/.env
VITE_SERVER_URL=http://localhost:3000
```
 
### Running the App
 
```bash
# Start the backend
cd server
npm run dev
 
# Start the frontend (in a new terminal)
cd frontend
npm run dev
```
 
Then open the frontend URL on a display device, and scan the QR code with a mobile device to start playing.
 
---
 
## 🎯 Goals
 
- 🔍 Help customers **discover new MINISO collections** in an engaging way
- 🧸 Bring **brand characters to life** through interactive play
- 🤝 Create **shared social moments** inside the store
- 🎁 Reward players with **digital bonuses and real-world benefits**
---
 
## 🏗️ Architecture Overview
 
```
[Mobile Phone]                    [Main Display / PC]
     |                                    |
  QR Scan                          React Canvas
  Sensors ──────► Socket.io ◄────── Game State
  Mic / Camera        │
                  Node.js + Express
                      │
                   Supabase
```
 
---
 
## 📄 License
 
This project was developed for **MINISO** as part of an interactive retail experience initiative. All brand assets, characters, and related intellectual property belong to their respective owners.
 
---
 
<img width="3957" height="1444" alt="Characters" src="https://github.com/user-attachments/assets/bfe43709-1267-40fe-82e3-d82fb3f806f8" />
