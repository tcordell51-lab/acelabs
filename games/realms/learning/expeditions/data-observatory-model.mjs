// Finite deterministic teaching calculations; no assessment or persistence imports.
const valuesOK=xs=>Array.isArray(xs)&&xs.length>0&&xs.length<=1000&&xs.every(x=>typeof x==='number'&&Number.isFinite(x)&&Math.abs(x)<=1e6);
export function summarizePopulation(values){
 if(!valuesOK(values))return null;
 const sorted=[...values].sort((a,b)=>a-b),n=sorted.length,total=sorted.reduce((s,x)=>s+x,0),mean=total/n;
 const median=n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2;
 const deviations=sorted.map(x=>x-mean),squaredDeviations=deviations.map(x=>x*x),variance=squaredDeviations.reduce((s,x)=>s+x,0)/n;
 return {sorted,n,total,mean,median,range:sorted[n-1]-sorted[0],deviations,squaredDeviations,variance,sd:Math.sqrt(variance)};
}
export function frequencyPopulation(values,frequencies){
 if(!valuesOK(values)||!Array.isArray(frequencies)||frequencies.length!==values.length||!frequencies.every(f=>Number.isSafeInteger(f)&&f>=0)||frequencies.reduce((s,f)=>s+f,0)>1000)return null;
 return summarizePopulation(values.flatMap((x,i)=>Array(frequencies[i]).fill(x)));
}
export function pooledMean(sizes,means){
 if(!valuesOK(means)||!Array.isArray(sizes)||sizes.length!==means.length||!sizes.every(n=>Number.isSafeInteger(n)&&n>0&&n<=1000000))return null;
 return sizes.reduce((s,n,i)=>s+n*means[i],0)/sizes.reduce((s,n)=>s+n,0);
}
export function transformPopulation(values,a,b){
 if(!valuesOK(values)||![a,b].every(x=>typeof x==='number'&&Number.isFinite(x)&&Math.abs(x)<=1e6))return null;
 return summarizePopulation(values.map(x=>a*x+b));
}
export function boxSummary(values){
 if(!Array.isArray(values)||values.length!==5||!valuesOK(values)||values.some((x,i)=>i>0&&x<values[i-1]))return null;
 return {min:values[0],q1:values[1],median:values[2],q3:values[3],max:values[4],iqr:values[3]-values[1],range:values[4]-values[0]};
}
