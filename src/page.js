/* Guide:
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
        function changeTab(event) {
            if (event.target.name !== 'tab') return;
            let active = event.target.form.elements.namedItem('active_tab');
            document.getElementById(active.value).classList.toggle('active',false);
            active.value = event.target.value;
            document.getElementById(event.target.value).classList.toggle('active',true);
        }
        return function(tabs) {
            // tabs must be container element for all tabs, and must have an attribute page-tabbed='#id_of_nav'
            let navid = tabs.getAttribute('page-tabbed'),navform = document.forms[navid];
            if (navform === undefined) {
                console.warn("Could not set up tabs: tab nav form with id " + navid + " does not exist in document");
                return;
            }
            let tradio = navform.elements.namedItem('tab');
            if (tradio === null) {
                console.warn("Could not set up tabs: nav form does not contain tradio element with name 'tab'");
                return;
            }
            navform.addEventListener('change',changeTab);
            // Setup tabs, disabling the ones that don't exist
            for (let i=0,n=tradio.length,tab; i<n;i++) {
                tab = document.getElementById(tradio[i].value);
                if (tab===null) {
                    // Tab content does not exist in document
                    tradio[i].disabled = true;
                    tradio[i].checked = false;
                    continue;
                }
                tab.classList.add('tab');
            }
            // Determine active tab
            var active_tab = navform.elements.namedItem("active_tab");
            if (active_tab===null) {
                // create active_tab hidden input -> <input type='hidden' name='active_tab' value='tables'/>
                active_tab = navform.appendChild(document.createElement('input'));
                active_tab.setAttribute("type",'hidden');
                active_tab.setAttribute("name","active_tab");
                if (!tradio.value) {
                    // Find first elligible tab
                    let x = Array.prototype.findIndex.call(tradio,e => !e.disabled);
                    if (x < 0) return;
                    tradio[x].checked = true;
                }
                active_tab.value = tradio.value;
            } else if (!active_tab.value || Array.prototype.findIndex.call(tradio,e => (e.value==active_tab.value && !e.disabled)) < 0) {
                if (!tradio.value) {
                    // Find first elligible tab
                    let x = Array.prototype.findIndex.call(tradio,e => !e.disabled);
                    if (x < 0) return;
                    tradio[x].checked = true;
                }
                active_tab.value = tradio.value;
            } else {
                tradio.value = active_tab.value;
            }
            document.getElementById(tradio.value).classList.toggle('active',true);
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
                    this.style.right = event.target.checked ? (panel.offsetParent.offsetWidth - panel.offsetLeft) + 'px' : '';
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
                this.style.right = checked ? (panel.offsetParent.offsetWidth - panel.offsetLeft) + 'px' : '';
            },
        };

        function setupHideToggle(main,panel,side) {
            let control = document.createElement("input");
            control.type = 'checkbox';
            control.value = panel.id;
            control.name = side;
            control.id = "pagectrl_"+side;
            control.checked = !panel.classList.contains('hidden');
            document.forms.pagecontrol.appendChild(control);
            control.addEventListener('change',togglePanel[side].bind(main));
            let toggleid = panel.getAttribute('hide-toggle');
            if (!toggleid) return;
            var toggle = document.getElementById(toggleid);
            if (toggle===null) {
                console.warn("Could not set up hide toggle button for "+side+" panel: element with id '" + toggleid + "' does not exist in document");
                return control.checked;
            }
            if (toggle.tagName=='LABEL') {
                if (toggle.control === null) {
                    toggle.htmlFor = control.id;
                    toggle.classList.toggle('selected',control.checked);
                    return control.checked;
                }
                toggle = toggle.control;
            }
            if (toggle.tagName !== 'INPUT' || toggle.type !== 'checkbox') {
                console.warn("Could not set up hide toggle button for "+side+" panel: element must be of type input[type='checkbox']");
                return control.checked;
            }
            toggle.addEventListener('change',function(event) {
                var evt = new Event("change", {'bubbles':false, 'cancelable':false,'composed':false});
                this.dispatchEvent(evt);
            }.bind(control));

            return control.checked;
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
            var show = panel.hasAttribute('hide-toggle') ? setupHideToggle(main,panel,side) : true;
            if (show === false) return
            switch (side) {
                case 'left':
                    main.style.left = (panel.offsetWidth+panel.offsetLeft) + 'px';
                    break;
                case 'right':
                    main.style.right = (panel.offsetParent.offsetWidth - panel.offsetLeft) + 'px';
                    break;
            }
            return true;
        }
    }());

    document.addEventListener('readystatechange', (function() {
        var setup_complete = false;
        return function(event) {
            console.log("readyState:",event.target.readyState,"setup complete:",setup_complete);
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