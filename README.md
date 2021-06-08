# sciter pagecontrol

This is a [sciter.js](https://sciter.com/) pagecontrol component.

![sciter pagecontrol](screenshot.png)

## features

- load tab contents inline or from external source
- when loaded from external source, tab can its own css and js
- support for fontawesome icons in tab header
- header can be shown on any side and can also be hidden
- select and iterate through tabs from code

## demo

- git clone the repository
- run `install.bat` to download the latest sciter binaries, library and the sciter package manager
- install packages `php spm.phar install`
- start `scapp.exe`
- to refresh the app after changes to the html/css click `F5`

## debug app

- start `inspector.exe`
- inside the `scapp.exe` window click `CTRL + SHIFT + I` to connect to the inspector
- click `CTRL + SHIFT + left click` to inspect an element
- note: the clock component forces the DOM to refresh every second, remove the component if you want to inspect in peace.

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
    </pagecontrol>
```

# known issues

- tab height issue
- JSX is not supported inside tabs js
