/**
 * Ranking Agent implementation
 */
const runRankingAgent = async (input) => {
  const timestamp = new Date().toISOString();
  const providers = input.providers || [];

  console.log(`[STEP 3 - RANKING] Calculating scores...`);

  if (providers.length === 0) {
    return {
      step: 3,
      agent: "Ranking_Agent",
      input: { providers_received: 0 },
      ranking_formula: "score = (rating/5 * 0.4) + (1/distance * 0.4) + (availability * 0.2)",
      output: {
        ranked_providers: [],
        recommended_provider_id: null,
        recommendation_reason: "No providers were found to rank."
      },
      status: "success",
      timestamp
    };
  }

  // 1. Calculate score for each provider using weighted formula
  const ranked = providers.map(p => {
    const ratingVal = p.rating || 0;
    const distanceVal = p.distance_km || 1;
    const availableVal = p.available === true || p.available === "true";

    const normalized_rating = ratingVal / 5;
    const normalized_distance = 1 / distanceVal;
    const availability_score = availableVal ? 1 : 0;

    const rating_score = parseFloat((normalized_rating * 0.4).toFixed(3));
    const distance_score = parseFloat((normalized_distance * 0.4).toFixed(3));
    const availability_score_weighted = parseFloat((availability_score * 0.2).toFixed(3));

    const total_score = parseFloat((rating_score + distance_score + availability_score_weighted).toFixed(2));

    // Formulate a reasoning string
    let reasoning = `${p.name} has a rating of ${ratingVal} and is located ${distanceVal}km away.`;
    if (availableVal) {
      reasoning += ` Fully available for slots: ${p.available_slots?.join(", ") || "None"}.`;
    } else {
      reasoning += ` Currently fully booked or unavailable.`;
    }

    return {
      provider_id: p.id,
      name: p.name,
      score: total_score,
      breakdown: {
        rating_score,
        distance_score,
        availability_score: availability_score_weighted
      },
      distance_km: distanceVal,
      rating: ratingVal,
      available: availableVal,
      available_slots: p.available_slots,
      price_range: p.price_range,
      reasoning
    };
  });

  // 2. Sort by score descending
  ranked.sort((a, b) => b.score - a.score);

  // Add rank index
  const ranked_providers = ranked.map((p, idx) => ({
    rank: idx + 1,
    provider_id: p.provider_id,
    name: p.name,
    score: p.score,
    breakdown: p.breakdown,
    reasoning: p.reasoning
  }));

  const topProvider = ranked[0];

  // Specific reasoning for recommendation
  let recommendation_reason = `${topProvider.name} is the best match: highest calculated score of ${topProvider.score} based on proximity (${topProvider.distance_km}km) and rating (${topProvider.rating}).`;
  if (!topProvider.available) {
    recommendation_reason = `Note: Although ${topProvider.name} has the highest rating metrics, they are currently marked as unavailable. We recommend attempting contact to verify if a special slot can be opened.`;
  }

  // Print rank logging to console as requested
  const consoleLogs = ranked_providers.map(rp => `#${rp.rank} ${rp.name} (${rp.score})`).join(" ");
  console.log(`[STEP 3 - RANKING] ${consoleLogs} ✓`);

  return {
    step: 3,
    agent: "Ranking_Agent",
    input: {
      providers_received: providers.length
    },
    ranking_formula: "score = (rating/5 * 0.4) + (1/distance * 0.4) + (availability * 0.2)",
    output: {
      ranked_providers,
      recommended_provider_id: topProvider.provider_id,
      recommendation_reason
    },
    status: "success",
    timestamp
  };
};

module.exports = {
  runRankingAgent
};
