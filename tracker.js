let mouseMovements=[];

document.addEventListener("mousemove",(e)=>{
    mouseMovements.push({
        x:e.clientX,
        y:e.clientY,
        time:Date.now()
    })
})
let clicks=[];
document.addEventListener("click",(e)=>{
    clicks.push(Date.now());
});

let keyStrokes=[];
document.addEventListener("keydown",(e)=>{
    keyStrokes.push({
        time:Date.now(),
        key:e.key
    });
});
let scrolls = [];

document.addEventListener("scroll", () => {
    scrolls.push({
        y: window.scrollY,
        time: Date.now()
    });
});
function safe(value) {
    if (isNaN(value) || !isFinite(value)) return 0;
    return value;
}
function calculateFeatures(){

    let speeds = [];
    for (let i = 1; i < mouseMovements.length; i++) {
        const dx = mouseMovements[i].x - mouseMovements[i-1].x;
        const dy = mouseMovements[i].y - mouseMovements[i-1].y;
        const dt = (mouseMovements[i].time - mouseMovements[i-1].time) / 1000; // seconds
        if (dt > 0) {
            speeds.push(Math.sqrt(dx*dx + dy*dy) / dt);
        }
    }
    let avg_mouse_speed = speeds.length
        ? speeds.reduce((a,b)=>a+b,0) / speeds.length
        : 0;
   
    let mouse_speed_variance = speeds.length
        ? speeds.reduce((sum, s) => sum + Math.pow(s - avg_mouse_speed, 2), 0) / speeds.length
        : 0;
 
    let clickIntervals = [];
    for (let i = 1; i < clicks.length; i++) {
        clickIntervals.push((clicks[i] - clicks[i-1]) / 1000); // ms → s
    }
    let click_interval_avg = clickIntervals.length
        ? clickIntervals.reduce((a,b)=>a+b,0) / clickIntervals.length
        : 0;
    let click_interval_variance = clickIntervals.length
        ? clickIntervals.reduce((sum, c) => sum + Math.pow(c - click_interval_avg, 2), 0) / clickIntervals.length
        : 0;


    let typeIntervals=[];
    for(let i=1;i<keyStrokes.length;i++){
        typeIntervals.push((keyStrokes[i].time-keyStrokes[i-1].time) / 1000); // ms → s
    }
    let typing_avg_delay = typeIntervals.length
        ? typeIntervals.reduce((a,b)=>a+b,0) / typeIntervals.length
        : 0;
    let typing_variance = typeIntervals.length
        ? typeIntervals.reduce((sum, t) => sum + Math.pow(t - typing_avg_delay, 2), 0) / typeIntervals.length
        : 0;

    let backspace_count=keyStrokes.filter((k)=>k.key==="Backspace").length;

    let scrollSpeeds = [];
    for (let i = 1; i < scrolls.length; i++) {
        const dy = Math.abs(scrolls[i].y - scrolls[i-1].y);
        const dt = (scrolls[i].time - scrolls[i-1].time) / 1000; 
        if (dt > 0) {
            scrollSpeeds.push(dy / dt);
        }
    }
    let scroll_speed = scrollSpeeds.length
        ? scrollSpeeds.reduce((a,b)=>a+b,0) / scrollSpeeds.length
        : 0;

    let hesitation_time = 0;
    for (let i = 1; i < mouseMovements.length; i++) {
        let dt = mouseMovements[i].time - mouseMovements[i-1].time; 
        if (dt > 1000) {
            hesitation_time += dt / 1000; 
        }
    }

    let session_duration_ms = mouseMovements.length>0
        ? mouseMovements[mouseMovements.length-1].time - mouseMovements[0].time
        : 0;
    let session_duration = session_duration_ms / 1000; 

    let total_actions = clicks.length + keyStrokes.length;

    let actions_per_second = session_duration > 0
    ? total_actions / session_duration
    : 0;

    // ── Idle ratio 
    let idle_time=0;
    for(let i=1;i<mouseMovements.length;i++){
        let dt=mouseMovements[i].time-mouseMovements[i-1].time;
        if(dt>1000){
            idle_time+=dt;
        }
    }
    let idle_ratio = session_duration_ms > 0 ? idle_time / session_duration_ms : 0;

    // ── Curvature score ─
    let curvature=0;
    for(let i=2;i<mouseMovements.length;i++){
        let a=mouseMovements[i-2];
        let b=mouseMovements[i-1];
        let c=mouseMovements[i];
        let dx1=b.x-a.x;
        let dy1=b.y-a.y;
        let dx2=c.x-b.x;
        let dy2=c.y-b.y;
        let angle=Math.atan2(dy1,dx1)-Math.atan2(dy2,dx2);
        curvature+=Math.abs(angle);
    }
    let curvature_score=mouseMovements.length>2?curvature/(mouseMovements.length-2):0;

    return {
        avg_mouse_speed: safe(avg_mouse_speed),
        mouse_speed_variance: safe(mouse_speed_variance),
        click_interval_avg: safe(click_interval_avg),
        click_interval_variance: safe(click_interval_variance),
        typing_avg_delay: safe(typing_avg_delay),
        typing_variance: safe(typing_variance),
        backspace_count: backspace_count || 0,
        scroll_speed: safe(scroll_speed),
        hesitation_time: safe(hesitation_time),
        session_duration: safe(session_duration),
        actions_per_second: safe(actions_per_second),
        idle_ratio: safe(idle_ratio),
        curvature_score: safe(curvature_score)
    };
}
async function sendData(){
    const features=calculateFeatures();

    const response=await fetch("http://127.0.0.1:8000/predict",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(features)
    });
    const result=await response.json();
    console.log("Features being sent:", features);
    console.log("Prediction:",result);  
}


//setTimeout(sendData,5000);