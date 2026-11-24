# New Tab MUX

A Manifest V3 Chrome New Tab dashboard using the MUX Dark black/cyan visual style.

## Features
- 12-hour local clock
- Local weather from Open-Meteo (browser location permission required)
- Bangladesh news alert keyword filter, fetched when the New Tab opens
- Network information lookup and user-triggered Cloudflare download/latency estimate
- Rotating cyan wireframe Earth
- Google search / URL navigation
- User-managed quick shortcuts stored with `chrome.storage.local`
- No browsing-history permission and no recent-activity panel

## Install
1. Extract the project folder.
2. Open `chrome://extensions`.
3. Turn on **Developer mode**.
4. Choose **Load unpacked**.
5. Select this project folder (`MUX-Dark-NewTab`).
6. Open a new tab.

After editing files, press **Reload** on the extension card and open a new tab.

## Notes and limitations
- Breaking-news feed collection uses RSS-to-JSON conversion through rss2json.com because many publisher RSS feeds do not permit direct browser cross-origin requests. Publisher feed URLs and availability can change. Failed feeds are not counted as confirmation that there are no alerts.
- The news keyword filter is a lightweight heuristic, not an official emergency-warning system. For life-safety decisions, check official BMD, DDM, Fire Service, police, and local authority announcements.
- The current feed list includes Prothom Alo, The Daily Star, Jamuna TV and Somoy TV. Some publisher feed endpoints may be unavailable or may change.
- BMD and DDM home pages are shown as source references in the project but are not parsed as structured alert feeds in this build.
- The network panel can look up public IP/ISP and run a user-triggered latency/download estimate. Browser JavaScript cannot reliably measure Wi-Fi/Ethernet link speed or perform a true upload speed test here; upload displays N/A.
- Weather, ISP lookup, RSS conversion and speed-test endpoints require internet access and may be unavailable.
- The extension does not continuously crawl news in the background. It checks the configured RSS sources on New Tab load, or when the user clicks Refresh.
