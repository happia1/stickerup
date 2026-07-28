"use client";

/* eslint-disable @next/next/no-img-element, react-hooks/exhaustive-deps */
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast/provider";
import { uploadProductImage } from "@/lib/client/upload-product-image";
import {
  DEFAULT_FOOTER_SETTINGS,
  normalizedFooterSettings,
  type FooterSettings,
} from "@/lib/footer-settings";

type Product = { id:string; title:string; price_label:string|null; image_url:string|null; prize_image_url:string|null; purchase_url:string; description:string|null; category:string|null; is_active:boolean; sort_order:number };
type FormState = { title:string; priceLabel:string; imageUrl:string; prizeImageUrl:string; purchaseUrl:string; description:string; category:string; isActive:boolean; sortOrder:number };
const EMPTY: FormState = { title:"", priceLabel:"", imageUrl:"", prizeImageUrl:"", purchaseUrl:"", description:"", category:"문구", isActive:true, sortOrder:0 };
const DEFAULT_CATEGORIES = ["문구", "간식", "미용", "의류", "잡화", "상품권", "기타"];

function normalizedProductUrl(value: string) {
  const text = value.trim();
  return text.match(/<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i)?.[1]?.trim() ?? text;
}

function usableProductInput(value: string) {
  return /^https?:\/\//i.test(normalizedProductUrl(value));
}

function BannerManager() {
  const toast=useToast(); const [banners,setBanners]=useState<Array<{id:string;title:string;link_url:string;image_url:string|null}>>([]); const [title,setTitle]=useState(""); const [linkUrl,setLinkUrl]=useState(""); const [imageUrl,setImageUrl]=useState("");
  const token=async()=> (await getSupabaseBrowserClient()!.auth.getSession()).data.session?.access_token;
  const load=async()=>{const access=await token();if(!access)return;const response=await fetch("/api/seller/banners",{headers:{Authorization:`Bearer ${access}`}});const payload=await response.json();if(response.ok)setBanners(payload.banners);};
  useEffect(()=>{void load();},[]);
  const add=async()=>{const access=await token();if(!access)return;const response=await fetch("/api/seller/banners",{method:"POST",headers:{Authorization:`Bearer ${access}`,"Content-Type":"application/json"},body:JSON.stringify({title,linkUrl,imageUrl})});const payload=await response.json();if(!response.ok)return toast(payload.error);setTitle("");setLinkUrl("");setImageUrl("");await load();toast("프로모션 배너를 등록했어요.");};
  const remove=async(id:string)=>{const access=await token();if(!access)return;await fetch("/api/seller/banners",{method:"DELETE",headers:{Authorization:`Bearer ${access}`,"Content-Type":"application/json"},body:JSON.stringify({bannerId:id})});await load();};
  return <section className="mt-5 rounded-card bg-surface-page p-5"><h2 className="text-subtitle">상품 이벤트/프로모션 배너</h2><p className="mb-4 mt-1 text-caption text-text-secondary">등록 후 관리자 상품 카탈로그에 표시되는 모습 그대로 아래에서 확인할 수 있어요.</p><div className="grid gap-2 md:grid-cols-3"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="배너 제목" className="rounded-lg border border-border px-3 py-2"/><input value={linkUrl} onChange={e=>setLinkUrl(e.target.value)} placeholder="이동 링크 (https://...)" className="rounded-lg border border-border px-3 py-2"/><input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="배너 이미지 주소 (선택)" className="rounded-lg border border-border px-3 py-2"/></div><button onClick={()=>void add()} className="mt-3 rounded-lg bg-brand-amber px-4 py-2 font-bold text-surface-page">배너 추가</button><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{banners.map(banner=><article key={banner.id} className="overflow-hidden rounded-card border border-border bg-surface-card"><a href={banner.link_url} target="_blank" rel="noreferrer" className="flex aspect-square w-full items-center justify-center bg-surface-raised">{banner.image_url?<img src={banner.image_url} alt={banner.title} className="h-full w-full object-cover"/>:<span className="p-4 text-center text-caption font-bold">{banner.title}</span>}</a><div className="flex items-center gap-2 p-3"><div className="min-w-0 flex-1"><p className="truncate text-caption font-bold">{banner.title}</p><p className="truncate text-micro text-text-muted">{banner.link_url}</p></div><button onClick={()=>void remove(banner.id)} className="text-micro text-state-danger">삭제</button></div></article>)}</div>{!banners.length&&<p className="mt-6 rounded-xl bg-surface-card p-5 text-center text-caption text-text-muted">등록된 프로모션 배너가 없습니다.</p>}</section>;
}

function ImagePicker({ title, value, disabled, onChange }: { title:string; value:string; disabled?:boolean; onChange:(value:string)=>void }) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const choose = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try { onChange(await uploadProductImage(file)); }
    catch (error) { toast(error instanceof Error ? error.message : "이미지를 등록하지 못했습니다."); }
    finally { setUploading(false); }
  };
  return <div className={`rounded-xl bg-surface-card p-4 ${disabled ? "opacity-60" : ""}`}><p className="text-caption font-bold">{title}</p><div className="mt-3 flex items-center gap-3">{value ? <img src={value} onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src="/images/placeholder-product.svg";}} alt={title} className="h-24 w-24 rounded-xl object-cover" /> : <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-border text-caption text-text-muted">이미지 없음</div>}<label className={`rounded-lg border border-border px-3 py-2 text-caption font-bold ${disabled||uploading ? "pointer-events-none opacity-60" : "cursor-pointer"}`}>{uploading?"업로드 중...":"이미지 등록"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={choose} disabled={disabled||uploading}/></label>{value && !disabled && !uploading && <button type="button" className="text-caption text-state-danger" onClick={() => onChange("")}>삭제</button>}</div></div>;
}

function FooterManager() {
  const toast = useToast();
  const [form, setForm] = useState<FooterSettings>(DEFAULT_FOOTER_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = async () => (await getSupabaseBrowserClient()!.auth.getSession()).data.session?.access_token;

  useEffect(() => {
    fetch("/api/site-footer", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => setForm(normalizedFooterSettings(payload.settings)))
      .catch(() => toast("푸터 설정을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const update = (field: keyof FooterSettings, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const save = async () => {
    const access = await token();
    if (!access) return toast("개발자 계정으로 다시 로그인해 주세요.");
    setSaving(true);
    try {
      const response = await fetch("/api/site-footer", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "푸터를 저장하지 못했습니다.");
      setForm(normalizedFooterSettings(payload.settings));
      toast("학생 앱 푸터를 저장했습니다.");
    } catch (error) {
      toast(error instanceof Error ? error.message : "푸터를 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <section className="mt-5 rounded-card bg-surface-page p-5 text-text-muted">푸터 설정을 불러오는 중...</section>;
  const field = (label: string, key: keyof FooterSettings, placeholder = "") => (
    <label className="text-caption text-text-secondary">{label}<input value={form[key]} onChange={(event) => update(key, event.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-border px-3 py-2"/></label>
  );

  return <section className="mt-5 rounded-card bg-surface-page p-5">
    <h2 className="text-subtitle">학생 마이페이지 푸터 관리</h2>
    <p className="mt-1 text-caption text-text-secondary">저장한 내용은 모든 학생의 마이페이지 하단에 공통으로 표시됩니다.</p>
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      {field("서비스 소개", "service_intro")}{field("제작자 이름", "creator_name")}{field("고객지원 제목", "support_title")}
      <label className="text-caption text-text-secondary md:col-span-2">고객지원 안내<textarea value={form.support_description} onChange={(event) => update("support_description", event.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-border px-3 py-2"/></label>
      {field("이용약관 링크 이름", "terms_label")}{field("이용약관 주소", "terms_url", "/terms")}{field("개인정보 처리방침 링크 이름", "privacy_label")}{field("개인정보 처리방침 주소", "privacy_url", "/privacy")}
      <div className="md:col-span-2">{field("저작권 문구", "copyright_text")}</div>
    </div>
    <div className="mt-6 rounded-xl border border-border bg-surface-card p-5">
      <p className="text-caption font-bold text-text-muted">미리보기</p><p className="mt-3 text-subtitle">STICKERUP</p>
      <p className="mt-1 text-caption text-text-secondary">{form.service_intro} <span className="text-text-muted">by. {form.creator_name}</span></p>
      <p className="mt-5 font-bold">{form.support_title}</p><p className="mt-1 whitespace-pre-wrap text-caption text-text-secondary">{form.support_description}</p>
      <div className="mt-5 flex gap-4 border-t border-border pt-4 text-micro"><span>{form.terms_label}</span><span className="font-bold">{form.privacy_label}</span></div>
      <p className="mt-3 text-micro text-text-muted">{form.copyright_text}</p>
    </div>
    <button type="button" disabled={saving} onClick={() => void save()} className="mt-5 rounded-lg bg-brand-amber px-5 py-2.5 font-bold text-surface-page disabled:opacity-60">{saving ? "저장 중..." : "푸터 저장"}</button>
  </section>;
}

type SupportInquiry = {
  id: string;
  name: string;
  contact: string;
  content: string;
  status: "received" | "reviewing" | "completed";
  created_at: string;
};

const INQUIRY_STATUS_LABEL: Record<SupportInquiry["status"], string> = {
  received: "접수",
  reviewing: "확인 중",
  completed: "답변 완료",
};

function InquiryManager() {
  const toast = useToast();
  const [inquiries, setInquiries] = useState<SupportInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | SupportInquiry["status"]>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const token = async () => (await getSupabaseBrowserClient()!.auth.getSession()).data.session?.access_token;
  const load = async () => {
    const access = await token();
    if (!access) return;
    try {
      const response = await fetch("/api/support-inquiries", { headers: { Authorization: `Bearer ${access}` }, cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "문의 목록을 불러오지 못했습니다.");
      setInquiries(payload.inquiries ?? []);
    } catch (error) {
      toast(error instanceof Error ? error.message : "문의 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);
  const updateStatus = async (inquiryId: string, status: SupportInquiry["status"]) => {
    const access = await token();
    if (!access) return;
    setUpdatingId(inquiryId);
    try {
      const response = await fetch("/api/support-inquiries", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId, status }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "처리 상태를 변경하지 못했습니다.");
      setInquiries((current) => current.map((item) => item.id === inquiryId ? { ...item, status } : item));
      toast("문의 처리 상태를 변경했습니다.");
    } catch (error) {
      toast(error instanceof Error ? error.message : "처리 상태를 변경하지 못했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };
  const visible = filter === "all" ? inquiries : inquiries.filter((item) => item.status === filter);

  return <section className="mt-5 rounded-card bg-surface-page p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-subtitle">고객 문의 게시판</h2><p className="mt-1 text-caption text-text-secondary">학생이 남긴 연락처와 문의 내용을 확인하고 처리 상태를 관리합니다.</p></div>
      <button type="button" onClick={() => void load()} className="rounded-lg border border-border px-3 py-2 text-caption font-bold">새로고침</button>
    </div>
    <div className="mt-5 flex flex-wrap gap-2">
      {(["all", "received", "reviewing", "completed"] as const).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-3 py-2 text-caption font-bold ${filter === value ? "bg-brand-amber text-surface-page" : "bg-surface-card text-text-secondary"}`}>{value === "all" ? `전체 ${inquiries.length}` : `${INQUIRY_STATUS_LABEL[value]} ${inquiries.filter((item) => item.status === value).length}`}</button>)}
    </div>
    <div className="mt-5 space-y-2">
      {loading ? <p className="rounded-xl bg-surface-card p-5 text-center text-caption text-text-muted">문의 목록을 불러오는 중...</p> : visible.length === 0 ? <p className="rounded-xl bg-surface-card p-5 text-center text-caption text-text-muted">접수된 문의가 없습니다.</p> : visible.map((inquiry) => (
        <details key={inquiry.id} className="rounded-xl border border-border bg-surface-card">
          <summary className="cursor-pointer list-none p-4">
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-1 text-micro font-bold ${inquiry.status === "completed" ? "bg-state-successBg text-state-success" : inquiry.status === "reviewing" ? "bg-state-warningBg text-brand-amber" : "bg-surface-raised text-text-secondary"}`}>{INQUIRY_STATUS_LABEL[inquiry.status]}</span>
              <div className="min-w-0 flex-1"><p className="truncate text-body font-bold">{inquiry.content}</p><p className="mt-1 text-micro text-text-muted">{inquiry.name} · {new Date(inquiry.created_at).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" })}</p></div>
              <span className="text-text-muted">⌄</span>
            </div>
          </summary>
          <div className="border-t border-border p-4">
            <dl className="grid gap-3 text-caption sm:grid-cols-2">
              <div><dt className="text-text-muted">성함</dt><dd className="mt-1 font-bold">{inquiry.name}</dd></div>
              <div><dt className="text-text-muted">답변 연락처</dt><dd className="mt-1 break-all font-bold">{inquiry.contact}</dd></div>
            </dl>
            <div className="mt-4"><p className="text-caption text-text-muted">문의 내용</p><p className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-surface-raised p-4 text-body leading-7">{inquiry.content}</p></div>
            <label className="mt-4 block max-w-48 text-caption text-text-secondary">처리 상태<select disabled={updatingId === inquiry.id} value={inquiry.status} onChange={(event) => void updateStatus(inquiry.id, event.target.value as SupportInquiry["status"])} className="mt-1 w-full rounded-lg border border-border px-3 py-2"><option value="received">접수</option><option value="reviewing">확인 중</option><option value="completed">답변 완료</option></select></label>
          </div>
        </details>
      ))}
    </div>
  </section>;
}

export default function DeveloperProductsPage() {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<"new"|"sourcing"|"promotion"|"footer"|"inquiries">("new");
  const [view, setView] = useState<"card"|"list">("card");
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product|null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [samePrizeImage, setSamePrizeImage] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const previewingRef = useRef(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");
  const categories = useMemo(() => Array.from(new Set([...DEFAULT_CATEGORIES, ...products.map((p) => p.category).filter((v):v is string => Boolean(v)), ...customCategories])), [products, customCategories]);
  const token = async () => (await getSupabaseBrowserClient()!.auth.getSession()).data.session?.access_token;
  const load = async () => { const access = await token(); if (!access) return setError("먼저 개발자 계정으로 로그인해 주세요."); const response = await fetch("/api/seller/products", { headers:{ Authorization:`Bearer ${access}` } }); const payload = await response.json(); if (!response.ok) return setError(payload.error); setProducts(payload.products); setError(""); };
  useEffect(() => { void load(); }, []);
  const reset = () => { setEditing(null); setForm(EMPTY); setSamePrizeImage(true); setPreviewMessage(""); };
  const edit = (product: Product) => { setEditing(product); setForm({ title:product.title, priceLabel:product.price_label??"", imageUrl:product.image_url??"", prizeImageUrl:product.prize_image_url??"", purchaseUrl:product.purchase_url, description:product.description??"", category:product.category??"기타", isActive:product.is_active, sortOrder:product.sort_order }); setSamePrizeImage(Boolean(product.image_url) && product.image_url === product.prize_image_url); setTab("new"); };
  const fetchPreview = async () => { if (!usableProductInput(form.purchaseUrl)) return toast("올바른 상품 링크 또는 쿠팡 iframe 태그를 입력해 주세요."); if(previewingRef.current)return; const rawInput=form.purchaseUrl;const normalizedUrl=normalizedProductUrl(rawInput);const iframeInput=/<iframe\b/i.test(rawInput);setForm(current=>({...current,purchaseUrl:normalizedUrl}));if(previewingRef.current)return; const access=await token(); if(!access)return; previewingRef.current=true; setPreviewing(true);setPreviewMessage(""); try { const response=await fetch("/api/seller/link-preview",{method:"POST",headers:{Authorization:`Bearer ${access}`,"Content-Type":"application/json"},body:JSON.stringify({url:rawInput})}); const payload=await response.json(); if(!response.ok)throw new Error(payload.error); setForm((current)=>({...current,title:payload.title||current.title,priceLabel:payload.priceLabel||current.priceLabel,description:payload.description||current.description,imageUrl:payload.imageUrl||current.imageUrl,purchaseUrl:payload.purchaseUrl||normalizedUrl}));const fields=Array.isArray(payload.found)?payload.found.join(", "):"상품 정보";const message=payload.notice||`${fields} 자동입력을 완료했어요.${payload.priceLabel?` 가격: ${payload.priceLabel}`:" 가격은 직접 입력해 주세요."}`;setPreviewMessage(message);toast("상품 정보를 자동입력했어요."); } catch(e){const message=iframeInput?"쿠팡이 상품정보 자동 조회를 차단했지만 iframe 링크는 저장 가능한 주소로 변환했어요. 상품명·가격·이미지를 확인한 뒤 등록할 수 있습니다.":e instanceof Error?e.message:"상품 정보를 불러오지 못했어요.";setPreviewMessage(message);toast(message);} finally{previewingRef.current=false;setPreviewing(false);} };
  const save = async () => { const purchaseUrl=normalizedProductUrl(form.purchaseUrl);if(!form.title.trim() || !/^https?:\/\//i.test(purchaseUrl)) return toast("상품명과 올바른 구매 링크를 입력해 주세요."); const access=await token(); if(!access)return; const body={...form,purchaseUrl,prizeImageUrl:samePrizeImage?form.imageUrl:form.prizeImageUrl,productId:editing?.id}; const response=await fetch("/api/seller/products",{method:editing?"PATCH":"POST",headers:{Authorization:`Bearer ${access}`,"Content-Type":"application/json"},body:JSON.stringify(body)}); const payload=await response.json(); if(!response.ok)return toast(payload.error??"저장하지 못했어요."); toast(editing?"상품을 수정했어요.":"상품을 등록했어요."); reset(); await load(); setTab("sourcing"); };
  const remove = async (id:string) => { if(!confirm("이 상품을 삭제할까요?"))return; const access=await token(); if(!access)return; const response=await fetch("/api/seller/products",{method:"DELETE",headers:{Authorization:`Bearer ${access}`,"Content-Type":"application/json"},body:JSON.stringify({productId:id})}); if(!response.ok)return toast("삭제하지 못했어요."); await load(); };
  const addCategory=()=>{const value=newCategory.trim();if(!value)return;setCustomCategories((items)=>items.includes(value)?items:[...items,value]);setForm((current)=>({...current,category:value}));setNewCategory("");};
  const logout=async()=>{if(loggingOut)return;setLoggingOut(true);try{const client=getSupabaseBrowserClient();if(client)await client.auth.signOut();toast("개발자 계정에서 로그아웃했습니다.");router.replace("/developer/login");router.refresh();}catch{toast("로그아웃하지 못했습니다. 다시 시도해 주세요.");setLoggingOut(false);}};

  return <main className="min-h-screen bg-surface-card p-6 text-text-primary"><div className="mx-auto max-w-6xl"><div className="flex items-start justify-between gap-4"><div><h1 className="text-title">StickerUp 개발자 상품 관리</h1><p className="mt-1 text-caption text-text-secondary">구매 상품과 이벤트 경품 이미지를 구분해 관리합니다.</p></div><button type="button" disabled={loggingOut} onClick={()=>void logout()} className="shrink-0 rounded-lg border border-border px-3 py-2 text-caption font-bold text-text-secondary disabled:opacity-50">{loggingOut?"로그아웃 중...":"로그아웃"}</button></div>
    <div className="mt-6 grid max-w-4xl grid-cols-2 rounded-xl bg-surface-page p-1 sm:grid-cols-5"><button onClick={()=>setTab("new")} className={`rounded-lg px-3 py-3 font-bold ${tab==="new"?"bg-brand-amber text-surface-page":"text-text-secondary"}`}>상품 등록</button><button onClick={()=>setTab("sourcing")} className={`rounded-lg px-3 py-3 font-bold ${tab==="sourcing"?"bg-brand-amber text-surface-page":"text-text-secondary"}`}>상품 리스트 {products.length}</button><button onClick={()=>setTab("promotion")} className={`rounded-lg px-3 py-3 font-bold ${tab==="promotion"?"bg-brand-amber text-surface-page":"text-text-secondary"}`}>프로모션</button><button onClick={()=>setTab("footer")} className={`rounded-lg px-3 py-3 font-bold ${tab==="footer"?"bg-brand-amber text-surface-page":"text-text-secondary"}`}>푸터 관리</button><button onClick={()=>setTab("inquiries")} className={`rounded-lg px-3 py-3 font-bold ${tab==="inquiries"?"bg-brand-amber text-surface-page":"text-text-secondary"}`}>문의 관리</button></div>
    {tab==="inquiries" ? <InquiryManager /> : tab==="footer" ? <FooterManager /> : error ? <div className="mt-6 rounded-card border border-state-danger p-5 text-state-danger">{error}</div> : tab==="promotion" ? <BannerManager /> : tab==="new" ? <section className="mt-5 rounded-card bg-surface-page p-5"><h2 className="mb-4 text-subtitle">{editing?"상품 수정":"상품 등록"}</h2><div className="grid gap-4 md:grid-cols-2">
      <label className="text-caption text-text-secondary md:col-span-2"><span className="flex items-center justify-between">상품 링크<button type="button" onClick={reset} className="text-micro text-text-muted underline underline-offset-2">입력 초기화</button></span><div className="mt-1 flex gap-2"><input value={form.purchaseUrl} onChange={(e)=>{setForm({...form,purchaseUrl:e.target.value});setPreviewMessage("");}} onBlur={()=>{if(usableProductInput(form.purchaseUrl)&&!previewing)void fetchPreview();}} className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2" placeholder="상품 링크 또는 쿠팡 iframe 태그"/><button type="button" disabled={previewing} onClick={()=>void fetchPreview()} className="rounded-lg border border-brand-amber px-4 py-2 font-bold text-brand-amber">{previewing?"불러오는 중":"상품정보 자동입력"}</button></div><span className={`mt-1 block text-micro ${previewMessage?"text-brand-amber":"text-text-muted"}`}>{previewMessage||"링크 입력을 마치면 상품 정보를 자동으로 확인합니다. 쿠팡 iframe 태그도 그대로 붙여넣을 수 있어요."}</span></label>
      <label className="text-caption text-text-secondary">상품명<input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} className="mt-1 w-full rounded-lg border border-border px-3 py-2"/></label><label className="text-caption text-text-secondary">가격<input value={form.priceLabel} onChange={(e)=>setForm({...form,priceLabel:e.target.value})} className="mt-1 w-full rounded-lg border border-border px-3 py-2" placeholder="예: 12,900원"/></label>
      <label className="text-caption text-text-secondary">카테고리<select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} className="mt-1 w-full rounded-lg border border-border px-3 py-2">{categories.map((category)=><option key={category}>{category}</option>)}</select></label><div className="flex items-end gap-2"><input value={newCategory} onChange={(e)=>setNewCategory(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2" placeholder="새 카테고리"/><button type="button" onClick={addCategory} className="rounded-lg border border-border px-3 py-2">추가</button></div>
      <ImagePicker title="구매 상품 이미지 (썸네일)" value={form.imageUrl} onChange={(imageUrl)=>setForm({...form,imageUrl})}/><div><label className="mb-2 flex items-center gap-2 text-caption font-bold"><input type="checkbox" checked={samePrizeImage} onChange={(e)=>setSamePrizeImage(e.target.checked)}/>경품도 구매 상품 이미지와 동일하게 사용</label><ImagePicker title="이벤트 경품 이미지" value={samePrizeImage?form.imageUrl:form.prizeImageUrl} disabled={samePrizeImage} onChange={(prizeImageUrl)=>setForm({...form,prizeImageUrl})}/></div>
      <label className="text-caption text-text-secondary md:col-span-2">상품 설명<textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} className="mt-1 min-h-24 w-full rounded-lg border border-border px-3 py-2"/></label></div><div className="mt-4 flex gap-2"><button onClick={()=>void save()} className="rounded-lg bg-brand-amber px-4 py-2 font-bold text-surface-page">{editing?"수정 저장":"상품 등록"}</button>{editing&&<button onClick={reset} className="rounded-lg border border-border px-4 py-2">취소</button>}</div></section> :
      <section className="mt-5"><div className="mb-3 flex items-center justify-between"><h2 className="text-subtitle">상품 리스트</h2><div className="flex rounded-lg bg-surface-page p-1"><button onClick={()=>setView("list")} className={`rounded-md px-3 py-2 text-caption ${view==="list"?"bg-brand-amber text-surface-page":""}`}>목록형</button><button onClick={()=>setView("card")} className={`rounded-md px-3 py-2 text-caption ${view==="card"?"bg-brand-amber text-surface-page":""}`}>카드형</button></div></div><div className={view==="card"?"grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6":"space-y-2"}>{products.map((product)=><article key={product.id} className={`${view==="card"?"overflow-hidden":"flex items-center gap-4 p-4"} rounded-xl bg-surface-page`}><img src={product.image_url??product.prize_image_url??"/images/placeholder-product.svg"} alt={product.title} className={view==="list"?"h-20 w-20 shrink-0 rounded-lg object-cover":"aspect-square w-full object-cover"}/><div className={`${view==="card"?"p-3":""} min-w-0 flex-1`}><p className="text-micro text-brand-amber">{product.category??"미분류"}</p><h3 className="line-clamp-2 text-caption font-bold">{product.title}</h3><p className="mt-1 text-caption font-bold">{product.price_label??"가격정보 없음"}</p><details className="mt-2 text-micro text-text-secondary"><summary className="cursor-pointer">더보기</summary><p className="mt-2 whitespace-pre-wrap break-words">{product.description??"상품 설명이 없습니다."}</p></details></div><div className={`flex gap-1 ${view==="card"?"px-3 pb-3":"ml-auto gap-2"}`}><a href={product.purchase_url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 whitespace-nowrap rounded-lg border border-border px-1.5 py-2 text-center text-micro">구매하기</a><button onClick={()=>edit(product)} className="min-w-0 flex-1 whitespace-nowrap rounded-lg border border-border px-1.5 py-2 text-micro">수정</button><button onClick={()=>void remove(product.id)} className="min-w-0 flex-1 whitespace-nowrap px-1.5 py-2 text-micro text-state-danger">삭제</button></div></article>)}</div></section>}
  </div></main>;
}
