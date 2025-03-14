# sciter pagecontrol

![latest version](https://img.shields.io/npm/v/sciter-pagecontrol.svg)
![downloads](https://img.shields.io/npm/dy/sciter-pagecontrol.svg)

This is a [sciter.js](https://sciter.com/) pagecontrol component.

"It is a multi-page component that provides a container to hold a variety of controls per page. Much like a real-world notebook, it displays a "tab" per page so that the user can quickly switch between pages. Each page can contain its own selection of controls." [[1]](https://wiki.freepascal.org/TPageControl)

![sciter pagecontrol screenshot](https://github.com/8ctopus/sciter-pagecontrol/raw/master/screenshot.png)

## features

- load tab contents inline or from external file
- when loaded from external file, tab can have its own css and js
- fully skinnable control
- support for fontawesome icons in tab header
- tab headers on any side
- select and iterate through tabs from code
- show/hide all tabs or a specific tab
- supports screenreaders

*IMPORTANT*: Works fine until 5.0.3.21 included. There is a new issue since 6.0.0.0 where scapp crashes when there are more than 2 pagecontrols on the page

## demo

- git clone the repository
- install packages `npm install`
- install latest sciter sdk `npm run install-sdk`
- start the demo `npm run scapp`

## demo requirements

- A recent version of Node.js `node` (tested with 22 LTS) and its package manager `npm`.
    - On Windows [download](https://nodejs.dev/download/) and run the installer
    - On Linux check the [installation guide](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04#option-2-%E2%80%94-installing-node-js-with-apt-using-a-nodesource-ppa)

## add to your project

You can either add it to your project using npm or by copying the src directory.

### using npm

- install package `npm install sciter-pagecontrol`

### copy source

- add the `src` dir to your project

### add to css

```html
<style>

/* include using npm */
@import url(node_modules/sciter-pagecontrol/src/pagecontrol.css);

/* include using src dir */
@import url(src/pagecontrol.css);

</style>
<body>
    <pagecontrol header-position="top" header-visible="true">
        <tab caption="first tab" selected>
            <p> first tab content </p>
            <button> test </button>
        </tab>
        <tab caption="2nd tab">
            <button> another button </button>
        </tab>
        <tab caption="my tab" src="tab.htm" icon="fas fa-star" />
    </pagecontrol>
```

## styling

To apply a custom style to the control, you will need to use the `pagecontrol` `@set`

```css
@set pagecontrol < pagecontrol-base {
    /* set tab border to red */
    div.tabs {
        border: 1dip solid red;
    }
}
```

## known issues

- module `import` in tab file does not work unless it is a sciter module. You need to import in the main code and make the imported visible globally. see `tab4.htm`.

## todo

- use exceptions instead of console logging?
