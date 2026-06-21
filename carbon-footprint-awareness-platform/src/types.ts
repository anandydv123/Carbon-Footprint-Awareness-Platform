export interface ActivityLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  
  // Transport details
  transportType: "gasoline_car" | "diesel_car" | "ev" | "public_transit" | "bicycle_walking";
  transportDistance: number; // in km
  
  // Energy details
  electricitySource: "coal_grid" | "average_grid" | "green_solar";
  electricityUsage: number; // in kWh
  
  // Food details
  foodType: "high_meat" | "mixed_diet" | "vegetarian" | "vegan";
  foodMealsCount: number; // number of meals
  
  // Water details
  waterUsage: number; // in liters
  
  // Waste details
  wasteType: "landfill" | "recycled" | "composting";
  wasteWeight: number; // in kg
}

export interface EmissionFactors {
  // Transport (kg CO2 per km)
  gasoline_car: number;
  diesel_car: number;
  ev: number;
  public_transit: number;
  bicycle_walking: number;

  // Electricity (kg CO2 per kWh)
  coal_grid: number;
  average_grid: number;
  green_solar: number;

  // Food (kg CO2 per meal)
  high_meat: number;
  mixed_diet: number;
  vegetarian: number;
  vegan: number;

  // Water (kg CO2 per liter)
  water_factor: number;

  // Waste (kg CO2 per kg)
  landfill: number;
  recycled: number;
  composting: number;
}

export interface DayFootprint {
  id: string;
  userId: string;
  date: string;
  transportCO2: number;
  electricityCO2: number;
  foodCO2: number;
  waterCO2: number;
  wasteCO2: number;
  totalCO2: number;
  ecoScore: number;
}

export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  category: "transport" | "energy" | "food" | "water" | "waste";
}

export interface UserChallengeStatus {
  challengeId: string;
  completed: boolean;
  date: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "coach";
  content: string;
  createdAt: string;
}
