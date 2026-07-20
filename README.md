# Home cafe Order System
A simple web-based ordering system for a home cafe.  
Customers can browse menu items, customize drinks, and place orders through a mobile-friendly interface.

## Live Demo
[![Live Site](https://img.shields.io/badge/Live%20Site-Open-2ea44f?style=for-the-badge)](https://cafe.standardlee.info)

- Website: [https:cafe.standardlee.info](https://cafe.standardlee.info)

## Tech Stack

- React
- Vite
- CSS
- Netlify
- Supa base

## Features
- Browse menu items by category and add selected drinks to the cart
- Customize each item with decaf and Ice/Hot options before ordering
- Enter a customer name and proceed to the order completion page
- Access the Admin page by entering a custom password defined in the code
- View all current pending orders from the Admin page
- Mark orders as completed from the Admin page and send a completion alert back to the order page

## Environment Setup

This project uses Supabase as the database backend.

To connect the app to the database, create a local `.env` file and add your Supabase project credentials there.  
After the environment variables are configured, the app can connect to the database and read/write order data.

Example:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Started

```bash
npm install
npm run dev
```

Open the local development server shown in the terminal.

## Build

```bash
npm run build
```

Production files will be generated in the `dist/` folder.

## Project Structure

```bash
src/
  App.jsx
  App.css
  Admin.jsx
  Admin.css
  Order.jsx
  Order.css
  main.jsx
  index.css
public/
index.html
vite.config.js
```



