## ✨ Modern Todo App - AWS Amplify React+Vite

A beautiful, modern todo application built with React, TypeScript, Vite, and AWS Amplify. Features real-time synchronization, authentication, and a stunning UI.

## 🚀 Features

- **Modern UI**: Beautiful gradient design with smooth animations and responsive layout
- **Full CRUD Operations**: Create, read, update, and delete todos
- **Real-time Sync**: Todos sync automatically across devices using AWS Amplify
- **Authentication**: Secure user authentication with AWS Cognito
- **Filtering**: Filter todos by All, Active, or Completed
- **Search**: Real-time search functionality
- **Statistics**: View total, active, and completed todo counts
- **Keyboard Shortcuts**: Edit with Enter, cancel with Escape
- **Mobile Responsive**: Works perfectly on all device sizes

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **AWS Account** (for Amplify backend services)
- **AWS CLI** configured (optional, for advanced usage)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Uttama786/amplify-vite-react-template.git
cd amplify-vite-react-template
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Amplify Sandbox (Backend)

The Amplify sandbox creates a local development environment with all AWS services. **This must be running before starting the frontend.**

Open a **new terminal window** and run:

```bash
npx ampx sandbox
```

This will:
- Deploy your backend resources (Auth, Database, API) to AWS
- Generate `amplify_outputs.json` with your backend configuration
- Keep running to watch for backend changes

**Note**: The first time you run this, it may take a few minutes to set up resources. Keep this terminal open while developing.

### 4. Start Development Server

In a **separate terminal window**, run:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in the terminal).

## 📱 Using the App

1. **Sign Up/In**: Create a new account or sign in with existing credentials
2. **Add Todos**: Type in the input field and click "Add Todo" or press Enter
3. **Complete Todos**: Click the checkbox to mark todos as done
4. **Edit Todos**: Double-click any todo to edit it, or click the edit button
5. **Delete Todos**: Click the delete button (🗑️) to remove a todo
6. **Filter**: Use the filter buttons to view All, Active, or Completed todos
7. **Search**: Use the search box to find specific todos
8. **Clear Completed**: Click "Clear Completed" to remove all completed todos at once

## 🏗️ Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues

## 🚢 Building for Production

1. **Build the frontend**:
   ```bash
   npm run build
   ```

2. **Deploy backend** (if not using sandbox):
   ```bash
   npx ampx pipeline-deploy --branch main
   ```

3. The built files will be in the `dist/` directory, ready to be deployed to any static hosting service.

## 📁 Project Structure

```
amplify-vite-react-template/
├── amplify/              # Amplify backend configuration
│   ├── auth/            # Authentication setup
│   ├── data/            # Database schema
│   └── backend.ts       # Backend entry point
├── src/
│   ├── App.tsx          # Main todo app component
│   ├── App.css          # App styles
│   ├── main.tsx         # App entry point
│   └── index.css        # Global styles
├── public/              # Static assets
└── package.json         # Dependencies and scripts
```

## 🔧 Troubleshooting

### Issue: "Cannot find module 'amplify_outputs.json'"

**Solution**: Make sure the Amplify sandbox is running (`npx ampx sandbox`). This file is generated automatically when the sandbox starts.

### Issue: Authentication errors

**Solution**: Ensure your AWS credentials are configured correctly. You can check with:
```bash
aws configure list
```

### Issue: Port already in use

**Solution**: Vite will automatically try the next available port, or you can specify one:
```bash
npm run dev -- --port 3000
```

### Issue: Schema changes not reflected

**Solution**: After modifying `amplify/data/resource.ts`, restart the sandbox to apply changes:
1. Stop the sandbox (Ctrl+C)
2. Run `npx ampx sandbox` again

## 🔐 Security

- Authentication is handled by AWS Cognito
- All API requests are secured
- User data is isolated per user account

## 📚 Learn More

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## 📝 License

This project is licensed under the MIT-0 License. See the LICENSE file for details.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this project.

---

**Happy Todo-ing! ✨**
