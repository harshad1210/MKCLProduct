# How to Start the MKCL Product Project

## 1. Prerequisites
- **Node.js**: Ensure Node.js is installed.
- **Code Editor**: VS Code is recommended, but you can use any editor (Notepad, Sublime Text, Cursor, etc.).
- **Database**: The project is connected to a remote PostgreSQL database (configured in `.env`).

## 2. Starting the Project
1.  **Open the Project**:
    - Open VS Code.
    - Go to `File > Open Folder...`.
    - Select `D:\Antigravity\MKCLProduct`.

2.  **Open Terminal**:
    - Press `` Ctrl + ` `` (backtick) to open the integrated terminal.

3.  **Install Dependencies** (Only if moving to a new machine):
    ```bash
    npm install
    ```

4.  **Start Development Server**:
    - To run in development mode (with hot-reload):
    ```bash
    npm run dev
    ```
    - Open `http://localhost:3000` in your browser.

5.  **Preview Production Build** (Recommended for verifying matching production):
    - First, build the project:
    ```bash
    npm run build
    ```
    - Then, start the preview server:
    ```bash
    npm run preview
    ```
    - Open `http://localhost:3000` in your browser.

## 3. Database Management
- **View Data**:
    ```bash
    npx prisma studio
    ```
- **Update Schema** (if `prisma/schema.prisma` is changed):
    ```bash
    npx prisma db push
    npx prisma generate
    ```
- **Reset/Seed Data**:
    ```bash
    npx tsx server/utils/seed.ts
    ```
