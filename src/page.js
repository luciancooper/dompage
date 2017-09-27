/* dompage v0.4
 * Copyright (c) 2017 Lucian Cooper
 *
 * Guide:
 * 
 * body:
 *     page-main = #id of main content
 *     page-panel-left = #id of left panel
 *     page-panel-right = #id of right panel
 *     page-panel-bottom = #id of bottom panel
 *     page-topbar = #id of topbar
 * 
 * main:
 *     class:
 *         page-main
 *     attrs:
 *         page-tabbed = #id of nav
 * 
 * topbar:
 *     class:
 *         page-topbar
 *     attrs:
 *         yield = 'left,right'
 *     
 * panels:
 *     class:
 *         page-panel-left | page-panel-right | page-panel-bottom
 *     attrs:
 *         hide-toggle = #id of toggle element (either input[type='checkbox'] or label)
 *         page-panel = 'auto' | 'flex'
 *         pct = percentage value (only if page-panel='flex')
 */

(function(){

    const setupTabbed = (function(){
        
        function jumpUptreeId(e) {
            while (e.parentElement && e.parentElement.tagName!=='BODY') {
                if (e.parentElement.id) return e.parentElement;
                e = e.parentElement;
            }
            return null;
        }
        function testTabContent(e,tabids) {
            let p = jumpUptreeId(e);
            while (p != null) {
                if (tabids.includes(p.id)) return p.id;
                p = jumpUptreeId(p);
            }
        }
        return function(tabs) {
            // tabs must be container element for all tabs, and must have an attribute page-tabbed='#id_of_nav'
            let navid = tabs.getAttribute('page-tabbed'),nav = document.getElementById(navid)
            if (!nav) {
                console.warn(`Could not set up tabs: element with id '${navid}' does not exist in document`);
                return;
            }
            // key value store of tabids : a tab elements
            let atabs = {};
            // Setup tabs, disabling the ones that don't exist, returning list of existing tab ids
            let tabids = Array.prototype.map.call(nav.querySelectorAll("a[href^='#']"),(a) => {
                let tid = a.hash.slice(1);
                let tab = document.getElementById(tid);
                if (tab===null) {
                    // Tab content does not exist in document
                    a.classList.add('disabled');
                    return;
                }
                tab.classList.add('tab');
                atabs[tid] = a;
                return tid;
            }).filter(i=>i!==undefined);
            // Create active_tab form input
            let control = document.forms.pagecontrol.appendChild(document.createElement('input'));
            control.type = 'hidden';
            control.name = 'active_tab';
            // Element to scroll to if hash points to anchor within a tab
            var scrollto;
            if (window.location.hash) {
                let hash = window.location.hash.slice(1);
                prochash: {
                    if (!tabids.includes(hash)) {
                        // See if url hash points to anchor within a tab
                        let anchor = document.getElementById(hash);
                        if (!anchor) break prochash;
                        let tab = testTabContent(anchor,tabids);
                        if (!tab) break prochash;
                        control.value = tab;
                        scrollto = anchor;
                    } else control.value = hash;
                }
            }
            if (!control.value) {
                // Check if there are no eligible tabs
                if (!tabids.length) return;
                control.value = tabids[0];
            }
            document.getElementById(control.value).classList.toggle('active',true);
            atabs[control.value].classList.add('selected');
            if (scrollto) scrollto.scrollIntoView();
            // Setup hash change listener for intra tab hash links
            window.addEventListener('hashchange',function(event) {
                if (!window.location.hash) return;
                let hash = window.location.hash.slice(1),hashtab,anchor;
                if (!tabids.includes(hash)) {
                    // See if url hash points to anchor within a tab
                    anchor = document.getElementById(hash);
                    if (!anchor) return;
                    hashtab = testTabContent(anchor,tabids);
                    if (!hashtab) return;
                } else hashtab = hash;
                if (control.value === hashtab) return;
                document.getElementById(control.value).classList.toggle('active',false);
                document.getElementById(hashtab).classList.toggle('active',true);
                atabs[control.value].classList.toggle('selected',false);
                atabs[control.value = hashtab].classList.add('selected');
                if (anchor) anchor.scrollIntoView();
            });
        }
    }());

    const configureYieldLeft = (function(){
        function toggle(main) {
            this.style.left = main.style.left;
        }
        function resize(main,event) {
            if (event.target.checked) this.style.left = main.style.left;
        }
        return function(e,main,ctrl) {
            e.style.left = main.style.left;
            ctrl.addEventListener('change',toggle.bind(e,main));
            ctrl.addEventListener('resize',resize.bind(e,main));
        }
    }());

    const configureYieldRight = (function(){
        function toggle(main) {
            this.style.right = main.style.right;
        }
        function resize(main,event) {
            if (event.target.checked) this.style.right = main.style.right;
        }
        return function(e,main,ctrl) {
            e.style.right = main.style.right;
            ctrl.addEventListener('change',toggle.bind(e,main));
            ctrl.addEventListener('resize',resize.bind(e,main));
        }
    }());

    const configureYieldBottom = (function(){
        function toggle(main) {
            this.style.bottom = main.style.bottom;
        }
        function resize(main,event) {
            if (event.target.checked) this.style.bottom = main.style.bottom;
        }
        return function(e,main,ctrl) {
            e.style.bottom = main.style.bottom;
            ctrl.addEventListener('change',toggle.bind(e,main));
            ctrl.addEventListener('resize',resize.bind(e,main));
        }
    }());

    function setupTopBar(main,pagecontrol,barid) {
        let bar = document.getElementById(barid);
        if (bar === null) return void console.warn(`Could not set up topbar: element with id '${barid}' does not exist in document`);
        bar.classList.add('page-topbar');
        bar.style.position = 'fixed';
        bar.style.top = bar.style.left = bar.style.right = '0';
        main.style.top = (bar.offsetHeight+bar.offsetTop) + 'px';
        let pyield = bar.hasAttribute('yield') ? bar.getAttribute('yield').split(',') : [];
        // Configure Yield Left
        let lctrl = pagecontrol.elements.namedItem('left');
        if (lctrl) {
            if (pyield.includes('left')) configureYieldLeft(bar,main,lctrl);
            else document.getElementById(lctrl.value).style.top = main.style.top;
        }
        // Configure Yield Right
        let rctrl = pagecontrol.elements.namedItem('right');
        if (rctrl) {
            if (pyield.includes('right')) configureYieldRight(bar,main,rctrl);
            else document.getElementById(rctrl.value).style.top = main.style.top;
        }
    }

    // Setup 'left', 'right', and 'bottom' panels
    const setupSidePanel = (function() {

        function setupHideToggle(panel,control) {
            let toggleid = panel.getAttribute('hide-toggle');
            if (!toggleid) return void console.warn(`Could not set up hide toggle button for ${control.name} panel: no element id provided`);
            var toggle = document.getElementById(toggleid);
            if (toggle===null) return void console.warn(`Could not set up hide toggle button for ${control.name} panel: element with id '${toggleid}' does not exist in document`);
            if (toggle.tagName=='LABEL') {
                // Check if label is already connected to a control
                if (toggle.control === null) {
                    toggle.htmlFor = control.id;
                    toggle.classList.toggle('selected',control.checked);
                    return;
                }
                // Check to ensure label is for an input[type='checkbox']
                if (toggle.control.tagName !== 'INPUT' || toggle.control.type !== 'checkbox') {
                    return void console.warn(`Could not set up hide toggle button for ${control.name} panel: label must be for an input[type='checkbox']`);
                }
                // Connect label & its input with the panel controller
                toggle.control.checked = control.checked;
                toggle.classList.toggle('selected',control.checked);
                toggle.control.addEventListener('change',function(event) {
                    Array.prototype.forEach.call(event.target.labels,e => e.classList.toggle('selected',event.target.checked));
                    this.checked = event.target.checked;
                    this.dispatchEvent(new Event("change", {'bubbles':false, 'cancelable':false,'composed':false}));
                }.bind(control));
                return;
            }
            // Check to ensure element is of a input[type='checkbox']
            if (toggle.tagName !== 'INPUT' || toggle.type !== 'checkbox') {
                return void console.warn(`Could not set up hide toggle button for ${control.name} panel: element must be of type input[type='checkbox']`);
            }
            // Connect input with the panel controller
            toggle.checked = control.checked;
            toggle.addEventListener('change',function(event) {
                this.checked = event.target.checked;
                this.dispatchEvent(new Event("change", {'bubbles':false, 'cancelable':false,'composed':false}));
            }.bind(control));
        };

        // Setup 'auto' panel, which is sized based on its content
        const autoPanel = (function(){
            return {
                left: (function() {
                    function toggle(panel,event) {
                        let checked = event.target.checked;
                        Array.prototype.forEach.call(event.target.labels,e => e.classList.toggle('selected',checked));
                        panel.style.display = checked ? '' : 'none';
                        this.style.left = checked ? (panel.offsetWidth+panel.offsetLeft) + 'px' : '0';
                    }
                    function resize(panel,event) {
                        if (!event.target.checked) return;
                        this.style.left = (panel.offsetWidth+panel.offsetLeft) + 'px';
                    }
                    return function(main,panel,control) {
                        control.addEventListener('change',toggle.bind(main,panel));
                        control.addEventListener('resize',resize.bind(main,panel));
                        panel.style.bottom = panel.style.top = panel.style.left = '0';
                        main.style.left = control.checked ? (panel.offsetWidth+panel.offsetLeft) + 'px' : '0';
                    }
                }()),
                right: (function(){
                    function toggle(panel,event) {
                        let checked = event.target.checked;
                        Array.prototype.forEach.call(event.target.labels,e => e.classList.toggle('selected',checked))
                        panel.style.display = checked ? '' : 'none';
                        this.style.right = checked ? (panel.parentElement.offsetWidth - panel.offsetLeft) + 'px' : '0';
                    }
                    function resize(panel,event) {
                        if (!event.target.checked) return;
                        this.style.right = (panel.parentElement.offsetWidth - panel.offsetLeft) + 'px';
                    }
                    return function(main,panel,control) {
                        control.addEventListener('change',toggle.bind(main,panel));
                        control.addEventListener('resize',resize.bind(main,panel));
                        panel.style.bottom = panel.style.top = panel.style.right = '0';
                        main.style.right = control.checked ? (panel.parentElement.offsetWidth - panel.offsetLeft) + 'px' : '0';
                    }
                }()),
                bottom: (function(){
                    function toggle(panel,event) {
                        let checked = event.target.checked;
                        Array.prototype.forEach.call(event.target.labels,e => e.classList.toggle('selected',checked))
                        panel.style.display = checked ? '' : 'none';
                        this.style.bottom = checked ? (panel.parentElement.offsetHeight - panel.offsetTop) + 'px' : '0';
                    }
                    function resize(panel,event) {
                        if (!event.target.checked) return;
                        this.style.bottom = (panel.parentElement.offsetHeight - panel.offsetTop) + 'px';
                    }
                    return function(main,panel,control) {
                        control.addEventListener('change',toggle.bind(main,panel));
                        control.addEventListener('resize',resize.bind(main,panel));
                        panel.style.left = panel.style.right = panel.style.bottom = '0';
                        main.style.bottom = control.checked ? (panel.parentElement.offsetHeight - panel.offsetTop) + 'px': '0';
                    };
                }())
            };
        }());
        
        // Setup 'flex' Panel, which takes up percentage of screen
        const flexPanel = (function(){
            // Extract default 'pct' value from element
            function pctAttr(panel,side) {
                var pct = 20;
                if (panel.hasAttribute('pct')) {
                    pct = parseInt(panel.getAttribute('pct'));
                    if (pct < 0 || pct > 100) {
                        console.warn(`Invalid value '${pct}' provided for ${side} flex panel 'pct', must be number between 0 - 100, using default 20`);
                        pct = 20;
                    }
                };
                panel.setAttribute('pct',pct);
                return pct;
            }
            return {
                left: (function(){
                    function toggle(panel,event) {
                        let checked = event.target.checked;
                        Array.prototype.forEach.call(event.target.labels,e => e.classList.toggle('selected',checked))
                        panel.style.display = checked ? '' : 'none';
                        this.style.left = checked ? panel.getAttribute('pct') + '%' : '0';
                    }
                    function resize(panel,event) {
                        let pct = parseInt(panel.getAttribute('pct'));
                        panel.style.right = `${100-pct}%`;
                        if (event.target.checked) this.style.left = `${pct}%`;
                    }
                    return function(main,panel,control) {
                        control.addEventListener('change',toggle.bind(main,panel));
                        control.addEventListener('resize',resize.bind(main,panel));
                        panel.style.bottom = panel.style.top = panel.style.left = panel.style.marginRight = '0';
                        var pct = pctAttr(panel,'left');
                        panel.style.right = `${100-pct}%`;
                        main.style.left = control.checked ? `${pct}%` : '0';
                    }
                }()),
                right: (function(){
                    function toggle(panel,event) {
                        let checked = event.target.checked;
                        Array.prototype.forEach.call(event.target.labels,e => e.classList.toggle('selected',checked))
                        panel.style.display = checked ? '' : 'none';
                        this.style.right = checked ? panel.getAttribute('pct') + '%' : '0';
                    }
                    function resize(panel,event) {
                        let pct = parseInt(panel.getAttribute('pct'));
                        panel.style.left = `${100-pct}%`;
                        if (event.target.checked) this.style.right = `${pct}%`;
                    }
                    return function(main,panel,control) {
                        control.addEventListener('change',toggle.bind(main,panel));
                        control.addEventListener('resize',resize.bind(main,panel));
                        panel.style.bottom = panel.style.top = panel.style.right = panel.style.marginLeft = '0';
                        var pct = pctAttr(panel,'right');
                        panel.style.left = `${100-pct}%`;
                        main.style.right = control.checked ? `${pct}%` : '0';
                    }
                }()),
                bottom: (function() {
                    function toggle(panel,event) {
                        let checked = event.target.checked;
                        Array.prototype.forEach.call(event.target.labels,e => e.classList.toggle('selected',checked))
                        panel.style.display = checked ? '' : 'none';
                        this.style.bottom = checked ? panel.getAttribute('pct') + '%' : '0';
                    }
                    function resize(panel,event) {
                        let pct = parseInt(panel.getAttribute('pct'));
                        panel.style.top = `${100-pct}%`;
                        if (event.target.checked) this.style.bottom = `${pct}%`;
                    }
                    return function(main,panel,control) {
                        control.addEventListener('change',toggle.bind(main,panel));
                        control.addEventListener('resize',resize.bind(main,panel));
                        panel.style.left = panel.style.right = panel.style.bottom = panel.style.marginTop = '0';
                        var pct = pctAttr(panel,'bottom');
                        panel.style.top = `${100-pct}%`;
                        main.style.bottom = control.checked ? `${pct}%` : '0';
                    }
                }()),
            }
        }());
        
        return function(main,panelid,side) {
            let panel = document.getElementById(panelid);
            if (panel === null) {
                console.warn(`Could not set up ${side} panel: element with id '${panelid}' does not exist in document`);
                return false;
            }
            // setup panel
            panel.classList.add('page-panel-'+side);
            panel.style.position = 'fixed';
            panel.style.backfaceVisibility = 'hidden';
            // create control
            let control = document.createElement("input");
            control.type = 'checkbox';
            control.value = panelid;
            control.name = side;
            control.id = "pagectrl_"+side;
            if (panel.classList.contains('hidden')) {
                panel.style.display = 'none';
                panel.classList.remove('hidden');
                control.checked = false;
            } else control.checked = true;
            document.forms.pagecontrol.appendChild(control);
            // 'page-panel' attribute
            if (!panel.hasAttribute('page-panel')) panel.setAttribute('page-panel','auto')
            var ptype = panel.getAttribute('page-panel');
            switch (ptype) {
                case 'flex':
                    flexPanel[side](main,panel,control);
                    break;
                default:
                    if (ptype !== 'auto') {
                        console.warn(`Invalid page-panel attribute '${ptype}', using default type 'auto'`);
                        panel.setAttribute('page-panel','auto');
                    }
                    autoPanel[side](main,panel,control);
                    break;
            }
            if (panel.hasAttribute('hide-toggle')) setupHideToggle(panel,control);
            if (side==='bottom') {
                let pyield = panel.hasAttribute('yield') ? panel.getAttribute('yield').split(',') : [];
                let lctrl = document.forms.pagecontrol.elements.namedItem('left');
                if (lctrl !== null) {
                    if (pyield.includes('left')) configureYieldLeft(panel,main,lctrl);
                    else configureYieldBottom(document.getElementById(lctrl.value),main,control);
                }
                let rctrl = document.forms.pagecontrol.elements.namedItem('right');
                if (rctrl!==null) {
                    if (pyield.includes('right')) configureYieldRight(panel,main,rctrl);
                    else configureYieldBottom(document.getElementById(rctrl.value),main,control);
                }
            }
            return true;
        }
    }());

    document.addEventListener('readystatechange', (function() {
        var setup_complete = false;
        return function(event) {
            //console.log("readyState:",event.target.readyState,"setup complete:",setup_complete);
            if (setup_complete) return;
            if (!document.body.hasAttribute('page-main')) return;
            if (!document.body.classList.contains('loading')) document.body.classList.add('loading');
            let mainid = document.body.getAttribute('page-main'),main = document.getElementById(mainid);
            if (main === null) {
                if (event.target.readyState == 'complete') {
                    console.warn(`Could not set up page: element with id '${mainid}' does not exist in document`);
                    document.body.classList.remove('loading');
                    document.body.removeAttribute('page-main');
                }
                return;
            }
            main.classList.add('page-main');
            main.style.position = 'fixed';
            main.style.backfaceVisibility = 'hidden';
            main.style.top = main.style.bottom = main.style.left = main.style.right = '0';
            let pagecontrol = document.createElement('form');
            pagecontrol.id = 'pagecontrol';
            pagecontrol.style.display = "none";
            document.body.insertBefore(pagecontrol,document.body.firstChild);
            if (document.body.hasAttribute('page-panel-left')) {
                if (!setupSidePanel(main,document.body.getAttribute('page-panel-left'),'left')) {
                    document.body.removeAttribute('page-panel-left');
                }
            }
            if (document.body.hasAttribute('page-panel-right')) {
                if (!setupSidePanel(main,document.body.getAttribute('page-panel-right'),'right')) {
                    document.body.removeAttribute('page-panel-right');
                }
            }
            if (document.body.hasAttribute('page-panel-bottom')) {
                if (!setupSidePanel(main,document.body.getAttribute('page-panel-bottom'),'bottom')) {
                    document.body.removeAttribute('page-panel-bottom');
                }
            }
            if (document.body.hasAttribute('page-topbar')) {
                setupTopBar(main,pagecontrol,document.body.getAttribute('page-topbar'));
            }
            if (main.hasAttribute('page-tabbed')) {
                setupTabbed(main);
            }
            setup_complete = true;
            document.body.classList.remove('loading');
            document.body.setAttribute('setup-complete','');
        }
    }()));
}());