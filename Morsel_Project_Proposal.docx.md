**Morsel**

*Draw What You Eat. Build a Story Together.*

Project Proposal  •  Submission: April 20, 2025

# **1\. What Are You Building?**

Morsel is a mobile-first web app for friend groups who are spread across different cities and time zones, where staying connected can feel effortful and async. Instead of sending a text that requires energy or scheduling a call, users log their meals by tracing over a photo with hand-drawn strokes and dropping it into a shared live feed — turning something everyone does every day into a small, expressive moment of closeness. I want to build it because I think the best social tools are the ones that feel fun, easy to interact with, and engaging. 

# **2\. Core Features**

## **Minimum Viable Product (MVP)**

**📸  Photo-to-Canvas Tracer**

Users upload or take a photo of their meal; it fades into the background of a drawing canvas as a translucent guide. When they're done tracing, the photo disappears and only the hand-drawn artwork remains — preserving the charm of the drawing without the crutch of the photo.

**🎨  Drawing Tools**

A focused, polished set of tools designed for expressive quick sketches:

* Variable brush sizes (3 presets \+ drag slider)

* Extensive color palette with eyedropper tool to sample colors directly from the meal photo

* Eraser tool

* Undo / redo (up to 20 steps)

* One-tap canvas clear

**📱  Live Feed — Full-Screen App View**

A scrollable, Instagram-style feed showing the friend group's drawings in reverse-chronological order. Each card shows the drawing, meal name, optional caption, poster name, timestamp, and a reaction \+ comment bar.

**🪟  Widget View**

A dedicated minimal view (and progressive web app widget) that rotates through friends' meal drawings from that day — designed for passive, glanceable connection. You don't need to open the full app to feel present in your friends' day. The widget cycles through today's drawings with a soft animation, showing the drawing and the poster's name.

**💬  Comments**

Each post supports a threaded comment section — short and playful, like texting your friend about their sad desk lunch.

**🎉  Animated Emoji Reactions**

A compact reaction tray on each post (similar to Slack's emoji picker). Tapping a reaction adds to the count and triggers a small burst animation — the emoji floats upward within the drawing card frame and fades out. Contained and non-intrusive; never full-screen. Default reactions: 🤤 😭 🔥 💅 🫠 plus an open picker.

**👯  Friend Groups**

Users create or join a named group via a shareable invite link or short code. All posts, reactions, and comments are scoped to the group. One user per group is the admin, with invite management and member removal.

## **Stretch Goals**

**🕵️  Guess the Meal Game**

Posters can toggle "Mystery Mode" on submission. The meal name is hidden from the feed and replaced with a Guess\! button. Friends submit guesses; when the poster reveals, the real answer appears alongside a leaderboard of who got it right.

**🗓️  Weekly Collage**

Every Sunday, the app auto-generates two shareable image panels: Your Week (a grid of your own drawings in chronological order) and Group Highlights (the most-reacted drawings from the group that week). Shareable as a single image — a food-themed Wrapped moment for your friend group.

# **3\. Complexity Markers**

This project hits at least five of the required complexity markers:

| Feature | Complexity Marker ✅ |
| :---- | :---- |
| Photo-to-canvas tracer \+ drawing tools | Non-trivial logic & data processing |
| Live feed with reactions & comments | Multiple components with shared state |
| Persistent drawings, captions, reactions | Persistent data (database \+ file storage) |
| Friend groups \+ invite system \+ admin role | Authentication & role-based access |
| Widget view \+ animated reactions, mobile-first | Responsive, thoughtful UX |
| Guess the Meal game mode (stretch) | Real-time features \+ non-trivial logic |

# **4\. Week-by-Week Timeline**

Submission deadline: Sunday, April 20, 2025

| Week | Dates | Milestone | Tasks |
| ----- | :---- | :---- | :---- |
| **Week 1** | Mar 30 – Apr 6 | **🏗️ Working Prototype** | Project setup: Next.js \+ Supabase \+ auth scaffolding Photo upload \+ canvas overlay component (core mechanic) Basic drawing tools: brush, eraser, color palette Save drawing to database as image blob Minimal feed: display saved drawings in order Deploy to Vercel (shareable link from day 1\) |
| **Week 2** | Apr 7 – Apr 13 | **✅ Core Features Done** | Eyedropper tool for sampling meal photo colors Friend group creation, invite link / short code system Full feed: meal name, caption, poster, timestamp Comments: threaded, real-time via Supabase subscriptions Animated emoji reactions (contained card animation) Widget view: rotating daily drawings (PWA) Mobile-first responsive polish across all components Auth: login, group scoping, admin role |
| **Week 3** | Apr 14 – Apr 17 | **🧪 Testing & Polish** | End-to-end testing with real friend group Bug fixes from real usage (drawing edge cases, mobile quirks) Performance: image compression before upload Accessibility: tap targets, contrast ratios Stretch goal if time: Guess the Meal game mode Stretch goal if time: Weekly collage generator |
| **Week 4** | Apr 18 – Apr 20 | **🎬 Demo Ready** | Seed database with fun example drawings for demo Record short walkthrough video (backup for live demo) Final README \+ deployment checks Submission by April 20 ✓ |

# **5\. Technical Stack**

| Layer | Choice & Notes |
| :---- | :---- |
| **Frontend** | Next.js (React) — component architecture, routing, SSR |
| **Styling** | Tailwind CSS \+ CSS animations for reaction bursts |
| **Canvas / Drawing** | HTML5 Canvas API — custom hooks for brush, eraser, eyedropper, photo overlay |
| **Backend / DB** | Supabase — Postgres database, file storage for drawings, real-time subscriptions (free tier) |
| **Auth** | Supabase Auth — email/password or magic link |
| **AI** | Anthropic Claude API — weekly collage captions (stretch); potential meal ID in Guess the Meal mode |
| **Deployment** | Vercel (free tier) \+ Supabase hosted (free tier) |

# **6\. Open Questions & Risks**

* Canvas performance on low-end mobile — may need to throttle draw events or reduce canvas resolution for older phones.

* Eyedropper tool browser support — the native EyeDropper API has limited mobile support; a manual color-sampling fallback may be needed.

* Widget view scope — true home screen widgets require native iOS/Android APIs. For this project, the widget will be a dedicated PWA view that mimics widget behavior; a native home screen widget is a post-class stretch goal.

* Real-time reactions — Supabase subscriptions should handle this well for groups of 4–10 people.

* Claude API usage — scoped to stretch goals only, so cost is negligible at class-project scale.

*"A wobbly drawing of cereal is just as valid as a carefully rendered bowl of ramen. That's the point."*