var screenWidth = window.innerWidth*(90/100);
var screenHeight = screenWidth*(6/12);
var objectWidth = screenWidth/16;
var objectHeight = objectWidth;
var objectRealHeight = objectWidth*(0.6)
var objectsZ = objectHeight -objectRealHeight;
var playerMaxSteps = 15;

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = screenWidth;
        this.canvas.height = screenHeight;
        this.context = this.canvas.getContext("2d");
        document.getElementsByClassName("container")[0].appendChild(this.canvas);
        this.interval = setInterval(updateGameArea, 10);
  },
  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

function updateGameArea() {
  objects.sort(function(a,b) {return a.y - b.y}); //make sure lower elements are in front
  myGameArea.clear(); //clear screen
  for (var j = 0; j < objects.length; j++) {
    objects[j].update(); //draw each object
  }
  for (var j = 0; j < explosions.length; j++) {
    explosions[j].update();
  }
}

var objects = [];
var explosions = [];
var boxes = [];
var lines = [];
var player1;
var player2;

function startGame() {
    myGameArea.start();
    for (var j = 0; j < 12;j++) {
      // lines.push(new line(0, j*(objectRealHeight) + objectsZ, screenWidth, 5, "blue"));
      for (var k = 1; k < 16; k++) {
        // lines.push( new line(k*objectWidth, 0, 5, screenHeight, "red"));
        if (Math.floor(Math.random() * 2) == 0) {
          boxes.push(new box(k*objectWidth,j*(objectRealHeight) + objectsZ));
        }
      }
    }
    alert(boxes.length);
    player1 = new player(0,50,"ninja");
    // player2 = new player(objectWidth*3,0,"ninja");
}

//** For Editing
function line(x,y,width,height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    objects.push(this);
    this.update = function() {
      var ctx = myGameArea.context;
      ctx.fillStyle = color;
      ctx.fillRect(x,y,width,height);
    }
  }
//

function player(x,y,character) {
  objects.push(this);
  this.type = "character";
  this.x = x;
  this.y = y;
  this.width = objectWidth;
  this.height = objectHeight;
  this.direction = "down";
  this.steps = playerMaxSteps;
  this.frame = 0;
  this.speed = 9;
  this.bombCount = 10;
  this.explosionRange = 5;
  this.image = new Image();
  this.image.src = "../sprites/" + character + "/" + this.direction + this.frame + ".svg";
  this.update = function(){
      var ctx = myGameArea.context;
      ctx.drawImage(this.image,this.x, this.y, this.width, this.height);
      this.realx = this.x + 15;
      this.realy = this.y + 10;
      this.realWidth = this.width - 25;
      this.realHeight = objectRealHeight*(0.5);
      ctx.fillStyle = "rgba(50,50,50,0.5)"
      ctx.fillRect(this.realx,this.realy,this.realWidth,this.realHeight);
      move(this);
      // this.frame = this.steps % 5;
      this.image.src = "../sprites/" + character+ "/" + this.direction + this.frame + ".svg";
  }
}

function move(object) {
  if (object.steps < playerMaxSteps) {
    if (object.direction == "right" && checkCollision(object,object.speed,0)) {
      object.x+= object.speed;
      object.steps++;
    }
    if (object.direction == "left" && checkCollision(object,-object.speed,0)) {
      object.x-= object.speed;
      object.steps++;
    }
    if (object.direction == "up" && checkCollision(object,0,-object.speed)) {
      object.y-= object.speed;
      object.steps++;
    }
    if (object.direction == "down" && checkCollision(object,0,object.speed)) {
      object.y+= object.speed;
      object.steps++;
    }
  }
}

function checkCollision(collider, plusX, plusY) {
  if (collider.realx + plusX < 0 || collider.realx + collider.realWidth + plusX > screenWidth || collider.realy + plusY < objectsZ || collider.y + collider.height + plusY > screenHeight) {
    return false;
  }
  for (var j = 0; j < objects.length; j++) {
    if (objects[j] != collider && collider.realx + collider.realWidth + plusX > objects[j].x && collider.realx + plusX < objects[j].x + objects[j].width
     && collider.realy + collider.realHeight + plusY > objects[j].y && collider.realy + plusY < objects[j].y + objectRealHeight) {
       if (collider.type == "character" && objects[j].type == "box") {
         return false;
       }
       if (collider.type == "explosion" && objects[j] == "character") {
         alert(object[i].type + " hurt");
         return false;
       }
       if (collider.type == "bomb" && objects[j].type == "box") {
         objects[j].transform();
         return false;
       }
    }
  }
  return true;
}

document.addEventListener('keydown', keys);

function keys(e) {
  if (e.code == "ArrowRight") {
    player1.direction = "right";
    player1.steps = 0;
  }
  if (e.code == "ArrowLeft") {
    player1.direction = "left";
    player1.steps = 0;
  }
  if (e.code == "ArrowUp") {
    player1.direction = "up";
    player1.steps = 0;
  }
  if (e.code == "ArrowDown") {
    player1.direction = "down";
    player1.steps = 0;
  }
  if (e.code == "Space") {
    if (player1.bombCount > 0) {
      objects.push(new bomb(player1.x, player1.y, player1));
      player1.bombCount -= 1;
    }
  }
}

function box(x,y) {
    objects.push(this);
    this.prize = Math.floor(Math.random() * 4);
    this.x = x;
    this.y = y;
    this.width = objectWidth;
    this.height = objectHeight;
    this.frame = 0;
    this.type = "box";
    this.image = new Image();
    this.update = function() {
      var ctx = myGameArea.context;
      this.image.src = "../sprites/" + this.type + "/" + this.type + this.frame + ".svg";
      ctx.drawImage(this.image,this.x, this.y, this.width, this.height);
    }
    this.transform = function() {
      if (this.prize == 0) {
        this.type = "plusSpeed";
      }
      if (this.prize == 1) {
        this.type = "plusSpeed";
      }
      if (this.prize == 2) {
        this.type = "plusRange";
      }
      if (this.prize == 3) {
        this.type = "plusBomb";
      }
    }
}

function bomb(x,y,player) {
    this.x = Math.floor( (x + objectWidth/3) / objectWidth) * objectWidth + 40;
    this.y = Math.floor(y / objectRealHeight) * objectRealHeight + objectsZ;
    this.realx = this.x;
    this.realy = this.y;
    this.player = player;
    this.width = objectWidth;
    this.realWidth = this.width;
    this.height = objectHeight;
    this.realHeight = objectRealHeight;
    this.frame = 0;
    this.type = "bomb";
    this.image = new Image();
    this.image.src = "../sprites/" + this.type + "/" + this.type + this.frame + ".svg";
    this.counter = 300;
    this.update = function() {
      this.counter--;
      if (Math.floor(this.counter/100) <= 0) {
        remove(this, objects);
        objects.push(new explosion(bomb.x,bomb.y,bomb.player))
        explode(this,1,0);
        explode(this,-1,0);
        explode(this,0,1);
        explode(this,0,-1);
        player.bombCount++;
      }
      var ctx = myGameArea.context;
      ctx.font = "40px Arial";
      ctx.fillText( Math.floor(this.counter/100), this.x + (objectWidth/3), this.y + objectHeight/1.5);
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

function explode(bomb, xDir, yDir) {
    for (var i = 1; i < bomb.player.explosionRange; i++) {
      if (checkCollision(bomb, xDir*i*objectWidth, yDir*i*objectHeight - objectsZ + 10)) {
        explosions.push(new explosion(bomb.x + xDir*i*objectWidth, bomb.y + yDir*i*objectHeight, bomb.player));
      }
    }
}

function explosion(x,y,player) {
    this.x = x;
    this.y = y;
    this.player = player;
    this.width = objectWidth*(0.9);
    this.height = objectHeight*(0.9);
    this.frame = 0;
    this.type = "explosion";
    this.image = new Image();
    this.image.src = "../sprites/" + this.type + "/" + this.type + this.frame + ".png";
    this.counter = 50;
    var j = 0;
    this.update = function() {
      this.counter--;
      if (this.counter <= 0) {
        remove(this,explosions);
      }
      var ctx = myGameArea.context;
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

function remove(object, from) {
    for(var j = 0; j < from.length; j++) {
      if (from[j] == object) {
        from.splice(j,1);
      }
    }
}
