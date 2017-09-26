/* dompage v0.4
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
 *         page-panel-left | page-panel-right | page-panel-bottom
 *     attrs:
 *         hide-toggle = #id of toggle element (either input[type='checkbox'] or label)
 *         page-panel = 'fixed' | 'flex'
 *         pct = percentage value (only if page-panel='flex')
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

    var setupTopBar = (function() {
        function configureYieldLeft(main,bar,lctrl,lyield) {
            if (lctrl === null) return;
            let lpanel = document.getElementById(lctrl.value);
            if (!lyield) {
                lpanel.style.top = main.style.top;
                return
            }
            bar.style.left = main.style.left;
            lctrl.addEventListener('change',function(panel,event) {
                this.style.left = event.target.checked ? (panel.offsetWidth+panel.offsetLeft) + 'px' : '';
            }.bind(bar,lpanel));
            lctrl.addEventListener('resize',function(panel,event) {
                if (!event.target.checked) return;
                this.style.left = (panel.offsetWidth+panel.offsetLeft) + 'px';
            }.bind(bar,lpanel));
        }
        function configureYieldRight(main,bar,rctrl,ryield) {
            if (rctrl === null) return;
            let rpanel = document.getElementById(rctrl.value);
            if (!ryield) {
                rpanel.style.top = main.style.top;
                return
            }
            bar.style.right = main.style.right;
            rctrl.addEventListener('change',function(panel,event) {
                this.style.right = event.target.checked ? (panel.parentElement.offsetWidth - panel.offsetLeft) + 'px' : '';
            }.bind(bar,rpanel));
            rctrl.addEventListener('resize',function(panel,event) {
                if (!event.target.checked) return;
                this.style.right = event.target.checked ? (panel.parentElement.offsetWidth - panel.offsetLeft) + 'px' : '';
            }.bind(bar,rpanel));
        }
        return function(main,pagecontrol,barid) {
            let bar = document.getElementById(barid);
            if (bar === null) return void console.warn(`Could not set up topbar: element with id '${barid}' does not exist in document`);
            bar.classList.add('page-topbar');
            main.style.top = (bar.offsetHeight+bar.offsetTop) + 'px';
            let pyield = bar.hasAttribute('yield') ? bar.getAttribute('yield').split(',') : [];
            configureYieldLeft(main,bar,pagecontrol.elements.namedItem('left'),pyield.includes('left'))
            configureYieldRight(main,bar,pagecontrol.elements.namedItem('right'),pyield.includes('right'))
        };
    }());

    var setupSidePanel = (function() {

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

        // Note: 'this' is main in all togglePanel & resizePanel functions
        function configureYieldLeft(bpanel,lpanel,lctrl) {
            switch (lpanel.getAttribute('page-panel')) {
                case 'fixed':
                    lctrl.addEventListener('change',function(panel,event) {
                        this.style.left = event.target.checked ? (panel.offsetWidth+panel.offsetLeft) + 'px' : '';
                    }.bind(bpanel,lpanel));
                    lctrl.addEventListener('resize',function(panel,event) {
                        if (event.target.checked) this.style.left = (panel.offsetWidth+panel.offsetLeft) + 'px';
                    }.bind(bpanel,lpanel));
                    break;
                case 'flex':
                    lctrl.addEventListener('change',function(panel,event) {
                        this.style.left = event.target.checked ? panel.getAttribute('pct') + '%' : '';
                    }.bind(bpanel,lpanel));
                    lctrl.addEventListener('resize',function(panel,event) {
                        if (event.target.checked) this.style.left = panel.getAttribute('pct') + '%'
                    }.bind(bpanel,lpanel));
                    break;
            }
        }

        function configureYieldRight(bpanel,rpanel,rctrl) {
            switch (rpanel.getAttribute('page-panel')) {
                case 'fixed':
                    rctrl.addEventListener('change',function(panel,event) {
                        this.style.right = event.target.checked ? (panel.parentElement.offsetWidth - panel.offsetLeft) + 'px' : '';
                    }.bind(bpanel,rpanel));
                    rctrl.addEventListener('resize',function(panel,event) {
                        if (event.target.checked) this.style.right = (panel.parentElement.offsetWidth - panel.offsetLeft) + 'px';
                    }.bind(bpanel,rpanel));
                    break;
                case 'flex':
                    rctrl.addEventListener('change',function(panel,event) {
                        this.style.right = event.target.checked ? panel.getAttribute('pct') + '%' : '';
                    }.bind(bpanel,rpanel));
                    rctrl.addEventListener('resize',function(panel,event) {
                        if (event.target.checked) this.style.right = panel.getAttribute('pct') + '%'
                    }.bind(bpanel,rpanel));
                    break;
            }
        }

        var fixedPanel = (function() {
            return {
                left: (function() {
                    function toggle(panel,event) {
                        let checked = event.target.checked;
                        Array.prototype.forEach.call(event.target.labels,e => e.classList.toggle('selected',checked));
                        panel.classList.toggle('hidden',!checked);
                        this.style.left = checked ? (panel.offsetWidth+panel.offsetLeft) + 'px' : '';
                    }
                    function resize(panel,event) {
                        if (!event.target.checked) return;
                        this.style.left = (panel.offsetWidth+panel.offsetLeft) + 'px';
                    }
                    return function(main,panel,control) {
                        control.addEventListener('change',toggle.bind(main,panel));
                        control.addEventListener('resize',resize.bind(main,panel));
                        main.style.left = control.checked ? (panel.offsetWidth+panel.offsetLeft) + 'px' : '';
                    }
                }()),
                right: (function(){
                    function toggle(panel,event) {
                        let checked = event.target.checked;
                        Array.prototype.forEach.call(event.target.labels,e => e.classList.toggle('selected',checked))
                        panel.classList.toggle('hidden',!checked);
                        this.style.right = checked ? (panel.parentElement.offsetWidth - panel.offsetLeft) + 'px' : '';
                    }
                    function resize(panel,event) {
                        if (!event.target.checked) return;
                        this.style.right = (panel.parentElement.offsetWidth - panel.offsetLeft) + 'px';
                    }
                    return function(main,panel,control) {
                        control.addEventListener('change',toggle.bind(main,panel));
                        control.addEventListener('resize',resize.bind(main,panel));
                        main.style.right = control.checked ? (panel.parentElement.offsetWidth - panel.offsetLeft) + 'px' : '';
                    }
                }()),
                bottom: (function(){
                    function toggle(panel,event) {
                        let checked = event.target.checked;
                        Array.prototype.forEach.call(event.target.labels,e => e.classList.toggle('selected',checked))
                        panel.classList.toggle('hidden',!checked);
                        this.style.bottom = checked ? (panel.parentElement.offsetHeight - panel.offsetTop) + 'px' : '';
                    }
                    function resize(panel,event) {
                        if (!event.target.checked) return;
                        this.style.bottom = (panel.parentElement.offsetHeight - panel.offsetTop) + 'px';
                    }
                    function yieldToggle(panel,event) {
                        this.style.bottom = event.target.checked ? (panel.parentElement.offsetHeight - panel.offsetTop) + 'px' : '';
                    }
                    function yieldResize(panel,event) {
                        if (event.target.checked) this.style.bottom = (panel.parentElement.offsetHeight - panel.offsetTop) + 'px';
                    }
                    return function(main,panel,control) {
                        control.addEventListener('change',toggle.bind(main,panel));
                        control.addEventListener('resize',resize.bind(main,panel));
                        main.style.bottom = control.checked ? (panel.parentElement.offsetHeight - panel.offsetTop) + 'px': '';
                        let pyield = panel.hasAttribute('yield') ? panel.getAttribute('yield').split(',') : [];
                        let lctrl = document.forms.pagecontrol.elements.namedItem('left');
                        if (lctrl !== null) {
                            let lpanel = document.getElementById(lctrl.value);
                            if (!pyield.includes('left')) {
                                lpanel.style.bottom = main.style.bottom;
                                control.addEventListener('change',yieldToggle.bind(lpanel,panel));
                                control.addEventListener('resize',yieldResize.bind(lpanel,panel));
                            } else {
                                panel.style.left = main.style.left;
                                configureYieldLeft(panel,lpanel,lctrl);
                            }
                        }
                        let rctrl = document.forms.pagecontrol.elements.namedItem('right');
                        if (rctrl!==null) {
                            let rpanel = document.getElementById(rctrl.value);
                            if (!pyield.includes('right')) {
                                rpanel.style.bottom = main.style.bottom;
                                control.addEventListener('change',yieldToggle.bind(rpanel,panel));
                                control.addEventListener('resize',yieldResize.bind(rpanel,panel));
                            } else {
                                panel.style.right = main.style.right;
                                configureYieldRight(panel,rpanel,rctrl);
                            }
                        }
                    };
                }())
            };
        }());
        
        var flexPanel = (function(){

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
                        panel.classList.toggle('hidden',!checked);
                        this.style.left = checked ? panel.getAttribute('pct') + '%' : '';
                    }
                    function resize(panel,event) {
                        if (!event.target.checked) return;
                        this.style.left = panel.getAttribute('pct') + '%';
                    }
                    return function(main,panel,control) {
                        control.addEventListener('change',toggle.bind(main,panel));
                        control.addEventListener('resize',resize.bind(main,panel));
                        var pct = pctAttr(panel,'left');
                        panel.style.right = (100-pct) + '%';
                        main.style.left = control.checked ? (pct + '%') : '';
                    }
                }()),
                right: (function(){
                    function toggle(panel,event) {
                        let checked = event.target.checked;
                        Array.prototype.forEach.call(event.target.labels,e => e.classList.toggle('selected',checked))
                        panel.classList.toggle('hidden',!checked);
                        this.style.right = checked ? panel.getAttribute('pct') + '%' : '';
                    }
                    function resize(panel,event) {
                        if (!event.target.checked) return;
                        this.style.right = panel.getAttribute('pct') + '%';
                    }
                    return function(main,panel,control) {
                        control.addEventListener('change',toggle.bind(main,panel));
                        control.addEventListener('resize',resize.bind(main,panel));
                        var pct = pctAttr(panel,'right');
                        panel.style.left = (100-pct) + '%';
                        main.style.right = control.checked ? (pct + '%') : '';
                    }
                }()),
                bottom: (function() {
                    function toggle(panel,event) {
                        let checked = event.target.checked;
                        Array.prototype.forEach.call(event.target.labels,e => e.classList.toggle('selected',checked))
                        panel.classList.toggle('hidden',!checked);
                        this.style.bottom = checked ? panel.getAttribute('pct') + '%' : '';
                    }
                    function resize(panel,event) {
                        if (!event.target.checked) return;
                        this.style.bottom = panel.getAttribute('pct') + '%';
                    }
                    function yieldToggle(panel,event) {
                        this.style.bottom = event.target.checked ? panel.getAttribute('pct') + '%' : '';
                    }
                    function yieldResize(panel,event) {
                        if (event.target.checked) this.style.bottom = panel.getAttribute('pct') + '%';
                    }
                    return function(main,panel,control) {
                        control.addEventListener('change',toggle.bind(main,panel));
                        control.addEventListener('resize',resize.bind(main,panel));
                        var pct = pctAttr(panel,'bottom');
                        panel.style.top = (100-pct) + '%';
                        main.style.bottom = control.checked ? (pct + '%') : '';
                        let pyield = panel.hasAttribute('yield') ? panel.getAttribute('yield').split(',') : [];
                        let lctrl = document.forms.pagecontrol.elements.namedItem('left');
                        if (lctrl !== null) {
                            let lpanel = document.getElementById(lctrl.value);
                            if (!pyield.includes('left')) {
                                lpanel.style.bottom = main.style.bottom;
                                control.addEventListener('change',yieldToggle.bind(lpanel,panel));
                                control.addEventListener('resize',yieldResize.bind(lpanel,panel));
                            } else {
                                panel.style.left = main.style.left;
                                configureYieldLeft(panel,lpanel,lctrl);
                            }
                        }
                        let rctrl = document.forms.pagecontrol.elements.namedItem('right');
                        if (rctrl!==null) {
                            let rpanel = document.getElementById(rctrl.value);
                            if (!pyield.includes('right')) {
                                rpanel.style.bottom = main.style.bottom;
                                control.addEventListener('change',yieldToggle.bind(rpanel,panel));
                                control.addEventListener('resize',yieldResize.bind(rpanel,panel));
                            } else {
                                panel.style.right = main.style.right;
                                configureYieldRight(panel,rpanel,rctrl);
                            }
                        }
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
            panel.classList.add('page-panel-'+side);
            let control = document.createElement("input");
            control.type = 'checkbox';
            control.value = panelid;
            control.name = side;
            control.id = "pagectrl_"+side;
            control.checked = !panel.classList.contains('hidden');
            document.forms.pagecontrol.appendChild(control);
            if (!panel.hasAttribute('page-panel')) panel.setAttribute('page-panel','fixed')
            var ptype = panel.getAttribute('page-panel');
            switch (ptype) {
                case 'flex':
                    flexPanel[side](main,panel,control);
                    break;
                default:
                    if (ptype !== 'fixed') {
                        console.warn(`Invalid page-panel attribute '${ptype}', using default value 'fixed'`);
                        panel.setAttribute('page-panel','fixed');
                    }
                    fixedPanel[side](main,panel,control);
                    break;
            }
            if (panel.hasAttribute('hide-toggle')) setupHideToggle(panel,control);
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