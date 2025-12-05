# Yume Tools

A collection of embeddable widgets for OSRS clan management, designed to be used on Carrd or any website.

## 🌐 Live Site

**https://yumes-tools.itai.gg**

---

## 📋 Table of Contents

- [Widgets](#-widgets)
  - [Navigation Bar](#navigation-bar)
  - [Mention Widget](#mention-widget)
  - [Event Parser Widget](#event-parser-widget)
  - [CruDDy Panel](#cruddy-panel)
- [Installation](#-installation)
- [CDN Usage](#-cdn-usage)
- [Development](#-development)
- [Project Structure](#-project-structure)

---

## 🧩 Widgets

### Navigation Bar

A minimal, elegant navigation bar for linking between page sections.

**Features:**
- Minimal underline style with animated hover effects
- Uppercase monospace typography (Space Mono)
- Active state highlighting with teal glow
- Responsive design (icons only on mobile)
- Hash-based navigation

**Preview:**
```
HOME    MENTIONS    EVENT LOGS    CRUDDY PANEL
────
```

**Usage:**
```html
<div id="nav-bar-root"></div>
<script src="https://api.itai.gg/cdn/nav-bar.js"></script>
<script>
  NavBar.mount('#nav-bar-root', {
    baseUrl: 'https://yumes-tools.itai.gg',
    sticky: true
  });
</script>
```

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | string | `''` | Base URL for links |
| `sticky` | boolean | `true` | Make navbar sticky on scroll |

---

### Mention Widget

Automatically adds regional Discord mentions (@US, @EU, @AU) based on current time.

**Features:**
- Detects active timezones (8 AM - 10 PM local time)
- Auto-generates @US, @EU, @AU mentions
- Real-time message preview
- One-click copy to clipboard

**How it works:**
1. User types their message
2. Widget checks current time in:
   - EST (America/New_York) for @US
   - UTC for @EU
   - AEDT (Australia/Sydney) for @AU
3. Active regions (8 AM - 10 PM) get their mention added
4. User copies the final message

**Usage:**
```html
<div id="mention-root"></div>
<script src="https://api.itai.gg/cdn/mention-widget.js"></script>
<script>
  MentionWidget.mount('#mention-root');
</script>
```

**Example Output:**
```
@US @EU Hey everyone! Event starting in 10 minutes!
```
(If it's currently daytime in US and EU, but nighttime in AU)

---

### Event Parser Widget

Parses event attendance logs and formats them for Discord.

**Features:**
- Extracts names from various log formats
- Supports multiple input formats:
  - Table format: `Name | Time | Late`
  - Group attendance: `Name - MM:SS`
- Auto-detects misplaced input (log in notes field)
- Sends formatted data to Discord webhook
- Copy formatted output to clipboard

**Supported Log Formats:**

**Format 1: Table with headers**
```
Name | Time | Late
PlayerOne | 60:00 | -
PlayerTwo | 45:30 | -
```

**Format 2: Code-fenced table**
```
```
Name | Time | Late
PlayerOne | 60:00 | -
```
```

**Format 3: Group attendance**
```
Group attendance (5)
PlayerOne - 00:10
PlayerTwo - 00:05
```

**Usage:**
```html
<div id="event-parser-root"></div>
<script src="https://api.itai.gg/cdn/event-parser-widget.js"></script>
<script>
  EventParserWidget.mount('#event-parser-root', {
    webhook: 'https://api.itai.gg/'
  });
</script>
```

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `webhook` | string | `'https://api.itai.gg/'` | Webhook relay URL |

**Output Format:**
```
Event Name:
Wildy Wednesday

Event Time:
7:00 PM EST

Event Notes:
Great turnout!

Attendance:
PlayerOne, PlayerTwo, PlayerThree
```

---

### CruDDy Panel

Full CRUD (Create, Read, Update, Delete) admin interface for attendance records.

**Features:**
- **View Records**: Search, filter, paginate through all attendance records
- **View by Event**: Group records by event with expandable sections
- **Leaderboard**: Top X attendees with date range filtering
- **Add Record**: Create new attendance entries
- **Edit/Delete**: Modify or remove existing records
- **Find Duplicates**: Detect and remove duplicate entries
- **Discord OAuth2**: Secure access with user whitelist

**Tabs:**

| Tab | Description |
|-----|-------------|
| View Records | Table view with search/filter/pagination |
| View by Event | Grouped by event name and date |
| Leaderboard | Top attendees with visual progress bars |
| Add Record | Form to add new attendance |

**Usage:**
```html
<div id="cruddy-root"></div>
<script src="https://api.itai.gg/cdn/cruddy-panel.js"></script>
<script>
  CruddyPanel.mount('#cruddy-root', {
    apiBase: 'https://api.itai.gg'
  });
</script>
```

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiBase` | string | `''` | API base URL |

**Authentication:**
- Requires Discord login
- Only whitelisted Discord user IDs can access
- Shows "Unauthorized" screen for non-whitelisted users

**Leaderboard Features:**
- Top 5, 10, 25, 50, or 100 attendees
- Date range filtering (From/To dates)
- Visual progress bars
- Medal colors for top 3 (gold, silver, bronze)
- Summary stats (total events, unique participants, average)

**Duplicate Detection:**
- Finds records with same name + event + date
- Shows which record will be kept (lowest ID)
- Bulk delete duplicates with one click

---

## 📦 Installation

### Via CDN (Recommended)

All widgets are served through the Yume API CDN proxy for instant cache invalidation:

```html
<script src="https://api.itai.gg/cdn/nav-bar.js"></script>
<script src="https://api.itai.gg/cdn/mention-widget.js"></script>
<script src="https://api.itai.gg/cdn/event-parser-widget.js"></script>
<script src="https://api.itai.gg/cdn/cruddy-panel.js"></script>
```

### Via jsDelivr (Direct)

```html
<script src="https://cdn.jsdelivr.net/gh/y-u-m-e/yume-tools@main/dist/nav-bar/nav-bar.js"></script>
```

Note: jsDelivr has caching delays. Use the API CDN for instant updates.

---

## 🎨 Theming

All widgets use a consistent teal glassmorphism theme:

**Colors:**
- Primary: `#5eead4` (Teal)
- Secondary: `#2dd4bf` (Bright teal)
- Background: Gradient `rgba(20, 60, 60, 0.7)` to `rgba(25, 50, 80, 0.7)`
- Text: White with varying opacity
- Borders: `rgba(94, 234, 212, 0.2)`

**Font:** Outfit (headings/body), Space Mono (navbar)

---

## 💻 Development

### Prerequisites
- Node.js 20+
- Git

### Local Setup

```bash
# Clone the repo
git clone https://github.com/y-u-m-e/yume-tools.git
cd yume-tools

# Files are in dist/ - edit directly
# No build step required (vanilla JS)
```

### Testing Locally

1. Start a local server:
```bash
npx serve dist
```

2. Create a test HTML file:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Widget Test</title>
</head>
<body style="background: linear-gradient(135deg, #134e4a 0%, #1e3a5f 100%); min-height: 100vh;">
  <div id="test-root"></div>
  <script src="http://localhost:3000/nav-bar/nav-bar.js"></script>
  <script>
    NavBar.mount('#test-root', { baseUrl: '' });
  </script>
</body>
</html>
```

### Deploying Changes

1. Edit files in `dist/`
2. Commit and push to `main`
3. Get the new commit SHA: `git rev-parse HEAD`
4. Update SHA in yume-api's `wrangler.jsonc`
5. Deploy the API: `npx wrangler deploy`

Or use the GitHub Actions workflow for automation.

---

## 📁 Project Structure

```
yume-tools/
├── .github/
│   └── workflows/
│       └── notify-deploy.yml   # Notifies API of updates
├── dist/                       # Production files
│   ├── nav-bar/
│   │   └── nav-bar.js          # Navigation bar widget
│   ├── msg-maker/
│   │   └── mention-widget.js   # Mention maker widget
│   ├── log-parser/
│   │   └── event-parser-widget.js  # Event log parser
│   └── cruddy-panel/
│       └── cruddy-panel.js     # Admin CRUD panel
├── src/                        # Source/development files
│   ├── msg-maker/
│   │   └── msg-maker-embedded.js
│   └── log-parser/
│       └── log-parser-embedded.js
└── README.md
```

---

## 🔗 Related Projects

- [yume-api](https://github.com/y-u-m-e/yume-api) - Backend API
- [Carrd Site](https://yumes-tools.itai.gg) - Live website

---

## 📝 Carrd Integration

### Embed Code for Carrd

Each widget needs an **Embed** element in Carrd set to **Code** type:

**Navigation Bar:**
```html
<div id="nav-bar-root"></div>
<script src="https://api.itai.gg/cdn/nav-bar.js"></script>
<script>
  window.NavBar && NavBar.mount('#nav-bar-root', {
    baseUrl: 'https://yumes-tools.itai.gg',
    sticky: true
  });
</script>
```

**Mention Widget:**
```html
<div id="mention-root"></div>
<script src="https://api.itai.gg/cdn/mention-widget.js"></script>
<script>
  window.MentionWidget && MentionWidget.mount('#mention-root');
</script>
```

**Event Parser:**
```html
<div id="event-parser-root"></div>
<script src="https://api.itai.gg/cdn/event-parser-widget.js"></script>
<script>
  window.EventParserWidget && EventParserWidget.mount('#event-parser-root', {
    webhook: 'https://api.itai.gg/'
  });
</script>
```

**CruDDy Panel:**
```html
<div id="cruddy-root"></div>
<script src="https://api.itai.gg/cdn/cruddy-panel.js"></script>
<script>
  window.CruddyPanel && CruddyPanel.mount('#cruddy-root', {
    apiBase: 'https://api.itai.gg'
  });
</script>
```

### Important Carrd Settings

- **Don't** check "Defer loading" for embed elements
- Place each widget in its own section for proper scrolling
- Use section IDs that match hash routes (e.g., `#msg-maker`)

---

## 📝 License

MIT

