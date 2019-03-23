let playerData = {
    name:"unknown",
    id:undefined,
    roomID:-1,
    playerLevel:0,
    abilityLevel:[0,0,0,0,0],
    levelup_percent:0,
    cooldown_percent:0,
    role:-1
}
function draw_background(){
    let rr = 100
	stroke(255,255,255,255)
	fill(255,255,255,255)
	for(var i = 0 ; i < value.scene_width; i +=rr){
		for(var j = 0 ; j < value.scene_height ; j+=rr){
			line(i,0,i,value.scene_height)
			line(0,j,value.scene_width,j)
		}
	}
}
function get_ability_points(){
    var ans = 0;
    for(var a = 0 ; a < playerData.abilityLevel.length ; a++){
        ans+=playerData.abilityLevel[a]
        
    }
    return ans;
}
function sendMsg(msgName="none", data={}){
    data.msgName = msgName;
    socket.emit("Data",data)
}
function get_myPlayer(){
    return get_player(playerData.id)
}
function get_player(id){
    return playerList.find(x => x.id===id);
}
function create_player(name="unknown",id,x,y){
    var p = (get_player(id));
    if(p==undefined){
        var ans = new Player(name,id,x,y)
        return ans
    }else{//update object
        playerList.remove(p);
        var p = new Player(name,id,x,y)
        return p
    }
}
function DataHandle(data){
    switch(data.msgName){
        case 0:
            playerData.name = data.name
            playerData.id = data.id;
            playerData.roomID = data.roomID
            value.scene_width = data.scene_width
            value.scene_height = data.scene_height;
            value.evolutionDataList = data.evolutionDataList;
            bodyList = []
        break;
        case 1:
            //create other player
            name = data.name;
            id = data.id
            x = data.x;
            y = data.y;
            var p = create_player(name,id,x,y)
        break;
        case 2:
            //create self
            var name = playerData.name;
            var id = playerData.id;
            var x = data.x;
            var y = data.y;
            var p = create_player(name,id,x,y)
        break;
        case 3://remove_player
            var id = data.id;
            get_player(id).destroy();
        break;
        case 4://self_update
            var zoom = data.zoom;
            var abilityLevel = data.abilityLevel;
            var level = data.level;
            var levelup_percent = data.levelup_percent;
            var cooldown_percent = data.cooldown_percent
            var role = data.role;
            value.zoom = zoom;
            playerData.abilityLevel = abilityLevel;
            playerData.playerLevel = level;
            playerData.levelup_percent = levelup_percent;
            playerData.cooldown_percent = cooldown_percent;
            playerData.role = role;
        break;
        case 12://player_update
            var id = data.id;
            var name = data.name;
            var playing = data.playing
            var x = data.x;
            var y = data.y;
            var faceDir = data.faceDir
            var power = data.power
            var p = get_player(id);
            if(p==undefined){
                var p = create_player(name,id,x,y)
            }
            p.id =id;
            p.name = name;
            p.x = x;
            p.y = y;
            p.faceDir = faceDir;
            p.playing = playing;
            p.power = power;
        break;
        case 9://player_move
            var id = data.id;
            var direction = data.direction;
            var speed = data.speed;
            p = get_player(id)
            if(p!=undefined){//found the player which is in the map
                p.direction = direction;
                p.speed = speed;
            }

        break;
        case 8://player_stop
            var id = data.id;
            p = get_player(id)
            if(p!=undefined){//found the player which is in the map
                p.speed = 0;
            }
        break;/*
        case "create_matrix":
            var id = data.id;
            p = get_player(id);
            if(p!=undefined){
                p.add_matrix(1,data.life,data.damage);
            }
        break;/*
        case "matrix_update":
            var id = data.id;
            p = get_player(id)
            var matrixID = data.matrixID;
            var mX = data.mX;
            var mY = data.mY;
            var life = data.life;
            var damage = data.damage;
            if(p!=undefined){
                if(matrixID<p.matrix_array.length){
                    //update x, y position;
                    var m = p.matrix_array[matrixID];
                    m.position.x = mX;
                    m.position.y = mY;
                    m.life = life;
                    m.damage = damage;
                }else{
                    while(p.matrix_array.length-1 < matrixID){
                        var m = p.add_matrix(1)
                    }
                    var m = p.matrix_array[matrixID];
                    m.position.x = mX;
                    m.position.y = mY;
                    m.life = life;
                    m.damage = damage;

                }
            }
        break;*//*
        case "remove_matrix":
            var id = data.id;
            var p = get_player(id);
            var matrixID = data.matrixID;
            if(p!=undefined){
                p.remove_matrix(matrixID)
            }
        break;*/
        case 6://body_update
            var uid = data.bodyID;
            var x = data.x;
            var y = data.y;
            var angle = data.angle
            var label = data.label
            var color = data.color
            var create = false;
            var b = get_body(uid);
            if(b==undefined){
                create = true;
                b = new Body(x,y);
            }
            b.label = label;
            //console.log(label)
            switch(label){
                case 0://matrix
                    b.radius = data.circleRadius;
                    b.life = data.life;
                    b.damage = data.life;
                    b.color = data.color
                break;
                case 1://circle
                    b.radius = data.circleRadius;
                break;
                case 2://rectangle
                    b.width = data.width;
                    b.height = data.height;
                break;
            }
            b.angle = angle;
            b.x = x;
            b.y = y;
            if(create){
                b.uid = uid;
                bodyList.push(b)
            }
        break;
        case 7://remove_body
            var uid = data.uid;
            if(get_body(uid)!=undefined){
                get_body(uid).remove();
            }
        break;
        default:
            console.log("unknown data received: "+data.msgName);
        break;
    }
}