const codeSyntax = (function(){

    function parse_html(output,code,i,lvl) {
        // '<' = &lt;
        // '>' = &gt;
        if (i === undefined) i = 0;
        if (lvl === undefined) lvl = 0;
        var indent = '\t'.repeat(lvl);
        for (var i1=code.indexOf('<',i);i1>=0&&code[i1+1]!=='/';i1=code.indexOf('<',i)) {
            if (i1>i) output.push(code.slice(i,i1));
            for (var j = i1+1, j1 = j+1; (code[j1]>='A'&&code[j1]<='z')||(code[j1]>='0'&&code[j1]<='9'); j1++);
            var tag = code.slice(j,j=j1);
            if (tag === '!') {
                if (code.substr(j,2) !== '--') throw `Invalid HTML: ${j>=9?'...':''}'${code.slice(Math.max(0,j-9),Math.min(j+7,code.length))}'${code.length-j>=7?'...':''}`;
                j1 = code.indexOf('-->',j+2);
                if (j1<0) throw `Invalid HTML (Unclosed Comment): ${j>=8?'...':''}'${code.slice(Math.max(0,j-8),Math.min(j+8,code.length))}'${code.length-j>=8?'...':''}`;
                output.push(`${indent}<span class='comment'>&lt;!--${code.slice(j+2,j1).replace(/</g,'&lt;').replace(/>/g,'&gt;')}--&gt;</span>\n`);
                i = j1+3;
                continue;
            }
            output.push(indent);
            // ------------ Parse Attributes ------------ //
            var tagattr = [];
            while (code[j]!=='>'&&code[j]!=='/') {
                for (var x = j+1, x1 = x+1; code[x1]!=='='&&code[x1]!==' '&&code[x1]!=='>'&&code[x1]!=='/'; x1++);
                var attrname = code.slice(x,x=x1);
                if (code[x]==='=') {
                    var attrval;
                    if (code[++x]==="\""||code[x]==="'") {
                        for (x1=x+1; code[x1]!==code[x]||code[x1-1]==='\\';x1++);
                        attrval = code.slice(x+1,x1++);
                    } else {
                        for (x1=x+1; code[x1]!==' '&&code[x1]!=='>'&&code[x1]!=='/';x1++);
                        attrval = code.slice(x,x1);
                    }
                    tagattr.push(` <span class='attr'><span class='attr-name'>${attrname}</span>=<span class='attr-value'>'${attrval}'</span></span>`);
                } else tagattr.push(` <span class='attr'><span class='attr-name'>${attrname}</span></span>`);
                j = x1;
            }
            // ------------ Check if self closing tag ------------ //
            if (code[j]==='/') {
                output.push(`<span class='tag'>&lt;<span class='tag-name'>${tag}</span>${tagattr.join('')}/&gt;</span>\n`);
                i = j+2;
                continue;
            }
            // ------------ Parse Inner Tag Content ------------ //
            var tagcontent = [];
            j = parse_html(tagcontent,code,j+1,lvl+1);
            if (code[j+1]!=='/'||code.substr(j+2,tag.length)!==tag) throw `Invalid HTML: ${j>=8?'...':''}'${code.slice(Math.max(0,j-8),Math.min(j+8,code.length))}'${code.length-j>=8?'...':''}`;
            if (tagcontent.length > 1) {
                output.push(`<span class='tag'>&lt;<span class='tag-name'>${tag}</span>${tagattr.join('')}&gt;</span>\n`);
                output.push(tagcontent.join(''));
                output.push(`${indent}<span class='tag'>&lt;/<span class='tag-name'>${tag}</span>&gt;</span>\n`);
            } else {
                output.push(`<span class='tag'>&lt;<span class='tag-name'>${tag}</span>${tagattr.join('')}&gt;</span>${tagcontent.join('')}<span class='tag'>&lt;/<span class='tag-name'>${tag}</span>&gt;</span>\n`);
            }
            i = j+tag.length+3;
        }
        if (i1>=0) {
            if (i<i1) output.push(code.slice(i,i1));
        } else if (i<code.length) output.push(code.slice(i)); 
        return i1;
    }

    function setError(element,message) {
        element.classList.add('error');
        element.innerHTML = `<pre>${message}</pre>`;
    }

    function syntaxHTML(snippet) {
        var code = snippet.innerHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/^(?: {4})+/gm,'').replace(/[\n\t]/g,'');
        var output = [];
        try {
            parse_html(output,code);
            snippet.innerHTML = `<pre>${output.join('')}</pre>`;
        } catch {
            setError(snippet,'Code Syntax Error: Invalid HTML');
        }
    }

    return {
        createHTML:function(element) {
            var snippet = document.createElement('code');
            snippet.setAttribute('code-snippet','html');
            var code = element.innerHTML.replace(/^(?: {4})+/gm,'').replace(/[\n\t]/g,'');
            var output = [];
            try {
                parse_html(output,code);
                snippet.innerHTML = `<pre>${output.join('')}</pre>`;
            } catch (error) {
                setError(snippet,`Code Syntax Error: \n${element.innerHTML.replace(/</g,'&lt;').replace(/>/g,'&gt;')}`);
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
