
class Body{
    constructor(x,y){
        this.uid = ""
        this.x = x;
        this.y = y;
        this.realAngle = 0;
        this.realX = x;
        this.realY = y;
        this.color = [255,255,255]
    }
    remove(){
        bodyList.remove(this)
    }
}
function get_body(uid){
    return bodyList.find(x=>x.uid===uid)
}
function update_bodies(){
    for(var b of bodyList){
        var dis = point_distance(b.x,b.y,camera.position.x,camera.position.y);
        if(dis<value.vision_width){
            push();
            translate(b.realX,b.realY)
            strokeWeight(1)
            fill(0,0,0,0)
            rotate(b.realAngle)
            switch(b.label){
                case 0://matrix
                    stroke(b.color)
                    textSize(b.radius*2)
                    textAlign(CENTER);
                    text(round(b.life),0,0)
                break;
                case 1://circle
                    ellipseMode(CENTER)
                    noFill()
                    if(b.color!=undefined){
                        stroke(b.color)
                    }else{
                        stroke()
                    }
                    ellipse(0,0,b.radius*2,b.radius*2)
                break;
                case 2://rectangle
                    noFill()
                    stroke(255)
                    rectMode(CENTER)
                    rect(0,0,b.width,b.height)
                break;
            }
            rotate(0)
            pop();
                
            var s = 0.5
            b.realAngle = approach(b.realAngle,b.angle)
            b.realX = approach(b.realX,b.x,s)
            b.realY = approach(b.realY,b.y,s)
        }else{
            bodyList.remove(b)
        }
    }

}