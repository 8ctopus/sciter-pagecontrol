export class Tab extends Element {
    /**
     * Called when element is attached to the DOM tree
     */
    componentDidMount() {
        this.render();
    }

    /**
     * Render component
     */
    render() {
        const source = this.attributes.src || undefined;

        // check if id set if not generate one
        this.id = Tab.validateId(this.id, this.elementIndex + 1);

        let html = "";

        html = !source ? this.innerHTML : "<include src=\"" + source + "\"/>";

        // create tab
        const tab = (
            <div .tab id={this.id} state-html={html} />
        );

        this.content(tab);

        const expanded = (this.attributes.selected === "");

        // if tab is selected, show it (event doesn't trigger at this point)
        if (expanded) {
            this.state.expanded = expanded;
            this.classList.add("block");
        }

        // hide tab
        if (this.hasAttribute("hide"))
            this.pagecontrol().toggleTabHeader(this.id);

        this.loadStyle();
        this.loadJs(source);
    }

    loadStyle() {
        const tabStyle = this.$("style");

        if (!tabStyle) {
            return;
        }

        const style = tabStyle.innerHTML;

        const id = this.pagecontrol().id;

        let styleSetName = `${id}-` + this.id;

        // create styleset in order to inject tab style
        const styleset = `@set ${styleSetName} { ${style} }`;

        // inject styleset in head
        document.head.insertAdjacentHTML("beforeend", `<style> ${styleset} </style>`);

        // set styleset name for component
        styleSetName = `#${styleSetName}`;

        const div = this.$("div.tab");

        div.attributes.styleset = styleSetName;

        // remove style tag to avoid interfering
        tabStyle.remove();
    }

    /**
     * Return parent pagecontrol
     * @returns {Element}
     */
    pagecontrol() {
        return this.closest("pagecontrol");
    }

    /**
     * Expand tab
     */
    expand() {
        this.classList.add("block");

        this.state.expanded = true;

        // get first focusable element in tab
        const element = this.$(":focusable");

        // focus element
        if (element)
            element.focus();
    }

    /**
     * Collapse tab
     */
    collapse() {
        this.classList.remove("block");

        this.state.expanded = false;
    }

    /**
     * Check if id set and if not generate one
     * @param {string} id - id to validate
     * @param {number} index - tab index in pagecontrol
     * @returns {string} original id if set, fixed otherwise
     */
    static validateId(id, index) {
        // create id if not set
        if (id === "")
            return `tab-${index}`;

        return id;
    }

    /**
     * Load tab js
     *
     * @param {string} source
     */
    async loadJs(source) {
        const tabJs = this.$("script");

        if (!tabJs) {
            return;
        }

        const script = tabJs.innerHTML.trim();

        if (script === "") {
            return;
        }

        // TODO see if there is equivalent to "Blob" in sciter to avoid reencoding script
        // source: https://2ality.com/2019/10/eval-via-import.html
        // html encode javascript
        const encodedJs = encodeURIComponent(script);
        const dataUri = "data:text/javascript;charset=utf-8," + encodedJs;

        try {
            const module = await import(dataUri);

            if (module.initTab) {
                module.initTab(this, this.pagecontrol());
            }
        } catch (error) {
            // ! in case of "Init tab - FAILED - unexpected token in expression: '.'",
            // make sure to comment empty/commented <script> "initTab" functions
            if (typeof error === "object" && error !== null)
                console.error(`Init tab - FAILED - ${error.message} - line ${error.lineNumber + 2} - in ${source}`);
            else
                console.error(`Init tab - FAILED - ${error} - in ${source}`);
        }
    }
}

export class PageControl extends Element {
    static #classInstanceCounter = 0;
    #controlInstanceNumber;

    constructor() {
        super();

        this.#controlInstanceNumber = ++PageControl.#classInstanceCounter;
    }

    /**
     * Called when element is attached to the DOM tree
     */
    componentDidMount() {
        // save original tabs html, will be replaced with more complex <div.header><div.tabs>tabs html
        // if not saved, createTabs() may use incorrect or partial html
        this.tabsHtml = this.innerHTML;

        this.render();
    }

    /**
     * Render component
     */
    render() {
        // create tab headers
        const headers = this.#createHeaders();

        // create tabs container
        const tabs = this.#createTabs();

        // header position
        const position = this.attributes["header-position"] ?? "";

        let headersFirst = true;
        let classes = "";

        switch (position) {
            case "right":
                headersFirst = false;
                classes = "side";
                break;

            case "bottom":
                headersFirst = false;
                break;

            case "left":
                classes = "side";
                break;

            case "up":
            default:
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

        // synchronous call
        this.content(pagecontrol);

        // should headers be hidden
        if (this.hasAttribute("hide-headers"))
            this.toggleHeaders(false);
    }

    /**
     * Tab header click event
     * @param {Event} event
     * @param {Element} element
     */
    ["on click at > div > div.header > div"](event, element) {
        this.#tabHeaderClicked(element);
    }

    /**
     * Tab header keydown event
     * @param {Event} event
     * @param {Element} element
     */
    ["on keyup at > div > div.header > div"](event, element) {
        switch (event.code) {
            case "KeyRETURN": {
                this.#tabHeaderClicked(element);
                break;
            }

            case "KeyLEFT":
            case "KeyUP": {
                this.#getPreviousNextTabHeader(-1, "focus").focus();
                break;
            }

            case "KeyRIGHT":
            case "KeyDOWN":
                this.#getPreviousNextTabHeader(+1, "focus").focus();
                // No default
                break;

            default:
        }
    }

    /**
     * Show tab by id
     * @param {string} id - tab id
     */
    showTab(id) {
        const selector = this.#mainDivSelector() + ` > div.header > div[panel="${id}"]`;
        const header = this.$(selector);

        if (!header) {
            console.warn(`show tab - invalid tab - ${id}`);
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
     */
    nextTab() {
        this.#showPreviousNextTab(+1);
    }

    /**
     * Show previous tab
     */
    previousTab() {
        this.#showPreviousNextTab(-1);
    }

    /**
     * Toggle headers visibility
     * @param {boolean} visible - (optional)
     */
    toggleHeaders(visible) {
        // get header
        const header = this.$(this.#mainDivSelector() + " > div.header");

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
     * @param {string} id - tab id
     * @param {boolean} visible - (optional)
     */
    toggleTabHeader(id, visible) {
        const header = this.$(this.#mainDivSelector() + ` > div.header > div[panel="${id}"]`);

        if (!header) {
            console.warn(`toggle tab header - invalid tab - ${id}`);
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
     * Tab header clicked
     * @param {Element} element - header
     */
    #tabHeaderClicked(element) {
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
     * Create headers
     * @returns {JSX}
     */
    #createHeaders() {
        // get tabs
        const tabs = this.$$("> tab");

        // create headers
        let headers = tabs.map(function(tab, index) {
            index++;

            // validate id if not yet set
            const tabID = Tab.validateId(tab.id, index);

            // get caption
            const caption = tab.attributes.caption || tabID;

            // get icon
            let icon = tab.attributes.icon || "";

            if (icon !== "")
                icon = <i class={icon}></i>;

            // get selected
            const selected = (tab.attributes.selected === "");

            // get data-i18n
            const i18n = "pagecontrol:" + caption.replace(/ /g, "_").toLowerCase();

            return (<div panel={tabID} state-selected={selected} tabindex="0" data-i18n={i18n}>{icon}{caption}</div>);
        });

        headers = (
            <div class="header">
                {headers}
            </div>
        );

        return headers;
    }

    /**
     * Create tabs
     * @returns {JSX}
     */
    #createTabs() {
        // get tabs from html (we will replace with custom html to add header)
        const tabs = this.tabsHtml;

        return (
            <div .tabs state-html={tabs} />
        );
    }

    /**
     * Expand tab
     * @param {string} id - tab id
     */
    #expandTab(id) {
        const selector = this.#mainDivSelector() + " > div.tabs > tab#" + id;
        const tab = this.$(selector);

        if (!tab) {
            console.error(`expand tab - invalid tab - ${id}`);
            return;
        }

        // expand tab
        tab.expand();

        // dispatch event to pagecontrol
        this.postEvent(new CustomEvent("showtab", {
            bubbles: true,
            detail: {
                tab: id,
            },
        }));
    }

    /**
     * Unselect all headers
     */
    #unselectHeaders() {
        const header = this.$(this.#mainDivSelector() + " > div.header");

        if (!header) {
            console.error("header does not exist");
            return;
        }

        // loop through header tabs
        for (const child of header.children)
            child.state.selected = false;
    }

    /**
     * Collapse tab
     */
    #collapseTab() {
        const tab = this.$(this.#mainDivSelector() + " > div.tabs > tab:expanded");

        if (!tab) {
            console.warn("no expanded tab");
            return;
        }

        // collapse tab
        tab.collapse();

        // dispatch event to pagecontrol
        this.postEvent(new CustomEvent("hidetab", {
            bubbles: true,
            detail: {
                tab: tab.id,
            },
        }));
    }

    /**
     * Show previous or next tab
     * @param {number} direction - +1 next, -1 previous
     */
    #showPreviousNextTab(direction) {
        const next = this.#getPreviousNextTabHeader(direction, "selected");

        this.showTab(next.attributes.panel);
    }

    /**
     * Get previous or next tab header
     * @param {number} direction - +1 next, -1 previous
     * @param {string} state - selected or focus
     * @returns {Element}
     */
    #getPreviousNextTabHeader(direction, state) {
        // get selected header
        const header = this.$(this.#mainDivSelector() + ` > div.header > div:${state}`);

        const next = (direction === +1) ? header.nextElementSibling : header.previousElementSibling;

        if (next)
            return next;

        const parent = header.parentElement;

        return (direction === +1) ? parent.firstChild : parent.lastChild;
    }

    /**
     * Get main div selector
     * @returns {string}
     */
    #mainDivSelector() {
        return "pagecontrol > div#" + this.#mainDivId();
    }

    /**
     * Get main div id
     * @returns {string}
     */
    #mainDivId() {
        // avoid conflicts between tab stylesets when several pagecontrols exist (even recursive)
        return this.attributes.id ?? "pagecontrol-" + this.#controlInstanceNumber;
    }
}
