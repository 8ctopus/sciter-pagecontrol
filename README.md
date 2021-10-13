# sciter pagecontrol

This is a [sciter.js](https://sciter.com/) pagecontrol component.

"It is a multi-page component that provides a container to hold a variety of controls per page. Much like a real-world notebook, it displays a "tab" per page so that the user can quickly switch between pages. Each page can contain its own selection of controls." [[1]](https://wiki.freepascal.org/TPageControl)

![sciter pagecontrol screenshot](screenshot.png)

## features

- load tab contents inline or from external source
- when loaded from external source, tab can have its own css and js
- fully skinnable control
- support for fontawesome icons in tab header
- tab headers on any side
- select and iterate through tabs from code
- show/hide all tabs or a specific tab
- support screenreaders

## demo

- git clone the repository
- on Mac only `chmod +x install.sh scapp.sh`
- run `install.bat` on Windows or `./install.sh` on Mac to download the latest sciter binaries and the sciter package manager
- install packages `php bin/spm.phar install`
- run `scapp.bat` or `./scapp.sh`

## install

- add the `src` dir to your project or use the sciter package manager
- in your code

```html
<style src="src/pagecontrol.css" />
<body>
    <pagecontrol header-position="top" header-visible="true">
        <tab caption="first tab" selected>
            <p> first tab content </p>
            <button> test </button>
        </tab>
        <tab caption="2nd tab">
            <button> another button </button>
        </tab>
        <tab caption="my tab" src="tab.html" icon="fas fa-star" />
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

## todo

- use exceptions instead of console logging?
