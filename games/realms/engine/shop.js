/* Supply Lab (window.AtlasShop): a small generic shop. Coins and the bag live in the quest store
 * (ace_dat_realms_mnemon_v1_quest_v1: coins, bag), the same fields the battle engine spends from. Plain ASCII.
 * open(api, {title, intro, stock:[{key, name, price, note}]}) shows the counter in the world panel.
 * The battle engine reads no hooks from here: potions, revives and Great Capsules are its own bag items.
 */
(function(root){
  'use strict';
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const STOCK=[{key:'potion',name:'Potion',price:15,note:'Restores 50 HP to one creature in battle.'},{key:'greatCapsule',name:'Great Capsule',price:25,note:'Catches a wild creature once it is at 40 percent HP or less.'},{key:'revive',name:'Revive',price:30,note:'Wakes a fainted creature at half HP.'}];
  function wallet(){const R=root.AtlasRegion;const q=R?R.readQuest():{};return {coins:Math.max(0,Math.floor(+q.coins||0)),bag:q.bag&&typeof q.bag==='object'?q.bag:{}};}
  function open(api,o){o=o||{};const stock=o.stock||STOCK;
    const render=msg=>{const w=wallet();api.panel(o.title||'Supply Lab',`<p class="eyebrow">SUPPLY LAB | ${w.coins} COINS</p><p class="panel-intro">${esc(o.intro||'Stock up before the next route. Coins come from glints, trainers, wardens and stations.')}</p>${msg?`<p class="shop-msg" role="status">${esc(msg)}</p>`:''}<ul class="shop-list">${stock.map(x=>`<li><div><strong>${esc(x.name)}</strong><small>${esc(x.note)}</small><small>You have ${Math.max(0,Math.floor(+w.bag[x.key]||0))}</small></div><button type="button" class="primary" data-buy="${esc(x.key)}" ${w.coins<x.price?'disabled':''}>Buy for ${x.price}</button></li>`).join('')}</ul><div class="backup-actions"><button type="button" class="secondary" id="shopLeave">Leave</button></div>`);
      const body=document.getElementById('panelBody');if(!body)return;
      body.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const x=stock.find(s=>s.key===b.dataset.buy);if(!x)return;let ok=false;
        root.AtlasRegion.updateQuest(q=>{const c=Math.max(0,Math.floor(+q.coins||0));if(c<x.price)return;q.coins=c-x.price;q.bag=q.bag&&typeof q.bag==='object'?q.bag:{};q.bag[x.key]=Math.max(0,Math.floor(+q.bag[x.key]||0))+1;ok=true;});
        try{api.header&&api.header();}catch(e){}render(ok?'Bought one '+x.name+'.':'Not enough coins yet.');});
      const lv=document.getElementById('shopLeave');if(lv)lv.onclick=api.closePanel;};
    render('');}
  root.AtlasShop={open,STOCK};
})(typeof window!=='undefined'?window:globalThis);
