# App Initialization and Navigation

## Scenario: Device has no internet connection
- **Given** the user has opened the app in device browser
- **And** the device has no internet connection
- **Then** navigate to "No Internet" route
- **And** Display "No Internet" message and "Retry" button

## Scenario: Device has no internet connection and app is installed
- **Given** the user has opened the app in device as standalone
- **And** the device has no internet connection
- **Then** navigate to "No Internet" route
- **And** Display "No Internet" message and "Retry" button

## Scenario: App opened in browser (not installed)
- **Given** the user has opened app in browser
- **Then** navigate to "Install App" route
- **And** show the "Install App" button

## Scenario: App installed and user not authenticated
- **Given** the user has installed app into device
- **When** the user has opened the app
- **And** the user is opening for first time and not authenticated with google
- **Then** Navigate to home
- **And** display "Welcome to LifeSync Adapter"
- **And** display "Sign in with Google" button

## Scenario: App installed and user authenticated
- **Given** the user has installed app into device
- **When** the user has opened the app
- **And** the user is already signed in using google
- **Then** navigate to Dashboard
- **And** display relevant sections
- **And** in header display menu in order "Dashboard", "Notifications", "Profile", "About"
