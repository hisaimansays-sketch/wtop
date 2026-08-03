# wtop

> **The ****`htop`**** of websites.**

`wtop` is a browser extension that provides a real-time overview of a website's runtime state. Inspired by `htop`, it surfaces key metrics about the currently active page in a clean, terminal-style interface.

<p align="center">  
<img src="./assets/screenshot.png" alt="wtop screenshot" width="900">  
</p>

## Features

- Real-time monitoring
- Minimal terminal-style UI
- Zero configuration
- Built with [Plasmo](https://www.plasmo.com/)
- Useful Metrics

## Metrics

### Metadata

- Page title
- Framework detection
- CSS framework detection
- Character encoding
- Viewport dimensions
- HTTPS status

### Performance

- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- DOMContentLoaded
- Load Event
- Navigation type

### Memory

- JS Heap Used
- JS Heap Total
- JS Heap Limit
- Heap utilization

### Network

- Total requests
- Request rate
- Downloaded bytes
- Resource breakdown
    - JavaScript
    - CSS
    - Images
    - XHR
    - Fetch

### Runtime

- DOM nodes
- Cookies
- Local Storage
- Session Storage
- Scripts
- Stylesheets
- Service Worker status
- Online status
- Page visibility
- Focus state

## Tech Stack

- Plasmo
- TypeScript
- React
- Tailwind CSS   

## Development

```bash
git clone https://github.com/chaitanyakadu/wtop.git
cd wtop

npm install
npm run dev
```

## Contributing

Issues and pull requests are welcome.

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**
