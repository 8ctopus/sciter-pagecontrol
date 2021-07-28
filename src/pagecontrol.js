/**
 * A simple pagecontrol component
 * @author hello@octopuslabs.io
 */

export class Tab extends Element
{
    constructor()
    {
        super();
    }

    /**
     * Called when element is attached to the DOM tree
     */
    componentDidMount()
    {
        this.render();
    }

    /**
     * Render component
     */
    render()
    {
        const src = this.attributes["src"] || null;

        // check if id set if not generate one
        this.id = Tab.validateID(this.id, this.elementIndex + 1);

        let html = "";

        if (!src)
            html = this.innerHTML;
        else
            // include source
            html = `<include src="` + src + `"/>`;

        // create tab
        const tab = (
            <div .tab id={this.id} state-html={html} />
        );

        this.content(tab);

        const expanded = (this.attributes["selected"] === "") ? true : false;

        // if tab is selected, show it (event doesn't trigger at this point)
        if (expanded) {
            this.state.expanded = expanded;
            this.classList.add("block");
        }

        // load STYLE tag from loaded element
        const styleEl = this.$("style");

        if (styleEl) {
            // get its content
            let style = styleEl.innerHTML;

            // get pagecontrol id
            const id = this.pagecontrol().id;

            // set styleset name
            let stylesetname = `${id}-` + this.id;

            // create styleset in order to inject tab style
            const styleset = `@set ${stylesetname} { ${style} }`;

            // inject styleset in head
            document.head.insertAdjacentHTML("beforeend", `<style> ${styleset} </style>`);

            // set styleset name for component
            stylesetname = `#${stylesetname}`;

            const div = this.$("div.tab");

            div.attributes.styleset = stylesetname;

            // remove style tag to avoid interfearing
            styleEl.parentElement.removeChild(styleEl);
        }

        // get SCRIPT tag
        const scriptEl = this.$("script");

        if (scriptEl) {
            // load script
            this.loadTabScript(scriptEl.innerHTML, src);

            // remove script tag to avoid interfearing
            scriptEl.parentElement.removeChild(scriptEl);
        }
    }

    /**
     * Return parent pagecontrol
     * @return DOMElement
     */
    pagecontrol()
    {
        return this.closest("pagecontrol");
    }

    /**
     * Expand tab
     */
    expand()
    {
        this.classList.add("block");

        this.state.expanded = true;
    }

    /**
     * Collapse tab
     */
    collapse()
    {
        this.classList.remove("block");

        this.state.expanded = false;
    }

    /**
    * Check if id set and if not generate one
    * @param id - id to validate
    * @param index - tab index in pagecontrol
    * @return original id if set, fixed otherwise
    */
    static validateID(id, index)
    {
        // create id if not set
        if (id === "")
            return `tab-${index}`;

        return id;
    }

    /**
     * Load tab script
     * @param string script
     * @param string debugHint
     * @return void
     */
    async loadTabScript(script, debugHint)
    {
        // make sure not empty
        script = script.trim();

        if (script === "")
            return;

        // TODO see if there is equivalent to "Blob" in sciter to avoid reencoding script
        // source: https://2ality.com/2019/10/eval-via-import.html
        // html encode javascript
        const encodedJs = encodeURIComponent(script);
        const dataUri   = "data:text/javascript;charset=utf-8," + encodedJs;

        // load tab script
        await import(dataUri)
            .then(module => {
                // initialize tab
                module.initTab(this, this.pagecontrol());
            })
            .catch(error => {
                // ! in case of "Init tab - FAILED - unexpected token in expression: '.'",
                // make sure to comment empty/commented <script> "initTab" functions
                console.error(`Init tab - FAILED - ${error.message} - ${debugHint}`);
            });
    }
}

export class PageControl extends Element
{
    static #classInstanceCounter = 0;
    #controlInstanceNumber;

    constructor()
    {
        super();

        this.#controlInstanceNumber = ++PageControl.#classInstanceCounter;
    }

    /**
     * Called when element is attached to the DOM tree
     */
    componentDidMount()
    {
        // save original tabs html, will be replaced with more complex <div.header><div.tabs>tabs html
        // if not saved, createTabs() may use incorrect or partial html
        this.tabsHtml = this.innerHTML;

        this.render();
    }

    /**
     * Render component
     */
    render()
    {
        // create tab headers
        const headers = this.#createHeaders();

        // create tabs container
        const tabs = this.#createTabs();

        // header position
        const position = this.attributes["header"] ?? "";

        let headersFirst = true;
        let classes      = "";

        switch (position) {
            case "right":
                headersFirst = false;
                classes      = "side";
                break;

            case "bottom":
                headersFirst = false;
                break;

            case "left":
                classes = "side";
                break;
        }

        // avoid conflicts between tab stylesets when several pagecontrol exist
        const id = this.#mainDivId();

        // create pagecontrol
        const pagecontrol = (
            <div id={id} class={classes}>
                {headersFirst ? headers : tabs}
                {headersFirst ? tabs : headers}
            </div>
        );

        this.content(pagecontrol);
    }

    /**
     * Tab header click event
     * @param string event
     * @param element clicked element
     */
    ["on click at > div > div.header > div"](event, element)
    {
        // unselect all headers
        this.#unselectHeaders();

        // collapse tab
        this.#collapseTab();

        // select clicked header
        element.state.selected = true;

        // get tab to expand
        const id = element.getAttribute("panel");

        this.#expandTab(id);
    }

    /**
     * Show tab by id
     * @param string tab id
     * @return void
     */
    showTab(id)
    {
        const selector = this.#mainDivSelector() + ` > div.header > div[panel="${id}"]`;
        const header   = this.$(selector);

        if (!header) {
            console.warn(`invalid tab ${id}`);
            return;
        }

        // unselect all headers
        this.#unselectHeaders();

        // collapse tab
        this.#collapseTab();

        header.state.selected = true;

        // expand tab
        this.#expandTab(id);
    }

    /**
     * Show next tab
     * @return void
     */
    nextTab()
    {
        this.#previousNextTab(+1);
    }

    /**
     * Show previous tab
     * @return void
     */
    previousTab()
    {
        this.#previousNextTab(-1);
    }

    /**
     * Toggle headers visibility
     * @param bool (optional) visible
     * @return void
     */
    toggleHeaders(visible)
    {
        // get header
        const header = this.$(this.#mainDivSelector() + ` > div.header`);

        if (!header) {
            console.error("header does not exist");
            return;
        }

        if (typeof visible === "undefined")
            header.classList.toggle("hide");
        else
        if (visible)
            header.classList.remove("hide");
        else
            header.classList.add("hide");
    }

    /**
     * Hide tab header by id
     * @param string tab id
     * @param bool (optional) visible
     * @return void
     */
    toggleTabHeader(id, visible)
    {
        const header = this.$(this.#mainDivSelector() + ` > div.header > div[panel="${id}"]`);

        if (!header) {
            console.warn(`invalid tab ${id}`);
            return;
        }

        if (typeof visible === "undefined")
            header.classList.toggle("hide");
        else
        if (visible)
            header.classList.remove("hide");
        else
            header.classList.add("hide");
    }

    /**
     * Create headers
     * @return JSX expression
     */
    #createHeaders()
    {
        // get tabs
        const tabs = this.$$(`> tab`);

        // create headers
        let headers = tabs.map(function(tab, i) {
            i++;

            // validate id if not yet set
            const tabID = Tab.validateID(tab.id, i);

            // get caption
            const caption = tab.attributes["title"] || tabID;

            // get icon
            let icon = tab.attributes["icon"] || "";

            if (icon !== "")
                icon = <i class={icon}></i>;

            // get selected
            const selected = (tab.attributes["selected"] === "") ? true : false;

            const i18n = "menu:" + caption.replace(/ /g, "_").toLowerCase();

            return (<div panel={tabID} state-selected={selected} data-i18n={i18n}>{icon}{caption}</div>);
        });

        headers = (
            <div .header>
                {headers}
            </div>
        );

        return headers;
    }

    /**
     * Create tabs
     * @return JSX expression
     */
    #createTabs()
    {
        // get tabs from html (we will replace with custom html to add header)
        const tabs = this.tabsHtml;

        return (
            <div .tabs state-html={tabs} />
        );
    }

    /**
     * Expand tab
     * @param string tab id
     * @return void
     */
    #expandTab(id)
    {
        const selector = this.#mainDivSelector() + ` > div.tabs > tab#` + id;
        const tab      = this.$(selector);

        if (!tab) {
            console.error(`invalid tab ${id}`);
            return;
        }

        // expand tab
        tab.expand();

        // dispatch event to pagecontrol
        this.postEvent(new CustomEvent("showtab", {
            bubbles: true,
            detail: {
                tab: id,
            }
        }));
    }

    /**
     * Unselect all headers
     * @return void
     */
    #unselectHeaders()
    {
        const header = this.$(this.#mainDivSelector() + ` > div.header`);

        if (!header) {
            console.error("header does not exist");
            return;
        }

        // loop through header tabs
        for (let child of header.children)
            child.state.selected = false;
    }

    /**
     * Collapse tab
     * @return void
     */
    #collapseTab()
    {
        const tab = this.$(this.#mainDivSelector() + ` > div.tabs > tab:expanded`);

        if (!tab) {
            console.warn("no expanded tab");
            return;
        }

        // collapse tab
        tab.collapse();
    }

    /**
     * Show previous or next tab
     * @param int +1 next, -1 previous
     * @return void
     */
    #previousNextTab(direction)
    {
        // get selected header
        const header = this.$(this.#mainDivSelector() + ` > div.header > div:selected`);

        let next = (direction === +1) ? header.nextElementSibling : header.previousElementSibling;

        if (!next) {
            const parent = header.parentElement;

            next = (direction === +1) ? parent.firstChild : parent.lastChild;
        }

        this.showTab(next.attributes["panel"]);
    }

    /**
     * Get main div selector
     * @return string
     */
    #mainDivSelector()
    {
        return `pagecontrol > div#` + this.#mainDivId();
    }

    /**
     * Get main div id
     * @return string
     */
    #mainDivId()
    {
        // avoid conflicts between tab stylesets when several pagecontrols exist (even recursive)
        return this.attributes["id"] ?? "pagecontrol-" + this.#controlInstanceNumber;
    }
}
