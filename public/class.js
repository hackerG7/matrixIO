class Button{
    constructor(str="Button",x,y,w=20,h=20,update=function(){}){
        this.x = x;
        this.y = y ;
        this.width = w;
        this.height =h;
        this.str =str;
        this.button = createButton(str);
        this.button.position(x,y)
        this.button.size(w,h)
        this.css = {
            "background-color": "aqua",
            "border": "2px solid white",
            "border-radius":"9px",
            color: "black",
            padding: "16px 32px",
            "text-align": "center",
            "font-size": "16px",
            margin: "4px 2px",
            opacity: "0.8",
            transition: "0.3s",
        }
        for(let option in this.css){
            this.button.style(option,this.css[option])
        }
        function onTop(){
            this.style("opacity","1")
        }
        function onBottom(){
            this.style("opacity","0.8")
        }
        this.button.mouseOver(onTop).mouseOut(onBottom);
        this.button.master = this;
        /*
        this.button.style("border", "2px solid white")
        this.button.style("border-radius","9px")
        this.button.style('font-size', '30px');
        this.button.style("color","white")
        this.button.style('background-color', "black");*/
        this.update = update
        buttonList.push(this)
    }
    set_css(css){
        this.css = css;
        for(let option in this.css){
            this.button.style(option,this.css[option])
        }
    }
    position(x,y){
        this.x = x;
        this.y = y;
        this.button.position(x,y)
    }
    size(w,h){
        this.width = w;
        this.height = h;
        this.button.size(w,h)
    }
}
class Input{
    constructor(str="input",x,y,w=20,h=20,update=function(){}){
        this.x = x;
        this.y = y ;
        this.width = w;
        this.height = h;
        this.str = str;
        this.input = createInput(str);
        this.input.position(x,y)
        this.input.size(w,h)
        this.css = {
            "background-color": "lime",
            "border": "2px solid white",
            "border-radius":"9px",
            color: "black",
            padding: "16px 32px",
            "text-align": "center",
            "font-size": "16px",
            margin: "4px 2px",
            opacity: "0.8",
            transition: "0.3s",
        }
        for(let option in this.css){
            this.input.style(option,this.css[option])
        }
        function onTop(){
            this.style("opacity","1")
        }
        function onBottom(){
            this.style("opacity","0.8")
        }
        this.input.mouseOver(onTop).mouseOut(onBottom);
        this.update = update
        inputList.push(this)
    }
    position(x,y){
        this.x = x;
        this.y = y;
        this.input.position(x,y)
    }
    size(w,h){
        this.width = w;
        this.height = h;
        this.input.size(w,h)
    }
}
class Player{
    constructor(name="tester",id,x,y){
        this.name = name;
        this.id = id;
        this.playing = false;
        this.realX = x;
        this.realY = y;
        this.x = x;
        this.y = y;
        this.direction = 0;
        this.faceDir = 0;
        this.power = 0;
        this.speed = 0;
        this.matrix_array = [];
        playerList.push(this)
    }
    add_matrix(val,life=5,attackDamage=1){
        for(var i = 0 ; i < val ; i++){
            var l = pow(this.matrix_array.length*2,0.8);
            var randomX = irandom(-l,l)
            var randomY = irandom(-l,l)
            var m = Bodies.circle(this.x+randomX,this.y+randomY,5)
            m.master = this;
            m.life = life;
            m.damage = attackDamage;
            m.index = this.matrix_array.length;
            World.add(world,m)
            this.matrix_array.push(m)
        }
    }
    update(){
        //clamp position;
        this.x = clamp(this.x,0,value.scene_width)
        this.y = clamp(this.y,0,value.scene_height)
        //movement  
        for(var m of this.matrix_array){
            var mx = m.position.x;
            var my = m.position.y;
            //console.log(mx,my,this.x,this.y)
            var d = point_direction(mx,my,this.x,this.y)
            var dis = point_distance(mx,my,this.x,this.y)
            var repair_speed = 1/1000000*dis
            Body.applyForce(m,{
                x: mx,
                y: my
            },{
                x:lengthdir_x(d,repair_speed),
                y:lengthdir_y(d,repair_speed)
            })
            /*if(point_distance(this.x,this.y,mx,my)>this.matrix_array.length*1.2){
                Body.applyForce(m,{
                    x: mx,
                    y: my
                },{
                    x:lengthdir_x(d,repair_speed*2),
                    y:lengthdir_y(d,repair_speed*2)
                })
            }*/
            ellipse(m.position.x,m.position.y,10,10)
        }
        this.x+=lengthdir_x(this.direction,this.speed);
        this.y+=lengthdir_y(this.direction,this.speed);
        this.realX = approach(this.realX,this.x);
        this.realY = approach(this.realY,this.y)
        if(this.playing){
            stroke(255,255,255,150)
            strokeWeight(2)
            //ellipse(this.x,this.y,20,20)
            textSize(15)
            textAlign(CENTER,CENTER)
            text(this.name,this.realX,this.realY)
        }
        if(this.id===playerData.id){
            camera.position.x = approach(camera.position.x,this.realX);
            camera.position.y = approach(camera.position.y,this.realY);
            this.faceDir = point_direction(width/2,height/2,mouseX,mouseY)
            stroke(255,255,255,150)
            strokeWeight(2)
            //ellipse(this.x,this.y,20,20)
            textSize(15)
            textAlign(CENTER,CENTER)
            text(playerData.playerLevel,this.realX,this.realY+15)
            
            var xx = lengthdir_x(this.faceDir,20);
            var yy = lengthdir_y(this.faceDir,20);
            var X = this.realX+xx;
            var Y = this.realY+yy;
            var dir = point_direction(X,Y,this.realX,this.realY);
            var dir1 = dir+20;
            var xx = lengthdir_x(dir1,10);
            var yy = lengthdir_y(dir1,10)
            line(X,Y,X+xx,Y+yy)
            var dir2 = dir-20;
            var xx = lengthdir_x(dir2,10);
            var yy = lengthdir_y(dir2,10)
            line(X,Y,X+xx,Y+yy)
        }
    }
    find_matrix(matrixID){
        return this.matrix_array.find(x=>x.index==matrixID)
    }
    remove_matrix(matrixID){
        var m = this.find_matrix(matrixID);
        var index = this.matrix_array.indexOf(m);
        console.log("trying to remove matrix "+matrixID+ "  matrixLength: "+this.matrix_array.length)
        if(m!=undefined){
            console.log("removed matrix")
            Matter.Composite.remove(world,m)
            this.matrix_array.splice(index,index+1);
        }
    }
    destroy(){
        playerList.remove(this)
        for(var m of this.matrix_array){
            Matter.Composite.remove(world, m)
        }
    }
}
var draw_levelup_percent = playerData.levelup_percent
var draw_cooldown_percent = playerData.cooldown_percent
function draw_state(){
    camera.off();
	stroke(255)
    textSize(20)
    var ww = width/2;
    var hh = 35;
    //ellipse(ww,ww,ww)
    var rounded = 150;
    noFill();
    rect(ww,height-hh,ww,hh,rounded,rounded,rounded,rounded);
    fill(0,255,0,235)
    draw_levelup_percent = approach(draw_levelup_percent,playerData.levelup_percent)
    rect(ww,height-hh,ww*draw_levelup_percent,hh,rounded,rounded,rounded,rounded);
    
    noFill();
    rect(ww,height-hh*2-10,ww,hh,rounded,rounded,rounded,rounded);
    fill(255,255,0,235)
    draw_cooldown_percent = approach(draw_cooldown_percent,playerData.cooldown_percent,1)
    rect(ww,height-hh*2-10,ww*draw_cooldown_percent,hh,rounded,rounded,rounded,rounded);
    textAlign(LEFT)
    //text("name: "+playerData.name+"    roomID: "+playerData.roomID+"  level: " +playerData.playerLevel+
    //"  x: "+round(cX)+"  y: "+round(cY)+" role: "+playerData.role+"  fps: "+Math.round(frameRate()),50,50)
    if(frameRate()<20){
    }
    camera.on()
}