// The interactive desktop uses the same virtual files as the portfolio shell.
function createWindowsDesktop(root, shellKey, focusCamera) {
    const apps = { explorer:"File Explorer", terminal:"PowerShell", notes:"Notepad", settings:"Settings" };
    const records = new Map();
    let top = 0, active = "", panel = "", currentPath = "", drag = null;
    const read = key => { try { return localStorage.getItem("legion-"+key) || ""; } catch { return ""; } };
    const save = (key,value) => { try { localStorage.setItem("legion-"+key,value); } catch { /* Private session. */ } };
    function el(tag,cls,text) {
        const node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text !== undefined) node.textContent = text;
        return node;
    }
    function button(parent,name,action,content=name) {
        const b=el("button","",content); b.type="button"; b.title=name; b.setAttribute("aria-label",name);
        b.onclick=action; parent.append(b); return b;
    }
    function icon(id) {
        const image=el("img","pc-icon");
        image.src="/Images/windows-icons/"+id+".svg";
        image.alt="";
        image.draggable=false;
        return image;
    }
    const strokes = {
        home:"M3 11l9-8 9 8m-16-1v11h5v-7h4v7h5V10",
        directory:"M3 7V5a1 1 0 0 1 1-1h6l2 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7zm0 2h18",
        file:"M6 3h8l4 4v14H6z M14 3v5h4 M9 12h6m-6 4h6",
        link:"M10 5H5v15h15v-5 M12 12l8-8m-6 0h6v6",
        executable:"M3 5h18v14H3z M7 10l3 2-3 2m6 0h3",
        back:"M20 12H4m7-7-7 7 7 7",forward:"M4 12h16m-7-7 7 7-7 7",
        up:"M12 20V4m-7 7 7-7 7 7",minimize:"M5 12h14",
        maximize:"M5 5h14v14H5z",restore:"M9 5V3h12v12h-2 M4 8h12v12H4z",
        close:"m5 5 14 14m0-14L5 19"
    };
    function controlIcon(name) { return barGlyph(strokes[name]); }
    function iconButton(parent,name,action,symbol) {
        const b=button(parent,name,action,"");
        b.append(controlIcon(symbol));
        return b;
    }
    function fileIcon(file) {
        return controlIcon(file.node.contents ? "directory" : strokes[file.node.type] ? file.node.type : "file");
    }
    function launcher(parent,id,action,caption=true) {
        const b=button(parent,apps[id],action,""); b.append(icon(id));
        if (caption) b.append(el("span","",apps[id]));
        return b;
    }
    const shortcuts=el("div","pc-shortcuts"), windows=el("div","pc-windows"), fly=el("div","pc-fly"), bar=el("div","pc-bar");
    root.append(shortcuts,windows,fly,bar);
    root.dataset.theme=read("theme") || "light";
    const files=[];
    function index(node,path) {
        for (const [name,child] of Object.entries(node.contents)) {
            const full=path ? path+"/"+name : name;
            files.push({name,path:full,node:child});
            if (child.contents) index(child,full);
        }
    }
    index(FileSystem.root,"");
    const trail = [""];
    let trailIndex = 0;
    const recent = read("recent").split("\n").filter(path => files.some(f => f.path === path)).slice(0,5);
    function remember(file) {
        const i = recent.indexOf(file.path);
        if (i >= 0) recent.splice(i,1);
        recent.unshift(file.path);
        recent.length = Math.min(5,recent.length);
        save("recent",recent.join("\n"));
    }
    function hidePanel() { fly.onkeydown=null;fly.hidden=true; panel=""; }
    function activate(id) {
        hidePanel(); const rec=records.get(id); if (!rec) return;
        rec.win.hidden=false; rec.win.style.zIndex=String(++top); active=id;
        refreshBar(); (rec.body.querySelector("textarea") || rec.win).focus({preventScroll:true});
    }
    function hide(id,close) {
        const rec=records.get(id);
        rec.win.hidden=true;
        if(close) { rec.win.remove(); records.delete(id); }
        const visible=[...records].filter(([,r])=>!r.win.hidden).sort((a,b)=>Number(b[1].win.style.zIndex)-Number(a[1].win.style.zIndex));
        active=""; if(visible.length) activate(visible[0][0]); else refreshBar();
    }
    function show(id) {
        focusCamera();
        if (!records.has(id)) {
            const win=el("section","pc-window"), head=el("div","pc-title"), body=el("div","pc-body");
            win.dataset.app=id; win.tabIndex=-1; win.setAttribute("aria-label",apps[id]);
            win.style.left=(125+records.size*35)+"px"; win.style.top=(45+records.size*30)+"px";
            head.append(icon(id),el("strong","",apps[id]),el("span","pc-spacer"));
            iconButton(head,"Minimize",()=>hide(id,false),"minimize");
            const maximize=()=>{
                const full=win.classList.toggle("pc-max");
                sizeButton.replaceChildren(controlIcon(full?"restore":"maximize"));
            };
            const sizeButton=iconButton(head,"Maximize or restore",maximize,"maximize");
            iconButton(head,"Close window",()=>hide(id,true),"close");
            head.ondblclick=e=>{if(!e.target.closest("button"))maximize();};
            head.onpointerdown=e=>{
                if(e.target.closest("button") || win.classList.contains("pc-max"))return;
                const bounds=root.getBoundingClientRect();
                drag={x:e.clientX,y:e.clientY,left:win.offsetLeft,top:win.offsetTop,sx:root.clientWidth/bounds.width,sy:root.clientHeight/bounds.height};
                head.setPointerCapture(e.pointerId);
            };
            head.onpointermove=e=>{if(drag && head.hasPointerCapture(e.pointerId)){
                win.style.left=Math.max(0,Math.min(root.clientWidth-win.offsetWidth,drag.left+(e.clientX-drag.x)*drag.sx))+"px";
                win.style.top=Math.max(0,Math.min(root.clientHeight-120,drag.top+(e.clientY-drag.y)*drag.sy))+"px";
            }};
            head.onlostpointercapture=()=>{drag=null;};
            win.onpointerdown=()=>{if(active!==id) activate(id); else hidePanel();};
            win.append(head,body); windows.append(win); records.set(id,{win,body,head});
            if(id==="terminal"){
                body.append(el("pre","pc-output"));
                win.onkeydown=e=>{if(e.key!=="Tab" && !e.ctrlKey && !e.metaKey && !e.altKey){e.preventDefault();shellKey(e.key);}};
                win.onwheel=e=>scrollTerminal(e.deltaY);
            }
            if(id==="notes"){
                const editor=el("textarea","pc-editor"); editor.setAttribute("aria-label","Notepad document"); editor.spellcheck=false;
                editor.value=read("note"); editor.oninput=()=>save("note",editor.value); body.append(editor);
            }
            if(id==="explorer") folder(currentPath);
            if(id==="settings"){
                body.append(el("h1","","Personalization"),el("h2","","Choose your mode"));
                for(const theme of ["light","dark"]) button(body,theme+" mode",()=>{root.dataset.theme=theme;save("theme",theme);});
            }
        }
        activate(id);
    }
    function openFile(file) {
        remember(file);
        if(file.node.type==="link"){hidePanel();window.open(file.node.content,"_blank","noopener,noreferrer");return;}
        if(file.node.type==="executable"){show("terminal");for(const key of file.node.content) shellKey(key);shellKey("Enter");return;}
        show("explorer");
        folder(file.path);
    }
    function folder(path) {
        if (trail[trailIndex] !== path) {
            trail.splice(trailIndex+1);
            trail.push(path);
            trailIndex=trail.length-1;
        }
        currentPath=path;
        const body=records.get("explorer").body;
        body.replaceChildren();
        const tools=el("div","pc-address"), layout=el("div","pc-explorer-layout");
        const nav=el("nav","pc-places"), content=el("div","pc-location");
        nav.setAttribute("aria-label","Explorer locations");
        body.append(tools,layout);layout.append(nav,content);
        const travel=step=>folder(trail[trailIndex+=step]);
        iconButton(tools,"Back",()=>travel(-1),"back").disabled=trailIndex===0;
        iconButton(tools,"Forward",()=>travel(1),"forward").disabled=trailIndex===trail.length-1;
        iconButton(tools,"Up one folder",()=>folder(path.split("/").slice(0,-1).join("/")),"up").disabled=!path;
        const crumbs=el("div","pc-crumbs");
        tools.append(crumbs);
        button(crumbs,"Home",()=>folder(""));
        const parts=path.split("/").filter(Boolean);
        parts.forEach((name,i)=>{
            crumbs.append(el("span","","›"));
            button(crumbs,name,()=>folder(parts.slice(0,i+1).join("/")));
        });
        const places=[{name:"Home",path:""},...files.filter(f=>f.node.contents && !f.path.includes("/"))];
        for(const place of places) {
            const b=button(nav,place.name,()=>folder(place.path),"");
            b.append(controlIcon(place.path?"directory":"home"),el("span","",place.name));
            if(place.path===path)b.setAttribute("aria-current","page");
        }
        const item=files.find(f=>f.path===path);
        content.append(el("h2","",item?.name || "Home"));
        if(item && !item.node.contents) {
            content.append(el("pre","pc-file",item.node.content));return;
        }
        const filter=el("input","pc-folder-search");
        filter.type="search";filter.placeholder="Search "+(item?.name || "Home");filter.setAttribute("aria-label",filter.placeholder);
        tools.append(filter);
        const list=el("div","pc-files"), status=el("small","pc-count");
        content.append(list,status);
        function listFiles(){
            const query=filter.value.trim().toLowerCase();
            const matches=files.filter(f=>query
                ? (!path || f.path.startsWith(path+"/")) && f.name.toLowerCase().includes(query)
                : f.path.split("/").slice(0,-1).join("/")===path);
            list.replaceChildren();
            for(const f of matches){
                const b=button(list,f.name,()=>openFile(f),"");
                b.append(fileIcon(f),
                    el("span","",f.name),el("small","",f.node.contents?"File folder":f.node.type==="link"?"Shortcut":f.node.type==="executable"?"Application":"Text document"));
            }
            status.textContent=matches.length===0?"No matching items":matches.length+(matches.length===1?" item":" items");
        }
        filter.oninput=listFiles;listFiles();
    }
    function popup(kind) {
        if(panel===kind && !fly.hidden){hidePanel();return;}
        fly.onkeydown=null;focusCamera();fly.dataset.panel=kind;panel=kind;fly.hidden=false;fly.replaceChildren();
        if(kind==="quick"){
            fly.append(el("h2","","Quick settings"));
            const volume=el("input");volume.type="range";volume.min="0";volume.max="100";
            volume.value=read("volume") || "100";
            const sound=el("label","","Volume");sound.append(volume);fly.append(sound);
            const brightness=el("input");brightness.type="range";brightness.min="45";brightness.max="100";
            brightness.value=read("brightness") || "100";
            const light=el("label","","Brightness");light.append(brightness);fly.append(light);
            volume.oninput=()=>{save("volume",volume.value);applyDisplaySettings();};
            brightness.oninput=()=>{save("brightness",brightness.value);applyDisplaySettings();};
            return;
        }
        if(kind==="calendar"){
            const now=new Date(), first=new Date(now.getFullYear(),now.getMonth(),1), days=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
            fly.append(el("h2","",now.toLocaleDateString(undefined,{month:"long",year:"numeric"})));
            const grid=el("div","pc-calendar"); fly.append(grid);
            for(const day of ["S","M","T","W","T","F","S"])grid.append(el("b","",day));
            for(let i=0;i<first.getDay();i++)grid.append(el("span"));
            for(let i=1;i<=days;i++)grid.append(el("span",i===now.getDate()?"today":"",String(i)));
            return;
        }
        const input=el("input","pc-searchbox");input.type="search";input.placeholder="Search for apps and files";input.setAttribute("aria-label",input.placeholder);
        const filters=el("div","pc-filters"), results=el("div","pc-results");
        fly.append(input,filters,results);
        let category="All", allApps=false;
        for(const name of ["All","Apps","Files"]) {
            button(filters,name,()=>{category=name;search();input.focus();});
        }
        function search(){
            const q=input.value.trim().toLowerCase();
            const searching=kind==="search" || Boolean(q);
            results.replaceChildren();filters.hidden=!searching;
            for(const b of filters.children)b.setAttribute("aria-pressed",String(b.textContent===category));
            const hits=Object.keys(apps).filter(id=>apps[id].toLowerCase().includes(q));
            if(allApps)hits.sort((a,b)=>apps[a].localeCompare(apps[b]));
            if(category!=="Files" && hits.length){
                const header=el("div","pc-section-head");
                header.append(el("h3","",searching?"Apps":allApps?"All apps":"Pinned"));
                if(!searching)button(header,allApps?"Back to pinned":"All apps",()=>{allApps=!allApps;search();},allApps?"‹  Back":"All apps  ›");
                const pins=el("div",allApps&&!searching?"pc-applist":"pc-pins");
                results.append(header,pins);
                for(const id of hits)launcher(pins,id,()=>show(id));
            }
            const suggested=[...new Set([...recent,"profile.txt","projects"])].slice(0,4);
            const matches=q?files.filter(f=>f.path.toLowerCase().includes(q)):suggested.map(path=>files.find(f=>f.path===path)).filter(Boolean);
            if(category!=="Apps" && matches.length && (searching || !allApps)){
                results.append(el("h3","",q?"Files and folders":"Recommended"));
                for(const f of matches){
                    const row=button(results,f.path,()=>openFile(f),"");row.className="pc-result";
                    row.append(fileIcon(f),el("span","",f.name),
                        el("small","",q?(f.path.split("/").slice(0,-1).join(" / ") || "Home"):recent.includes(f.path)?"Recently opened":"Guest"));
                }
            }
            if(!results.childElementCount)results.append(el("p","","No results for “"+input.value+"”"));
        }
        input.oninput=search;
        fly.onkeydown=e=>{
            const options=[...results.querySelectorAll("button")];
            if(e.key==="Enter" && e.target===input){options.find(b=>!b.closest(".pc-section-head"))?.click();return;}
            if(!["ArrowDown","ArrowUp"].includes(e.key) || !options.length)return;
            e.preventDefault();
            const i=options.indexOf(document.activeElement);
            options[(i+(e.key==="ArrowDown"?1:-1)+options.length)%options.length].focus();
        };
        search();input.focus({preventScroll:true});
    }
    const speaker = el("span","pc-speaker");
    function barGlyph(path) {
        const ns="http://www.w3.org/2000/svg";
        const svg=document.createElementNS(ns,"svg"), line=document.createElementNS(ns,"path");
        svg.setAttribute("viewBox","0 0 24 24");
        svg.setAttribute("class","pc-glyph");
        svg.setAttribute("aria-hidden","true");
        line.setAttribute("d",path);
        svg.append(line);
        return svg;
    }
    function updateSpeaker(level) {
        const cone="M3 9h4l5-4v14l-5-4H3z";
        const waves=level===0 ? "M16 9l5 6m0-6-5 6" : level<.5
            ? "M15 9q3 3 0 6" : "M15 9q3 3 0 6m3-9q6 6 0 12";
        speaker.replaceChildren(barGlyph(cone+" "+waves));
        speaker.parentElement?.setAttribute("title",level===0?"Muted · Quick settings":"Volume "+Math.round(level*100)+"% · Quick settings");
    }
    function refreshBar(){
        const dock=el("div","pc-dock"), tray=el("div","pc-status");
        bar.replaceChildren(dock,tray);
        const start=button(dock,"Start",()=>popup("start"),"");start.append(el("i","pc-start"));
        const search=button(dock,"Search",()=>popup("search"),"");
        search.className="pc-searchpill";
        search.append(barGlyph("M20 20l-5.2-5.2 M17 10a7 7 0 1 1-14 0 7 7 0 1 1 14 0"),el("span","","Search"));
        for(const id of Object.keys(apps)){
            const b=launcher(dock,id,()=>active===id?hide(id,false):show(id),false);
            b.dataset.running=String(records.has(id));b.dataset.active=String(active===id);
        }
        const quick=button(tray,"Quick settings",()=>popup("quick"),"");
        quick.className="pc-tray";quick.append(speaker);
        updateSpeaker(Number(read("volume") || 100)/100);
        const now=new Date();button(tray,"Date and time",()=>popup("calendar"),now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})+"\n"+now.toLocaleDateString()).className="pc-clock";
    }
    for(const id of ["explorer","terminal","notes"])launcher(shortcuts,id,()=>show(id));
    function applyDisplaySettings() {
        root.style.filter="brightness("+(Number(read("brightness") || 100)/100)+")";
        const volume=Number(read("volume") || 100)/100;
        updateSpeaker(volume);
        for(const [id,gain] of [["ComputerBoot",.5],["ComputerAmbient",.25],["KeyboardPressed",1]]) {
            const audio=document.getElementById(id);if(audio)audio.volume=volume*gain;
        }
    }
    applyDisplaySettings();
    root.addEventListener("keydown",e=>{
        if(e.key==="Escape" && panel){hidePanel();root.focus();}
        if(e.ctrlKey && e.code==="Space"){e.preventDefault();popup("search");}
        if(e.target===root && !panel && e.key.length===1 && !e.ctrlKey && !e.metaKey){
            e.preventDefault();popup("search");const input=fly.querySelector("input");input.value=e.key;input.oninput();
        }
    });
    root.onpointerdown=e=>{if(e.target===root || e.target===windows)hidePanel();};
    hidePanel();refreshBar();
    setInterval(()=>{const b=bar.querySelector(".pc-clock");const now=new Date();b.textContent=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})+"\n"+now.toLocaleDateString();},30000);
    return {show, search:()=>popup("search"), get shellVisible(){return records.has("terminal") && !records.get("terminal").win.hidden;},
        updateShell(text){const out=records.get("terminal")?.body.firstChild;if(out && out.textContent!==text)out.textContent=text;}};
}
