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
  siteInfo: typeof siteInfo & { mapUrl?: string; facebookUrl?: string };
  membershipPlans: MembershipPlan[];
  coaches: Array<(typeof coaches)[number] & { id?: string; name?: string; image?: string }>;
  schedule: typeof schedule;
  pages: CmsPage[];
};
export type CmsBlock = { id: string; type: "heading" | "text" | "image" | "cta"; title?: string; body?: string; image?: string; buttonLabel?: string; buttonUrl?: string };
export type CmsPage = { id: string; title: string; slug: string; excerpt: string; heroImage?: string; status: "draft" | "published"; showInNav: boolean; seoTitle: string; seoDescription: string; blocks: CmsBlock[] };
export const defaultContent: SiteContent = { siteInfo: { ...siteInfo, mapUrl: "", facebookUrl: "" }, membershipPlans, coaches: coaches.map((coach, i) => ({ ...coach, id: `coach-${i + 1}`, name: "", image: "" })), schedule, pages: [] };
