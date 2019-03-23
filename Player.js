
class Player{
    constructor(socketID,roomID=-1){
        this.previous_abilityLevel = [0,0,0,0,0]
        this.abilityLevel = [0,0,0,0,0]
        //this.abilityLevel[0] = atkDamage
        this.set_damage = 1
        //this.abilityLevel[1] = health
        this.set_life = 1
        //this.abilityLevel[2] = speed
        this.set_speed = 1;
        //this.abilityLevel[3] = vision
        this.zoom = 2
        //this.abilityLevel[4] = coolDown
        this.set_cooldown = 1;
        this.stick_back = 1;//return to nucleus
        this.role = 0;
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
        this.power = 0;
        this.host = undefined;
        this.level = 1;
        playerList.push(this)
    }
    
    get_ability_points(){
        var ans = 0;
        for(var i = 0 ; i < this.abilityLevel.length ; i++){
            var a = this.abilityLevel[i]
            ans+=a
        }
        return ans;
    }
    update_level(){
        this.level = Math.floor(0.15*(Math.pow(Math.log10(this.power+1),2.85)))
    }
    add_matrix(x=this.x,y=this.y,set_life=5,set_damage=1){
        this.matrix_array.push(new Matrix(this,x,y,set_life,set_damage))
    }
    update(){
        this.set_damage = 1+this.abilityLevel[0]/3
        this.set_life = 1+this.abilityLevel[1]/3
        this.set_speed = 1+(this.abilityLevel[2]/5)
        this.zoom = 30/((this.matrix_array.length/30+10)+this.abilityLevel[3])
        this.cooldown = this.abilityLevel[4]
        this.update_level();
        for(var m of this.matrix_array){
            if(this.abilityLevel[1]!=this.previous_abilityLevel[1]){
                m.life = set_life
            }
            for(var c of candyList){
                var x = m.body.position.x;
                var y = m.body.position.y;
                if(point_distance(x,y,c.x,c.y)<m.body.circleRadius){
                    candyList.remove(c);
                    //add candy
                    this.add_matrix(this.x,this.y,5,1)
                    
                }
            }
            if(m.stick_back!=0){
                var b = m.body;
                var bX = b.position.x;
                var bY = b.position.y;
                var dir  = point_direction(bX,bY,this.x,this.y)
                var dis = point_distance(bX,bY,this.x,this.y)
                var spd = m.stick_back*0.000001+dis/100000
                var lX = lengthdir_x(dir,spd)
                var lY = lengthdir_y(dir,spd)
                var world = this.room.world;
                Body.applyForce(b,{x:bX,y:bY},{x:lX,y:lY})
            }
        }
        this.previous_abilityLevel = this.abilityLevel

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