/* Compatibility interfaces backed by this copy's reviewed DAT registry. */
(function(root){
  'use strict';
  const permitted = item => {
    const id=typeof item==='string'?item:item?.id;
    return (root.MNEMON_ITEMS||[]).some(q=>q.id===id&&q.reviewStatus==='internal-reviewed'&&q.verified===true&&q.pool!=='later');
  };
  root.AtlasCatalog={courses:[],lectures:[],exams:[],resources:[],loadCourse:()=>Promise.resolve(null),loadResource:()=>Promise.resolve(null)};
  root.AtlasExam2SourceProof={eligible:permitted,filter:items=>(items||[]).filter(permitted),forQuestion:()=>null,sourceLink:()=>'',tier:'internal-review'};
  root.AtlasTrainer={name:()=> 'Trainer',personalize:text=>String(text)};
})(window);
