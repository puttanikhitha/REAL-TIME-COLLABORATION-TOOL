
# REAL-TIME-COLLABORATION-TOOL

COMPANY  : CODTECH IT SOLUTIONS

NAME     : PUTTA NIKHITHA

INTERN ID: CT08DM1033

DOMAIN   : MERN STACK WEB DEVELOPMENT

DURATION : 8 WEEKS

MENTOR   : NEELA SANTHOSH

# Description

A real-time collaboration tool built using WebSockets, enabling multiple users to work together simultaneously on a shared document editor and whiteboard. This project demonstrates seamless, live synchronization of text content and drawing elements between connected users in a collaborative environment.
The core functionality is powered by WebSockets, providing full-duplex communication between the server and clients for fast and efficient data updates.

# 🛠️ Features
🔁 Real-time two-way synchronization of document content.

👥 Multi-user support with live collaboration tracking.

✏️ Shared whiteboard for visual brainstorming and diagrams.

🖥️ Clean and intuitive user interface with visual user indicators.

🔔 Automatic update of changes across all connected clients.

⚡ Lightweight and responsive front-end using vanilla JS, HTML, and CSS.

🌐 Node.js-based WebSocket server to handle all client communication.

# 📂 Project Structure

REALTIME_COLLAB/

├── node_modules/          # Dependencies

├── public/

│   ├── client.js          # Client-side JS logic for real-time communication

│   ├── index.html         # Main HTML structure for the editor and whiteboard

│   ├── styles.css         # UI and layout styling

├── server.js              # WebSocket server handling connections and messages

├── package.json           # Project metadata and dependencies

├── package-lock.json      # Dependency lock file


# 💡 How It Works

When a user types into the document editor or draws on the whiteboard, those changes are captured on the client side.

The changes are sent through a WebSocket connection to the Node.js server.

The server then broadcasts the updates to all other connected clients.

Each client receives updates and dynamically applies them, ensuring full synchronization across all users.

# 📌 Technologies Used

Node.js – Runtime for the server.

WebSocket (ws) – For real-time, bidirectional communication.

HTML/CSS/JavaScript – For client interface and interactivity.

# 📦 Getting Started

# 🔧 Prerequisites

Node.js (v14 or higher)

npm (Node Package Manager)

# 📥 Installation

**1.Clone the repository:**

cd realtime-collab

git clone https://github.com/puttanikhitha/REAL-TIME-COLLABORATION-TOOL.git

**2.Install dependencies:**
npm init

**3.Start the WebSocket server:**
node server.js

This runs your WebSocket server on http://localhost:3000.

# Local Testing

**Open the app in two browser windows or tabs:**

Go to http://localhost:3000/ in Window A

Open a second instance at http://localhost:3000/ in Window B

Start editing the document or interacting with the whiteboard in one window.


# ✨ Future Improvements

Add authentication and user sessions.

Introduce roles and permissions (e.g., read-only viewers).

Implement document versioning and undo history.

Extend whiteboard with advanced drawing tools.

Store documents persistently with database integration.



# output

**1️⃣ Starting the Document on the First Side**

The document is initially created and edited by User A in one editor interface:



**2️⃣ Synchronized Update on the Second Editor**

The same document appears in real-time on the second editor, where User B begins making changes:


