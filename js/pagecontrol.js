/**
 * A simple pagecontrol component
 * @author hello@octopuslabs.io
 */

// import functions from sciter libraries
import * as sys from "@sys";
import {encode,decode} from "@sciter";

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
        const i   = this.elementIndex + 1;

        if (this.id == "")
            this.setAttribute("id", `tab-${i}`);

        let html         = "";
        let stylesetname = "";

        if (!src)
            html = this.innerHTML;
        else
        if (!sys.fs.$lstat(src))
            console.error(`tab src does not exist ${src}`);
        else {
            // read file
            const buffer = sys.fs.$readfile(src);

            // decode buffer
            html = decode(buffer, "utf-8");

            // search src for css style section
            let matches = html.match(/<style>([^<]*?)<\/style>/);

            if (matches != null) {
                // remove style from html
                html = html.replace(matches[0], "");

                // get style
                const style = matches[1];

                // get pagecontrol id
                const id = this.getPageControl().id;

                // set styleset name
                stylesetname = `${id}-` + this.id;

                // create styleset in order to inject tab style
                let styleset = `@set ${stylesetname} { ${style} }`;

                // inject styleset in head
                document.head.insertAdjacentHTML("beforeend", `<style> ${styleset} </style>`);

                // set styleset name for component
                stylesetname = `#${stylesetname}`;
            }

            // search src for script section
            matches = html.match(/<script>([^<]*?)<\/script>/);

            if (matches != null) {
                // remove script from html
                html = html.replace(matches[0], "");

                // get script
                const script = matches[1];

                // execute tab script
                eval(script);
            }
        }

        const expanded = (this.attributes["selected"] == "") ? true : false;

        // create tab
        const tab = (
            <div .tab id={this.id} state-expanded={expanded} state-html={html} styleset={stylesetname} />
        );

        this.content(tab);
    }

    /**
     * Return parent pagecontrol
     * @return DOM Element?
     */
    getPageControl()
    {
        return this.parentElement.parentElement;
    }

    /**
     * Get selector
     * @param string selector tab|pagecontrol|both
     * @return string
     */
    selector(selector)
    {
        const tab         = "tab#" + this.id;
        const pagecontrol = "pagecontrol#" + this.getPageControl().id;

        if (selector == "tab")
            return tab;
        else
        if (selector == "pagecontrol")
            return pagecontrol;
        else
        if (selector == "both")
            return pagecontrol + " " + tab;
        else
            console.error(`unknown selector ${selector}`);
    }
}

export class PageControl extends Element
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
        // create tab headers
        const headers = this.createHeaders();

        // create tabs container
        const tabs = this.createTabs();

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
        const id = this.attributes["id"] ?? "pagecontrol-" + this.elementIndex + 1;

        // create pagecontrol
        const pagecontrol = (
            <div id={id} class={classes} styleset={__DIR__ + "../css/pagecontrol.css#pagecontrol"}>
                {headersFirst ? headers : tabs}
                {headersFirst ? tabs : headers}
            </div>
        );

        this.content(pagecontrol);
    }

    /**
     * Create headers
     * @return JSX expression
     */
    createHeaders()
    {
        // get tabs
        const tabs = this.$$("tab");

        // create headers
        let headers = tabs.map(function(element, i) {
            i++;

            // get caption
            const caption = element.attributes["title"] || `tab ${i}`;

            // get icon
            let icon = element.attributes["icon"] || "";

            if (icon != "")
                icon = <i class={icon}></i>;

            // get selected
            const selected = (element.attributes["selected"] == "") ? true : false;

            return (
                <div panel={"tab-" + i} state-selected={selected}>{icon}{caption}</div>
            );
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
    createTabs()
    {
        // get tabs
        const tabs = this.innerHTML;

        return (
            <div .tabs state-html={tabs} />
        );
    }

    /**
     * Tab header click event
     * @param string event
     * @param element clicked element
     */
    ["on click at pagecontrol div.header > div"](event, element)
    {
        // unselect all headers
        this.unselectHeaders();

        // collapse tab
        this.collapseTab();

        // select clicked header
        element.state.selected = true;

        // get tab to expand
        const id = element.getAttribute("panel");

        this.expandTab(id);
    }

    /**
     * Set tab by id
     * @param string tab id
     * @return void
     */
    setTab(id)
    {
        const selector = `div.header div[panel="${id}"]`;

        if (!selector) {
            console.error(`invalid tab id ${id}`);
            return;
        }

        const header = this.$(selector);

        // unselect all headers
        this.unselectHeaders();

        // collapse tab
        this.collapseTab();

        header.state.selected = true;

        // expand tab
        this.expandTab(id);
    }

    /**
     * Expand tab
     * @param string tab id
     * @return void
     */
    expandTab(id)
    {
        const tab = this.$("div.tab#" + id);

        if (!tab) {
            console.error("tab does not exist");
            return;
        }

        // expand tab
        tab.state.expanded = true;

        // dispatch event
        this.dispatchEvent(new CustomEvent("showtab", {
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
    unselectHeaders()
    {
        const header = this.$("div.header");

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
    collapseTab()
    {
        const tab = this.$("div.tab:expanded");

        if (!tab) {
            //console.log("no expanded tab");
            return;
        }

        // hide expanded tabs
        tab.state.expanded = false;
    }

    /**
     * Show previous or next tab
     * @param int +1 next, -1 previous
     * @return void
     */
    previousNextTab(direction)
    {
        // get selected header
        const header = this.$("div.header div:selected");

        let next = (direction == +1) ? header.nextElementSibling : header.previousElementSibling;

        if (!next) {
            const parent = header.parentElement;

            next = (direction == +1) ? parent.firstChild : parent.lastChild;
        }

        this.setTab(next.attributes["panel"]);
    }

    /**
     * Show next tab
     * @return void
     */
    nextTab()
    {
        this.previousNextTab(+1);
    }

    /**
     * Show previous tab
     * @return void
     */
    previousTab()
    {
        this.previousNextTab(-1);
    }

    /**
     * Toggle header visibility
     * @return void
     */
    toggleHeader()
    {
        // get header
        const header = this.$("div.header");

        if (!header) {
            console.error("header does not exist");
            return;
        }

        header.classList.toggle("hide");
    }

    /**
     * Get element selector
     * @return string
     */
    selector()
    {
        if (this.id == "")
            return "pagecontrol";

        return "pagecontrol#" + this.id;
    }
}
