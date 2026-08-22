const navbar=document.getElementById("navbar");
    const hero=document.getElementById("hero");
    const heroContent=document.querySelector(".hero-content");
    const titleTop=document.querySelector(".hero-title-top");
    const titleBottom=document.querySelector(".hero-title-bottom");
    const glow=document.querySelector(".cursor-glow");

    window.addEventListener("scroll",()=>{
      navbar.classList.toggle("scrolled",window.scrollY>50);

      const p=Math.min(window.scrollY/window.innerHeight,1);
      titleTop.style.transform=`translate3d(0,${-p*72}px,0)`;
      titleTop.style.opacity=String(1-p*.45);

      titleBottom.style.transform=`translate3d(${p*42}px,${-p*34}px,0)`;
      titleBottom.style.opacity=String(1-p*.12);
    });

    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.style.opacity="1";
          entry.target.style.transform="translateY(0)";
        }
      });
    },{threshold:.15});

    document.querySelectorAll(".service,.project,.process-row").forEach(el=>{
      el.style.opacity="0";
      el.style.transform="translateY(40px)";
      el.style.transition="opacity .8s ease,transform .8s ease";
      observer.observe(el);
    });

    document.querySelectorAll(".service").forEach(card=>{
      card.addEventListener("mousemove",e=>{
        const r=card.getBoundingClientRect();
        card.style.setProperty("--mx",`${e.clientX-r.left}px`);
        card.style.setProperty("--my",`${e.clientY-r.top}px`);
      });
    });

    document.querySelectorAll(".project").forEach(card=>{
      card.addEventListener("mousemove",e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(1000px) rotateX(${y*-1.2}deg) rotateY(${x*1.5}deg)`;
      });

      card.addEventListener("mouseleave",()=>{
        card.style.transform="perspective(1000px) rotateX(0deg) rotateY(0deg)";
      });
    });

    const processTrack=document.querySelector(".process-track");
    const processProgress=document.querySelector(".process-progress");
    const processSteps=[...document.querySelectorAll(".process-step")];

    function updateProcess(){
      if(!processTrack) return;
      const r=processTrack.getBoundingClientRect();
      const vh=window.innerHeight;
      const raw=(vh*.72-r.top)/(r.height*.78);
      const progress=Math.max(0,Math.min(1,raw));

      processProgress.style.width=`${progress*100}%`;

      processSteps.forEach((step,i)=>{
        const threshold=(i+1)/processSteps.length-.16;
        if(progress>=threshold) step.classList.add("active");
        else step.classList.remove("active");
      });
    }

    window.addEventListener("scroll",updateProcess);
    updateProcess();

    let mouseX=innerWidth/2,mouseY=innerHeight/2,glowX=mouseX,glowY=mouseY;

    document.addEventListener("mousemove",e=>{
      mouseX=e.clientX;
      mouseY=e.clientY;
    });

    function animateGlow(){
      glowX+=(mouseX-glowX)*.08;
      glowY+=(mouseY-glowY)*.08;
      glow.style.left=glowX+"px";
      glow.style.top=glowY+"px";
      requestAnimationFrame(animateGlow);
    }
    animateGlow();

    hero.addEventListener("mousemove",e=>{
      const x=e.clientX/innerWidth-.5;
      const y=e.clientY/innerHeight-.5;
      heroContent.style.transform=`translate3d(${x*5}px,${y*3}px,0)`;
    });

    hero.addEventListener("mouseleave",()=>{
      heroContent.style.transform="translate3d(0,0,0)";
    });

    const menuToggle=document.getElementById("menuToggle");
    const navLinks=document.getElementById("navLinks");

    menuToggle?.addEventListener("click",()=>{
      navLinks.classList.toggle("open");
      menuToggle.textContent=navLinks.classList.contains("open") ? "×" : "☰";
    });

    navLinks?.querySelectorAll("a").forEach(link=>{
      link.addEventListener("click",()=>{
        navLinks.classList.remove("open");
        if(menuToggle) menuToggle.textContent="☰";
      });
    });

    document.querySelectorAll(".faq-item").forEach(item=>{
      const button=item.querySelector(".faq-question");
      const answer=item.querySelector(".faq-answer");

      button.addEventListener("click",()=>{
        const isOpen=item.classList.contains("open");

        document.querySelectorAll(".faq-item.open").forEach(openItem=>{
          openItem.classList.remove("open");
          openItem.querySelector(".faq-answer").style.maxHeight=null;
        });

        if(!isOpen){
          item.classList.add("open");
          answer.style.maxHeight=answer.scrollHeight+"px";
        }
      });
    });

    const projectForm=document.getElementById("projectForm");
    const formStatus=document.getElementById("formStatus");
    const whatsappButton=document.getElementById("whatsappButton");
    const copyButton=document.getElementById("copyButton");

    // Replace this later with the studio WhatsApp number including country code, digits only.
    const STUDIO_WHATSAPP="";

    function buildEnquiry(){
      const name=document.getElementById("clientName").value.trim();
      const business=document.getElementById("businessName").value.trim();
      const type=document.getElementById("projectType").value;
      const budget=document.getElementById("budget").value;
      const message=document.getElementById("projectMessage").value.trim();

      return [
        "AURIFT° — New Project Enquiry",
        "",
        `Name: ${name || "-"}`,
        `Business: ${business || "-"}`,
        `Project: ${type || "-"}`,
        `Budget: ${budget || "-"}`,
        `Details: ${message || "-"}`
      ].join("\n");
    }

    projectForm?.addEventListener("submit",e=>{
      e.preventDefault();

      if(!projectForm.reportValidity()) return;

      formStatus.textContent="Enquiry prepared. Use WhatsApp or Copy Enquiry below.";
    });

    whatsappButton?.addEventListener("click",()=>{
      if(!projectForm.reportValidity()) return;

      if(!STUDIO_WHATSAPP){
        formStatus.textContent="WhatsApp number has not been connected yet. Use Copy Enquiry for now.";
        return;
      }

      const url=`https://wa.me/${STUDIO_WHATSAPP}?text=${encodeURIComponent(buildEnquiry())}`;
      window.open(url,"_blank","noopener");
    });

    copyButton?.addEventListener("click",async()=>{
      if(!projectForm.reportValidity()) return;

      try{
        await navigator.clipboard.writeText(buildEnquiry());
        formStatus.textContent="Project enquiry copied.";
      }catch{
        formStatus.textContent="Copy was blocked by the browser. Select and copy the form details manually.";
      }
    });


    // AURIFT V8 cinematic interaction layer
    const cinemaDot=document.querySelector(".cinema-dot");
    let dotX=innerWidth/2,dotY=innerHeight/2,dotTX=dotX,dotTY=dotY;

    document.addEventListener("mousemove",e=>{
      dotTX=e.clientX;
      dotTY=e.clientY;
    });

    function moveCinemaDot(){
      dotX+=(dotTX-dotX)*.22;
      dotY+=(dotTY-dotY)*.22;
      if(cinemaDot){
        cinemaDot.style.left=dotX+"px";
        cinemaDot.style.top=dotY+"px";
      }
      requestAnimationFrame(moveCinemaDot);
    }
    moveCinemaDot();

    const shiftStage=document.getElementById("shift-stage");
    const shiftLines=[...document.querySelectorAll(".shift-line")];
    const shiftMeter=document.getElementById("shiftMeter");

    function updateShiftStage(){
      if(!shiftStage)return;

      const r=shiftStage.getBoundingClientRect();
      const travel=Math.max(1,r.height-window.innerHeight);
      const progress=Math.max(0,Math.min(1,-r.top/travel));

      if(shiftMeter)shiftMeter.style.width=(progress*100)+"%";

      shiftLines.forEach((line,i)=>{
        const start=i*.25;
        const end=start+.42;
        const local=Math.max(0,Math.min(1,(progress-start)/(end-start)));

        line.classList.toggle("active",local>.2);
        line.style.transform=`translate3d(${(1-local)*28}px,${(1-local)*18}px,0)`;
        line.style.opacity=String(.28+local*.72);
      });
    }

    window.addEventListener("scroll",updateShiftStage,{passive:true});
    updateShiftStage();

    const cinemaObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add("in");
          cinemaObserver.unobserve(entry.target);
        }
      });
    },{threshold:.12});

    document.querySelectorAll(
      ".services-intro,.service,.work-head,.project,.process-head,.process-step,.pricing-head,.price-card,.faq-head,.faq-item,.contact-grid"
    ).forEach(el=>{
      el.classList.add("reveal-cinema");
      cinemaObserver.observe(el);
    });

    // stronger project depth on desktop, disabled on touch/mobile
    if(matchMedia("(pointer:fine)").matches){
      document.querySelectorAll(".project").forEach(card=>{
        card.addEventListener("mousemove",e=>{
          const r=card.getBoundingClientRect();
          const x=(e.clientX-r.left)/r.width-.5;
          const y=(e.clientY-r.top)/r.height-.5;
          card.style.transform=`perspective(1400px) rotateX(${y*-1.5}deg) rotateY(${x*1.8}deg)`;
        });
        card.addEventListener("mouseleave",()=>{
          card.style.transform="perspective(1400px) rotateX(0deg) rotateY(0deg)";
        });
      });
    }
