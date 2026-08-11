const t=r=>r==null||isNaN(r)?"₹0.00":`₹${Number(r).toFixed(2)}`,i=r=>{if(r==null||isNaN(r))return"₹0";const e=Number(r);return e%1===0?`₹${e}`:`₹${e.toFixed(2)}`};export{t as a,i as f};
