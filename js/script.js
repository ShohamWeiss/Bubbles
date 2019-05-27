var screenWidth = window.innerWidth*(90/100);
var screenHeight = screenWidth*(6/12);
var objectWidth = screenWidth/16;
var objectHeight = objectWidth;
var objectRealHeight = objectWidth*(0.6)
var objectsZ = objectHeight -objectRealHeight;
var playerMaxSteps = 20;

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
  // for (var j = 0; j < editing.length; j++) {
  //   editing[j].update();
  // }
}

var objects = [];
var explosions = [];
var boxes = [];
var editing = [];
var player1;
var player2;

function startGame() {
    myGameArea.start();
    for (var j = 0; j < 12;j++) {
      // editing.push(new line(0, j*(objectRealHeight) + objectsZ, screenWidth, 5, "blue"));
      for (var k = 0; k < 16; k++) {
        // editing.push( new line(k*objectWidth, 0, 5, screenHeight, "red"));
        if (j < 2 && k < 2 || j > 9 && k > 13) {
          continue;
        }
        if (Math.floor(Math.random() * 2) == 0) {
          boxes.push(new box(k*objectWidth,j*(objectRealHeight) + objectsZ));
        }
      }
    }
    player1 = new player(0,objectsZ,"ninja");
    player2 = new player(objectWidth*15,objectHeight*7,"ninja");
}

//** For Editing
function line(x,y,width,height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
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
  this.speed = 6;
  this.bombCount = 1;
  this.explosionRange = 2;
  this.stuck = false;
  this.image = new Image();
  this.image.src = "../sprites/" + character + "/" + this.direction + this.frame + ".png";
  this.update = function(){
      var ctx = myGameArea.context;
      ctx.drawImage(this.image,this.x, this.y, this.width, this.height);
      this.realx = this.x + 20;
      this.realy = this.y + 10;
      this.realWidth = this.width - 35;
      this.realHeight = objectRealHeight*(0.5);
      // ctx.fillStyle = "rgba(50,50,50,0.5)"
      // ctx.fillRect(this.realx,this.realy,this.realWidth,this.realHeight);
      move(this);
      this.image.src = "../sprites/" + character+ "/" + this.direction + this.frame + ".png";
  }
  this.transform = function(){
      this.direction = "stuck";
      this.frame = 0;
      this.stuck = true;
  }
}

function move(object) {
  if (object.steps < playerMaxSteps) {
    if (object.direction == "right" && checkCollision(object,object.speed,0,objects)) {
      object.x+= object.speed;
      object.steps++;
      object.frame = Math.floor(object.steps/10) % 5;
    }
    if (object.direction == "left" && checkCollision(object,-object.speed,0,objects)) {
      object.x-= object.speed;
      object.steps++;
      object.frame = Math.floor(object.steps/10) % 5;
    }
    if (object.direction == "up" && checkCollision(object,0,-object.speed,objects)) {
      object.y-= object.speed;
      object.steps++;
      object.frame = 0;
    }
    if (object.direction == "down" && checkCollision(object,0,object.speed,objects)) {
      object.y+= object.speed;
      object.steps++;
      object.frame = Math.floor(object.steps/10) % 5;
    }
  }
}

function checkCollision(collider, plusX, plusY, collided) {
  if (collider.realx + plusX < 0 || collider.realx + collider.realWidth + plusX > screenWidth || collider.realy + plusY < objectsZ || collider.y + collider.height + plusY > screenHeight) {
    return false;
  }
  for (var j = 0; j < objects.length; j++) {
    if (collided[j] != collider && collider.realx + collider.realWidth + plusX > collided[j].x && collider.realx + plusX < collided[j].x + collided[j].width
     && collider.realy + collider.realHeight + plusY > collided[j].y && collider.realy + plusY < collided[j].y + objectRealHeight) {
       if (collided[j].type == "box") {
         collider.steps = playerMaxSteps;
         return false;
       }
       if (collided[j].type == "plusSpeed") {
         remove(collided[j],collided);
         collider.speed += 1;
       }
       if (collided[j].type == "plusRange") {
         remove(collided[j],collided);
         collider.explosionRange += 1;
       }
       if (collided[j].type == "plusBomb") {
         remove(collided[j],collided);
         collider.bombCount += 1;
       }
    }
  }
  return true;
}

document.addEventListener('keydown', keys);

function keys(e) {
  if (e.code == "ArrowRight" && !player1.stuck) {
    player1.direction = "right";
    player1.steps = 0;
  }
  if (!player1.stuck && e.code == "ArrowLeft") {
    player1.direction = "left";
    player1.steps = 0;
  }
  if (!player1.stuck && e.code == "ArrowUp") {
    player1.direction = "up";
    player1.steps = 0;
  }
  if (!player1.stuck && e.code == "ArrowDown") {
    player1.direction = "down";
    player1.steps = 0;
  }
  if (e.code == "Space") {
    if (player1.bombCount > 0) {
      objects.push(new bomb(player1.x, player1.y, player1));
      player1.bombCount -= 1;
    }
  }
  if (e.code == "KeyD") {
    player2.direction = "right";
    player2.steps = 0;
  }
  if (e.code == "KeyA") {
    player2.direction = "left";
    player2.steps = 0;
  }
  if (e.code == "KeyW") {
    player2.direction = "up";
    player2.steps = 0;
  }
  if (e.code == "KeyS") {
    player2.direction = "down";
    player2.steps = 0;
  }
  if (e.code == "ShiftLeft") {
    if (player2.bombCount > 0) {
      objects.push(new bomb(player2.x, player2.y, player2));
      player2.bombCount -= 1;
    }
  }
}

function box(x,y) {
    objects.push(this);
    this.prize = Math.floor(Math.random() * 6);
    this.x = x;
    this.y = y;
    this.width = objectWidth;
    this.height = objectHeight;
    this.frame = 0;
    this.type = "box";
    this.image = new Image();
    this.update = function() {
      var ctx = myGameArea.context;
      this.image.src = "../sprites/" + this.type + "/" + this.type + this.frame + ".png";
      ctx.drawImage(this.image,this.x, this.y, this.width, this.height);
    }
    this.transform = function() {
      if (this.prize < 3) {
        remove(this,objects);
      }
      else if (this.prize == 4) {
        this.type = "plusSpeed";
      }
      else if (this.prize == 5) {
        this.type = "plusRange";
      }
      else {
        this.type = "plusBomb";
      }
    }
}

function bomb(x,y,player) {
    this.x = Math.floor( (x + objectWidth/3) / objectWidth) * objectWidth;
    this.y = Math.floor( (y + objectsZ) / objectRealHeight) * objectRealHeight;
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
    this.image.src = "../sprites/" + this.type + "/" + this.type + this.frame + ".png";
    this.counter = 300;
    this.update = function() {
      this.counter--;
      this.frame = Math.floor(this.counter/7) % 5;
      this.image.src = "../sprites/" + this.type + "/" + this.type + this.frame + ".png";
      if (Math.floor(this.counter/100) <= 0) {
        remove(this, objects);
        explode(this,1,0);
        explode(this,-1,0);
        explode(this,0,1);
        explode(this,0,-1);
        player.bombCount++;
      }
      var ctx = myGameArea.context;
      // ctx.font = "40px Arial";
      // ctx.fillText( Math.floor(this.counter/100), this.x + (objectWidth/3), this.y + objectHeight/1.5);
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    this.transform = function() {
      this.counter = 0;
    }
}

function explode(bomb, xDir, yDir) {
  var leave = false;
  var dir = "ver"
  if (xDir != 0) {
    dir = "hor";
  }
    for (var i = 0; i < bomb.player.explosionRange; i++) {
      for (var j = 0; j < objects.length; j++) {
        // editing.push(new dot(bomb.x + xDir*i*objectWidth + objectWidth/2, bomb.y + yDir*i*objectRealHeight + objectHeight/2, "yellow"));
        if (bomb.x + xDir*i*objectWidth + objectWidth/2 > objects[j].x && bomb.x + xDir*i*objectWidth + objectWidth/2 < objects[j].x + objectWidth
          && bomb.y + yDir*i*objectRealHeight + objectRealHeight/2 > objects[j].y && bomb.y + yDir*i*objectRealHeight + objectRealHeight/2 < objects[j].y + objectRealHeight) {
            // editing.push(new dot(objects[j].x,objects[j].y, "red"));
            if (objects[j].type == "character" || objects[j].type == "box" || objects[j].type == "explosion") {
              leave = true;
            }
            objects[j].transform();
            if (leave) {
              break;
            }
          }
          else {
            explosions.push(new explosion(bomb.x + xDir*i*objectWidth, bomb.y + yDir*i*objectRealHeight, bomb.player,dir));
          }
      }
      if (leave) {
        break;
      }
    }
}

//for Editing
function dot(x,y,color) {
  this.x = x;
  this.y = y;
  this.width = 10;
  this.height = 10;
  this.color = color;
  this.update = function(){
    var ctx = myGameArea.context;
    ctx.fillStyle = color;
    ctx.fillRect(this.x,this.y,this.width,this.height);
  }
}

function explosion(x,y,player,dir) {
    this.x = x;
    this.y = y;
    this.player = player;
    this.dir = dir;
    this.width = objectWidth;
    this.height = objectHeight;
    this.frame = 0;
    this.type = "explosion";
    this.image = new Image();
    this.image.src = "../sprites/" + this.type + "/" + this.type + this.dir + this.frame + ".png";
    this.counter = 100;
    var j = 0;
    this.update = function() {
      this.counter--;
      if (this.counter <= 0) {
        remove(this,explosions);
      }
      this.frame = (this.counter) % 6;
      var ctx = myGameArea.context;
      this.image.src = "../sprites/" + this.type + "/" + this.type + this.dir + this.frame + ".png";
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
