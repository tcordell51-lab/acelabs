/* Original DAT scenery for the isolated Mnemon adaptation. All art is authored
 * here from pixel rectangles; no educational images or external sprites. */
(function(root){
  'use strict';
  const INK='#203f3d', PAPER='#fff5d7', GOLD='#edc775';
  const themes={
    camp:{grass:'#668b62',light:'#7da276',dark:'#416750',water:'#478c99',roof:'#d1ad64',trim:'#765c3e',flower:'#f7d88c',path:'#e3d3a6',pathDark:'#c7b98d',pathStyle:'cobble',wall:'stone',wallColor:'#446653',wallTop:'#72917a',accent:'#dfbd6b'},
    grove:{grass:'#62856e',light:'#83a58b',dark:'#3c6656',water:'#609f9b',roof:'#b7c69a',trim:'#566c53',flower:'#efda9c',path:'#dfd8b4',pathDark:'#bdb591',pathStyle:'cobble',wall:'stone',wallColor:'#426557',wallTop:'#83a08a',accent:'#e5c67b'},
    bio:{grass:'#57916d',light:'#73ae82',dark:'#326b55',water:'#4b9ea4',roof:'#d89270',trim:'#754e43',flower:'#f6d688',path:'#e6d8ac',pathDark:'#bdaf88',pathStyle:'cobble',wall:'stone',wallColor:'#385e59',wallTop:'#6c9384',accent:'#a6deb1'},
    quarter:{grass:'#65a0a0',light:'#8fbab2',dark:'#3e747a',water:'#39788f',roof:'#9a8bc0',trim:'#594c77',flower:'#f4cc91',path:'#e8d7b4',pathDark:'#c2ad93',pathStyle:'tile',wall:'stone',wallColor:'#395d70',wallTop:'#6e95a1',accent:'#a9e5d3'},
    gc:{grass:'#8a7156',light:'#a18b6c',dark:'#615244',water:'#d87847',roof:'#ac6050',trim:'#653b36',flower:'#f6d28b',path:'#d9bb91',pathDark:'#b3926c',pathStyle:'cobble',wall:'rock',wallColor:'#494c52',wallTop:'#6d747c',accent:'#eabf70'},
    oc:{grass:'#777e8d',light:'#9098a2',dark:'#515a70',water:'#7976b3',roof:'#9b779f',trim:'#5d456e',flower:'#e7bad7',path:'#e1d5b1',pathDark:'#b9ab94',pathStyle:'tile',wall:'stone',wallColor:'#494b6b',wallTop:'#797b98',accent:'#d9b4db'},
    pat:{grass:'#a8b59c',light:'#c6ceb3',dark:'#7d927f',water:'#76b4b7',roof:'#99b1ad',trim:'#566f73',flower:'#dfbd82',path:'#eee5cd',pathDark:'#c3c2aa',pathStyle:'tile',wall:'stone',wallColor:'#7f9393',wallTop:'#bcc9c1',accent:'#eacb8d'},
    rc:{grass:'#497b77',light:'#67938b',dark:'#315853',water:'#39758c',roof:'#7f82a9',trim:'#464d6b',flower:'#edcc93',path:'#d8c7a4',pathDark:'#ad9c7e',pathStyle:'cobble',wall:'stone',wallColor:'#3c5766',wallTop:'#6c8890',accent:'#b9d6cc'},
    qr:{grass:'#a19b65',light:'#bbb47d',dark:'#767d4b',water:'#508c94',roof:'#b88957',trim:'#76583b',flower:'#efd598',path:'#e4cca2',pathDark:'#c2a77d',pathStyle:'tile',wall:'stone',wallColor:'#696b55',wallTop:'#9a9d7f',accent:'#efc56e'}
  };
  const palette=o=>themes[o.biome]||themes.camp;
  function pixel(h,x,y,w,ht,c){h.rect(Math.round(x),Math.round(y),Math.round(w),Math.round(ht),c);}
  function label(o,x,y,h,dy=48){if(o.label&&h.near(o)<4.4)h.label(o.label,x,y-dy,INK,true,11);}
  function shadow(h,x,y,w=32){pixel(h,x-w/2,y+8,w,5,'rgba(25,49,43,.22)');}
  function gem(h,x,y,c,s=1){pixel(h,x-2*s,y-9*s,4*s,2*s,PAPER);pixel(h,x-5*s,y-7*s,10*s,4*s,c);pixel(h,x-7*s,y-3*s,14*s,8*s,c);pixel(h,x-4*s,y+5*s,8*s,4*s,c);pixel(h,x-2*s,y+9*s,4*s,2*s,c);pixel(h,x-5*s,y-2*s,3*s,6*s,'#fff5d788');}
  function face(h,x,y){pixel(h,x-4,y,2,3,INK);pixel(h,x+3,y,2,3,INK);pixel(h,x-1,y+5,3,1,INK);}
  const drawers={
    'realm-return-tree':(ctx,o,x,y,h)=>{shadow(h,x,y,102);pixel(h,x-11,y-48,22,57,'#756c4f');pixel(h,x-8,y-40,7,45,'#ac9671');pixel(h,x-26,y+6,52,6,'#756c4f');pixel(h,x-19,y-2,38,11,'#756c4f');pixel(h,x-37,y-70,74,34,'#385f4f');pixel(h,x-47,y-63,94,22,'#4e7b5c');pixel(h,x-37,y-89,74,31,'#648f69');pixel(h,x-25,y-103,50,23,'#83a97b');pixel(h,x-14,y-110,28,13,'#abc394');pixel(h,x-35,y-79,18,7,'#a5bd8e');pixel(h,x+18,y-64,22,7,'#87aa78');pixel(h,x-9,y-88,16,6,'#c4d0a3');for(const [dx,dy] of [[-31,-43],[30,-41]]){pixel(h,x+dx,y+dy,2,21,'#947d52');pixel(h,x+dx-4,y+dy+17,10,12,GOLD);pixel(h,x+dx-2,y+dy+19,6,7,PAPER);}pixel(h,x-5,y-26,10,9,'#dbc58e');pixel(h,x-3,y-24,6,5,'#796a4e');label(o,x,y,h,120);return true;},
    'realm-return-stone':(ctx,o,x,y,h)=>{const p=palette(o);shadow(h,x,y,43);pixel(h,x-20,y+5,40,8,'#879b84');pixel(h,x-15,y-30,30,36,'#b8c5a5');pixel(h,x-11,y-37,22,9,p.roof);pixel(h,x-13,y-27,26,25,PAPER);pixel(h,x-15,y-3,30,5,p.accent);const c=p.trim;
      if(o.subject==='BIO'){pixel(h,x-7,y-21,14,12,p.light);pixel(h,x-10,y-18,20,6,p.light);pixel(h,x-3,y-17,6,5,c);pixel(h,x-6,y-25,4,6,p.dark);}
      else if(o.subject==='GCHEM'){pixel(h,x-2,y-25,4,13,c);pixel(h,x-7,y-14,14,7,p.water);pixel(h,x-9,y-9,18,3,c);pixel(h,x-5,y-26,10,3,c);}
      else if(o.subject==='OCHEM'){pixel(h,x-7,y-18,14,3,c);pixel(h,x-9,y-23,5,5,p.roof);pixel(h,x+4,y-15,5,5,p.roof);pixel(h,x-2,y-25,3,8,c);pixel(h,x-3,y-27,5,4,p.water);}
      else if(o.subject==='PAT'){for(let i=0;i<5;i++){pixel(h,x-10+i*2,y-16-i*2,2,10,p.accent);pixel(h,x+i*2,y-24+i*2,2,10,p.roof);}pixel(h,x-1,y-25,2,17,c);}
      else if(o.subject==='RC'){pixel(h,x-10,y-23,9,15,p.roof);pixel(h,x+1,y-23,9,15,p.roof);for(let i=0;i<3;i++){pixel(h,x-8,y-20+i*4,5,1,PAPER);pixel(h,x+3,y-20+i*4,5,1,PAPER);}pixel(h,x-1,y-23,2,16,c);}
      else{pixel(h,x-9,y-23,18,17,p.accent);pixel(h,x-6,y-20,12,11,PAPER);pixel(h,x-1,y-19,2,6,c);pixel(h,x-1,y-14,5,2,c);pixel(h,x-3,y-26,6,3,c);}label(o,x,y,h,48);return true;},
    'realm-rest-bench':(ctx,o,x,y,h)=>{shadow(h,x,y,43);pixel(h,x-20,y-19,40,6,'#b99f71');pixel(h,x-20,y-11,40,6,'#d4bb85');pixel(h,x-22,y-2,44,7,'#bfaa78');pixel(h,x-18,y-20,4,32,'#61725b');pixel(h,x+14,y-20,4,32,'#61725b');pixel(h,x-24,y-7,5,11,'#61725b');pixel(h,x+19,y-7,5,11,'#61725b');label(o,x,y,h,32);return true;},
    'realm-tree':(ctx,o,x,y,h)=>{const p=palette(o);shadow(h,x,y,32);
      if(o.biome==='gc'){pixel(h,x-11,y-34,22,44,'#4a5059');pixel(h,x-8,y-43,16,10,'#707985');pixel(h,x-5,y-37,5,39,'#89969a');pixel(h,x+4,y-29,3,35,'#bc9564');gem(h,x+1,y-42,p.accent,.65);}
      else if(o.biome==='oc'){pixel(h,x-3,y-27,7,39,'#76647b');pixel(h,x-18,y-35,36,13,'#635975');pixel(h,x-14,y-44,28,12,'#9480a7');pixel(h,x-8,y-49,16,7,'#b19bbd');pixel(h,x-21,y-29,8,10,'#a38fb7');pixel(h,x+13,y-29,8,10,'#a38fb7');pixel(h,x-7,y-38,4,3,'#e7d1e7');pixel(h,x+7,y-30,3,3,'#edcf9d');}
      else if(o.biome==='pat'){pixel(h,x-4,y-21,8,34,'#7f958a');pixel(h,x-17,y-40,34,25,'#91b3a9');pixel(h,x-12,y-45,24,7,'#cad9be');pixel(h,x-13,y-36,25,5,'#b8ceba');pixel(h,x+11,y-35,5,20,'#6c9996');pixel(h,x-6,y-19,12,5,'#769e94');}
      else if(o.biome==='rc'){pixel(h,x-4,y-25,7,39,'#63756b');pixel(h,x-19,y-40,38,15,'#426f76');pixel(h,x-13,y-48,26,12,'#71a498');pixel(h,x-22,y-33,9,30,'#4d887f');pixel(h,x+13,y-33,9,30,'#4d887f');pixel(h,x-13,y-28,5,15,'#7baea0');pixel(h,x+7,y-30,5,18,'#7baea0');pixel(h,x-8,y-39,4,4,'#bfd3a7');}
      else if(o.biome==='qr'){pixel(h,x-3,y-26,7,39,'#85764c');pixel(h,x-17,y-24,34,13,'#89934f');pixel(h,x-13,y-36,26,15,'#b0ad61');pixel(h,x-8,y-46,16,13,'#d0bd7a');pixel(h,x-3,y-51,6,8,'#e9ce89');pixel(h,x-12,y-23,7,5,'#c6bb6f');}
      else{pixel(h,x-3,y-27,7,40,'#6e8a76');pixel(h,x-18,y-35,36,16,'#4b8d8d');pixel(h,x-13,y-45,26,14,'#80b7ad');pixel(h,x-7,y-50,14,8,'#b2d5bf');pixel(h,x-14,y-28,7,5,'#a0d1ba');pixel(h,x+11,y-33,5,7,'#6aa4a5');}return true;},
    'realm-gateway':(ctx,o,x,y,h)=>{const p=palette(o);shadow(h,x,y,58);pixel(h,x-27,y-44,10,55,p.trim);pixel(h,x+17,y-44,10,55,p.trim);pixel(h,x-30,y-49,60,10,p.roof);pixel(h,x-24,y-55,48,7,p.accent);pixel(h,x-29,y+6,14,6,p.pathDark);pixel(h,x+15,y+6,14,6,p.pathDark);pixel(h,x-23,y-43,4,42,PAPER);pixel(h,x+19,y-43,4,42,PAPER);gem(h,x,y-44,p.water,.7);label(o,x,y,h,68);return true;},
    'realm-station':(ctx,o,x,y,h)=>{const p=palette(o);shadow(h,x,y,48);pixel(h,x-22,y-2,44,12,p.trim);pixel(h,x-25,y-9,50,8,p.roof);pixel(h,x-20,y-6,40,3,p.accent);pixel(h,x-17,y+9,5,9,p.trim);pixel(h,x+12,y+9,5,9,p.trim);pixel(h,x-15,y-26,22,17,INK);pixel(h,x-12,y-23,16,11,'#b5dac3');pixel(h,x-9,y-20,4,3,PAPER);pixel(h,x-3,y-17,4,2,p.water);pixel(h,x+13,y-22,5,13,'#e0a96f');pixel(h,x+11,y-14,9,6,p.accent);pixel(h,x+13,y-25,5,3,PAPER);label(o,x,y,h,39);return true;},
    'realm-stand':(ctx,o,x,y,h)=>{const p=palette(o);shadow(h,x,y,25);pixel(h,x-3,y-12,6,25,p.trim);pixel(h,x-13,y+10,26,4,p.trim);pixel(h,x-15,y-26,30,19,p.roof);pixel(h,x-12,y-25,11,15,PAPER);pixel(h,x+1,y-25,11,15,'#e7d8b5');pixel(h,x-1,y-25,2,16,p.trim);for(let i=0;i<3;i++){pixel(h,x-10,y-21+i*4,7,1,p.trim);pixel(h,x+3,y-21+i*4,6,1,p.trim);}label(o,x,y,h,37);return true;},
    'realm-trainer':(ctx,o,x,y,h)=>{const p=palette(o);h.person(x,y,o.color||p.roof,'#4b3934');pixel(h,x-10,y-30,20,4,p.trim);pixel(h,x-6,y-36,12,7,p.accent);pixel(h,x+8,y-8,6,11,p.trim);pixel(h,x+9,y-7,4,5,PAPER);if(o.beaten){pixel(h,x-12,y-18,4,4,GOLD);}label(o,x,y,h,44);return true;},
    'realm-warden':(ctx,o,x,y,h)=>{const p=palette(o);shadow(h,x,y,28);h.person(x,y,o.restored?GOLD:p.roof,'#4b3934');pixel(h,x-11,y-31,22,5,p.trim);pixel(h,x-7,y-39,14,9,o.restored?GOLD:p.accent);pixel(h,x-3,y-43,6,5,PAPER);pixel(h,x+11,y-21,3,34,p.trim);gem(h,x+12,y-24,o.restored?GOLD:p.water,.5);pixel(h,x-7,y-8,14,3,p.accent);label(o,x,y,h,53);return true;},
    'realm-entropy':(ctx,o,x,y,h)=>{shadow(h,x,y,29);h.person(x,y,'#495063','#322f40');pixel(h,x-9,y-31,18,6,'#2e3349');pixel(h,x-6,y-36,5,7,'#2e3349');pixel(h,x+2,y-35,6,7,'#2e3349');pixel(h,x-7,y-13,15,4,'#c66e68');pixel(h,x+5,y-11,6,13,'#aa5858');pixel(h,x-4,y-25,3,3,'#f1d6b5');pixel(h,x+3,y-25,3,3,'#f1d6b5');label(o,x,y,h,45);return true;},
    'realm-banner':(ctx,o,x,y,h)=>{const p=palette(o);pixel(h,x-2,y-40,4,53,p.trim);pixel(h,x+2,y-37,18,22,p.roof);pixel(h,x+4,y-35,13,4,p.accent);pixel(h,x+7,y-27,5,7,PAPER);pixel(h,x-5,y+10,10,4,p.trim);return true;},
    'realm-plan':(ctx,o,x,y,h)=>{shadow(h,x,y,36);pixel(h,x-15,y-24,30,29,'#8e795c');pixel(h,x-12,y-21,24,21,PAPER);pixel(h,x-9,y-18,18,2,'#8e795c');pixel(h,x-9,y-12,12,2,'#a8ad94');pixel(h,x-9,y-6,16,2,'#a8ad94');pixel(h,x-12,y+5,4,10,'#8e795c');pixel(h,x+8,y+5,4,10,'#8e795c');label(o,x,y,h,36);return true;},
    'realm-reed':(ctx,o,x,y,h)=>{const p=palette(o);for(let i=0;i<4;i++){pixel(h,x-9+i*6,y-13-(i%2)*5,2,26,p.dark);pixel(h,x-10+i*6,y-20-(i%2)*5,4,10,p.accent);}return true;},
    'realm-crystal':(ctx,o,x,y,h)=>{shadow(h,x,y,29);const p=palette(o);gem(h,x,y-8,p.accent,1);gem(h,x-11,y+1,p.roof,.55);gem(h,x+12,y-3,p.water,.65);return true;},
    'realm-bloom':(ctx,o,x,y,h)=>{const p=palette(o);shadow(h,x,y,25);pixel(h,x-2,y-16,4,29,p.dark);pixel(h,x-14,y-5,12,5,p.light);pixel(h,x+2,y,12,5,p.light);pixel(h,x-12,y-29,24,16,p.roof);pixel(h,x-17,y-24,34,11,p.roof);pixel(h,x-9,y-31,18,7,p.accent);pixel(h,x-5,y-27,4,3,PAPER);pixel(h,x+5,y-22,4,3,PAPER);return true;},
    'realm-harbor-lock':(ctx,o,x,y,h)=>{shadow(h,x,y,60);pixel(h,x-29,y-20,58,32,'#547f79');pixel(h,x-25,y-15,50,23,'#b7c9af');pixel(h,x-22,y-12,44,16,'#56a2ab');for(let i=0;i<5;i++)pixel(h,x-23+i*11,y-25,6,17,'#e6d4a3');pixel(h,x-24,y-28,48,5,'#d6b375');pixel(h,x-3,y-46,6,24,'#805b43');pixel(h,x-12,y-48,24,5,'#805b43');pixel(h,x-11,y-54,22,6,'#ca9b6d');pixel(h,x-6,y-44,13,4,PAPER);label(o,x,y,h,64);return true;},
    'realm-quarter-tower':(ctx,o,x,y,h)=>{shadow(h,x,y,58);pixel(h,x-22,y-57,44,65,'#a6c4bb');pixel(h,x-26,y-10,52,7,'#5d8e8b');pixel(h,x-25,y-34,50,7,'#5d8e8b');pixel(h,x-25,y-58,50,7,'#5d8e8b');pixel(h,x-19,y-70,38,12,'#a393bd');pixel(h,x-13,y-79,26,9,'#cab0d0');pixel(h,x-4,y-86,8,8,'#f0d598');for(let row=0;row<2;row++)for(let i=0;i<3;i++){pixel(h,x-17+i*13,y-47+row*25,8,10,'#396c78');pixel(h,x-15+i*13,y-46+row*25,4,7,'#f6d797');}pixel(h,x-7,y-8,14,17,'#395e68');label(o,x,y,h,96);return true;},
    'realm-forge':(ctx,o,x,y,h)=>{shadow(h,x,y,67);pixel(h,x-29,y-40,58,48,'#5b626a');pixel(h,x-33,y-45,66,8,'#8b9294');pixel(h,x-23,y-36,46,6,'#a7a592');pixel(h,x-17,y-20,34,26,'#313b43');pixel(h,x-11,y-14,22,20,'#d77b43');pixel(h,x-6,y-8,12,14,'#efbb64');pixel(h,x-2,y-5,5,10,PAPER);pixel(h,x+16,y-66,11,23,'#9a7653');pixel(h,x+13,y-71,17,7,'#c39a68');pixel(h,x-38,y-30,10,6,'#c29c69');pixel(h,x-40,y-30,5,38,'#9f7c57');for(let i=0;i<3;i++)pixel(h,x+17+(i%2)*4,y-82-i*9,7+i*2,5,'#c4c4ac77');label(o,x,y,h,94);return true;},
    'realm-electron-tower':(ctx,o,x,y,h)=>{shadow(h,x,y,48);pixel(h,x-20,y-8,40,18,'#727487');pixel(h,x-14,y-58,28,51,'#a291b5');pixel(h,x-17,y-63,34,7,'#5f5b7c');pixel(h,x-12,y-70,24,8,'#d3b8ce');pixel(h,x-7,y-77,14,8,'#e4d7b8');pixel(h,x-4,y-55,8,28,'#ede3c9');pixel(h,x-8,y-22,16,15,'#514f71');for(const [dx,dy] of [[-27,-48],[28,-44],[-24,-24],[25,-66]]){pixel(h,x+dx-3,y+dy-3,7,7,'#d5bfe0');pixel(h,x+dx-1,y+dy-5,3,3,PAPER);}pixel(h,x-28,y-40,16,3,'#9a826d');pixel(h,x+14,y-35,17,3,'#9a826d');label(o,x,y,h,91);return true;},
    'realm-fold':(ctx,o,x,y,h)=>{shadow(h,x,y,62);pixel(h,x-25,y-5,50,15,'#9aaea6');pixel(h,x-21,y-10,42,6,'#dbe0ca');for(let i=0;i<7;i++){pixel(h,x-27+i*4,y-43-i*3,4,34,'#e8dfc2');pixel(h,x+i*4,y-64+i*3,4,35,'#aebeb6');}pixel(h,x-1,y-64,3,52,'#7a9696');pixel(h,x-17,y-35,6,6,'#729ca3');pixel(h,x+10,y-40,6,6,'#507982');pixel(h,x-7,y-11,14,2,GOLD);label(o,x,y,h,81);return true;},
    'realm-archive':(ctx,o,x,y,h)=>{shadow(h,x,y,65);pixel(h,x-29,y-53,58,60,'#6d8786');pixel(h,x-32,y-58,64,7,'#c2c4a6');pixel(h,x-24,y-65,48,8,'#8c88aa');pixel(h,x-17,y-72,34,8,'#aaa0b9');for(let col=0;col<3;col++){pixel(h,x-24+col*20,y-49,10,40,'#315c69');for(let row=0;row<5;row++){pixel(h,x-23+col*20,y-47+row*7,3,5,['#d5b77c','#a2c0aa','#b5a6ca'][row%3]);pixel(h,x-18+col*20,y-47+row*7,3,5,'#e1d0a8');}}pixel(h,x-33,y-7,66,7,'#b2bda8');pixel(h,x-6,y-66,12,13,'#f3d392');label(o,x,y,h,86);return true;},
    'realm-clock':(ctx,o,x,y,h)=>{shadow(h,x,y,57);pixel(h,x-21,y-53,42,63,'#b99a68');pixel(h,x-25,y-6,50,8,'#d1bb8a');pixel(h,x-25,y-57,50,8,'#806748');pixel(h,x-18,y-65,36,8,'#dbbe83');pixel(h,x-12,y-72,24,7,'#a17d4e');pixel(h,x-16,y-48,32,30,PAPER);pixel(h,x-18,y-44,36,22,PAPER);pixel(h,x-13,y-45,26,24,'#e1d9b2');pixel(h,x-1,y-43,3,15,INK);pixel(h,x-1,y-30,11,3,INK);for(const [dx,dy] of [[0,-46],[13,-33],[0,-22],[-13,-33]])pixel(h,x+dx-1,y+dy,3,3,'#95764d');pixel(h,x-7,y-8,14,17,'#6b654c');label(o,x,y,h,87);return true;},
    'realm-gear':(ctx,o,x,y,h)=>{const p=palette(o);shadow(h,x,y,32);pixel(h,x-13,y-17,26,26,p.trim);pixel(h,x-9,y-21,18,34,p.trim);pixel(h,x-17,y-13,34,18,p.trim);pixel(h,x-11,y-15,22,22,p.accent);pixel(h,x-4,y-8,8,8,p.trim);pixel(h,x-2,y-6,4,4,PAPER);return true;},
    'realm-parcel':(ctx,o,x,y,h)=>{shadow(h,x,y,24);pixel(h,x-11,y-11,22,23,'#bf9971');pixel(h,x-9,y-9,18,18,'#dec397');pixel(h,x-2,y-10,4,21,PAPER);pixel(h,x-10,y-3,21,4,PAPER);pixel(h,x+4,y+4,4,4,'#669a8d');return true;}
  };
  const tiles={
    'realm-bridge':(ctx,type,x,y,h)=>{pixel(h,x,y,32,32,'#488c95');pixel(h,x+2,y,3,32,'#785d43');pixel(h,x+27,y,3,32,'#785d43');for(let i=0;i<4;i++)pixel(h,x+5,y+i*8,22,7,i%2?'#c8ab79':'#dfc698');return true;},
    'realm-pipe':(ctx,type,x,y,h)=>{pixel(h,x+12,y,8,32,'#8a6a48');pixel(h,x+13,y,3,32,'#d7b278');pixel(h,x+10,y+11,12,6,'#b69160');pixel(h,x+11,y+12,10,2,'#ecd199');return true;},
    'realm-marble':(ctx,type,x,y,h)=>{pixel(h,x+1,y+1,30,30,'#e8e1c7');pixel(h,x+4,y+4,24,2,'#c3c9b6');pixel(h,x+4,y+4,2,24,'#c3c9b6');pixel(h,x+22,y+20,6,2,'#f8efd8');return true;},
    'realm-grid':(ctx,type,x,y,h)=>{pixel(h,x,y,32,1,'#a99d7999');pixel(h,x,y,1,32,'#a99d7999');pixel(h,x+15,y+15,2,2,'#d6bf83');return true;}
  };
  // Chapter landmarks are scenery, not diagrams or evidence of scientific rules.
  Object.assign(drawers,{
    'realm-enzyme-workshop':(ctx,o,x,y,h)=>{shadow(h,x,y,66);pixel(h,x-27,y-27,54,34,'#6a8966');pixel(h,x-31,y-32,62,8,'#b8c59a');pixel(h,x-19,y-24,38,25,'#e3d5a6');pixel(h,x-12,y-17,24,18,'#365b4b');pixel(h,x-7,y-14,14,12,'#a3c6a4');pixel(h,x-27,y-43,54,11,'#507855');pixel(h,x-20,y-55,40,13,'#76a473');pixel(h,x-10,y-64,20,11,'#a1c58c');pixel(h,x-5,y-70,10,8,'#d2dcaa');for(const [dx,dy]of[[-18,-43],[17,-45],[2,-57]]){pixel(h,x+dx-3,y+dy,6,4,GOLD);pixel(h,x+dx-2,y+dy,2,2,PAPER);}pixel(h,x+28,y-18,8,27,'#897752');pixel(h,x+25,y-23,14,7,'#d7be82');label(o,x,y,h,80);return true;},
    'realm-mole-balance':(ctx,o,x,y,h)=>{shadow(h,x,y,72);pixel(h,x-32,y+3,64,9,'#777771');pixel(h,x-5,y-57,10,61,'#987449');pixel(h,x-30,y-55,60,7,'#d9bb77');pixel(h,x-34,y-58,68,4,'#705b45');for(const dx of[-25,25]){pixel(h,x+dx-1,y-49,2,23,'#8b734d');pixel(h,x+dx-11,y-26,22,5,'#c7995d');pixel(h,x+dx-8,y-21,16,5,'#e8c486');pixel(h,x+dx-6,y-36,12,10,'#788992');pixel(h,x+dx-4,y-38,8,4,'#bac6ba');}pixel(h,x-13,y-3,26,7,'#bea674');pixel(h,x-15,y-10,30,6,'#8d7557');gem(h,x,y-60,GOLD,.5);label(o,x,y,h,78);return true;},
    'realm-conjugate-lantern':(ctx,o,x,y,h)=>{shadow(h,x,y,60);pixel(h,x-27,y+3,54,9,'#88819c');pixel(h,x-22,y-47,10,50,'#8d7ba1');pixel(h,x+12,y-47,10,50,'#8d7ba1');pixel(h,x-25,y-52,50,8,'#b5a1c3');pixel(h,x-17,y-61,34,10,'#d6bbd4');pixel(h,x-9,y-66,18,6,'#e3d8bf');pixel(h,x-2,y-45,4,13,'#9b835c');pixel(h,x-10,y-31,20,24,'#80678d');pixel(h,x-7,y-28,14,17,'#e3ca85');pixel(h,x-3,y-26,5,12,PAPER);pixel(h,x-12,y-7,24,4,'#b69a70');pixel(h,x-20,y-44,3,38,'#d3c2d2');pixel(h,x+14,y-44,3,38,'#d3c2d2');label(o,x,y,h,78);return true;},
    'realm-angle-observatory':(ctx,o,x,y,h)=>{shadow(h,x,y,62);pixel(h,x-27,y+3,54,9,'#829b99');pixel(h,x-22,y-2,44,6,'#c4cec0');pixel(h,x-3,y-44,6,43,'#657f87');for(let i=0;i<6;i++){pixel(h,x-5-i*4,y-44-i*4,6,6,'#a2b9be');pixel(h,x+i*4,y-44-i*3,6,6,'#d6dbc5');}pixel(h,x-8,y-47,16,12,'#829aa7');pixel(h,x-5,y-44,10,6,GOLD);pixel(h,x-2,y-42,4,3,PAPER);pixel(h,x-19,y-24,12,5,'#b29c6c');pixel(h,x+8,y-24,12,5,'#b29c6c');label(o,x,y,h,82);return true;},
    'realm-structure-stacks':(ctx,o,x,y,h)=>{shadow(h,x,y,68);for(const [dx,top,roof]of[[-24,-44,'#8897ad'],[0,-62,'#a6b2ba'],[24,-49,'#849b9b']]){pixel(h,x+dx-9,y+top,18,-top+5,'#577c79');pixel(h,x+dx-12,y+top-5,24,6,roof);for(let row=0;row<3;row++){pixel(h,x+dx-6,y+top+5+row*10,12,7,'#e5d7af');pixel(h,x+dx-4,y+top+6+row*10,2,5,'#8e7b64');pixel(h,x+dx+2,y+top+6+row*10,2,5,'#a5bbac');}}pixel(h,x-35,y+5,70,7,'#b7bea1');pixel(h,x-16,y-28,9,4,'#bda77a');pixel(h,x+8,y-28,9,4,'#bda77a');label(o,x,y,h,80);return true;},
    'realm-percent-market':(ctx,o,x,y,h)=>{shadow(h,x,y,66);pixel(h,x-27,y-13,54,22,'#a78752');pixel(h,x-24,y-9,48,15,'#d4bd81');pixel(h,x-30,y-19,60,7,'#ead39b');pixel(h,x-26,y-51,5,34,'#806848');pixel(h,x+21,y-51,5,34,'#806848');pixel(h,x-29,y-55,58,7,'#b28c52');pixel(h,x-22,y-63,44,8,'#d9ba71');pixel(h,x-12,y-69,24,7,'#e9d595');for(let row=0;row<3;row++){pixel(h,x-18,y-43+row*8,36,2,'#8b744e');for(let i=0;i<3;i++)pixel(h,x-14+i*10,y-46+row*8,5,7,['#eee3b4','#96b59c','#a9a8bd'][row]);}label(o,x,y,h,80);return true;}
  });
  const chapterAccents=Object.freeze({
    'bio-enzyme-workshop':Object.freeze({sprite:'realm-enzyme-workshop'}),
    'gc-mole-foundry':Object.freeze({sprite:'realm-mole-balance'}),
    'oc-conjugate-court':Object.freeze({sprite:'realm-conjugate-lantern'}),
    'pat-angle-observatory':Object.freeze({sprite:'realm-angle-observatory'}),
    'rc-evidence-archive':Object.freeze({sprite:'realm-structure-stacks'}),
    'qr-percent-market':Object.freeze({sprite:'realm-percent-market'})
  });

  // These six portraits use the same 32-pixel course-line footprint and draw
  // signature as Mnemon. Their shapes are hand-authored; no random seed, image,
  // downloaded sprite, question content or learner data enters the artwork.
  const companionDefinitions=Object.freeze([
    {id:'enzymber',name:'Enzymber',course:'BIO',session:3,color:'#81bf8d',bodyPlan:'rounded moss salamander with a curved catalyst crest and four short feet'},
    {id:'molmite',name:'Molmite',course:'GCHEM',session:2,color:'#e4ac73',bodyPlan:'broad stone beetle with paired mineral counters and six short legs'},
    {id:'protonyx',name:'Protonyx',course:'OCHEM',session:2,color:'#b69ad6',bodyPlan:'crescent-eared purple lynx with an asymmetric curved tail'},
    {id:'apertuft',name:'Apertuft',course:'PAT',session:2,color:'#a6bee4',bodyPlan:'angular two-winged owl with an open chevron crest and small feet'},
    {id:'foliora',name:'Foliora',course:'RC',session:2,color:'#83c5bf',bodyPlan:'long-tailed teal fox with folded page ears and a small bookmark crest'},
    {id:'percentip',name:'Percentip',course:'QR',session:2,color:'#d7bd6d',bodyPlan:'low golden segmented caterpillar with round antennae and three paired feet'}
  ].map(Object.freeze));
  const companions=new Map(companionDefinitions.map(def=>[def.id,def])),portraitCache=new Map();
  const stageNumber=value=>Number.isFinite(Number(value))?Math.max(0,Math.min(2,Math.floor(Number(value)))):0;
  function tint(hex,factor){return '#'+[1,3,5].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(hex.slice(i,i+2),16)*factor))).toString(16).padStart(2,'0')).join('');}
  function companionPixels(id,stage=0){
    const def=companions.get(id);if(!def)return null;
    const st=stageNumber(stage),key=id+':'+st;if(portraitCache.has(key))return portraitCache.get(key);
    const N=32,k=[.78,.89,1][st],g=Array.from({length:N},()=>Array(N).fill(null)),main=def.color,light=tint(main,1.22),dark=tint(main,.69),gold='#e7c779',cream='#fff2cf',ink='#24484b';
    const put=(x,y,c)=>{x=Math.round(16+(x-16)*k);y=Math.round(29+(y-29)*k);if(x>0&&y>0&&x<N-1&&y<N-1)g[y][x]=c;};
    const rect=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)put(i,j,c);};
    const ellipse=(cx,cy,rx,ry,c)=>{for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)put(x,y,c);};
    const line=(x0,y0,x1,y1,c,w=1)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++){const t=n?i/n:0;rect(Math.round(x0+(x1-x0)*t),Math.round(y0+(y1-y0)*t),w,w,c);}};
    const triangle=(a,b,c,color)=>{const cross=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);for(let y=Math.min(a[1],b[1],c[1]);y<=Math.max(a[1],b[1],c[1]);y++)for(let x=Math.min(a[0],b[0],c[0]);x<=Math.max(a[0],b[0],c[0]);x++){const p=[x,y],u=cross(a,b,p),v=cross(b,c,p),w=cross(c,a,p);if((u>=0&&v>=0&&w>=0)||(u<=0&&v<=0&&w<=0))put(x,y,color);}};
    const eye=(x,y)=>{rect(x,y,2,3,ink);put(x,y,cream);};
    if(id==='enzymber'){
      line(22,21,28,17,dark,3);line(28,17,28,11,main,2);line(28,11,25,9,main,2);
      for(const x of[5,11,20,25])rect(x,22,3,6,dark);
      ellipse(18,20,9,5,main);ellipse(19,22,6,2,light);ellipse(8,17,6,5,main);ellipse(7,19,5,2,light);
      line(5,12,7,7,dark,2);line(7,7,12,5,main,2);line(12,5,16,7,light,2);line(16,7,16,11,main,2);
      eye(5,15);eye(11,14);rect(7,21,3,1,dark);rect(17,16,3,2,gold);rect(22,18,2,2,gold);
      if(st>=1){ellipse(18,13,2,2,dark);ellipse(23,15,2,2,dark);}if(st===2){line(17,11,21,8,light,2);line(21,8,24,10,gold,2);}
    }else if(id==='molmite'){
      for(const y of[13,19,25]){line(4,y,9,y-1,dark,2);line(23,y-1,28,y,dark,2);}
      ellipse(16,18,10,8,dark);ellipse(16,16,9,7,main);ellipse(16,14,7,5,light);rect(15,9,2,14,dark);
      rect(7,6,6,5,dark);rect(8,5,4,5,main);rect(9,5,2,2,cream);rect(20,6,6,5,dark);rect(21,5,4,5,main);rect(22,5,2,2,cream);
      ellipse(16,23,6,3,main);eye(12,20);eye(19,20);rect(15,25,3,1,dark);
      if(st>=1){rect(8,13,3,3,gold);rect(22,13,3,3,gold);}if(st===2){rect(12,3,3,4,gold);rect(18,3,3,4,gold);rect(10,24,3,3,light);rect(21,24,3,3,light);}
    }else if(id==='protonyx'){
      line(22,22,28,19,dark,2);line(28,19,29,13,main,2);line(29,13,25,10,main,2);ellipse(25,10,2,2,gold);
      for(const x of[8,12,20,24])rect(x,24,3,4,dark);ellipse(17,22,8,4,main);
      ellipse(9,8,4,5,main);ellipse(10,6,2,3,null);ellipse(23,8,4,5,main);ellipse(22,6,2,3,null);
      ellipse(16,16,9,7,main);ellipse(16,19,6,3,light);triangle([7,15],[3,18],[9,20],dark);triangle([25,15],[29,18],[23,20],dark);
      eye(11,14);eye(19,14);rect(15,19,3,2,dark);rect(14,22,5,1,dark);
      if(st>=1){rect(6,8,2,3,gold);rect(25,8,2,3,gold);}if(st===2){rect(15,9,3,3,gold);rect(10,23,2,3,light);rect(23,22,2,3,light);}
    }else if(id==='apertuft'){
      triangle([10,14],[2,18],[8,26],dark);triangle([22,14],[30,18],[24,26],dark);triangle([10,15],[4,18],[9,22],main);triangle([22,15],[28,18],[23,22],main);
      ellipse(16,21,7,7,main);triangle([9,12],[16,7],[23,12],main);rect(8,12,17,9,main);
      line(6,4,15,10,dark,2);line(16,10,25,4,dark,2);line(7,4,15,9,light);line(17,9,25,4,light);
      rect(10,13,5,6,cream);rect(18,13,5,6,cream);eye(12,14);eye(19,14);triangle([15,19],[18,19],[16,22],gold);
      rect(10,28,5,1,dark);rect(18,28,5,1,dark);line(12,23,16,26,light);line(16,26,20,23,light);
      if(st>=1){line(4,19,8,24,gold);line(24,24,28,19,gold);}if(st===2){rect(15,3,3,3,gold);triangle([12,25],[16,29],[20,25],dark);}
    }else if(id==='foliora'){
      ellipse(25,16,4,8,dark);ellipse(26,13,3,7,main);triangle([24,8],[28,3],[29,12],cream);
      for(const x of[8,13,20,24])rect(x,24,2,4,dark);ellipse(18,22,8,4,main);ellipse(18,23,5,2,light);
      triangle([5,15],[5,4],[12,10],dark);triangle([12,11],[18,5],[18,16],dark);triangle([6,12],[6,6],[10,10],cream);triangle([14,11],[17,8],[17,14],cream);
      ellipse(11,17,7,5,main);triangle([7,17],[2,20],[10,22],light);rect(2,19,2,2,dark);eye(7,15);eye(13,15);rect(7,22,4,1,dark);
      rect(11,6,2,5,gold);rect(10,6,4,2,gold);if(st>=1){rect(18,18,2,3,gold);rect(21,19,2,3,gold);}if(st===2){line(24,11,27,6,light);rect(12,4,2,2,cream);rect(15,24,2,3,cream);}
    }else if(id==='percentip'){
      for(const x of[6,9,15,18,24,27])rect(x,25,2,3,dark);
      ellipse(25,22,4,4,dark);ellipse(20,21,5,5,main);ellipse(14,21,5,5,dark);ellipse(14,20,4,4,main);ellipse(8,20,5,5,main);
      ellipse(6,17,4,5,main);ellipse(6,19,3,2,light);line(4,13,3,8,dark);line(9,13,11,9,dark);ellipse(3,7,2,2,gold);ellipse(11,8,2,2,gold);
      eye(3,15);eye(8,15);rect(4,21,3,1,dark);rect(13,17,2,2,cream);rect(19,17,2,2,cream);rect(25,20,2,2,cream);
      if(st>=1){rect(13,22,3,2,gold);rect(20,23,3,2,gold);}if(st===2){ellipse(16,13,2,2,light);ellipse(22,15,2,2,light);}
    }
    const pixels=g.map(row=>row.slice());
    for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++)if(g[y][x])for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(!g[y+dy][x+dx])pixels[y+dy][x+dx]=ink;
    const result=Object.freeze({size:N,pixels:Object.freeze(pixels.map(Object.freeze))});portraitCache.set(key,result);return result;
  }
  function drawCompanion(ctx,id,x,y,scale=3,stage=0){
    if(root.AceDATRenderedArt?.draw(ctx,id,x,y,scale,stage))return true;
    const portrait=companionPixels(id,stage);if(!portrait)return false;
    const s=(Number.isFinite(Number(scale))&&Number(scale)>0?Number(scale):3)*.78;
    ctx.save();try{ctx.translate(Math.round(x),Math.round(y));ctx.scale(s,s);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#24484b22';ctx.fillRect(-10,11,20,2);
      for(let row=0;row<portrait.size;row++)for(let col=0;col<portrait.size;col++){const color=portrait.pixels[row][col];if(color){ctx.fillStyle=color;ctx.fillRect(col-16,row-18,1,1);}}
    }finally{ctx.restore();}return true;
  }
  for(const id of ['realm-harbor-lock','realm-forge','realm-electron-tower','realm-fold','realm-archive','realm-clock','realm-return-tree','realm-gateway','realm-quarter-tower','realm-enzyme-workshop','realm-mole-balance','realm-conjugate-lantern','realm-angle-observatory','realm-structure-stacks','realm-percent-market','realm-tree','realm-station','realm-stand','realm-rest-bench','realm-plan']){const fallback=drawers[id];drawers[id]=(ctx,o,x,y,h)=>root.AceDATRenderedEnvironment?.draw(ctx,{...o,sprite:id},x,y,h)||fallback(ctx,o,x,y,h);}
  root.AceDATRealmArt={themes,drawers,tiles,chapterAccents,companionDefinitions,companionPixels,drawCompanion};
  const rescueOrigins=new Map([['portia',['BIO',1]],['parcelot',['BIO',2]],['chatelle',['GCHEM',1]],['stereon',['OCHEM',1]],['cubit',['PAT',1]],['skimmer',['RC',1]],['ratior',['QR',1]]]);
  const chapterOrigins=new Map([['chromelle',['BIO',4]],['daltoni',['GCHEM',3]],['chiralyn',['OCHEM',3]],['cubora',['PAT',3]],['chancet',['QR',3]],['claimfin',['RC',3]],['isolume',['GCHEM',4]],['vistrel',['PAT',4]],['lumivine',['BIO',5]],['fluxotl',['OCHEM',4]],['tallyfin',['QR',4]]]);
  const bestiary=root.AtlasBestiary;
  if(bestiary&&typeof bestiary.draw==='function'&&!bestiary.draw.aceDATCompanionArt){
    const previous=bestiary.draw;
    const draw=function(ctx,id,x,y,scale=3,evolved=false,stage){
      if(['cytrus','atpup','twistle'].includes(id)){
        const starterStage=bestiary.isAscended?.(id,evolved)?2:evolved?1:0;
        if(root.AceDATRenderedArt?.draw(ctx,id,x,y,scale,starterStage))return true;
      }
      const rescueOrigin=rescueOrigins.get(id)||chapterOrigins.get(id);
      if(rescueOrigin&&bestiary.species?.some(sp=>sp.id===id&&sp.courseId===rescueOrigin[0]&&sp.line?.session===rescueOrigin[1])){
        const current=stage==null||stage===''?bestiary.stageOf?.(id):stage;
        return root.AceDATRenderedArt?.draw(ctx,id,x,y,scale,current)||previous.apply(this,arguments);
      }
      const def=companions.get(id),registered=def&&bestiary.species?.some(sp=>sp.id===id&&sp.courseId===def.course&&sp.line?.session===def.session);
      if(!registered)return previous.apply(this,arguments);
      const current=stage==null||stage===''?bestiary.stageOf?.(id):stage;
      return drawCompanion(ctx,id,x,y,scale,current);
    };
    Object.defineProperty(draw,'aceDATCompanionArt',{value:true});bestiary.draw=draw;
  }
})(typeof window!=='undefined'?window:globalThis);
