/* Reading progress, table of contents, heading anchors, code copy buttons, tag filters */
(function(){
  const bar=document.getElementById("progress");
  const upd=()=>{const m=document.documentElement.scrollHeight-innerHeight;bar.style.transform=`scaleX(${m>0?scrollY/m:0})`};
  addEventListener("scroll",upd,{passive:true});upd();

  const md=document.querySelector(".post .md");
  if(md){
    const hs=[...md.querySelectorAll("h2[id],h3[id]")];
    hs.forEach(h=>{const a=document.createElement("a");a.className="anchor";a.href="#"+h.id;a.textContent="#";a.setAttribute("aria-label","Lien vers cette section");h.appendChild(a)});
    const toc=document.getElementById("toc");
    if(toc&&hs.length>=3){const ol=toc.querySelector("ol");
      hs.forEach(h=>{const li=document.createElement("li");if(h.tagName==="H3")li.className="l3";const a=document.createElement("a");a.href="#"+h.id;a.textContent=h.firstChild.textContent;li.appendChild(a);ol.appendChild(li)});
      toc.hidden=false}
    md.querySelectorAll("pre").forEach(pre=>{const b=document.createElement("button");b.type="button";b.className="copy";b.textContent="copier";
      b.onclick=async()=>{try{await navigator.clipboard.writeText(pre.innerText.replace(/copier$|copié ✓$/,"").trim());b.textContent="copié ✓"}catch(e){b.textContent="échec"}setTimeout(()=>b.textContent="copier",1500)};pre.appendChild(b)});
  }

  const f=document.getElementById("filters");
  if(f){const cards=[...document.querySelectorAll("#list .card")];
    const apply=t=>{f.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.tag===t));
      cards.forEach(c=>c.classList.toggle("hide",!!t&&!c.dataset.tags.split(" ").includes(t)))};
    f.addEventListener("click",e=>{const b=e.target.closest("button");if(b)apply(b.dataset.tag)});
    const h=decodeURIComponent(location.hash.slice(1));if(h)apply(h);
  }
})();
