# Vauntico Trust Widget v2.0.0

A white-label, embeddable trust score widget designed for Phase 2 B2B API licensing. This widget allows partners to display Vauntico trust scores with customizable branding while providing comprehensive KPI tracking for monetization analytics.

## 🚀 Features

- **White Label Solution** - Fully customizable branding, colors, and styling
- **KPI Tracking** - Automatic usage tracking for monetization analytics
- **Secure Authentication** - API key-based authentication with tier-based access
- **Responsive Design** - Mobile-optimized with adaptive layouts
- **Real-time Updates** - Auto-refresh capability with configurable intervals
- **Theme Support** - Light, dark, and auto theme modes
- **TypeScript Support** - Full TypeScript definitions included
- **Bundle Optimized** - Multiple build formats (UMD, ES modules, minified)

## 📦 Installation

### CDN (Recommended)

```html
<script src="https://cdn.vauntico.com/widget/v2.0.0/vauntico-trust-widget.min.js"></script>
```

### NPM

```bash
npm install @vauntico/trust-widget
```

```javascript
import VaunticoTrustWidget from "@vauntico/trust-widget";
```

### Yarn

```bash
yarn add @vauntico/trust-widget
```

## 🔧 Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Vauntico Trust Widget Demo</title>
  </head>
  <body>
    <!-- Container for the widget -->
    <div id="trust-widget"></div>

    <!-- Include widget script -->
    <script src="https://cdn.vauntico.com/widget/v2.0.0/vauntico-trust-widget.min.js"></script>

    <!-- Initialize widget -->
    <script>
      const widget = new VaunticoTrustWidget(
        document.getElementById("trust-widget"),
        {
          apiKey: "your-api-key",
          userId: "user-123",
          theme: "light",
          primaryColor: "#007bff",
        },
      );
    </script>
  </body>
</html>
```

### ES Modules

```javascript
import VaunticoTrustWidget from "@vauntico/trust-widget";

const widget = new VaunticoTrustWidget(
  document.getElementById("trust-widget"),
  {
    apiKey: "your-api-key",
    userId: "user-123",
    theme: "auto",
    primaryColor: "#6f42c1",
    showDetails: true,
    onScoreUpdate: (score) => {
      console.log("Trust score updated:", score);
    },
  },
);
```

## ⚙️ Configuration Options

| Option            | Type                          | Default           | Description                      |
| ----------------- | ----------------------------- | ----------------- | -------------------------------- |
| `apiKey`          | `string`                      | **Required**      | Your Vauntico API key            |
| `userId`          | `string`                      | **Required**      | User ID to fetch trust score for |
| `theme`           | `'light' \| 'dark' \| 'auto'` | `'light'`         | Widget theme mode                |
| `primaryColor`    | `string`                      | `'#007bff'`       | Primary brand color              |
| `fontFamily`      | `string`                      | System font stack | Custom font family               |
| `showLogo`        | `boolean`                     | `true`            | Show Vauntico logo               |
| `showDetails`     | `boolean`                     | `true`            | Show trust factors breakdown     |
| `width`           | `string`                      | `'300px'`         | Widget width                     |
| `height`          | `string`                      | `'auto'`          | Widget height                    |
| `borderRadius`    | `string`                      | `'8px'`           | Border radius for widget         |
| `animation`       | `boolean`                     | `true`            | Enable animations                |
| `refreshInterval` | `number`                      | `300000`          | Auto-refresh interval (ms)       |
| `onScoreUpdate`   | `function`                    | `undefined`       | Callback when score updates      |
| `onError`         | `function`                    | `undefined`       | Callback for errors              |

## 🎨 Themes

### Light Theme

```javascript
const widget = new VaunticoTrustWidget(container, {
  apiKey: "your-api-key",
  userId: "user-123",
  theme: "light",
});
```

### Dark Theme

```javascript
const widget = new VaunticoTrustWidget(container, {
  apiKey: "your-api-key",
  userId: "user-123",
  theme: "dark",
});
```

### Auto Theme

```javascript
const widget = new VaunticoTrustWidget(container, {
  apiKey: "your-api-key",
  userId: "user-123",
  theme: "auto", // Follows system preference
});
```

## 🎯 Branding Customization

### Custom Colors

```javascript
const widget = new VaunticoTrustWidget(container, {
  apiKey: "your-api-key",
  userId: "user-123",
  primaryColor: "#ff5722", // Orange theme
  theme: "light",
});
```

### Hide Logo (White Label)

```javascript
const widget = new VaunticoTrustWidget(container, {
  apiKey: "your-api-key",
  userId: "user-123",
  showLogo: false, // Hide Vauntico branding
  primaryColor: "#your-brand-color",
});
```

### Custom Styling

```javascript
const widget = new VaunticoTrustWidget(container, {
  apiKey: "your-api-key",
  userId: "user-123",
  width: "100%",
  borderRadius: "16px",
  fontFamily: "Inter, sans-serif",
});
```

## 📊 API Methods

### Initialize Widget

```javascript
const widget = new VaunticoTrustWidget(container, config);
```

### Get Current Score

```javascript
const score = widget.getScore();
console.log("Current score:", score);
```

### Refresh Score Manually

```javascript
widget.refresh();
```

### Update Configuration

```javascript
widget.updateConfig({
  theme: "dark",
  primaryColor: "#ff5722",
  showDetails: false,
});
```

### Destroy Widget

```javascript
widget.destroy(); // Cleanup and remove widget
```

## 🔄 Event Callbacks

### Score Update Callback

```javascript
const widget = new VaunticoTrustWidget(container, {
  apiKey: "your-api-key",
  userId: "user-123",
  onScoreUpdate: (score) => {
    console.log("Score updated:", score.score);
    console.log("Tier:", score.tier);
    console.log("Factors:", score.factors);

    // Custom logic based on score
    if (score.score > 80) {
      console.log("High trust score detected!");
    }
  },
});
```

### Error Callback

```javascript
const widget = new VaunticoTrustWidget(container, {
  apiKey: "your-api-key",
  userId: "user-123",
  onError: (error) => {
    console.error("Widget error:", error);

    // Show user-friendly error message
    alert("Unable to load trust score. Please try again later.");
  },
});
```

## 📈 KPI Tracking

The widget automatically tracks usage metrics for monetization analytics:

- **Widget Loads** - Each widget initialization
- **Score Refreshes** - Manual and automatic refreshes
- **Errors** - Failed API calls and errors
- **Configuration Changes** - Theme and styling updates
- **User Interactions** - Clicks and engagements

### Tracked Data Points

- API key identifier (masked)
- User tier and score
- Widget configuration
- Timestamp and action type
- Geographic location (optional)

## 🔐 Authentication & Security

### API Key Management

- API keys are validated on each request
- Keys are masked in client-side logs
- Tier-based access control enforced
- Rate limiting applied per API key

### Best Practices

```javascript
// ✅ Good: Store API key securely
const widget = new VaunticoTrustWidget(container, {
  apiKey: "pk_live_xxxxxxxxxxxxxxxxxxxxxxxx", // Environment variable
  userId: "user-123",
});

// ❌ Bad: Hardcoded API key in client code
const widget = new VaunticoTrustWidget(container, {
  apiKey: "YOUR_STRIPE_SECRET_KEY_HERE", // Never expose secret keys
  userId: "user-123",
});
```

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Android Chrome 90+

## 📱 Responsive Behavior

The widget automatically adapts to different screen sizes:

- **Desktop** (≥768px): Full widget layout
- **Tablet** (768px-1024px): Adjusted spacing
- **Mobile** (≤768px): Compact layout with smaller score circle

## 🧪 Development

### Local Development

```bash
# Clone repository
git clone https://github.com/Tygertbone/vauntico-server.git
cd vauntico-server/widget

# Install dependencies
npm install

# Build widget
npm run build

# Start demo server
npm run dev
```

### Build Commands

```bash
npm run build          # Production build
npm run build:dev      # Development build
npm run build:watch    # Watch mode
npm run test           # Run tests
npm run lint           # Lint code
```

## 📋 API Response Format

The widget expects the following API response structure:

```javascript
{
    "score": 85,
    "tier": "pro",
    "factors": {
        "transaction_history": 92,
        "verification_status": 100,
        "community_engagement": 78,
        "dispute_resolution": 85
    },
    "calculatedAt": "2024-01-15T10:30:00Z",
    "expiresAt": "2024-01-16T10:30:00Z",
    "monetization": {
        "tier": "pro",
        "creditsRemaining": 450,
        "nextCalculationCost": 10
    },
    "metadata": {
        "version": "2.0.0",
        "endpoint": "/api/v1/trust-score",
        "rateLimitRemaining": 950
    }
}
```

## 🚨 Error Handling

The widget handles various error scenarios gracefully:

- **Network Errors** - Retry mechanism with exponential backoff
- **API Errors** - User-friendly error messages
- **Invalid Configuration** - Validation with helpful messages
- **Rate Limiting** - Automatic retry with respect to limits

### Error Types

- `401 Unauthorized` - Invalid or missing API key
- `403 Forbidden` - Insufficient subscription tier
- `404 Not Found` - User not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Temporary server issue

## 🔧 Troubleshooting

### Common Issues

**Widget not loading**

- Check API key validity
- Verify user ID exists
- Ensure network connectivity
- Check browser console for errors

**Score not updating**

- Verify refresh interval configuration
- Check API rate limits
- Ensure user has sufficient credits
- Review onScoreUpdate callback

**Styling issues**

- Check CSS conflicts
- Verify z-index positioning
- Ensure container element exists
- Check responsive breakpoints

### Debug Mode

```javascript
// Enable debug logging
const widget = new VaunticoTrustWidget(container, {
  apiKey: "your-api-key",
  userId: "user-123",
  onScoreUpdate: (score) => console.log("Score updated:", score),
  onError: (error) => console.error("Widget error:", error),
});
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Documentation**: [Vauntico Docs](https://docs.vauntico.com)
- **API Reference**: [API Docs](https://api.vauntico.com/docs)
- **Support**: [support@vauntico.com](mailto:support@vauntico.com)
- **Issues**: [GitHub Issues](https://github.com/Tygertbone/vauntico-server/issues)

## 🚀 Deployment

### CDN Usage

```html
<!-- Production -->
<script src="https://cdn.vauntico.com/widget/v2.0.0/vauntico-trust-widget.min.js"></script>

<!-- Development -->
<script src="https://cdn.vauntico.com/widget/v2.0.0/vauntico-trust-widget.js"></script>
```

### Self-Hosting

```html
<script src="/path/to/vauntico-trust-widget.min.js"></script>
```

## 📊 Version History

### v2.0.0 (Current)

- ✨ White label widget implementation
- ✨ KPI tracking integration
- ✨ Theme customization support
- ✨ Responsive design improvements
- ✨ TypeScript definitions

### v1.x.x (Legacy)

- Basic trust score display
- Limited customization options
- No KPI tracking

---

**Built with ❤️ by the Vauntico Team**
