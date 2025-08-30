import * as math from "mathjs";

// Simple utility helpers
const el = sel => document.querySelector(sel);
const create = (tag, opts={}) => Object.assign(document.createElement(tag), opts);
const createLabel = (forId, textContent) => create("label", { htmlFor: forId, textContent: textContent, className: "input-label" });

// Calculator registry: each has title, help, renderer(element)
const calcs = {
  scientific: {
    title: "Calculadora Científica",
    help: "Evalúa expresiones con sin, cos, tan, sqrt, log, ln, exp, pi, e.",
    render(target){
      target.innerHTML = "";
      const exprId = "expr-scientific";
      const expr = create("input",{className:"input",placeholder:"Ej: 2+3*sqrt(4)", id:exprId});
      const btn = create("button",{className:"button",textContent:"Calcular"});
      const res = create("div",{className:"result",id:"res"});
      const row = create("div",{className:"form-row"});
      row.append(createLabel(exprId, "Expresión:"), expr, btn);
      target.append(row,res);
      btn.onclick = ()=>{
        try{
          const v = math.evaluate(expr.value || "0");
          res.textContent = String(v);
        }catch(e){
          res.textContent = "Error: "+e.message;
        }
      };
    }
  },

  fractions: {
    title: "Calculadora de Fracciones",
    help: "Suma, resta, multiplicación y división de fracciones.",
    render(target){
      target.innerHTML = "";
      const faId = "fa-fractions";
      const fbId = "fb-fractions";
      const opId = "op-fractions";
      const a = create("input",{className:"input",placeholder:"Fracción A (ej: 3/4)",id:faId});
      const b = create("input",{className:"input",placeholder:"Fracción B (ej: 5/6)",id:fbId});
      const op = create("select",{className:"select",id:opId,innerHTML:"<option value='+'>+</option><option value='-'>-</option><option value='*'>×</option><option value='/'>÷</option>"});
      const btn = create("button",{className:"button",textContent:"Calcular"});
      const out = create("div",{className:"result"});
      const row = create("div",{className:"form-row"});
      row.append(createLabel(faId, "Fracción A:"), a, createLabel(opId, "Operación:"), op, createLabel(fbId, "Fracción B:"), b, btn);
      target.append(row, out);
      btn.onclick = ()=>{
        try{
          const A = math.fraction(a.value||"0");
          const B = math.fraction(b.value||"0");
          let R;
          switch(op.value){case '+': R = math.add(A,B); break; case '-': R = math.subtract(A,B); break; case '*': R = math.multiply(A,B); break; default: R = math.divide(A,B);}
          out.textContent = `${math.format(R)}  ≈ ${math.number(R)}`;
        }catch(e){ out.textContent = "Error: "+e.message }
      };
    }
  },

  factor: {
    title: "Factorización de Números",
    help: "Factor primo de un entero positivo.",
    render(target){
      target.innerHTML = "";
      const nId = "n-factor";
      const n = create("input",{className:"input",placeholder:"Número entero (ej: 360)",id:nId});
      const btn = create("button",{className:"button",textContent:"Factorizar"});
      const out = create("div",{className:"result"});
      target.append(create("div",{className:"form-row"}));
      target.querySelector(".form-row").append(createLabel(nId, "Número:"), n,btn);
      target.append(out);
      btn.onclick = ()=>{
        const val = Math.floor(Number(n.value));
        if(!Number.isFinite(val) || val<2){ out.textContent="Introduce entero ≥ 2"; return; }
        let x = val; const factors = {};
        for(let p=2;p*p<=x;p++){
          while(x%p===0){ factors[p]=(factors[p]||0)+1; x/=p; }
        }
        if(x>1) factors[x]=(factors[x]||0)+1;
        const parts = Object.entries(factors).map(([p,e])=> `${p}^${e}`);
        out.textContent = `${val} = ${parts.join(" · ")}`;
      };
    }
  },

  primes: {
    title: "Números Primos",
    help: "Test de primalidad y listado hasta N.",
    render(target){
      target.innerHTML="";
      const pnId = "pn-primes";
      const n = create("input",{className:"input",placeholder:"Prueba o lista hasta N (ej: 100)",id:pnId});
      const btnTest = create("button",{className:"button small",textContent:"Test"});
      const btnList = create("button",{className:"button small",textContent:"Listar hasta N"});
      const out = create("div",{className:"result"});
      const row = create("div",{className:"form-row"});
      row.append(createLabel(pnId, "Número N:"), n, btnTest, btnList);
      target.append(row,out);
      const isPrime = (m)=>{
        if(m<2) return false;
        if(m%2===0) return m===2;
        for(let i=3;i*i<=m;i+=2) if(m%i===0) return false;
        return true;
      };
      btnTest.onclick = ()=>{
        const v = Math.floor(Number(n.value));
        out.textContent = isPrime(v)? `${v} es primo` : `${v} no es primo`;
      };
      btnList.onclick = ()=>{
        const v = Math.floor(Number(n.value));
        if(v<2){ out.textContent="Introduce N ≥ 2"; return; }
        const primes=[];
        for(let i=2;i<=v;i++) if(isPrime(i)) primes.push(i);
        out.innerHTML = `<div class="note">Primos hasta ${v} (${primes.length}):</div><div class="code">${primes.join(", ")}</div>`;
      };
    }
  },

  mcm: {
    title: "Mínimo Común Múltiplo (MCM)",
    help: "Introduce números separados por comas.",
    render(target){
      target.innerHTML="";
      const inpId = "inp-mcm";
      const inp = create("input",{className:"input",placeholder:"Ej: 12,18,30", id:inpId});
      const btn = create("button",{className:"button",textContent:"Calcular MCM"});
      const out = create("div",{className:"result"});
      target.append(create("div",{className:"form-row"}));
      target.querySelector(".form-row").append(createLabel(inpId, "Números (separados por comas):"), inp,btn);
      target.append(out);
      const gcd = (a,b)=>b?gcd(b,a%b):Math.abs(a);
      const lcm2 = (a,b)=>Math.abs(a*b)/gcd(a,b);
      btn.onclick = ()=>{
        const arr = inp.value.split(",").map(s=>Number(s.trim())).filter(n=>!isNaN(n));
        if(arr.length===0){ out.textContent="Introduce valores numéricos"; return; }
        let v = arr.reduce((acc,n)=>lcm2(acc,n), arr[0]);
        out.textContent = `MCM = ${v}`;
      };
    }
  },

  mcd: {
    title: "Máximo Común Divisor (MCD)",
    help: "Introduce números separados por comas.",
    render(target){
      target.innerHTML="";
      const inpId = "inp-mcd";
      const inp = create("input",{className:"input",placeholder:"Ej: 12,18,30", id:inpId});
      const btn = create("button",{className:"button",textContent:"Calcular MCD"});
      const out = create("div",{className:"result"});
      target.append(create("div",{className:"form-row"}));
      target.querySelector(".form-row").append(createLabel(inpId, "Números (separados por comas):"), inp,btn);
      target.append(out);
      const gcd = (a,b)=>b?gcd(b,a%b):Math.abs(a);
      btn.onclick = ()=>{
        const arr = inp.value.split(",").map(s=>Number(s.trim())).filter(n=>!isNaN(n));
        if(arr.length===0){ out.textContent="Introduce valores numéricos"; return; }
        let v = arr.reduce((acc,n)=>gcd(acc,n), arr[0]);
        out.textContent = `MCD = ${v}`;
      };
    }
  },

  powers: {
    title: "Potencias y Raíces",
    help: "Elevar y extraer raíces (n√x).",
    render(target){
      target.innerHTML="";
      const xId = "x-powers";
      const yId = "y-powers";
      const opId = "op-powers";
      const x = create("input",{className:"input",placeholder:"Base (x)", id:xId});
      const op = create("select",{className:"select",id:opId,innerHTML:"<option value='pow'>Potencia x^y</option><option value='root'>Raíz y√x</option>"});
      const y = create("input",{className:"input",placeholder:"Exponente o índice (y)", id:yId});
      const btn = create("button",{className:"button",textContent:"Calcular"});
      const out = create("div",{className:"result"});
      const row = create("div",{className:"form-row"});
      row.append(createLabel(xId, "Base (x):"), x, createLabel(opId, "Operación:"), op, createLabel(yId, "Exponente/Índice (y):"), y, btn);
      target.append(row,out);
      btn.onclick = ()=>{
        const a = Number(x.value), b = Number(y.value);
        if(op.value==='pow') out.textContent = `${a}^${b} = ${math.format(math.pow(a,b))}`;
        else out.textContent = `${b}√${a} = ${math.format(math.nthRoot(a,b))}`;
      };
    }
  },

  logs: {
    title: "Logaritmos",
    help: "Logaritmo base b de x; usa base por defecto e para ln.",
    render(target){
      target.innerHTML="";
      const xId = "x-logs";
      const baseId = "base-logs";
      const x = create("input",{className:"input",placeholder:"Número x", id:xId});
      const base = create("input",{className:"input",placeholder:"Base (opcional, p.ej 10). Dejar vacío = ln", id:baseId});
      const btn = create("button",{className:"button",textContent:"Calcular"});
      const out = create("div",{className:"result"});
      target.append(create("div",{className:"form-row"}));
      target.querySelector(".form-row").append(createLabel(xId, "Número (x):"), x, createLabel(baseId, "Base (opcional):"), base, btn);
      target.append(out);
      btn.onclick = ()=>{
        const xv = Number(x.value);
        if(isNaN(xv) || xv<=0){ out.textContent="x debe ser > 0"; return; }
        if(base.value.trim()===""){ out.textContent = `ln(${xv}) = ${math.format(math.log(xv))}`; return; }
        const b = Number(base.value);
        if(isNaN(b) || b<=0){ out.textContent="Base válida > 0"; return; }
        out.textContent = `log_${b}(${xv}) = ${math.format(math.log(xv, b))}`;
      };
    }
  },

  quadratic: {
    title: "Ecuación Cuadrática",
    help: "Forma ax² + bx + c = 0. Devuelve raíces reales o complejas.",
    render(target){
      target.innerHTML="";
      const aId = "a-quadratic";
      const bId = "b-quadratic";
      const cId = "c-quadratic";
      const a = create("input",{className:"input",placeholder:"a", id:aId});
      const b = create("input",{className:"input",placeholder:"b", id:bId});
      const c = create("input",{className:"input",placeholder:"c", id:cId});
      const btn = create("button",{className:"button",textContent:"Resolver"});
      const out = create("div",{className:"result"});
      target.append(create("div",{className:"form-row"}));
      target.querySelector(".form-row").append(createLabel(aId, "a:"), a, createLabel(bId, "b:"), b, createLabel(cId, "c:"), c, btn);
      target.append(out);
      btn.onclick = ()=>{
        const A=Number(a.value), B=Number(b.value), C=Number(c.value);
        if(A===0){ out.textContent="a no puede ser 0 (no es cuadrática)"; return; }
        const D = B*B - 4*A*C;
        const sqrtD = math.sqrt(math.complex(D));
        const r1 = math.divide(math.subtract(-B, sqrtD), 2*A);
        const r2 = math.divide(math.add(-B, sqrtD), 2*A);
        out.innerHTML = `Discriminante: ${math.format(D)}<br/>x₁ = ${math.format(r1)}<br/>x₂ = ${math.format(r2)}`;
      };
    }
  },

  linear: {
    title: "Ecuación Lineal",
    help: "Resolver ax + b = 0 o sistema 2x2.",
    render(target){
      target.innerHTML="";
      const modeId = "mode-linear";
      const mode = create("select",{className:"select", id:modeId, innerHTML:"<option value='single'>Una variable ax+b=0</option><option value='system'>Sistema 2x2</option>"});
      const container = create("div");
      const out = create("div",{className:"result"});
      target.append(create("div",{className:"form-row"}));
      target.querySelector(".form-row").append(createLabel(modeId, "Modo:"), mode);
      target.append(container,out);
      const renderSingle = ()=>{
        container.innerHTML = "";
        const aId = "a-linear-single";
        const bId = "b-linear-single";
        const a = create("input",{className:"input",placeholder:"a", id:aId});
        const b = create("input",{className:"input",placeholder:"b", id:bId});
        const btn = create("button",{className:"button",textContent:"Resolver"});
        container.append(create("div",{className:"form-row"}));
        container.querySelector(".form-row").append(createLabel(aId, "a:"), a, createLabel(bId, "b:"), b, btn);
        btn.onclick = ()=> {
          const A=Number(a.value), B=Number(b.value);
          if(A===0){ out.textContent = B===0 ? "Infinitas soluciones" : "Sin solución"; return; }
          out.textContent = `x = ${(-B/A)}`;
        };
      };
      const renderSystem = ()=>{
        container.innerHTML = "";
        const a11Id = "a11-linear-system";
        const a12Id = "a12-linear-system";
        const b1Id = "b1-linear-system";
        const a21Id = "a21-linear-system";
        const a22Id = "a22-linear-system";
        const b2Id = "b2-linear-system";
        const a11 = create("input",{className:"input",placeholder:"a11", id:a11Id});
        const a12 = create("input",{className:"input",placeholder:"a12", id:a12Id});
        const b1 = create("input",{className:"input",placeholder:"b1", id:b1Id});
        const a21 = create("input",{className:"input",placeholder:"a21", id:a21Id});
        const a22 = create("input",{className:"input",placeholder:"a22", id:a22Id});
        const b2 = create("input",{className:"input",placeholder:"b2", id:b2Id});
        const btn = create("button",{className:"button",textContent:"Resolver 2x2"});
        
        const row1 = create("div", {className:"form-row"});
        row1.append(createLabel(a11Id, "a₁₁:"), a11, createLabel(a12Id, "a₁₂:"), a12, createLabel(b1Id, "b₁:"), b1);
        const row2 = create("div", {className:"form-row"});
        row2.append(createLabel(a21Id, "a₂₁:"), a21, createLabel(a22Id, "a₂₂:"), a22, createLabel(b2Id, "b₂:"), b2, btn);

        container.append(row1, row2);
        
        btn.onclick = ()=>{
          const A = [[Number(a11.value),Number(a12.value)],[Number(a21.value),Number(a22.value)]];
          const B = [Number(b1.value),Number(b2.value)];
          const det = A[0][0]*A[1][1]-A[0][1]*A[1][0];
          if(det===0){ out.textContent="Determinante 0 → no única solución"; return; }
          const x = (B[0]*A[1][1]-A[0][1]*B[1])/det;
          const y = (A[0][0]*B[1]-B[0]*A[1][0])/det;
          out.textContent = `x = ${x}, y = ${y}`;
        };
      };
      mode.onchange = ()=> mode.value==='single' ? renderSingle() : renderSystem();
      mode.dispatchEvent(new Event('change'));
    }
  },

  series: {
    title: "Series Aritméticas y Geométricas",
    help: "Calcula término n y suma de n términos.",
    render(target){
      target.innerHTML="";
      const typeId = "type-series";
      const a1Id = "a1-series";
      const rId = "r-series";
      const nId = "n-series";
      const type = create("select",{className:"select", id:typeId, innerHTML:"<option value='arith'>Aritmética</option><option value='geom'>Geométrica</option>"});
      const a1 = create("input",{className:"input",placeholder:"Primer término a1", id:a1Id});
      const r = create("input",{className:"input",placeholder:"Razón (d o r)", id:rId});
      const n = create("input",{className:"input",placeholder:"n (término)", id:nId});
      const btn = create("button",{className:"button",textContent:"Calcular"});
      const out = create("div",{className:"result"});
      const row = create("div",{className:"form-row"});
      row.append(
        createLabel(typeId, "Tipo de serie:"), type,
        createLabel(a1Id, "Primer término (a₁):"), a1,
        createLabel(rId, "Razón (d/r):"), r,
        createLabel(nId, "Término N:"), n,
        btn
      );
      target.append(row,out);
      btn.onclick = ()=>{
        const A1=Number(a1.value), R=Number(r.value), N=Math.floor(Number(n.value));
        if(N<=0){ out.textContent="n debe ser entero > 0"; return; }
        if(type.value==='arith'){
          const an = A1 + (N-1)*R;
          const sum = (N/2)*(2*A1 + (N-1)*R);
          out.innerHTML = `aₙ = ${an}<br/>Sₙ = ${sum}`;
        }else{
          const an = A1 * Math.pow(R, N-1);
          let sum;
          if(R===1) sum = A1 * N; else sum = A1*(1-Math.pow(R,N))/(1-R);
          out.innerHTML = `aₙ = ${an}<br/>Sₙ = ${sum}`;
        }
      };
    }
  }
};

/* UI wiring */
const list = document.getElementById("calc-list");
const panel = document.getElementById("panel");
const title = document.getElementById("calc-title");
const help = document.getElementById("help-text");

function activate(id){
  [...list.querySelectorAll("li")].forEach(li=>li.classList.toggle("active", li.dataset.id===id));
  const cfg = calcs[id];
  title.textContent = cfg.title;
  help.textContent = cfg.help || "";
  cfg.render(panel);
}

list.addEventListener("click", (e)=>{
  const li = e.target.closest("li");
  if(!li) return;
  activate(li.dataset.id);
});

// initialize default
activate('scientific');