export const siteInfo = {
  name: "Adrenaline Fitness Sport Center",
  phone: "+976 99XX XXXX",
  email: "hello@adrenalinefitness.mn",
  address: "Улаанбаатар хот · Байршлын мэдээлэл шинэчлэгдэнэ",
};

export type MembershipPlan = {
  id: string;
  name: string;
  duration: string;
  price: number;
  featured?: boolean;
  description: string;
  features: string[];
};

// Сайтын үнэ, багцын нөхцөлийг эндээс нэг дор шинэчилнэ.
export const membershipPlans: MembershipPlan[] = [
  {
    id: "starter-1m",
    name: "STARTER",
    duration: "1 сарын эрх",
    price: 130000,
    description: "Тогтмол хөдөлгөөнөө өнөөдрөөс эхлүүлэхэд.",
    features: ["Фитнес заал", "Анхан шатны үнэлгээ", "Суурь хөтөлбөр"],
  },
  {
    id: "momentum-3m",
    name: "MOMENTUM",
    duration: "3 сарын эрх",
    price: 330000,
    featured: true,
    description: "Үр дүнгээ зуршил болгож, хүчээ дараагийн түвшинд хүргэ.",
    features: [
      "Фитнес заал",
      "Сар бүрийн ахицын үнэлгээ",
      "Зорилгын зөвлөгөө",
      "1 персонал сесс",
    ],
  },
  {
    id: "elite-6m",
    name: "ELITE",
    duration: "6 сарын эрх",
    price: 590000,
    description: "Урт хугацааны өөрчлөлт, тогтвортой гүйцэтгэлд.",
    features: [
      "Фитнес заал",
      "Сар бүрийн ахицын үнэлгээ",
      "Хооллолтын суурь зөвлөгөө",
      "2 персонал сесс",
    ],
  },
];

export const coaches = [
  {
    code: "ST",
    role: "Хүчний дасгалжуулагч",
    focus: "Хүч · Булчингийн хөгжил · Суурь техник",
    copy: "Аюулгүй техникээс эхэлж, таны түвшинд тохирсон ахицын систем гаргана.",
  },
  {
    code: "PT",
    role: "Персонал дасгалжуулагч",
    focus: "Жин бууруулах · Галбир · Хувийн төлөвлөгөө",
    copy: "Бодит зорилго, хэмжигдэхүйц ахиц, амьдралын хэмнэлд нийцсэн хөтөлбөр.",
  },
  {
    code: "GR",
    role: "Групп хичээлийн багш",
    focus: "Functional · HIIT · Mobility",
    copy: "Эрч хүчтэй хамт олон дунд хөдөлгөөнөөс таашаал авах групп хичээлүүд.",
  },
];

export const schedule = [
  { day: "Даваа", sessions: [["07:00", "Morning Mobility"], ["18:30", "Functional Strength"], ["20:00", "HIIT Burn"]] },
  { day: "Мягмар", sessions: [["07:30", "Core & Balance"], ["18:30", "Lower Body"], ["20:00", "Box Fit"]] },
  { day: "Лхагва", sessions: [["07:00", "Morning Mobility"], ["18:30", "Upper Body"], ["20:00", "HIIT Burn"]] },
  { day: "Пүрэв", sessions: [["07:30", "Core & Balance"], ["18:30", "Full Body Circuit"], ["20:00", "Box Fit"]] },
  { day: "Баасан", sessions: [["07:00", "Mobility"], ["18:30", "Friday Power"], ["20:00", "Recovery Flow"]] },
  { day: "Бямба", sessions: [["10:00", "Weekend HIIT"], ["12:00", "Strength Basics"], ["15:00", "Open Gym"]] },
  { day: "Ням", sessions: [["11:00", "Recovery Flow"], ["13:00", "Open Gym"], ["16:00", "Core & Balance"]] },
];

export type SiteContent = {
  design?: import('../lib/design').SiteDesign;
  home: HomeContent;
  siteInfo: typeof siteInfo & { mapUrl?: string; facebookUrl?: string };
  membershipPlans: MembershipPlan[];
  coaches: Array<(typeof coaches)[number] & { id?: string; name?: string; image?: string }>;
  schedule: typeof schedule;
  pages: CmsPage[];
};
export type CmsBlock = {
  id: string;
  type: "heading" | "text" | "image" | "cta";
  title?: string;
  body?: string;
  image?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  hidden?: boolean;
  deleted?: boolean;
  width?: "narrow" | "content" | "full";
  align?: "left" | "center" | "right";
  tone?: "default" | "surface" | "accent";
};
export type CmsPage = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  heroImage?: string;
  status: "draft" | "published";
  showInNav: boolean;
  seoTitle: string;
  seoDescription: string;
  blocks: CmsBlock[];
  deleted?: boolean;
};
export type HomeContent = {
  brandTitle:string; brandSubtitle:string; nav:{about:string;membership:string;coaches:string;schedule:string;contact:string}; topCta:string;
  hero:{kicker:string;title:string;accent:string;copy:string;primaryCta:string;secondaryCta:string;orbitText:string};
  stats:Array<{id:string;value:string;label:string}>;
  about:{label:string;title:string;accent:string;copy:string;values:Array<{id:string;symbol:string;title:string;copy:string}>};
  membership:{label:string;title:string;accent:string;copy:string;badge:string;priceSuffix:string;button:string;note:string};
  coachSection:{label:string;title:string;accent:string;copy:string};
  timetable:{label:string;title:string;accent:string;copy:string;countSuffix:string;note:string};
  contact:{label:string;title:string;accent:string;copy:string;phoneLabel:string;emailLabel:string;addressLabel:string;mapEyebrow:string;mapButton:string};
  finalCta:{eyebrow:string;title:string;accent:string;button:string};
  footer:{copyright:string;backToTop:string;adminLabel:string};
  payment:{label:string;intro:string;createButton:string;creating:string;pendingTitle:string;pendingCopy:string;phoneButton:string;qrCopy:string;openButton:string;checkButton:string;checking:string;paid:string};
};
export const defaultHome:HomeContent={brandTitle:"ADRENALINE",brandSubtitle:"FITNESS SPORT CENTER",nav:{about:"Бидний тухай",membership:"Гишүүнчлэл",coaches:"Дасгалжуулагч",schedule:"Хуваарь",contact:"Холбоо"},topCta:"ЭРХ АВАХ ↗",hero:{kicker:"FITNESS • STRENGTH • COMMUNITY",title:"ХҮЧЭЭ СЭРЭЭ.",accent:"ХЯЗГААРАА ДАВ.",copy:"Зөв орчин, зөв хөтөлбөр, зөв хүмүүсийн дунд өөрийн хамгийн хүчтэй хувилбарыг бүтээ.",primaryCta:"ГИШҮҮНЧЛЭЛ СОНГОХ ↗",secondaryCta:"ХИЧЭЭЛИЙН ХУВААРЬ",orbitText:"FOCUS · POWER · DISCIPLINE"},stats:[{id:"s1",value:"7",label:"хоног нээлттэй"},{id:"s2",value:"3",label:"гишүүнчлэлийн сонголт"},{id:"s3",value:"1:1",label:"зорилгод тохирсон зөвлөгөө"}],about:{label:"БИДНИЙ ТУХАЙ",title:"ДАСГАЛ БОЛ ЗӨВХӨН",accent:"БИЕИЙН ХӨДӨЛГӨӨН БИШ.",copy:"Adrenaline бол зорилгоо тодорхойлж, өөрийгөө сорьж, тогтвортой ахиц гаргах хүмүүсийн орон зай.",values:[{id:"v1",symbol:"◎",title:"ЗОРИЛГОД ТӨВЛӨРНӨ",copy:"Таны түвшин, боломж, зорилгод нийцсэн бодит алхмаас эхэлнэ."},{id:"v2",symbol:"▥",title:"АХИЦЫГ ХЭМЖИНЭ",copy:"Мэдрэмжээс гадна ахиц, давтамж, гүйцэтгэлийг харна."},{id:"v3",symbol:"◉",title:"ХАМТДАА ХҮЧТЭЙ",copy:"Дэмждэг, урам өгдөг, тууштай байхад туслах community."}]},membership:{label:"ГИШҮҮНЧЛЭЛ",title:"ӨӨРИЙН ХЭМНЭЛЭЭ",accent:"СОНГО.",copy:"Нэг өдрийн сэдэл биш, үргэлжлэх систем. Танд тохирох хугацаагаа сонгоод QPay-аар эрхээ аваарай.",badge:"ХАМГИЙН ЭРЭЛТТЭЙ",priceSuffix:"/ эрх",button:"QPAY-ААР АВАХ ↗",note:"* Үнэ, нөхцөл нь жишиг мэдээлэл бөгөөд албан ёсны мэдээллээр шинэчилнэ."},coachSection:{label:"ДАСГАЛЖУУЛАГЧИД",title:"ТАНЫ АХИЦЫН",accent:"АРД БАЙХ ХҮМҮҮС.",copy:"Мэргэжлийн чиглэл бүрээр зөв техник, бодит ахиц, тогтвортой үр дүнд хөтөлнө."},timetable:{label:"ЦАГИЙН ХУВААРЬ",title:"ӨДӨР БҮР",accent:"ХӨДӨЛГӨӨНТЭЙ.",copy:"Өөрийн хэмнэлд тохирох өдрөө сонго. Групп хичээлийн суудал хязгаартай.",countSuffix:"хичээл",note:"* Хуваарь нь загвар мэдээлэл бөгөөд бодит хуваариар шинэчилнэ."},contact:{label:"БАЙРШИЛ & ХОЛБОО",title:"ЭХНИЙ АЛХМАА",accent:"ӨНӨӨДӨР ХИЙ.",copy:"Гишүүнчлэл, дасгалжуулагч болон туршилтын эрхийн талаар бидэнтэй холбогдоорой.",phoneLabel:"УТАС",emailLabel:"И-МЭЙЛ",addressLabel:"ХАЯГ",mapEyebrow:"ADRENALINE FITNESS",mapButton:"БАЙРШИЛ ХАРАХ"},finalCta:{eyebrow:"READY WHEN YOU ARE",title:"ХҮЧТЭЙ ЭХЭЛ.",accent:"ТУУШТАЙ ҮРГЭЛЖЛҮҮЛ.",button:"ГИШҮҮНЧЛЭЛ АВАХ ↗"},footer:{copyright:"Adrenaline Fitness",backToTop:"ДЭЭШ ↑",adminLabel:"ADMIN"},payment:{label:"QPAY ГИШҮҮНЧЛЭЛ",intro:"QPay нэхэмжлэх үүсгээд банкны апп-аар төлнө. Төлбөр баталгаажмагц эрхийг идэвхжүүлнэ.",createButton:"QPAY НЭХЭМЖЛЭХ ҮҮСГЭХ",creating:"ҮҮСГЭЖ БАЙНА...",pendingTitle:"QPay холболт хүлээгдэж байна",pendingCopy:"Merchant credential нэмэхэд автоматаар ажиллана.",phoneButton:"УТСААР ХОЛБОГДОХ",qrCopy:"QR кодыг уншуулах эсвэл QPay-г нээнэ үү.",openButton:"QPAY НЭЭХ ↗",checkButton:"ТӨЛБӨР ШАЛГАХ",checking:"ШАЛГАЖ БАЙНА...",paid:"✓ ТӨЛБӨР БАТАЛГААЖЛАА"}};
export const defaultContent: SiteContent = { home:defaultHome,siteInfo: { ...siteInfo, mapUrl: "", facebookUrl: "" }, membershipPlans, coaches: coaches.map((coach, i) => ({ ...coach, id: `coach-${i + 1}`, name: "", image: "" })), schedule, pages: [] };
