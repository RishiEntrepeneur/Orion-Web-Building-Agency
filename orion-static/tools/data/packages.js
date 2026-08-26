/* ---------------------------------------------------------------
   The three packages. Prices are real, in GBP, and are the only
   prices published anywhere on this site.

   Each has a one-off build fee and a monthly fee that covers
   hosting and the ongoing work listed under it. Change a number
   here and it changes in both places it appears: the cards on
   services.html and the select on contact.html.
   --------------------------------------------------------------- */
module.exports = [
  {
    id: "starter",
    name: "Starter Launch",
    setup: "£299",
    monthly: "£39",
    tagline: "One clean site, looked after",
    forWho: "Local clubs, hobbyists and anyone going online for the first time.",
    features: [
      "Three-page layout — home, about, contact",
      "Secure website hosting",
      "One text or image update a month",
      "Mobile-friendly design"
    ]
  },
  {
    id: "growth",
    name: "Business Growth",
    setup: "£599",
    monthly: "£59",
    tagline: "What most businesses actually need",
    forWho: "Shops, barbers, cafés and groomers: a real business that needs to look like one.",
    popular: true,
    features: [
      "Up to five pages — home, about, services, gallery, contact",
      "Super-fast hosting",
      "Google Maps and local SEO set up",
      "Three content updates a month",
      "Everything in Starter Launch"
    ]
  },
  {
    id: "premium",
    name: "Premium Custom",
    setup: "£999+",
    monthly: "£99",
    tagline: "When it has to stand out",
    forWho: "Businesses with a lot to show, or who need a booking system behind it.",
    features: [
      "Full custom multi-page site, or a booking system",
      "Priority support — your messages answered before anything else",
      "Unlimited small updates",
      "A monthly performance and visitor report",
      "Everything in Business Growth"
    ]
  }
];
