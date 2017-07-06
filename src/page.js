/* dompage v0.3
 * Copyright (c) 2017 Lucian Cooper
 *
 * Guide:
 * 
 * body:
 *     page-main = #id of main content
 *     page-panel-left = #id of left panel
 *     page-panel-right = #id of right panel
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
 *         page-panel-left | page-panel-right
 *     attrs:
 *         hide-toggle = #id of toggle element (either input[type='checkbox'] or label)
 *         page-panel = 'fixed'
 */

(function(){

    var setupTabbed = (function(){
        
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

    function setupTopBar(main,pagecontrol,barid) {
        let bar = document.getElementById(barid);
        if (bar === null) {
            console.warn("Could not set up topbar: element with id '" + barid + "' does not exist in document");
            return;
        }
        bar.classList.add('page-topbar');
        main.style.top = (bar.offsetHeight+bar.offsetTop) + 'px';
        let pyield = bar.hasAttribute('yield') ? bar.getAttribute('yield').split(',') : [];
        let lctrl = pagecontrol.elements.namedItem('left');
        if (lctrl !== null) {
            if (pyield.includes('left')) {
                bar.style.left = main.style.left;
                lctrl.addEventListener('change',function(event) {
                    let panel = document.getElementById(event.target.value);
                    this.style.left = event.target.checked ? (panel.offsetWidth+panel.offsetLeft) + 'px' : '';
                }.bind(bar));
                lctrl.addEventListener('resize',function(event) {
                    if (!event.target.checked) return;
                    let panel = document.getElementById(event.target.value);
                    this.style.left = (panel.offsetWidth+panel.offsetLeft) + 'px';
                }.bind(bar));
            } else {
                document.getElementById(lctrl.value).style.top = main.style.top;
            }
        } else if (document.body.hasAttribute("page-panel-left")) {
            if (pyield.includes('left')) {
                bar.style.left = main.style.left;
            } else {
                document.getElementById(document.body.getAttribute("page-panel-left")).style.top = main.style.top;
            }
        }

        let rctrl = pagecontrol.elements.namedItem('right');
        if (rctrl !== null) {
            if (pyield.includes('right')) {
                bar.style.right = main.style.right;
                rctrl.addEventListener('change',function(event) {
                    let panel = document.getElementById(event.target.value);
                    this.style.right = event.target.checked ? (panel.parentElement.offsetWidth - panel.offsetLeft) + 'px' : '';
                }.bind(bar));
                rctrl.addEventListener('resize',function(event) {
                    if (!event.target.checked) return;
                    let panel = document.getElementById(event.target.value);
                    this.style.right = event.target.checked ? (panel.parentElement.offsetWidth - panel.offsetLeft) + 'px' : '';
                }.bind(bar));
            } else {
                document.getElementById(rctrl.value).style.top = main.style.top;
            }
        } else if (document.body.hasAttribute("page-panel-right")) {
            if (pyield.includes('right')) {
                bar.style.right = main.style.right;
            } else {
                document.getElementById(document.body.getAttribute("page-panel-right")).style.top = main.style.top;
            }
        }
    }

    var setupSidePanel = (function() {

        var togglePanel = {
            left:function(event) {
                // this is main panel
                let panel = document.getElementById(event.target.value),checked = event.target.checked;
                Array.prototype.forEach.call(event.target.labels,e => e.classList.toggle('selected',checked))
                panel.classList.toggle('hidden',!checked);
                this.style.left = checked ? (panel.offsetWidth+panel.offsetLeft) + 'px' : '';
            },
            right:function(event) {
                // this is main panel
                let panel = document.getElementById(event.target.value),checked = event.target.checked;
                Array.prototype.forEach.call(event.target.labels,e => e.classList.toggle('selected',checked))
                panel.classList.toggle('hidden',!checked);
                this.style.right = checked ? (panel.parentElement.offsetWidth - panel.offsetLeft) + 'px' : '';
            },
        };
        var resizePanel = {
            left:function(event) {
                // this is main panel
                if (!event.target.checked) return;
                let panel = document.getElementById(event.target.value);
                this.style.left = (panel.offsetWidth+panel.offsetLeft) + 'px';
            },
            right:function(event) {
                // this is main panel
                if (!event.target.checked) return;
                let panel = document.getElementById(event.target.value);
                this.style.right = event.target.checked ? (panel.parentElement.offsetWidth - panel.offsetLeft) + 'px' : '';
            },
        };
        
        function setupHideToggle(main,panel,control) {
            let toggleid = panel.getAttribute('hide-toggle');
            if (!toggleid) return;
            var toggle = document.getElementById(toggleid);
            if (toggle===null) {
                console.warn(`Could not set up hide toggle button for ${control.name} panel: element with id '${toggleid}' does not exist in document`);
                return;
            }
            if (toggle.tagName=='LABEL') {
                if (toggle.control === null) {
                    toggle.htmlFor = control.id;
                    toggle.classList.toggle('selected',control.checked);
                    return;
                }
                toggle = toggle.control;
            }
            if (toggle.tagName !== 'INPUT' || toggle.type !== 'checkbox') {
                console.warn(`Could not set up hide toggle button for ${control.name} panel: element must be of type input[type='checkbox']`);
                return;
            }
            toggle.addEventListener('change',function(event) {
                var evt = new Event("change", {'bubbles':false, 'cancelable':false,'composed':false});
                this.dispatchEvent(evt);
            }.bind(control));
        };

        return function(main,panelid,side) {
            let panel = document.getElementById(panelid);
            if (panel === null) {
                console.warn("Could not set up "+side+" panel: element with id '" + panelid + "' does not exist in document");
                return false;
            }
            panel.classList.add('page-panel-'+side);
            var ptype = panel.hasAttribute('page-panel') ? panel.getAttribute('page-panel') : 'fixed';
            if (ptype !== 'fixed') {
                console.warn("Invalid page-panel attribute '"+ptype+"', using default value 'fixed'")
                ptype = 'fixed';
            }
            let control = document.createElement("input");
            control.type = 'checkbox';
            control.value = panelid;
            control.name = side;
            control.id = "pagectrl_"+side;
            control.checked = !panel.classList.contains('hidden');
            document.forms.pagecontrol.appendChild(control);
            control.addEventListener('change',togglePanel[side].bind(main));
            control.addEventListener('resize',resizePanel[side].bind(main));

            if (panel.hasAttribute('hide-toggle')) setupHideToggle(main,panel,control);

            if (control.checked === false) return true;
            switch (side) {
                case 'left':
                    main.style.left = (panel.offsetWidth+panel.offsetLeft) + 'px';
                    break;
                case 'right':
                    main.style.right = (panel.parentElement.offsetWidth - panel.offsetLeft) + 'px';
                    break;
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
            let mainid = document.body.getAttribute('page-main'),main = document.getElementById(mainid);
            if (main === null) {
                if (event.target.readyState == 'complete') {
                    console.warn("Could not set up page: element with id '" + mainid + "' does not exist in document");
                    document.body.removeAttribute('page-main');
                }
                return;
            }
            main.classList.add('page-main');
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
            if (document.body.hasAttribute('page-topbar')) {
                setupTopBar(main,pagecontrol,document.body.getAttribute('page-topbar'));
            }
            if (main.hasAttribute('page-tabbed')) {
                setupTabbed(main);
            }
            setup_complete = true;
            document.body.setAttribute('setup-complete','');
        }
    }()));
}());