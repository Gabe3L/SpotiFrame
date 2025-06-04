# SpotiFrame

**SpotiFrame** is a cross-platform desktop application that visualizes Spotify playback in real time with a sleek, minimal UI. Built with **React + Vite + TypeScript** for the frontend, **Electron** for desktop deployment, and **FastAPI** as the backend server.

---

## Features

- Modular React component layout with a clean GUI
- Integrated FastAPI backend for authentication and Spotify data
- Spotify PKCE Workflow for real-time display

---

## Tech Stack

| Layer    | Tech                    |
| -------- | ----------------------- |
| Frontend | React, TypeScript, Vite |
| Backend  | Python, FastAPI         |
| Desktop  | Electron                |
| Auth     | Spotify PKCE Workflow   |

---

## Getting Started

### 1. **Clone the repository**

```bash
git clone https://github.com/Gabe3L/SpotiFrame.git
cd SpotiFrame
```

### 2. **Install frontend dependencies**

```bash
npm install
```

### 3. **Install backend dependencies**

```bash
pip install -r requirements.txt
```

### 4. **Build frontend**

```bash
npm run build
```

### 5. **Run the application**

```bash
npm start
```

---

## Development Mode

To run everything for development (with live reload):

- **Frontend** (React with Vite):

```bash
npm run dev
```

- **Backend** (FastAPI):

```bash
uvicorn backend.main:app --reload --port 5000
```

---

## Packaging the App

To package the Electron app (you'll need [`electron-builder`](https://www.electron.build/)):

```bash
npm run build
electron-builder
```

---

## License

The [MIT License](LICENSE) is located in the root of this project.
