# NMBL

The management platform for corporate legal departments and the in-house counsel, executives, and outside law firms that support them.

## Getting Started

# Setup

## Prerequisites
1. A NMBL account
2. A text editor of your choice. (e.g Sublime or Visual Studio Code are good choices.)
3. A basic knowledge of :
    - HTML and CSS
    - JavaScript ES6
    - Command-line programs
        - Node.js Command Line (for Windows users)
        - Terminal (for Mac/Linux/Unix users)

## Running locally
Git Clone https://github.com/codal/nmbl-ui.git to 
clone this project or download it. It's recommended to install GitHub desktop.

To run it, install the required packages, via command line, navigate to the folder where this repository was cloned and use the following:

Mac OSX/Linux (Terminal)
```bash
npm install
npm run ng build -- --prod
npm start
```

Windows (use Node.js command line from Start menu)
```bash
npm install
npm run ng build -- --prod
npm start
```
Open a browser and navigate to http://localhost:4200

#  Folder Structure Conventions

### A typical top-level directory layout
- dist                   # Compiled files (alternatively `build`)
- node_modules           # Application packege container.
- src                    # Source files (alternatively `lib` or `app`)
- README.md              # Explanation of tools & technology used tto develop project.

### Source files
The actual source files of a software project are usually stored inside the
`src` folder. Alternatively, you can put them into the `lib` (if you're
developing a library), or into the `app` folder (if your application's source
files are not supposed to be compiled).

# Features
- Projects / Workflow / Task
- Account Settings
- Documents
- Reporting
- User Management
    - Company Management
    - Group Management
    - Permission Management

# Technology Used
- Angular 9.0.5
- Bootstrap 4.4.1
- Typescript 3.7.5
- Moment 2.24.0
- NPM 6.13.0
- Docker

# Tools Used
- Visual Studio Code
- Invision

# Third Party Libraries
We used third party chart.js and Google chart for graphical represenatation of data.

# Browsers Support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>iOS Safari |
| --------- | --------- | --------- | --------- | --------- |
| IE10, IE11, Edge| Last 2 Versions| Last 2 Versions| Last 2 Versions| Last 2 Versions

# Developer Notes

Please feel free to modify README file if you noticied anything wrong or need to change.