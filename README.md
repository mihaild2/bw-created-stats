Browswave Activity Filter Pro

A powerful Chrome Extension built for Browswave users to analyze and filter user activity counts. This tool provides a modern, dark-themed dashboard to fetch activity data, calculate performance against the median, and generate deep links for granular filtration.

🚀 Features

Full-Page Dashboard: Opens in a dedicated tab for a professional, clutter-free workspace.

Smart Date Range: Automatically initializes to the first and last day of the current month.

Multi-User Selection: Load all available users and select multiple profiles to run batch reports.

Persistence: Remembers your user selections and "Package" filter preferences across sessions using chrome.storage.

Advanced Analytics:

Calculates the Median value across all selected users.

Displays percentage differences (Green/Red) relative to the median.

Export Ready: Features a "Copy to Excel" button that formats data (Tab-Separated Values) for easy pasting into Google Sheets or Microsoft Excel.

Direct Deep Linking: Every user in the results table links directly to their specific filtered view on the Browswave platform.

🛠 Installation

Download/Clone: Save the extension files to a local folder on your computer.

Open Chrome Extensions: Navigate to chrome://extensions/ in your browser.

Enable Developer Mode: Toggle the switch in the top right corner to ON.

Load Unpacked: Click the Load unpacked button and select the folder containing the extension files.

Pin for Easy Access: Click the puzzle icon in your Chrome toolbar and pin Browswave Filter Pro.

📖 How to Use

Launch: Click the extension icon to open the dashboard in a new tab.

Setup Filters:

Select your desired Start and End dates.

Toggle Exclude Multi Packages to append AND package:SINGLE to the query.

Select Users: Check the boxes for the users you want to include in the report.

Run: Click Run Filtration. The tool processes each user with a 1000ms delay to prevent rate-limiting.

Analyze & Export: Sort the table by clicking headers. Use Copy to Excel to move data to external spreadsheets.

⚙️ Technical Details

API Endpoints

User List: POST https://app.browswave.com/iui-api/nats/get-activity-filters

Data Filtration: POST https://app.browswave.com/iui-api/nats

Required Headers

Content-Type: application/json
bw-dev-environment: production


Data Logic

Median: Calculated by sorting counts and finding the middle value (or average of two middle values).

Percentage Diff: ((User Count - Median) / Median) * 100.

🔒 Security & Privacy

No Third-Party Dependencies: Built with pure Vanilla JS to ensure speed and security.

Data Locality: All selections and settings are stored locally within your Chrome profile.

Environment: Explicitly targets the production environment via internal API headers.

📂 Project Structure

File

Description

manifest.json

Extension metadata and permissions.

background.js

Service worker handling the icon click/tab creation.

popup.html

The HTML structure of the dashboard.

popup.css

Premium dark-themed UI styles.

popup.js

Main application logic and API orchestration.

icon.svg

Scalable vector graphic for the extension branding.

🛠 Troubleshooting

Users not loading? Ensure you are logged into the Browswave platform in another tab.

Table not copying? Ensure the browser has permission to access the clipboard.

Broken Layout? If the page looks cramped, try reloading the extension via the Chrome Extensions page.

Created for the Browswave Ecosystem.