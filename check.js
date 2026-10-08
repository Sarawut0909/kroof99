
const products=[
["vinyl","VG Snow Roof","ไวนิล • VG"],["vinyl","VG Glacia","ไวนิล • VG"],["vinyl","VG Winter Roof","ไวนิล • VG"],["vinyl","VG Winter Plus","ไวนิล • VG"],
["vinyl","RoofyRoof","ไวนิล"],["vinyl","ภูเขา PR4","ไวนิล • ตราภูเขา"],["vinyl","ภูเขา PR5","ไวนิล • ตราภูเขา"],["vinyl","ภูเขา PR8","ไวนิล • ตราภูเขา"],
["fiber","JROOF","ไฟเบอร์กลาส"],["fiber","Mini Gold","ไฟเบอร์กลาส"],["fiber","D-Line","ไฟเบอร์กลาส"],["poly","โพลีคาร์บอเนต","แผ่นโปร่งแสง"]
];
const cats={all:"ทั้งหมด",vinyl:"แผ่นไวนิล",fiber:"แผ่นไฟเบอร์กลาส",poly:"แผ่นโพลีคาร์บอเนต"};
let current="all";
const DB_NAME="kroof_offline", DB_VER=1, STORE="images";
function db(){return new Promise((res,rej)=>{let r=indexedDB.open(DB_NAME,DB_VER);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function put(key, value){let d=await db();return new Promise((res,rej)=>{let tx=d.transaction(STORE,"readwrite");tx.objectStore(STORE).put(value,key);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}
async function get(key){let d=await db();return new Promise((res,rej)=>{let r=d.transaction(STORE).objectStore(STORE).get(key);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
function go(id){document.getElementById(id)?.scrollIntoView({behavior:"smooth"})}
function toggleAdmin(){let x=document.getElementById("admin");x.style.display=x.style.display==="block"?"none":"block";if(x.style.display==="block")x.scrollIntoView({behavior:"smooth"});}
function renderTabs(){document.getElementById("tabs").innerHTML=Object.entries(cats).map(([k,v])=>`<button class="tab ${k===current?"active":""}" onclick="filter('${k}')">${v}</button>`).join("")}
async async function render(){
  renderTabs();
  let arr=products.filter(p=>current==="all"||p[0]===current);
  let grid=document.getElementById("productGrid");
  grid.innerHTML="";
  for(let i=0;i<arr.length;i++){
    let p=arr[i],idx=products.indexOf(p),imgs=await get("p"+idx)||[],img=imgs[0];
    let c=document.createElement("div");
    c.className="card";
    c.innerHTML=`
      <div class="pic" onclick="openProductDetail(${idx})" style="cursor:pointer">
        ${img
          ? `<img src="${img}" alt="${p[1]}" style="cursor:pointer">`
          : `<div class="placeholder">ยังไม่มีรูป<br><b>เพิ่มได้ภายหลัง</b></div>`}
      </div>
      <div class="card-body">
        <span class="tag">${p[2]}</span>
        <h3>${p[1]}</h3>
        <div class="ask-price" onclick="openProductDetail(${idx})">สอบถามราคา</div>
      </div>`;
    grid.appendChild(c);
  }
}
function filter(k){current=k;render()}
function fillSelects(){document.getElementById("productSelect").innerHTML=products.map((p,i)=>`<option value="${i}">${p[1]} — ${p[2]}</option>`).join("")}
async function filesToData(files){return Promise.all([...files].map(f=>new Promise((res,rej)=>{let r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)})))}
async function saveProductImages(){let i=document.getElementById("productSelect").value,fs=document.getElementById("productImage").files;if(!fs.length)return msg("กรุณาเลือกรูปสินค้า");await put("p"+i,await filesToData(fs));document.getElementById("productImage").value="";msg("บันทึกรูปสินค้าแล้ว");render()}
async function saveServiceImages(){let k=document.getElementById("serviceSelect").value,fs=document.getElementById("serviceImage").files;if(!fs.length)return msg("กรุณาเลือกรูปบริการ");await put("s"+k,await filesToData(fs));document.getElementById("serviceImage").value="";msg("บันทึกรูปบริการแล้ว");renderServiceImages()}
function msg(t){document.getElementById("adminMsg").textContent=t}
fillSelects();render();renderServiceImages();


let galleryImages=[], galleryIndex=0, galleryTitle="";
async function openGallery(key,title){
  galleryImages=await get(key)||[];
  galleryIndex=0;
  galleryTitle=title;
  document.getElementById("galleryTitle").textContent=title;
  document.getElementById("galleryFolderName").textContent=title;
  document.getElementById("galleryModal").classList.add("show");
  renderFolderGallery();
}
function closeGallery(){document.getElementById("galleryModal").classList.remove("show")}
function renderFolderGallery(){
  const grid=document.getElementById("galleryThumbs");
  const empty=document.getElementById("galleryEmpty");
  if(!galleryImages.length){
    grid.innerHTML="";
    empty.style.display="block";
    return;
  }
  empty.style.display="none";
  grid.innerHTML=galleryImages.map((src,i)=>`
    <div class="folder-item" onclick="openImageLightbox(${i})">
      <img src="${src}" alt="${galleryTitle} รูปที่ ${i+1}">
      <div class="filename">รูปที่ ${i+1}</div>
    </div>`).join("");
}
function openImageLightbox(index){
  galleryIndex=index;
  renderLightbox();
  document.getElementById("imageLightbox").classList.add("show");
}
function closeImageLightbox(){document.getElementById("imageLightbox").classList.remove("show")}
function renderLightbox(){
  if(!galleryImages.length)return;
  document.getElementById("lightboxImage").src=galleryImages[galleryIndex];
  document.getElementById("lightboxCaption").textContent=`${galleryTitle} — รูปที่ ${galleryIndex+1} / ${galleryImages.length}`;
}
function changeGallery(step){
  if(!galleryImages.length)return;
  galleryIndex=(galleryIndex+step+galleryImages.length)%galleryImages.length;
  renderLightbox();
}
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    if(document.getElementById("imageLightbox").classList.contains("show")) closeImageLightbox();
    else closeGallery();
  }
  if(e.key==="ArrowLeft")changeGallery(-1);
  if(e.key==="ArrowRight")changeGallery(1);
});


async function openProductPage(index){
  const p=products[index];
  if(!p)return;
  const imgs=await get("p"+index)||[];
  document.getElementById("productPageTitle").textContent=p[1];
  document.getElementById("productFolderText").textContent=p[1];
  const grid=document.getElementById("productPageGallery");
  if(!imgs.length){
    grid.innerHTML=`<div class="product-no-image">
      <div style="font-size:42px;margin-bottom:10px">📁</div>
      <b>ยังไม่มีรูปของ ${p[1]}</b><br>
      <span>เพิ่มรูปหลายรูปได้จากเมนู “จัดการรูป”</span>
    </div>`;
  }else{
    grid.innerHTML=imgs.map((src,i)=>`
      <div class="product-photo" onclick="openProductDetail(index)">
        <img src="${src}" alt="${p[1]} รูปที่ ${i+1}">
        <div class="product-photo-name">สอบถามราคา</div>
        <div class="photo-spec-title">ขนาดของแผ่นหลังคา</div>${renderSpecText(p[1])}
      </div>`).join("");
  }
  document.getElementById("productPage").classList.add("show");
  window.scrollTo(0,0);
}
function closeProductPage(){
  document.getElementById("productPage").classList.remove("show");
}
async function openProductBigImage(productIndex,imageIndex){
  const imgs=await get("p"+productIndex)||[];
  galleryImages=imgs;
  galleryIndex=imageIndex;
  galleryTitle=products[productIndex][1];
  renderLightbox();
  document.getElementById("imageLightbox").classList.add("show");
}


const productSpecs = {
  "VG Snow Roof": {
    "วัสดุ":"High Performance iR-uPVC Premium Grade",
    "กว้าง":"ประมาณ 26.2 ซม.",
    "ยาว":"3 / 3.5 / 4 / 4.5 / 5 / 5.5 / 6 / 6.5 ม.",
    "หนา":"ประมาณ 6 มม.",
    "สี":"สีขาว"
  },
  "VG Glacia": {
    "กว้าง":"33.4 เซนติเมตร",
    "หนา":"3 เซนติเมตร (หรือ 9 มิลลิเมตร ขึ้นอยู่กับการวัดโครงสร้าง)",
    "ยาว":"3 - 6.5 เมตร หรือสั่งยาว 7 เมตรขึ้นไป"
  },
  "VG Winter Roof": {
    "กว้าง":"ยังไม่ได้ระบุ",
    "ยาว":"ยังไม่ได้ระบุ",
    "สี":"ยังไม่ได้ระบุ"
  },
  "VG Winter Plus": {
    "กว้าง":"ยังไม่ได้ระบุ",
    "ยาว":"ยังไม่ได้ระบุ",
    "สี":"ยังไม่ได้ระบุ"
  },
  "RoofyRoof": {
    "กว้าง":"25 ซม.",
    "ยาว":"4 / 5 / 6 ม.",
    "สี":"ยังไม่ได้ระบุในข้อมูลสินค้า"
  },
  "ภูเขา PR4": {
    "กว้าง":"ยังไม่ได้ระบุ",
    "ยาว":"ยังไม่ได้ระบุ",
    "สี":"ยังไม่ได้ระบุ"
  },
  "ภูเขา PR5": {
    "กว้าง":"ยังไม่ได้ระบุ",
    "ยาว":"ยังไม่ได้ระบุ",
    "สี":"ยังไม่ได้ระบุ"
  },
  "ภูเขา PR8": {
    "กว้าง":"ยังไม่ได้ระบุ",
    "ยาว":"ยังไม่ได้ระบุ",
    "สี":"ยังไม่ได้ระบุ"
  },
  "JROOF": {
    "กว้าง":"ยังไม่ได้ระบุ",
    "ยาว":"ยังไม่ได้ระบุ",
    "สี":"ยังไม่ได้ระบุ"
  },
  "Mini Gold": {
    "กว้าง":"105 ซม.",
    "ยาว":"3 / 4 / 5 / 6 / 9 / 12 ม.",
    "ความสูงลอน":"11 มม.",
    "ความลาดชันขั้นต่ำ":"5 องศา",
    "ระยะแป":"ไม่เกิน 100 ซม.",
    "ป้องกัน UV":"UVIC / UVAS บล็อก UV ได้สูงสุด 99%"
  },
  "D-Line": {
    "กว้าง":"ยังไม่ได้ระบุ",
    "ยาว":"ยังไม่ได้ระบุ",
    "สี":"ยังไม่ได้ระบุ"
  },
  "โพลีคาร์บอเนต": {
    "กว้าง":"ยังไม่ได้ระบุ",
    "ยาว":"ยังไม่ได้ระบุ",
    "สี":"ยังไม่ได้ระบุ"
  }
};

function renderSpecText(title){
  const s=productSpecs[title]||{};
  const rows=Object.entries(s);
  if(!rows.length)return "";
  return `<div class="photo-spec">${rows.map(([k,v])=>`
    <div class="spec-row"><span class="spec-key">${k}</span><span class="spec-value">${v}</span></div>
  `).join("")}</div>`;
}


async function openProductDetail(productIndex){
  const p=products[productIndex];
  if(!p)return;
  const imgs=await get("p"+productIndex)||[];
  document.getElementById("detailTitle").textContent=p[1];
  const spec=productSpecs[p[1]]||{};
  document.getElementById("detailSpecs").innerHTML=Object.entries(spec).length
    ? Object.entries(spec).map(([k,v])=>`<div class="detail-spec-row"><span class="detail-spec-key">${k}</span><span class="detail-spec-value">${v}</span></div>`).join("")
    : `<div style="color:#718092">ยังไม่มีรายละเอียดสินค้า</div>`;
  const grid=document.getElementById("detailImages");
  grid.innerHTML=imgs.length
    ? imgs.map((src,i)=>`<div class="detail-image" onclick="openProductBigImage(${productIndex},${i})"><img src="${src}" alt="${p[1]} รูปที่ ${i+1}"></div>`).join("")
    : `<div class="detail-empty" style="grid-column:1/-1">ยังไม่มีรูปสินค้า</div>`;
  document.getElementById("productDetailPage").classList.add("show");
  document.getElementById("productPage").classList.remove("show");
  window.scrollTo(0,0);
}
function closeProductDetail(){
  document.getElementById("productDetailPage").classList.remove("show");
}

