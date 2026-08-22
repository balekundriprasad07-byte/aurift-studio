# AURIFT° Studio

AURIFT° is an experimental digital studio website focused on cinematic, interaction-led web experiences. The repository includes the main studio site and two concept projects used in its selected-work showcase: **EMBER°** (restaurant concept) and **FORGE°** (fitness concept).

## Live site

https://aurift-studio.netlify.app

## Features

- Responsive dark editorial interface
- Animated navigation and scroll reveals
- Cursor glow and mouse parallax interactions
- Three.js/WebGL hero artwork
- Interactive services and project showcase
- Standalone EMBER° restaurant concept
- Standalone FORGE° fitness concept

## Project structure

```text
aurift-studio/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   └── scene.js
├── ember/
│   └── index.html
├── forge/
│   └── index.html
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## Run locally

Because the hero uses an ES module import, serve the project through a local HTTP server instead of opening `index.html` directly.

With Python:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Tech

- HTML5
- CSS3
- Vanilla JavaScript
- Three.js (loaded from jsDelivr)
- Google Fonts

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

Released under the [MIT License](LICENSE).

## Status

AURIFT° is an early-stage open-source web design project. The goal is to evolve it through real improvements, issues, documentation, accessibility work and reusable interaction patterns.
