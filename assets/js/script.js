let terminal = document.querySelector(".terminal"), navbar = terminal.querySelector(".navbar");
let promptZone = document.querySelector(".prompt-zone");
let isDragging = false
let offset = {x: 0, y: 0}
let lastSize = {w: "50%", h: "40%"}
let aligned = false;


let helpText = "";
Manual.forEach(man =>
    {
        let tempTxt = man[0] + "    =   " + man[1] + "<br>";
        helpText += tempTxt;
    })
let pointerToLastCommand = 0

let documentPointer = "root"
let dirlocal = FolderStructure.filter(item => item[0] == documentPointer)
let pointerParent = null
let addrToPrint = "root"

let lastCommands = []
let validcommands = ["man", "start", "whoami", "cd", "ls", "exit", "pwd", "mkdir"];
let cmdSet = []

let cmdpointer = null
window.addEventListener("DOMContentLoaded",()=>{
    terminal.style.height = lastSize.h, terminal.style.width = lastSize.w
    refreshCommandSet();
    cmdpointer.children[1].focus()
})
navbar.addEventListener("mousedown",(ev)=>{
    isDragging = true;
    offset.x = ev.clientX  - terminal.getBoundingClientRect().left, offset.y = ev.clientY  - terminal.getBoundingClientRect().top;
    if(aligned){
        if((lastSize.h == "100%" && lastSize.w == "50%") || (lastSize.h == "100%" && lastSize.w == "100%")){
            lastSize.h = "50%", lastSize.w = "45%"
            terminal.style.left = ((Number(window.getComputedStyle(document.body).width.split("px")[0]) - Number(terminal.style.width.split("px")[0]))/2) + "px"
            terminal.style.height = lastSize.h, terminal.style.width = lastSize.w
        }else{
            terminal.style.height = lastSize.h, terminal.style.width = lastSize.w
            }
            aligned = false
        }
    })

    document.addEventListener("mousemove",(ev)=>{
        if(isDragging){
            terminal.style.left = (ev.clientX - offset.x) + "px", terminal.style.top = (ev.clientY - offset.y) + "px";
        terminal.style.position = "absolute";
        if(terminal.style.left < "-49px"){
            lastSize.w = window.getComputedStyle(terminal).width,lastSize.h = window.getComputedStyle(terminal).height
            terminal.style.height = "100%";
            terminal.style.width = "50%";
            terminal.style.left = "0", terminal.style.top = "0";
            isDragging = false;
            aligned = true
        }
        else if(terminal.getBoundingClientRect().right - 50 > Number(window.getComputedStyle(document.body).width.split("px")[0])){
            lastSize.w = window.getComputedStyle(terminal).width,lastSize.h = window.getComputedStyle(terminal).height
            terminal.style.height = "100%";
            terminal.style.width = "50%";
            terminal.style.left = "50%", terminal.style.top = "0";
            isDragging = false;
            aligned = true
        }
        else if(terminal.getBoundingClientRect().top < -30){
            lastSize.w = window.getComputedStyle(terminal).width,lastSize.h = window.getComputedStyle(terminal).height
            terminal.style.height = "100%";
            terminal.style.width = "100%";
            terminal.style.left = "0%", terminal.style.top = "0";
            isDragging = false;
            aligned = true
        }
        else{
            document.body.style.border = "none";
        }
    }
})
document.addEventListener("mouseup",(ev)=>{
    isDragging = false;
})

let controls = document.querySelectorAll(".controls span.navbtn")


controls[0].addEventListener("click",(ev)=>{
    terminal.classList.toggle("minimized");
    if(terminal.classList.contains("minimized")){
        terminal.style.height = "40px", terminal.style.width = "400px"
        if(terminal.classList.contains("maximised")){
            terminal.classList.remove("maximised");
        }
    }else{
        terminal.style.height = lastSize.h, terminal.style.width = lastSize.w
    }
})

controls[1].addEventListener("click",()=>{
    if(!terminal.classList.contains("maximised")){
        terminal.classList.add("maximised");
        if(terminal.classList.contains("minimized")){
            terminal.classList.remove("minimized");
        }
        terminal.style.height = "100%";
        terminal.style.width = "100%";
        terminal.style.left = "0%", terminal.style.top = "0";
        aligned = true
    }else{
        terminal.classList.remove("maximised");
        terminal.style.height = lastSize.h, terminal.style.width = lastSize.w;
        terminal.style.left = ((Number(window.getComputedStyle(document.body).width.split("px")[0]) - Number(terminal.style.width.split("px")[0].split("%")[0]))/2) + "px"
        // terminal.style.left = "0%", terminal.style.top = "0";
        aligned = true
    }
})

controls[2].addEventListener("click",()=>{
    window.close()
    document.close()
})

document.addEventListener("keydown",(event)=>{
    if(event.key == "Enter"){
        if(cmdpointer != null) cmdpointer.children[2].innerText = cmdpointer.children[1].value;
        let temp = cmdpointer.children[1].value.toLowerCase();
        lastCommands.push(temp);
        console.log(lastCommands)
        cmdpointer.removeChild(cmdpointer.children[1])
        evaluateCommand(temp);
        promptZone.innerHTML += '<div class="command"><span class="prompt">visitor@hesed.terminal:~$  </span><input type="text"><span class="done"></span></div>';
        refreshCommandSet()
        cmdpointer.children[1].focus()
    }
    else if(event.key == "ArrowUp"){
        cmdpointer.children[1].value = lastCommands[lastCommands.length - 1 - pointerToLastCommand] == undefined ? "" : lastCommands[lastCommands.length - 1 - pointerToLastCommand];
        console.log(lastCommands.length - 1 - pointerToLastCommand)
        cmdpointer.children[1].focus();
        if(lastCommands.length - 1 - pointerToLastCommand >= 1) {
            pointerToLastCommand += 1;
        }
    }
    else if(event.key == "ArrowDown"){
        cmdpointer.children[1].value = lastCommands[lastCommands.length - 1 - pointerToLastCommand] == undefined ? "" : lastCommands[lastCommands.length - 1 - pointerToLastCommand];
        console.log(lastCommands.length - 1 - pointerToLastCommand)
        cmdpointer.children[1].focus();
        if(lastCommands.length - 1 - pointerToLastCommand < lastCommands.length - 1) {
            pointerToLastCommand -= 1;
        }
        
    }
    console.log(event.key)
})

function refreshCommandSet(){
    cmdSet = document.querySelectorAll(".command");
    cmdpointer = cmdSet[cmdSet.length - 1] 
}


function evaluateCommand(data){
    function validateCommand(data){
        return validcommands.includes(data.split(" ")[0])
    }
    if(!validateCommand(data)){
        promptZone.innerHTML += '<div class="execution">"<i>' + data + '</i>" is not recognized as an internal or extrernal command</div>';
     }
     else{
         switch(data.split(" ")[0]){
             case "man":
                 if(data.split(" ")[1] == undefined){
                     promptZone.innerHTML += '<div class="execution">' + helpText + '</div>';
                    } else if(validcommands.find(item => item == data.split(" ")[1]) != undefined){
                        let CommandText = Manual.find(item => item[0] == data.split(" ")[1]);
                        let cmdHelp = CommandText == undefined ? "Can't get help for this command" :
                        CommandText[0] + "    =   " + CommandText[1];
                        promptZone.innerHTML += '<div class="execution">' + cmdHelp + '</div>';
                }
                break;
            case "mkdir":
                let tempDirCreated = []
                tempDirCreated[0] = documentPointer;
                if(data.split(" ")[1] == undefined){
                    let CommandText = Manual.find(item => item[0] == "mkdir");
                    let cmdHelp = CommandText == undefined ? "Can't get help for this command" :
                    CommandText[0] + "    =   " + CommandText[1];
                    promptZone.innerHTML += '<div class="execution">' + cmdHelp + '</div>';
                }else{
                    tempDirCreated[1] = data.split(" ")[1];
                    console.log(tempDirCreated);
                    // if(localStorage.getItem("dirptr") == null) 
                    // {
                    //     localStorage.setItem("dirptr", 0)
                    // }else{
                    //     localStorage.setItem("dirptr", Number(localStorage.getItem("dirptr")) + 1);
                    // }
                    localStorage.setItem("dir" + String(localStorage.getItem("dirptr")), tempDirCreated);
                    FolderStructure.push(tempDirCreated);
                    evaluateCommand("ls")
                    console.log(tempDirCreated, localStorage.getItem("dirptr"));
                }
                break;
            case "cd":
               if(data.split(" ")[1] == ".."){
                    if(documentPointer == "root"){
                        documentPointer = "root"
                    }else{
                        documentPointer = FolderStructure.find(item => item[1] == documentPointer)[0]
                        addrToPrint = addrToPrint.split("/")
                        addrToPrint.pop()
                        addrToPrint.toString()
                        console.log(addrToPrint)
                    }
                    dirlocal = FolderStructure.filter(item => item[0] == documentPointer)
               }
               else if(data.split(" ")[1] ==undefined){
                    null
               }
               else{
                    const isValidFolder = dirlocal.some(([parent, child]) => {
                        return parent === documentPointer && child === data.split(" ")[1]
                    })
                    if(!isValidFolder) {
                        promptZone.innerHTML += '<div class="execution">"<i>' + data.split(" ")[1] + '</i>" directory is not found.</div>';
                    }else{
                        let addr = []
                        documentPointer = data.split(" ")[1]
                        dirlocal = FolderStructure.filter(item => item[0] == documentPointer)
                        let tempPtr = documentPointer
                        while(tempPtr != "root"){
                            pointerParent = FolderStructure.find(item => item[1] == tempPtr)
                            tempPtr = pointerParent[0]
                            addr.push(pointerParent[1]);
                        }
                        addr.push("root")
                        console.log(dirlocal, addr)
                        if(cmdpointer != null){
                        addrToPrint = addr.reverse().toString().replaceAll(',','/');
                        }
                        
                    }
               }
               
                break;
            case "pwd":
                promptZone.innerHTML += '<div class="execution">' + addrToPrint + '</div>';
                break;    
            case "ls":
                let listTxt = []
                let lsdir = FolderStructure.filter(item => (item[0] == documentPointer))   
                lsdir.forEach(dir => {
                    listTxt.push(dir[1])
                });
                console.log(listTxt.length, listTxt)
                listTxt = listTxt == [''] ? ".." : listTxt.toString().replaceAll(',','  |   ');
                promptZone.innerHTML += '<br><div class="execution blue">' + listTxt + '</div><br>';
                break;
        }
        // NAVIGATION MODULE

     }
}