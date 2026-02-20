# Node.js + TypeScript Starter Template

This repository is a basic starter template for `Node.js` projects using TypeScript. It includes essential configurations and scripts to streamline your development workflow.

---

# 📋 Features

- **TypeScript Support**: Write your `Node.js `code in TypeScript for improved type safety.
- **Auto-Rebuild and Restart**: Automatically compiles TypeScript and restarts the server when you make changes.
- **Preconfigured Build and Watch Scripts**: Simple scripts for building and running the project in development mode.

---

# 🛠️ Getting Started

## Prerequisites

- **Node.js**: Ensure you have `Node.js` installed (recommended version: >=14).
- **npm**: Comes with `Node.js`, used to install dependencies.

## Installation

## 1. **Step 1: Clone and Install Dependencies**:

```bash
git clone <repository-url>
cd <repository-folder>
```

## 2. **Step 2: Start Development with Watch**

Run the project in development mode with automatic rebuilding and restarting on file changes:

```bash
 npm install
```

This command will compile the TypeScript files in src/ into JavaScript files in the `dist/` directory, making it ready for deployment.

## 3. **Step 3: Build for Production**

When you’re ready to build the project for production, simply run:

```bash
 npm start
```

### This command will:

1. **Compile TypeScript files** to JavaScript in real-time as you make changes in src.
   Restart the server automatically whenever changes are detected in the compiled `dist/` files.

2. **Restart the server** automatically whenever changes are detected in the compiled dist/ files.

## 📝 Notes

1. The project is configured with `TypeScript` output targeting `ES2020` syntax.
2. The module and moduleResolution are set to `NodeNext` to align with Node.js module standards.
3. Adjust the compilerOptions in tsconfig.json as needed for your project requirements.
