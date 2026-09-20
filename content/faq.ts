import { board, brand, discounts, formatPrice, products, shipping } from "./facts";

/** FAQ. Every answer is built from confirmed facts in facts.ts. */
export interface FaqItem {
  id: string;
  q: string;
  a: string;
  /** Shown in the short accordion on the home page. */
  home?: boolean;
}

export const faq: FaqItem[] = [
  {
    id: "what",
    q: "What is the Vary Board?",
    a: `A patented wall-mounted training board designed by a physical therapist. Each section has ${board.anchorPointsPerSection} hexagonal anchor points, so you can clip in a resistance band or find a handhold at the height you need and practice strength, mobility and balance exercises at home.`,
    home: true,
  },
  {
    id: "size",
    q: "Which size should I get?",
    a: `The ${products.board.name} (${products.board.specs[1].value} installed, ${formatPrice(products.board.price)}) fits most adults. The ${products.boardXT.name} (${products.boardXT.specs[1].value} installed, ${formatPrice(products.boardXT.price)}) adds a fourth section and is made for people ${board.heightGuidance.xt.replace("Users ", "")}.`,
    home: true,
  },
  {
    id: "space",
    q: "How much room do I need?",
    a: `About ${board.minSpacePerUser} of clear floor space per person in front of the board. It mounts flat to the wall, so it takes up no floor space of its own.`,
    home: true,
  },
  {
    id: "outdoor",
    q: "Can I install it outside?",
    a: `Yes. The board is molded from ${board.material}, which is made for indoor and outdoor use: a garage, a patio, a clinic or a bedroom wall.`,
  },
  {
    id: "bands",
    q: "What comes in the Resistance Band Bundle?",
    a: `${products.bands.summary} It is ${formatPrice(products.bands.price)}. A carabiner to clip a band to any anchor point is ${formatPrice(products.carabiner.price)}.`,
  },
  {
    id: "shipping",
    q: "What does shipping cost?",
    a: `${shipping.flatRateLine} on every order.`,
    home: true,
  },
  {
    id: "discount",
    q: "Is there a discount for veterans or first responders?",
    a: `Yes. ${discounts.heroesLine} Call ${brand.phone} or email ${brand.email} and we will set it up for you.`,
  },
  {
    id: "pt",
    q: "Do I need to be working with a physical therapist?",
    a: "No. Many people use the board to continue a home program after physical therapy, and many use it simply to keep moving well. As with any exercise program, consult your physician or physical therapist before starting.",
  },
  {
    id: "install",
    q: "How is it installed?",
    a: `The three sections stack to a ${products.board.specs[1].value} board and mount to the wall. Watch the installation video on our install page before you start.`,
  },
  {
    id: "clinics",
    q: "Do you sell to clinics?",
    a: "Yes. Physical therapy clinics, gyms and senior living communities use the Vary Board. Visit our professionals page to request clinic pricing or a demo.",
  },
  {
    id: "patent",
    q: "Is the Vary Board patented?",
    a: "Yes. The Vary Board is patented.",
  },
  {
    id: "returns",
    q: "What about returns and warranty?",
    a: `See our returns and warranty pages, or call ${brand.phone} and we will help.`,
  },
];

export const homeFaq = faq.filter((f) => f.home);
