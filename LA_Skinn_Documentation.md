# LA Skinn - Platform Documentation

## 1. Overview
LA Skinn is a modern, high-performance web application built with a React (Vite) frontend and a Node.js (Express) + PostgreSQL backend. The platform provides a premium public-facing catalog of treatments and products, along with a secure, private Admin Concierge Panel to manage customer interactions, inquiries, and platform configurations.

---

## 2. Admin Concierge Panel

The Admin Panel is the central hub for managing platform data and system settings.

### Accessing the Panel
- **URL**: `https://laskinaestheticsct.com/admin` (or by navigating to the hidden admin route).
- **Default Login Credentials**:
  - **Email**: `webadmin@laskinaestheticsct.com`
  - **Password**: `LaskinAdmin@2026!`
  *(Note: It is highly recommended to change this password or manage users if additional staff require access in the future).*

### Key Features
1. **Dashboard**: View high-level analytics, recent inquiries, and customer counts.
2. **Inquiries Management**: Review all Contact Form submissions and Product Inquiries in one place. You can mark them as read/unread and track customer details.
3. **System Settings (SMTP & Email Routing)**:
   - Configure the outgoing mail server used to send automated email alerts to the staff.
   - **Sender Email**: Must match your authenticated SMTP domain (e.g., `webadmin@laskinaestheticsct.com`) to prevent emails from going to spam.
   - **Receiver Email**: The email address where the clinic staff wants to receive instant alerts (e.g., a personal Gmail or business inbox).

---

## 3. Automated Email Notification System

The platform features an asynchronous email notification engine designed to keep staff informed without slowing down the customer's browsing experience.

Whenever a user submits a Contact Form or a Product Inquiry:
1. The inquiry is instantly and securely saved to the PostgreSQL database.
2. The inquiry immediately appears in the Admin Concierge Panel.
3. The Node.js backend connects to the configured SMTP server and dispatches an automated HTML email to the **Receiver Email**.
4. The email contains the lead's Name, Email, Phone Number, Subject/Product, and their Message.

---

## 4. Server & Hosting Architecture (cPanel)

The application is hosted on a standard cPanel environment utilizing CloudLinux's **Node.js App Setup** (powered by Phusion Passenger) and a PostgreSQL database.

### Automated Deployment Script
To make updates effortless, a custom Bash script (`deploy-laskin.sh`) has been placed in the server's root directory. This script automates the process of pulling the latest code from GitHub, installing Node modules, compiling the React frontend, and restarting the Node server securely.

**How to Deploy Updates:**
1. Log into your cPanel account and open the **Terminal**.
2. Activate the Node.js virtual environment so the terminal knows which Node version to use:
   ```bash
   source /home/laskyhbh/nodevenv/laskin/server/20/bin/activate
   ```
3. Run the automated deployment script:
   ```bash
   bash ~/deploy-laskin.sh
   ```

**Script Options:**
- `bash ~/deploy-laskin.sh --skip-frontend` : Skips the React/Vite build process. Use this if you only made changes to the backend (Node.js) code. Deployment will take less than 5 seconds.
- `bash ~/deploy-laskin.sh --rollback` : Instantly rolls back the code to the last working commit if a deployment ever fails.

### Database Maintenance & Troubleshooting
If you ever need to create a **new** PostgreSQL database user via the cPanel interface, cPanel will grant the user permission to read/write to the tables, but it often forgets to grant permission to use the auto-incrementing ID counters (sequences). If this happens, your forms will return a 500 Server Error.

**To fix sequence permissions:**
1. Open **phpPgAdmin** in your cPanel dashboard.
2. Select the database (`laskyhbh_laskindb`) on the left sidebar.
3. Click the **SQL** button at the top of the main panel.
4. Run the following command (replacing the username with your actual DB user):
   ```sql
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO laskyhbh_lauraskindbuser;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO laskyhbh_lauraskindbuser;
   ```
