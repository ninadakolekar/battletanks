
var leftflag =true ;         //indicates if you are able to move left 
var rightflag =true ;        //indicates if you are able to move right
var myID;                    //the ID of tank is stored in myID
var myIDset =false;          //indicates whether you have recieved your ID from the server 
var angle_1;                 //keeps track of the rotation of tank
var upflag =true;            //indicates if you are able to move up
var downflag=true;           //indicates if you are able to move down
var hit_wall =false;         //indicates if the bullet fired has collided with walls
var attempts =3;             //the number of attempts a tank can take
var healthbar =5 ;           //A bar indicating the healthstatus of the tank
var exit = false ;           //exit is true if you have consumed all attempts
var bulletcount= 0;          // Index of the Bullet which will be fired next  
var ismoving = false;        //indicates if the tank is moving or not
var won =false;              //won becomes true if you win
var lost=false;              //lost becomes true if you lose
var bullet_shot =0;          //Index of the fired bullet
var center_x=0;              //X coordinate of the tank
var center_y =0;             //Y coordinate of the tank
var update;                  //copy msg JSON of other tank in update
var broken_tile=-1;          //indicates the index of the tile which has broke 
var x=0;                     //indictes the change in the xcoordinate of the tank 
var y=0;                     //indicates the change in the y coordinate of the tank
var iBar =[];                //inner bars of the healthstatus of other player tanks
var oBar=[];                 //outer bars of the healthstatus of the other tanks 
var socket = new WebSocket("ws://golang-battletanks.herokuapp.com/"); //a new websocket is initialised to create a link between the server and the client who requested 



let Application = PIXI.Application,         //aliases for convinience 
   Container = PIXI.Container,
   loader = PIXI.loader,
   resources = PIXI.loader.resources,
   TextureCache = PIXI.utils.TextureCache,
   Sprite = PIXI.Sprite,
   Rectangle = PIXI.Rectangle;
   pi=Math.PI;

let app = new Application({                //A basic layout on which the game will be rendered 
   width: 1400,
   height: 1400,
   antialiasing:true,
   transparent: true,
   resolution: 1
 }
);


let style = new PIXI.TextStyle({          //Introducing styles in  PIXI text
  fontFamily: "Arial",
  fontSize: 36,
  fill: "white",
  stroke: '#ff3300',
  strokeThickness: 4,
  dropShadow: true,
  dropShadowColor: "#000000",
  dropShadowBlur: 4,
  dropShadowAngle: Math.PI / 6,
  dropShadowDistance: 6,
});


let style2 = new PIXI.TextStyle({        // Introducing styles in  PIXI text
  fontFamily: "Arial",
  fontSize: 20,
  fontWeight: 'bold',
});


sounds.load([                          // fill the sounds array with your sound files 
  "sounds/movement.mp3",
  "sounds/collision.mp3"
]);

sounds.whenLoaded = load_comp;         //once loaded in the array invoke callback function load_comp

document.body.appendChild(app.view);//

let dungeon, tank, id, grid_t, state, move_state=38, midx, midy,healthstatus,bullet, angle, bullet_fired=false,d, bul_mov_state=38,movement ,collide,message1,message2,treasure, p1, p2, p3, p4, brick_index = -1;
let bricks=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,59,60,65,66,67,68,70,71,72,73,74,75,76,77,78,79,81,82,83,84,89,90,91,118,119,120,121,148,149,150,152,155,156,157,158,159,170,171,172,173,174,177,179,180,182,185,204,207,209,210,212,215,217,218,219,230,231,232,234,237,239,240,242,245,247,262,264,267,269,270,275,277,292,294,299,300,302,307,312,317,322,327,329,330,332,334,335,336,337,341,343,344,345,346,348,352,353,354,355,357,359,360,362,387,389,390,392,401,408,417,419,420,422,431,438,447,449];
let broken=[33,34,55,56,63,64,69,80,85,86,92,93,94,99,110,115,116,117,122,123,129,140,146,147,160,169,190,199,220,221,222,227,228,229,249,252,257,260,272,273,274,278,279,282,283,284,285,286,287,290,291,295,296,297,333,342,347,356,363,371,374,375,378,386,404,405,432,433,436,437];
let grid = []                      
let grid2 = [];
let ammo =[];       //array of bullets
let other_ammo=[];  //array of bullets handled by tank objects;
let other_tank=[] ,other_healthstatus= [], other_center_x =[] , other_center_y= [] ,other_bullet,other_bulletcount; // arrays of object tanks ,bullets ,healthstatus 
var setupDone = false;  // boolean indicating if setup is finished
var updateDone = false; //boolean indicating if a update has finished 

/*
This function is invoked  when a requestUpdate message is generated at socket
The client (tank ) then sends the json object of itself
*/


function sendUpdate() {

let tempv;
if(bulletcount == 0)                   //
  tempv=true;
else
  tempv=ammo[bulletcount-1].visible;
 var updateObject = {                  // send the json object 

"id":myID,
"message":"updateResponse",
"tank_x" :tank.x ,
"tank_y" :tank.y ,
"rotationIncrement":angle,
"bulletCount":bulletcount ,
"bullet_x":ammo[bullet_shot].x,
"bullet_y":ammo[bullet_shot].y,
"other_x":ammo[bulletcount].x,
"other_y":ammo[bulletcount].y,
"center_x":center_x,
"center_y":center_y,
"health": healthstatus.outer.width ,
"exit": exit,
"won": won,
"tile_index":broken_tile ,
"collision_tile_index": brick_index,
"hitwall":hit_wall,
"tankVisible":tank.visible,
"bulletVisible":tempv
} ;

angle=0;
broken_tile=-1;

socket.send(JSON.stringify(updateObject));                   //send via socket after stringify

}



/*apply update to  instances of  other tanks when applyUpdate message generated by the server*/

function applyUpdate(msg) {
    updateDone = false;
    update = msg ;
  if(won ==true){                   //if won no need to proceed and apply updates

      return;
  }

    

   if(msg.id != myID) {              //not to update oneself
    
       if(msg.exit==true){          //if exit is true ,then disappear that other tank


      for (var i = msg.bulletCount; i < 100; i++) { 

        other_ammo[msg.id*100 +i].visible =false;   
      }

      other_tank[msg.id].visible =false;
      
      return;
    }
    else {
     
      other_tank[msg.id].visible =true;
    }


    if(msg.rotationIncrement != 0) {                 //rotate  other tank  accordingly 

      for (var i = msg.bulletCount; i < 100; i++){ 
        other_ammo[msg.id*100+ i].visible =true ;
        other_ammo[msg.id*100+i].rotation += msg.rotationIncrement ;
        }
      other_tank[msg.id].rotation += msg.rotationIncrement;
     
      
    } 
    
    else {                                    // change the coordinates 

      other_tank[msg.id].x = msg.tank_x;        
      other_tank[msg.id].y = msg.tank_y;
      other_center_x[msg.id] = msg.center_x;
      other_center_y[msg.id] = msg.center_y; 
         
      for (var i = msg.bulletCount; i < 100; i++){
        other_ammo[msg.id*100+i].visible =true ;
        other_ammo[msg.id*100+i].x =msg.other_x ;
        other_ammo[msg.id*100+i].y =msg.other_y;
      }

    }


    if(msg.id + msg.bulletCount >0)    //avoids Typeerror
      {other_ammo[100*msg.id + msg.bulletCount-1].visible = msg.bulletVisible;}

    other_bulletcount = msg.bulletCount;

    if(msg.bulletCount !== 0){                                      //that means a bullet has been fired by other tank ,update it 
      {other_ammo[ 100*msg.id + msg.bulletCount-1].x = msg.bullet_x;
      other_ammo[100*msg.id + msg.bulletCount-1].y =msg.bullet_y;}


        x_temp = (msg.bullet_x-15+(msg.bullet_x-15)%30)/30;
    	y_temp = (msg.bullet_y-15+(msg.bullet_y-15)%30)/30;


     detect_tb();                                        // detecting tank bullet collision       

    }

    other_healthstatus[msg.id].outer.width = msg.health;   //update healthstatus

    if(msg.tile_index !=-1)                                //update if tile is broken
    {
     grid2[msg.tile_index].visible =false;
     other_ammo[100*msg.id + msg.bulletCount-1].visible = false;
    }
  

    if(update.won == true)                              //if other tank has won  update tank  and remove it and  blank out the screen with message
          {     
                healthstatus.outer.width = 0;
                for(i=0 ;i<100 ;i++)
                {
                  app.stage.removeChild(ammo[i]); 
                
                }

                for(i=0 ;i<400 ;i++){
                 app.stage.removeChild(other_ammo[i]);
                }

               for(i=0 ;i<=3 ;i++){
                app.stage.removeChild(other_tank[i]);
                //other_tank[i].visible =false;
                app.stage.removeChild(other_healthstatus[i]);

               }
              
                tank.visible = false;
                tank.vx =0;
                tank.vy =0;

                for(i=0; i<bricks.length; i++){
                   
                    grid[bricks[i]].visible=false;
                }

                for(i=0; i<broken.length; i++){
                  grid2[broken[i]].visible=false;
                }
                
                treasure.visible =false;
                dungeon.visible =false ;
                app.stage.addChild(message1);
                lost =true;
          return ;

          }

  }



   updateDone = true;   //update has been done
}

/* socket on  creation invokes a callback function */
socket.onopen = function(){                            
        alert("Websocket Connection Established!!");
        loader
        .add("images/sirowa.json")
        .load(setup);
};

 /*on recieving message  check it's type and then execute a function accordingly*/

socket.onmessage = function (evt){                          
                    var received_msg  = evt.data;
                    var msg_obj = JSON.parse(received_msg)
                    if(msg_obj.message == "requestUpdate") {if(setupDone==true) sendUpdate();}
                    else if(msg_obj.message == "notifyID") {var x = msg_obj.id; myID = x;myIDset=true;}
                    else if(msg_obj.message == "applyUpdate") { if(setupDone==true) {applyUpdate(msg_obj);} 
                    
                    }
};


 function load_comp(){                             

         movement = sounds["sounds/movement.mp3"];
         collide = sounds["sounds/collision.mp3"];
 }

/* associate response to the key presses and releases*/

function key_init(){                                                                       

let   left = keyboard(37),
      up = keyboard(38),
      right = keyboard(39),
      down = keyboard(40);
      w = keyboard(87);

left.press = () =>{                                                                        //is invoked when left key presssed 
                    
                    if((check_tank_col(2) && (move_state == 37 || move_state == 39) ) || exit==true){   //checking move states and collisions ..if collision then no action
                      return;
                    }
                    
                    console.log("a1");
                    leftflag =true;
                    if(move_state == 37 || move_state == 39){                          //decide function according to move state 
                      leftloop();
                    }
                    else{
                      rot(37);
                    }
                    tank.pivot.set(15,15);

                  };

left.release =() => {                                                                     // is invoked when left key is released 
                      console.log("a2");
                      leftflag =false ;
                    };


right.press=()=>{                                                                         //is invoked when right key presssed

                  if((check_tank_col(1) && (move_state == 37 || move_state == 39))|| exit==true ){  //checking move states and collisions ..if collision then no action
                        return;
                  }
                  console.log("a3");
                  rightflag =true ;

                  if(move_state == 37 || move_state == 39){                             //decide function according to move state
                      rightloop();
                  }
                  else{
                        rot(39);
                  }
                  
                  tank.pivot.set(15,15);
              } ;

right.release=()=>{                                                                   //is invoked when right key released
                    console.log("a4");
                    rightflag =false ;
                  } ;


up.press = () => {                                                                                                 //is invoked when up key pressed

                    if( (check_tank_col(4) && (move_state == 38 || move_state == 40)) ||exit ==true  ) {   //checking move states and collisions ..if collision then no action
                           
                          return;
                        }
  
                    upflag=true
                    console.log("a5");
                    if(move_state == 38 || move_state == 40){                                            //decide a fnction to execute
                      uploop();
                    }
                    else{
                      rot(38);
                    }
                    tank.pivot.set(15,15);
                };



up.release = () => {                                                                                            //is invoked when up key released
                        console.log("a6");
                        upflag =false;
                    };


down.press = () => {                                                                                       // is invoked when down is presssed

                      if((check_tank_col(3) && (move_state == 40 || move_state == 38))|| exit==true){      //checking move states and collisions ..if collision then no action
                        
                              return;
                      }
                      
                      console.log("a7");
                      downflag =true;
                      if(move_state == 40 || move_state == 38){                                           //decide a function to execute             
                        downloop();
                      }
                      else{
                      rot(40);
                      }
                      tank.pivot.set(15,15);
                  };

down.release = () => {                                                                                  //is invoked when down key is released 
                       console.log("a8");
                       downflag =false ;
                      };

w.press =()=>{                                                                                          //is invoked when w key pressed
                if(exit == true)
                {return ;}
               if(bullet_fired){                                                                        //checking if the other bullet has released 
                 return;
               }
               else if (bulletcount <100)                                                           //set the rotation of the bullet and also incrase the bullet count
               { 
                 bullet_fired = true;                                                               
                 bullet_shot =bulletcount ;
                 bulletcount++;                                  
                 angle_1=tank.rotation;
                 bulletmove();                                                                   
                 console.log(bulletcount + " is the bulletcount");
                }
                
           }

}

/*initialise the healthstatus of all tanks*/

function health_init(){                                                                     

p1 = new PIXI.Text("Player 1",style2);
p2 = new PIXI.Text("Player 2",style2);
p3 = new PIXI.Text("Player 3",style2);
p4 = new PIXI.Text("Player 4",style2);
                                                                 //set the positions of healthbars 
p1.position.set(1000,240);
p2.position.set(1000,330);
p3.position.set(1000,510);
p4.position.set(1000,600);

app.stage.addChild(p1);
app.stage.addChild(p2);
app.stage.addChild(p3);
app.stage.addChild(p4);



healthstatus  = new PIXI.DisplayObjectContainer();                // define a container for healthstatus ;                     

let innerBar = new PIXI.Graphics();                              // defining graphics bar 
innerBar.beginFill(0x000000);
innerBar.drawRect(0,0, 125, 8);
innerBar.endFill();
healthstatus.addChild(innerBar);

let outerBar = new PIXI.Graphics();
outerBar.beginFill(0xFF3300);
outerBar.drawRect(0, 0, 125, 8);
outerBar.endFill();
healthstatus.addChild(outerBar);
healthstatus.outer = outerBar;

  for(i=0 ;i<=3 ;i++){                                       //other tank  healthstatus initialised ,position set according to  myID
    
  if(i!= myID)
  {
  other_healthstatus[i]= new PIXI.DisplayObjectContainer();
  iBar[i] = new PIXI.Graphics();
  iBar[i].beginFill(0x000000);
  iBar[i].drawRect(0,0, 125, 8);
  iBar[i].endFill();
  other_healthstatus[i].addChild(iBar[i]);

  oBar[i] = new PIXI.Graphics();
  oBar[i].beginFill(0xFF3300);
  oBar[i].drawRect(0, 0, 125, 8);
  oBar[i].endFill();
  other_healthstatus[i].addChild(oBar[i]);
  other_healthstatus[i].outer = oBar[i];
  }

}
  if(myID%4 == 0)
{

 healthstatus.position.set(1100,240);
 app.stage.addChild(healthstatus);
 other_healthstatus[1].position.set(1100, 330);
 other_healthstatus[2].position.set(1100, 510);
 other_healthstatus[3].position.set(1100, 600);

}
else if(myID%4 == 1){

  healthstatus.position.set(1100, 330);
  app.stage.addChild(healthstatus);
  other_healthstatus[0].position.set(1100,240);
  other_healthstatus[2].position.set(1100,510);
  other_healthstatus[3].position.set(1100,600);


}
else if(myID%4 == 2){
 
  healthstatus.position.set(1100,510);
  app.stage.addChild(healthstatus);
  other_healthstatus[0].position.set(1100,240);
  other_healthstatus[1].position.set(1100,330);
other_healthstatus[3].position.set(1100,600);

}
else if(myID%4 == 3){

  healthstatus.position.set(1100,600);
  app.stage.addChild(healthstatus);
  other_healthstatus[0].position.set(1100,240);
  other_healthstatus[1].position.set(1100, 330);
  other_healthstatus[2].position.set(1100, 510);
}

for(i=0 ;i<=3;i++)                                        
{  if(i!==myID)
  {app.stage.addChild(other_healthstatus[i]);}
}
  


}

/*computes the coordinates of bricks and broken for forming  the maze*/

function completeMaze(){                       
  
  let ctr = bricks.length;

  for(i=bricks.length-1; i>-1; i--){         
    bricks[ctr] = 899-bricks[i];
    ctr++;
  }

  ctr = broken.length

  for(i=broken.length-1; i>-1; i--){
    broken[ctr] = 899-broken[i];
    ctr++;
  }
}

/*initialise  the stage ,tanks,treasure with coordinates ,size  and render them on the screen*/

function init(){                          

 completeMaze();
 message1 = new PIXI.Text("YOU LOST",style);    // initialising win ,lose messages  
 message2 =new PIXI.Text("YOU WON",style);
 message1.position.set(450 ,450);
 message2.position.set(450,450);


 let dungeonTexture = TextureCache["ground.png"];    //load the texturecache
 dungeon = new Sprite(dungeonTexture);
 app.stage.addChild(dungeon);
 tank = new Sprite(resources["images/sirowa.json"].textures["tank12.png"]);  // genrating sprite for tanks
for(i=0;i<=3;i++)
{ 
  other_tank[i] = new Sprite(resources["images/sirowa.json"].textures["tank12.png"]);  // genrating sprite for tanks
  other_tank[i].width=30;
  other_tank[i].height=30;
  
}

other_tank[0].tint = 0xff3300;             
other_tank[1].tint = 0x008000;
other_tank[2].tint = 0x0000FF;


 bullet = new Sprite( resources["images/sirowa.json"].textures["missile.png"]);   //sprite generation for other textures

 other_bullet = new Sprite( resources["images/sirowa.json"].textures["missile.png"]);

 treasure =  new Sprite( resources["images/sirowa.json"].textures["treasure.png"]);

 tank.width=30;
 tank.height=30;

 treasure.width =50;
 treasure.height =30;
 }

/* initialise conditions and coordinates of tanks  */
function setup() {

  init();           

 while(!myIDset){};   

 if(myID%4 == 0)            //decide positions according to ID
{
 tank.x = 30;
 tank.y=30;
 midx = 45;
 midy =45;
 center_x = 45;
 center_y =45;
 tank.tint = 0xff3300;
}
else if(myID%4 == 1){  
  tank.x =840;
  tank.y=840;
  midx =855;
  midy=855;
  center_x =855;
  center_y =855;
  tank.tint=0x008000
}
else if(myID%4 == 2){
  tank.x =30;
  tank.y=840;
  midx =45;
  midy=855;
  center_x = 45;
  center_y = 855;
  tank.tint=0x0000FF
}
else if(myID%4 == 3){
	tank.x = 840;
	tank.y = 30;
	midx = 855;
	midy = 45;
	center_x = 855;
	center_y = 45;
}
treasure.x = 425 ;
 treasure.y =435 ;
 tank.vx = 4;
 tank.vy = 4;
 other_tank.vx =4;
 other_tank.vy =4;


treasure.x = 425 ;
treasure.y =435 ;

tank.vx = 4;
tank.vy = 4;
app.stage.addChild(tank);

for(i=0;i<=3;i++){
  if(i!=myID)
  {
   other_tank[i].vx =4;
   other_tank[i].vy =4;
   app.stage.addChild(other_tank[i]);
  }
 }

app.stage.addChild(treasure);

make_grid();    //grid is to be made 
make_ammo();   //ammo array is generated by make_ammo()

health_init();
key_init();

state = play;
app.ticker.add(delta => gameLoop(delta));  //initialise gameloop with play state
setupDone = true;
console.log("end");

 }

/* checks collision */
 function hitTestRectangle(r1, r2) {

  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {

    //A collision might be occuring. Chaeck for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {

      //There's definitely a collision happening
      hit = true;
    } else {

      //There's no collision on the y axis
      hit = false;
    }
  } else {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
};

/*rotation function   which rotates according to input move state*/

 function rot(r_state){                                     
                       angle=pi/2.0;
                       let final, x=0, y=0;
                       if(move_state == 38)
                       {
                         if(r_state == 37)
                         {
                            angle*=-1;
                            y=30;
                          }
                         else
                         {
                           x=30;
                         }
                      }
                       else if(move_state == 39)
                       {
                         if(r_state == 38)
                         {
                           angle*=-1;
                           x=-30;
                         }
                         else
                         {
                           y=30;
                         }
                       }
                       else if(move_state == 40)
                       {
                         if(r_state == 39)
                         {
                           angle*=-1;
                           y=-30;
                         }
                         else
                         {
                           x=-30;
                         }
                       }
                       else{
                         if(r_state == 40)
                         {
                           angle*=-1;
                           x=30;
                         }
                         else
                         {
                           y=-30;
                         }
                       }
                       
                       tank.rotation+=angle;
                       tank.x+=x;
                       tank.y+=y;
                       for(i=bulletcount; i<100; i++){
                          ammo[i].rotation +=angle ;
                          
                        }
                       bul_mov_state = r_state;
                       move_state = r_state;
                       console.log("rot_done "+tank.x+" "+tank.y+" "+tank.pivot.x+" "+tank.pivot.y+" "+move_state);
     }


/*genrates array of ammos  and fix their positions */
function make_ammo(){
                      var bull = TextureCache["missile.png"];
                      for(i=0; i<100; i++){
                       ammo[i] = new Sprite(bull);
                       ammo[i].x =tank.x+15;
                       ammo[i].y =tank.y+15;
                       ammo[i].scale.set(0.1,0.1);
                       ammo[i].anchor.set(0.5 ,0.5);
                       ammo[i].rotation -= Math.PI*0.5 ;
                       app.stage.addChild(ammo[i]);
                        console.log("size of bullet : "+ ammo[i].width +" "+ammo[i].height);

                       }

                       for(i=0; i<400; i++){
                        other_ammo[i] = new Sprite(bull);
                        other_ammo[i].x = 15;
                        other_ammo[i].y = 15;
                        other_ammo[i].scale.set(0.1,0.1);
                        other_ammo[i].anchor.set(0.5 ,0.5);
                        other_ammo[i].rotation -= Math.PI*0.5 ;
                        other_ammo[i].visible = false;
                       app.stage.addChild(other_ammo[i]);
                  }
                }

/*a function in which a grid is created  according to bricks and broken array*/
function make_grid(){
                     grid_t = TextureCache["tile.png"];
                     broke_t =TextureCache["broke.png"]
                     for(i=0; i<30; i++){
                       for(j=0; j<30; j++){
                         grid[i*30+j] = new Sprite(grid_t);
                         grid[i*30+j].height=30;
                         grid[i*30+j].width=30;
                         grid[i*30+j].x=30*j;
                         grid[i*30+j].y=30*i;
                         app.stage.addChild(grid[i*30+j]);
                         grid[i*30+j].visible=false;
                         grid2[i*30+j] = new Sprite(broke_t);
                         grid2[i*30+j].height=30;
                         grid2[i*30+j].width=30;
                         grid2[i*30+j].x=30*j;
                         grid2[i*30+j].y=30*i;
                         app.stage.addChild(grid2[i*30+j]);
                         grid2[i*30+j].visible=false;
                       }
                     }
                    
                     for(i=0; i<bricks.length; i++){   //making them visible
                         grid[bricks[i]].visible=true;
                     }
                     for(i=0; i<broken.length; i++){
                       grid2[broken[i]].visible=true;
                     }
                  }


/*a function which cecks collision of tank and the walls of grid*/
function detect_col(c_state) {

  let x=(midx-15)/30, y=(midy-15)/30, l, r, d, u;            
  l = grid[(x-1)+y*30].visible || grid2[(x-1)+y*30].visible;   //check if there is collision with the nearest block
  r = grid[x+1+y*30].visible || grid2[x+1+y*30].visible;
  d = grid[x+(y+1)*30].visible || grid2[x+(y+1)*30].visible;
  u = grid[x+(y-1)*30].visible || grid2[x+(y-1)*30].visible;

  if(c_state == 38 && u)                                      // keystate and the collide condition is checked 
    return true;
  else if(c_state == 40 && d)
    return true;
  else if(c_state == 37 && l)
    return true;
  else if(c_state ==39 && r)
    return true;
  else
    return false;


     }

/* a function which checks if there is a bullet fired from other tank which is colliding with the walls and display */
 function check_bul_col_update(c_state, x_t, y_t, index) {

let l = grid[(x_t-1)+y_t*30].visible || grid2[(x_t-1)+y_t*30].visible;
let r = grid[x_t+1+y_t*30].visible || grid2[x_t+1+y_t*30].visible;
let d = grid[x_t+(y_t+1)*30].visible || grid2[x_t+(y_t+1)*30].visible;
let u = grid[x_t+(y_t-1)*30].visible || grid2[x_t+(y_t-1)*30].visible;

console.log("update check "+c_state+" "+index+" "+x_t+" "+y_t);

if(c_state == 38 && u){                     //checking keystate and collision possibility

hit_wall =true;
other_ammo[index].visible =false;
return true;

}
else if(c_state == 40 && d){

hit_wall =true;
other_ammo[index].visible =false;
return true;

}
else if(c_state == 37 && l){

hit_wall =true;
other_ammo[index].visible =false;
return true;

}
else if(c_state ==39 && r){

hit_wall =true;
other_ammo[index].visible =false;
return true;

}
else{
return false;}
}

/*Checking the bullet wall collision  if the tank fires bullet */

function check_bul_col(c_state) {

    x=(ammo[bulletcount-1].x-15+(ammo[bulletcount-1].x-15)%30)/30;
    y=(ammo[bulletcount-1].y-15+(ammo[bulletcount-1].y-15)%30)/30;


    let l = grid[(x-1)+y*30].visible || grid2[(x-1)+y*30].visible;
    let r = grid[x+1+y*30].visible || grid2[x+1+y*30].visible;
    let d = grid[x+(y+1)*30].visible || grid2[x+(y+1)*30].visible;
    let u = grid[x+(y-1)*30].visible || grid2[x+(y-1)*30].visible;
  

    if(c_state == 38 && u){            //checking keystate and possibilty of collision 

    brick_index = x+(y-1)*30;
    hit_wall =true;
    ammo[bulletcount-1].visible =false;
    broken_tile =x+(y-1)*30;
    if(grid2[x+(y-1)*30].visible)
    grid2[x+(y-1)*30].visible=false;
    return true;

    }
    else if(c_state == 40 && d){

    brick_index = x+(y+1)*30;
    hit_wall =true;
    ammo[bulletcount-1].visible =false;
    broken_tile =x+(y+1)*30;
    if(grid2[x+(y+1)*30].visible)    
    grid2[x+(y+1)*30].visible=false;
    return true;

    }
    else if(c_state == 37 && l){

    brick_index = (x-1)+y*30
    hit_wall =true;
    ammo[bulletcount-1].visible =false;
    broken_tile =(x-1)+y*30;
    if(grid2[(x-1)+y*30].visible)
    grid2[(x-1)+y*30].visible=false;
    return true;

    }
    else if(c_state ==39 && r){

    brick_index = (x+1)+y*30;
    hit_wall =true;
    ammo[bulletcount-1].visible =false;
    broken_tile  =(x+1)+y*30;
    if(grid2[x+1+y*30].visible)
    grid2[x+1+y*30].visible=false;
    return true;

    }
    else{
    return false;}
}



/*checking if there is collision of the bullet fired by tank and the other tank */

function detect_tankBulletCollision(){

console.log(Math.pow(other_center_x[1]-ammo[bulletcount-1].x,2) + Math.pow(other_center_y[1]-ammo[bulletcount-1].y,2) + " " + myID + "dtbc");

if(Math.pow(other_center_x[0]-ammo[bulletcount-1].x,2) + Math.pow(other_center_y[0]-ammo[bulletcount-1].y,2) <= 900 && myID != 0){
    return true;
}
else if(Math.pow(other_center_x[1]-ammo[bulletcount-1].x,2) + Math.pow(other_center_y[1]-ammo[bulletcount-1].y,2) <= 900 && myID != 1){
    return true;
}
else if(Math.pow(other_center_x[2]-ammo[bulletcount-1].x,2) + Math.pow(other_center_y[2]-ammo[bulletcount-1].y,2) <= 900 && myID != 2){
    return true;
}
else if(Math.pow(other_center_x[3]-ammo[bulletcount-1].x,2) + Math.pow(other_center_y[3]-ammo[bulletcount-1].y,2) <= 900 && myID != 3){
    return true;
}
else{
    return false;
}
}



/*function guiding the movement of the bullet fired*/
function bulletmove(){
  
  if(ammo[bulletcount-1].x > 920 || ammo[bulletcount-1].x <-10 || ammo[bulletcount-1].y>920 || ammo[bulletcount-1].y<-10 || bullet_fired == false){
    
    return;
  }

  if(detect_tankBulletCollision()){     //if  bullet fired by tank hit othr=er tank then make bullet invisible
  	ammo[bulletcount-1].visible = false;
    console.log("bullet collided with tank");
    bullet_fired = false;
    state= play;
  }

  if(check_bul_col(bul_mov_state)){
    ammo[bulletcount-1].visible = false;
    console.log("bullet collided with wall")
    bullet_fired = false;
    state= play;
  }
  requestAnimationFrame(bulletmove);   //smooothen the motion of bullet
  ammo[bulletcount-1].x += 0.5*tank.vx*Math.sin(angle_1);
  ammo[bulletcount-1].y -= 0.5*tank.vy* Math.cos(angle_1);

                    }

/*basically does the wrk of updating the health and checking if tank has used up all attempts*/
function idle(){
  
    if(healthbar ==0 && exit == false )
    {
      healthbar =5 ;
      healthstatus.outer.width =125;
      attempts--;
    }

    if(attempts == 0)
    {
      tank.visible =false ;
      let x=bulletcount;

      for(i=x; i<100; i++){
        ammo[i].visible=false;
      
        }
  
        healthstatus.outer.width=0;
        exit = true ;

      }
      
      state = play ;

           }



/* is invoked  on left key press */
function leftloop(){

  if(leftflag === true)
      {
        if(detect_col(37) && exit ==false){   //check collision of tank and wall
          
          healthbar-- ;
          collide.play();
          healthstatus.outer.width -=25 ;
          idle();
        }
       else{                                //update the coordinates 
              
          tank.x-=tank.vx;
          center_x-=tank.vx;

            if(!ismoving)
          {
                for( i=bulletcount;i<100 ;i++ )
                {
                  ammo[i].x -=tank.vx ;
                }
          }
        midx-=30;

          }
      }
}


/* is invoked  on right key press */
 function rightloop(){

    if(rightflag === true)
    {
        if(detect_col(39) && exit ==false)   //detect collisions 
        {
          healthbar-- ;
          collide.play();
         
          healthstatus.outer.width -=25 ;
          idle();
      
        }

      else{                               //update the coordinates 
          
          tank.x+=tank.vx;
          center_x+=tank.vx;
          if(!ismoving)
          {
            for( i=bulletcount;i<100 ;i++ )
            {
              ammo[i].x +=tank.vx ;
            }
          }
          midx+=30;

        }
    }
}

/*is invoked on up key press*/
 function uploop(){

    if(upflag === true )
    {
        if(detect_col(38) && exit ==false){   //checking collisions
          
          healthbar-- ;
          collide.play();
          healthstatus.outer.width -=25 ;  
          idle();
         
        }
        else{                                //update the coordinates
            tank.y-=tank.vy;
            center_y-=tank.vy;
            if(!ismoving)
            {
              for( i=bulletcount;i<100 ;i++ )
              {
                ammo[i].y -=tank.vy ;
              }
            }
            midy-=30;
          }
    }
}

/*invoked when up key pressed*/
 function downloop(){

    if(downflag === true)
    {   
      if(detect_col(40) && exit ==false){  //detect collisions 
        healthbar-- ;
        collide.play();
        healthstatus.outer.width -=25 ;
        idle();
 
      }
      else{                           //update the coordinates
        tank.y+=tank.vy;
        center_y += tank.vy;
          if(!ismoving)
          {
            for( i=bulletcount;i<100 ;i++ )
            {
              ammo[i].y +=tank.vy ;
            }
          }
          midy+=30;
        }
      }
}

/* adds event listening  to the key whose ascii code is given */
function keyboard(keyCode){    

      let key = {};
      key.code = keyCode;
      key.isDown = false;
      key.isUp = true;
      key.press = undefined;
      key.release = undefined;
      key.downHandler = event => {
        if (event.keyCode === key.code) {
          if (key.isUp && key.press) key.press();
          key.isDown = true;
          key.isUp = false;
        }
        event.preventDefault();
      };

      key.upHandler = event => {
        if (event.keyCode === key.code) {
          if (key.isDown && key.release) key.release();
          key.isDown = false;
          key.isUp = true;
        }
        event.preventDefault();
      };
      window.addEventListener(
        "keydown", key.downHandler.bind(key), false
      );
      window.addEventListener(
        "keyup", key.upHandler.bind(key), false
      );
      return key;
}

/*detect tank and other tank  collision posssibility */
function detect_tc()
{
    if( Math.pow(other_center_x[update.id] -center_x ,2)  +  Math.pow(other_center_y[update.id] - center_y ,2) <=900)
    {
      console.log("tank collision detected");
      return true;
    }
    
    return false;
}

/* detect tank and bullet fired by other tank collision */
function detect_tb()
{
    if(Math.pow(update.bullet_x -center_x ,2)  +   Math.pow(update.bullet_y -center_y ,2) <=900 && other_ammo[100*update.id + other_bulletcount-1].visible ==true){

      //console.log("bullet tank collision detected");
      console.log("health decrease due to detect_tb()");
      other_ammo[100*update.id + other_bulletcount-1].visible = false ;
      healthbar-- ;
      //collide.play();
      healthstatus.outer.width -=25 ;     
      idle();
      console.log("in the idle state ");
      console.log(healthbar);

    }


}

/*checks tank and other tank collision */
function check_tank_col(num){
  //console.log("tank_col "+num);
  if(Math.pow(midx-other_center_x[0], 2) + Math.pow(midy-other_center_y[0], 2) <= 900 && other_tank[0].visible == true){
    console.log("tank_col "+1)
    return true;
  }
  else if(Math.pow(midx-other_center_x[1], 2) + Math.pow(midy-other_center_y[1], 2) <= 900 && other_tank[1].visible == true){
    console.log("tank_col "+2)
    return true;
  }
  else if(Math.pow(midx-other_center_x[2], 2) + Math.pow(midy-other_center_y[2], 2) <= 900 && other_tank[2].visible == true){
    console.log("tank_col "+3)
    return true;
  }
  else if(Math.pow(midx-other_center_x[3], 2) + Math.pow(midy-other_center_y[3], 2) <= 900 && other_tank[3].visible == true){
    console.log("tank_col "+4)
    return true;
  }
  console.log("tank_col false "+midx+" "+other_center_x+ " " + num);
  return false;
}

/*a game loop which runs throughout the game maintainnig the state of tank */
function gameLoop(delta){

    if(lost ==true || won== true || exit==true)
    {  
      return;
    }

    state(delta);
}


/*state play decides the play */
function play(delta) {
  tank.vx = 30;
  tank.vy= 30;

  if (exit== true){     //all attempts are used up 

    for(i=0 ;i<100 ;i++){
      ammo[i].visible = false ;
      ammo[i].vx=0;
      ammo[i].vy= 0;
    }

    tank.visible = false;
    tank.vx =0;
    tank.vy =0;
    return ;
  }


  if(hitTestRectangle(tank ,treasure))     //winning condition ,make everything invisible and render a wih message  , won set to true 
  {
      for(i=0 ;i<100 ;i++){
        app.stage.removeChild(ammo[i]);
      }
      for(i=0; i<bricks.length; i++){
          //console.log(bricks[i]);
          grid[bricks[i]].visible=false;
      }

      for(i=0; i<broken.length; i++){
        grid2[broken[i]].visible=false;
      }

      for(i=0 ;i<=3 ;i++)
      {
        app.stage.removeChild(other_tank[i]);
        app.stage.removeChild(other_healthstatus[i]);
        
      }
     for(i=0;i<400 ;i++)
     {   app.stage.removeChild(other_ammo[i]);
        
     }
     app.stage.removeChild(healthstatus);
      app.stage.removeChild(tank);
      app.stage.removeChild(treasure);
      app.stage.removeChild(dungeon);
      app.stage.addChild(message2);
      
      won =true ;
    return ;

  }

}


