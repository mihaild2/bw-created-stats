Browswave Activity Filter Pro

A powerful Chrome Extension built for Browswave users to analyze and filter user activity counts. This tool provides a modern, dark-themed dashboard to fetch activity data, calculate performance against the median, and generate deep links for granular filtration.

🚀 Features

Full-Page Dashboard: Opens in a dedicated tab for a professional, clutter-free workspace.

Smart Date Range: Automatically initializes to the first and last day of the current month.

Multi-User Selection: Load all available users and select multiple profiles to run batch reports.

Persistence: Remembers your user selections and "Package" filter preferences across sessions.

Advanced Analytics:

Calculates the Median value across all selected users.

Displays percentage differences (Green/Red) relative to the median.

Export Ready: Features a "Copy to Excel" button that formats data for easy pasting into Google Sheets or Microsoft Excel.

Direct Deep Linking: Every user in the results table links directly to their specific filtered view on the Browswave platform.

🛠 Installation

Download/Clone: Save the extension files to a local folder on your computer.

Open Chrome Extensions: Navigate to chrome://extensions/ in your Google Chrome browser.

Enable Developer Mode: Toggle the switch in the top right corner to "ON".

Load Unpacked: Click the Load unpacked button and select the folder containing the extension files.

Pin for Easy Access: Click the puzzle icon in your Chrome toolbar and pin Browswave Filter Pro.

📖 How to Use

Launch: Click the extension icon to open the dashboard in a new tab.

Setup Filters:

Select your desired Start and End dates.

Toggle Exclude Multi Packages if you only want to see SINGLE package data.

Select Users: Check the boxes for the users you want to include in the report.

Run: Click Run Filtration. The tool will process each user with a 1000ms delay to ensure stability.

Analyze & Export: Use the sortable table to find top performers and click Copy to Excel to share your findings.

🔒 Security & Privacy

No IDE Requests: All API calls are handled via the browser's standard fetch API.

Environment: Automatically targets the production environment via headers.

Permissions: Only requires storage access to remember your preferences and host_permissions for the Browswave domain.

📂 Project Structure

manifest.json: Extension configuration.

background.js: Handles tab creation and lifecycle.

popup.html: The main dashboard structure.

popup.css: Modern dark-mode styling.

popup.js: Core logic, API integration, and data processing.

icon.svg: Vector asset for the extension icon.

Created for the Browswave Ecosystem.