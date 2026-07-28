/*
  Ace OChem ledger — the ONE place that answers "what has this student
  earned across the OChem system". Read-only aggregator over the stores the
  three surfaces already write:
    - Retold nights:  localStorage atDAT_retold_n<N>  ({s0:'ok'|'read',...})
    - Reaction Wheel: localStorage atDAT_wheel_v1     ({<family>:{<rxnKey>:{f,r}}})
  A spoke is EARNED only when both the forward and reverse laps are done,
  matching the wheel's own rule. Totals for wheels live in the engine's
  RXN_DB, so this module reports earned counts, not fractions.
*/
(function(){
  function read(key){
    try{ return JSON.parse(localStorage.getItem(key)||'{}'); }catch(e){ return {}; }
  }
  window.AceOChemLedger={
    _prefix:'retold',
    setPrefix:function(p){ this._prefix=p||'retold'; return this; },
    night:function(n,total){
      var st=read('atDAT_'+this._prefix+'_n'+n), done=0;
      for(var i=0;i<total;i++) if(st['s'+i]) done++;
      return {done:done,total:total,walked:total>0&&done>=total,started:done>0};
    },
    wheelEarned:function(familyKeys){
      var save=read('atDAT_wheel_v1'), count=0;
      Object.keys(save).forEach(function(wk){
        if(familyKeys&&familyKeys.indexOf(wk)===-1) return;
        var w=save[wk]||{};
        Object.keys(w).forEach(function(sk){ if(w[sk]&&w[sk].f&&w[sk].r) count++; });
      });
      return count;
    }
  };
})();
