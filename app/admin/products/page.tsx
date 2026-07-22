"use client";

/* eslint-disable @next/next/no-img-element, react-hooks/exhaustive-deps */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAppDispatch, useAppState } from "@/lib/store/provider";
import { useToast } from "@/lib/toast/provider";
import type { ProductCatalogItem } from "@/lib/types";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

type Product = { id:string; title:string; price_label?:string|null; image_url:string|null; purchase_url?:string|null; description:string|null; category?:string|null; like_count?:number; want_students?:Array<{id:string;name:string;birth_date:string|null}> };
type MarketProduct = Product & { purchase_url:string; prize_image_url:string|null };
type PromoBanner = { id:string; title:string; image_url:string|null; link_url:string };
type Tab = "cart" | "recommended";
type ViewMode = "card" | "list";

const PAGE_SIZE = 20;
const DISCLOSURE = "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
}
function GridIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
}
function ListIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>;
}
function FilterIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M4 6h16M7 12h10M10 18h4"/></svg>;
}

function affiliateLabel(url?: string | null): string {
  if (!url) return "직접 등록";
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("coupang.com") || host.includes("coupa.ng")) return "쿠팡";
    if (host.includes("temu.com")) return "테무";
  } catch { return "기타 제휴"; }
  return "기타 제휴";
}
function birthdayText(value:string|null){if(!value)return null;const[,month,day]=value.split("-");return `${Number(month)}월 ${Number(day)}일`;}

function ProductInfo({ product, compact = false }: { product:Product; compact?:boolean }) {
  if(compact)return <div className="min-w-0 flex-1"><p className="truncate text-micro text-brand-amber">{product.category ?? "미분류"} / <span className="text-text-muted">{affiliateLabel(product.purchase_url)}</span></p><h4 className="line-clamp-1 text-caption font-bold">{product.title}</h4><p className="mt-1 text-caption font-bold">{product.price_label ?? "가격정보 없음"}</p></div>;
  return <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2 text-micro"><p className="min-w-0 truncate text-brand-amber">{product.category ?? "미분류"}</p><p className="shrink-0 text-text-muted">{affiliateLabel(product.purchase_url)}</p></div><h4 className="line-clamp-2 text-caption font-bold">{product.title}</h4><p className="mt-1 text-caption font-bold">{product.price_label ?? "가격정보 없음"}</p><details className="mt-2 text-micro text-text-secondary"><summary className="cursor-pointer">더보기</summary><p className="mt-2">{product.description ?? "상품 설명이 없습니다."}</p></details></div>;
}

function PromotionCarousel({ banners }: { banners:PromoBanner[] }) {
  const [index,setIndex]=useState(0); const [start,setStart]=useState<number|null>(null);
  useEffect(()=>{if(banners.length<2)return;const timer=setInterval(()=>setIndex(current=>(current+1)%banners.length),2000);return()=>clearInterval(timer);},[banners.length]);
  if(!banners.length)return null;
  const end=(x:number)=>{if(start!==null&&Math.abs(x-start)>40)setIndex(current=>(current+(x<start?1:-1)+banners.length)%banners.length);setStart(null);};
  return <section className="mt-8"><h3 className="mb-3 text-subtitle">상품 이벤트 · 프로모션</h3><div onTouchStart={event=>setStart(event.touches[0].clientX)} onTouchEnd={event=>end(event.changedTouches[0].clientX)} className="max-w-sm overflow-hidden rounded-card border border-border"><div className="flex transition-transform duration-500" style={{transform:`translateX(-${index*100}%)`}}>{banners.map(banner=><a key={banner.id} href={banner.link_url} target="_blank" rel="noreferrer" className="flex aspect-square min-w-full items-center justify-center bg-surface-raised">{banner.image_url?<img src={banner.image_url} alt={banner.title} className="h-full w-full object-cover"/>:<span className="px-5 text-center text-subtitle">{banner.title}</span>}</a>)}</div></div><p className="mt-2 text-micro text-text-muted">{DISCLOSURE}</p></section>;
}

function CatalogToolbar({ categories, category, setCategory, filterOpen, setFilterOpen, searchOpen, setSearchOpen, query, setQuery, view, setView }: {
  categories:string[]; category:string; setCategory:(value:string)=>void; filterOpen:boolean; setFilterOpen:(value:boolean)=>void;
  searchOpen:boolean; setSearchOpen:(value:boolean)=>void; query:string; setQuery:(value:string)=>void; view:ViewMode; setView:(value:ViewMode)=>void;
}) {
  return <div className="mb-4">
    <div className="flex items-center gap-2">
      <button type="button" aria-expanded={filterOpen} onClick={()=>setFilterOpen(!filterOpen)} className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-2 text-micro ${filterOpen||category!=="전체"?"border-brand-amber text-brand-amber":"border-border text-text-secondary"}`}><FilterIcon/><span>{category === "전체" ? "카테고리" : category}</span></button>
      <div className="ml-auto flex min-w-0 items-center justify-end gap-1.5">
        <div className={`flex items-center overflow-hidden rounded-lg border border-border bg-surface-card transition-[width] duration-200 ${searchOpen?"w-44 sm:w-64":"w-9"}`}>
          <button type="button" aria-label="상품 검색" onClick={()=>setSearchOpen(true)} className="flex h-9 w-9 shrink-0 items-center justify-center text-text-secondary"><SearchIcon/></button>
          {searchOpen&&<input autoFocus value={query} onChange={event=>setQuery(event.target.value)} onBlur={()=>{if(!query)setSearchOpen(false);}} placeholder="상품명 또는 카테고리" className="h-9 min-w-0 flex-1 border-0 bg-transparent px-1.5 text-caption outline-none"/>}
        </div>
        <div className="flex rounded-lg border border-border p-0.5">
          <button type="button" aria-label="카드형 보기" aria-pressed={view==="card"} onClick={()=>setView("card")} className={`flex h-8 w-8 items-center justify-center rounded-md ${view==="card"?"bg-brand-amber text-surface-page":"text-text-secondary"}`}><GridIcon/></button>
          <button type="button" aria-label="목록형 보기" aria-pressed={view==="list"} onClick={()=>setView("list")} className={`flex h-8 w-8 items-center justify-center rounded-md ${view==="list"?"bg-brand-amber text-surface-page":"text-text-secondary"}`}><ListIcon/></button>
        </div>
      </div>
    </div>
    {filterOpen&&<div className="mt-2 flex flex-wrap gap-1.5 rounded-xl bg-surface-raised p-2">{categories.map(item=><button type="button" key={item} onClick={()=>setCategory(item)} className={`rounded-full px-3 py-1.5 text-micro ${category===item?"bg-brand-amber font-bold text-surface-page":"bg-surface-card text-text-secondary"}`}>{item}</button>)}</div>}
  </div>;
}

export default function AdminProductsPage() {
  const state=useAppState(); const dispatch=useAppDispatch(); const toast=useToast();
  const [tab,setTab]=useState<Tab>("cart"); const [market,setMarket]=useState<MarketProduct[]>([]); const [saved,setSaved]=useState<string[]>([]);
  const [query,setQuery]=useState(""); const [searchOpen,setSearchOpen]=useState(false); const [filterOpen,setFilterOpen]=useState(false); const [category,setCategory]=useState("전체");
  const [views,setViews]=useState<Record<Tab,ViewMode>>({cart:"card",recommended:"card"}); const [loading,setLoading]=useState(true);
  const [banners,setBanners]=useState<PromoBanner[]>([]); const [page,setPage]=useState(0); const [touchStart,setTouchStart]=useState<number|null>(null);
  const [editing,setEditing]=useState<Product|null>(null); const [formOpen,setFormOpen]=useState(false); const [title,setTitle]=useState(""); const [price,setPrice]=useState(""); const [editCategory,setEditCategory]=useState(""); const [description,setDescription]=useState(""); const [url,setUrl]=useState("");
  const token=async()=> (await getSupabaseBrowserClient()!.auth.getSession()).data.session?.access_token;
  const loadCatalog=async()=>{const access=await token();if(!access)return;const response=await fetch("/api/admin/products",{headers:{Authorization:`Bearer ${access}`}});const payload=await response.json();if(response.ok)dispatch({type:"SET_PRODUCT_CATALOG",products:payload.products});else toast(payload.error);};
  const loadMarket=async()=>{const access=await token();if(!access)return;const response=await fetch("/api/admin/product-market",{headers:{Authorization:`Bearer ${access}`}});const payload=await response.json();if(response.ok){setMarket(payload.products);setSaved(payload.savedIds);setBanners(payload.banners??[]);}else toast(payload.error);};
  useEffect(()=>{void Promise.all([loadCatalog(),loadMarket()]).finally(()=>setLoading(false));},[]);
  const cart=state.productCatalog as Array<ProductCatalogItem&{price_label?:string|null;category?:string|null;like_count?:number}>;
  const rawSource:Product[]=tab==="cart"?cart:market;
  const categories=useMemo(()=>["전체",...Array.from(new Set(rawSource.map(product=>product.category?.trim()).filter((value):value is string=>Boolean(value)))).sort((a,b)=>a.localeCompare(b,"ko"))],[rawSource]);
  const source=useMemo(()=>rawSource.filter(product=>(category==="전체"||(product.category??"미분류")===category)&&`${product.title} ${product.category??""}`.toLowerCase().includes(query.trim().toLowerCase())),[rawSource,category,query]);
  const addToCart=async(id:string)=>{const access=await token();if(!access)return;const response=await fetch("/api/admin/product-market",{method:"POST",headers:{Authorization:`Bearer ${access}`,"Content-Type":"application/json"},body:JSON.stringify({productId:id,action:"save"})});const payload=await response.json();if(!response.ok)return toast(payload.error);setSaved(ids=>ids.includes(id)?ids:[...ids,id]);await loadCatalog();toast("경품 리스트에 담았어요.");};
  const begin=(product:Product)=>{setEditing(product);setTitle(product.title);setPrice(product.price_label??"");setEditCategory(product.category??"");setDescription(product.description??"");setUrl(product.purchase_url??"");setFormOpen(true);};
  const reset=()=>{setEditing(null);setTitle("");setPrice("");setEditCategory("");setDescription("");setUrl("");setFormOpen(false);};
  const save=async()=>{if(!title.trim())return toast("상품명을 입력해 주세요.");const access=await token();if(!access)return;const response=await fetch("/api/admin/products",{method:editing?"PATCH":"POST",headers:{Authorization:`Bearer ${access}`,"Content-Type":"application/json"},body:JSON.stringify({productId:editing?.id,title,priceLabel:price,category:editCategory,description,purchaseUrl:url||null,imageUrl:editing?.image_url??null})});const payload=await response.json();if(!response.ok)return toast(payload.error);await loadCatalog();reset();toast("상품을 저장했어요.");};
  const remove=async(id:string)=>{if(!confirm("경품 리스트에서 삭제할까요?"))return;const access=await token();if(!access)return;const response=await fetch("/api/admin/products",{method:"DELETE",headers:{Authorization:`Bearer ${access}`,"Content-Type":"application/json"},body:JSON.stringify({productId:id})});if(!response.ok)return toast("삭제하지 못했어요.");await Promise.all([loadCatalog(),loadMarket()]);};
  const pageCount=Math.max(1,Math.ceil(source.length/PAGE_SIZE)); const paged=source.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE); const movePage=(direction:number)=>setPage(current=>Math.max(0,Math.min(pageCount-1,current+direction)));
  const swipeProps={onTouchStart:(event:React.TouchEvent)=>setTouchStart(event.touches[0].clientX),onTouchEnd:(event:React.TouchEvent)=>{if(touchStart===null)return;const distance=event.changedTouches[0].clientX-touchStart;if(Math.abs(distance)>50)movePage(distance<0?1:-1);setTouchStart(null);}};
  useEffect(()=>{setPage(0);setCategory("전체");setQuery("");setSearchOpen(false);},[tab]);
  useEffect(()=>{setPage(0);},[query,category]);
  if(loading)return <PageSkeleton/>;

  const view=views[tab];
  return <div>
    <h2 className="text-title">이벤트/상품 관리</h2><p className="mb-4 mt-1 text-caption text-text-secondary">추천상품을 확인하고 경품 리스트에 저장해 학생 선호도를 확인하세요.</p><div className="mb-5 grid max-w-md grid-cols-2 rounded-xl bg-surface-raised p-1"><Link href="/admin/rewards" className="rounded-lg px-4 py-2.5 text-center font-bold text-text-secondary">이벤트 리스트</Link><button type="button" className="rounded-lg bg-brand-amber px-4 py-2.5 font-bold text-surface-page">경품 리스트 관리</button></div><h3 className="mb-4 text-subtitle">경품 리스트</h3>
    <div className="mb-5 grid max-w-md grid-cols-2 rounded-xl bg-surface-raised p-1"><button onClick={()=>setTab("cart")} className={`rounded-lg px-4 py-2.5 font-bold ${tab==="cart"?"bg-brand-amber text-surface-page":"text-text-secondary"}`}>경품 리스트 {cart.length}</button><button onClick={()=>setTab("recommended")} className={`rounded-lg px-4 py-2.5 font-bold ${tab==="recommended"?"bg-brand-amber text-surface-page":"text-text-secondary"}`}>추천상품</button></div>
    {tab==="recommended"&&<div className="mb-5 rounded-xl bg-surface-raised p-3"><p className="mb-2 text-caption font-bold">제휴 상품 검색</p><iframe title="쿠팡 파트너스 배너" src="https://coupa.ng/coeq4M" width="100%" height="36" frameBorder="0" scrolling="no" referrerPolicy="unsafe-url" className="mb-1"/><p className="text-micro text-text-muted">{DISCLOSURE}</p>{query&&<div className="mt-3 flex flex-wrap gap-2"><a href={`https://www.coupang.com/np/search?q=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer" className="rounded-lg border border-border px-3 py-2 text-caption font-bold">쿠팡에서 검색</a><a href={`https://www.temu.com/search_result.html?search_key=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer" className="rounded-lg border border-border px-3 py-2 text-caption font-bold">테무에서 검색</a></div>}</div>}
    <CatalogToolbar categories={categories} category={category} setCategory={setCategory} filterOpen={filterOpen} setFilterOpen={setFilterOpen} searchOpen={searchOpen} setSearchOpen={setSearchOpen} query={query} setQuery={setQuery} view={view} setView={value=>setViews(current=>({...current,[tab]:value}))}/>
    {query&&source.length===0&&tab==="recommended"&&<div className="mb-4 rounded-xl bg-surface-raised p-4 text-caption"><p>추천상품에 “{query}” 검색 결과가 없습니다. 위 제휴사 검색 버튼을 이용해 보세요.</p></div>}
    <section {...swipeProps}>
      {source.length===0&&!query&&<p className="rounded-xl bg-surface-page p-5 text-caption text-text-secondary">{tab==="cart"?"경품 리스트가 비어 있습니다.":"조건에 맞는 추천상품이 없습니다."}</p>}
      <div className={view==="card"?"grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5":"space-y-2"}>{paged.map((product,index)=><article key={product.id} className={`${view==="card"?"overflow-hidden":"flex items-center gap-3 p-3"} relative rounded-xl border border-border bg-surface-page`}>
        {tab==="cart"&&<><span className="absolute left-2 top-2 z-10 flex h-7 min-w-7 items-center justify-center rounded-full bg-black/70 px-2 text-caption font-bold text-white">{page*PAGE_SIZE+index+1}</span><span className="absolute right-2 top-2 z-10 flex h-7 items-center justify-center gap-1 rounded-full bg-black/70 px-2 text-caption font-bold text-white">♥ {product.like_count??0}</span></>}<img src={product.image_url??"/images/placeholder-product.svg"} alt={product.title} className={view==="card"?"aspect-square w-full object-cover":"h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"}/>
        <div className={view==="card"?"p-2.5":"flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center"}><div className="min-w-0 flex-1"><ProductInfo product={product} compact={view==="list"}/>{tab==="cart"&&Boolean(product.want_students?.length)&&<p className="mt-2 line-clamp-2 text-micro text-text-secondary">받고 싶은 학생: {product.want_students?.map(student=>`${student.name}${student.birth_date?` (${birthdayText(student.birth_date)} 생일)`:""}`).join(", ")}</p>}</div><div className={view==="card"?"mt-3 flex items-center gap-1":"flex shrink-0 flex-wrap gap-1.5 sm:justify-end"}>{product.purchase_url&&<a href={product.purchase_url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 whitespace-nowrap rounded-lg border border-border px-1.5 py-2 text-center text-micro font-bold">구매하기</a>}{tab==="recommended"?<button disabled={saved.includes(product.id)} onClick={()=>void addToCart(product.id)} className="min-w-0 flex-1 whitespace-nowrap rounded-lg bg-brand-amber px-1.5 py-2 text-micro font-bold text-surface-page disabled:opacity-50">{saved.includes(product.id)?"담김":"경품 리스트 담기"}</button>:<><button onClick={()=>begin(product)} className="min-w-0 flex-1 whitespace-nowrap rounded-lg border border-border px-1.5 py-2 text-micro">수정</button><button onClick={()=>void remove(product.id)} className="min-w-0 flex-1 whitespace-nowrap rounded-lg px-1.5 py-2 text-micro text-state-danger">삭제</button></>}</div></div>
      </article>)}</div>
      {pageCount>1&&<div className="mt-4 flex items-center justify-center gap-3"><button disabled={page===0} onClick={()=>movePage(-1)} className="rounded-lg border border-border px-3 py-2 disabled:opacity-30">‹</button><span className="text-caption">{page+1} / {pageCount}</span><button disabled={page===pageCount-1} onClick={()=>movePage(1)} className="rounded-lg border border-border px-3 py-2 disabled:opacity-30">›</button></div>}
      {tab==="cart"&&<button onClick={()=>setFormOpen(true)} className="mt-4 text-micro underline">+ 상품 직접 등록</button>}
    </section>
    <PromotionCarousel banners={banners}/>
    {formOpen&&tab==="cart"&&<section className="mt-5 rounded-card bg-surface-page p-5"><h3 className="mb-3 text-subtitle">{editing?"상품 수정":"상품 직접 등록"}</h3><div className="grid gap-3 sm:grid-cols-2"><input value={title} onChange={event=>setTitle(event.target.value)} placeholder="상품명" className="rounded-lg border border-border px-3 py-2"/><input value={price} onChange={event=>setPrice(event.target.value)} placeholder="가격" className="rounded-lg border border-border px-3 py-2"/><input value={editCategory} onChange={event=>setEditCategory(event.target.value)} placeholder="카테고리" className="rounded-lg border border-border px-3 py-2"/><input value={url} onChange={event=>setUrl(event.target.value)} placeholder="구매 링크" className="rounded-lg border border-border px-3 py-2"/><textarea value={description} onChange={event=>setDescription(event.target.value)} placeholder="상품 설명" className="rounded-lg border border-border px-3 py-2 sm:col-span-2"/></div><div className="mt-4 flex gap-2"><button onClick={()=>void save()} className="rounded-lg bg-brand-amber px-4 py-2 font-bold text-surface-page">저장</button><button onClick={reset} className="rounded-lg border border-border px-4 py-2">취소</button></div></section>}
  </div>;
}
