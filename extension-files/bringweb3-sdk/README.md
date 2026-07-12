<a href="https://bringweb3.io/"><img width="200px" src="https://bringweb3.io/wp-content/uploads/2024/05/logo-trans_black.png"/></a><br>
<br><br>
<h1>@yoroi-classic/bringweb3-chrome-extension-kit</h1>
<br><br>

## Table of content
- [Table of content](#table-of-content)
- [Description](#description)
- [Prerequisites](#prerequisites)
- [Installing](#installing)
  - [Package](#package)
  - [Manifest](#manifest)
- [Importing](#importing)
  - [import](#import)
  - [require](#require)
- [Example](#example)
  - [background.js](#backgroundjs)
  - [contentScript.js](#contentscriptjs)
  - [Turnoff settings](#turnoff-settings)
- [Contact us](#contact-us)

## Description
This integration kit is designed to enhance existing Chrome extensions by adding functionality that enables automatic crypto cashback on online purchases.

This kit consists of a set of JavaScript files that crypto outlets can integrate into their crypto wallet extensions. This integration facilitates a seamless addition of cashback features, leveraging cryptocurrency transactions in the context of online shopping.

When a user visits supported online retailer websites, the Crypto Cashback system determines eligibility for cashback offers based on the user's location and the website's relevance.

## Prerequisites

- Node.js >= 14
- Chrome extension manifest >= V2 with required permissions
- Obtain an identifier key from [Bringweb3](https://bringweb3.io/#contact)
- Provide a specific logo for the specific outlet

##  Installing

### Package
Using npm:
```bash
$ npm install @yoroi-classic/bringweb3-chrome-extension-kit
```

Using yarn:

```bash
$ yarn add @yoroi-classic/bringweb3-chrome-extension-kit
```

Using pnpm:

```bash
$ pnpm add @yoroi-classic/bringweb3-chrome-extension-kit
```

### Manifest

Include this configuration inside your `manifest.json` file:

```json
  "permissions": [
    "storage",
    "tabs"
  ],
  "content_scripts": [
    {
      "matches": [
        "<all_urls>"
      ],
      "js": [
        "contentScript.js" // The name of the file importing the bringContentScriptInit
      ]
    }
  ],
  "host_permissions": [
    "https://*.bringweb3.io/*"
  ]
```

## Importing
Once the package is installed, you can import the library using `import` or `require` approach:

### import
```js
import { bringInitBackground } from '@yoroi-classic/bringweb3-chrome-extension-kit';
```
```js
import { bringInitContentScript } from '@yoroi-classic/bringweb3-chrome-extension-kit';
```
### require
```js
const { bringInitBackground } = require('@yoroi-classic/bringweb3-chrome-extension-kit');
```
```js
const { bringInitContentScript } = require('@yoroi-classic/bringweb3-chrome-extension-kit');
```

## Example

### background.js

```js

import { bringInitBackground } from '@yoroi-classic/bringweb3-chrome-extension-kit';

bringInitBackground({
    identifier: process.env.PLATFORM_IDENTIFIER, // The identifier key you obtained from Bringweb3
    apiEndpoint: 'sandbox', // 'sandbox' || 'prod'
    cashbackPagePath: '/wallet/cashback' // The relative path to your Cashback Dashboard if you have one inside your extension
})
```

### contentScript.js

```js 
import { bringInitContentScript } from "@yoroi-classic/bringweb3-chrome-extension-kit";

bringInitContentScript({
    getWalletAddress: async () => await new Promise(resolve => setTimeout(() => resolve('<USER_WALLET_ADDRESS>'), 200)),// Async function that returns the current user's wallet address
    promptLogin: () => {...}, // Function that prompts a UI element asking the user to login
    walletAddressListeners: ["customEvent:addressChanged"], // An optional list of custom events that dispatched when the user's wallet address had changed, don't add it if you are using walletAddressUpdateCallback
    walletAddressUpdateCallback: (callback)=>{...}, //an optional function that runs when the user's wallet address had changed and execute the callback, don't add it if you are using walletAddressUpdateCallback
    switchWallet: true // Add switch wallet button, this requires also a UI for changing wallet address.
    themeMode: 'light' // 'light' | 'dark',
    text:'lower' // 'lower' | 'upper'
    darkTheme: {...}, // Same as lightTheme
    lightTheme: {
        // font
        fontUrl: 'https://fonts.googleapis.com/css2?family=Matemasie&display=swap',
        fontFamily: "'Matemasie', system-ui",
        // Popup
        popupBg: "#192E34",
        popupShadow: "",
        // Primary button
        primaryBtnBg: "linear-gradient(135deg, #5DEB5A 0%, #FDFC47 100%)",
        primaryBtnFC: "#041417",
        primaryBtnFW: "600",
        primaryBtnFS: "14px",
        primaryBtnBorderC: "transparent",
        primaryBtnBorderW: "0",
        primaryBtnRadius: "8px",
        // Secondary button
        secondaryBtnBg: "transparent",
        secondaryBtnFS: "12px",
        secondaryBtnFW: "500",
        secondaryBtnFC: "white",
        secondaryBtnBorderC: "rgba(149, 176, 178, 0.50)",
        secondaryBtnBorderW: "2px",
        secondaryBtnRadius: "8px",
        // Markdown
        markdownBg: "#07131766",
        markdownFS: "12px",
        markdownFC: "#DADCE5",
        markdownBorderW: "0",
        markdownRadius: "4px",
        markdownBorderC: "black",
        markdownScrollbarC: "#DADCE5",
        // Wallet address
        walletBg: "#33535B",
        walletFS: "10px",
        walletFW: "400",
        walletFC: "white",
        walletBorderC: "white",
        walletBorderW: "0",
        walletRadius: "4px",
        // Details of offering
        detailsBg: "#33535B",
        detailsTitleFS: "15px",
        detailsTitleFW: "600",
        detailsTitleFC: "white",
        detailsSubtitleFS: "14px",
        detailsSubtitleFW: "500",
        detailsSubtitleFC: "#A8ADBF",
        detailsRadius: "8px",
        detailsBorderW: "0",
        detailsBorderC: "transparent",
        detailsAmountFC: "#5DEB5A",
        detailsAmountFW: "700",
        // Overlay
        overlayBg: "#192E34E6",
        overlayFS: "13px",
        overlayFW: "400",
        overlayFC: "#DADCE5",
        loaderBg: "#0A2EC0",
        // Optout \ Turn off
        optoutBg: "#192E34",
        optoutFS: "14px",
        optoutFW: "400",
        optoutFC: "white",
        optoutRadius: "56px",
        // X Button and close buttons
        closeFS: "9px",
        closeFW: "300",
        closeFC: "#B9BBBF",
        // Token name
        tokenBg: "transparent",
        tokenFS: "13px",
        tokenFW: "600",
        tokenFC: "#DADCE5",
        tokenBorderW: "2px",
        tokenBorderC: "#DADCE5",
        tokenRadius: "8px",
        // Notification popup
        notificationFS: "14px",
        notificationFW: "500",
        notificationFC: "white",
        notificationBtnBg: "linear-gradient(135deg, #5DEB5A 0%, #FDFC47 100%)",
        notificationBtnFS: "12px",
        notificationBtnFW: "500",
        notificationBtnFC: "#041417",
        notificationBtnBorderW: "0",
        notificationBtnBorderC: "transparent",
        notificationBtnRadius: "8px",
        activateTitleFS: "14px",
        activateTitleFW: "600",
        activateTitleFC: "white",
        activateTitleBoldFS: "14px",
        activateTitleBoldFW: "700",
        activateTitleBoldFC: "white",
    }
});
```
### Turnoff settings 
```javascript
import { getTurnOff, setTurnOff } from "@yoroi-classic/bringweb3-chrome-extension-kit";

// Get state example
const current = await getTurnOff()
console.log(current) // true | false

// Set state example
const res = await setTurnOff(true)
console.log(res.isTurnedOff) // true
```


## Contact us
 
For more information: [contact us](https://bringweb3.io/#contact)