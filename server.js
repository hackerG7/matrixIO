var fs = require("fs");

function read(f) {
  return fs.readFileSync(f).toString();
}
function include(f) {
  eval.apply(global, [read(f)]);
}
if (/^win/.test(process.platform)) {
    console.warn('Starting uws bug-hack interval under Windows');
    setInterval(() => {}, 50);
}
include("D:/XAMPP/htdocs/GK.js")
include("D:/DeskTopD/Code World/JavascriptProject/ioGame/setup.js")
var Matter = require("matter-js");
matter_script(Matter)
var FloodProtection = require("flood-protection")
var FpsRun = require("fps-run-js")
console.log(FloodProtection)
const floodProtection = new FloodProtection.default({
    rate:1000,
    per:1
})
var tick = 0;
var express = require("express");
var value_port = 569;
var app = express();
var server = app.listen(value_port);
let scene_width = 500;
let scene_height = 500;

var vision_width = 500
var vision_height = 500
var candyList = [];
var normal_matrix_color = [0,255,0]
app.use(express.static("public"));
console.log("server starting on localhost:"+value_port);

var socket = require("socket.io");
var io = socket(server);
function sendMsgToAll(msgName, data){
    data.msgName = msgName;
    io.emit("Data",data)
}//sendMsgToAll("update",{date:"12/13/15"})
function sendMsgToRoom(roomID, msgName, data){
    data.msgName = msgName;
    io.to(roomID).emit("Data",data)
}//sendMsgToAll("update",{date:"12/13/15"})
let startedPeriod = 0;
let frameRate = 30
let timeOut = 1000/frameRate
let deltaTime = 60/frameRate
function get_player(id){
    return playerList.find(x => x.socketID===id);
}
function update_body(b,roomID = undefined){
    var rm = get_Room_by_id(roomID);
    var package = {
        bodyID:b.uid,//u0,u1...
        x:b.position.x,
        y:b.position.y,
        //label:b.label,
        angle:b.angle,
    }
    switch(b.label){
        case "Matrix":
            package.circleRadius = b.circleRadius
            package.life = b.matrix_master.life
            package.damage = b.matrix_master.damage
            package.color = b.color
            package.label = 0;
        break;
        case "Circle Body":
            package.circleRadius = b.circleRadius
            package.color = b.color
            package.label = 1
        break;
        case "Rectangle Body":
            package.width = b.width;
            package.height = b.height;
            package.label = 2
            //package.width = b.parts[0].bounds.max.x - b.parts[0].bounds.min.x
            //package.height = b.parts[0].bounds.max.y - b.parts[0].bounds.min.y
        break;
    }
    if(roomID==undefined){
        roomID = b.master_room.roomID
    }
    if(rm!=undefined){
        var pL = rm.playerList;
        if(pL!=undefined){
            for(var pID of pL){
                var p = get_player(pID)
                var dis = point_distance(p.x,p.y,b.position.x,b.position.y);
                if(dis<vision_width/p.zoom*10){
                    p.sendMsg(6,package)
                }
            }
        }
    }
    //sendMsgToRoom(roomID,6,package)
}
function update_fps(){
    console.log(tick)
    tick = 0;
    setTimeout(update_fps,1000)
}
setTimeout(update_fps,1000)
var fr = new FpsRun();
fr.start(loop,frameRate)
function loop(){
    tick++
    startedPeriod++;
    ///Player///
    for(var p of playerList){
        p.update();
    }
    ///Room///
    for(var r of roomList){
        r.update();
        var b = r.world.bodies[1];
        //Body.applyForce(b,{x:b.position.x,y:b.position.y},{x:0.005,y:0.00005})
        var roomID = r.roomID;
        var roomPlayerList = r.playerList;
        for(socketID of roomPlayerList){
            var p = get_player(socketID)
            if(p!=undefined){
                if(p.matrix_array<=0){//later become if(p.matrix_array<=0 && 沒有附身物體==true)
                    p.playing = false
                }
                if(p.playing){
                    p.sendMsg(4,{
                        zoom:p.zoom,
                        abilityLevel:p.abilityLevel,
                        level:p.level,
                        levelup_percent:p.get_levelup_percent(),
                        cooldown_percent:Math.min(p.cooldown[0]/p.set_cooldown[0],1),
                        role:p.role
                    })
                    //console.log(Math.min(p.cooldown[0]/p.set_cooldown[0],p.set_cooldown[0]))
                
                }
                
                sendMsgToRoom(roomID,12,{
                    id:socketID,
                    name:p.name,
                    x:p.x,
                    y:p.y,
                    faceDir:p.faceDir,
                    playing:p.playing,
                    power:p.power
                })
                
            }
           
        }
        var bodies = r.get_bodies();
        for(b of bodies){
            update_body(b,roomID)    
        }
    }
    ///
    

    //setTimeout(loop, timeOut);
}
//setTimeout(loop, timeOut);


io.sockets.on('connection',newConnection);
window = {}

function get_Room_by_id(roomID){
    return roomList.find(x => x.roomID==roomID);
}
class Room{
    constructor(roomID=get_randomID(),maxPlayer = 10){
        this.engine = Engine.create();
        this.world = this.engine.world;
        this.world.gravity.y = 0;
        //event collision fight
        Matter.Events.on(this.engine, 'collisionStart collisionActive', function(event) {
                var i, pair,
                    length = event.pairs.length;
            
                for (i = 0; i < length; i++) {
                pair = event.pairs[i];
                var A = pair.bodyA;
                var B = pair.bodyB;
                
                if (A.can_fight==true && B.can_fight==true) {
                    var mA = A.matrix_master;
                    var mB = B.matrix_master;
                    if(mA!=undefined && mB!=undefined){
                        if(mA.master!=mB.master){
                            var pA = mA.master;
                            var pB = mB.master;
                            mA.attack(mB)
                            mB.attack(mA)
                            
                        }
                    }
                }
                    //eatting candy
                if(A.is_candy &&B.can_fight){
                    var m = B.matrix_master;
                    if(m!=undefined){
                        sendMsgToRoom(A.master_room.roomID,7,{uid:A.uid})
                        m.get_candy(A);
                    }
                }
                if(B.is_candy &&A.can_fight){
                    var m = A.matrix_master;
                    if(m!=undefined){
                        sendMsgToRoom(B.master_room.roomID,7,{uid:B.uid})
                        m.get_candy(B);
                    }
                }

            }
          });
        Engine.run(this.engine);
        
        for(var i = 0 ; i < scene_width/80 ; i++){
            var rX = irandom(scene_width)
            var rY = irandom(scene_height);
            if(Math.random()>0.5){
                this.add_body(Bodies.rectangle(rX,rY,irandom(5,50),irandom(5,50)));
            }else{
                this.add_body(Bodies.circle(rX,rY,irandom(5,50)));
            }
        }
        this.roomID = roomID;
        this.maxPlayer = maxPlayer;
        this.playerList = [];
        this.create_candy(20,20)
        roomList.push(this)
    }
    create_candy(x,y,type=0){
        var body = Bodies.circle(x,y,3,{mass:0.001,restitution:0});
        body.abilities = [];
        body.color = [255,255,255]
        body.candyType = type;
        switch(type){
            case 0://normal candy
                body.color = [10,255,20]
            break;
            case 1:
                body.color = [0,200,255]
                body.abilities = [function(p){
                    p.add_effect(function(p){
                        p.set_speed += 0.3
                    },80*timeOut)
                }];
            break;
            case 2:
                body.color = [255,255,0]
                body.abilities = [function(p){
                    p.cooldown[0] += p.set_cooldown[0]/5

                }];
            break;
        }
        body.is_candy = true;
        this.add_body(body)
        candyList.push(body);
    }
    remove_body(body){
        Matter.Composite.remove(this.world,body)
    }
    get_bodies(){
        return this.world.bodies;
    }
    add_body(body){
        body.uid = "u"+body.id+get_randomID();
        body.master_room = this
        //if(body.label=="Rectangle Body"){
        body.width = body.parts[0].bounds.max.x-body.parts[0].bounds.min.x
        body.height = body.parts[0].bounds.max.y-body.parts[0].bounds.min.y
        //}
        World.add(this.world,body)
    }
    add_player(socketID){
        this.playerList.push(socketID)
    }
    remove_player(socketID){
        this.playerList.remove(socketID)
    }
    update(){
        Engine.update(this.engine,1000/60)
        if(Math.random()>0.8 && candyList.length <scene_width/5){
            var t = irandom(2);
            this.create_candy(irandom(scene_width),irandom(scene_height),t);
        }
    }
}
class Weapon{
    constructor(master,x,y,life=5,damage=1,body){
        this.master = master
        this.x = x;
        this.y = y;
        this.life = life;
        this.damage = damage;
        this.color = normal_matrix_color;
        if(this.master!=undefined){
            if(this.master.roomID!=-1 && this.master.room!=undefined){
                this.body = body;
                this.body.can_fight = true;
                this.body.matrix_master = this;
                this.body.color = this.color
                var rm = this.master.room;
                rm.add_body(this.body)
                this.master.weapon_array.push(this)
                //console.log("created "+this.master.matrix_array.length)
            }
        }
    }
    remove(){
        if(this.master!=undefined){
            if(this.master.roomID!=-1 && this.master.room!=undefined){
                var found = this.master.weapon_array.find(x=>x===this);
                    if(this.body.uid!=undefined){
                        sendMsgToRoom(this.master.roomID,7,{uid:this.body.uid});
                    }
                    var rm = this.master.room;
                    this.master.weapon_array.remove(this)
                    Matter.Composite.remove(rm.world,this.body)
                
                //console.log("removed "+this.master.matrix_array.length)
            }
        }
    }
    get_candy(body){
        if(body.candyType==0){
            if(irandom(10)<8){
                var r = this.master.add_matrix(this.body.position.x,this.body.position.y,this.master.set_life,this.master.set_damage)
            }
        }
        for(var f of body.abilities){
            f(this.master)
        }
        candyList.remove(body)
        body.master_room.remove_body(body)
        this.master.power+=70;
    }
    
    add_force(dir,force){
        var b = this.body;
        var bX = b.position.x;
        var bY = b.position.y;
        var spd = force*b.mass/100*deltaTime;
        var lX = lengthdir_x(dir,spd)
        var lY = lengthdir_y(dir,spd)
        Body.applyForce(b,{x:bX,y:bY},{x:lX,y:lY})
    }
}
class Matrix{
    constructor(master,x,y,life=5,damage=1,stick_back = 1, is_extra = false){
        this.master = master
        this.x = x;
        this.y = y;
        this.life = life;
        this.damage = damage;
        this.stick_back = stick_back;
        this.color = normal_matrix_color;
        this.is_extra = is_extra;
        this.absorb = 0.5;
        this.abilities = [];
        if(this.master!=undefined){
            if(this.master.roomID!=-1 && this.master.room!=undefined){
                this.body = Bodies.circle(this.x,this.y,5);
                this.body.can_fight = true;
                this.body.matrix_master = this;
                this.body.label = "Matrix"
                this.body.color = this.color
                var rm = this.master.room;
                rm.add_body(this.body)
                this.master.matrix_array.push(this)
                //console.log("created "+this.master.matrix_array.length)
            }
        }
    }
    add_ability(f){
        this.abilities.push(f)
    }
    attack(m){
        m.master.lastFighter = this.master;
        m.master.lastFighter = this.master;
        var rr = 0.5
        m.life -= this.damage+this.body.speed*rr;
        console.log("spd:"+this.body.speed)
        if(m.life<=0){
            if(m.master.matrix_array.length<=1){//<=1 because it is not removed yet,
                this.master.give_killReward(m.master)
                m.master.die()
            }
            m.remove();// it removed after it calculate
        }
        for(var f of this.abilities){
            f(m);
        }
    }
    get_candy(body){
        
        if(body.candyType==0){//green
            if(Math.random()<this.absorb){
                var r = this.master.add_matrix(this.body.position.x,this.body.position.y,this.master.set_life,this.master.set_damage)
            }
        }else{
            console.log(body.candyType)
        }
        for(var f of body.abilities){
            f(this.master)
        }
        candyList.remove(body)
        body.master_room.remove_body(body)
        this.master.power+=70;
    }
    remove(){
        if(this.master!=undefined){
            if(this.master.roomID!=-1 && this.master.room!=undefined){
                var found = this.master.matrix_array.find(x=>x===this);
                    if(this.body.uid!=undefined){
                        sendMsgToRoom(this.master.roomID,7,{uid:this.body.uid});
                    }
                    var rm = this.master.room;
                    this.master.matrix_array.remove(this)
                    Matter.Composite.remove(rm.world,this.body)
                
                //console.log("removed "+this.master.matrix_array.length)
            }
        }
    }
    add_force(dir,force){
        var b = this.body;
        var bX = b.position.x;
        var bY = b.position.y;
        var spd = force*b.mass/100*deltaTime;
        var lX = lengthdir_x(dir,spd)
        var lY = lengthdir_y(dir,spd)
        Body.applyForce(b,{x:bX,y:bY},{x:lX,y:lY})
    }
}
class Player{
    constructor(socketID,roomID=-1){
        this.previous_abilityLevel = [0,0,0,0,0]
        this.abilityLevel = [0,0,0,0,0]
        this.abilityVar = [0,0,0,0,0,0,0,0,0]
        this.effectList = [];
        //this.abilityLevel[0] = atkDamage
        this.set_damage = 1
        //this.abilityLevel[1] = health
        this.set_life = 1
        this.max_matrix = 5;
        //this.abilityLevel[2] = speed
        this.set_speed = 1;
        //this.abilityLevel[3] = vision
        this.zoom = 2
        //this.abilityLevel[4] = coolDown
        this.cooldownReduction = 1;

        this.cooldown = [0];
        this.set_cooldown = [60];
        
        this.lastFighter = undefined;
        this.stick_back = 1;//return to nucleus
        this.role = -1;
        this.name = "unknown"
        this.socketID = socketID
        this.room = undefined;
        this.roomID = roomID;
        this.playing = false;
        this.x = -1;
        this.y = -1;
        this.direction = 0;
        this.faceDir = 0;
        this.speed = 0;
        this.matrix_array = [];
        this.weapon_array = [];
        this.start_power = 50;
        this.power = this.start_power;
        this.host = undefined;
        this.previous_level = 1;
        this.level = 1;
        playerList.push(this)
    }
    get_matrix_length(){
        var ans = 0;
        for(var m of this.matrix_array){
            if(!m.is_extra){
                ans++
            }
        }
        return ans;
    }
    evolute(roleID){
        this.role = roleID;
    }
    die(){
        console.log("die")
        this.playing = false;
        for(var m of this.matrix_array){
            m.remove()
        };
        this.power = this.start_power;
        this.level = 1;
        this.abilityLevel = [0,0,0,0,0];
        this.role = -1;
    }
    attack(faceDir,distance){
        switch(this.role){
            case 0://shooter
                for(var i = 0 ; i < this.set_life-1 ; i++){
                    setTimeout(function(p,faceDir){
                        p.remove_matrix(0)
                        var xx = lengthdir_x(faceDir,20)+p.x
                        var yy = lengthdir_y(faceDir,20)+p.y
                        var m = p.add_matrix(xx,yy,p.set_life,p.set_damage,1,false);
                        m.add_force(faceDir,1.5)
                    },i*100,this,faceDir)
                }
            break;
            case 1://tank
                for(var m of this.matrix_array){
                    m.add_force(faceDir,1)
                }
                var xx = lengthdir_x(faceDir,50+this.set_damage*10)
                var yy = lengthdir_y(faceDir,50+this.set_damage*10)
                this.x+=xx;
                this.y+=yy;
            break;
            case 2://bomber
                if(this.matrix_array.length>1){
                    this.remove_matrix(0)
                    var xx = lengthdir_x(faceDir,20)+this.x
                    var yy = lengthdir_y(faceDir,20)+this.y
                    var m = this.add_matrix(xx,yy,this.set_life*2,this.set_damage/2,0,true);
                    m.body.mass = 10;
                    m.body.restitution = 0.8;
                    m.add_force(faceDir,0.005*distance/this.zoom)
                    setTimeout(function(m){
                        var master = m.master
                        var xx = m.body.position.x;
                        var yy = m.body.position.y;
                        var interval = Math.round(9+master.abilityLevel[0]);
                        for(var i = 0 ; i < interval ; i++){
                            var qq = 360/interval*i;
                            var lx = lengthdir_x(qq,5)
                            var ly = lengthdir_x(qq,5)
                            var newM = master.add_matrix(xx+lx,yy+ly,2,master.set_damage,0,true);
                            newM.body.mass = 100
                            newM.add_force(360/interval*i+m.body.angle,2)
                            setTimeout(function(m){
                                m.remove()
                            },Math.min(100+master.abilityLevel[0]*20,300),newM)
                        }
                        
                        m.remove();

                    },1000,m)
                }
            break;
            case 3://smasher    
                for(var m of this.matrix_array){
                    m.add_force(faceDir,0.1+1*this.set_damage)
                    m.life = this.set_life*2
                    m.damage = this.set_life*2
                    
                    setTimeout(function(m,p,color){
                        m.life = p.set_life;
                        m.damage = p.set_damage;
                        m.body.color = color
                    },500,m,this,m.body.color)
                    m.body.color = [255,50,50]
                }
                var xx = lengthdir_x(faceDir,50+this.set_damage*5)
                var yy = lengthdir_y(faceDir,50+this.set_damage*5)
                this.x+=xx;
                this.y+=yy;
            break;
            case 4://iluminater
                var dir = this.faceDir;
                for(var i = 0 ; i < this.matrix_array.length ; i++){
                    var left = i%2==0;
                    left = 1-left*2;
                    setTimeout(function(p,faceDir,left){
                        p.remove_matrix(0)
                        var xx = lengthdir_x(faceDir-90*left, 10)+p.x;
                        var yy = lengthdir_y(faceDir-90*left, 10)+p.y;
                        var m = p.add_matrix(xx,yy,p.set_life,p.set_damage);
                        m.add_force(faceDir-45*left,0.01*distance/p.zoom)
                        setTimeout(function(m,faceDir,left){
                            m.add_force(faceDir,0.01*distance/p.zoom)
                            setTimeout(function(m,faceDir, left){
                                m.add_force(faceDir+45*left,0.5)
                                setTimeout(function(m,faceDir, left){
                                    m.add_force(faceDir+90*left,0.3)
                                },50,m,faceDir,left)
                            },50,m,faceDir,left)
                    },50,m,faceDir, left)
                },i*50,this, dir, left)
            }
        break;
        case 5://icer
            var p = this;
            if(p.matrix_array.length>1){
                var dir = faceDir;
                p.remove_matrix(0)
                var xx = p.x+lengthdir_x(dir,20)
                var yy = p.y+lengthdir_y(dir,20)
                var m = p.add_matrix(xx,yy,p.set_life,p.set_damage,0,true);
                m.add_force(dir,1+p.set_life/10);
                m.body.color = [0,255,255]
                m.add_ability(function(m){
                    m.master.add_effect(function(p){
                        p.set_speed*=0.5
                    },frameRate*(10+p.set_life))
                })
                setTimeout(function(m){
                    m.remove();
                },frameRate*(10+p.set_life*5),m)
                for(var i = 0 ; i < this.set_life-1; i++){
                    for(var j = -1 ; j < 2 ; j+=2){
                        setTimeout(function(p,dir){
                            var xx = p.x+lengthdir_x(dir,20)
                            var yy = p.y+lengthdir_y(dir,20)
                            var m = p.add_matrix(xx,yy,1,p.set_damage,0,true);
                            m.add_force(dir,0.9+p.set_life/10);
                            m.body.color = [0,255,255]
                            m.add_ability(function(m){
                                m.master.add_effect(function(p){
                                    p.set_speed=0
                                    p.cooldown[0]--
                                },frameRate*(20+p.set_life*2))
                            })
                            setTimeout(function(m){
                                m.remove();
                            },frameRate*(10+p.set_life),m)
                        },
                        i*100,this,this.faceDir+j*(i+1)*5)
                    }
                }
            }
            /*
            setTimeout(function(p,faceDir){
                p.remove_matrix(0)
                var xx = lengthdir_x(faceDir, 10)+p.x;
                var yy = lengthdir_y(faceDir-90*left, 10)+p.y;
                var m = p.add_matrix(xx,yy,p.set_life,p.set_damage);
                m.add_force(faceDir-45*left,0.01*distance/p.zoom)
                
            },i*50,this, dir)*/
        break;
        }
        
    }
    shoot_matrix(xx,yy,life,damage,faceDir,force,stick_back){
        var m = this.add_matrix(xx,yy,life,damage,stick_back,true);
        m.add_force(faceDir,force)
    }
    give_killReward(p){

        if(p!=undefined){
            if(p.power>0){
                this.power += p.power/1.1;
                //console.log("gave power "+p.power)
            }
        }
    }
    get_ability_points(){
        var ans = 0;
        for(var i = 0 ; i < this.abilityLevel.length ; i++){
            var a = this.abilityLevel[i]
            ans+=a
        }
        return ans;
    }
    get_level_decimal(){
        return 0.15*(Math.pow(Math.log10(this.power+1),2.85))
    }
    update_level(){
        this.level = Math.floor(this.get_level_decimal())
        if(this.level!=this.previous_level && this.level>0){
            //console.log("reseted")
            for(var m of this.matrix_array){
                m.life = this.set_life
            }
            this.add_matrix(this.x,this.y,this.set_life,this.set_damage,1,false)
        }
        this.previous_level = this.level
    }
    get_power_at_level(level){
        //this.level = Math.floor(0.15*(Math.pow(Math.log10(this.power+1),2.85)))
        var v = Math.pow(level/0.15,1/2.85)
        return Math.pow(10,(v))-1
    }
    get_levelup_percent(){
        return (this.power-this.get_power_at_level(this.level))/(this.get_power_at_level(this.level+1)-this.get_power_at_level(this.level));
    }
    remove_matrix(id){
        if(this.matrix_array[id]!=undefined){
            this.matrix_array[id].remove();
        }
    }
    add_matrix(x=this.x,y=this.y,set_life=5,set_damage=1,stick_back=1,extra = false){
        if(!extra){


            if(this.get_matrix_length()<this.max_matrix){
                var m = new Matrix(this,x,y,set_life,set_damage,stick_back,extra);
                return m;
            }else{
                //var m = new Matrix(this,x,y,0,set_damage,stick_back);
                return undefined
            }
        }else{
            var m = new Matrix(this,x,y,set_life,set_damage,stick_back,extra);
            return m;
        }
    }
    add_weapon(x=this.x,y=this.y,set_life=5000,set_damage=1,body){
        var w = new Weapon(this,x,y,set_life,set_damage,body);
        return w;
    }
    reset_weapon(){
        for(var w of this.weapon_array){
            w.remove()  
        }
    }
    
    update(){/*
        switch(this.role){
            case 4:
            var maxW = 4;
            var baseLength = 30;
            var weaponWidth = 17;
            var weaponHeight = 4
            for(var i = 0 ; i < maxW; i++){
                var w = this.weapon_array[i]
                if(w==undefined){

                    w = this.add_weapon(this.x,this.y+50+50*i,50,1,Bodies.rectangle(this.x,this.y+50,weaponWidth,weaponHeight))
                    if(i!=2&&i!=0){
                        var targetW = this.weapon_array[i-1];
                        var options = {
                            bodyA: w.body,
                            bodyB:targetW.body,
                            length:weaponWidth+3,
                            stiffness:0.1
                        }
                        //var constraint = Constraint.create(options);
                        //World.add(this.room.world, constraint);
                    }
                }
                //Body.setAngle(w.body,degree_to_radian(this.faceDir));
            }
            var a = this.weapon_array[0]
            var b = this.weapon_array[1]
            var c = this.weapon_array[2]
            var d = this.weapon_array[3]

            var dir = this.faceDir;
            var angleGap = 40
            var d0 = dir-angleGap
            var d1 = dir+angleGap
            var ll = 70;
            var lx = lengthdir_x(d0,ll)
            var ly = lengthdir_y(d0,ll)
            var realD = point_direction(a.body.position.x,a.body.position.y,lx+this.x,ly+this.y)
            a.add_force(realD,0.00001)
            Body.setAngle(a.body,degree_to_radian(d0))
            var lx = lengthdir_x(d1,ll)
            var ly = lengthdir_y(d1,ll)
            var realD = point_direction(b.body.position.x,b.body.position.y,lx+this.x,ly+this.y)
            b.add_force(realD,0.00001)
            Body.setAngle(b.body,degree_to_radian(d1))

            break;
        }
        */
        //this.remove_matrix(0)
        this.set_damage = 1//1+this.abilityLevel[0]/3
        this.set_life = 2+this.abilityLevel[0]/3
        this.max_matrix = this.abilityLevel[1]+5
        this.set_speed = 1+(this.abilityLevel[2]/4)
        this.zoom = 100/((this.matrix_array.length/30+10)+this.abilityLevel[3])
        this.cooldownReduction = this.abilityLevel[4]

        if(this.role!=-1){
            this.set_cooldown[0] = roleDataList[this.role].set_cooldown/(1+this.cooldownReduction/10)//60/(1+this.cooldownReduction/10)
        }else{
            this.set_cooldown[0] = Infinity
        }
        for(var i = 0 ; i < this.cooldown.length ; i++){
            this.cooldown[i]++;
        }
        this.update_level();
        for(var m of this.matrix_array){
            var ll = 250;
            if(m.body.position.x<-ll||m.body.position.x>scene_width+ll
            || m.body.position.y<-ll||m.body.position.y>scene_height+ll){
                m.life--
            }
            if(this.abilityLevel[1]!=this.previous_abilityLevel[1]){
                m.life = this.set_life
            }
            if(m.stick_back!=0){
                var b = m.body;
                var bX = b.position.x;
                var bY = b.position.y;
                var dir  = point_direction(bX,bY,this.x,this.y)
                var dis = point_distance(bX,bY,this.x,this.y)+m.stick_back*10
                var spd = 0.000001+dis/1000
                m.add_force(dir,spd)
            }
            if(m.life<=0){
                m.remove()
            }
        }
        if(this.matrix_array.length<=0 && this.playing){
            if(this.lastFighter!=undefined){
                this.lastFighter.give_killReward(this)
            }
            this.die();
        }
        this.x+=lengthdir_x(this.direction,this.speed);
        this.y+=lengthdir_y(this.direction,this.speed);
        this.x = clamp(this.x,0,scene_width)
        this.y = clamp(this.y,0,scene_height)
        sendMsgToRoom(this.roomID,9,{
            id:this.id,
            direction:this.direction,
            speed:this.speed
        })
        this.previous_abilityLevel = this.abilityLevel
        this.previous_level = this.level
        this.do_effect();

    }
    add_effect(effectAction,time){
        this.effectList.push(effectAction)
        setTimeout(function(p,e){
            p.effectList.remove(e);
        }, time,this, effectAction);
    }
    do_effect(){
        for(var f of this.effectList){
            f(this);
        }
    }
    remove(){
        while(this.matrix_array.length>0){//after removed the i will too large, need to re-run using while
            for(var m of this.matrix_array){
                m.remove();
            }
        }
        playerList.remove(this)

    }
}
let roomList = [];
let playerList = [];

function newConnection(socket){
    let p = new Player(socket.id,-1);
    for(let i = 0 ; i < roomList.length ; i++){
        let rm = roomList[i];
        if(rm.playerList.length<rm.maxPlayer){
            //join current room
            rm.add_player(socket.id)
            p.roomID = rm.roomID
            p.room = rm
            i = roomList.length;
        }
    }
    if(p.roomID==-1){//still didn't find a room, need to create one!
        let rm = new Room(get_randomID())
        rm.add_player(socket.id)
        p.roomID = rm.roomID
        p.room = rm;
    }
    {///Functions///
        function sendMsg(msgName, data){
            data.msgName = msgName;
            socket.emit("Data",data)
        }//sendMsg("add_value",[a:50,b:20,c:80])
        p.sendMsg = sendMsg;
        function broadcast(msgName, data){//broadcast to all player in that room
            data.msgName = msgName;
            socket.broadcast.to(p.roomID).emit("Data",data)
        }//broadcast("new_player",[player_name:"abcdefg",id:02132,team:"red"])
        p.broadcast = broadcast;
        function create_matrix(x,y,set_life,set_damage){
            return new Matrix(p,x,y,set_life,set_damage)
        }
        function disconnect(){
            io.emit('user disconnected');
            console.log(socket.id+" disconnected")
            sendMsgToRoom(p.roomID,3,{id:socket.id})
            get_Room_by_id(p.roomID).remove_player(socket.id)
            get_player(socket.id).remove()
        }
        function startPlayer(data){
            if(!p.playing){
                var name = data.name
                p.name = name;
                p.playing = true;
                p.x = irandom(scene_width);
                p.y = irandom(scene_height);
                
                sendMsg(2,{
                    x:p.x,
                    y:p.y
                })
                broadcast(1,{
                    name:p.name,
                    id:socket.id,
                    x:p.x,
                    y:p.y
                })
                for(var i = p.matrix_array.length ; i < p.max_matrix ; i++){
                    
                    create_matrix(p.x+irandom(-1,1),p.y+irandom(-1,1),p.set_life,p.set_damage)
                    //p.matrix_array.push(new Matrix(p.x,p.y,set_life,set_damage))
                    /*sendMsg("create_matrix",{
                        id:socket.id,
                        life:set_life,
                        damage:set_damage
                    })*/
                }
            }
        }
        function removePlayer(){
            console.log(socket.id+" reseted")
            sendMsgToRoom(p.roomID,3,{id:socket.id})
            get_Room_by_id(p.roomID).remove_player(socket.id)
            get_player(socket.id).remove()
        }
        p.create_matrix = create_matrix;
    }
    {///new Connection action///
        console.log('new connection:' + socket.id);
        console.log("joint room: "+p.roomID);
        socket.join(p.roomID)
        sendMsg(0,{
            name:"tester",
            id:socket.id,
            roomID:p.roomID,
            scene_width:scene_width,
            scene_height:scene_height,
            evolutionDataList:evolutionDataList
        })
    }
    {///Disconnect///
        socket.on('disconnect', function () {
            disconnect()
        });
    }
    function DataHandle(data){
        if(floodProtection.check()){
            switch(data.msgName){
                case 13:
                    startPlayer(data)
                break;
                case 9://player_move
                    d = data.direction;
                    p.direction = d;
                    p.speed = (Math.max(p.set_speed/(1+(700+p.level*120))*700,0)+0.1)*deltaTime;
                    sendMsgToRoom(p.roomID,9,{
                        id:socket.id,
                        direction:p.direction,
                        speed:p.speed
                    })
                break;
                case 8://speed
                    p.speed = 0;
                    sendMsgToAll(8,{
                        id:socket.id,
                    })
                break;
                case 5://mouse Data
                    var x = data.x;
                    var y = data.y;
                    var key = data.key
                    var distance = data.distance
                    var faceDir = point_direction(p.x,p.y,x,y)
                    p.faceDir = faceDir;
                    if(key==0){
                        if(p.cooldown[0]>p.set_cooldown[0] && p.playing){
                            p.attack(faceDir,distance)
                            p.cooldown[0] = 0;
                        }
                    }
                    //broadcast(5,{name:(socket.id)+"clicked",x:data.x,y:data.y})
                break;
                case 10://levelup ability
                    var abilityID = data.abilityID;
                    if(p.get_ability_points()<p.level/*&& ability is not maxed*/){
                        p.abilityLevel[abilityID]++
                        if(abilityID==0){//attack
                            for(var m of p.matrix_array){
                                m.body.life = p.set_damage
                            }
                        }
                    }

                break;
                case 11://evolution
                    var selectedID = data.selectedID;
                    var level = p.level;
                    nearest = {
                        evolution:evolutionDataList[0],
                        difference:Infinity
                    }
                    
                    for(var i = 0 ; i < evolutionDataList.length ; i++){
                        var e = evolutionDataList[i];
                        var rL = e.requiredLevel;
                        if(level>=rL){
                            difference = Math.abs(rL - level);
                            if(difference<nearest.difference){
                                nearest.evolution = e;
                                nearest.difference = difference
                            }
                        }
                    }
                    var e = nearest.evolution;
                    var alreadyEvoluted = false;
                    for(var t of e.selectTypes){//type of e
                        if(t==p.role){
                            alreadyEvoluted = true;
                        }
                    }
                    if(!alreadyEvoluted){
                        if(selectedID<e.selectTypes.length){
                            p.evolute(e.selectTypes[selectedID]);
                        }
                        
                        console.log("evoluted to type: "+p.role+" successfully")
                    }
                    //console.log("suitable evolution: "+nearest.evolution.requiredLevel,nearest.difference)
                break;
                default:
                    console.log("unknown data received: "+data);
                break;
            }
        }else{
            //someone flooding DDOSing me. fuck him!
        }
        
    }
    socket.on('Data',DataHandle);
    
}
var roleDataList=[
    {//shooter
        set_cooldown:100
    },
    {//tank
        set_cooldown:110
    },
    {//bomber
        set_cooldown:150
    },
    {//smasher
        set_cooldown:250
    },
    {//hasher
        set_cooldown:150
    },
    {//icer
        set_cooldown:200
    }
]
var evolutionDataList = [
    {
        requiredLevel:7,
        selectTypes:[2,5]
    },
    {
        requiredLevel:4,
        selectTypes:[3,4]
    },
    {
        requiredLevel:1,
        selectTypes:[0,1]
    }

]