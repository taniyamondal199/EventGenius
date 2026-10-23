import {
  AIPlanRequest,
  AIPlanOutput,
  AIRebalanceRequest,
  AIRebalanceOutput,
  AIVendorBriefRequest,
  AIVendorBriefOutput,
  BudgetCategory,
} from "@/types";

/**
 * High-fidelity AI Engine Heuristic Generator
 * Generates tailored, enterprise-grade event architectural plans,
 * budget optimizations, and vendor scopes even when external AI API keys are not provided.
 */

export function generateHeuristicEventPlan(input: AIPlanRequest): AIPlanOutput {
  const { eventType, budget, guestCount, location, styleKeywords } = input;

  let blueprintSummary = "";
  let budgetBreakdown: AIPlanOutput["budgetBreakdown"] = [];
  let timelineMilestones: AIPlanOutput["timelineMilestones"] = [];
  let vendorChecklist: AIPlanOutput["vendorChecklist"] = [];
  let creativeIdeas: AIPlanOutput["creativeIdeas"] = [];

  if (eventType === "WEDDING") {
    blueprintSummary = `Bespoke Wedding Blueprint for ${guestCount} guests in ${location}. Styled with "${styleKeywords}", balancing romantic ambiance with seamless logistics and guest comfort.`;

    budgetBreakdown = [
      {
        category: "VENUE",
        suggestedName: "Estate/Vineyard Rental & Ceremony Space",
        recommendedPercentage: 30,
        estimatedCostMin: Math.round(budget * 0.28),
        estimatedCostMax: Math.round(budget * 0.32),
        rationale: "Secures exclusive grounds, tables, and dressing suites.",
      },
      {
        category: "CATERING",
        suggestedName: "Plated Multi-Course Dinner & Open Cocktail Bar",
        recommendedPercentage: 35,
        estimatedCostMin: Math.round(budget * 0.32),
        estimatedCostMax: Math.round(budget * 0.38),
        rationale: `Covers food, mixology, bartenders, and rentals ($${Math.round((budget * 0.35) / guestCount)}/guest).`,
      },
      {
        category: "PHOTO_VIDEO",
        suggestedName: "Lead Photographer & Drone Cinematography",
        recommendedPercentage: 12,
        estimatedCostMin: Math.round(budget * 0.1),
        estimatedCostMax: Math.round(budget * 0.14),
        rationale: "Full 10-hour coverage, highlight reel, and raw archival footage.",
      },
      {
        category: "DECOR",
        suggestedName: "Floral Installations & Ambient Lighting",
        recommendedPercentage: 10,
        estimatedCostMin: Math.round(budget * 0.08),
        estimatedCostMax: Math.round(budget * 0.12),
        rationale: `Brings "${styleKeywords}" aesthetic alive with arch florals and fairy lights.`,
      },
      {
        category: "ENTERTAINMENT",
        suggestedName: "Live Ceremony Strings & Evening 7-Piece Band/DJ",
        recommendedPercentage: 7,
        estimatedCostMin: Math.round(budget * 0.06),
        estimatedCostMax: Math.round(budget * 0.09),
        rationale: "Sets emotional tone during ceremony and drives dance floor energy.",
      },
      {
        category: "ATTIRE",
        suggestedName: "Bridal Gown, Tuxedo & Day-of Glam",
        recommendedPercentage: 4,
        estimatedCostMin: Math.round(budget * 0.03),
        estimatedCostMax: Math.round(budget * 0.05),
        rationale: "Wardrobe tailoring, veil, and hair/makeup services.",
      },
      {
        category: "MISC",
        suggestedName: "Event Insurance, Marriage License & Day-of Tips",
        recommendedPercentage: 2,
        estimatedCostMin: Math.round(budget * 0.01),
        estimatedCostMax: Math.round(budget * 0.03),
        rationale: "Contingency reserve for last-minute permits and gratuities.",
      },
    ];

    timelineMilestones = [
      {
        title: "Finalize Venue Contract & Date Lock",
        description: "Sign agreement, pay initial deposit, and review sound ordinances.",
        phase: "PLANNING",
        offsetDaysFromEvent: -180,
      },
      {
        title: "Catering Menu & Wine Tasting",
        description: "Select 3 entree choices, hors d'oeuvres, and signature cocktail recipes.",
        phase: "PLANNING",
        offsetDaysFromEvent: -90,
      },
      {
        title: "Vendor Site Walkthrough & Floorplan Sign-off",
        description: "Coordinate load-in timing, electrical runs, and weather rain contingency.",
        phase: "PLANNING",
        offsetDaysFromEvent: -30,
      },
      {
        title: "Vendor Load-in & Floral Arch Construction",
        description: "Catering setup, sound check, and bridal suite breakfast delivery.",
        phase: "SETUP",
        offsetDaysFromEvent: 0,
        timeOfDay: "09:00 AM",
      },
      {
        title: "First Look & Bridal Party Portraits",
        description: "Pre-ceremony private moment with photographers before guests arrive.",
        phase: "EVENT_DAY",
        offsetDaysFromEvent: 0,
        timeOfDay: "03:30 PM",
      },
      {
        title: "Ceremony & Vow Exchange",
        description: "Processional, live acoustic music, exchange of rings, and recessional.",
        phase: "EVENT_DAY",
        offsetDaysFromEvent: 0,
        timeOfDay: "05:00 PM",
      },
      {
        title: "Golden Hour Cocktails & Grand Reception",
        description: "Passed appetizers, speeches, cake cutting, and open dance floor.",
        phase: "EVENT_DAY",
        offsetDaysFromEvent: 0,
        timeOfDay: "06:15 PM",
      },
      {
        title: "Sparkler Send-off & Decor Teardown",
        description: "Guest exit coordination, floral donation boxing, and security handover.",
        phase: "WRAP_UP",
        offsetDaysFromEvent: 0,
        timeOfDay: "11:30 PM",
      },
    ];

    vendorChecklist = [
      {
        category: "Venue",
        vendorRole: "Exclusive Event Estate / Vineyard",
        priority: "CRITICAL",
        procurementTimeline: "9-12 Months Ahead",
        estimatedBudgetAllocation: Math.round(budget * 0.3),
        keyQuestionToAsk: "Are there noise cutoffs or mandatory preferred vendor lists?",
      },
      {
        category: "Catering",
        vendorRole: "Farm-to-Table Gourmet Catering & Bar",
        priority: "CRITICAL",
        procurementTimeline: "6-8 Months Ahead",
        estimatedBudgetAllocation: Math.round(budget * 0.35),
        keyQuestionToAsk: "Does per-person rate include service staff, glassware, and tableware?",
      },
      {
        category: "Photography",
        vendorRole: "Documentary Fine-Art Wedding Photographer",
        priority: "HIGH",
        procurementTimeline: "6 Months Ahead",
        estimatedBudgetAllocation: Math.round(budget * 0.12),
        keyQuestionToAsk: "Is a second shooter included and what is the turnaround for sneak peeks?",
      },
      {
        category: "Decor & Floral",
        vendorRole: "Botanical Florist & Lighting Designer",
        priority: "HIGH",
        procurementTimeline: "4 Months Ahead",
        estimatedBudgetAllocation: Math.round(budget * 0.1),
        keyQuestionToAsk: "Do you handle post-event teardown and floral repurposing?",
      },
    ];

    creativeIdeas = [
      {
        category: "MENU",
        title: "His & Hers Signature Infused Cocktails",
        description: "Custom craft cocktails like 'Smoky Blackberry Bourbon' and 'Lavender Elderflower Gin Fizz' with personalized laser-cut garnishes.",
        budgetImpact: "LOW",
        guestDelightScore: 9,
      },
      {
        category: "ACTIVITY",
        title: "Audio Guestbook Rotary Telephone",
        description: "A vintage rotary phone where guests pick up the receiver to record heartfelt voicemail messages throughout the night.",
        budgetImpact: "LOW",
        guestDelightScore: 10,
      },
      {
        category: "DECOR",
        title: "Champagne Wall Seating Chart",
        description: "Flutes of sparkling wine with calligraphy escort tags welcoming guests as they enter the reception lawn.",
        budgetImpact: "MEDIUM",
        guestDelightScore: 9,
      },
      {
        category: "THEME",
        title: "Late-Night Artisanal Woodfired Pizza Station",
        description: "Mini fresh sourdough pizzas served directly from a mobile copper woodfired oven at 10 PM to refuel dancers.",
        budgetImpact: "MEDIUM",
        guestDelightScore: 10,
      },
      {
        category: "ACTIVITY",
        title: "Live Water-Color Portrait Artist",
        description: "A live guest painter illustrating 5-minute whimsical watercolors for guests to take home as personalized favors.",
        budgetImpact: "HIGH",
        guestDelightScore: 9,
      },
    ];
  } else if (eventType === "BIRTHDAY") {
    blueprintSummary = `High-Energy Birthday Bash for ${guestCount} guests in ${location}. Infused with "${styleKeywords}" vibrancy, interactive entertainment, and memorable treats.`;

    budgetBreakdown = [
      {
        category: "VENUE",
        suggestedName: "Private Rooftop Lounge / Loft Space",
        recommendedPercentage: 32,
        estimatedCostMin: Math.round(budget * 0.3),
        estimatedCostMax: Math.round(budget * 0.35),
        rationale: "Atmospheric venue with panoramic views and built-in AV sound.",
      },
      {
        category: "CATERING",
        suggestedName: "Gourmet Sliders, Tacos & Craft Cocktail Bar",
        recommendedPercentage: 35,
        estimatedCostMin: Math.round(budget * 0.32),
        estimatedCostMax: Math.round(budget * 0.38),
        rationale: "Fun, heavy hors d'oeuvres stations and open craft bar.",
      },
      {
        category: "ENTERTAINMENT",
        suggestedName: "Club DJ, Lighting Rig & Interactive Photo Booth",
        recommendedPercentage: 15,
        estimatedCostMin: Math.round(budget * 0.12),
        estimatedCostMax: Math.round(budget * 0.18),
        rationale: "Keeps energy peaked with 360-video booth and custom playlist.",
      },
      {
        category: "DECOR",
        suggestedName: "Custom Neon Sign, Balloon Arch & LED Up-lighting",
        recommendedPercentage: 10,
        estimatedCostMin: Math.round(budget * 0.08),
        estimatedCostMax: Math.round(budget * 0.12),
        rationale: `Creates instagrammable backdrop matching "${styleKeywords}".`,
      },
      {
        category: "MISC",
        suggestedName: "Custom Cake, Favors & Staff Gratuities",
        recommendedPercentage: 8,
        estimatedCostMin: Math.round(budget * 0.06),
        estimatedCostMax: Math.round(budget * 0.1),
        rationale: "Artisanal multi-tier cake, party gifts, and clean-up staff.",
      },
    ];

    timelineMilestones = [
      {
        title: "Book Venue & Lock In DJ",
        description: "Confirm party sound limits and deposit.",
        phase: "PLANNING",
        offsetDaysFromEvent: -45,
      },
      {
        title: "Custom Birthday Cake & Drink Menu Design",
        description: "Taste test flavors and decide on signature birthday punch.",
        phase: "PLANNING",
        offsetDaysFromEvent: -20,
      },
      {
        title: "Decor Installation & Neon Glow Setup",
        description: "Hang custom signage, inflate organic balloon garlands, and test DJ sound.",
        phase: "SETUP",
        offsetDaysFromEvent: 0,
        timeOfDay: "05:00 PM",
      },
      {
        title: "Doors Open & Welcome Shots",
        description: "Music plays, guests receive welcome cocktails, and photo booth activates.",
        phase: "EVENT_DAY",
        offsetDaysFromEvent: 0,
        timeOfDay: "07:30 PM",
      },
      {
        title: "Birthday Toast, Cake Sparklers & Peak Dance Set",
        description: "Champagne toast, birthday spotlight, sparkler cake, and high energy dance set.",
        phase: "EVENT_DAY",
        offsetDaysFromEvent: 0,
        timeOfDay: "09:45 PM",
      },
      {
        title: "Last Call & Late Night Snack Handout",
        description: "Warm cookies or mini sliders distributed as guests depart.",
        phase: "WRAP_UP",
        offsetDaysFromEvent: 0,
        timeOfDay: "12:30 AM",
      },
    ];

    vendorChecklist = [
      {
        category: "Venue",
        vendorRole: "Rooftop / Loft Venue Manager",
        priority: "CRITICAL",
        procurementTimeline: "2 Months Ahead",
        estimatedBudgetAllocation: Math.round(budget * 0.32),
        keyQuestionToAsk: "Is outside catering and external DJ equipment permitted?",
      },
      {
        category: "Entertainment",
        vendorRole: "Open-Format DJ & 360 Video Booth",
        priority: "HIGH",
        procurementTimeline: "1 Month Ahead",
        estimatedBudgetAllocation: Math.round(budget * 0.15),
        keyQuestionToAsk: "Do you provide your own lighting, microphones, and booth attendants?",
      },
      {
        category: "Catering & Cake",
        vendorRole: "Custom Specialty Cake Designer",
        priority: "HIGH",
        procurementTimeline: "3 Weeks Ahead",
        estimatedBudgetAllocation: Math.round(budget * 0.08),
        keyQuestionToAsk: "Can you provide cake delivery and set up with cold sparklers?",
      },
    ];

    creativeIdeas = [
      {
        category: "THEME",
        title: "Custom Illuminated Neon Name Sign",
        description: `A vibrant LED neon sign bearing the birthday guest's nickname embedded in an ivy backdrop.`,
        budgetImpact: "LOW",
        guestDelightScore: 9,
      },
      {
        category: "ACTIVITY",
        title: "360-Degree Slow-Motion Video Platform",
        description: "Guests dance on a pedestal while a high-speed camera rotates, generating instant branded social reels.",
        budgetImpact: "MEDIUM",
        guestDelightScore: 10,
      },
      {
        category: "MENU",
        title: "Liquid Nitrogen Dessert Shots",
        description: "Interactive chef station serving flash-frozen mousse and ice cream truffles with smoky visual flair.",
        budgetImpact: "MEDIUM",
        guestDelightScore: 9,
      },
      {
        category: "ACTIVITY",
        title: "Trivia Roast & Video Surprise Montage",
        description: "A funny 10-minute quiz about the birthday guest hosted by friends with throwback childhood video cameos.",
        budgetImpact: "LOW",
        guestDelightScore: 8,
      },
      {
        category: "MENU",
        title: "Midnight Gourmet Donut Wall",
        description: "Pegboard featuring 100 artisanal glazed, maple bacon, and vegan donuts for guests departing late night.",
        budgetImpact: "LOW",
        guestDelightScore: 9,
      },
    ];
  } else {
    // COMMUNITY GATHERING
    blueprintSummary = `Impactful Community Gathering for ${guestCount} attendees in ${location}. Centered around "${styleKeywords}", emphasizing accessibility, engagement, local talent, and cultural pride.`;

    budgetBreakdown = [
      {
        category: "VENUE",
        suggestedName: "Community Park Pavilion / Civic Center Hall",
        recommendedPercentage: 20,
        estimatedCostMin: Math.round(budget * 0.18),
        estimatedCostMax: Math.round(budget * 0.22),
        rationale: "Municipal permits, park pavilion booking, and portable sanitation.",
      },
      {
        category: "CATERING",
        suggestedName: "Local Food Trucks & Refreshment Hydration Station",
        recommendedPercentage: 35,
        estimatedCostMin: Math.round(budget * 0.32),
        estimatedCostMax: Math.round(budget * 0.38),
        rationale: "Vouchers for local immigrant-owned food trucks and compostable water jugs.",
      },
      {
        category: "ENTERTAINMENT",
        suggestedName: "Stage Audio System, Local Performers & Host MC",
        recommendedPercentage: 20,
        estimatedCostMin: Math.round(budget * 0.18),
        estimatedCostMax: Math.round(budget * 0.24),
        rationale: "Community stage audio, cordless mics, cultural dance troupes, and youth band.",
      },
      {
        category: "DECOR",
        suggestedName: "Wayfinding Banners, Canopy Tents & Seating",
        recommendedPercentage: 15,
        estimatedCostMin: Math.round(budget * 0.12),
        estimatedCostMax: Math.round(budget * 0.18),
        rationale: "Weather-resistant pop-up tents, folding picnic benches, and multilingual signs.",
      },
      {
        category: "MISC",
        suggestedName: "City Event Permits, Security & Volunteer First Aid",
        recommendedPercentage: 10,
        estimatedCostMin: Math.round(budget * 0.08),
        estimatedCostMax: Math.round(budget * 0.12),
        rationale: "Mandatory public liability insurance, security staff, and recycling bins.",
      },
    ];

    timelineMilestones = [
      {
        title: "File Municipal Permits & Reserve Public Grounds",
        description: "Submit special event application, noise variance, and health department filings.",
        phase: "PLANNING",
        offsetDaysFromEvent: -90,
      },
      {
        title: "Vendor & Community Partner Open Call",
        description: "Engage neighborhood non-profits, youth artisans, and local food truck operators.",
        phase: "PLANNING",
        offsetDaysFromEvent: -45,
      },
      {
        title: "Volunteer Orientation & Safety Briefing",
        description: "Assign marshals, accessibility coordinators, and registration desk shifts.",
        phase: "PLANNING",
        offsetDaysFromEvent: -7,
      },
      {
        title: "Staging, Generator Power & Sound Check",
        description: "Erect canopies, setup PA speakers, position trash stations, and test mics.",
        phase: "SETUP",
        offsetDaysFromEvent: 0,
        timeOfDay: "07:30 AM",
      },
      {
        title: "Welcome Remarks & Cultural Opening Ceremony",
        description: "Community elders speak, ribbon cutting, and opening performance.",
        phase: "EVENT_DAY",
        offsetDaysFromEvent: 0,
        timeOfDay: "10:00 AM",
      },
      {
        title: "Interactive Workshops, Booths & Food Fair",
        description: "Family activity tents, live mural painting, local artisan showcase, and food trucks.",
        phase: "EVENT_DAY",
        offsetDaysFromEvent: 0,
        timeOfDay: "11:30 AM",
      },
      {
        title: "Keynote Community Awards & Live Jam Session",
        description: "Honoring local heroes and open community choir / acoustic stage jam.",
        phase: "EVENT_DAY",
        offsetDaysFromEvent: 0,
        timeOfDay: "03:00 PM",
      },
      {
        title: "Leave-No-Trace Clean Up & Pack Down",
        description: "Community volunteer litter sweep, recycling sort, equipment inventory, and hand-back.",
        phase: "WRAP_UP",
        offsetDaysFromEvent: 0,
        timeOfDay: "05:30 PM",
      },
    ];

    vendorChecklist = [
      {
        category: "Audio & Stage",
        vendorRole: "Outdoor PA Sound & Generator Provider",
        priority: "CRITICAL",
        procurementTimeline: "2 Months Ahead",
        estimatedBudgetAllocation: Math.round(budget * 0.15),
        keyQuestionToAsk: "Does the sound system meet city decibel limits and include backup generators?",
      },
      {
        category: "Sanitation & Safety",
        vendorRole: "Portable Restrooms & Recycling Waste Logistics",
        priority: "CRITICAL",
        procurementTimeline: "1 Month Ahead",
        estimatedBudgetAllocation: Math.round(budget * 0.08),
        keyQuestionToAsk: "Are ADA-accessible portable restrooms and handwash stations included?",
      },
      {
        category: "Rentals",
        vendorRole: "Heavy-Duty Canopy Tents & Folding Benches",
        priority: "HIGH",
        procurementTimeline: "1 Month Ahead",
        estimatedBudgetAllocation: Math.round(budget * 0.12),
        keyQuestionToAsk: "Do rentals include commercial water-barrel weights for wind safety?",
      },
    ];

    creativeIdeas = [
      {
        category: "ACTIVITY",
        title: "Collaborative Community Mosaic Mural",
        description: "A large canvas where every attendee paints a numbered tile representing neighborhood unity, later mounted at City Hall.",
        budgetImpact: "LOW",
        guestDelightScore: 10,
      },
      {
        category: "ACTIVITY",
        title: "Storytelling Listening Booth (StoryCorps Style)",
        description: "A cozy audio recording tent where neighborhood elders and youth interview each other about community history.",
        budgetImpact: "LOW",
        guestDelightScore: 9,
      },
      {
        category: "THEME",
        title: "Local Makers & Youth Entrepreneur Pop-Up",
        description: "Subsidized display tables showcasing handmade crafts, baked goods, and art by local high schoolers.",
        budgetImpact: "LOW",
        guestDelightScore: 9,
      },
      {
        category: "MENU",
        title: "Tasting Passports for Neighborhood Food Trucks",
        description: "Attendees buy a $15 passport giving them 4 mini-sampler plates across diverse cultural food trucks.",
        budgetImpact: "MEDIUM",
        guestDelightScore: 10,
      },
      {
        category: "ACTIVITY",
        title: "Plant & Seedling Exchange Station",
        description: "Free vegetable seedling giveaways with master gardeners offering organic balcony gardening tutorials.",
        budgetImpact: "LOW",
        guestDelightScore: 8,
      },
    ];
  }

  return {
    blueprintSummary,
    budgetBreakdown,
    timelineMilestones,
    vendorChecklist,
    creativeIdeas,
  };
}

export function generateHeuristicBudgetRebalance(input: AIRebalanceRequest): AIRebalanceOutput {
  const { totalBudget, items } = input;

  const totalEstimated = items.reduce((acc, it) => acc + (it.estimatedCost || 0), 0);
  const totalActual = items.reduce((acc, it) => acc + (it.actualCost || 0), 0);
  const projectedVariance = totalBudget - (totalActual > 0 ? totalActual : totalEstimated);

  // Detect overages > 15% above target
  const overageWarnings: AIRebalanceOutput["overageWarnings"] = [];

  items.forEach((item) => {
    if (item.estimatedCost > 0 && item.actualCost > 0) {
      const diff = item.actualCost - item.estimatedCost;
      const percentage = (diff / item.estimatedCost) * 100;
      if (percentage >= 15) {
        overageWarnings.push({
          category: item.category,
          name: item.name,
          percentageOverBudget: Math.round(percentage),
          excessAmount: Math.round(diff),
          urgency: percentage > 30 ? "CRITICAL" : "MODERATE",
        });
      }
    }
  });

  const isCritical = totalActual > totalBudget * 1.1 || overageWarnings.length >= 2;
  const isHealthy = totalActual <= totalBudget && overageWarnings.length === 0;

  const healthScore = Math.max(
    10,
    Math.min(100, Math.round(100 - (totalActual > totalBudget ? ((totalActual - totalBudget) / totalBudget) * 100 : 0) - overageWarnings.length * 8))
  );

  const healthStatus: AIRebalanceOutput["healthStatus"] = isCritical
    ? "CRITICAL_DEFICIT"
    : overageWarnings.length > 0
    ? "WARNING"
    : projectedVariance >= 0
    ? "SURPLUS"
    : "HEALTHY";

  const rebalancingRecommendations: AIRebalanceOutput["rebalancingRecommendations"] = [
    {
      action: "Trim secondary floral arrangements and transition to high-impact focal arches",
      sourceCategory: "DECOR",
      targetCategory: overageWarnings[0]?.category || "CATERING",
      estimatedSavings: Math.max(400, Math.round(totalBudget * 0.04)),
      tradeOffRationale: "Repurposing ceremony arrangements to reception tables retains visual splendor while saving $500-$1,200.",
    },
    {
      action: "Switch from open full-service bar to curated beer, wine & two signature drinks",
      sourceCategory: "CATERING",
      targetCategory: "VENUE",
      estimatedSavings: Math.max(650, Math.round(totalBudget * 0.06)),
      tradeOffRationale: "Eliminates high-cost top-shelf liquor licensing markups without guests feeling restricted.",
    },
    {
      action: "Substitute physical paper invitation suites with premium RSVP digital platforms",
      sourceCategory: "MISC",
      targetCategory: "ENTERTAINMENT",
      estimatedSavings: 350,
      tradeOffRationale: "Digital saves printing, calligrapher fees, and postage, plus provides live dietary tracking.",
    },
  ];

  const costCuttingOpportunities: AIRebalanceOutput["costCuttingOpportunities"] = [
    {
      area: "Table Decor & Place Settings",
      practicalTactic: "Opt for minimalist pillar candles with greenery runners instead of dense imported out-of-season florals.",
      potentialSavingsAmount: Math.round(totalBudget * 0.035),
    },
    {
      area: "Photography Hours Optimization",
      practicalTactic: "Book 8 hours instead of 12 hours coverage; capture getting-ready and speeches, skipping the last 2 hours of repetitive dancing.",
      potentialSavingsAmount: Math.round(totalBudget * 0.04),
    },
    {
      area: "Off-Peak Booking or Sunday Dates",
      practicalTactic: "Negotiate venue discount or complimentary lighting package by booking Friday or Sunday afternoon.",
      potentialSavingsAmount: Math.round(totalBudget * 0.08),
    },
  ];

  return {
    healthScore,
    healthStatus,
    totalEstimated,
    totalActual,
    projectedVariance,
    overageWarnings,
    rebalancingRecommendations,
    costCuttingOpportunities,
  };
}

export function generateHeuristicVendorBrief(input: AIVendorBriefRequest): AIVendorBriefOutput {
  const { category, style, budgetLimit, guestCount = 100, eventDate = "Upcoming season", location = "our venue" } = input;

  return {
    category,
    rfpTitle: `Request for Proposal (RFP): ${category} Services - "${style}" Concept`,
    readyToSendRfpMessage: `Dear ${category} Team,

I hope you are having a wonderful week!

We are currently planning a special event scheduled for ${eventDate} in ${location} with approximately ${guestCount} guests. We came across your portfolio and are deeply impressed with your distinctive work and craft.

We are designing our event around a "${style}" aesthetic. Our allocated target budget for ${category} is approximately $${budgetLimit.toLocaleString()}.

Could you please let us know your availability for this date and share your package offerings, sample menu/portfolios, and standard service breakdown that align with this vision?

We look forward to connecting and potentially partnering together to create an unforgettable experience!

Warm regards,
Event Planning Team`,
    scopeOfWorkDeliverables: [
      `Delivery, full setup, and staging completed at least 2 hours prior to guest arrival.`,
      `Dedicated on-site lead coordinator or technician present throughout the operational window.`,
      `Full breakdown, clean-up, and removal of all provider materials immediately following conclusion.`,
      `Pre-event coordination call with venue manager to review electrical access and floorplans.`,
    ],
    essentialQuestionsToAsk: [
      `What is your policy and timeline regarding final guest count adjustments and payment schedule?`,
      `Are all travel, overtime rates, and gratuities included, or will there be supplementary charges?`,
      `What contingency plan or backup personnel do you have in the rare event of illness or equipment malfunction?`,
      `Do you carry $1,000,000+ commercial general liability insurance required by venues?`,
    ],
    redFlagsToWatchOutFor: [
      `Hesitation to provide a detailed written contract specifying deliverables, exact hours, and cancellation terms.`,
      `Demanding 100% upfront payment before services are delivered rather than standard deposit milestones.`,
      `Slow or defensive responses regarding insurance certificates or venue rules compliance.`,
      `Lack of recent client references or refusal to show full unaltered photo/video galleries of past events.`,
    ],
    contractNegotiationTips: [
      `Ask if they offer a slight discount (3-5%) for payment via ACH or check instead of credit card fees.`,
      `Negotiate added-value inclusions (e.g., extra hour of teardown or complimentary staging props) instead of just cutting dollar rates.`,
      `Ensure contract contains a clear 'Force Majeure' and postponement clause with transferred deposits.`,
    ],
  };
}
