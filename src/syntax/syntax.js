const codeSyntax = (function(){

    function parse_html(code) {
        for (var l=0,parsed=[],stack=[],i0=0,i1=code.indexOf('<',i0);i1>=0;i1=code.indexOf('<',i0)) {
            if (i1>i0) (l ? stack[l-1].content : parsed).push(code.slice(i0,i1));
            // ------------ Check End Tag ------------ //
            if (code[i1+1] === '/') {
                for (var j0=i1+2,j1=j0+1;(code[j1]>='A'&&code[j1]<='z')||(code[j1]>='0'&&code[j1]<='9'); j1++);
                var tag = code.slice(j0,j0=j1);
                // find start point
                for (var l0=l-1;l0>=0&&stack[l0].tag!==tag;l0--);
                if (l0<0) throw `Invalid HTML: ${i1>=9?'...':''}'${code.slice(Math.max(0,i1-9),Math.min(i1+7,code.length))}'${code.length-i1>=7?'...':''}`;
                if (l-l0 > 1) {
                    stack[l0].content = stack[l0].content.concat(stack.slice(l0+1,l).flatMap((e) => {
                        return [`<span class='tag'>&lt;<span class='tag-name'>${e.tag}</span>${e.attr.join('')}/&gt;</span>`].concat(e.content);
                    }));
                    stack[l0].collapse = false;
                }
                var lines;
                if (!stack[l0].collapse) {
                    lines = [`<span class='tag'>&lt;<span class='tag-name'>${stack[l0].tag}</span>${stack[l0].attr.join('')}&gt;</span>`]
                            .concat(stack[l0].content.map((e)=> { return `\t${e}`; }))
                            .concat([`<span class='tag'>&lt;/<span class='tag-name'>${stack[l0].tag}</span>&gt;</span>`]);
                } else {
                    lines = [`<span class='tag'>&lt;<span class='tag-name'>${stack[l0].tag}</span>${stack[l0].attr.join('')}&gt;</span>${stack[l0].content.join('')}<span class='tag'>&lt;/<span class='tag-name'>${stack[l0].tag}</span>&gt;</span>`];
                }
                if (l0) {
                    stack[l0-1].content = stack[l0-1].content.concat(lines);
                    stack[l0-1].collapse = false;
                } else {
                    parsed = parsed.concat(lines);
                }
                stack = stack.slice(0,l=l0);
                i0 = j0+1;
                continue;
            }
            // ------------ Parse Tag Name ------------ //
            for (var j0=i1+1,j1=j0+1;(code[j1]>='A'&&code[j1]<='z')||(code[j1]>='0'&&code[j1]<='9'); j1++);
            var tag = code.slice(j0,j0=j1);
            if (tag === '!') {
                if (code.substr(j0,2) !== '--') throw `Invalid HTML: ${j0>=9?'...':''}'${code.slice(Math.max(0,j0-9),Math.min(j0+7,code.length))}'${code.length-j0>=7?'...':''}`;
                j1 = code.indexOf('-->',j0+2);
                if (j1<0) throw `Invalid HTML (Unclosed Comment): ${j0>=8?'...':''}'${code.slice(Math.max(0,j0-8),Math.min(j0+8,code.length))}'${code.length-j0>=8?'...':''}`;
                let comment = `<span class='comment'>&lt;!--${code.slice(j0+2,j1).replace(/</g,'&lt;').replace(/>/g,'&gt;')}--&gt;</span>`;
                if (l) {
                    stack[l-1].content.push(comment);
                    stack[l-1].collapse = false;
                } else parsed.push(comment);
                i0 = j1+3;
                continue;
            }
            // ------------ Parse Attributes ------------ //
            var tagattr = [];
            while (code[j0]!=='>'&&code[j0]!=='/') {
                for (var x0 = j0+1, x1 = x0+1; code[x1]!=='='&&code[x1]!==' '&&code[x1]!=='>'&&code[x1]!=='/'; x1++);
                var attrname = code.slice(x0,x0=x1);
                if (code[x0]==='=') {
                    var attrval;
                    if (code[++x0]==="\""||code[x0]==="'") {
                        for (x1=x0+1; code[x1]!==code[x0]||code[x1-1]==='\\';x1++);
                        attrval = code.slice(x0+1,x1++);
                    } else {
                        for (x1=x0+1; code[x1]!==' '&&code[x1]!=='>'&&code[x1]!=='/';x1++);
                        attrval = code.slice(x0,x1);
                    }
                    tagattr.push(` <span class='attr'><span class='attr-name'>${attrname}</span>=<span class='attr-value'>'${attrval}'</span></span>`);
                } else tagattr.push(` <span class='attr'><span class='attr-name'>${attrname}</span></span>`);
                j0 = x1;
            }
            // ------------ Check if self closing tag ------------ //
            if (code[j0]==='/') {
                if (l) {
                    stack[l-1].content.push(`<span class='tag'>&lt;<span class='tag-name'>${tag}</span>${tagattr.join('')}/&gt;</span>`);
                    stack[l-1].collapse = false;
                } else parsed.push(`<span class='tag'>&lt;<span class='tag-name'>${tag}</span>${tagattr.join('')}/&gt;</span>`);
                i0 = j0+2;
                continue;
            }
            // ------------ Parse Inner Tag Content ------------ //
            if (code[j0]!=='>')  throw `Invalid HTML: ${j0>=8?'...':''}'${code.slice(Math.max(0,j0-8),Math.min(j0+8,code.length))}'${code.length-j0>=8?'...':''}`;
            stack[l++] = {
                tag:tag,
                attr:tagattr,
                content:[],
                collapse:true,
            };
            i0 = j0+1;
        }
        if (l > 0) {
            parsed = parsed.concat(stack.slice(0,l).flatMap((e) => {
                return [`<span class='tag'>&lt;<span class='tag-name'>${e.tag}</span>${e.attr.join('')}/&gt;</span>`].concat(e.content);
            }));
        }
        if (i0 < code.length) parsed.push(code.slice(i0));
        return parsed.join('\n');
    }

    function setError(element,...message) {
        element.classList.add('error');
        element.innerHTML = message.map((e) => { return `<pre>${e}</pre>`}).join('');
    }

    function syntaxHTML(snippet) {
        var code = snippet.innerHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/^(?: {4})+/gm,'').replace(/[\n\t]/g,'');
        try {
            snippet.innerHTML = `<pre>${parse_html(code)}</pre>`;
        } catch (error) {
            setError(snippet,`Code Syntax Error: \n${error}`,snippet.innerHTML);
        }
    }

    return {
        createHTML:function(element) {
            var snippet = document.createElement('code');
            snippet.setAttribute('code-snippet','html');
            var code = element.innerHTML.replace(/^(?: {4})+/gm,'').replace(/[\n\t]/g,'');
            try {
                snippet.innerHTML = `<pre>${parse_html(code)}</pre>`;
            } catch (error) {
                setError(snippet,`Code Syntax Error: \n${error}`,element.innerHTML.replace(/</g,'&lt;').replace(/>/g,'&gt;'));
            }
            return snippet;
        },
        initSyntaxOnLoad:function() {
            document.addEventListener('DOMContentLoaded',function(event) {
                [].slice.call(document.querySelectorAll('code[code-snippet]')).forEach((e) => {
                    let lang = (e.getAttribute('code-snippet') || 'html');
                    switch (lang) {
                        case 'html':
                            syntaxHTML(e);
                            break;
                        default:
                            setError(e,`Code Syntax Error: Unsupported Language '${lang}'`);
                            break;
                    }
                });
            });
        }
    };
}());
