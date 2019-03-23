//////////////////////////disable right  and zooming
var scale = 'scale(1)';
document.body.style.webkitTransform =  scale;    // Chrome, Opera, Safari
 document.body.style.msTransform =   scale;       // IE 9
 document.body.style.transform = scale;     // General
 
document.addEventListener('contextmenu', event => event.preventDefault());
var value = {
	//server_hostname:"http://g7handsome.ddns.net",
	server_hostname:"http://g7handsome.ddns.net",
	scene_width:800,
	scene_height:800,
	vision_width:2600,
	vision_height:768*2,
	realZoom:1,
	zoom:1,
	abilityTags:["attackDMG","health","speed","vision","coolDown"],
	evolutionDataList:[],
	evoluted:false,
	current_evolution:undefined,
	roles:["shooter","tank","bomber","smasher","iluminaty"]
}
var show_ability_levelup = false;
var show_ability_levelup_alpha = 0;
var show_evolution = false;
var show_evolution_alpha = 0;
var view_x = 0;
var view_y = 0;
var view_width = 0;
var view_height = 0;
var previous_detected_zoom = detectZoom.zoom();	
var textY = 0;
var textX = 0;
var socket = io.connect(value.server_hostname);
socket.on("Data",DataHandle);
var playerList = [];
var buttonList = [];
var inputList = [];
var bodyList = [];
var abilityButtons = [];
var playing = false;
let cX;
let cY;
function remove_body(m){
	m.master.matrix_array.remove(m)
	Matter.Composite.remove(world, m)
}
function setup(){
frameRate(60)
	useQuadTree(true);
	view_x = camera.position.x-width/2;
	view_y = camera.position.y-height/2;
	ShowingText = "unknown"
	Currenthostname = window.location.hostname;
	if(value.server_hostname.indexOf(Currenthostname)==-1){
		window.open(value.server_hostname)
	}else{
		canvas = createCanvas(innerWidth,innerHeight)
		canvas.position(0,0)
		inputName = new Input("tester",width/2,height/2-30,400,50,function(){
			if(!playing){
				this.position(width/2-this.width/2,height/2-30)
			}else{
				this.position(width+1000,height/2-30)
			}
		})
		b = new Button("Play",width/2,height/2+50,200,50,function(){
			if(!playing){
				this.position(width/2-this.width/2,height/2+50)
			}else{
				//console.log("fucking")
				this.position(-1000,height/2+50)
			}
		});
		var ww = 50
		var hh = 50
		for(var i = 0 ; i < 5 ; i++){
			var bt = new Button("+",-500,height-(hh+5)*(i+1),ww,hh)
			bt.index = i;
			bt.update = function()
			{
				var ww = 50
				var hh = 50
				if(show_ability_levelup){
					this.position(200,height-(hh+5)*(this.index+1))//this.position(-1000,height/2+50)
				}else{
					this.position(-500,this.position.y)
				}
				this.button.elt.innerHTML = playerData.playerLevel-get_ability_points()
			}
			bt.button.mousePressed(function(){
				
				sendMsg(10,{abilityID:this.master.index})
			})
				
			
			bt.set_css({
				"background-color": "yellow",
				"border": "2px solid white",
				"border-radius":"30px",
				color: "black",
				padding: "16px 16px",
				"text-align": "Center",
				"font-size": "20px", 
				margin: "2px 2px",
				opacity: "0.6",
				transition: "0.3s",
			})
			abilityButtons.push(bt);
		}
		//engine = Engine.create();
		//engine.world.gravity.y = 0;
		//world = engine.world;
		//Engine.run(engine);
		b.button.mousePressed(function(){
			sendMsg(13,{name:inputName.input.elt.value})
		})
	}
}
function draw(){
	//lock zoom
	view_width = value.vision_width/value.realZoom/1.25
	view_height = value.vision_height/value.realZoom/1.25
	view_x = (camera.position.x-view_width/2)
	view_y = (camera.position.y-view_height/2)
	textX = camera.position.x-width;
	textY = camera.position.y-height/2+50
	var p = get_myPlayer();
	show_ability_levelup = get_ability_points()<playerData.playerLevel;
	if(p==undefined){
		playing = false
	}else{
		playing = p.playing
	}
	cX = camera.position.x;
	cY = camera.position.y;
	if(width!=innerWidth||height!=innerHeight){
		canvas.resize(innerWidth,innerHeight)
	}
	background(0)
	stroke(255)
	strokeWeight(2)
	camera.on()
	//draw map
	draw_background();
	//draw ability level up;
	
	var ww = 200
	var hh = 50
	
	fill(80)
	camera.off()
	if(show_ability_levelup){
		show_ability_levelup_alpha = approach(show_ability_levelup_alpha,1)
	}else{
		show_ability_levelup_alpha = approach(show_ability_levelup_alpha,0.4)
	}
	for(var i = 0 ; i < 5 ; i++){
		//height-(hh+5)*(i+2),ww*100,hh*100
		var xx = ww/2;
		var yy = hh/2+height-(hh+5)*(i+1);
		var a = show_ability_levelup_alpha*255
		stroke(20,200,70,a)
		fill(20,250,250,a)
		rectMode(CENTER)
		rect(xx,yy,ww,hh,100,100)
		stroke(255,255,255,a+50);
		fill(0,0,0,a+50)
		textSize(20)
		strokeWeight(2)
		textAlign(CENTER)
		if(playerData.abilityLevel!=undefined){
			text(value.abilityTags[i]+" lv: "+playerData.abilityLevel[i],xx,yy+5)
		}
	}
	var a = show_evolution_alpha*255;
	
	if(show_evolution){
		show_evolution_alpha = approach(show_evolution_alpha,1)
	}else{
		show_evolution_alpha = approach(show_evolution_alpha,0)
	}
	if(show_evolution){
		if(keyIsPressed){
			if(keyCode==ascii("1")||keyCode==ascii("2")||keyCode==ascii("3")||keyCode==ascii("4")){
				var selectedID = int(keyCode)-49;//1 -> 0, 2->1,3->2,4->3
				sendMsg(11,{selectedID:selectedID})
			}
		}
	}
	if(value.current_evolution!=undefined){
		var e = value.current_evolution
		var s = e.selectTypes;
		var ll = 50
		var str1 = "";
		var str2 = "";
		for(var i = 0 ; i < s.length ; i++){
			var roleID = s[i];
			var str = value.roles[roleID]
			if(str!=undefined){
				var blank = ""
				for(var j = 0 ; j < str.length ; j++){
					blank=blank+" "
				}
				str1 +=blank+(i+1)+blank
				str2 +=" "+str+" "//text(str,width/2-(s.length)/2*ll+i*ll,height/2-100)
			}
		}
		stroke(255,255,255,show_evolution_alpha*255)
		noFill()
		strokeWeight(1)
		textSize(20)
		text(str1,width/2,height/2-100)
		text(str2,width/2,height/2-80)
	}
	camera.on();
	update_bodies();
	fill(50)
	for(var pp of playerList){
		pp.update();
	}
	for(var b of buttonList){
		b.update()
	}
	for(var i of inputList){
		i.update()
	}
	textSize(20)
	textAlign(LEFT)
	player_control();
	
	camera.off()
	draw_state()
	camera.on()
//camera zoom set
	//console.log(detectZoom.zoom(),detectZoom.device())
	var z = detectZoom.zoom()*innerWidth/innerHeight;
	value.realZoom = value.zoom/z
	previous_detected_zoom = z;
	if(previous_detected_zoom!=z){
		camera.zoom = value.realZoom;
	}else{
		camera.zoom = approach(camera.zoom,value.realZoom);
	}
	camera.off();
	var X = mouseX;
	var Y = mouseY;
	rectMode(CORNER)
	stroke(255)
	camera.off()
	//rect(0,height-280,250,400)
	camera.on()
	sendMouseData(undefined)
	if(mouseIsPressed){
		if(mouseButton==LEFT){
			if(!(show_ability_levelup_alpha>=0.8 && rectangle_collision(X,Y,1,1,0,height-280,250,400))){
				//console.log(playerData.cooldown_percent)

				if(playerData.cooldown_percent>=1){
					sendMouseData(0);//attack
				}else{
				}
			}
		}
		if(mouseButton==RIGHT){
			if(!(show_ability_levelup_alpha>=0.8 && rectangle_collision(X,Y,1,1,0,height-280,250,400))){
				if(playerData.cooldown_percent>=1){
					sendMouseData(0);//attack
				}
			}
		}
	}
	var nearest = {
		evolution:value.undefined,
		difference:Infinity
	}
	var level = playerData.playerLevel;
	for(var i = 0 ; i < value.evolutionDataList.length ; i++){
		var e = value.evolutionDataList[i];
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
	value.current_evolution = e;
	if(e!=undefined){
		var alreadyEvoluted = false;
		for(var t of e.selectTypes){//type of e
			if(t==playerData.role){
				alreadyEvoluted = true;
			}
		}
		if(!alreadyEvoluted){
			show_evolution = true;
		}else{
			show_evolution = false;
		}
	}
}
function sendMouseData(key){
	camera.on()
	var distance = point_distance(camera.position.x,camera.position.y,camera.mouseX,camera.mouseY)
	sendMsg(5,{key:key,x:camera.mouseX,y:camera.mouseY,distance:distance})
}
function player_control(){
	let up = keyIsDown(ascii("W"));
	let left = keyIsDown(ascii("A"));
	let down = keyIsDown(ascii("S"));	
	let right = keyIsDown(ascii("D"))
	up=up?1:0
	left=left?1:0
	down=down?1:0
	right=right?1:0
	if(up||left||down||right){
		let hspeed = right-left;
		let vspeed = down-up;
		let d = point_direction(0,0,hspeed,vspeed)

		if(hspeed!=false || vspeed!=false){
			sendMsg(9,{direction:d})
		}
	}else{
		sendMsg(8)
	}
}
/*
function keyPressed(){lue.server_hostname)
		alert("Connection Failed, connecting to '"+value.server_hostname+"'")
	}else{
		canvas = createCanvas(i

	if(keyCode == ascii('M')){
		
		//current_image = clamp_loop(current_image+1,0,2)
	}
}


function mousePressed(){
	
	
}
*/