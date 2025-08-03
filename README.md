# User Details PDF Application

A modern, responsive web application built with Next.js that allows users to input their personal information and generate professional PDF documents. This project demonstrates best practices in React development, form validation, PDF generation, and user experience design.

## 🚀 Live Demo

- **Live Application:** [Deploy on Vercel](https://your-app-name.vercel.app)
- **Repository:** [GitHub Repository](https://github.com/yourusername/user-details-pdf-app)

## ✨ Features

### Core Functionality
- **📝 Interactive Form Interface** - Clean, intuitive form with real-time validation
- **📄 PDF Generation** - Client-side PDF creation with professional formatting
- **👁️ PDF Preview** - Preview generated PDF before downloading
- **💾 Instant Download** - One-click PDF download with custom filename
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices

### User Experience
- **⚡ Real-time Validation** - Instant feedback on form inputs
- **🔄 Loading States** - Visual feedback during PDF generation and navigation
- **❌ Error Handling** - Comprehensive error messages and graceful fallbacks
- **♿ Accessibility** - WCAG 2.1 AA compliant with proper ARIA labels
- **🎨 Modern UI** - Clean design with Tailwind CSS and custom icons

### Technical Features
- **🔒 Type Safety** - 100% TypeScript implementation
- **🧪 Comprehensive Testing** - Unit, integration, and component tests
- **📦 Modular Architecture** - Reusable components and utilities
- **⚡ Performance Optimized** - Code splitting and optimized bundles
- **🛠️ Developer Experience** - Hot reload, linting, and type checking

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework

### Libraries & Tools
- **[jsPDF](https://github.com/parallax/jsPDF)** - Client-side PDF generation
- **[Vitest](https://vitest.dev/)** - Fast unit testing framework
- **[Testing Library](https://testing-library.com/)** - Simple and complete testing utilities
- **[ESLint](https://eslint.org/)** - Code linting and formatting

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher) or **yarn** or **pnpm**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/user-details-pdf-app.git
cd user-details-pdf-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### 4. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
user-details-pdf-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── preview/           # PDF preview page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout component
│   │   └── page.tsx           # Home page component
│   ├── components/            # Reusable UI components
│   │   ├── Button.tsx         # Custom button component
│   │   ├── FormField.tsx      # Form input component
│   │   ├── LoadingSpinner.tsx # Loading overlay component
│   │   └── ErrorBoundary.tsx  # Error boundary component
│   ├── context/               # React Context providers
│   │   └── FormContext.tsx    # Form state management
│   ├── icons/                 # Custom SVG icon components
│   │   ├── UserIcon.tsx
│   │   ├── MailIcon.tsx
│   │   └── [other icons]
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # Shared interfaces
│   ├── utils/                 # Utility functions
│   │   ├── pdfGenerator.ts    # PDF generation logic
│   │   ├── validation.ts      # Form validation utilities
│   │   └── index.ts           # Utility exports
│   └── test/                  # Test configuration
│       └── setup.ts           # Test setup file
├── public/                    # Static assets
├── package.json               # Project dependencies
├── next.config.ts             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── vitest.config.ts           # Vitest testing configuration
```

## 🧪 Testing

### Run All Tests

```bash
npm run test
# or
yarn test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
# or
yarn test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
# or
yarn test:coverage
```

### Run Tests with UI

```bash
npm run test:ui
# or
yarn test:ui
```

## 🏗️ Building for Production

### Build the Application

```bash
npm run build
# or
yarn build
```

### Start Production Server

```bash
npm run start
# or
yarn start
```

### Analyze Bundle Size

```bash
npm run build:analyze
# or
yarn build:analyze
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start development server |
| `build` | Build for production |
| `start` | Start production server |
| `lint` | Run ESLint |
| `lint:fix` | Fix ESLint errors |
| `type-check` | Run TypeScript type checking |
| `test` | Run tests in watch mode |
| `test:run` | Run tests once |
| `test:ui` | Run tests with UI |
| `test:coverage` | Run tests with coverage report |
| `clean` | Clean build artifacts |

## 🎨 Form Fields

The application includes the following form fields:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| **Name** | Text | ✅ Yes | Min 2 characters, letters and spaces only |
| **Email** | Email | ✅ Yes | Valid email format |
| **Phone Number** | Tel | ✅ Yes | Valid phone number format |
| **Position** | Text | ❌ No | Optional job title |
| **Description** | Textarea | ❌ No | Optional additional details |

## 📄 PDF Features

### PDF Layout
- **A4 Format** - Standard document size
- **Professional Styling** - Clean typography and spacing
- **Structured Sections** - Personal and professional information
- **Automatic Formatting** - Text wrapping and page breaks
- **Timestamp Footer** - Generation date and time

### PDF Sections
1. **Header** - Document title with underline
2. **Personal Information** - Name, email, phone number
3. **Professional Information** - Position/job title
4. **Description** - Additional details (if provided)
5. **Footer** - Generation timestamp

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Add any environment variables here
NEXT_PUBLIC_APP_NAME=User Details PDF App
```

### Tailwind CSS

The project uses Tailwind CSS 4 with custom configuration. Modify `tailwind.config.js` to customize the design system.

### TypeScript

Strict TypeScript configuration is enabled. Check `tsconfig.json` for compiler options.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy with zero configuration

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/user-details-pdf-app)

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `out` folder to Netlify

### Deploy to Other Platforms

The application can be deployed to any platform that supports Node.js applications.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [jsPDF](https://github.com/parallax/jsPDF) for client-side PDF generation
- [Vercel](https://vercel.com/) for seamless deployment

## 📞 Contact

If you have any questions or suggestions, feel free to reach out:

- **Email:** rohitpoudel023@gmail.com
- **LinkedIn:** [Your LinkedIn Profile]
- **GitHub:** [Your GitHub Profile]

---

**Made with ❤️ using Next.js and TypeScript**
