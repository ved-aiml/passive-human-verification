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
        const dt = mouseMovements[i].time - mouseMovements[i-1].time;
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
        clickIntervals.push(clicks[i] - clicks[i-1]);
    }

    let click_interval_avg = clickIntervals.length
        ? clickIntervals.reduce((a,b)=>a+b,0) / clickIntervals.length
    : 0;

    let click_interval_variance = clickIntervals.length
        ? clickIntervals.reduce((sum, c) => sum + Math.pow(c - click_interval_avg, 2), 0) / clickIntervals.length
        : 0;
    let typeIntervals=[];

    for(let i=1;i<keyStrokes.length;i++){
        typeIntervals.push(keyStrokes[i]-keyStrokes[i-1]);
    }
    let typing_avg_delay = typeIntervals.length
    ? typeIntervals.reduce((a,b)=>a+b,0) / typeIntervals.length
    : 0;

    let typing_variance = typeIntervals.length
        ? typeIntervals.reduce((sum, t) => sum + Math.pow(t - typing_avg_delay, 2), 0) / typeIntervals.length
        : 0;

    let backspace_count=keyStrokes.filter((key)=>key==="Backspace").length;

    let scrollSpeeds = [];
    for (let i = 1; i < scrolls.length; i++) {
        const dy = Math.abs(scrolls[i].y - scrolls[i-1].y);
        const dt = scrolls[i].time - scrolls[i-1].time;
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
            hesitation_time += dt;
        }
    }
    let session_duration=mouseMovements.length>0?mouseMovements[mouseMovements.length-1].time-mouseMovements[0].time:0;

    let actions_per_second = session_duration > 0
    ? mouseMovements.length / (session_duration / 1000)
    : 0;

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
    actions_per_second: safe(actions_per_second)
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
    if(result.prediction===0){
        document.body.style.backgroundColor="red";
    }
    else{
        document.body.style.backgroundColor="green";
    }
}

//setTimeout(sendData,5000);