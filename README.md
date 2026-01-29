# 🧺 Laundry App - AI-Powered Management System

A comprehensive web-based laundry management system designed to streamline business operations. This application features dedicated dashboards for Administrators, Cashiers, and Owners, integrated with **WhatsApp Session Management** and an **AI-powered Chatbot** for automated customer interaction.

<!-- 🔗 **[Live Demo](https://laundry-app-gold.vercel.app)**

---

### 🔑 Credentials (Demo)

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` |
| **Cashier** | `kasir` | `kasir123` |
| **Owner** | `owner` | `owner123` | -->

---

## 🚀 Modern Tech Stack

Built with cutting-edge technologies for reliability and speed:

-   **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
-   **Database:** PostgreSQL/MySQL via [Neon](https://neon.tech/)
-   **ORM:** [Prisma](https://www.prisma.io/) & [Drizzle](https://orm.drizzle.team/)
-   **WhatsApp Engine:** [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)
-   **AI Integration:** [OpenAI](https://openai.com/) / [Groq (Llama 3.3)](https://groq.com/)
-   **Authentication:** [NextAuth.js](https://next-auth.js.org/)

---

## ✨ Key Features

### 1. 🤖 AI & WhatsApp Integration
The stand-out feature of this app is its automated communication layer.
-   **WhatsApp Session Manager**: Linked via QR Code directly from the admin dashboard.
-   **AI Chatbot**: Automatically responds to customer inquiries about order status, balance/saldo, and loyalty points using real-time database context.
-   **Smart Notifications**: Generates friendly, human-like WhatsApp messages when order statuses change (New → Process → Ready → Collected).

### 2. 🛡️ Multi-Role Dashboards
-   **Administrator**: Full control over users (Admins, Cashiers, Owners), outlet management, package configurations, and system-wide settings.
-   **Kasir (Cashier)**: Efficient transaction workflow, customer registration, invoice generation, and status updates.
-   **Owner**: high-level business intelligence, financial summaries, and performance growth metrics.

### 3. 💳 Customer Loyalty & Membership
-   **Loyalty Points**: Customers earn points from transactions.
-   **Balance System (Saldo)**: Manage customer deposits for easier future payments.
-   **Transaction History**: Complete logs of all laundry activities.

<!-- ---

## 📸 Screenshots

| Feature | Preview |
| :--- | :--- |
| **Admin Dashboard** | ![Admin](public/img/dashboard-admin1.png) |
| **WhatsApp QR API** | ![WA QR](public/img/dashboard-admin7.png) |
| **Cashier Flow** | ![Cashier](public/img/dashboard-kasir.png) |
| **Owner Reports** | ![Owner](public/img/dashboard-owner.png) | -->

---

## 🛠️ Local Development

### Prerequisites
-   Node.js 20+
-   PostgreSQL or MySQL Database

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/rifai27077/laundry-app.git
    cd laundry-app
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file based on the project requirements:
    ```env
    DATABASE_URL="your_database_url"
    NEXTAUTH_SECRET="your_secret"
    AI_API_KEY="your_openai_or_groq_key"
    ```

4.  **Database Sync**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```

Visit `http://localhost:3000` to access the application.

---

## 📄 License
This project is licensed under the MIT License.
