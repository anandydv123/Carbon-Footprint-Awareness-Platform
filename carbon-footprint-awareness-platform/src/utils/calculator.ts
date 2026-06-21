import { ActivityLog, EmissionFactors, DayFootprint } from "../types";

export const DEFAULT_EMISSION_FACTORS: EmissionFactors = {
  // Transport factors in kg CO2 per km
  gasoline_car: 0.18,
  diesel_car: 0.17,
  ev: 0.05,
  public_transit: 0.04,
  bicycle_walking: 0.0,

  // Electricity factors in kg CO2 per kWh
  coal_grid: 0.85,
  average_grid: 0.45,
  green_solar: 0.02,

  // Food factors in kg CO2 per meal
  high_meat: 3.0,
  mixed_diet: 1.5,
  vegetarian: 0.8,
  vegan: 0.5,

  // Water factor in kg CO2 per liter
  water_factor: 0.0003, // 0.3 grams CO2 per liter

  // Waste factors in kg CO2 per kg
  landfill: 1.2,
  recycled: 0.15,
  composting: 0.08
};

export function calculateCo2(activity: ActivityLog, factors: EmissionFactors = DEFAULT_EMISSION_FACTORS): DayFootprint {
  const transportCO2 = activity.transportDistance * factors[activity.transportType];
  const electricityCO2 = activity.electricityUsage * factors[activity.electricitySource];
  const foodCO2 = activity.foodMealsCount * factors[activity.foodType];
  const waterCO2 = activity.waterUsage * factors.water_factor;
  const wasteCO2 = activity.wasteWeight * factors[activity.wasteType];

  const totalCO2 = parseFloat((transportCO2 + electricityCO2 + foodCO2 + waterCO2 + wasteCO2).toFixed(2));

  // Eco score calculations (Sustainable limit target: ~3.5kg CO2 daily average)
  let ecoScore = 100;
  if (totalCO2 <= 3.5) {
    // Excellent range
    ecoScore = Math.round(100 - (totalCO2 / 3.5) * 5); // 95 - 100
  } else if (totalCO2 <= 15) {
    // Average grid range
    ecoScore = Math.max(45, Math.round(95 - ((totalCO2 - 3.5) / 11.5) * 50)); // 45 - 95
  } else {
    // Heavy emitter range
    ecoScore = Math.max(10, Math.round(45 - ((totalCO2 - 15) / 20) * 35)); // 10 - 45
  }

  return {
    id: activity.id,
    userId: activity.userId,
    date: activity.date,
    transportCO2: parseFloat(transportCO2.toFixed(3)),
    electricityCO2: parseFloat(electricityCO2.toFixed(3)),
    foodCO2: parseFloat(foodCO2.toFixed(3)),
    waterCO2: parseFloat(waterCO2.toFixed(3)),
    wasteCO2: parseFloat(wasteCO2.toFixed(3)),
    totalCO2,
    ecoScore
  };
}

export const KNOWN_BADGES = [
  {
    id: "first_log",
    title: "First Steps",
    description: "Log your very first carbon activity.",
    icon: "Footprints"
  },
  {
    id: "low_carbon_hero",
    title: "Low Carbon Hero",
    description: "Achieve a daily footprint below 3.5 kg CO2.",
    icon: "Leaf"
  },
  {
    id: "green_commuter",
    title: "Green Commuter",
    description: "Travel zero emissive (walk or cycle) or use low emissions (ev, transit) for 3 miles or more.",
    icon: "Bike"
  },
  {
    id: "plant_powered",
    title: "Plant Powered",
    description: "Log a clean vegan or vegetarian meal plan.",
    icon: "Apple"
  },
  {
    id: "zero_waste_warrior",
    title: "Zero Waste Guru",
    description: "Log recycling or composting on an activity log.",
    icon: "Trash2"
  },
  {
    id: "point_millionaire",
    title: "Challenge MVP",
    description: "Complete your first daily eco challenge.",
    icon: "Award"
  },
  {
    id: "green_streak",
    title: "Eco Guardian",
    description: "Achieve an overall average Eco Score of over 85.",
    icon: "ShieldCheck"
  }
];

export const INITIAL_CHALLENGES = [
  {
    id: "challenge_1",
    title: "Meatless Magic",
    description: "Eat veggie/vegan for all meals today to save high cows and sheep emissions.",
    points: 15,
    icon: "Apple",
    category: "food"
  },
  {
    id: "challenge_2",
    title: "Pedal Power",
    description: "Use walking, cycling, or public transport instead of driving today.",
    points: 20,
    icon: "Bike",
    category: "transport"
  },
  {
    id: "challenge_3",
    title: "Vampire Power Slayer",
    description: "Unplug standby electronics, switches, and chargers when not in use.",
    points: 10,
    icon: "Zap",
    category: "energy"
  },
  {
    id: "challenge_4",
    title: "Shower Sprint",
    description: "Keep your shower time target under 5 minutes to conserve critical hot water energy.",
    points: 15,
    icon: "Droplet",
    category: "water"
  },
  {
    id: "challenge_5",
    title: "Sort Your Waste",
    description: "Recycle or compost 100% of your disposable waste today, diverting it from landfill.",
    points: 15,
    icon: "Trash2",
    category: "waste"
  }
];
