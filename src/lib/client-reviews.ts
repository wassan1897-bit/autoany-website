export type ClientReview = {
  id: string;
  name: string;
  initials: string;
  handle: string;
  quote: string;
};

export const CLIENT_REVIEWS: readonly ClientReview[] = [
  {
    id: "lethia-owens",
    name: "Lethia Owens",
    initials: "LO",
    handle: "lethiaowens",
    quote:
      "One of the best developers I've worked with. Incredibly responsive, guided us to the most efficient workflows, and helped us ship a complex chatbot solution. We closed 2 new deals in the first few hours of chatbot going live on our website. I'd recommend them to any mid-market or enterprise company.",
  },
  {
    id: "luke-sullivan",
    name: "Luke Sullivan",
    initials: "LS",
    handle: "lukesullivan",
    quote:
      "The team at Autoany built a fully AI-powered hotline for us using Twilio and ElevenLabs, and it's been a game-changer for our business. They didn't just set up a basic chatbot - they designed a natural-sounding system that reliably handles calls end-to-end, and kept iterating as our requirements evolved and our client pushed for more. It feels like a polished, product-level solution that we can confidently roll out, not a one-off experiment. 10/10, we'll definitely work with them again.",
  },
  {
    id: "alexander-croucher",
    name: "Alexander Croucher",
    initials: "AC",
    handle: "alexcroucher",
    quote:
      "Extremely knowledgeable about advanced AI and automation systems like n8n. Working together was smooth, and with their guidance we were able to solve a real business challenge and get an AI-powered marketing system running.",
  },
  {
    id: "marta-suchanek",
    name: "Marta Suchanek",
    initials: "MS",
    handle: "martasuchanek",
    quote:
      "They built the exact system I needed, which is now saving me a lot of time and manual work. I have been sending 500 highly-personalized emails on daily-basis, and booking weekly calls consistently. Communication and support were excellent, and the system was delivered quickly.",
  },
  {
    id: "marcos-rojas",
    name: "Marcos Rojas",
    initials: "MR",
    handle: "marcosrojas",
    quote:
      "From day one, they understood exactly the kind of pipeline I wanted. The new system is pulling in qualified leads automatically, combining email and LinkedIn touchpoints without me lifting a finger. I'm consistently booking sales calls every week, and the visibility into my funnel is miles better than before. Super responsive team, fast delivery, and everything just works.",
  },
  {
    id: "dennis-redder",
    name: "Dennis Redder",
    initials: "DR",
    handle: "dennisredder",
    quote:
      "Before this, our SEO efforts were stuck - we had keywords, but turning them into publishable pages was slow, manual, and inconsistent. Now the system they built turns our inputs into research, briefs, and drafts automatically, so we can ship high-quality SEO content regularly and focus on strategy instead of busywork.",
  },
  {
    id: "aaron-mccregor",
    name: "Aaron Mccregor",
    initials: "AM",
    handle: "aaronmccregor",
    quote:
      "Before working with them, our VEO 3 and Nano Banana content pipeline was stuck - producing consistent, on-brand AI images and videos at scale was slow, manual, and kept delaying campaigns. The system they built turned this into a reliable production engine, so we can generate high-quality assets on demand and hit our launch dates without scrambling.",
  },
  {
    id: "david-johnson",
    name: "David Johnson",
    initials: "DJ",
    handle: "davidjohnson",
    quote:
      "Running four different service lines (appliance repair, HVAC, electrical, plumbing) meant our phones never stopped - and we were constantly missing calls, repeating the same questions, and wasting staff time qualifying bad leads. The four voice agents they built now handle intake, triage, and routing for each business, so real customers get booked faster, emergencies are prioritized, and my team can actually focus on service instead of being glued to the phone.",
  },
];
