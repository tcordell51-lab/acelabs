/* Bestiary (window.AtlasBestiary): the base companions, their traits, levels and portraits.
 * Course packs add their own species through creature-lines.js (registerCoursePack). The three starters here
 * (Cytrus, cell; Atpup, energy; Twistle, spatial patterns) are original and drawn by world.js (drawCreature). Plain ASCII. */
(function () {
  'use strict';
  const rows = [
    ['cytrus','Cytrus','CORE','cytrus','#5fae8e','A round little cell that keeps its own inside steady, whatever hits it.','Cytoguard'],
    ['atpup','Atpup','CORE','atpup','#e8a04a','Its three-bead tail glows as it stores energy for its next move.','Mitolupe'],
    ['twistle','Twistle','CORE','twistle','#6fa8dc','Turns patterns around in its mind before choosing a direction.','Duplexa']
  ];
  const traits={
    spark:{id:'spark',role:'Striker',name:'Bright strike',description:'A correct Strike or type move adds 8 attack power before type effects and the damage cap.',strikeBonus:3},
    shelter:{id:'shelter',role:'Guardian',name:'Restful guard',description:'A correct Guard restores 12 HP, up to full health.',guardHeal:5},
    insight:{id:'insight',role:'Scholar',name:'First insight',description:'If this creature starts the battle, gain one extra Insight use.',openingFocus:1},
    precision:{id:'precision',role:'Finisher',name:'Careful insight',description:'A correct Insight adds 10 attack power before type effects and the damage cap.',burstBonus:6},
    tempered:{id:'tempered',role:'Tactician',name:'Tempered rhythm',description:'A correct Guard restores 8 HP, up to full health. A correct Insight adds 6 attack power before type effects and the damage cap.',guardHeal:3,burstBonus:3}
  };
  const roles={cytrus:'shelter',atpup:'spark',twistle:'insight'};
  const species = rows.map(([id,name,courseId,base,color,description,evolution])=>({id,name,courseId,base,color,description,evolution,trait:traits[roles[id]]}));
  const find = id => species.find(s=>s.id===id)||species[0];
  const level = xp => Math.min(30,1+Math.floor(Math.sqrt(Math.max(0,xp)/5)));
  const name = member => level(member.xp)>=6 ? find(member.id).evolution : find(member.id).name;
  function draw(ctx,id,x,y,scale=3,evolved=false){
    const s=find(id),custom=!['cytrus','atpup','twistle'].includes(s.id);
    ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scale,scale);ctx.imageSmoothingEnabled=false;
    const ink='#24484b',cream='#fff2cb',r=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(a,b,w,h);};
    const eye=(a,b)=>{r(a,b,2,3,ink);r(a,b,1,1,cream);};
    r(-9,11,18,2,'#24484b25');
    if(evolved){
      // Larger silhouettes are adventure evolutions, not claims about biology.
      if(s.trait.id==='spark'){r(-15,-3,5,10,'#c98047');r(-18,-9,5,10,s.color);r(10,-3,5,10,'#c98047');r(13,-9,5,10,s.color);r(-2,-21,4,7,'#fff0a5');r(-5,-18,10,3,'#f0bb60');}
      if(s.trait.id==='shelter'){r(-15,-6,5,17,'#578d75');r(10,-6,5,17,'#578d75');r(-17,-9,8,8,s.color);r(9,-9,8,8,s.color);r(-11,-18,5,9,'#8db28a');r(6,-18,5,9,'#8db28a');r(-13,-20,8,4,s.color);r(5,-20,8,4,s.color);}
      if(s.trait.id==='insight'){r(-17,-7,8,16,'#9c8bb5');r(9,-7,8,16,'#9c8bb5');r(-19,-11,7,9,s.color);r(12,-11,7,9,s.color);r(-16,-3,6,3,cream);r(10,-3,6,3,cream);r(-3,-20,6,5,'#efe4c6');}
      if(s.trait.id==='precision'){r(-15,-11,4,19,'#779bb4');r(11,-11,4,19,'#779bb4');r(-12,-17,24,4,s.color);r(-12,8,24,3,s.color);r(-17,-7,5,4,cream);r(12,-7,5,4,cream);r(-3,-20,6,4,cream);}
    }
    if(!custom){ctx.restore();window.AtlasWorld.drawCreature(ctx,s.base,x,y,scale);return;}
    ctx.restore();
  }
  window.AtlasBestiary={species,traits,find,level,name,draw};
}());
