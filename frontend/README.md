# Restaurant Analytics Dashboard - Frontend

A modern, responsive frontend for restaurant analytics built with Next.js, React, TypeScript, and shadcn/ui.

## 🚀 Features

- **Dashboard Overview**: Real-time metrics and KPIs
- **Product Analytics**: Detailed product performance analysis
- **Channel Comparison**: Compare performance across different sales channels
- **Store Performance**: Multi-store analytics and comparison
- **Time-based Analysis**: Trends and patterns over time
- **Export Capabilities**: PDF, Excel, and CSV exports
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme switching support
- **Real-time Updates**: Live data refresh

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Tables**: TanStack Table
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React + Radix UI Icons
- **Date Handling**: date-fns

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   ├── products/          # Product analytics pages
│   ├── channels/          # Channel comparison pages
│   ├── stores/            # Store performance pages
│   ├── reports/           # Reports pages
│   └── api/               # API routes (if needed)
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── charts/            # Chart components
│   ├── layout/            # Layout components
│   ├── forms/             # Form components
│   └── dashboard/         # Dashboard-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (see backend documentation)

### Installation

1. Clone the repository and navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME="Restaurant Analytics Dashboard"
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Key Components

### Dashboard Overview
- Revenue metrics with period comparisons
- Top-selling products
- Sales by hour visualization
- Channel performance breakdown

### Product Analytics
- Product performance table with sorting/filtering
- Customization analysis
- Product combinations (market basket analysis)
- Category performance

### Channel Comparison
- Side-by-side channel metrics
- Performance visualization
- Delivery vs pickup analysis

### Store Performance
- Multi-store comparison
- Geographic performance (if coordinates available)
- Store-specific insights

## 🎨 UI Components

The project uses shadcn/ui for consistent, accessible components:

- **Cards**: Metric displays and content containers
- **Charts**: Recharts integration for data visualization
- **Tables**: Sortable, filterable data tables
- **Forms**: React Hook Form with Zod validation
- **Navigation**: Responsive sidebar and header
- **Theming**: Dark/light mode support

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for tablet screens
- **Desktop Enhanced**: Full features on desktop

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript checks

### Code Style

- **ESLint**: Code linting with TypeScript rules
- **Prettier**: Code formatting with Tailwind CSS plugin
- **TypeScript**: Strict type checking enabled

### Performance Optimization

- **Server Components**: Using React Server Components where possible
- **Client Components**: Minimal client-side JavaScript
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js built-in image optimization
- **Caching**: React Query for efficient data caching

## 🔄 State Management

### Zustand Stores

- **Theme Store**: Dark/light mode preferences
- **Filters Store**: Dashboard filter state
- **UI Store**: Loading states, sidebar, errors
- **Analytics Store**: Chart preferences, selected metrics
- **Export Store**: Export preferences and history
- **Notifications Store**: Toast notifications
- **Activity Store**: User activity tracking

### React Query

- **Caching**: Intelligent data caching with TTL
- **Background Updates**: Automatic data refresh
- **Error Handling**: Consistent error handling
- **Loading States**: Built-in loading state management

## 📈 Data Visualization

### Chart Types
- **Line Charts**: Time series data
- **Bar Charts**: Categorical comparisons
- **Pie Charts**: Distribution analysis
- **Area Charts**: Cumulative data
- **Heatmaps**: Pattern recognition

### Interactive Features
- **Zoom**: Chart zoom capabilities
- **Filtering**: Real-time data filtering
- **Tooltips**: Detailed hover information
- **Legends**: Interactive chart legends

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001/api` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Restaurant Analytics Dashboard` |
| `NEXT_PUBLIC_ENABLE_DARK_MODE` | Enable dark mode | `true` |
| `NEXT_PUBLIC_ENABLE_EXPORT_FEATURES` | Enable export features | `true` |

## 📦 Build and Deploy

### Production Build

```bash
npm run build
npm run start
```

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Deployment Platforms

- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative deployment platform
- **Docker**: Containerized deployment
- **Static Export**: For CDN deployment

## 🧪 Testing

### Test Strategy
- **Unit Tests**: Component testing with Jest
- **Integration Tests**: API integration testing
- **E2E Tests**: End-to-end testing with Playwright
- **Visual Tests**: Component visual regression testing

## 🔍 Debugging

### Development Tools
- **React DevTools**: Component inspection
- **React Query DevTools**: Data fetching debugging
- **Zustand DevTools**: State management debugging
- **Next.js DevTools**: Performance monitoring

## 🚀 Performance

### Optimization Techniques
- **Static Generation**: Pre-rendered pages where possible
- **Incremental Static Regeneration**: Dynamic content with static benefits
- **Route Prefetching**: Automatic route prefetching
- **Bundle Analysis**: Bundle size optimization

### Monitoring
- **Core Web Vitals**: Performance metrics tracking
- **Error Boundary**: Error catching and reporting
- **Analytics**: User behavior tracking (optional)

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TanStack Query Documentation](https://tanstack.com/query)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary and confidential.