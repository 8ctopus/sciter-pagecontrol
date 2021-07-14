# sciter pagecontrol

This is a [sciter.js](https://sciter.com/) pagecontrol component.

"It is a multi-page component that provides a container to hold a variety of controls per page. Much like a real-world notebook, it displays a "tab" per page so that the user can quickly switch between pages. Each page can contain its own selection of controls." [[1]](https://wiki.freepascal.org/TPageControl)

![sciter pagecontrol screenshot](screenshot.png)

## features

- load tab contents inline or from external source
- when loaded from external source, tab can its own css and js
- support for fontawesome icons in tab header
- header can be shown on any side and can also be hidden
- select and iterate through tabs from code

## demo

- git clone the repository
- run `install.bat` to download the latest sciter binaries and the sciter package manager
- install packages `php spm.phar install` (only for fontawesome)
- run `scapp.bat`
- to refresh the app after changes to the html/css click `F5`

## install

- add the `src` dir to your project
- then in your code
```html
<style src="src/pagecontrol.css" />
<body>
    <pagecontrol header="top">
        <tab title="first tab" selected>
            <p> first tab content </p>
            <button> test </button>
        </tab>
        <tab title="2nd tab">
            <button> another button </button>
        </tab>
        <tab src="tab4.html" icon="fas fa-star" />
    </pagecontrol>
```
